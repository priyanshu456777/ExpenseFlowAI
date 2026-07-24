const express = require('express');
const expenseController = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { uploadReceipt } = require('../middleware/upload');
const { createExpenseValidator, updateExpenseValidator } = require('../validators/expenseValidators');

const router = express.Router();

router.use(protect);

// When the request is multipart/form-data (file upload), Multer parses every
// text field as a plain string — including 'participants', which the client
// sends as a JSON-stringified array. Without this step, express-validator's
// isArray() check on 'participants' always fails (it's a string, not an
// array), even when participants were correctly selected on the frontend.
const parseParticipants = (req, res, next) => {
  if (typeof req.body.participants === 'string') {
    try {
      req.body.participants = JSON.parse(req.body.participants);
    } catch (e) {
      req.body.participants = [];
    }
  }
  next();
};

router.post(
  '/',
  uploadReceipt.single('receipt'),
  parseParticipants,
  createExpenseValidator,
  validateRequest,
  expenseController.createExpense
);
router.get('/group/:groupId', expenseController.getGroupExpenses);
router.get('/:id', expenseController.getExpenseById);
router.patch(
  '/:id',
  uploadReceipt.single('receipt'),
  parseParticipants,
  updateExpenseValidator,
  validateRequest,
  expenseController.updateExpense
);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;