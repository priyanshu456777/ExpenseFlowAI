const { body, param } = require('express-validator');

const createGroupValidator = [
  body('name').trim().notEmpty().withMessage('Group name is required').isLength({ max: 60 }),
  body('description').optional().trim().isLength({ max: 300 }),
  body('currency').optional().isString().isLength({ min: 3, max: 3 }),
];

const updateGroupValidator = [
  param('id').isMongoId().withMessage('Invalid group ID'),
  body('name').optional().trim().isLength({ min: 1, max: 60 }),
  body('description').optional().trim().isLength({ max: 300 }),
];

const inviteMemberValidator = [
  param('id').isMongoId().withMessage('Invalid group ID'),
  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
];

const joinByCodeValidator = [
  body('inviteCode').trim().notEmpty().withMessage('Invite code is required'),
];

const memberRoleValidator = [
  param('id').isMongoId().withMessage('Invalid group ID'),
  param('memberId').isMongoId().withMessage('Invalid member ID'),
  body('role').isIn(['admin', 'member']).withMessage('Role must be admin or member'),
];

module.exports = {
  createGroupValidator,
  updateGroupValidator,
  inviteMemberValidator,
  joinByCodeValidator,
  memberRoleValidator,
};
