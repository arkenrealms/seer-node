// src/test/mongo.cluster.spec.ts

import mongoose, { Document, Schema, Types } from 'mongoose';
import { createModel, ClusterModel, resolveClustersForFilter } from '@arken/node/util/mongo';
import { connectTestMongo, disconnectTestMongo, clearTestMongo } from './mongoTestEnv';

interface ClusterItemDoc extends Document {
  applicationId: Types.ObjectId;
  key: string;
  name?: string;
  revision?: number;
  tags?: { key: string; weight?: number }[];
  clusterId?: Types.ObjectId;
}

let connected = false;

describe('mongo.ts – cluster / ontology integration', () => {
  const appId = new Types.ObjectId();

  const ClusterItem = createModel<ClusterItemDoc>(
    'ClusterItem',
    {
      key: { type: String, required: true },
      name: { type: String },
      tags: [{ key: String, weight: Number }],
    } as any,
    {
      pkFields: ['key'],
      keyFields: ['key'],
    }
  );

  beforeAll(async () => {
    await connectTestMongo('cluster');
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
    // reset filters each test
    ClusterItem.filters.applicationId = appId;
  });

  it('creates a Cluster entry on first entity create', async () => {
    const doc = (await ClusterItem.create({
      key: 'wrath',
      name: 'Wrath Sword',
      tags: [{ key: 'weapon', weight: 1 }],
    } as any)) as ClusterItemDoc;

    const clusters = await ClusterModel.find({
      kind: 'ClusterItem',
      applicationId: appId,
      primaryKey: 'wrath',
    })
      .lean()
      .exec();

    expect(clusters.length).toBe(1);
    const c: any = clusters[0];

    expect(String(c.currentId)).toBe(doc._id.toString());
    expect(c.currentRevision).toBe(1);
    expect(c.keys).toContain('wrath');
    expect(Array.isArray(c.pk)).toBe(true);

    const pkFields = c.pk.map((p: any) => p.field);
    expect(pkFields).toContain('key');
  });

  it('advances currentId on higher revision and merges tags', async () => {
    const v1 = (await ClusterItem.create({
      key: 'wrath',
      name: 'Wrath Sword v1',
      tags: [{ key: 'weapon', weight: 0.5 }],
    } as any)) as ClusterItemDoc;

    const v2 = (await ClusterItem.create({
      key: 'wrath',
      name: 'Wrath Sword v2',
      revision: 2,
      tags: [
        { key: 'weapon', weight: 1 },
        { key: 'legendary', weight: 0.8 },
      ],
    } as any)) as ClusterItemDoc;

    expect(v1).toBeDefined();
    expect(v2).toBeDefined();

    const cluster = await ClusterModel.findOne({
      kind: 'ClusterItem',
      applicationId: appId,
      primaryKey: 'wrath',
    }).exec();

    expect(cluster).not.toBeNull();
    expect(cluster!.currentId!.toString()).toBe(v2._id.toString());
    expect(cluster!.currentRevision).toBe(2);

    const tagKeys = (cluster!.tags || []).map((t) => t.key).sort();
    expect(tagKeys).toEqual(['legendary', 'weapon']);

    const weaponTag = (cluster!.tags || []).find((t) => t.key === 'weapon');
    expect(weaponTag!.weight).toBeGreaterThanOrEqual(1);
  });

  it('resolveClustersForFilter works for pk-only and pk+tags', async () => {
    await ClusterItem.create({
      key: 'wrath',
      name: 'Wrath Sword',
      revision: 5,
      tags: [
        { key: 'weapon', weight: 0.5 },
        { key: 'legendary', weight: 1 },
      ],
    } as any);

    const schema = (ClusterItem as any).schema as Schema;

    const byPk = await resolveClustersForFilter('ClusterItem', schema, appId, { key: 'wrath' });

    expect(byPk.length).toBe(1);
    expect(byPk[0].kind).toBe('ClusterItem');

    const byPkAndTags = await resolveClustersForFilter('ClusterItem', schema, appId, {
      key: 'wrath',
      tags: ['legendary'],
    });

    expect(byPkAndTags.length).toBe(1);
    const best: any = byPkAndTags[0];

    // scored path
    expect(best.score).toBeDefined();
    expect(best.score).toBeGreaterThan(0);
  });
});
