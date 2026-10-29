const { connectDB, disconnectDB } = require('../config/db');
const { seedDatabase } = require('../seed/seedData');
const { User, Resource, Booking, AuditLog, ConditionLog } = require('../models');

async function testPhase4() {
  try {
    console.log('[Test Phase 4] Connecting to DB...');
    await connectDB();

    console.log('[Test Phase 4] Executing Seed Script...');
    const seedResult = await seedDatabase();
    console.log('[Test Phase 4] Seed Result:', seedResult);

    const users = await User.find();
    const resources = await Resource.find();
    const bookings = await Booking.find();
    const conditionLogs = await ConditionLog.find();
    const auditLogs = await AuditLog.find();

    console.log(`[Verification Report] Users: ${users.length} (Expected: 4)`);
    console.log(`[Verification Report] Resources: ${resources.length} (Expected: 6)`);
    console.log(`[Verification Report] Bookings: ${bookings.length} (Expected >= 5)`);
    console.log(`[Verification Report] Condition Logs: ${conditionLogs.length}`);
    console.log(`[Verification Report] Audit Logs: ${auditLogs.length}`);

    if (users.length === 4 && resources.length === 6 && bookings.length >= 5) {
      console.log('PHASE 4 VERIFICATION: SUCCESS');
    } else {
      console.error('PHASE 4 VERIFICATION: FAILED - Counts do not match expected');
      process.exitCode = 1;
    }

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[Test Phase 4] Failed:', err);
    process.exit(1);
  }
}

testPhase4();
