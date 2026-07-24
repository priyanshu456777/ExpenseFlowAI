const crypto = require('crypto');
const Group = require('../models/Group');
const User = require('../models/User');
const ExpenseShare = require('../models/ExpenseShare');
const Expense = require('../models/Expense');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendResponse = require('../utils/sendResponse');
const { findGroupOrFail, requireMembership, requireRole } = require('../services/groupService');
const { logActivity } = require('../services/activityLogService');
const { notifyGroupMembers, notifyUser } = require('../services/notificationService');
const { ACTIVITY_ACTIONS, NOTIFICATION_TYPES, GROUP_ROLES } = require('../constants');

/**
 * @route POST /api/v1/groups
 */
const createGroup = catchAsync(async (req, res) => {
  const { name, description, currency } = req.body;

  const group = await Group.create({
    name,
    description,
    currency: currency || req.user.currency,
    createdBy: req.user._id,
    image: req.file ? `/uploads/groups/${req.file.filename}` : '',
    members: [{ user: req.user._id, role: GROUP_ROLES.OWNER }],
  });

  await logActivity({
    group: group._id,
    user: req.user._id,
    action: ACTIVITY_ACTIONS.CREATE_GROUP,
    description: `${req.user.name} created the group "${group.name}"`,
  });

  return sendResponse(res, 201, 'Group created successfully.', { group });
});

/**
 * @route GET /api/v1/groups
 * Lists all groups the current user belongs to, with computed balance summary.
 */
const getMyGroups = catchAsync(async (req, res) => {
  const groups = await Group.find({ 'members.user': req.user._id, isArchived: false })
    .populate('members.user', 'name avatar email')
    .sort({ updatedAt: -1 })
    .lean();

  const pinnedSet = new Set((req.user.pinnedGroups || []).map((id) => id.toString()));
  const groupsWithMeta = groups.map((g) => ({
    ...g,
    isPinned: pinnedSet.has(g._id.toString()),
    memberCount: g.members.length,
  }));

  return sendResponse(res, 200, 'Groups fetched successfully.', { groups: groupsWithMeta });
});

/**
 * @route GET /api/v1/groups/:id
 */
const getGroupById = catchAsync(async (req, res) => {
  const group = await findGroupOrFail(req.params.id);
  requireMembership(group, req.user._id);

  await group.populate('members.user', 'name avatar email currency');

  return sendResponse(res, 200, 'Group fetched successfully.', { group });
});

/**
 * @route PATCH /api/v1/groups/:id
 */
const updateGroup = catchAsync(async (req, res) => {
  const group = await findGroupOrFail(req.params.id);
  requireRole(group, req.user._id, [GROUP_ROLES.OWNER, GROUP_ROLES.ADMIN]);

  const { name, description, currency } = req.body;
  if (name !== undefined) group.name = name;
  if (description !== undefined) group.description = description;
  if (currency !== undefined) group.currency = currency;
  if (req.file) group.image = `/uploads/groups/${req.file.filename}`;

  await group.save();

  await logActivity({
    group: group._id,
    user: req.user._id,
    action: ACTIVITY_ACTIONS.UPDATE_GROUP,
    description: `${req.user.name} updated the group settings`,
  });

  return sendResponse(res, 200, 'Group updated successfully.', { group });
});

/**
 * @route DELETE /api/v1/groups/:id
 * Only the owner can delete a group. Soft-delete (archive) to preserve history/audit trail.
 */
const deleteGroup = catchAsync(async (req, res, next) => {
  const group = await findGroupOrFail(req.params.id);
  requireRole(group, req.user._id, [GROUP_ROLES.OWNER]);

  const unsettledCount = await ExpenseShare.countDocuments({ group: group._id, isSettled: false });
  if (unsettledCount > 0) {
    return next(
      AppError.badRequest(
        'This group has unsettled balances. Settle all expenses before deleting the group.',
        'UNSETTLED_BALANCES'
      )
    );
  }

  group.isArchived = true;
  await group.save();

  return sendResponse(res, 200, 'Group deleted successfully.', null);
});

