// src/test/helpers/poseidonMerkleTree.ts

// @ts-ignore - circomlibjs types are loose / missing
import { buildPoseidon } from 'circomlibjs';

export type PoseidonProofStep = {
  sibling: bigint;
  position: 'left' | 'right';
};

export class PoseidonMerkleTree {
  public depth: number;
  public leaves: bigint[];

  private poseidon: any;
  private F: any;

  private constructor(poseidon: any, depth: number, leaves: bigint[]) {
    this.poseidon = poseidon;
    this.F = poseidon.F; // <- field helper
    this.depth = depth;

    const size = 1 << depth;
    if (leaves.length > size) {
      throw new Error(`Too many leaves (${leaves.length}) for depth=${depth} (max=${size})`);
    }

    // pad leaves up to full tree size with 0
    this.leaves = [...leaves];
    while (this.leaves.length < size) {
      this.leaves.push(0n);
    }
  }

  static async create(depth: number, leaves: bigint[]) {
    const poseidon = await buildPoseidon();
    return new PoseidonMerkleTree(poseidon, depth, leaves);
  }

  /** Hash a pair of children into a parent, returning a canonical bigint. */
  private hashPair(left: bigint, right: bigint): bigint {
    const h = this.poseidon([left, right]);
    // circomlibjs poseidon.F.toObject(...) returns a BigInt (or bigint-like)
    const obj = this.F.toObject ? this.F.toObject(h) : h;
    return BigInt(obj.toString());
  }

  getRoot(): bigint {
    let level: bigint[] = [...this.leaves];

    for (let d = 0; d < this.depth; d++) {
      const next: bigint[] = [];
      for (let i = 0; i < level.length; i += 2) {
        const left = level[i];
        const right = level[i + 1];
        const h = this.hashPair(left, right);
        next.push(h);
      }
      level = next;
    }

    return level[0];
  }

  getProof(index: number): PoseidonProofStep[] {
    const size = 1 << this.depth;
    if (index < 0 || index >= size) {
      throw new Error(`Invalid leaf index ${index} for depth=${this.depth}`);
    }

    const proof: PoseidonProofStep[] = [];
    let idx = index;
    let level: bigint[] = [...this.leaves];

    for (let d = 0; d < this.depth; d++) {
      const isRight = idx % 2 === 1;
      const pairIdx = isRight ? idx - 1 : idx + 1;

      const sibling = pairIdx < level.length ? level[pairIdx] : 0n;
      const position: 'left' | 'right' = isRight ? 'left' : 'right';
      proof.push({ sibling, position });

      const next: bigint[] = [];
      for (let i = 0; i < level.length; i += 2) {
        const left = level[i];
        const right = level[i + 1];
        const h = this.hashPair(left, right);
        next.push(h);
      }
      level = next;
      idx = Math.floor(idx / 2);
    }

    return proof;
  }

  /**
   * Recompute a root from a leaf and its proof. Useful in tests / debugging.
   */
  computeRootFromLeaf(leaf: bigint, index: number, proof: PoseidonProofStep[]): bigint {
    let cur = leaf;
    let idx = index;

    for (let d = 0; d < this.depth; d++) {
      const step = proof[d];
      const sibling = step.sibling;

      if (step.position === 'left') {
        // sibling is left child
        cur = this.hashPair(sibling, cur);
      } else {
        // sibling is right child
        cur = this.hashPair(cur, sibling);
      }

      idx = Math.floor(idx / 2);
    }

    return cur;
  }
}
