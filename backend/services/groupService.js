const Group = require('../models/Group');
const AppError = require('../utils/AppError');
const { GROUP_ROLES } = require('../constants');

const findGroupOrFail = async (groupId) => {
  const group = await Group.findById(groupId);
  if (!group || group.isArchived) {
    throw AppError.notFound('Group not found.');
  }
  return group;
};

const requireMembership = (group, userId) => {
  if (!group.isMember(userId)) {
    throw AppError.forbidden('You are not a member of this group.');
  }
};

const requireRole = (group, userId, allowedRoles) => {
  const role = group.getMemberRole(userId);
  if (!role || !allowedRoles.includes(role)) {
    throw AppError.forbidden('You do not have permission to perform this action in this group.');
  }
  return role;
};

const getUserGroupIds = async (userId) => {
  const groups = await Group.find({ 'members.user': userId, isArchived: false }).select('_id').lean();
  return groups.map((g) => g._id);
};

module.exports = {
  findGroupOrFail,
  requireMembership,
  requireRole,
  getUserGroupIds,
  GROUP_ROLES,
};
