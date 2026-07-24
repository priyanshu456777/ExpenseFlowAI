const Settlement = require('../models/Settlement');
const ExpenseShare = require('../models/ExpenseShare');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendResponse = require('../utils/sendResponse');
const { findGroupOrFail, requireMembership } = require('../services/groupService');
const { computeGroupBalances } = require('../services/balanceService');
const { optimizeSettlements } = require('../services/settlementEngine');
const { logActivity } = require('../services/activityLogService');
const { notifyUser } = require('../services/notificationService');
const { ACTIVITY_ACTIONS, NOTIFICATION_TYPES, SETTLEMENT_STATUS } = require('../constants');

/**
 * @route GET /api/v1/settlements/group/:groupId/balances
 * Returns each member's net balance in the group (positive = owed, negative = owes).
 */
const getGroupBalances = catchAsync(async (req, res) => {
  const group = await findGroupOrFail(req.params.groupId);
  requireMembership(group, req.user._id);

  const balances = await computeGroupBalances(group._id);

  const users = await User.find({ _id: { $in: Object.keys(balances) } }).select('name avatar');
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const enriched = Object.entries(balances).map(([userId, amount]) => ({
    user: userMap.get(userId) || { _id: userId },
    balance: amount,
  }));

  return sendResponse(res, 200, 'Balances fetched successfully.', { balances: enriched });
});

/**
 * @route GET /api/v1/settlements/group/:groupId/suggestions
 * Runs the Smart Settlement Engine to return the minimum set of transactions
 * needed to fully settle the group.
 */
const getSettlementSuggestions = catchAsync(async (req, res) => {
  const group = await findGroupOrFail(req.params.groupId);
  requireMembership(group, req.user._id);

  const balances = await computeGroupBalances(group._id);
  const transactions = optimizeSettlements(balances);

  const users = await User.find({
    _id: { $in: transactions.flatMap((t) => [t.from, t.to]) },
  }).select('name avatar');
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const enrichedTransactions = transactions.map((t) => ({
    from: userMap.get(t.from) || { _id: t.from },
    to: userMap.get(t.to) || { _id: t.to },
    amount: t.amount,
  }));

  return sendResponse(res, 200, 'Settlement suggestions calculated.', {
    transactionCount: transactions.length,
    transactions: enrichedTransactions,
  });
});

/**
 * @route POST /api/v1/settlements
 * Records a settlement payment. Can be initiated from a smart suggestion
 * (isSuggested: true) or manually by the payer.
 */
const recordSettlement = catchAsync(async (req, res, next) => {
  const { group: groupId, to, amount, method, note, isSuggested } = req.body;

  const group = await findGroupOrFail(groupId);
  requireMembership(group, req.user._id);

  if (!group.isMember(to)) {
    return next(AppError.badRequest('The recipient must be a member of this group.'));
  }
  if (to === req.user._id.toString()) {
    return next(AppError.badRequest('You cannot record a settlement with yourself.'));
  }

  const settlement = await Settlement.create({
    group: groupId,
    from: req.user._id,
    to,
    amount,
    method: method || 'cash',
    note: note || '',
    status: SETTLEMENT_STATUS.PENDING,
    recordedBy: req.user._id,
    isSuggested: Boolean(isSuggested),
  });

  await notifyUser({
    recipient: to,
    sender: req.user._id,
    type: NOTIFICATION_TYPES.PAYMENT_REMINDER,
    title: 'Payment recorded',
    message: `${req.user.name} recorded a payment of ${amount} ${group.currency} to you. Confirm once received.`,
    group: groupId,
    relatedSettlement: settlement._id,
  });

  return sendResponse(res, 201, 'Settlement recorded. Awaiting confirmation.', { settlement });
});

/**
 * @route PATCH /api/v1/settlements/:id/status
 * Marks a settlement as completed (confirmed by the recipient) or reopens it as pending.
 */
const updateSettlementStatus = catchAsync(async (req, res, next) => {
  const settlement = await Settlement.findById(req.params.id);
  if (!settlement) return next(AppError.notFound('Settlement not found.'));

  const isParticipant =
    settlement.to.toString() === req.user._id.toString() || settlement.from.toString() === req.user._id.toString();
  if (!isParticipant) {
    return next(AppError.forbidden('Only the sender or recipient can update this settlement.'));
  }

  settlement.status = req.body.status;
  settlement.settledAt = req.body.status === SETTLEMENT_STATUS.COMPLETED ? new Date() : null;
  await settlement.save();

  if (req.body.status === SETTLEMENT_STATUS.COMPLETED) {
    const group = await findGroupOrFail(settlement.group);
    await logActivity({
      group: settlement.group,
      user: req.user._id,
      action: ACTIVITY_ACTIONS.SETTLE_PAYMENT,
      description: `Payment of ${settlement.amount} ${group.currency} settled`,
    });

    await notifyUser({
      recipient: settlement.from,
      sender: req.user._id,
      type: NOTIFICATION_TYPES.SETTLEMENT_COMPLETED,
      title: 'Settlement confirmed',
      message: `Your payment of ${settlement.amount} ${group.currency} has been confirmed.`,
      group: settlement.group,
      relatedSettlement: settlement._id,
    });
  }

  return sendResponse(res, 200, 'Settlement status updated.', { settlement });
});

/**
 * @route GET /api/v1/settlements/group/:groupId/history
 */
const getSettlementHistory = catchAsync(async (req, res) => {
  const group = await findGroupOrFail(req.params.groupId);
  requireMembership(group, req.user._id);

  const { page = 1, limit = 20, status } = req.query;
  const filter = { group: group._id };
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [settlements, total] = await Promise.all([
    Settlement.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('from', 'name avatar')
      .populate('to', 'name avatar')
      .lean(),
    Settlement.countDocuments(filter),
  ]);

  return sendResponse(res, 200, 'Settlement history fetched.', { settlements }, {
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
});

module.exports = {
  getGroupBalances,
  getSettlementSuggestions,
  recordSettlement,
  updateSettlementStatus,
  getSettlementHistory,
};
