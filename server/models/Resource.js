const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Resource name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Resource code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Fabrication', 'Lab Equipment', 'Media Gear', 'Space'],
      default: 'Fabrication',
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    ownerName: {
      type: String,
      trim: true,
      default: 'Lab Facility Manager',
    },
    riskTier: {
      type: Number,
      required: true,
      enum: [1, 2, 3],
      default: 1,
    },
    requiredBadges: {
      type: [String],
      default: [],
    },
    requiresSupervision: {
      type: Boolean,
      default: false,
    },
    securityDeposit: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxHoursPerBooking: {
      type: Number,
      default: 4,
      min: 1,
    },
    maxWeeklyHoursPerUser: {
      type: Number,
      default: 8,
      min: 1,
    },
    usageRules: {
      type: String,
      default: 'Must return equipment in clean condition with all standard accessories.',
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'IN_USE', 'MAINTENANCE_HOLD'],
      default: 'AVAILABLE',
    },
    currentCondition: {
      type: String,
      enum: ['MINT', 'GOOD', 'FAIR', 'DAMAGED'],
      default: 'GOOD',
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Resource', resourceSchema);
