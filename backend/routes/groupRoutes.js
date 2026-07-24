const express = require('express');
const groupController = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { uploadGroupImage } = require('../middleware/upload');
const {
  createGroupValidator,
  updateGroupValidator,
  inviteMemberValidator,
  joinByCodeValidator,
  memberRoleValidator,
} = require('../validators/groupValidators');

const router = express.Router();

router.use(protect);

router.post('/', uploadGroupImage.single('image'), createGroupValidator, validateRequest, groupController.createGroup);
router.get('/', groupController.getMyGroups);
router.post('/join', joinByCodeValidator, validateRequest, groupController.joinGroupByCode);
router.get('/invite/:inviteCode', groupController.getGroupByInviteCode);

router.get('/:id', groupController.getGroupById);
router.patch(
  '/:id',
  uploadGroupImage.single('image'),
  updateGroupValidator,
  validateRequest,
  groupController.updateGroup
);
router.delete('/:id', groupController.deleteGroup);

router.post('/:id/invite', inviteMemberValidator, validateRequest, groupController.inviteMemberByEmail);
router.patch('/:id/pin', groupController.togglePinGroup);
router.patch('/:id/members/:memberId/role', memberRoleValidator, validateRequest, groupController.updateMemberRole);
router.delete('/:id/members/:memberId', groupController.removeMember);
router.patch('/:id/transfer-ownership/:memberId', groupController.transferOwnership);

module.exports = router;
