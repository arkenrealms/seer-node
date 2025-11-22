// src/test/mongo.basic.spec.ts

import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

import { createModel } from '@arken/node/util/mongo';
import { connectTestMongo, disconnectTestMongo, clearTestMongo } from './mongoTestEnv';

// Keep types loose here; we mainly care about runtime behavior
type EntityDoc = any;

describe('mongo.ts – basic model wrapper behavior', () => {
  const EntityModel = createModel<EntityDoc>(
    'EntityBasic',
    {
      foo: { type: String, required: true },
    },
    {
      extend: 'EntityFields',
    }
  );

  beforeAll(async () => {
    await connectTestMongo('basic');
  });

  afterAll(async () => {
    await disconnectTestMongo();
  });

  beforeEach(async () => {
    await clearTestMongo();
    EntityModel.filters.applicationId = undefined;
  });

  it('createModel returns the same wrapper instance for the same key', () => {
    const Again = createModel<EntityDoc>('EntityBasic');
    expect(Again).toBe(EntityModel);
  });

  it('adds id and strips _id in toJSON()', async () => {
    const appId = new ObjectId();

    EntityModel.filters.applicationId = appId;

    const created = await EntityModel.create({
      foo: 'bar',
    } as any);

    const json = created.toJSON() as any;

    expect(json).toHaveProperty('id');
    expect(typeof json.id).toBe('string');
    expect(json).not.toHaveProperty('_id');
    expect(json.foo).toBe('bar');
  });

  it('applies filters.applicationId automatically to find / findOne', async () => {
    const appA = new ObjectId();
    const appB = new ObjectId();

    // Scope model to appA
    EntityModel.filters.applicationId = appA;

    // Create two docs via wrapper (both get applicationId = appA)
    await EntityModel.create([{ foo: 'one' }, { foo: 'two' }] as any);

    // Insert a third doc directly with applicationId = appB (bypass wrapper)
    await mongoose.connection.collection(EntityModel.collection.name).insertOne({
      foo: 'three',
      applicationId: appB,
    });

    // Wrapper-scoped find() should only see the appA docs
    const allForScopedApp = await EntityModel.find().lean().exec();
    expect(allForScopedApp.length).toBe(2);
    const foos = allForScopedApp.map((d: any) => d.foo).sort();
    expect(foos).toEqual(['one', 'two']);

    const two = await EntityModel.findOne({ foo: 'two' }).lean().exec();
    expect(two).not.toBeNull();
    expect((two as any).foo).toBe('two');

    // foo: 'three' (appB) should not be visible via wrapper
    const three = await EntityModel.findOne({ foo: 'three' }).lean().exec();
    expect(three).toBeNull();
  });

  it('updateOne also respects filters.applicationId', async () => {
    const appA = new ObjectId();
    const appB = new ObjectId();

    EntityModel.filters.applicationId = appA;

    // Create appA doc via wrapper
    const docA = await EntityModel.create({
      foo: 'target',
    } as any);

    // Insert another doc with same foo but appB via raw collection
    const { insertedId: docBId } = await mongoose.connection.collection(EntityModel.collection.name).insertOne({
      foo: 'target',
      applicationId: appB,
    });

    // From wrapper perspective, only appA doc should be visible
    const before = await EntityModel.find().lean().exec();
    expect(before.length).toBe(1);
    expect((before[0] as any).applicationId.toString()).toBe(appA.toString());

    // updateOne should only match the appA doc (due to injected applicationId)
    await EntityModel.updateOne({ foo: 'target' }, { $set: { foo: 'updated' } }).exec();

    const afterA = await EntityModel.findOne({ foo: 'updated' }).lean().exec();
    expect(afterA).not.toBeNull();
    expect((afterA as any).applicationId.toString()).toBe(appA.toString());

    // Check raw collection: appB doc should still have foo: 'target'
    const rawB = await mongoose.connection.collection(EntityModel.collection.name).find({ _id: docBId }).toArray();

    expect(rawB).toHaveLength(1);
    expect(rawB[0].foo).toBe('target'); // untouched
    expect(rawB[0].applicationId.toString()).toBe(appB.toString());
  });

  it('findOneProxy returns a proxy with doc fields and model methods (saveQueued)', async () => {
    const appId = new ObjectId();
    EntityModel.filters.applicationId = appId;

    const created = await EntityModel.create({
      foo: 'proxy-test',
    } as any);

    const proxy: any = await EntityModel.findOneProxy({ foo: 'proxy-test' });
    expect(proxy).not.toBeNull();

    // doc field is present
    expect(proxy.foo).toBe('proxy-test');

    // wrapper method is also visible
    expect(typeof proxy.saveQueued).toBe('function');

    // modify and call saveQueued
    proxy.foo = 'proxy-updated';
    await proxy.saveQueued();

    const reloaded: any = await EntityModel.findById(created._id).lean().exec();
    expect(reloaded.foo).toBe('proxy-updated');
  });
});
