const { body } = require('express-validator');
const { SUPPORTED_CURRENCIES } = require('../constants');

const updateProfileValidator = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('currency').optional().isIn(SUPPORTED_CURRENCIES),
  body('theme').optional().isIn(['dark', 'light']),
  body('language').optional().isString().isLength({ min: 2, max: 10 }),
  body('monthlyBudget').optional().isFloat({ min: 0 }),
  body('dailySpendingGoal').optional().isFloat({ min: 0 }),
];

const deleteAccountValidator = [body('password').notEmpty().withMessage('Password is required to delete your account')];

module.exports = { updateProfileValidator, deleteAccountValidator };
