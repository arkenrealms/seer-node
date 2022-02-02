import ethers from 'ethers'
import { getAddress } from '../util/web3'

export async function monitorCharacterEvents(app) {
  const contract = new ethers.Contract(getAddress(app.contracts.characters), app.contractMetadata.ArcaneCharacters.abi, app.signers.read)

  contract.on('Transfer', async (from, to, tokenId, log) => {
    await app.modules.getAllCharacterEvents()
  })
}
