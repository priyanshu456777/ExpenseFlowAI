const express = require('express');
const activityController = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/group/:groupId', activityController.getGroupActivityLog);

module.exports = router;
