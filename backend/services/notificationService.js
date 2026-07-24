const Notification = require('../models/Notification');

/**
 * Creates a notification for a single recipient. Never throws — a failed
 * notification must not roll back the primary business action (e.g. adding an expense).
 */
const notifyUser = async ({ recipient, sender, type, title, message, group, relatedExpense, relatedSettlement }) => {
  try {
    if (sender && recipient.toString() === sender.toString()) return null; // don't notify yourself
    return await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      group,
      relatedExpense,
      relatedSettlement,
    });
  } catch (error) {
    console.error(`[NotificationService] Failed to notify user ${recipient}: ${error.message}`);
    return null;
  }
};

/**
 * Notifies every member of a group except the actor who triggered the event.
 */
const notifyGroupMembers = async ({ memberIds, actorId, type, title, message, group, relatedExpense, relatedSettlement }) => {
  const recipients = memberIds.filter((id) => id.toString() !== actorId?.toString());
  await Promise.all(
    recipients.map((recipient) =>
      notifyUser({ recipient, sender: actorId, type, title, message, group, relatedExpense, relatedSettlement })
    )
  );
};

const getUserNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false } = {}) => {
  const filter = { recipient: userId };
  if (unreadOnly) filter.isRead = false;

  const skip = (page - 1) * limit;
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('sender', 'name avatar').lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: userId, isRead: false }),
  ]);

  return { notifications, total, unreadCount, page: Number(page), pages: Math.ceil(total / limit) };
};

module.exports = { notifyUser, notifyGroupMembers, getUserNotifications };
