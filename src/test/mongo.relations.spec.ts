// src/test/mongo.relations.spec.ts

import { Document, Types, Schema, model as rawModel } from 'mongoose';
import { createModel, addApplicationVirtual, addTagVirtuals } from '@arken/node/util/mongo';
import { connectTestMongo, disconnectTestMongo, clearTestMongo } from './mongoTestEnv';

interface ApplicationDoc extends Document {
  name: string;
}

interface NodeDoc extends Document {
  relationKey: string;
  fromModel: string;
  from: Types.ObjectId;
  toModel: string;
  to: Types.ObjectId;
}

interface ItemDoc extends Document {
  applicationId: Types.ObjectId;
  name: string;
}

let connected = false;

describe('mongo.ts – relations & populate helpers', () => {
  const appId = new Types.ObjectId();

  //
  // IMPORTANT: names must match the refs used by the virtual helpers:
  // - addApplicationVirtual → ref: "Application"
  // - addTagVirtuals       → ref: "Node"
  //
  const ApplicationModel = createModel<ApplicationDoc>(
    'Application',
    {
      name: { type: String, required: true },
    } as any,
    {
      extend: 'CommonFields',
    }
  );

  const NodeModel = createModel<NodeDoc>(
    'Node',
    {
      relationKey: { type: String, required: true },
      fromModel: { type: String, required: true },
      from: { type: Schema.Types.ObjectId, required: true },
      toModel: { type: String, required: true },
      to: { type: Schema.Types.ObjectId, required: true },
    } as any,
    {
      extend: 'CommonFields',
    }
  );

  const ItemModel = createModel<ItemDoc>(
    'RelItem',
    {
      name: { type: String, required: true },
    } as any,
    {
      extend: 'EntityFields',
      virtuals: [...addApplicationVirtual(), ...addTagVirtuals('RelItem')],
    }
  );

  beforeAll(async () => {
    await connectTestMongo('relations');
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
    ItemModel.filters.applicationId = appId;
  });

  it('findWithRelations populates application and tag nodes', async () => {
    const app = (await ApplicationModel.create({ name: 'RelAppOne' } as any)) as ApplicationDoc;

    // Scope items to this application
    ItemModel.filters.applicationId = app._id;

    const item = (await ItemModel.create({
      name: 'Sword of Relations',
    } as any)) as ItemDoc;

    const tagTargetId = new Types.ObjectId();
    await NodeModel.create({
      relationKey: 'tag',
      fromModel: 'RelItem',
      from: item._id,
      toModel: 'Tag',
      to: tagTargetId,
    } as any);

    const results = await ItemModel.findWithRelations({ _id: item._id } as any, ['application', 'tags']).exec();

    expect(results.length).toBe(1);
    const loaded: any = results[0];

    // application virtual
    expect(loaded.application).toBeDefined();
    expect(loaded.application._id.toString()).toBe(app._id.toString());
    expect(loaded.application.name).toBe('RelAppOne');

    // tags virtual
    expect(Array.isArray(loaded.tags)).toBe(true);
    expect(loaded.tags.length).toBe(1);
    expect(loaded.tags[0].relationKey).toBe('tag');
    expect(loaded.tags[0].from.toString()).toBe(item._id.toString());
  });

  it('populate helper populates application and tags on an existing doc', async () => {
    const app = (await ApplicationModel.create({ name: 'RelAppTwo' } as any)) as ApplicationDoc;

    ItemModel.filters.applicationId = app._id;

    const item = (await ItemModel.create({
      name: 'Shield of Populate',
    } as any)) as ItemDoc;

    const tagTargetId = new Types.ObjectId();
    await NodeModel.create({
      relationKey: 'tag',
      fromModel: 'RelItem',
      from: item._id,
      toModel: 'Tag',
      to: tagTargetId,
    } as any);

    const plain = await ItemModel.findOne({ _id: item._id } as any).exec();
    expect(plain).not.toBeNull();

    const populated = (await ItemModel.populate(plain!, ['application', 'tags'])) as any;

    // application
    expect(populated.application).toBeDefined();
    expect(populated.application._id.toString()).toBe(app._id.toString());
    expect(populated.application.name).toBe('RelAppTwo');

    // tags
    expect(Array.isArray(populated.tags)).toBe(true);
    expect(populated.tags.length).toBe(1);
    expect(populated.tags[0].relationKey).toBe('tag');
    expect(populated.tags[0].from.toString()).toBe(item._id.toString());
  });

  it('related(name) returns the underlying mongoose model', () => {
    // We know "Application" is registered above
    const relatedApp = ItemModel.related('Application');
    const rawApp = rawModel<ApplicationDoc>('Application');
    expect(relatedApp).toBe(rawApp);
  });
});
