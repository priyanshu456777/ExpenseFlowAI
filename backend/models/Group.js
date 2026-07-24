const crypto = require('crypto');
const mongoose = require('mongoose');
const { GROUP_ROLES } = require('../constants');

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(GROUP_ROLES),
      default: GROUP_ROLES.MEMBER,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      maxlength: [60, 'Group name cannot exceed 60 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    currency: {
      type: String,
      default: 'USD',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: {
      type: [memberSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'A group must have at least one member',
      },
    },
    inviteCode: {
      type: String,
      unique: true,
      index: true,
    },
    inviteCodeExpiresAt: {
      type: Date,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    totalExpenses: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

groupSchema.index({ createdBy: 1 });
groupSchema.index({ 'members.user': 1 });

groupSchema.pre('save', function generateInviteCode(next) {
  if (!this.inviteCode) {
    this.inviteCode = crypto.randomBytes(6).toString('hex');
    this.inviteCodeExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  }
  next();
});

groupSchema.methods.getMemberRole = function getMemberRole(userId) {
  const member = this.members.find((m) => m.user.toString() === userId.toString());
  return member ? member.role : null;
};

groupSchema.methods.isMember = function isMember(userId) {
  return this.members.some((m) => m.user.toString() === userId.toString());
};

module.exports = mongoose.model('Group', groupSchema);
