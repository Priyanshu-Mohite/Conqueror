const mongoose = require('mongoose');
const { User, Resource, Booking, ConditionLog, Incident, AuditLog } = require('../models');

async function seedDatabase() {
  console.log('[Seed Engine] Clearing existing collections for pristine 10-step demo...');
  await Promise.all([
    User.deleteMany({}),
    Resource.deleteMany({}),
    Booking.deleteMany({}),
    ConditionLog.deleteMany({}),
    Incident.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  console.log('[Seed Engine] Seeding 4 distinct judge personas...');
  const users = await User.create([
    {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@campus.edu',
      role: 'student',
      department: 'Robotics & Mechatronics',
      verified: true,
      badges: ['MAKER_BASIC', 'LASER_SAFETY', '3D_PRINT_PRO'],
      weeklyQuotaHours: 8,
      weeklyHoursUsed: 2,
      lateReturnsCount: 0,
      trustScore: 98,
    },
    {
      name: 'Priya Nair',
      email: 'priya.nair@campus.edu',
      role: 'researcher',
      department: 'Material Science & Advanced Nano Lab',
      verified: true,
      badges: ['MAKER_BASIC', 'LASER_SAFETY', 'CNC_LEVEL_1', 'HIGH_VOLTAGE_CERT'],
      weeklyQuotaHours: 8,
      weeklyHoursUsed: 7,
      lateReturnsCount: 1,
      trustScore: 85,
    },
    {
      name: 'Dr. Vikram Mehta',
      email: 'vikram.mehta@campus.edu',
      role: 'manager',
      department: 'Central Makerspace & Precision Engineering',
      verified: true,
      badges: [
        'MAKER_BASIC',
        'LASER_SAFETY',
        'CNC_LEVEL_1',
        'HIGH_VOLTAGE_CERT',
        '3D_PRINT_PRO',
        'MEDIA_CERT',
        'STAFF_SUPERVISOR',
      ],
      weeklyQuotaHours: 40,
      weeklyHoursUsed: 0,
      trustScore: 100,
    },
    {
      name: 'Ananya Desai',
      email: 'ananya.desai@campus.edu',
      role: 'admin',
      department: 'Campus Operations & Audit Compliance',
      verified: true,
      badges: ['ADMIN_FULL_ACCESS'],
      weeklyQuotaHours: 40,
      weeklyHoursUsed: 0,
      trustScore: 100,
    },
  ]);

  const [aarav, priya, drMehta, ananya] = users;

  console.log('[Seed Engine] Seeding 6 realistic campus resources across 3 risk tiers...');
  const resources = await Resource.create([
    {
      name: 'Prusa Pro SLS 3D Printer',
      code: 'FAB-3D-01',
      category: 'Fabrication',
      location: 'Makerspace Bay A',
      ownerId: drMehta._id,
      ownerName: drMehta.name,
      riskTier: 2,
      requiredBadges: ['3D_PRINT_PRO'],
      requiresSupervision: false,
      securityDeposit: 0,
      maxHoursPerBooking: 3,
      maxWeeklyHoursPerUser: 6,
      usageRules: 'Nylon PA12 powder loading requires pre-cleaning and HEPA filter verification.',
      status: 'AVAILABLE',
      currentCondition: 'MINT',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: '5-Axis Haas Desktop CNC Mill',
      code: 'FAB-CNC-05',
      category: 'Fabrication',
      location: 'Precision Fab Lab 102',
      ownerId: drMehta._id,
      ownerName: drMehta.name,
      riskTier: 3,
      requiredBadges: ['CNC_LEVEL_1'],
      requiresSupervision: true,
      securityDeposit: 1500,
      maxHoursPerBooking: 2,
      maxWeeklyHoursPerUser: 4,
      usageRules: 'G-Code dry run simulation mandatory with Lab Technician present before spindle power-up.',
      status: 'AVAILABLE',
      currentCondition: 'GOOD',
      imageUrl: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Sony FX3 4K Cinema Production Kit',
      code: 'MED-FX3-09',
      category: 'Media Gear',
      location: 'Media Center Locker 4',
      ownerId: drMehta._id,
      ownerName: drMehta.name,
      riskTier: 2,
      requiredBadges: ['MEDIA_CERT'],
      requiresSupervision: false,
      securityDeposit: 2000,
      maxHoursPerBooking: 4,
      maxWeeklyHoursPerUser: 8,
      usageRules: 'Includes 24-70mm GM lens, 2x V-Mount batteries, and Pelican flight case. Sensor inspection required at check-in.',
      status: 'AVAILABLE',
      currentCondition: 'MINT',
      imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Tektronix Mixed-Domain Oscilloscope & HV Bench',
      code: 'LAB-OSC-22',
      category: 'Lab Equipment',
      location: 'Electrical Testing Lab 204',
      ownerId: drMehta._id,
      ownerName: drMehta.name,
      riskTier: 3,
      requiredBadges: ['HIGH_VOLTAGE_CERT'],
      requiresSupervision: false,
      securityDeposit: 0,
      maxHoursPerBooking: 3,
      maxWeeklyHoursPerUser: 6,
      usageRules: 'Earth ground straps must be clipped. Maximum rated input 500V RMS.',
      status: 'IN_USE', // Set to IN_USE because Aarav is currently checked-in
      currentCondition: 'GOOD',
      imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Epilog 60W CO2 Laser Cutter',
      code: 'FAB-LSR-02',
      category: 'Fabrication',
      location: 'Makerspace Bay B',
      ownerId: drMehta._id,
      ownerName: drMehta.name,
      riskTier: 2,
      requiredBadges: ['LASER_SAFETY'],
      requiresSupervision: false,
      securityDeposit: 0,
      maxHoursPerBooking: 2,
      maxWeeklyHoursPerUser: 5,
      usageRules: 'Exhaust blower must be running. No PVC, vinyl, or treated synthetic composites allowed.',
      status: 'AVAILABLE',
      currentCondition: 'GOOD',
      imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Innovation Pitch & Seminar Pod B',
      code: 'SPC-POD-02',
      category: 'Space',
      location: 'Main Innovation Hub (Level 2)',
      ownerId: drMehta._id,
      ownerName: drMehta.name,
      riskTier: 1,
      requiredBadges: ['MAKER_BASIC'],
      requiresSupervision: false,
      securityDeposit: 0,
      maxHoursPerBooking: 4,
      maxWeeklyHoursPerUser: 10,
      usageRules: 'Equipped with 75-inch 4K conference display and whiteboards. Leave table sanitized.',
      status: 'AVAILABLE',
      currentCondition: 'GOOD',
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
    },
  ]);

  const [prusaPrinter, cncMill, sonyCamera, oscilloscope, laserCutter, seminarPod] = resources;

  // Base timestamps for realistic demo timelines
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowSlotStart = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 0, 0);
  const tomorrowSlotEnd = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 16, 0, 0);

  console.log('[Seed Engine] Seeding 5 bookings across all 10 lifecycle stages...');

  // 1. Competing Requests for Step 5 (Manager Queue)
  // Request A1: Aarav Sharma (High Priority: 90)
  const bookingA1 = await Booking.create({
    resourceId: laserCutter._id,
    resourceName: laserCutter.name,
    userId: aarav._id,
    userName: aarav.name,
    userDepartment: aarav.department,
    startTime: tomorrowSlotStart,
    endTime: tomorrowSlotEnd,
    durationHours: 2,
    purpose: 'Precision chassis acrylic cut for autonomous rover competition',
    projectType: 'CapStone',
    status: 'PENDING',
    verificationSummary: {
      hasRequiredBadges: true,
      missingBadges: [],
      withinQuota: true,
      hasConflict: true, // Competing with Priya
      passedAll: false,
    },
    priorityScore: 90,
    priorityBreakdown: 'Base 100 - 20 (2h used this week) + 10 (CapStone Priority) = 90 pts',
  });

  // Request A2: Priya Nair (Low Priority: 15 due to heavy usage & 1 late return)
  const bookingA2 = await Booking.create({
    resourceId: laserCutter._id,
    resourceName: laserCutter.name,
    userId: priya._id,
    userName: priya.name,
    userDepartment: priya.department,
    startTime: tomorrowSlotStart,
    endTime: tomorrowSlotEnd,
    durationHours: 2,
    purpose: 'Custom microfluidics substrate engraving test',
    projectType: 'Research',
    status: 'PENDING',
    verificationSummary: {
      hasRequiredBadges: true,
      missingBadges: [],
      withinQuota: false, // 7h + 2h = 9h > 5h max weekly
      hasConflict: true,
      passedAll: false,
    },
    priorityScore: 15,
    priorityBreakdown: 'Base 100 - 70 (7h used this week) - 25 (1 late return) + 10 (Research Priority) = 15 pts',
  });

  // 2. Booking B (Step 7: Approved & Ready for Check-In)
  const bookingB = await Booking.create({
    resourceId: prusaPrinter._id,
    resourceName: prusaPrinter.name,
    userId: aarav._id,
    userName: aarav.name,
    userDepartment: aarav.department,
    startTime: new Date(now.getTime() + 1 * 60 * 60 * 1000),
    endTime: new Date(now.getTime() + 3 * 60 * 60 * 1000),
    durationHours: 2,
    purpose: 'High-strength nylon planetary gearbox for Mars rover arm',
    projectType: 'Research',
    status: 'APPROVED',
    verificationSummary: {
      hasRequiredBadges: true,
      missingBadges: [],
      withinQuota: true,
      hasConflict: false,
      passedAll: true,
    },
    priorityScore: 90,
    priorityBreakdown: 'Base 100 - 20 (2h used this week) + 10 (Research Priority) = 90 pts',
    decisionReason: 'Verified 3D_PRINT_PRO credential. Valid project proposal and adequate fair-usage balance.',
    reviewedBy: drMehta.name,
    reviewedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    checkInPin: '4829', // Standard 4-digit PIN for instant testing
  });

  // 3. Booking C (Step 8: Checked-In & Ready for Return / Damage Inspection)
  const bookingC = await Booking.create({
    resourceId: oscilloscope._id,
    resourceName: oscilloscope.name,
    userId: aarav._id,
    userName: aarav.name,
    userDepartment: aarav.department,
    startTime: new Date(now.getTime() - 90 * 60 * 1000),
    endTime: new Date(now.getTime() + 30 * 60 * 1000),
    durationHours: 2,
    purpose: 'BLDC motor inverter PWM noise analysis and spike capture',
    projectType: 'Academic',
    status: 'CHECKED_IN',
    verificationSummary: {
      hasRequiredBadges: true,
      missingBadges: [],
      withinQuota: true,
      hasConflict: false,
      passedAll: true,
    },
    priorityScore: 80,
    priorityBreakdown: 'Base 100 - 20 (2h used this week) = 80 pts',
    decisionReason: 'Approved by Lab Manager.',
    reviewedBy: drMehta.name,
    reviewedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
    checkInPin: '3104',
  });

  // Seed "Before" condition log for Booking C
  await ConditionLog.create({
    bookingId: bookingC._id,
    resourceId: oscilloscope._id,
    userId: aarav._id,
    checkInAt: new Date(now.getTime() - 85 * 60 * 1000),
    checkInRating: 'GOOD',
    checkInChecklist: {
      cleanliness: true,
      calibration: true,
      accessoriesComplete: true,
    },
    checkInNotes: 'Probes 1 & 2 calibrated to 1kHz reference square wave. Chassis ground secure.',
    checkInPhotoUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80',
  });

  // 4. Booking D (Step 6: Waitlisted behind approved slot for Auto-Promotion Demo)
  // Let's create an approved booking for Priya, and Aarav is WAITLISTED behind her
  const bookingD_Approved = await Booking.create({
    resourceId: cncMill._id,
    resourceName: cncMill.name,
    userId: priya._id,
    userName: priya.name,
    userDepartment: priya.department,
    startTime: new Date(now.getTime() + 5 * 60 * 60 * 1000),
    endTime: new Date(now.getTime() + 7 * 60 * 60 * 1000),
    durationHours: 2,
    purpose: 'Titanium micro-cantilever surface test fixture',
    projectType: 'Research',
    status: 'APPROVED',
    verificationSummary: {
      hasRequiredBadges: true,
      missingBadges: [],
      withinQuota: true,
      hasConflict: false,
      passedAll: true,
    },
    priorityScore: 85,
    priorityBreakdown: 'Supervised research slot allocated',
    decisionReason: 'Approved under researcher quota.',
    reviewedBy: drMehta.name,
    reviewedAt: new Date(now.getTime() - 10 * 60 * 1000),
    checkInPin: '7721',
  });

  const bookingD = await Booking.create({
    resourceId: cncMill._id,
    resourceName: cncMill.name,
    userId: aarav._id,
    userName: aarav.name,
    userDepartment: aarav.department,
    startTime: new Date(now.getTime() + 5 * 60 * 60 * 1000),
    endTime: new Date(now.getTime() + 7 * 60 * 60 * 1000),
    durationHours: 2,
    purpose: 'Aluminum motor mount plate milling',
    projectType: 'CapStone',
    status: 'WAITLISTED',
    verificationSummary: {
      hasRequiredBadges: true,
      missingBadges: [],
      withinQuota: true,
      hasConflict: true,
      passedAll: false,
    },
    priorityScore: 90,
    priorityBreakdown: 'Base 100 - 20 + 10 = 90 pts (Waitlist Rank #1)',
    decisionReason: `Placed on Priority Waitlist behind Booking #${bookingD_Approved._id.toString().slice(-4)}. Eligible for instant auto-promotion if cancelled!`,
    reviewedBy: 'Fair-Share Engine',
    reviewedAt: new Date(now.getTime() - 5 * 60 * 1000),
  });

  // 5. Booking E (Step 10: Full Completed Lifecycle with Audit Trail)
  const bookingE = await Booking.create({
    resourceId: seminarPod._id,
    resourceName: seminarPod.name,
    userId: aarav._id,
    userName: aarav.name,
    userDepartment: aarav.department,
    startTime: new Date(now.getTime() - 26 * 60 * 60 * 1000),
    endTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    durationHours: 2,
    purpose: 'Robotics Club Semester Design Review and Demo Pitch',
    projectType: 'Community',
    status: 'RETURNED',
    verificationSummary: {
      hasRequiredBadges: true,
      missingBadges: [],
      withinQuota: true,
      hasConflict: false,
      passedAll: true,
    },
    priorityScore: 95,
    decisionReason: 'Auto-approved for low-risk collaboration space.',
    reviewedBy: 'System Auto-Allocator',
    reviewedAt: new Date(now.getTime() - 28 * 60 * 60 * 1000),
    checkInPin: '1190',
  });

  // Completed ConditionLog for Booking E
  await ConditionLog.create({
    bookingId: bookingE._id,
    resourceId: seminarPod._id,
    userId: aarav._id,
    checkInAt: new Date(now.getTime() - 26 * 60 * 60 * 1000),
    checkInRating: 'GOOD',
    checkInChecklist: { cleanliness: true, calibration: true, accessoriesComplete: true },
    checkInNotes: 'Room cleaned, HDMI cables and markers present.',
    checkOutAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    checkOutRating: 'GOOD',
    checkOutChecklist: { cleanliness: true, calibration: true, accessoriesComplete: true },
    checkOutNotes: 'Whiteboard wiped clean, presentation display switched off.',
    damageFlagged: false,
    aiConditionDiff: 'Room returned in clean condition. No irregularities detected.',
  });

  console.log('[Seed Engine] Seeding chronological Audit Trail ledger...');
  const auditEntries = [
    {
      bookingId: bookingE._id,
      resourceId: seminarPod._id,
      actorId: aarav._id.toString(),
      actorName: aarav.name,
      actorRole: 'student',
      action: 'BOOKING_REQUESTED',
      reason: 'Requested Innovation Pitch & Seminar Pod B for Robotics Club Demo Pitch',
      metadata: { priorityScore: 95 },
      createdAt: new Date(now.getTime() - 30 * 60 * 60 * 1000),
    },
    {
      bookingId: bookingE._id,
      resourceId: seminarPod._id,
      actorId: 'system-allocator',
      actorName: 'Fair-Share Engine',
      actorRole: 'system',
      action: 'ELIGIBILITY_VERIFIED',
      reason: 'Automated pre-check passed: Badges verified, within quota, no schedule collision',
      metadata: { passedAll: true },
      createdAt: new Date(now.getTime() - 29 * 60 * 60 * 1000),
    },
    {
      bookingId: bookingE._id,
      resourceId: seminarPod._id,
      actorId: drMehta._id.toString(),
      actorName: drMehta.name,
      actorRole: 'manager',
      action: 'BOOKING_APPROVED',
      reason: 'Auto-approved for low-risk collaboration space.',
      createdAt: new Date(now.getTime() - 28 * 60 * 60 * 1000),
    },
    {
      bookingId: bookingE._id,
      resourceId: seminarPod._id,
      actorId: aarav._id.toString(),
      actorName: aarav.name,
      actorRole: 'student',
      action: 'USER_CHECKED_IN',
      reason: 'Physical check-in confirmed with PIN 1190. Condition rated: GOOD',
      createdAt: new Date(now.getTime() - 26 * 60 * 60 * 1000),
    },
    {
      bookingId: bookingE._id,
      resourceId: seminarPod._id,
      actorId: aarav._id.toString(),
      actorName: aarav.name,
      actorRole: 'student',
      action: 'RETURNED',
      reason: 'Clean return inspection completed. Resource restored to AVAILABLE.',
      metadata: { rating: 'GOOD' },
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    },
    {
      bookingId: bookingA1._id,
      resourceId: laserCutter._id,
      actorId: aarav._id.toString(),
      actorName: aarav.name,
      actorRole: 'student',
      action: 'BOOKING_REQUESTED',
      reason: 'Requested Epilog 60W CO2 Laser Cutter for CapStone chassis cut',
      metadata: { priorityScore: 90 },
      createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
    },
    {
      bookingId: bookingA2._id,
      resourceId: laserCutter._id,
      actorId: priya._id.toString(),
      actorName: priya.name,
      actorRole: 'researcher',
      action: 'BOOKING_REQUESTED',
      reason: 'Requested Epilog 60W CO2 Laser Cutter for microfluidics research',
      metadata: { priorityScore: 15 },
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
    },
    {
      bookingId: bookingB._id,
      resourceId: prusaPrinter._id,
      actorId: drMehta._id.toString(),
      actorName: drMehta.name,
      actorRole: 'manager',
      action: 'BOOKING_APPROVED',
      reason: 'Verified 3D_PRINT_PRO credential. Valid proposal.',
      metadata: { priorityScore: 90, pinGenerated: '4829' },
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
  ];

  await AuditLog.insertMany(auditEntries);

  console.log('[Seed Engine] Demo database populated successfully!');
  return {
    usersCount: users.length,
    resourcesCount: resources.length,
    bookingsCount: 6,
    auditLogsCount: auditEntries.length,
  };
}

module.exports = { seedDatabase };
