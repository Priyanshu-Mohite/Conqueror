const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: [true, 'Resource reference is required'],
    },
    resourceName: {
      type: String,
      default: '',
    },
    reportedBy: {
      type: String,
      required: [true, 'Reporter identifier is required'],
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['DAMAGE', 'LATE_RETURN', 'SCHEDULING_CONFLICT', 'SAFETY_ISSUE'],
      default: 'DAMAGE',
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'CRITICAL'],
      default: 'MEDIUM',
    },
    description: {
      type: String,
      required: [true, 'Incident description is required'],
      trim: true,
    },
    affectedBookingsCount: {
      type: Number,
      default: 0,
    },
    aiAdvisorySummary: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED'],
      default: 'OPEN',
    },
    managerResolutionNotes: {
      type: String,
      default: '',
    },
    resolvedBy: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Incident', incidentSchema);
