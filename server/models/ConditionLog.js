const mongoose = require('mongoose');

const conditionLogSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking reference is required'],
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: [true, 'Resource reference is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    // Check-in (Before) state
    checkInAt: {
      type: Date,
      default: Date.now,
    },
    checkInRating: {
      type: String,
      enum: ['MINT', 'GOOD', 'MINOR_WEAR'],
      default: 'GOOD',
    },
    checkInChecklist: {
      cleanliness: { type: Boolean, default: true },
      calibration: { type: Boolean, default: true },
      accessoriesComplete: { type: Boolean, default: true },
    },
    checkInNotes: {
      type: String,
      default: 'Equipment verified clean and fully functional before checkout.',
    },
    checkInPhotoUrl: {
      type: String,
      default: '',
    },
    // Check-out / Return (After) state
    checkOutAt: {
      type: Date,
    },
    checkOutRating: {
      type: String,
      enum: ['MINT', 'GOOD', 'MINOR_WEAR', 'DAMAGED'],
    },
    checkOutChecklist: {
      cleanliness: { type: Boolean, default: true },
      calibration: { type: Boolean, default: true },
      accessoriesComplete: { type: Boolean, default: true },
    },
    checkOutNotes: {
      type: String,
      default: '',
    },
    checkOutPhotoUrl: {
      type: String,
      default: '',
    },
    damageFlagged: {
      type: Boolean,
      default: false,
    },
    aiConditionDiff: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ConditionLog', conditionLogSchema);
