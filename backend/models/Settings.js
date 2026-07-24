const mongoose = require('mongoose');

/**
 * Singleton-style collection holding global, admin-configurable app settings.
 * There should only ever be one document in this collection (enforced in the service layer).
 */
const settingsSchema = new mongoose.Schema(
  {
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    allowNewRegistrations: {
      type: Boolean,
      default: true,
    },
    defaultCurrency: {
      type: String,
      default: 'USD',
    },
    maxGroupMembers: {
      type: Number,
      default: 50,
    },
    maxFileUploadMB: {
      type: Number,
      default: 5,
    },
    announcementBanner: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
