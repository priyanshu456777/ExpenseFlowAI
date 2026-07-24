const User = require('../models/User');
const Group = require('../models/Group');
const ExpenseShare = require('../models/ExpenseShare');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendResponse = require('../utils/sendResponse');
const { clearAuthCookies } = require('../utils/tokenService');

const ALLOWED_FIELDS = [
  'name',
  'currency',
  'theme',
  'language',
  'monthlyBudget',
  'dailySpendingGoal',
];

/**
 * @route PATCH /api/v1/users/me
 */
const updateProfile = catchAsync(async (req, res) => {
  const updates = {};
  ALLOWED_FIELDS.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  if (req.file) {
    const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    updates.avatar = `${baseUrl}/uploads/avatars/${req.file.filename}`;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  return sendResponse(res, 200, 'Profile updated successfully.', { user: user.toSafeJSON() });
});

/**
 * @route GET /api/v1/users/:id
 * Public-ish profile lookup (name/avatar only) — used when displaying group members.
 */
const getUserPublicProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('name avatar currency createdAt');
  if (!user) return next(AppError.notFound('User not found.'));
  return sendResponse(res, 200, 'User profile fetched.', { user });
});

/**
 * @route GET /api/v1/users/favorites
 */
const getFavoriteMembers = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).populate('favoriteMembers', 'name avatar');
  return sendResponse(res, 200, 'Favorite members fetched.', { favorites: user.favoriteMembers });
});

/**
 * @route PATCH /api/v1/users/favorites/:memberId
 */
const toggleFavoriteMember = catchAsync(async (req, res) => {
  const user = req.user;
  const idx = user.favoriteMembers.findIndex((id) => id.toString() === req.params.memberId);
  let isFavorite;
  if (idx > -1) {
    user.favoriteMembers.splice(idx, 1);
    isFavorite = false;
  } else {
    user.favoriteMembers.push(req.params.memberId);
    isFavorite = true;
  }
  await user.save({ validateBeforeSave: false });

  return sendResponse(res, 200, isFavorite ? 'Added to favorites.' : 'Removed from favorites.', { isFavorite });
});

/**
 * @route DELETE /api/v1/users/me
 * Prevents deletion while unsettled balances exist, to protect group financial integrity.
 */
const deleteAccount = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(req.body.password))) {
    return next(AppError.unauthorized('Incorrect password.', 'INVALID_PASSWORD'));
  }

  const unsettledCount = await ExpenseShare.countDocuments({ user: user._id, isSettled: false });
  if (unsettledCount > 0) {
    return next(
      AppError.badRequest('You have unsettled balances in one or more groups. Settle them before deleting your account.', 'UNSETTLED_BALANCES')
    );
  }

  const ownedGroups = await Group.countDocuments({ createdBy: user._id, 'members.role': 'owner', isArchived: false });
  if (ownedGroups > 0) {
    return next(
      AppError.badRequest('You own one or more active groups. Transfer ownership or delete those groups first.', 'OWNS_GROUPS')
    );
  }

  await Group.updateMany({ 'members.user': user._id }, { $pull: { members: { user: user._id } } });
  await User.findByIdAndDelete(user._id);

  clearAuthCookies(res);

  return sendResponse(res, 200, 'Account deleted successfully.', null);
});

module.exports = {
  updateProfile,
  getUserPublicProfile,
  getFavoriteMembers,
  toggleFavoriteMember,
  deleteAccount,
};