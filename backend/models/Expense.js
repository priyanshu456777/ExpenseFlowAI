const mongoose = require('mongoose');
const { EXPENSE_CATEGORIES, SPLIT_TYPES } = require('../constants');

const expenseSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Expense description is required'],
      trim: true,
      maxlength: [120, 'Description cannot exceed 120 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    currency: {
      type: String,
      default: 'USD',
    },
    category: {
      type: String,
      enum: EXPENSE_CATEGORIES,
      default: 'Others',
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    splitType: {
      type: String,
      enum: Object.values(SPLIT_TYPES),
      default: SPLIT_TYPES.EQUAL,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
    receiptUrl: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

expenseSchema.index({ group: 1, date: -1 });
expenseSchema.index({ group: 1, category: 1 });
expenseSchema.index({ paidBy: 1 });
expenseSchema.index({ description: 'text', notes: 'text' });

module.exports = mongoose.model('Expense', expenseSchema);
