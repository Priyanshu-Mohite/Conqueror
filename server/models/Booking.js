const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: [true, 'Resource reference is required'],
    },
    resourceName: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userDepartment: {
      type: String,
      default: 'Engineering',
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    durationHours: {
      type: Number,
      required: true,
      min: 0.5,
    },
    purpose: {
      type: String,
      required: [true, 'Project purpose is required'],
      trim: true,
    },
    projectType: {
      type: String,
      enum: ['Academic', 'Research', 'CapStone', 'Community'],
      default: 'Academic',
    },
    status: {
      type: String,
      enum: [
        'PENDING',
        'APPROVED',
        'REJECTED',
        'WAITLISTED',
        'CHECKED_IN',
        'RETURNED',
        'CANCELLED',
        'OVERDUE',
      ],
      default: 'PENDING',
    },
    verificationSummary: {
      hasRequiredBadges: { type: Boolean, default: true },
      missingBadges: { type: [String], default: [] },
      withinQuota: { type: Boolean, default: true },
      hasConflict: { type: Boolean, default: false },
      passedAll: { type: Boolean, default: true },
    },
    priorityScore: {
      type: Number,
      default: 100,
    },
    priorityBreakdown: {
      type: String,
      default: 'Base: 100 pts',
    },
    decisionReason: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: String,
      default: '',
    },
    reviewedAt: {
      type: Date,
    },
    checkInPin: {
      type: String,
      default: () => Math.floor(1000 + Math.random() * 9000).toString(),
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
