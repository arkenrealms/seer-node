// src/test/mongo.preHooks.spec.ts

import { Document, Types } from 'mongoose';
import { createModel } from '@arken/node/util/mongo';
import { connectTestMongo, disconnectTestMongo, clearTestMongo } from './mongoTestEnv';

interface PreHookDoc extends Document {
  applicationId: Types.ObjectId;
  name: string;
  touched?: boolean;
}

let connected = false;

describe('mongo.ts – schema pre hooks via CustomSchemaOptions.pre', () => {
  const appId = new Types.ObjectId();

  const PreHookModel = createModel<PreHookDoc>(
    'PreHookEntity',
    {
      name: { type: String, required: true },
      touched: { type: Boolean, default: false },
    } as any,
    {
      extend: 'EntityFields',
      pre: [
        {
          method: 'save',
          handler(this: any, next: any) {
            // mark "touched" before save
            this.touched = true;
            next();
          },
        },
      ],
    }
  );

  beforeAll(async () => {
    await connectTestMongo('prehooks');
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
    PreHookModel.filters.applicationId = appId;
  });

  it('runs pre-save hook and sets touched=true on create', async () => {
    const created = (await PreHookModel.create({
      name: 'Hooked',
    } as any)) as PreHookDoc;

    expect(created.touched).toBe(true);

    const reloaded = (await PreHookModel.findById(created._id).lean().exec()) as any;
    expect(reloaded).not.toBeNull();
    expect(reloaded.touched).toBe(true);
  });
});