/**
 * @route POST /api/v1/groups/:id/invite
 * Invites a member by email (creates an Invitation doc; see invitationController for accept flow).
 */
const inviteMemberByEmail = catchAsync(async (req, res, next) => {
  const group = await findGroupOrFail(req.params.id);
  requireRole(group, req.user._id, [GROUP_ROLES.OWNER, GROUP_ROLES.ADMIN]);

  const Invitation = require('../models/Invitation');
  const { sendEmail, inviteTemplate } = require('../services/emailService');

  const { email } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser && group.isMember(existingUser._id)) {
    return next(AppError.conflict('This user is already a member of the group.'));
  }

  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invitation = await Invitation.findOneAndUpdate(
    { group: group._id, email },
    { invitedBy: req.user._id, token, status: 'pending', expiresAt },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const inviteUrl = `${process.env.CLIENT_URL}/invite/${invitation.token}`;
  await sendEmail({
    to: email,
    subject: `You've been invited to join "${group.name}" on ExpenseFlow AI`,
    html: inviteTemplate(inviteUrl, group.name, req.user.name),
  });

  if (existingUser) {
    await notifyUser({
      recipient: existingUser._id,
      sender: req.user._id,
      type: NOTIFICATION_TYPES.GROUP_INVITE,
      title: 'New group invitation',
      message: `${req.user.name} invited you to join "${group.name}"`,
      group: group._id,
    });
  }

  return sendResponse(res, 200, 'Invitation sent successfully.', { invitation });
});

/**
 * @route GET /api/v1/groups/invite/:inviteCode
 * Public-ish lookup for a shareable invite link (requires auth, but not group membership).
 */
const getGroupByInviteCode = catchAsync(async (req, res, next) => {
  const group = await Group.findOne({ inviteCode: req.params.inviteCode, isArchived: false }).populate(
    'members.user',
    'name avatar'
  );

  if (!group || (group.inviteCodeExpiresAt && group.inviteCodeExpiresAt < new Date())) {
    return next(AppError.notFound('Invite link is invalid or has expired.'));
  }

  return sendResponse(res, 200, 'Group preview fetched.', {
    group: { _id: group._id, name: group.name, image: group.image, memberCount: group.members.length },
  });
});

/**
 * @route POST /api/v1/groups/join
 * Joins a group using a shareable invite code.
 */
const joinGroupByCode = catchAsync(async (req, res, next) => {
  const { inviteCode } = req.body;
  const group = await Group.findOne({ inviteCode, isArchived: false });

  if (!group || (group.inviteCodeExpiresAt && group.inviteCodeExpiresAt < new Date())) {
    return next(AppError.notFound('Invite link is invalid or has expired.'));
  }

  if (group.isMember(req.user._id)) {
    return next(AppError.conflict('You are already a member of this group.'));
  }

  group.members.push({ user: req.user._id, role: GROUP_ROLES.MEMBER });
  await group.save();

  await logActivity({
    group: group._id,
    user: req.user._id,
    action: ACTIVITY_ACTIONS.JOIN_GROUP,
    description: `${req.user.name} joined the group`,
  });

  await notifyGroupMembers({
    memberIds: group.members.map((m) => m.user),
    actorId: req.user._id,
    type: NOTIFICATION_TYPES.MEMBER_JOINED,
    title: 'New member joined',
    message: `${req.user.name} joined "${group.name}"`,
    group: group._id,
  });

  return sendResponse(res, 200, 'Joined group successfully.', { group });
});

/**
 * @route PATCH /api/v1/groups/:id/members/:memberId/role
 */
