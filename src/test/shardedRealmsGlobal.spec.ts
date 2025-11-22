import { SimpleMerkleTree } from './helpers/simpleMerkleTree';

interface PlayerState {
  id: string;
  shardId: string;
  zoneId: string;
  gold: number;
}

function encodeState(state: PlayerState): string {
  return JSON.stringify(state);
}

describe('Sharded realms with a single global commitment', () => {
  it('proves a player in shard B is committed in the global root', () => {
    const shardAPlayers: PlayerState[] = [
      { id: 'p1', shardId: 'A', zoneId: 'z1', gold: 100 },
      { id: 'p2', shardId: 'A', zoneId: 'z1', gold: 150 },
    ];
    const shardBPlayers: PlayerState[] = [
      { id: 'p3', shardId: 'B', zoneId: 'z2', gold: 200 },
      { id: 'p4', shardId: 'B', zoneId: 'z3', gold: 250 },
    ];

    // Build shard-level Merkle trees
    const shardATree = new SimpleMerkleTree(shardAPlayers.map(encodeState));
    const shardBTree = new SimpleMerkleTree(shardBPlayers.map(encodeState));

    const shardARoot = shardATree.getRoot();
    const shardBRoot = shardBTree.getRoot();

    // Global tree over shard roots
    const globalTree = new SimpleMerkleTree([shardARoot, shardBRoot]);
    const globalRoot = globalTree.getRoot();

    // Now we want to prove: p3 ∈ shard B ∧ shard B ∈ global root
    const p3Index = shardBPlayers.findIndex((p) => p.id === 'p3');
    const p3State = shardBPlayers[p3Index];

    const p3ProofInShard = shardBTree.getProof(p3Index);
    const shardBLeafIndex = 1; // second leaf in [shardARoot, shardBRoot]
    const shardBProofInGlobal = globalTree.getProof(shardBLeafIndex);

    // Step 1: verify p3 in shard B root
    const shardBMembership = SimpleMerkleTree.verifyProof(encodeState(p3State), p3ProofInShard, shardBRoot);
    expect(shardBMembership).toBe(true);

    // Step 2: verify shard B root in global root
    const globalMembership = SimpleMerkleTree.verifyProof(shardBRoot, shardBProofInGlobal, globalRoot);
    expect(globalMembership).toBe(true);
  });
});
