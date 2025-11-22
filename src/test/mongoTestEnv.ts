// src/test/mongoTestEnv.ts
import mongoose from 'mongoose';

const DEFAULT_URI =
  process.env.TEST_MONGO_URI ??
  'mongodb://barracks.fold-yo.ts.net:27017/seer-node-test?tls=false&directConnection=true';

export async function connectTestMongo(dbNameSuffix: string) {
  const uri = DEFAULT_URI;

  // Use dbName suffix so each suite can have its own DB if you want
  const dbName = `seer_node_${dbNameSuffix}`;

  await mongoose.connect(uri, {
    dbName,
  });
}

export async function disconnectTestMongo() {
  await mongoose.disconnect();
}

export async function clearTestMongo() {
  // Drop current database
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
}
