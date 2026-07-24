const { body, param } = require('express-validator');
const { EXPENSE_CATEGORIES, SPLIT_TYPES } = require('../constants');

const createExpenseValidator = [
  body('group').isMongoId().withMessage('Valid group ID is required'),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 120 }),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('category').optional().isIn(EXPENSE_CATEGORIES).withMessage('Invalid category'),
  body('paidBy').isMongoId().withMessage('Valid payer ID is required'),
  body('splitType').isIn(Object.values(SPLIT_TYPES)).withMessage('Invalid split type'),
  body('participants').isArray({ min: 1 }).withMessage('At least one participant is required'),
  body('participants.*.userId').isMongoId().withMessage('Each participant needs a valid user ID'),
  body('date').optional().isISO8601().withMessage('Invalid date'),
  body('notes').optional().isLength({ max: 500 }),
];

const updateExpenseValidator = [
  param('id').isMongoId().withMessage('Invalid expense ID'),
  body('description').optional().trim().isLength({ min: 1, max: 120 }),
  body('amount').optional().isFloat({ gt: 0 }),
  body('category').optional().isIn(EXPENSE_CATEGORIES),
];

module.exports = { createExpenseValidator, updateExpenseValidator };
