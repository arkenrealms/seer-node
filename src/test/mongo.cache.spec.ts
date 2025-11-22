// src/test/mongo.cache.spec.ts

import mongoose, { Document, Types } from 'mongoose';
import { createModel } from '@arken/node/util/mongo';
import { connectTestMongo, disconnectTestMongo, clearTestMongo } from './mongoTestEnv';

interface CacheEntityDoc extends Document {
  applicationId: Types.ObjectId;
  foo: string;
}

let connected = false;

describe('mongo.ts – cache behavior on create()', () => {
  const appId = new Types.ObjectId();

  const CacheEntity = createModel<CacheEntityDoc>(
    'CacheEntity',
    {
      foo: { type: String, required: true },
    } as any,
    {
      cache: { enabled: true, ttlMs: 60_000 },
    }
  );

  beforeAll(async () => {
    await connectTestMongo('cache');
    connected = true;
  });

  afterAll(async () => {
    if (connected) {
      await disconnectTestMongo();
    }
  });

  beforeEach(async () => {
    if (connected) {
      await clearTestMongo();
    }
    CacheEntity.filters.applicationId = appId;

    // clear internal cache map between tests
    const internalCache = (CacheEntity as any).cache as Map<string, { doc: CacheEntityDoc; fetchedAt: number }>;
    if (internalCache && typeof internalCache.clear === 'function') {
      internalCache.clear();
    }
  });

  it('seeds internal cache map when creating a doc', async () => {
    const created = (await CacheEntity.create({
      foo: 'cached',
    } as any)) as CacheEntityDoc;

    const internalCache = (CacheEntity as any).cache as Map<string, { doc: CacheEntityDoc; fetchedAt: number }>;

    expect(internalCache).toBeDefined();
    expect(internalCache.size).toBe(1);

    const keys = Array.from(internalCache.keys());
    expect(keys.length).toBe(1);

    const key = keys[0];
    // key format: `${appKey}:${idStr}`
    expect(key.endsWith(created._id.toString())).toBe(true);

    const entry = internalCache.get(key)!;
    expect(entry.doc._id.toString()).toBe(created._id.toString());
    expect(typeof entry.fetchedAt).toBe('number');
  });
});
