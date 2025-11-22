// src/test/mongo.virtuals.spec.ts

import { Schema } from 'mongoose';
import { createSchema, addTagVirtuals, addApplicationVirtual } from '@arken/node/util/mongo';

describe('mongo.ts – virtual helpers', () => {
  it('addTagVirtuals installs a tags virtual with expected options', () => {
    const schema = createSchema<any>('TaggedVirtualTest', {} as any, {
      virtuals: addTagVirtuals('TaggedVirtualTest') as any,
    });

    const anySchema: any = schema as any;
    const tagsVirt = anySchema.virtuals?.tags;

    expect(tagsVirt).toBeDefined();
    expect(tagsVirt.options).toBeDefined();

    // These come from addTagVirtuals
    expect(tagsVirt.options.ref).toBe('Node');
    expect(tagsVirt.options.localField).toBe('_id');
    expect(tagsVirt.options.foreignField).toBe('from');
    expect(tagsVirt.options.justOne).toBe(false);
    expect(tagsVirt.options.match).toMatchObject({
      relationKey: 'tag',
      fromModel: 'TaggedVirtualTest',
    });
  });

  it('addApplicationVirtual installs an application virtual pointing to Application', () => {
    const schema = createSchema<any>('AppVirtualTest', {} as any, {
      virtuals: addApplicationVirtual() as any,
    });

    const anySchema: any = schema as any;
    const appVirt = anySchema.virtuals?.application;

    expect(appVirt).toBeDefined();
    expect(appVirt.options).toBeDefined();

    expect(appVirt.options.ref).toBe('Application');
    expect(appVirt.options.localField).toBe('applicationId');
    expect(appVirt.options.foreignField).toBe('_id');
    expect(appVirt.options.justOne).toBe(true);
  });
});
