// src/test/mongo.zk.spec.ts

import mongoose, { Document, Types } from 'mongoose';
import { createModel, setZkVerifier, ZkProofPayload } from '@arken/node/util/mongo';
import { connectTestMongo, disconnectTestMongo, clearTestMongo } from './mongoTestEnv';

interface ZkEntityDoc extends Document {
  applicationId: Types.ObjectId;
  foo: string;
  value?: number;
}

let connected = false;

describe('mongo.ts – zkSNARK-aware helpers', () => {
  const appId = new Types.ObjectId();

  const ZkEntity = createModel<ZkEntityDoc>('ZkEntity', {
    foo: { type: String, required: true },
    value: { type: Number, default: 0 },
  } as any);

  beforeAll(async () => {
    await connectTestMongo('zk');
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
    ZkEntity.filters.applicationId = appId;
    // reset verifier each test
    setZkVerifier(null as any);
  });

  it('createWithProof calls verifier and succeeds when verifier returns true', async () => {
    const proof: ZkProofPayload = {
      walletAddress: '0xabc',
      proof: { whatever: true },
    };

    let verifierCalled = false;

    setZkVerifier((payload, ctx) => {
      verifierCalled = true;
      expect(ctx.kind).toBe('ZkEntity');
      expect(ctx.operation).toBe('create');
      expect(ctx.doc).toBeDefined();
      expect(payload.walletAddress).toBe('0xabc');
      return true;
    });

    const created = (await ZkEntity.createWithProof({ foo: 'ok' } as any, proof)) as ZkEntityDoc;

    expect(verifierCalled).toBe(true);
    expect(created).toBeDefined();
    expect(created.foo).toBe('ok');

    const reloaded = await ZkEntity.findById(created._id).exec();
    expect(reloaded).not.toBeNull();
  });

  it('createWithProof throws when verifier returns false', async () => {
    const proof: ZkProofPayload = {
      walletAddress: '0xdead',
      proof: { bad: true },
    };

    setZkVerifier(() => false);

    await expect(ZkEntity.createWithProof({ foo: 'should-fail' } as any, proof)).rejects.toThrow(
      'Invalid zk proof for operation'
    );

    const all = await ZkEntity.find().exec();
    expect(all.length).toBe(0);
  });

  it('updateOneWithProof calls verifier and applies update', async () => {
    const doc = (await ZkEntity.create({
      foo: 'before',
      value: 1,
    } as any)) as ZkEntityDoc;

    const proof: ZkProofPayload = {
      walletAddress: '0xbeef',
      proof: { ok: true },
    };

    let verifierCalled = false;

    setZkVerifier((payload, ctx) => {
      verifierCalled = true;
      expect(ctx.kind).toBe('ZkEntity');
      expect(ctx.operation).toBe('update');
      expect(ctx.filter).toMatchObject({ _id: doc._id });
      expect(ctx.update).toMatchObject({ $set: { value: 2 } });
      expect(payload.walletAddress).toBe('0xbeef');
      return true;
    });

    await ZkEntity.updateOneWithProof({ _id: doc._id } as any, { $set: { value: 2 } } as any, proof);

    expect(verifierCalled).toBe(true);

    const reloaded = (await ZkEntity.findById(doc._id).exec()) as ZkEntityDoc;
    expect(reloaded.value).toBe(2);
  });

  it('updateOneWithProof throws and does not update when verifier fails', async () => {
    const doc = (await ZkEntity.create({
      foo: 'before',
      value: 10,
    } as any)) as ZkEntityDoc;

    const proof: ZkProofPayload = {
      walletAddress: '0xbad',
      proof: { bad: true },
    };

    setZkVerifier(() => false);

    await expect(
      ZkEntity.updateOneWithProof({ _id: doc._id } as any, { $set: { value: 999 } } as any, proof)
    ).rejects.toThrow('Invalid zk proof for operation');

    const reloaded = (await ZkEntity.findById(doc._id).exec()) as ZkEntityDoc;
    expect(reloaded.value).toBe(10);
  });

  // 🔹 NEW: no-verifier case
  it('createWithProof succeeds when no verifier is registered (no-op)', async () => {
    // beforeEach already calls setZkVerifier(null as any)
    const proof: ZkProofPayload = {
      walletAddress: '0xnozk',
      proof: {},
    };

    const created = (await ZkEntity.createWithProof({ foo: 'no-verifier' } as any, proof)) as ZkEntityDoc;

    expect(created).toBeDefined();
    expect(created.foo).toBe('no-verifier');

    const reloaded = await ZkEntity.findById(created._id).exec();
    expect(reloaded).not.toBeNull();
    expect(reloaded!.foo).toBe('no-verifier');
  });

  // 🔹 NEW: async verifier case
  it('createWithProof works with an async verifier', async () => {
    const proof: ZkProofPayload = {
      walletAddress: '0xasync',
      proof: { zkp: true },
    };

    let called = false;

    setZkVerifier(async (payload, ctx) => {
      called = true;
      expect(ctx.kind).toBe('ZkEntity');
      expect(ctx.operation).toBe('create');
      expect((ctx.doc as any).foo).toBe('async-ok');
      expect(payload.walletAddress).toBe('0xasync');
      // simulate async delay
      await new Promise((resolve) => setTimeout(resolve, 5));
      return true;
    });

    const created = (await ZkEntity.createWithProof({ foo: 'async-ok' } as any, proof)) as ZkEntityDoc;

    expect(called).toBe(true);
    expect(created).toBeDefined();
    expect(created.foo).toBe('async-ok');

    const reloaded = await ZkEntity.findById(created._id).exec();
    expect(reloaded).not.toBeNull();
    expect(reloaded!.foo).toBe('async-ok');
  });
});
