// src/test/mongo.upsert.spec.ts

import { Document, Types } from 'mongoose';
import { createModel } from '@arken/node/util/mongo';
import { connectTestMongo, disconnectTestMongo, clearTestMongo } from './mongoTestEnv';

interface UpsertDoc extends Document {
  applicationId: Types.ObjectId;
  foo: string;
  value?: number;
}

let connected = false;

describe('mongo.ts – upsert()', () => {
  const appId = new Types.ObjectId();

  const UpsertModel = createModel<UpsertDoc>(
    'UpsertEntity',
    {
      foo: { type: String, required: true },
      value: { type: Number, default: 0 },
    } as any,
    {
      extend: 'EntityFields',
    }
  );

  beforeAll(async () => {
    await connectTestMongo('upsert');
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
    UpsertModel.filters.applicationId = appId;
  });

  it('creates a new document when no existing match (create branch)', async () => {
    const created = (await UpsertModel.upsert(
      { foo: 'new' } as any,
      { foo: 'new', value: 1 } as any,
      { $set: { value: 2 } } as any
    )) as UpsertDoc;

    expect(created).toBeDefined();
    expect(created.foo).toBe('new');
    // create branch should use the "create" payload, not the update
    expect(created.value).toBe(1);
    expect(created.applicationId.toString()).toBe(appId.toString());

    const all = await UpsertModel.find().lean().exec();
    expect(all.length).toBe(1);
    expect((all[0] as any).foo).toBe('new');
    expect((all[0] as any).value).toBe(1);
    expect((all[0] as any).applicationId.toString()).toBe(appId.toString());
  });

  it('updates existing document when match is found (update branch)', async () => {
    // Seed existing doc
    const existing = (await UpsertModel.create({
      foo: 'exists',
      value: 5,
    } as any)) as UpsertDoc;

    const updated = (await UpsertModel.upsert(
      { foo: 'exists' } as any,
      { foo: 'ignored', value: 1 } as any,
      { $set: { value: 9 } } as any
    )) as UpsertDoc;

    // Still only one doc in DB
    const all = await UpsertModel.find().lean().exec();
    expect(all.length).toBe(1);

    expect(updated._id.toString()).toBe(existing._id.toString());
    expect(updated.foo).toBe('exists');
    expect(updated.value).toBe(9);
    expect(updated.applicationId.toString()).toBe(appId.toString());
  });
});
