const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const ExpenseShare = require('../models/ExpenseShare');

const oid = (id) => new mongoose.Types.ObjectId(id);

/**
 * Monthly spending totals for a group over the last N months (default 12).
 */
const getMonthlySpending = async (groupId, months = 12) => {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - (months - 1));
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  const results = await Expense.aggregate([
    { $match: { group: oid(groupId), isDeleted: false, date: { $gte: startDate } } },
    {
      $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' } },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  return results.map((r) => ({
    year: r._id.year,
    month: r._id.month,
    label: new Date(r._id.year, r._id.month - 1).toLocaleString('en-US', { month: 'short', year: 'numeric' }),
    total: r.total,
    count: r.count,
  }));
};

/**
 * Category breakdown (for the pie chart) — total spent per category in a group.
 */
const getCategoryBreakdown = async (groupId, { startDate, endDate } = {}) => {
  const match = { group: oid(groupId), isDeleted: false };
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = new Date(startDate);
    if (endDate) match.date.$lte = new Date(endDate);
  }

  const results = await Expense.aggregate([
    { $match: match },
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);

  return results.map((r) => ({ category: r._id, total: r.total, count: r.count }));
};

/**
 * Weekly spending trend for the last N weeks.
 */
const getWeeklyTrend = async (groupId, weeks = 8) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - weeks * 7);

  const results = await Expense.aggregate([
    { $match: { group: oid(groupId), isDeleted: false, date: { $gte: startDate } } },
    {
      $group: {
        _id: { week: { $isoWeek: '$date' }, year: { $isoWeekYear: '$date' } },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } },
  ]);

  return results.map((r) => ({ week: r._id.week, year: r._id.year, total: r.total }));
};

/**
 * Top contributors — who has paid the most within the group.
 */
const getTopContributors = async (groupId, limit = 5) => {
  const results = await Expense.aggregate([
    { $match: { group: oid(groupId), isDeleted: false } },
    { $group: { _id: '$paidBy', totalPaid: { $sum: '$amount' }, expenseCount: { $sum: 1 } } },
    { $sort: { totalPaid: -1 } },
    { $limit: limit },
    {
      $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        user: { _id: '$user._id', name: '$user.name', avatar: '$user.avatar' },
        totalPaid: 1,
        expenseCount: 1,
      },
    },
  ]);
  return results;
};

/**
 * Expense heatmap data — daily totals for calendar heatmap visualization.
 */
const getExpenseHeatmap = async (groupId, year) => {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59);

  const results = await Expense.aggregate([
    { $match: { group: oid(groupId), isDeleted: false, date: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return results.map((r) => ({ date: r._id, total: r.total, count: r.count }));
};

/**
 * Aggregated stats across ALL of a user's groups — powers the main dashboard.
 */
const getUserDashboardStats = async (userId, groupIds) => {
  const groupObjectIds = groupIds.map(oid);
  const userObjectId = oid(userId);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [monthlyTotal, categoryTotals, totalOwedAgg, totalPaidAgg] = await Promise.all([
    Expense.aggregate([
      { $match: { group: { $in: groupObjectIds }, isDeleted: false, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Expense.aggregate([
      { $match: { group: { $in: groupObjectIds }, isDeleted: false, date: { $gte: startOfMonth } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
    ]),
    ExpenseShare.aggregate([
      { $match: { user: userObjectId, isSettled: false } },
      { $group: { _id: null, total: { $sum: '$shareAmount' } } },
    ]),
    Expense.aggregate([
      { $match: { paidBy: userObjectId, isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  return {
    monthlyTotal: monthlyTotal[0]?.total || 0,
    categoryTotals: categoryTotals.map((c) => ({ category: c._id, total: c.total })),
    totalYouOwe: totalOwedAgg[0]?.total || 0,
    totalYouPaid: totalPaidAgg[0]?.total || 0,
  };
};

module.exports = {
  getMonthlySpending,
  getCategoryBreakdown,
  getWeeklyTrend,
  getTopContributors,
  getExpenseHeatmap,
  getUserDashboardStats,
};
