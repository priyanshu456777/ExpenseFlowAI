const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/group/:groupId/monthly', analyticsController.getMonthlySpending);
router.get('/group/:groupId/categories', analyticsController.getCategoryBreakdown);
router.get('/group/:groupId/weekly-trend', analyticsController.getWeeklyTrend);
router.get('/group/:groupId/top-contributors', analyticsController.getTopContributors);
router.get('/group/:groupId/heatmap', analyticsController.getExpenseHeatmap);

module.exports = router;
