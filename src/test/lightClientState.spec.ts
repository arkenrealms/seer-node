import { SimpleMerkleTree } from './helpers/simpleMerkleTree';

interface PlayerState {
  id: string;
  zoneId: string;
  gold: number;
  hp: number;
}

function encodeState(state: PlayerState): string {
  // Canonical encoding for leaves
  return JSON.stringify(state);
}

describe('Light-client verification of specific player/zone state', () => {
  it('verifies a single player state against a committed root', () => {
    const players: PlayerState[] = [
      { id: 'p1', zoneId: 'z1', gold: 100, hp: 50 },
      { id: 'p2', zoneId: 'z1', gold: 200, hp: 75 },
      { id: 'p3', zoneId: 'z2', gold: 300, hp: 90 },
      { id: 'p4', zoneId: 'z2', gold: 400, hp: 30 },
    ];

    const leaves = players.map(encodeState);
    const tree = new SimpleMerkleTree(leaves);
    const root = tree.getRoot();

    // Light client wants to verify p2
    const targetIndex = players.findIndex((p) => p.id === 'p2');
    const targetState = players[targetIndex];
    const proof = tree.getProof(targetIndex);

    const ok = SimpleMerkleTree.verifyProof(encodeState(targetState), proof, root);

    expect(ok).toBe(true);
  });

  it('rejects tampered player state even if proof is reused', () => {
    const players: PlayerState[] = [
      { id: 'p1', zoneId: 'z1', gold: 100, hp: 50 },
      { id: 'p2', zoneId: 'z1', gold: 200, hp: 75 },
      { id: 'p3', zoneId: 'z2', gold: 300, hp: 90 },
    ];

    const leaves = players.map(encodeState);
    const tree = new SimpleMerkleTree(leaves);
    const root = tree.getRoot();

    const targetIndex = players.findIndex((p) => p.id === 'p2');
    const proof = tree.getProof(targetIndex);

    // Attacker tampers with state: gives themselves more gold
    const tampered: PlayerState = {
      ...players[targetIndex],
      gold: 9999,
    };

    const ok = SimpleMerkleTree.verifyProof(encodeState(tampered), proof, root);

    expect(ok).toBe(false);
  });
});
