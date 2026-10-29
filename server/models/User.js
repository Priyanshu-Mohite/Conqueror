const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'User email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['student', 'researcher', 'manager', 'admin'],
      default: 'student',
    },
    department: {
      type: String,
      trim: true,
      default: 'Engineering',
    },
    verified: {
      type: Boolean,
      default: true,
    },
    badges: {
      type: [String],
      default: [],
    },
    weeklyQuotaHours: {
      type: Number,
      default: 8,
      min: 0,
    },
    weeklyHoursUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    lateReturnsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    trustScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
