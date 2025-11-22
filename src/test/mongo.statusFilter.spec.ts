// src/test/mongo.statusFilter.spec.ts

import { Document, Types } from 'mongoose';
import { createModel } from '@arken/node/util/mongo';
import { connectTestMongo, disconnectTestMongo, clearTestMongo } from './mongoTestEnv';

interface StatusDoc extends Document {
  applicationId: Types.ObjectId;
  name: string;
  status?: string;
}

let connected = false;

describe('mongo.ts – default status filter (exclude Archived)', () => {
  const appId = new Types.ObjectId();

  const StatusModel = createModel<StatusDoc>(
    'StatusEntity',
    {
      name: { type: String, required: true },
    } as any,
    {
      extend: 'EntityFields',
    }
  );

  beforeAll(async () => {
    await connectTestMongo('statusfilter');
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

    StatusModel.filters.applicationId = appId;

    // Seed: one active, one archived, both in the same app scope
    await StatusModel.create([{ name: 'active-1' } as any, { name: 'archived-1', status: 'Archived' as any }]);
  });

  it('find / findOne ignore Archived by default', async () => {
    // Default find should exclude Archived
    const all = await StatusModel.find().lean().exec();
    expect(all.length).toBe(1);
    expect((all[0] as any).name).toBe('active-1');
    // We only care that default filter excludes "Archived" docs
    expect((all[0] as any).status).not.toBe('Archived');

    // findOne on the archived name should return null by default
    const archived = await StatusModel.findOne({ name: 'archived-1' }).lean().exec();
    expect(archived).toBeNull();

    // But if we explicitly request status: "Archived", we should get the doc
    const explicitArchived = await StatusModel.findOne({
      name: 'archived-1',
      status: 'Archived' as any,
    })
      .lean()
      .exec();

    expect(explicitArchived).not.toBeNull();
    expect((explicitArchived as any).name).toBe('archived-1');
    expect((explicitArchived as any).status).toBe('Archived');
  });
});
