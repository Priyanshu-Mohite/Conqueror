/**
 * CampusVault Explainable Fair-Allocation & Anti-Monopolisation Engine
 * Enforces equitable lab/makerspace sharing across campus builders.
 */

/**
 * Calculates priority score and detailed explainable breakdown.
 * Higher score = higher priority in competing time slots and waitlist queues.
 * 
 * Rules:
 * - Base Score: 100
 * - Usage Penalty: -10 pts per hour used this week (anti-monopolisation)
 * - First-Time Access Bonus: +15 pts if 0 hours used this week
 * - Late Return Penalty: -25 pts per late return record
 * - Academic / CapStone / Research Bonus: +10 pts
 * - Score range clamped between 5 and 115
 */
function calculatePriorityScore(user, bookingRequest = {}) {
  const weeklyHours = Number(user.weeklyHoursUsed || 0);
  const lateReturns = Number(user.lateReturnsCount || 0);
  const projectType = bookingRequest.projectType || 'Academic';

  let score = 100;
  const breakdownParts = ['Base 100'];

  // Usage Penalty
  if (weeklyHours > 0) {
    const penalty = weeklyHours * 10;
    score -= penalty;
    breakdownParts.push(`-${penalty} (${weeklyHours}h used this week)`);
  } else {
    // First-Time Access Bonus
    score += 15;
    breakdownParts.push('+15 (First-Time User Bonus)');
  }

  // Late Return Penalty
  if (lateReturns > 0) {
    const penalty = lateReturns * 25;
    score -= penalty;
    breakdownParts.push(`-${penalty} (${lateReturns} late returns)`);
  }

  // Urgency / CapStone / Research Priority
  if (projectType === 'Research' || projectType === 'CapStone') {
    score += 10;
    breakdownParts.push(`+10 (${projectType} Priority)`);
  }

  // Clamp between 5 and 115
  const clampedScore = Math.max(5, Math.min(115, score));
  const breakdown = `${breakdownParts.join(' ')} = ${clampedScore} pts`;

  return {
    score: clampedScore,
    breakdown,
  };
}

/**
 * Validates user eligibility and checks for time slot conflicts.
 * 
 * Checks:
 * 1. Required safety/training badges
 * 2. Weekly quota limits (per-user resource cap)
 * 3. Schedule overlap with any APPROVED or CHECKED_IN bookings
 */
function verifyEligibilityAndConflicts(user, resource, startTime, endTime, existingBookings = []) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationHours = Math.max(0.5, (end.getTime() - start.getTime()) / (1000 * 60 * 60));

  // 1. Safety Badges Check
  const userBadges = Array.isArray(user.badges) ? user.badges : [];
  const requiredBadges = Array.isArray(resource.requiredBadges) ? resource.requiredBadges : [];
  const missingBadges = requiredBadges.filter((b) => !userBadges.includes(b));
  const hasRequiredBadges = missingBadges.length === 0;

  // 2. Weekly Quota Check
  const hoursUsed = Number(user.weeklyHoursUsed || 0);
  const weeklyLimit = Number(resource.maxWeeklyHoursPerUser || user.weeklyQuotaHours || 8);
  const remainingQuotaHours = Math.max(0, weeklyLimit - hoursUsed);
  const withinQuota = (hoursUsed + durationHours) <= weeklyLimit;

  // 3. Time Slot Overlap Conflict Check
  const conflictingBookings = existingBookings.filter((b) => {
    // Only active bookings on the same resource can conflict
    const isSameResource = b.resourceId.toString() === resource._id.toString();
    const isActiveStatus = ['APPROVED', 'CHECKED_IN'].includes(b.status);
    if (!isSameResource || !isActiveStatus) return false;

    const bStart = new Date(b.startTime);
    const bEnd = new Date(b.endTime);

    // Overlap condition: start < bEnd && end > bStart
    return start < bEnd && end > bStart;
  });

  const hasConflict = conflictingBookings.length > 0;
  const conflictingBookingIds = conflictingBookings.map((b) => b._id);

  // Overall eligibility flag
  const passedAll = hasRequiredBadges && withinQuota && !hasConflict;

  return {
    hasRequiredBadges,
    missingBadges,
    withinQuota,
    remainingQuotaHours,
    durationHours,
    hasConflict,
    conflictingBookingIds,
    conflictingCount: conflictingBookings.length,
    passedAll,
  };
}

module.exports = {
  calculatePriorityScore,
  verifyEligibilityAndConflicts,
};
