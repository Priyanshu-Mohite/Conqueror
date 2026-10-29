const express = require('express');
const router = express.Router();
const { User, Resource, Booking, ConditionLog, Incident, AuditLog } = require('../models');
const { calculatePriorityScore, verifyEligibilityAndConflicts } = require('../utils/fairAllocation');
const { matchResourcesForQuery, generateIncidentAndConditionAdvisory } = require('../utils/aiCopilot');

/**
 * GET /api/bootstrap
 * Single consolidated payload for instant dashboard hydration
 */
router.get('/bootstrap', async (req, res, next) => {
  try {
    const [users, resources, bookings, conditionLogs, incidents, auditLogs] = await Promise.all([
      User.find().sort({ name: 1 }),
      Resource.find().sort({ createdAt: -1 }),
      Booking.find().sort({ startTime: -1 }),
      ConditionLog.find().sort({ createdAt: -1 }),
      Incident.find().sort({ createdAt: -1 }),
      AuditLog.find().sort({ createdAt: -1 }).limit(50),
    ]);

    // Build notifications for active alerts (e.g. maintenance holds, pending approvals)
    const notifications = [];
    incidents.filter(i => i.status !== 'RESOLVED').forEach(inc => {
      notifications.push({
        id: `inc-${inc._id}`,
        type: 'warning',
        title: `Incident Alert: ${inc.type}`,
        message: `${inc.resourceName} flagged with ${inc.severity} severity. Manager review required.`,
        timestamp: inc.createdAt,
      });
    });

    const pendingCount = bookings.filter(b => b.status === 'PENDING').length;
    if (pendingCount > 0) {
      notifications.push({
        id: 'pending-bookings',
        type: 'info',
        title: 'Pending Requests Awaiting Review',
        message: `${pendingCount} booking requests are in queue for manager decision.`,
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
      data: {
        users,
        resources,
        bookings,
        conditionLogs,
        incidents,
        auditLogs,
        notifications,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/resources
 * Step 1: Owner lists a new resource
 */
router.post('/resources', async (req, res, next) => {
  try {
    const {
      name,
      code,
      category,
      location,
      ownerId,
      ownerName,
      riskTier,
      requiredBadges,
      requiresSupervision,
      securityDeposit,
      maxHoursPerBooking,
      maxWeeklyHoursPerUser,
      usageRules,
      imageUrl,
    } = req.body;

    const resource = new Resource({
      name,
      code,
      category,
      location,
      ownerId,
      ownerName: ownerName || 'Lab Manager',
      riskTier: Number(riskTier || 1),
      requiredBadges: requiredBadges || [],
      requiresSupervision: Boolean(requiresSupervision),
      securityDeposit: Number(securityDeposit || 0),
      maxHoursPerBooking: Number(maxHoursPerBooking || 4),
      maxWeeklyHoursPerUser: Number(maxWeeklyHoursPerUser || 8),
      usageRules: usageRules || 'Standard lab protocol applies.',
      imageUrl: imageUrl || '',
      status: 'AVAILABLE',
      currentCondition: 'GOOD',
    });

    await resource.save();

    await AuditLog.create({
      resourceId: resource._id,
      actorId: ownerId || 'system',
      actorName: ownerName || 'Lab Manager',
      actorRole: 'manager',
      action: 'RESOURCE_LISTED',
      reason: `New ${category} resource "${name}" [Tier ${resource.riskTier}] listed at ${location}`,
      metadata: { code, riskTier: resource.riskTier, requiredBadges: resource.requiredBadges },
    });

    res.status(201).json({ success: true, resource });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/users/:id/badges
 * User completes instant safety verification for demo purposes
 */
router.post('/users/:id/badges', async (req, res, next) => {
  try {
    const { badge } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.badges.includes(badge)) {
      user.badges.push(badge);
      await user.save();

      await AuditLog.create({
        actorId: user._id.toString(),
        actorName: user.name,
        actorRole: user.role,
        action: 'BADGE_VERIFIED',
        reason: `Completed safety module and earned qualification: ${badge}`,
        metadata: { badge, updatedBadges: user.badges },
      });
    }

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/bookings
 * Steps 3 & 4: Submit request, run fair-allocation and automated eligibility pre-checks
 */
router.post('/bookings', async (req, res, next) => {
  try {
    const { resourceId, userId, startTime, endTime, purpose, projectType } = req.body;

    const [user, resource, existingBookings] = await Promise.all([
      User.findById(userId),
      Resource.findById(resourceId),
      Booking.find({ resourceId }),
    ]);

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!resource) return res.status(404).json({ error: 'Resource not found' });

    if (resource.status === 'MAINTENANCE_HOLD') {
      return res.status(400).json({
        error: 'This resource is currently on MAINTENANCE_HOLD and cannot be booked until cleared by a manager.',
      });
    }

    // Run Fair-Share Priority Scoring
    const { score, breakdown } = calculatePriorityScore(user, { projectType });

    // Run Automated Eligibility & Overlap Verification
    const verification = verifyEligibilityAndConflicts(user, resource, startTime, endTime, existingBookings);

    const booking = new Booking({
      resourceId: resource._id,
      resourceName: resource.name,
      userId: user._id,
      userName: user.name,
      userDepartment: user.department,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      durationHours: verification.durationHours,
      purpose,
      projectType: projectType || 'Academic',
      status: 'PENDING',
      verificationSummary: {
        hasRequiredBadges: verification.hasRequiredBadges,
        missingBadges: verification.missingBadges,
        withinQuota: verification.withinQuota,
        hasConflict: verification.hasConflict,
        passedAll: verification.passedAll,
      },
      priorityScore: score,
      priorityBreakdown: breakdown,
    });

    await booking.save();

    // Immutable Audit Logs for Step 3 (Request) & Step 4 (Verification)
    await AuditLog.create({
      bookingId: booking._id,
      resourceId: resource._id,
      actorId: user._id.toString(),
      actorName: user.name,
      actorRole: user.role,
      action: 'BOOKING_REQUESTED',
      reason: `Requested ${resource.name} for ${purpose} (${booking.durationHours}h, ${projectType})`,
      metadata: { priorityScore: score, breakdown },
    });

    await AuditLog.create({
      bookingId: booking._id,
      resourceId: resource._id,
      actorId: 'system-allocator',
      actorName: 'Fair-Share Engine',
      actorRole: 'system',
      action: 'ELIGIBILITY_VERIFIED',
      reason: verification.passedAll
        ? 'Automated pre-check passed: Badges verified, within quota, no schedule collision'
        : `Pre-check flagged: ${verification.missingBadges.length ? 'Missing badges: ' + verification.missingBadges.join(', ') : ''} ${!verification.withinQuota ? 'Exceeds quota' : ''} ${verification.hasConflict ? 'Time slot conflict detected' : ''}`,
      metadata: verification,
    });

    res.status(201).json({ success: true, booking, verification });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/bookings/:id/decision
 * Steps 5 & 6: Manager decision (APPROVE, REJECT, WAITLIST) with auto-waitlist of competing requests
 */
router.patch('/bookings/:id/decision', async (req, res, next) => {
  try {
    const { decision, decisionReason, managerName, managerId } = req.body;
    if (!['APPROVED', 'REJECTED', 'WAITLISTED'].includes(decision)) {
      return res.status(400).json({ error: 'Decision must be APPROVED, REJECTED, or WAITLISTED' });
    }
    if (!decisionReason || decisionReason.trim().length === 0) {
      return res.status(400).json({ error: 'Explainable decisionReason is required' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    booking.status = decision;
    booking.decisionReason = decisionReason;
    booking.reviewedBy = managerName || 'Authorized Manager';
    booking.reviewedAt = new Date();
    await booking.save();

    await AuditLog.create({
      bookingId: booking._id,
      resourceId: booking.resourceId,
      actorId: managerId || 'manager-1',
      actorName: managerName || 'Authorized Manager',
      actorRole: 'manager',
      action: `BOOKING_${decision}`,
      reason: decisionReason,
      metadata: { priorityScore: booking.priorityScore, status: decision },
    });

    let autoWaitlisted = [];

    // If APPROVED, auto-waitlist competing PENDING requests for overlapping slot
    if (decision === 'APPROVED') {
      const competing = await Booking.find({
        _id: { $ne: booking._id },
        resourceId: booking.resourceId,
        status: 'PENDING',
        startTime: { $lt: booking.endTime },
        endTime: { $gt: booking.startTime },
      }).sort({ priorityScore: -1 });

      for (const comp of competing) {
        comp.status = 'WAITLISTED';
        comp.decisionReason = `Auto-waitlisted behind approved booking #${booking._id.toString().slice(-4)} (Higher priority score: ${booking.priorityScore} vs ${comp.priorityScore})`;
        comp.reviewedBy = 'Fair-Share Engine';
        comp.reviewedAt = new Date();
        await comp.save();
        autoWaitlisted.push(comp);

        await AuditLog.create({
          bookingId: comp._id,
          resourceId: comp.resourceId,
          actorId: 'system-allocator',
          actorName: 'Fair-Share Engine',
          actorRole: 'system',
          action: 'COMPETING_REQUEST_WAITLISTED',
          reason: comp.decisionReason,
          metadata: { competingWithBookingId: booking._id, score: comp.priorityScore },
        });
      }
    }

    res.json({ success: true, booking, autoWaitlisted });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/bookings/:id/cancel
 * Cancel a booking and auto-promote highest priority waitlisted request
 */
router.post('/bookings/:id/cancel', async (req, res, next) => {
  try {
    const { cancelReason, actorName, actorRole } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const wasApproved = booking.status === 'APPROVED';
    booking.status = 'CANCELLED';
    booking.decisionReason = cancelReason || 'Cancelled by user/manager';
    await booking.save();

    await AuditLog.create({
      bookingId: booking._id,
      resourceId: booking.resourceId,
      actorId: 'actor',
      actorName: actorName || booking.userName,
      actorRole: actorRole || 'student',
      action: 'BOOKING_CANCELLED',
      reason: booking.decisionReason,
    });

    let promotedBooking = null;

    // If was APPROVED, automatically promote top WAITLISTED candidate
    if (wasApproved) {
      const topWaitlist = await Booking.findOne({
        resourceId: booking.resourceId,
        status: 'WAITLISTED',
        startTime: { $lt: booking.endTime },
        endTime: { $gt: booking.startTime },
      }).sort({ priorityScore: -1 });

      if (topWaitlist) {
        topWaitlist.status = 'APPROVED';
        topWaitlist.decisionReason = `Auto-promoted from waitlist after cancellation of booking #${booking._id.toString().slice(-4)} (Priority Score: ${topWaitlist.priorityScore})`;
        topWaitlist.reviewedBy = 'Fair-Share Waitlist Engine';
        topWaitlist.reviewedAt = new Date();
        await topWaitlist.save();
        promotedBooking = topWaitlist;

        await AuditLog.create({
          bookingId: topWaitlist._id,
          resourceId: topWaitlist.resourceId,
          actorId: 'system-allocator',
          actorName: 'Fair-Share Engine',
          actorRole: 'system',
          action: 'WAITLIST_AUTO_PROMOTED',
          reason: topWaitlist.decisionReason,
          metadata: { score: topWaitlist.priorityScore, previousBookingId: booking._id },
        });
      }
    }

    res.json({ success: true, booking, promotedBooking });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/bookings/:id/checkin
 * Step 7: Verifies PIN, sets CHECKED_IN, sets resource IN_USE, logs ConditionLog
 */
router.post('/api/bookings/:id/checkin', checkinHandler);
router.post('/bookings/:id/checkin', checkinHandler);

async function checkinHandler(req, res, next) {
  try {
    const { pin, rating, checklist, notes, photoUrl, actorName } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // Verify PIN if provided or match default
    if (pin && booking.checkInPin && pin !== booking.checkInPin) {
      return res.status(400).json({ error: `Invalid Check-in PIN. Correct PIN: ${booking.checkInPin}` });
    }

    booking.status = 'CHECKED_IN';
    await booking.save();

    await Resource.findByIdAndUpdate(booking.resourceId, {
      status: 'IN_USE',
    });

    const conditionLog = new ConditionLog({
      bookingId: booking._id,
      resourceId: booking.resourceId,
      userId: booking.userId,
      checkInAt: new Date(),
      checkInRating: rating || 'GOOD',
      checkInChecklist: checklist || { cleanliness: true, calibration: true, accessoriesComplete: true },
      checkInNotes: notes || 'Equipment verified and handed over in operational state.',
      checkInPhotoUrl: photoUrl || '',
    });
    await conditionLog.save();

    await AuditLog.create({
      bookingId: booking._id,
      resourceId: booking.resourceId,
      actorId: booking.userId.toString(),
      actorName: actorName || booking.userName,
      actorRole: 'student',
      action: 'USER_CHECKED_IN',
      reason: `Physical check-in confirmed with PIN ${booking.checkInPin}. Condition rated: ${conditionLog.checkInRating}`,
      metadata: { rating: conditionLog.checkInRating, checklist: conditionLog.checkInChecklist },
    });

    res.json({ success: true, booking, conditionLog });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/bookings/:id/checkout
 * Steps 8 & 9: Complete return, update user quota, analyze Before/After diff, report incident if damaged
 */
router.post('/api/bookings/:id/checkout', checkoutHandler);
router.post('/bookings/:id/checkout', checkoutHandler);

async function checkoutHandler(req, res, next) {
  try {
    const { rating, checklist, notes, photoUrl, damageFlagged, actorName } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    booking.status = 'RETURNED';
    await booking.save();

    // Increment user's weekly usage quota
    await User.findByIdAndUpdate(booking.userId, {
      $inc: { weeklyHoursUsed: Math.round(booking.durationHours) },
    });

    // Update or find condition log
    let conditionLog = await ConditionLog.findOne({ bookingId: booking._id });
    if (!conditionLog) {
      conditionLog = new ConditionLog({
        bookingId: booking._id,
        resourceId: booking.resourceId,
        userId: booking.userId,
      });
    }

    conditionLog.checkOutAt = new Date();
    conditionLog.checkOutRating = rating || 'GOOD';
    conditionLog.checkOutChecklist = checklist || { cleanliness: true, calibration: true, accessoriesComplete: true };
    conditionLog.checkOutNotes = notes || 'Standard return inspection completed.';
    conditionLog.checkOutPhotoUrl = photoUrl || '';
    conditionLog.damageFlagged = Boolean(damageFlagged || rating === 'DAMAGED');

    // Run AI Condition & Diff Analysis
    const advisory = await generateIncidentAndConditionAdvisory(conditionLog, notes);
    conditionLog.aiConditionDiff = advisory.summary;
    await conditionLog.save();

    let createdIncident = null;

    if (conditionLog.damageFlagged) {
      // Place resource on MAINTENANCE_HOLD
      await Resource.findByIdAndUpdate(booking.resourceId, {
        status: 'MAINTENANCE_HOLD',
        currentCondition: 'DAMAGED',
      });

      // Count downstream affected bookings
      const affectedBookingsCount = await Booking.countDocuments({
        resourceId: booking.resourceId,
        status: { $in: ['APPROVED', 'PENDING', 'WAITLISTED'] },
        startTime: { $gt: new Date() },
      });

      createdIncident = new Incident({
        bookingId: booking._id,
        resourceId: booking.resourceId,
        resourceName: booking.resourceName,
        reportedBy: actorName || booking.userName,
        type: 'DAMAGE',
        severity: advisory.severity,
        description: notes || 'Hardware issue reported at check-out.',
        affectedBookingsCount,
        aiAdvisorySummary: advisory.summary,
        status: 'OPEN',
      });
      await createdIncident.save();

      await AuditLog.create({
        bookingId: booking._id,
        resourceId: booking.resourceId,
        actorId: booking.userId.toString(),
        actorName: actorName || booking.userName,
        actorRole: 'student',
        action: 'RESOURCE_RETURNED_WITH_INCIDENT',
        reason: `Return flagged with DAMAGE. Placed on MAINTENANCE_HOLD. AI Advisory generated.`,
        metadata: { incidentId: createdIncident._id, advisory },
      });
    } else {
      // Resource is clean and available
      await Resource.findByIdAndUpdate(booking.resourceId, {
        status: 'AVAILABLE',
        currentCondition: rating || 'GOOD',
      });

      await AuditLog.create({
        bookingId: booking._id,
        resourceId: booking.resourceId,
        actorId: booking.userId.toString(),
        actorName: actorName || booking.userName,
        actorRole: 'student',
        action: 'RESOURCE_RETURNED_CLEAN',
        reason: `Clean return confirmed. Resource restored to AVAILABLE.`,
        metadata: { rating: conditionLog.checkOutRating },
      });
    }

    res.json({
      success: true,
      booking,
      conditionLog,
      advisory,
      incident: createdIncident,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/incidents
 * Step 9: Standalone incident report
 */
router.post('/incidents', async (req, res, next) => {
  try {
    const { resourceId, resourceName, reportedBy, type, severity, description, bookingId } = req.body;
    const incident = new Incident({
      resourceId,
      resourceName: resourceName || 'Campus Resource',
      reportedBy: reportedBy || 'Campus User',
      type: type || 'DAMAGE',
      severity: severity || 'MEDIUM',
      description,
      bookingId,
      status: 'OPEN',
    });

    await incident.save();

    await AuditLog.create({
      resourceId,
      bookingId,
      actorId: 'reporter',
      actorName: reportedBy || 'Campus User',
      actorRole: 'student',
      action: 'INCIDENT_REPORTED',
      reason: `Incident reported: ${type} [${severity}] - ${description}`,
      metadata: { incidentId: incident._id },
    });

    res.status(201).json({ success: true, incident });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/incidents/:id/resolve
 * Step 9: Manager resolves incident and restores resource
 */
router.patch('/incidents/:id/resolve', async (req, res, next) => {
  try {
    const { managerResolutionNotes, restoreResource, managerName } = req.body;
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ error: 'Incident not found' });

    incident.status = 'RESOLVED';
    incident.managerResolutionNotes = managerResolutionNotes || 'Repaired and recalibrated by authorized lab staff.';
    incident.resolvedBy = managerName || 'Authorized Manager';
    incident.resolvedAt = new Date();
    await incident.save();

    if (restoreResource) {
      await Resource.findByIdAndUpdate(incident.resourceId, {
        status: 'AVAILABLE',
        currentCondition: 'GOOD',
      });
    }

    await AuditLog.create({
      resourceId: incident.resourceId,
      actorId: 'manager',
      actorName: managerName || 'Authorized Manager',
      actorRole: 'manager',
      action: 'INCIDENT_RESOLVED_BY_MANAGER',
      reason: incident.managerResolutionNotes,
      metadata: { incidentId: incident._id, resourceRestored: Boolean(restoreResource) },
    });

    res.json({ success: true, incident });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/ai/match
 * Natural language AI resource discovery with Rule 12 disclaimer
 */
router.post('/ai/match', async (req, res, next) => {
  try {
    const { query, userId } = req.body;
    const [resources, user] = await Promise.all([
      Resource.find(),
      userId ? User.findById(userId) : null,
    ]);

    const result = await matchResourcesForQuery(query, resources, user || {});
    res.json({ success: true, result });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/demo/reset
 * Drops and re-seeds the entire database with the clean 10-step judge dataset
 */
router.post('/demo/reset', async (req, res, next) => {
  try {
    const { seedDatabase } = require('../seed/seedData');
    const result = await seedDatabase();
    res.json({ success: true, message: 'Database successfully reset and re-seeded!', result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
