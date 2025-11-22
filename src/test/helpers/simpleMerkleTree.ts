// test/helpers/simpleMerkleTree.ts
import crypto from 'crypto';

export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export type MerkleProofStep = {
  hash: string;
  position: 'left' | 'right';
};

export class SimpleMerkleTree {
  public leaves: string[];
  public layers: string[][];

  constructor(rawLeaves: string[]) {
    // Leaf-level hashes (hash the raw payload)
    this.leaves = rawLeaves.map((l) => sha256(l));
    this.layers = [this.leaves];

    while (this.layers[this.layers.length - 1].length > 1) {
      const prev = this.layers[this.layers.length - 1];
      const next: string[] = [];

      for (let i = 0; i < prev.length; i += 2) {
        if (i + 1 === prev.length) {
          // Odd count: carry the last leaf up
          next.push(prev[i]);
        } else {
          const left = prev[i];
          const right = prev[i + 1];
          next.push(sha256(left + right));
        }
      }

      this.layers.push(next);
    }
  }

  getRoot(): string {
    if (!this.layers.length) throw new Error('Empty tree');
    return this.layers[this.layers.length - 1][0];
  }

  getProof(leafIndex: number): MerkleProofStep[] {
    if (leafIndex < 0 || leafIndex >= this.leaves.length) {
      throw new Error(`Invalid leaf index: ${leafIndex}`);
    }

    const proof: MerkleProofStep[] = [];
    let idx = leafIndex;

    for (let level = 0; level < this.layers.length - 1; level++) {
      const layer = this.layers[level];
      const pairIndex = idx ^ 1; // sibling

      if (pairIndex < layer.length) {
        const siblingHash = layer[pairIndex];
        const position: 'left' | 'right' = pairIndex < idx ? 'left' : 'right';
        proof.push({ hash: siblingHash, position });
      }

      idx = Math.floor(idx / 2);
    }

    return proof;
  }

  static verifyProof(rawLeaf: string, proof: MerkleProofStep[], root: string): boolean {
    let computed = sha256(rawLeaf);

    for (const step of proof) {
      if (step.position === 'left') {
        computed = sha256(step.hash + computed);
      } else {
        computed = sha256(computed + step.hash);
      }
    }

    return computed === root;
  }
}
