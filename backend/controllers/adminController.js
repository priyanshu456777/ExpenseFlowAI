const User = require('../models/User');
const Group = require('../models/Group');
const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');
const Settings = require('../models/Settings');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendResponse = require('../utils/sendResponse');

/**
 * @route GET /api/v1/admin/dashboard
 */
const getAdminDashboard = catchAsync(async (req, res) => {
  const [totalUsers, totalGroups, totalExpensesAgg, totalSettlements, recentUsers] = await Promise.all([
    User.countDocuments(),
    Group.countDocuments({ isArchived: false }),
    Expense.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Settlement.countDocuments({ status: 'completed' }),
    User.find().sort({ createdAt: -1 }).limit(10).select('name email avatar createdAt role').lean(),
  ]);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const newUsersLast30Days = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

  return sendResponse(res, 200, 'Admin dashboard stats fetched.', {
    totalUsers,
    totalGroups,
    totalExpenseAmount: totalExpensesAgg[0]?.total || 0,
    totalExpenseCount: totalExpensesAgg[0]?.count || 0,
    totalCompletedSettlements: totalSettlements,
    newUsersLast30Days,
    recentUsers,
  });
});

/**
 * @route GET /api/v1/admin/users
 */
const listUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, search = '' } = req.query;
  const filter = search ? { $text: { $search: search } } : {};

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).select('-passwordResetToken -passwordResetExpires').lean(),
    User.countDocuments(filter),
  ]);

  return sendResponse(res, 200, 'Users fetched.', { users }, {
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
});

/**
 * @route PATCH /api/v1/admin/users/:id/suspend
 */
const toggleUserSuspension = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(AppError.notFound('User not found.'));
  if (user.role === 'admin') return next(AppError.forbidden('Cannot suspend an admin account.'));

  user.isSuspended = !user.isSuspended;
  await user.save({ validateBeforeSave: false });

  return sendResponse(res, 200, user.isSuspended ? 'User suspended.' : 'User unsuspended.', { user: user.toSafeJSON() });
});

/**
 * @route GET /api/v1/admin/groups
 */
const listGroups = catchAsync(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [groups, total] = await Promise.all([
    Group.find({ isArchived: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'name email')
      .lean(),
    Group.countDocuments({ isArchived: false }),
  ]);

  return sendResponse(res, 200, 'Groups fetched.', { groups }, {
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
});

/**
 * @route GET /api/v1/admin/settings
 */
const getSettings = catchAsync(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  return sendResponse(res, 200, 'Settings fetched.', { settings });
});

/**
 * @route PATCH /api/v1/admin/settings
 */
const updateSettings = catchAsync(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = new Settings();

  const allowedFields = [
    'maintenanceMode',
    'allowNewRegistrations',
    'defaultCurrency',
    'maxGroupMembers',
    'maxFileUploadMB',
    'announcementBanner',
  ];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) settings[field] = req.body[field];
  });

  await settings.save();

  return sendResponse(res, 200, 'Settings updated.', { settings });
});

module.exports = {
  getAdminDashboard,
  listUsers,
  toggleUserSuspension,
  listGroups,
  getSettings,
  updateSettings,
};
