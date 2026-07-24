const { body, param } = require('express-validator');

const recordSettlementValidator = [
  body('group').isMongoId().withMessage('Valid group ID is required'),
  body('to').isMongoId().withMessage('Valid recipient ID is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('method').optional().isIn(['cash', 'bank_transfer', 'upi', 'paypal', 'other']),
  body('note').optional().isLength({ max: 300 }),
];

const updateSettlementStatusValidator = [
  param('id').isMongoId().withMessage('Invalid settlement ID'),
  body('status').isIn(['pending', 'completed']).withMessage('Status must be pending or completed'),
];

module.exports = { recordSettlementValidator, updateSettlementStatusValidator };
