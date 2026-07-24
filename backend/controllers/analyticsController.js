const catchAsync = require('../utils/catchAsync');
const sendResponse = require('../utils/sendResponse');
const { findGroupOrFail, requireMembership, getUserGroupIds } = require('../services/groupService');
const analyticsService = require('../services/analyticsService');

/**
 * @route GET /api/v1/analytics/group/:groupId/monthly
 */
const getMonthlySpending = catchAsync(async (req, res) => {
  const group = await findGroupOrFail(req.params.groupId);
  requireMembership(group, req.user._id);

  const months = Number(req.query.months) || 12;
  const data = await analyticsService.getMonthlySpending(group._id, months);

  return sendResponse(res, 200, 'Monthly spending fetched.', { data });
});

/**
 * @route GET /api/v1/analytics/group/:groupId/categories
 */
const getCategoryBreakdown = catchAsync(async (req, res) => {
  const group = await findGroupOrFail(req.params.groupId);
  requireMembership(group, req.user._id);

  const { startDate, endDate } = req.query;
  const data = await analyticsService.getCategoryBreakdown(group._id, { startDate, endDate });

  return sendResponse(res, 200, 'Category breakdown fetched.', { data });
});

/**
 * @route GET /api/v1/analytics/group/:groupId/weekly-trend
 */
const getWeeklyTrend = catchAsync(async (req, res) => {
  const group = await findGroupOrFail(req.params.groupId);
  requireMembership(group, req.user._id);

  const weeks = Number(req.query.weeks) || 8;
  const data = await analyticsService.getWeeklyTrend(group._id, weeks);

  return sendResponse(res, 200, 'Weekly trend fetched.', { data });
});

/**
 * @route GET /api/v1/analytics/group/:groupId/top-contributors
 */
const getTopContributors = catchAsync(async (req, res) => {
  const group = await findGroupOrFail(req.params.groupId);
  requireMembership(group, req.user._id);

  const limit = Number(req.query.limit) || 5;
  const data = await analyticsService.getTopContributors(group._id, limit);

  return sendResponse(res, 200, 'Top contributors fetched.', { data });
});

/**
 * @route GET /api/v1/analytics/group/:groupId/heatmap
 */
const getExpenseHeatmap = catchAsync(async (req, res) => {
  const group = await findGroupOrFail(req.params.groupId);
  requireMembership(group, req.user._id);

  const year = Number(req.query.year) || new Date().getFullYear();
  const data = await analyticsService.getExpenseHeatmap(group._id, year);

  return sendResponse(res, 200, 'Expense heatmap fetched.', { data });
});

/**
 * @route GET /api/v1/analytics/dashboard
 * Cross-group dashboard summary for the current user.
 */
const getDashboardStats = catchAsync(async (req, res) => {
  const groupIds = await getUserGroupIds(req.user._id);
  const data = await analyticsService.getUserDashboardStats(req.user._id, groupIds);

  return sendResponse(res, 200, 'Dashboard stats fetched.', { data, groupCount: groupIds.length });
});

module.exports = {
  getMonthlySpending,
  getCategoryBreakdown,
  getWeeklyTrend,
  getTopContributors,
  getExpenseHeatmap,
  getDashboardStats,
};
