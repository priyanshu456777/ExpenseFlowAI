// Centralized enums/constants used across the backend to avoid magic strings.

const USER_ROLES = Object.freeze({
  ADMIN: 'admin',
  USER: 'user',
});

const GROUP_ROLES = Object.freeze({
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
});

const EXPENSE_CATEGORIES = Object.freeze([
  'Travel',
  'Food',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Others',
]);

const SPLIT_TYPES = Object.freeze({
  EQUAL: 'equal',
  UNEQUAL: 'unequal',
  PERCENTAGE: 'percentage',
  SHARES: 'shares',
});

const SETTLEMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  COMPLETED: 'completed',
});

const INVITATION_STATUS = Object.freeze({
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  EXPIRED: 'expired',
});

const NOTIFICATION_TYPES = Object.freeze({
  EXPENSE_ADDED: 'expense_added',
  EXPENSE_UPDATED: 'expense_updated',
  EXPENSE_DELETED: 'expense_deleted',
  SETTLEMENT_COMPLETED: 'settlement_completed',
  MEMBER_JOINED: 'member_joined',
  INVITATION_ACCEPTED: 'invitation_accepted',
  PAYMENT_REMINDER: 'payment_reminder',
  GROUP_INVITE: 'group_invite',
});

const SUPPORTED_CURRENCIES = Object.freeze(['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'JPY']);

const ACTIVITY_ACTIONS = Object.freeze({
  CREATE_GROUP: 'create_group',
  UPDATE_GROUP: 'update_group',
  DELETE_GROUP: 'delete_group',
  ADD_EXPENSE: 'add_expense',
  UPDATE_EXPENSE: 'update_expense',
  DELETE_EXPENSE: 'delete_expense',
  SETTLE_PAYMENT: 'settle_payment',
  JOIN_GROUP: 'join_group',
  LEAVE_GROUP: 'leave_group',
});

module.exports = {
  USER_ROLES,
  GROUP_ROLES,
  EXPENSE_CATEGORIES,
  SPLIT_TYPES,
  SETTLEMENT_STATUS,
  INVITATION_STATUS,
  NOTIFICATION_TYPES,
  SUPPORTED_CURRENCIES,
  ACTIVITY_ACTIONS,
};
