const express = require('express');
const settlementController = require('../controllers/settlementController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { recordSettlementValidator, updateSettlementStatusValidator } = require('../validators/settlementValidators');

const router = express.Router();

router.use(protect);

router.get('/group/:groupId/balances', settlementController.getGroupBalances);
router.get('/group/:groupId/suggestions', settlementController.getSettlementSuggestions);
router.get('/group/:groupId/history', settlementController.getSettlementHistory);

router.post('/', recordSettlementValidator, validateRequest, settlementController.recordSettlement);
router.patch('/:id/status', updateSettlementStatusValidator, validateRequest, settlementController.updateSettlementStatus);

module.exports = router;
