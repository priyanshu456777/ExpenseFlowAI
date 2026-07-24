const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { uploadAvatar } = require('../middleware/upload');
const { updateProfileValidator, deleteAccountValidator } = require('../validators/userValidators');

const router = express.Router();

router.use(protect);

router.patch('/me', uploadAvatar.single('avatar'), updateProfileValidator, validateRequest, userController.updateProfile);
router.delete('/me', deleteAccountValidator, validateRequest, userController.deleteAccount);
router.get('/favorites', userController.getFavoriteMembers);
router.patch('/favorites/:memberId', userController.toggleFavoriteMember);
router.get('/:id', userController.getUserPublicProfile);

module.exports = router;
