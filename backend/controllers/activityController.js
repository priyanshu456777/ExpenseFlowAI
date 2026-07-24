const catchAsync = require('../utils/catchAsync');
const sendResponse = require('../utils/sendResponse');
const { findGroupOrFail, requireMembership } = require('../services/groupService');
const { getGroupActivity } = require('../services/activityLogService');

/**
 * @route GET /api/v1/activity/group/:groupId
 * Returns a paginated activity timeline for a group (expenses added, members
 * joined, settlements completed, etc.) — powers the "Activity Timeline" feature.
 */
const getGroupActivityLog = catchAsync(async (req, res) => {
  const group = await findGroupOrFail(req.params.groupId);
  requireMembership(group, req.user._id);

  const { page = 1, limit = 20 } = req.query;
  const result = await getGroupActivity(group._id, { page: Number(page), limit: Number(limit) });

  return sendResponse(res, 200, 'Activity log fetched.', { logs: result.logs }, {
    pagination: { total: result.total, page: result.page, pages: result.pages },
  });
});

module.exports = { getGroupActivityLog };
