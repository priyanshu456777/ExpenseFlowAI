const express = require('express');
const insightController = require('../controllers/insightController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/overview', insightController.getOverviewInsights);
router.get('/group/:groupId', insightController.getGroupInsights);

module.exports = router;
