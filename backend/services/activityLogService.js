const ActivityLog = require('../models/ActivityLog');

/**
 * Records an activity log entry for a group. Fire-and-forget from the caller's
 * perspective in spirit, but awaited so failures surface during development.
 * Never throws to the caller — activity logging must never break the primary action.
 */
const logActivity = async ({ group, user, action, description, metadata = {} }) => {
  try {
    await ActivityLog.create({ group, user, action, description, metadata });
  } catch (error) {
    console.error(`[ActivityLogService] Failed to log activity: ${error.message}`);
  }
};

const getGroupActivity = async (groupId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    ActivityLog.find({ group: groupId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name avatar')
      .lean(),
    ActivityLog.countDocuments({ group: groupId }),
  ]);

  return { logs, total, page: Number(page), pages: Math.ceil(total / limit) };
};

module.exports = { logActivity, getGroupActivity };
