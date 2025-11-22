// src/test/mongo.saveQueued.spec.ts

import mongoose, { Schema } from 'mongoose';
import { ObjectId } from 'mongodb';

import { createModel } from '@arken/node/util/mongo';
import { connectTestMongo, disconnectTestMongo, clearTestMongo } from './mongoTestEnv';

type AnyDoc = any;

describe('mongo.ts – saveQueued sequencing', () => {
  const ModelWithQueue = createModel<AnyDoc>(
    'QueueTestEntity',
    {
      value: { type: Number, required: true },
    },
    {
      extend: 'EntityFields',
    }
  );

  beforeAll(async () => {
    await connectTestMongo('savequeued');
  });

  afterAll(async () => {
    await disconnectTestMongo();
  });

  beforeEach(async () => {
    await clearTestMongo();
    ModelWithQueue.filters.applicationId = undefined;
  });

  it('saveQueued exists and can save a doc', async () => {
    const appId = new ObjectId();

    const doc = await ModelWithQueue.create({
      value: 1,
      applicationId: appId,
    });

    doc.value = 2;

    const saved = await ModelWithQueue.saveQueued(doc);
    expect(saved.value).toBe(2);

    const reloaded: any = await ModelWithQueue.findById(doc._id).lean().exec();
    expect(reloaded.value).toBe(2);
  });

  it('multiple saveQueued calls on the same doc do not throw and persist final state', async () => {
    const appId = new ObjectId();

    const doc = await ModelWithQueue.create({
      value: 0,
      applicationId: appId,
    });

    doc.value = 1;
    const p1 = ModelWithQueue.saveQueued(doc);

    doc.value = 2;
    const p2 = ModelWithQueue.saveQueued(doc);

    doc.value = 3;
    const p3 = ModelWithQueue.saveQueued(doc);

    await Promise.all([p1, p2, p3]);

    const reloaded: any = await ModelWithQueue.findById(doc._id).lean().exec();
    expect(reloaded.value).toBe(3);
  });
});
