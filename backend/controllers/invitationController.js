const Invitation = require('../models/Invitation');
const Group = require('../models/Group');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendResponse = require('../utils/sendResponse');
const { logActivity } = require('../services/activityLogService');
const { notifyGroupMembers } = require('../services/notificationService');
const { ACTIVITY_ACTIONS, NOTIFICATION_TYPES, GROUP_ROLES, INVITATION_STATUS } = require('../constants');

/**
 * @route GET /api/v1/invitations/:token
 * Fetches invitation details for the "you've been invited" landing screen.
 */
const getInvitationByToken = catchAsync(async (req, res, next) => {
  const invitation = await Invitation.findOne({ token: req.params.token }).populate('group', 'name image').populate(
    'invitedBy',
    'name avatar'
  );

  if (!invitation || invitation.expiresAt < new Date()) {
    return next(AppError.notFound('This invitation is invalid or has expired.'));
  }

  return sendResponse(res, 200, 'Invitation fetched.', { invitation });
});

/**
 * @route POST /api/v1/invitations/:token/accept
 */
const acceptInvitation = catchAsync(async (req, res, next) => {
  const invitation = await Invitation.findOne({ token: req.params.token });

  if (!invitation || invitation.expiresAt < new Date()) {
    return next(AppError.notFound('This invitation is invalid or has expired.'));
  }
  if (invitation.status !== INVITATION_STATUS.PENDING) {
    return next(AppError.badRequest('This invitation has already been used.'));
  }
  if (invitation.email !== req.user.email) {
    return next(AppError.forbidden('This invitation was sent to a different email address.'));
  }

  const group = await Group.findById(invitation.group);
  if (!group || group.isArchived) {
    return next(AppError.notFound('The group for this invitation no longer exists.'));
  }

  if (!group.isMember(req.user._id)) {
    group.members.push({ user: req.user._id, role: GROUP_ROLES.MEMBER });
    await group.save();
  }

  invitation.status = INVITATION_STATUS.ACCEPTED;
  await invitation.save();

  await logActivity({
    group: group._id,
    user: req.user._id,
    action: ACTIVITY_ACTIONS.JOIN_GROUP,
    description: `${req.user.name} joined via invitation`,
  });

  await notifyGroupMembers({
    memberIds: group.members.map((m) => m.user),
    actorId: req.user._id,
    type: NOTIFICATION_TYPES.INVITATION_ACCEPTED,
    title: 'Invitation accepted',
    message: `${req.user.name} accepted the invitation and joined "${group.name}"`,
    group: group._id,
  });

  return sendResponse(res, 200, 'Invitation accepted. Welcome to the group!', { group });
});

/**
 * @route POST /api/v1/invitations/:token/decline
 */
const declineInvitation = catchAsync(async (req, res, next) => {
  const invitation = await Invitation.findOne({ token: req.params.token });
  if (!invitation) return next(AppError.notFound('Invitation not found.'));

  invitation.status = INVITATION_STATUS.DECLINED;
  await invitation.save();

  return sendResponse(res, 200, 'Invitation declined.', null);
});

module.exports = { getInvitationByToken, acceptInvitation, declineInvitation };
