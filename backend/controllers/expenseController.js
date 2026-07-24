const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const ExpenseShare = require('../models/ExpenseShare');
const Group = require('../models/Group');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendResponse = require('../utils/sendResponse');
const { calculateSplit } = require('../services/splitService');
const { findGroupOrFail, requireMembership } = require('../services/groupService');
const { logActivity } = require('../services/activityLogService');
const { notifyGroupMembers } = require('../services/notificationService');
const { ACTIVITY_ACTIONS, NOTIFICATION_TYPES } = require('../constants');

/**
 * @route POST /api/v1/expenses
 * Creates an expense and its corresponding ExpenseShare documents atomically
 * (using a Mongo session/transaction when the deployment supports it — e.g.
 * MongoDB Atlas or any replica set. Falls back to sequential writes otherwise,
 * which is safe for local single-node development).
 */
const createExpense = catchAsync(async (req, res, next) => {
  const { group: groupId, description, amount, category, paidBy, splitType, participants, notes, date } = req.body;

  const group = await findGroupOrFail(groupId);
  requireMembership(group, req.user._id);

  if (!group.isMember(paidBy)) {
    return next(AppError.badRequest('The payer must be a member of this group.'));
  }
  const invalidParticipant = participants.find((p) => !group.isMember(p.userId));
  if (invalidParticipant) {
    return next(AppError.badRequest('All participants must be members of this group.'));
  }

  const shares = calculateSplit({ splitType, amount: Number(amount), participants });

  let session = null;
  try {
    session = await mongoose.startSession();
  } catch (e) {
    session = null;
  }

  const runCreate = async (useSession) => {
    const [expense] = await Expense.create(
      [
        {
          group: groupId,
          description,
          amount,
          category: category || 'Others',
          paidBy,
          splitType,
          notes: notes || '',
          date: date || Date.now(),
          receiptUrl: req.file ? `/uploads/receipts/${req.file.filename}` : '',
          createdBy: req.user._id,
        },
      ],
      useSession ? { session } : undefined
    );

    const shareDocs = shares.map((s) => ({
      expense: expense._id,
      group: groupId,
      user: s.userId,
      shareAmount: s.shareAmount,
      percentage: s.percentage,
      shares: s.shares,
      // The payer's own share is considered already settled (they paid it themselves).
      isSettled: s.userId.toString() === paidBy.toString(),
    }));

    await ExpenseShare.insertMany(shareDocs, useSession ? { session } : undefined);

    await Group.findByIdAndUpdate(
      groupId,
      { $inc: { totalExpenses: amount } },
      useSession ? { session } : undefined
    );

    return expense;
  };

  let expense;
  if (session) {
    try {
      await session.withTransaction(async () => {
        expense = await runCreate(true);
      });
    } catch (err) {
      // Transactions require a replica set; fall back to non-transactional write
      // for standalone MongoDB instances (common in local development).
      if (err.message && err.message.includes('Transaction numbers')) {
        expense = await runCreate(false);
      } else {
        throw err;
      }
    } finally {
      session.endSession();
    }
  } else {
    expense = await runCreate(false);
  }

  await logActivity({
    group: groupId,
    user: req.user._id,
    action: ACTIVITY_ACTIONS.ADD_EXPENSE,
    description: `${req.user.name} added expense "${description}" (${amount})`,
    metadata: { expenseId: expense._id, amount },
  });

  await notifyGroupMembers({
    memberIds: group.members.map((m) => m.user),
    actorId: req.user._id,
    type: NOTIFICATION_TYPES.EXPENSE_ADDED,
    title: 'New expense added',
    message: `${req.user.name} added "${description}" for ${amount} ${group.currency}`,
    group: groupId,
    relatedExpense: expense._id,
  });

  const populatedExpense = await Expense.findById(expense._id).populate('paidBy', 'name avatar');
  const populatedShares = await ExpenseShare.find({ expense: expense._id }).populate('user', 'name avatar');

  return sendResponse(res, 201, 'Expense added successfully.', {
    expense: populatedExpense,
    shares: populatedShares,
  });
});

/**
 * @route GET /api/v1/expenses/group/:groupId
 * Lists expenses for a group with search, category filter, sorting, and pagination.
 */
