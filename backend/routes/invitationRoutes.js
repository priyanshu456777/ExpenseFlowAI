const express = require('express');
const invitationController = require('../controllers/invitationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:token', protect, invitationController.getInvitationByToken);
router.post('/:token/accept', protect, invitationController.acceptInvitation);
router.post('/:token/decline', protect, invitationController.declineInvitation);

module.exports = router;
