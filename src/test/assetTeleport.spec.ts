import { SimpleMerkleTree } from './helpers/simpleMerkleTree';

interface AssetState {
  assetId: string;
  ownerId: string;
  gameId: string;
}

function encodeAsset(a: AssetState): string {
  return JSON.stringify(a);
}

type TeleportProof = {
  root: string;
  asset: AssetState;
  proof: any[];
};

function checkNoDoubleSpend(assetId: string, proofs: TeleportProof[]): boolean {
  let validCount = 0;

  for (const { root, asset, proof } of proofs) {
    const ok = SimpleMerkleTree.verifyProof(encodeAsset(asset), proof, root);
    if (ok) {
      if (asset.assetId !== assetId) {
        // This proof isn't about our assetId; ignore
        continue;
      }
      validCount++;
      if (validCount > 1) return false;
    }
  }

  return true;
}

describe('Cross-game asset teleports with no double-spend', () => {
  it('allows a single-spend teleport from Game A to Game B', () => {
    // Game A pre: sword1, shield1
    const gameAPreAssets: AssetState[] = [
      { assetId: 'sword1', ownerId: 'playerX', gameId: 'A' },
      { assetId: 'shield1', ownerId: 'playerX', gameId: 'A' },
    ];

    // Game A post: sword1 removed (teleported)
    const gameAPostAssets: AssetState[] = [{ assetId: 'shield1', ownerId: 'playerX', gameId: 'A' }];

    // Game B post: sword1 appears
    const gameBPostAssets: AssetState[] = [
      { assetId: 'sword1', ownerId: 'playerX', gameId: 'B' },
      { assetId: 'bow1', ownerId: 'playerY', gameId: 'B' },
    ];

    const treeAPre = new SimpleMerkleTree(gameAPreAssets.map(encodeAsset));
    const treeAPost = new SimpleMerkleTree(gameAPostAssets.map(encodeAsset));
    const treeBPost = new SimpleMerkleTree(gameBPostAssets.map(encodeAsset));

    const rootAPre = treeAPre.getRoot();
    const rootAPost = treeAPost.getRoot();
    const rootBPost = treeBPost.getRoot();

    // Prove sword1 existed in Game A pre
    const swordIndexAPre = gameAPreAssets.findIndex((a) => a.assetId === 'sword1');
    const preSwordProof: TeleportProof = {
      root: rootAPre,
      asset: gameAPreAssets[swordIndexAPre],
      proof: treeAPre.getProof(swordIndexAPre),
    };

    // In Game A post, sword1 should not exist -> we shouldn't be able to prove inclusion.
    // We just won't include any Game A post proof for sword1.

    // Prove sword1 exists in Game B post
    const swordIndexBPost = gameBPostAssets.findIndex((a) => a.assetId === 'sword1');
    const postSwordProofB: TeleportProof = {
      root: rootBPost,
      asset: gameBPostAssets[swordIndexBPost],
      proof: treeBPost.getProof(swordIndexBPost),
    };

    // Our "final state" roots are: Game A post, Game B post.
    // We check that sword1 is NOT present in both final roots.
    const finalProofsForSword = [postSwordProofB];
    const okNoDoubleSpend = checkNoDoubleSpend('sword1', finalProofsForSword);

    expect(okNoDoubleSpend).toBe(true);

    // Additionally, pre-state proof should be valid
    const preMembership = SimpleMerkleTree.verifyProof(
      encodeAsset(preSwordProof.asset),
      preSwordProof.proof,
      preSwordProof.root
    );
    expect(preMembership).toBe(true);
  });

  it('rejects a double-spend where sword1 exists in both Game A post and Game B post', () => {
    // Malicious: Game A "forgets" to remove sword1, and Game B also adds it.
    const gameAPostAssets: AssetState[] = [
      { assetId: 'sword1', ownerId: 'playerX', gameId: 'A' },
      { assetId: 'shield1', ownerId: 'playerX', gameId: 'A' },
    ];

    const gameBPostAssets: AssetState[] = [
      { assetId: 'sword1', ownerId: 'playerX', gameId: 'B' },
      { assetId: 'bow1', ownerId: 'playerY', gameId: 'B' },
    ];

    const treeAPost = new SimpleMerkleTree(gameAPostAssets.map(encodeAsset));
    const treeBPost = new SimpleMerkleTree(gameBPostAssets.map(encodeAsset));

    const rootAPost = treeAPost.getRoot();
    const rootBPost = treeBPost.getRoot();

    const swordIndexAPost = gameAPostAssets.findIndex((a) => a.assetId === 'sword1');
    const swordIndexBPost = gameBPostAssets.findIndex((a) => a.assetId === 'sword1');

    const proofAPost: TeleportProof = {
      root: rootAPost,
      asset: gameAPostAssets[swordIndexAPost],
      proof: treeAPost.getProof(swordIndexAPost),
    };
    const proofBPost: TeleportProof = {
      root: rootBPost,
      asset: gameBPostAssets[swordIndexBPost],
      proof: treeBPost.getProof(swordIndexBPost),
    };

    const okNoDoubleSpend = checkNoDoubleSpend('sword1', [proofAPost, proofBPost]);

    expect(okNoDoubleSpend).toBe(false);
  });
});
