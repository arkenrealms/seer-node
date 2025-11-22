// src/test/mongo.entityFields.spec.ts

import mongoose, { Schema } from 'mongoose';
import { ObjectId } from 'mongodb';

import { createModel } from '@arken/node/util/mongo';
import { connectTestMongo, disconnectTestMongo, clearTestMongo } from './mongoTestEnv';

type EntityDoc = any;

describe('mongo.ts – EntityFields behavior', () => {
  const EntityModel = createModel<EntityDoc>(
    'EntityWithFields',
    {
      foo: { type: String, required: true },
    },
    {
      extend: 'EntityFields',
      minimize: false,
    }
  );

  beforeAll(async () => {
    await connectTestMongo('entityfields');
  });

  afterAll(async () => {
    await disconnectTestMongo();
  });

  beforeEach(async () => {
    await clearTestMongo();
    EntityModel.filters.applicationId = undefined;
  });

  it('automatically injects applicationId from filters on create', async () => {
    const appId = new ObjectId();

    EntityModel.filters.applicationId = appId;

    // note: no applicationId provided here
    const created = await EntityModel.create({
      foo: 'no-explicit-app',
    } as any);

    expect(created).toBeDefined();
    expect(created.applicationId).toBeDefined();
    expect(created.applicationId.toString()).toBe(appId.toString());
  });

  it('has default status "Active" and data/meta objects', async () => {
    const appId = new ObjectId();

    EntityModel.filters.applicationId = appId;

    const created = await EntityModel.create({
      foo: 'defaults-test',
    } as any);

    const json = created.toJSON() as any;

    expect(json.status).toBe('Active');
    expect(json.data).toBeDefined();
    expect(typeof json.data).toBe('object');
    expect(json.meta).toBeDefined();
    expect(typeof json.meta).toBe('object');
  });

  it('keeps createdDate and updatedDate via timestamps', async () => {
    const appId = new ObjectId();
    EntityModel.filters.applicationId = appId;

    const created = await EntityModel.create({
      foo: 'timestamp-test',
    } as any);

    expect(created.createdDate).toBeInstanceOf(Date);
    // updatedDate may be undefined until first update, but createdDate should exist
    expect(created.updatedDate).toBeInstanceOf(Date);
  });
});
