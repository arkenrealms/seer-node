// src/test/mongo.pkConfig.spec.ts

import { Document, Types } from 'mongoose';
import { createModel, ClusterModel } from '@arken/node/util/mongo';
import { connectTestMongo, disconnectTestMongo, clearTestMongo } from './mongoTestEnv';

interface PkConfigDoc extends Document {
  applicationId: Types.ObjectId;
  tokenId: number;
  slug: string;
  alias: string;
}

let connected = false;

describe('mongo.ts – pkFields & keyFields config', () => {
  const appId = new Types.ObjectId();

  const PkConfigModel = createModel<PkConfigDoc>(
    'PkConfigItem',
    {
      tokenId: { type: Number, required: true },
      slug: { type: String, required: true },
      alias: { type: String, required: true },
    } as any,
    {
      extend: 'EntityFields',
      pkFields: ['tokenId'],
      keyFields: ['slug', 'alias'],
    }
  );

  beforeAll(async () => {
    await connectTestMongo('pkconfig');
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
    PkConfigModel.filters.applicationId = appId;
  });

  it('uses pkFields and keyFields when building cluster pk and keys', async () => {
    const created = await PkConfigModel.create({
      tokenId: 42,
      slug: 'wrath-sword',
      alias: 'sword-of-wrath',
    } as any);

    expect(created).toBeDefined();

    const clusters = await ClusterModel.find({
      kind: 'PkConfigItem',
      applicationId: appId,
    })
      .lean()
      .exec();

    expect(clusters.length).toBe(1);
    const c: any = clusters[0];

    // pk should only contain tokenId with numeric type
    expect(Array.isArray(c.pk)).toBe(true);
    expect(c.pk.length).toBe(1);
    expect(c.pk[0].field).toBe('tokenId');
    expect(c.pk[0].type).toBe('number');
    expect(c.pk[0].n).toBe(42);

    // keys should come from slug & alias (no default name/key)
    const keys = c.keys.sort();
    expect(keys).toEqual(['sword-of-wrath', 'wrath-sword'].sort());
  });
});
