// src/test/mongo.omitFilters.spec.ts

import { Document, Types } from 'mongoose';
import { createModel } from '@arken/node/util/mongo';
import { connectTestMongo, disconnectTestMongo, clearTestMongo } from './mongoTestEnv';

interface AppDoc extends Document {
  name: string;
}

let connected = false;

describe('mongo.ts – filterOmitModels (Application not auto-scoped by applicationId)', () => {
  const appFilterId = new Types.ObjectId();

  const ApplicationModel = createModel<AppDoc>(
    'Application',
    {
      name: { type: String, required: true },
    } as any,
    {
      extend: 'CommonFields',
    }
  );

  beforeAll(async () => {
    await connectTestMongo('omitfilters');
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
    // Even though we set this, Application is in filterOmitModels
    // so it should NOT be injected into queries.
    (ApplicationModel as any).filters.applicationId = appFilterId;
  });

  it('does not inject applicationId filter for Application model', async () => {
    await ApplicationModel.create({ name: 'AppOne' } as any);
    await ApplicationModel.create({ name: 'AppTwo' } as any);

    const all = await ApplicationModel.find().lean().exec();

    // If Application were auto-scoped by applicationId, we'd probably see 0
    // because schema doesn't even define applicationId. We expect both docs.
    expect(all.length).toBe(2);
    const names = all.map((d: any) => d.name).sort();
    expect(names).toEqual(['AppOne', 'AppTwo']);
  });
});
