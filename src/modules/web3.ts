import * as ethers from 'ethers'
import Web3 from 'web3'
import { log } from '../util'
import { getAddress, getRandomProvider } from '../util/web3'
import contracts from '../contracts'
import ArcaneRaidV1 from '../../contracts/ArcaneRaidV1.json'
import ArcaneTraderV1 from '../../contracts/ArcaneTraderV1.json'
import ArcaneCharacters from '../../contracts/ArcaneCharacters.json'
import ArcaneCharacterFactoryV3 from '../../contracts/ArcaneCharacterFactoryV3.json'
import ArcaneBarracksFacetV1 from '../../contracts/ArcaneBarracksFacetV1.json'
import ArcaneProfile from '../../contracts/ArcaneProfile.json'
import ArcaneItems from '../../contracts/ArcaneItems.json'
import RuneSenderV1 from '../../contracts/RuneSenderV1.json'
import BEP20Contract from '../../contracts/BEP20.json'

function _initProvider(app) {
  try {
    log('Setting up provider')

    app.web3Provider = getRandomProvider()
    app.web3 = new Web3(app.web3Provider)

    app.ethersProvider = new ethers.providers.Web3Provider(app.web3Provider, 'any')
    app.ethersProvider.pollingInterval = 15000

    app.signers = {}
    app.signers.read = app.ethersProvider.getSigner()
    app.signers.write = app.ethersProvider.getSigner()

    app.contracts = {}
    app.contracts.items = new ethers.Contract(getAddress(app.contractInfo.items), app.contractMetadata.ArcaneItems.abi, app.signers.read)
    app.contracts.characters = new ethers.Contract(getAddress(app.contractInfo.characters), app.contractMetadata.ArcaneCharacters.abi, app.signers.read)
    app.contracts.barracks = new ethers.Contract(getAddress(app.contractInfo.barracks), app.contractMetadata.ArcaneBarracksFacetV1.abi, app.signers.read)
    app.contracts.trader = new ethers.Contract(getAddress(app.contractInfo.trader), app.contractMetadata.ArcaneTraderV1.abi, app.signers.read)
    app.contracts.characterFactory = new ethers.Contract(getAddress(app.contractInfo.characterFactory), app.contractMetadata.ArcaneCharacterFactoryV3.abi, app.signers.read)
    app.contracts.profile = new ethers.Contract(getAddress(app.contractInfo.profile), app.contractMetadata.ArcaneProfile.abi, app.signers.read)
    app.contracts.sender = new ethers.Contract(getAddress(app.contractInfo.sender), app.contractMetadata.RuneSenderV1.abi, app.signers.read)
    app.contracts.busd = new ethers.Contract(getAddress(app.contractInfo.busd), app.contractMetadata.BEP20.abi, app.signers.read)
    app.contracts.wbnb = new ethers.Contract(getAddress(app.contractInfo.wbnb), app.contractMetadata.BEP20.abi, app.signers.read)
  } catch(e) {
    log(`Couldn't setup provider.`)
  }
}

export function initProvider(app) {
  _initProvider(app)

  // setInterval(() => {
  //   // Something happened, lets restart the provider
  //   if (new Date().getTime() > app.config.trades.updatedTimestamp + 10 * 60 * 1000) {
  //     _initProvider(app)
  //   }
  // }, 15 * 60 * 1000)
}

// ethersProvider.on("network", (newNetwork, oldNetwork) => {
  // When a Provider makes its initial connection, it emits a "network"
  // event with a null oldNetwork along with the newNetwork. So, if the
  // oldNetwork exists, it represents a changing network
  // process.exit()
// });

export function initWeb3(app) {
  app.contractInfo = contracts
  app.contractMetadata = {}
  app.contractMetadata.ArcaneRaidV1 = ArcaneRaidV1
  app.contractMetadata.ArcaneTraderV1 = ArcaneTraderV1
  app.contractMetadata.ArcaneCharacters = ArcaneCharacters
  app.contractMetadata.ArcaneCharacterFactoryV3 = ArcaneCharacterFactoryV3
  app.contractMetadata.ArcaneBarracksFacetV1 = ArcaneBarracksFacetV1
  app.contractMetadata.ArcaneProfile = ArcaneProfile
  app.contractMetadata.ArcaneItems = ArcaneItems
  app.contractMetadata.RuneSenderV1 = RuneSenderV1
  app.contractMetadata.BEP20 = BEP20Contract

  app.signers = {
    read: undefined,
    write: undefined
  }

  initProvider(app)
}