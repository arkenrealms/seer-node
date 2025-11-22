// src/test/mongo.jsonTransform.spec.ts

import mongoose, { Schema } from 'mongoose';
import { ObjectId } from 'mongodb';

import { addIdTransformHelpers, applyJsonToDoc } from '@arken/node/util/mongo';
import { connectTestMongo, disconnectTestMongo, clearTestMongo } from './mongoTestEnv';

let connected = false;

describe('mongo.ts – JSON transform helpers', () => {
  beforeAll(async () => {
    await connectTestMongo('jsontransform');
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
  });

  it('addIdTransformHelpers flattens ObjectIds to strings in toJSON()', async () => {
    const simpleSchema = new Schema({
      refId: { type: Schema.Types.ObjectId },
      nested: {
        subId: { type: Schema.Types.ObjectId },
      },
    });

    addIdTransformHelpers(simpleSchema);

    const SimpleModel = mongoose.model('SimpleTransform', simpleSchema);

    const ref = new ObjectId();
    const sub = new ObjectId();

    const doc = await SimpleModel.create({
      refId: ref,
      nested: { subId: sub },
    });

    const json: any = doc.toJSON();

    expect(json).toHaveProperty('id');
    expect(typeof json.id).toBe('string');
    expect(json).not.toHaveProperty('_id');

    expect(typeof json.refId).toBe('string');
    expect(json.refId).toBe(ref.toString());

    expect(typeof json.nested.subId).toBe('string');
    expect(json.nested.subId).toBe(sub.toString());
  });

  it('applyJsonToDoc converts string IDs back to ObjectIds based on schema', async () => {
    const simpleSchema = new Schema({
      refId: { type: Schema.Types.ObjectId },
      nested: {
        subId: { type: Schema.Types.ObjectId },
      },
      tags: [{ type: Schema.Types.ObjectId }],
    });

    const SimpleModel = mongoose.model('SimpleTransform2', simpleSchema);

    const ref = new ObjectId();
    const sub = new ObjectId();
    const tag1 = new ObjectId();
    const tag2 = new ObjectId();

    const doc = await SimpleModel.create({
      refId: ref,
      nested: { subId: sub },
      tags: [tag1, tag2],
    });

    const json: any = doc.toJSON();

    json.refId = doc.refId.toString();
    json.nested.subId = doc.nested.subId.toString();
    json.tags = json.tags.map((t: string) => t.toString());

    const plain: any = {};
    applyJsonToDoc(simpleSchema, plain, json);

    expect(String(plain.refId)).toBe(ref.toString());
    expect(String(plain.nested.subId)).toBe(sub.toString());

    expect(Array.isArray(plain.tags)).toBe(true);
    expect(plain.tags.map((t: any) => String(t))).toEqual([tag1.toString(), tag2.toString()]);
  });
});