const updateMemberRole = catchAsync(async (req, res, next) => {
  const group = await findGroupOrFail(req.params.id);
  requireRole(group, req.user._id, [GROUP_ROLES.OWNER]);

  const member = group.members.find((m) => m.user.toString() === req.params.memberId);
  if (!member) return next(AppError.notFound('Member not found in this group.'));
  if (member.role === GROUP_ROLES.OWNER) {
    return next(AppError.badRequest('Cannot change the role of the group owner.'));
  }

  member.role = req.body.role;
  await group.save();

  return sendResponse(res, 200, 'Member role updated.', { group });
});

/**
 * @route DELETE /api/v1/groups/:id/members/:memberId
 * Removes a member (or allows a member to remove themselves, i.e. "leave group").
 */
const removeMember = catchAsync(async (req, res, next) => {
  const group = await findGroupOrFail(req.params.id);
  const isSelf = req.params.memberId === req.user._id.toString();

  if (!isSelf) {
    requireRole(group, req.user._id, [GROUP_ROLES.OWNER, GROUP_ROLES.ADMIN]);
  } else {
    requireMembership(group, req.user._id);
  }

  const targetMember = group.members.find((m) => m.user.toString() === req.params.memberId);
  if (!targetMember) return next(AppError.notFound('Member not found in this group.'));
  if (targetMember.role === GROUP_ROLES.OWNER) {
    return next(
      AppError.badRequest('The group owner cannot be removed. Transfer ownership first.', 'CANNOT_REMOVE_OWNER')
    );
  }

  const outstandingShare = await ExpenseShare.findOne({
    group: group._id,
    user: req.params.memberId,
    isSettled: false,
  });
  if (outstandingShare) {
    return next(
      AppError.badRequest('This member has unsettled balances and cannot leave or be removed yet.', 'UNSETTLED_BALANCES')
    );
  }

  group.members = group.members.filter((m) => m.user.toString() !== req.params.memberId);
  await group.save();

  await logActivity({
    group: group._id,
    user: req.user._id,
    action: ACTIVITY_ACTIONS.LEAVE_GROUP,
    description: isSelf ? `${req.user.name} left the group` : `${req.user.name} removed a member from the group`,
  });

  return sendResponse(res, 200, isSelf ? 'You have left the group.' : 'Member removed.', { group });
});

/**
 * @route PATCH /api/v1/groups/:id/transfer-ownership/:memberId
 */
const transferOwnership = catchAsync(async (req, res, next) => {
  const group = await findGroupOrFail(req.params.id);
  requireRole(group, req.user._id, [GROUP_ROLES.OWNER]);

  const newOwner = group.members.find((m) => m.user.toString() === req.params.memberId);
  if (!newOwner) return next(AppError.notFound('Target member not found in this group.'));

  const currentOwner = group.members.find((m) => m.user.toString() === req.user._id.toString());
  currentOwner.role = GROUP_ROLES.ADMIN;
  newOwner.role = GROUP_ROLES.OWNER;

  await group.save();

  return sendResponse(res, 200, 'Ownership transferred successfully.', { group });
});

/**
 * @route PATCH /api/v1/groups/:id/pin
 * Toggles the pinned status of a group for the current user (stored on User doc).
 */
const togglePinGroup = catchAsync(async (req, res) => {
  const group = await findGroupOrFail(req.params.id);
  requireMembership(group, req.user._id);

  const user = req.user;
  const idx = user.pinnedGroups.findIndex((id) => id.toString() === group._id.toString());
  let isPinned;
  if (idx > -1) {
    user.pinnedGroups.splice(idx, 1);
    isPinned = false;
  } else {
    user.pinnedGroups.push(group._id);
    isPinned = true;
  }
  await user.save({ validateBeforeSave: false });

  return sendResponse(res, 200, isPinned ? 'Group pinned.' : 'Group unpinned.', { isPinned });
});

module.exports = {
  createGroup,
  getMyGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  inviteMemberByEmail,
  getGroupByInviteCode,
  joinGroupByCode,
  updateMemberRole,
  removeMember,
  transferOwnership,
  togglePinGroup,
};
