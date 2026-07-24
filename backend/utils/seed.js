/* eslint-disable no-console */
/**
 * Seeds the database with demo data for local development.
 *
 * Usage: npm run seed
 *
 * Wipes existing data in the collections below and recreates a small,
 * consistent demo dataset: a few users, a shared group, some expenses split
 * across members, the resulting per-expense shares, one settlement, and a
 * couple of notifications/activity log entries so the dashboard isn't empty.
 */
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Group = require('../models/Group');
const Category = require('../models/Category');
const Expense = require('../models/Expense');
const ExpenseShare = require('../models/ExpenseShare');
const Settlement = require('../models/Settlement');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const Settings = require('../models/Settings');

const { GROUP_ROLES, SPLIT_TYPES, SETTLEMENT_STATUS, NOTIFICATION_TYPES, ACTIVITY_ACTIONS } = require('../constants');

const DEMO_PASSWORD = 'Password123!';

const DEMO_USERS = [
  { name: 'Ava Martinez', email: 'ava@example.com' },
  { name: 'Liam Chen', email: 'liam@example.com' },
  { name: 'Sofia Rossi', email: 'sofia@example.com' },
  { name: 'Noah Patel', email: 'noah@example.com', role: 'admin' },
];

/** Splits `amount` equally among `userIds`, distributing rounding remainder to the first payer. */
const splitEqually = (amount, userIds) => {
  const base = Math.floor((amount * 100) / userIds.length) / 100;
  const remainder = Math.round((amount - base * userIds.length) * 100) / 100;
  return userIds.map((userId, i) => ({
    user: userId,
    shareAmount: i === 0 ? Math.round((base + remainder) * 100) / 100 : base,
  }));
};

const run = async () => {
  await connectDB();
  console.log('[seed] Connected. Wiping existing demo collections...');

  await Promise.all([
    User.deleteMany({}),
    Group.deleteMany({}),
    Category.deleteMany({}),
    Expense.deleteMany({}),
    ExpenseShare.deleteMany({}),
    Settlement.deleteMany({}),
    Notification.deleteMany({}),
    ActivityLog.deleteMany({}),
    Settings.deleteMany({}),
  ]);

  console.log('[seed] Creating users...');
  const users = [];
  for (const u of DEMO_USERS) {
    // Created one at a time (not insertMany) so the User model's pre('save')
    // password-hashing hook runs for each document.
    const user = await User.create({
      name: u.name,
      email: u.email,
      password: DEMO_PASSWORD,
      role: u.role || 'user',
      isEmailVerified: true,
    });
    users.push(user);
  }
  const [ava, liam, sofia, noah] = users;

  console.log('[seed] Creating group...');
  const group = await Group.create({
    name: 'Goa Trip 2026',
    description: 'Weekend getaway expenses',
    currency: 'USD',
    createdBy: ava._id,
    members: [
      { user: ava._id, role: GROUP_ROLES.OWNER },
      { user: liam._id, role: GROUP_ROLES.MEMBER },
      { user: sofia._id, role: GROUP_ROLES.MEMBER },
      { user: noah._id, role: GROUP_ROLES.MEMBER },
    ],
  });

  console.log('[seed] Creating custom category...');
  await Category.create({
    name: 'Scuba Diving',
    icon: 'Waves',
    color: '#0EA5E9',
    createdBy: ava._id,
  });

  console.log('[seed] Creating expenses + shares...');
  const memberIds = [ava._id, liam._id, sofia._id, noah._id];

  const expenseDefs = [
    { description: 'Beach resort (2 nights)', amount: 480, category: 'Travel', paidBy: ava._id },
    { description: 'Seafood dinner', amount: 96.5, category: 'Food', paidBy: liam._id },
    { description: 'Scooter rentals', amount: 60, category: 'Travel', paidBy: sofia._id },
  ];

  for (const def of expenseDefs) {
    const expense = await Expense.create({
      group: group._id,
      description: def.description,
      amount: def.amount,
      category: def.category,
      paidBy: def.paidBy,
      splitType: SPLIT_TYPES.EQUAL,
      createdBy: def.paidBy,
    });

    const shares = splitEqually(def.amount, memberIds);
    await ExpenseShare.insertMany(
      shares.map((s) => ({
        expense: expense._id,
        group: group._id,
        user: s.user,
        shareAmount: s.shareAmount,
        isSettled: s.user.equals(def.paidBy),
      }))
    );

    await ActivityLog.create({
      group: group._id,
      user: def.paidBy,
      action: ACTIVITY_ACTIONS.ADD_EXPENSE,
      description: `${def.description} added`,
      metadata: { expenseId: expense._id, amount: def.amount },
    });
  }

  console.log('[seed] Creating a settlement...');
  await Settlement.create({
    group: group._id,
    from: noah._id,
    to: ava._id,
    amount: 120,
    status: SETTLEMENT_STATUS.COMPLETED,
    method: 'upi',
    settledAt: new Date(),
    recordedBy: noah._id,
  });

  console.log('[seed] Creating a notification...');
  await Notification.create({
    recipient: noah._id,
    sender: ava._id,
    type: NOTIFICATION_TYPES.MEMBER_JOINED,
    title: 'Welcome to Goa Trip 2026',
    message: `${ava.name} added you to the group.`,
    group: group._id,
  });

  console.log('[seed] Creating global settings singleton...');
  await Settings.create({});

  console.log('\n[seed] Done! Demo accounts (all share the same password):');
  DEMO_USERS.forEach((u) => console.log(`  - ${u.email} / ${DEMO_PASSWORD}`));

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});