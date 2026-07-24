const mongoose = require('mongoose');

/**
 * Default expense categories are hardcoded in constants/index.js for performance
 * (no DB lookup needed on the hot path of adding an expense). This collection
 * exists to let users/admins define additional custom categories with icons/colors.
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },
    icon: {
      type: String,
      default: 'Tag',
    },
    color: {
      type: String,
      default: '#6366F1',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

categorySchema.index({ createdBy: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
