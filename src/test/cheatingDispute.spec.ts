import { SimpleMerkleTree } from './helpers/simpleMerkleTree';

interface PlayerState {
  id: string;
  gold: number;
}

interface TransferEvent {
  fromId: string;
  toId: string;
  amount: number;
}

function encodeState(state: PlayerState): string {
  return JSON.stringify(state);
}

function verifyTransferWithProofs(args: {
  event: TransferEvent;
  preRoot: string;
  postRoot: string;
  preFromState: PlayerState;
  preFromProof: any[];
  preToState: PlayerState;
  preToProof: any[];
  postFromState: PlayerState;
  postFromProof: any[];
  postToState: PlayerState;
  postToProof: any[];
}): boolean {
  const {
    event,
    preRoot,
    postRoot,
    preFromState,
    preFromProof,
    preToState,
    preToProof,
    postFromState,
    postFromProof,
    postToState,
    postToProof,
  } = args;

  // 1. Verify Merkle inclusion for all four states
  const okPreFrom = SimpleMerkleTree.verifyProof(encodeState(preFromState), preFromProof, preRoot);
  const okPreTo = SimpleMerkleTree.verifyProof(encodeState(preToState), preToProof, preRoot);
  const okPostFrom = SimpleMerkleTree.verifyProof(encodeState(postFromState), postFromProof, postRoot);
  const okPostTo = SimpleMerkleTree.verifyProof(encodeState(postToState), postToProof, postRoot);

  if (!okPreFrom || !okPreTo || !okPostFrom || !okPostTo) {
    return false;
  }

  // 2. Verify conservation of gold per event
  const { amount } = event;

  if (preFromState.gold - amount !== postFromState.gold || preToState.gold + amount !== postToState.gold) {
    return false;
  }

  // 3. Optional: total gold conservation between those two players
  const preTotal = preFromState.gold + preToState.gold;
  const postTotal = postFromState.gold + postToState.gold;
  if (preTotal !== postTotal) return false;

  return true;
}

describe('Cheating / dispute resolution with minimal disclosures', () => {
  it('accepts a valid transfer with consistent pre/post states', () => {
    // Pre-state
    const preStates: PlayerState[] = [
      { id: 'A', gold: 100 },
      { id: 'B', gold: 50 },
      { id: 'C', gold: 0 },
    ];

    // Event: A transfers 30 to B
    const event: TransferEvent = { fromId: 'A', toId: 'B', amount: 30 };

    // Post-state
    const postStates: PlayerState[] = [
      { id: 'A', gold: 70 }, // 100 - 30
      { id: 'B', gold: 80 }, // 50 + 30
      { id: 'C', gold: 0 },
    ];

    const preTree = new SimpleMerkleTree(preStates.map(encodeState));
    const postTree = new SimpleMerkleTree(postStates.map(encodeState));

    const preRoot = preTree.getRoot();
    const postRoot = postTree.getRoot();

    const idxApre = preStates.findIndex((p) => p.id === 'A');
    const idxBpre = preStates.findIndex((p) => p.id === 'B');
    const idxApost = postStates.findIndex((p) => p.id === 'A');
    const idxBpost = postStates.findIndex((p) => p.id === 'B');

    const result = verifyTransferWithProofs({
      event,
      preRoot,
      postRoot,
      preFromState: preStates[idxApre],
      preFromProof: preTree.getProof(idxApre),
      preToState: preStates[idxBpre],
      preToProof: preTree.getProof(idxBpre),
      postFromState: postStates[idxApost],
      postFromProof: postTree.getProof(idxApost),
      postToState: postStates[idxBpost],
      postToProof: postTree.getProof(idxBpost),
    });

    expect(result).toBe(true);
  });

  it('rejects a cheating claim about transfer amount', () => {
    const preStates: PlayerState[] = [
      { id: 'A', gold: 100 },
      { id: 'B', gold: 50 },
    ];

    // Actual post-state is for amount = 30
    const postStates: PlayerState[] = [
      { id: 'A', gold: 70 },
      { id: 'B', gold: 80 },
    ];

    // Lying seer claims event was 40 instead of 30
    const lyingEvent: TransferEvent = {
      fromId: 'A',
      toId: 'B',
      amount: 40,
    };

    const preTree = new SimpleMerkleTree(preStates.map(encodeState));
    const postTree = new SimpleMerkleTree(postStates.map(encodeState));

    const preRoot = preTree.getRoot();
    const postRoot = postTree.getRoot();

    const idxApre = preStates.findIndex((p) => p.id === 'A');
    const idxBpre = preStates.findIndex((p) => p.id === 'B');
    const idxApost = postStates.findIndex((p) => p.id === 'A');
    const idxBpost = postStates.findIndex((p) => p.id === 'B');

    const result = verifyTransferWithProofs({
      event: lyingEvent,
      preRoot,
      postRoot,
      preFromState: preStates[idxApre],
      preFromProof: preTree.getProof(idxApre),
      preToState: preStates[idxBpre],
      preToProof: preTree.getProof(idxBpre),
      postFromState: postStates[idxApost],
      postFromProof: postTree.getProof(idxApost),
      postToState: postStates[idxBpost],
      postToProof: postTree.getProof(idxBpost),
    });

    expect(result).toBe(false);
  });
});
