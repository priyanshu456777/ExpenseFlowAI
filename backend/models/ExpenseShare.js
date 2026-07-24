const mongoose = require('mongoose');

/**
 * Represents one member's share of a single expense.
 * For an expense split among N people, there are N ExpenseShare documents.
 * This normalized design avoids duplicating share data inside Expense itself
 * and allows efficient per-user balance queries via aggregation.
 */
const expenseShareSchema = new mongoose.Schema(
  {
    expense: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense',
      required: true,
      index: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // The amount this user owes for this specific expense.
    shareAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    // For percentage splits: the percentage assigned (0-100).
    percentage: {
      type: Number,
      default: null,
    },
    // For share-based splits: number of shares assigned.
    shares: {
      type: Number,
      default: null,
    },
    isSettled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

expenseShareSchema.index({ group: 1, user: 1 });
expenseShareSchema.index({ expense: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('ExpenseShare', expenseShareSchema);
