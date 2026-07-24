const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const ExpenseShare = require('../models/ExpenseShare');
const User = require('../models/User');

const oid = (id) => new mongoose.Types.ObjectId(id);

/**
 * SMART INSIGHTS ENGINE
 * ------------------------------------------------------------------
 * Generates human-readable financial insights purely from statistical
 * analysis of the user's own expense data — no external AI API calls.
 * Every insight below is derived from a deterministic rule or aggregation,
 * making this fast, free, and fully explainable.
 */

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

const getHighestSpendingMonth = async (groupIds) => {
  const result = await Expense.aggregate([
    { $match: { group: { $in: groupIds }, isDeleted: false } },
    { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' } } },
    { $sort: { total: -1 } },
    { $limit: 1 },
  ]);
  if (!result.length) return null;
  const { year, month } = result[0]._id;
  return {
    label: new Date(year, month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    total: round2(result[0].total),
  };
};

const getLargestExpense = async (groupIds) => {
  const expense = await Expense.findOne({ group: { $in: groupIds }, isDeleted: false })
    .sort({ amount: -1 })
    .populate('paidBy', 'name')
    .lean();
  if (!expense) return null;
  return {
    description: expense.description,
    amount: expense.amount,
    category: expense.category,
    paidBy: expense.paidBy?.name,
    date: expense.date,
  };
};

const getMostActiveMember = async (groupIds) => {
  const result = await Expense.aggregate([
    { $match: { group: { $in: groupIds }, isDeleted: false } },
    { $group: { _id: '$createdBy', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 },
  ]);
  if (!result.length) return null;
  const user = await User.findById(result[0]._id).select('name avatar').lean();
  return { user, expenseCount: result[0].count };
};

const getHighestContributor = async (groupIds) => {
  const result = await Expense.aggregate([
    { $match: { group: { $in: groupIds }, isDeleted: false } },
    { $group: { _id: '$paidBy', total: { $sum: '$amount' } } },
    { $sort: { total: -1 } },
    { $limit: 1 },
  ]);
  if (!result.length) return null;
  const user = await User.findById(result[0]._id).select('name avatar').lean();
  return { user, totalPaid: round2(result[0].total) };
};

const getAverageMonthlyExpense = async (groupIds) => {
  const result = await Expense.aggregate([
    { $match: { group: { $in: groupIds }, isDeleted: false } },
    { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' } } },
  ]);
  if (!result.length) return 0;
  const sum = result.reduce((acc, r) => acc + r.total, 0);
  return round2(sum / result.length);
};

const getMostFrequentCategory = async (groupIds) => {
  const result = await Expense.aggregate([
    { $match: { group: { $in: groupIds }, isDeleted: false } },
    { $group: { _id: '$category', count: { $sum: 1 }, total: { $sum: '$amount' } } },
    { $sort: { count: -1 } },
    { $limit: 1 },
  ]);
  if (!result.length) return null;
  return { category: result[0]._id, count: result[0].count, total: round2(result[0].total) };
};

/**
 * Financial Health Score (0-100), computed from three weighted factors:
 * 1. Debt ratio — how much you owe relative to how much you've paid (40%)
 * 2. Settlement promptness — ratio of settled vs unsettled shares (35%)
 * 3. Spending consistency — coefficient of variation across recent months, lower = steadier (25%)
 */
const getFinancialHealthScore = async (userId, groupIds) => {
  const userObjectId = oid(userId);

  const [paidAgg, owedAgg, settledCount, totalShareCount, monthlyTotals] = await Promise.all([
    Expense.aggregate([
      { $match: { paidBy: userObjectId, group: { $in: groupIds }, isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    ExpenseShare.aggregate([
      { $match: { user: userObjectId, group: { $in: groupIds } } },
      { $group: { _id: null, total: { $sum: '$shareAmount' } } },
    ]),
    ExpenseShare.countDocuments({ user: userObjectId, group: { $in: groupIds }, isSettled: true }),
    ExpenseShare.countDocuments({ user: userObjectId, group: { $in: groupIds } }),
    Expense.aggregate([
      { $match: { group: { $in: groupIds }, isDeleted: false } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' } } },
    ]),
  ]);

  const totalPaid = paidAgg[0]?.total || 0;
  const totalOwed = owedAgg[0]?.total || 0;

  // Factor 1: debt ratio score — 100 if you owe nothing relative to what you paid, scaling down as debt grows.
  const debtRatio = totalPaid > 0 ? totalOwed / (totalPaid + totalOwed) : totalOwed > 0 ? 1 : 0;
  const debtScore = round2((1 - debtRatio) * 100);

  // Factor 2: settlement promptness — percentage of your shares that are already settled.
  const settlementScore = totalShareCount > 0 ? round2((settledCount / totalShareCount) * 100) : 100;

  // Factor 3: spending consistency — lower variance relative to mean = higher score.
  let consistencyScore = 100;
  if (monthlyTotals.length > 1) {
    const totals = monthlyTotals.map((m) => m.total);
    const mean = totals.reduce((a, b) => a + b, 0) / totals.length;
    const variance = totals.reduce((acc, t) => acc + (t - mean) ** 2, 0) / totals.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;
    consistencyScore = round2(Math.max(0, 100 - coefficientOfVariation * 50));
  }

  const finalScore = Math.round(debtScore * 0.4 + settlementScore * 0.35 + consistencyScore * 0.25);

  let rating;
  if (finalScore >= 85) rating = 'Excellent';
  else if (finalScore >= 70) rating = 'Good';
  else if (finalScore >= 50) rating = 'Fair';
  else rating = 'Needs Attention';

  return {
    score: Math.min(100, Math.max(0, finalScore)),
    rating,
    breakdown: { debtScore, settlementScore, consistencyScore },
  };
};

/**
 * Rule-based budget suggestion: recommends a monthly budget slightly below
 * the user's trailing 3-month average, encouraging gradual savings, unless
 * they already have a budget set (in which case, compares actual vs budget).
 */
const getBudgetSuggestion = async (user, groupIds) => {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const agg = await ExpenseShare.aggregate([
    {
      $lookup: { from: 'expenses', localField: 'expense', foreignField: '_id', as: 'expense' },
    },
    { $unwind: '$expense' },
    {
      $match: {
        user: oid(user._id),
        group: { $in: groupIds },
        'expense.isDeleted': false,
        'expense.date': { $gte: threeMonthsAgo },
      },
    },
    { $group: { _id: null, total: { $sum: '$shareAmount' } } },
  ]);

  const totalSpent = agg[0]?.total || 0;
  const avgMonthly = round2(totalSpent / 3);

  if (user.monthlyBudget > 0) {
    const diff = round2(user.monthlyBudget - avgMonthly);
    return {
      hasCustomBudget: true,
      currentBudget: user.monthlyBudget,
      averageMonthlySpend: avgMonthly,
      message:
        diff >= 0
          ? `You're averaging ${avgMonthly} ${user.currency}/month — ${diff} under your budget. Nice work!`
          : `You're averaging ${avgMonthly} ${user.currency}/month — ${Math.abs(diff)} over your budget.`,
    };
  }

  const suggested = round2(avgMonthly * 0.9);
  return {
    hasCustomBudget: false,
    averageMonthlySpend: avgMonthly,
    suggestedBudget: suggested,
    message: `Based on your last 3 months, we suggest a monthly budget of ${suggested} ${user.currency} (10% below your average spend).`,
  };
};

module.exports = {
  getHighestSpendingMonth,
  getLargestExpense,
  getMostActiveMember,
  getHighestContributor,
  getAverageMonthlyExpense,
  getMostFrequentCategory,
  getFinancialHealthScore,
  getBudgetSuggestion,
};
