const mongoose = require('mongoose');

let mongodInstance = null;

/**
 * Connect to MongoDB with multi-tier fallback:
 * 1. process.env.MONGODB_URI (e.g. Atlas or explicit URI)
 * 2. Local MongoDB daemon (mongodb://127.0.0.1:27017/campusvault)
 * 3. Automatic in-memory MongoDB instance (mongodb-memory-server)
 */
async function connectDB() {
  const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusvault';

  try {
    console.log(`[Database] Attempting connection to MongoDB at: ${primaryUri}`);
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Successfully connected to MongoDB: ${mongoose.connection.host}`);
    return mongoose.connection;
  } catch (primaryErr) {
    console.warn(`[Database] Primary MongoDB connection failed (${primaryErr.message}).`);
    console.log(`[Database] Initializing automatic in-memory MongoDB fallback...`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const inMemoryUri = mongodInstance.getUri();
      
      await mongoose.connect(inMemoryUri);
      console.log(`[Database] Connected to in-memory MongoDB at: ${inMemoryUri}`);
      console.log(`[Database] Zero-config in-memory database is active! All models & operations are live.`);
      return mongoose.connection;
    } catch (fallbackErr) {
      console.error(`[Database] In-memory MongoDB initialization failed:`, fallbackErr);
      throw fallbackErr;
    }
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
}

module.exports = { connectDB, disconnectDB };
