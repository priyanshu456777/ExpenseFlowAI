const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { USER_ROLES } = require('../constants');

const router = express.Router();

router.use(protect, restrictTo(USER_ROLES.ADMIN));

router.get('/dashboard', adminController.getAdminDashboard);
router.get('/users', adminController.listUsers);
router.patch('/users/:id/suspend', adminController.toggleUserSuspension);
router.get('/groups', adminController.listGroups);
router.get('/settings', adminController.getSettings);
router.patch('/settings', adminController.updateSettings);

module.exports = router;
