const catchAsync = require('../utils/catchAsync');
const sendResponse = require('../utils/sendResponse');
const { findGroupOrFail, requireMembership, getUserGroupIds } = require('../services/groupService');
const insightService = require('../services/insightService');

/**
 * @route GET /api/v1/insights/group/:groupId
 * Returns a full card-ready set of smart insights scoped to a single group.
 */
const getGroupInsights = catchAsync(async (req, res) => {
  const group = await findGroupOrFail(req.params.groupId);
  requireMembership(group, req.user._id);

  const groupIds = [group._id];

  const [
    highestSpendingMonth,
    largestExpense,
    mostActiveMember,
    highestContributor,
    averageMonthlyExpense,
    mostFrequentCategory,
    financialHealthScore,
    budgetSuggestion,
  ] = await Promise.all([
    insightService.getHighestSpendingMonth(groupIds),
    insightService.getLargestExpense(groupIds),
    insightService.getMostActiveMember(groupIds),
    insightService.getHighestContributor(groupIds),
    insightService.getAverageMonthlyExpense(groupIds),
    insightService.getMostFrequentCategory(groupIds),
    insightService.getFinancialHealthScore(req.user._id, groupIds),
    insightService.getBudgetSuggestion(req.user, groupIds),
  ]);

  return sendResponse(res, 200, 'Insights generated successfully.', {
    highestSpendingMonth,
    largestExpense,
    mostActiveMember,
    highestContributor,
    averageMonthlyExpense,
    mostFrequentCategory,
    financialHealthScore,
    budgetSuggestion,
  });
});

/**
 * @route GET /api/v1/insights/overview
 * Cross-group insights for the current user (all groups combined).
 */
const getOverviewInsights = catchAsync(async (req, res) => {
  const groupIds = await getUserGroupIds(req.user._id);

  const [financialHealthScore, budgetSuggestion, mostFrequentCategory, averageMonthlyExpense] = await Promise.all([
    insightService.getFinancialHealthScore(req.user._id, groupIds),
    insightService.getBudgetSuggestion(req.user, groupIds),
    insightService.getMostFrequentCategory(groupIds),
    insightService.getAverageMonthlyExpense(groupIds),
  ]);

  return sendResponse(res, 200, 'Overview insights generated.', {
    financialHealthScore,
    budgetSuggestion,
    mostFrequentCategory,
    averageMonthlyExpense,
  });
});

module.exports = { getGroupInsights, getOverviewInsights };