const getGroupExpenses = catchAsync(async (req, res) => {
  const group = await findGroupOrFail(req.params.groupId);
  requireMembership(group, req.user._id);

  const {
    page = 1,
    limit = 15,
    search = '',
    category,
    sortBy = 'date',
    sortOrder = 'desc',
    startDate,
    endDate,
  } = req.query;

  const filter = { group: group._id, isDeleted: false };

  if (search) {
    filter.$text = { $search: search };
  }
  if (category) {
    filter.category = category;
  }
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const sortDir = sortOrder === 'asc' ? 1 : -1;
  const sortField = ['date', 'amount', 'createdAt'].includes(sortBy) ? sortBy : 'date';

  const skip = (Number(page) - 1) * Number(limit);

  const [expenses, total] = await Promise.all([
    Expense.find(filter)
      .sort({ [sortField]: sortDir })
      .skip(skip)
      .limit(Number(limit))
      .populate('paidBy', 'name avatar')
      .lean(),
    Expense.countDocuments(filter),
  ]);

  return sendResponse(res, 200, 'Expenses fetched successfully.', { expenses }, {
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)), limit: Number(limit) },
  });
});

/**
 * @route GET /api/v1/expenses/:id
 */
const getExpenseById = catchAsync(async (req, res, next) => {
  const expense = await Expense.findOne({ _id: req.params.id, isDeleted: false }).populate('paidBy', 'name avatar');
  if (!expense) return next(AppError.notFound('Expense not found.'));

  const group = await findGroupOrFail(expense.group);
  requireMembership(group, req.user._id);

  const shares = await ExpenseShare.find({ expense: expense._id }).populate('user', 'name avatar');

  return sendResponse(res, 200, 'Expense fetched successfully.', { expense, shares });
});

/**
 * @route PATCH /api/v1/expenses/:id
 * Editing an expense recalculates its splits from scratch for consistency.
 */
const updateExpense = catchAsync(async (req, res, next) => {
  const expense = await Expense.findOne({ _id: req.params.id, isDeleted: false });
  if (!expense) return next(AppError.notFound('Expense not found.'));

  const group = await findGroupOrFail(expense.group);
  requireMembership(group, req.user._id);

  const { description, amount, category, notes, date, splitType, participants, paidBy } = req.body;

  if (description !== undefined) expense.description = description;
  if (category !== undefined) expense.category = category;
  if (notes !== undefined) expense.notes = notes;
  if (date !== undefined) expense.date = date;
  if (paidBy !== undefined) expense.paidBy = paidBy;
  if (req.file) expense.receiptUrl = `/uploads/receipts/${req.file.filename}`;

  const newAmount = amount !== undefined ? Number(amount) : expense.amount;
  const newSplitType = splitType || expense.splitType;

  if (amount !== undefined || splitType !== undefined || participants !== undefined) {
    const existingShares = await ExpenseShare.find({ expense: expense._id });
    const effectiveParticipants =
      participants || existingShares.map((s) => ({ userId: s.user, value: s.shareAmount }));

    const shares = calculateSplit({ splitType: newSplitType, amount: newAmount, participants: effectiveParticipants });

    await ExpenseShare.deleteMany({ expense: expense._id });
    await ExpenseShare.insertMany(
      shares.map((s) => ({
        expense: expense._id,
        group: expense.group,
        user: s.userId,
        shareAmount: s.shareAmount,
        percentage: s.percentage,
        shares: s.shares,
        isSettled: s.userId.toString() === (paidBy || expense.paidBy).toString(),
      }))
    );

    expense.amount = newAmount;
    expense.splitType = newSplitType;
  }

  await expense.save();

  await logActivity({
    group: expense.group,
    user: req.user._id,
    action: ACTIVITY_ACTIONS.UPDATE_EXPENSE,
    description: `${req.user.name} updated expense "${expense.description}"`,
  });

  await notifyGroupMembers({
    memberIds: group.members.map((m) => m.user),
    actorId: req.user._id,
    type: NOTIFICATION_TYPES.EXPENSE_UPDATED,
    title: 'Expense updated',
    message: `${req.user.name} updated "${expense.description}"`,
    group: expense.group,
    relatedExpense: expense._id,
  });

  return sendResponse(res, 200, 'Expense updated successfully.', { expense });
});

/**
 * @route DELETE /api/v1/expenses/:id
 * Soft delete: preserves the record for audit/history but excludes it from
 * balances, listings, and analytics going forward.
 */
const deleteExpense = catchAsync(async (req, res, next) => {
  const expense = await Expense.findOne({ _id: req.params.id, isDeleted: false });
  if (!expense) return next(AppError.notFound('Expense not found.'));

  const group = await findGroupOrFail(expense.group);
  requireMembership(group, req.user._id);

  expense.isDeleted = true;
  await expense.save();
  await ExpenseShare.deleteMany({ expense: expense._id });

  await Group.findByIdAndUpdate(expense.group, { $inc: { totalExpenses: -expense.amount } });

  await logActivity({
    group: expense.group,
    user: req.user._id,
    action: ACTIVITY_ACTIONS.DELETE_EXPENSE,
    description: `${req.user.name} deleted expense "${expense.description}"`,
  });

  return sendResponse(res, 200, 'Expense deleted successfully.', null);
});

module.exports = {
  createExpense,
  getGroupExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
