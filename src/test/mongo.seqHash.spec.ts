// src/test/mongo.seqHash.spec.ts

import { hashEvents, getNextSeq } from '@arken/node/util/mongo';
import { connectTestMongo, disconnectTestMongo, clearTestMongo } from './mongoTestEnv';

let connected = false;

describe('mongo.ts – hashEvents & getNextSeq', () => {
  beforeAll(async () => {
    await connectTestMongo('seqhash');
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

  it('hashEvents is deterministic and order-sensitive', () => {
    const eventsA = [
      { kind: 'Item', op: 'create', payload: { name: 'Sword', dmg: 10 } },
      { kind: 'Item', op: 'update', payload: { id: '1', dmg: 12 } },
    ];

    const eventsB = [
      { kind: 'Item', op: 'create', payload: { name: 'Sword', dmg: 10 } },
      { kind: 'Item', op: 'update', payload: { id: '1', dmg: 12 } },
    ];

    const eventsC = [...eventsA].reverse();

    const hashA = hashEvents(eventsA);
    const hashB = hashEvents(eventsB);
    const hashC = hashEvents(eventsC);

    // same content, same order => same hash
    expect(hashA).toBe(hashB);

    // different order => different hash
    expect(hashA).not.toBe(hashC);
  });

  it('getNextSeq increments per key independently', async () => {
    const a1 = await getNextSeq('seerEventA');
    const a2 = await getNextSeq('seerEventA');
    const b1 = await getNextSeq('seerEventB');
    const b2 = await getNextSeq('seerEventB');

    expect(a1).toBe(1);
    expect(a2).toBe(2);

    expect(b1).toBe(1);
    expect(b2).toBe(2);

    // Calling again on A should continue its own sequence
    const a3 = await getNextSeq('seerEventA');
    expect(a3).toBe(3);
  });
});
