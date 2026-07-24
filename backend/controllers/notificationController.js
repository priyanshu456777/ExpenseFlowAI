const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const sendResponse = require('../utils/sendResponse');
const { getUserNotifications } = require('../services/notificationService');

/**
 * @route GET /api/v1/notifications
 */
const listNotifications = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const result = await getUserNotifications(req.user._id, {
    page: Number(page),
    limit: Number(limit),
    unreadOnly: unreadOnly === 'true',
  });

  return sendResponse(res, 200, 'Notifications fetched.', { notifications: result.notifications, unreadCount: result.unreadCount }, {
    pagination: { total: result.total, page: result.page, pages: result.pages },
  });
});

/**
 * @route PATCH /api/v1/notifications/:id/read
 */
const markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true },
    { new: true }
  );
  if (!notification) return next(AppError.notFound('Notification not found.'));

  return sendResponse(res, 200, 'Notification marked as read.', { notification });
});

/**
 * @route PATCH /api/v1/notifications/read-all
 */
const markAllAsRead = catchAsync(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  return sendResponse(res, 200, 'All notifications marked as read.', null);
});

/**
 * @route DELETE /api/v1/notifications/:id
 */
const deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
  if (!notification) return next(AppError.notFound('Notification not found.'));
  return sendResponse(res, 200, 'Notification deleted.', null);
});

module.exports = { listNotifications, markAsRead, markAllAsRead, deleteNotification };
