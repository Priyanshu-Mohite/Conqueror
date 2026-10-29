const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
    },
    actorId: {
      type: String,
      default: 'system',
    },
    actorName: {
      type: String,
      required: [true, 'Actor name is required'],
      default: 'System Automator',
    },
    actorRole: {
      type: String,
      required: [true, 'Actor role is required'],
      default: 'system',
    },
    action: {
      type: String,
      required: [true, 'Action string is required'],
      trim: true,
    },
    reason: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true, // Tamper-evident ledger
    },
  },
  {
    timestamps: false, // We use immutable createdAt
  }
);

// Index for chronological auditing
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
