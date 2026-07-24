const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const ExpenseShare = require('../models/ExpenseShare');
const Settlement = require('../models/Settlement');
const { SETTLEMENT_STATUS } = require('../constants');
const { round2 } = require('./splitService');

/**
 * Computes each member's net balance within a group.
 * Positive balance = the group owes this person money (they overpaid).
 * Negative balance = this person owes the group money.
 *
 * Uses MongoDB aggregation for the heavy lifting so it stays fast even with
 * thousands of expenses, rather than pulling every document into Node memory.
 */
const computeGroupBalances = async (groupId) => {
  const groupObjectId = new mongoose.Types.ObjectId(groupId);

  // 1. Total paid by each user (they fronted the money for these expenses).
  const paidAgg = await Expense.aggregate([
    { $match: { group: groupObjectId, isDeleted: false } },
    { $group: { _id: '$paidBy', totalPaid: { $sum: '$amount' } } },
  ]);

  // 2. Total owed by each user across all their expense shares.
  const owedAgg = await ExpenseShare.aggregate([
    { $match: { group: groupObjectId } },
    { $group: { _id: '$user', totalOwed: { $sum: '$shareAmount' } } },
  ]);

  // 3. Net effect of completed settlements: payer's balance improves (+),
  //    receiver's balance decreases accordingly (-), since the debt is now paid.
  const settlementsPaidAgg = await Settlement.aggregate([
    { $match: { group: groupObjectId, status: SETTLEMENT_STATUS.COMPLETED } },
    { $group: { _id: '$from', totalSettledFrom: { $sum: '$amount' } } },
  ]);
  const settlementsReceivedAgg = await Settlement.aggregate([
    { $match: { group: groupObjectId, status: SETTLEMENT_STATUS.COMPLETED } },
    { $group: { _id: '$to', totalSettledTo: { $sum: '$amount' } } },
  ]);

  const balances = new Map();

  const ensure = (userId) => {
    const key = userId.toString();
    if (!balances.has(key)) balances.set(key, 0);
    return key;
  };

  paidAgg.forEach((row) => {
    const key = ensure(row._id);
    balances.set(key, balances.get(key) + row.totalPaid);
  });

  owedAgg.forEach((row) => {
    const key = ensure(row._id);
    balances.set(key, balances.get(key) - row.totalOwed);
  });

  // When A pays B, A's debt decreases (balance increases toward 0 / becomes positive),
  // and B's credit decreases (balance decreases toward 0 / becomes negative) — the
  // amount B is owed is now realized as cash, so it's removed from the "owed to B" ledger.
  settlementsPaidAgg.forEach((row) => {
    const key = ensure(row._id);
    balances.set(key, balances.get(key) + row.totalSettledFrom);
  });
  settlementsReceivedAgg.forEach((row) => {
    const key = ensure(row._id);
    balances.set(key, balances.get(key) - row.totalSettledTo);
  });

  const result = {};
  balances.forEach((value, key) => {
    result[key] = round2(value);
  });
  return result;
};

module.exports = { computeGroupBalances };
