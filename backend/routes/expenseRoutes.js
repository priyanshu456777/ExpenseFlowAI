const express = require('express');
const expenseController = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { uploadReceipt } = require('../middleware/upload');
const { createExpenseValidator, updateExpenseValidator } = require('../validators/expenseValidators');

const router = express.Router();

router.use(protect);

router.post('/', uploadReceipt.single('receipt'), createExpenseValidator, validateRequest, expenseController.createExpense);
router.get('/group/:groupId', expenseController.getGroupExpenses);
router.get('/:id', expenseController.getExpenseById);
router.patch('/:id', uploadReceipt.single('receipt'), updateExpenseValidator, validateRequest, expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
