import * as ethers from 'ethers'
import Web3 from 'web3'
import { log } from '@arken/node/util'
import { getAddress, getRandomProvider } from '@arken/node/util/web3'
import contractInfo from '@arken/node/contractInfo'
import ArcaneRaidV1 from '@arken/node/contracts/ArcaneRaidV1.json'
import ArcaneTraderV1 from '@arken/node/contracts/ArcaneTraderV1.json'
import RXSMarketplace from '@arken/node/contracts/RXSMarketplace.json'
import ArcaneCharacters from '@arken/node/contracts/ArcaneCharacters.json'
import ArcaneCharacterFactoryV3 from '@arken/node/contracts/ArcaneCharacterFactoryV3.json'
import ArcaneBarracksFacetV1 from '@arken/node/contracts/ArcaneBarracksFacetV1.json'
import ArcaneProfile from '@arken/node/contracts/ArcaneProfile.json'
import ArcaneItems from '@arken/node/contracts/ArcaneItems.json'
import RuneSenderV1 from '@arken/node/contracts/RuneSenderV1.json'
import BEP20Contract from '@arken/node/contracts/BEP20.json'
import secrets from '../../secrets.json'

function _initProvider(app) {
  try {
    log('Setting up provider')

    app.secrets = secrets
    app.web3Provider = getRandomProvider(secrets.find((s) => s.id === 'default-signer'))
    app.web3 = new Web3(app.web3Provider)

    app.ethersProvider = new ethers.providers.Web3Provider(app.web3Provider, 'any')
    app.ethersProvider.pollingInterval = 15000

    app.signers = {}
    app.signers.read = app.ethersProvider.getSigner()
    app.signers.write = app.ethersProvider.getSigner()

    app.contracts = {}
    app.contracts.items = new ethers.Contract(
      getAddress(app.contractInfo.items),
      app.contractMetadata.ArcaneItems.abi,
      app.signers.read
    )
    app.contracts.characters = new ethers.Contract(
      getAddress(app.contractInfo.characters),
      app.contractMetadata.ArcaneCharacters.abi,
      app.signers.read
    )
    app.contracts.barracks = new ethers.Contract(
      getAddress(app.contractInfo.barracks),
      app.contractMetadata.ArcaneBarracksFacetV1.abi,
      app.signers.read
    )
    app.contracts.trader = new ethers.Contract(
      getAddress(app.contractInfo.trader),
      app.contractMetadata.ArcaneTraderV1.abi,
      app.signers.read
    )
    app.contracts.market = new ethers.Contract(
      getAddress(app.contractInfo.market),
      app.contractMetadata.RXSMarketplace.abi,
      app.signers.read
    )
    app.contracts.characterFactory = new ethers.Contract(
      getAddress(app.contractInfo.characterFactory),
      app.contractMetadata.ArcaneCharacterFactoryV3.abi,
      app.signers.read
    )
    app.contracts.profile = new ethers.Contract(
      getAddress(app.contractInfo.profile),
      app.contractMetadata.ArcaneProfile.abi,
      app.signers.read
    )
    app.contracts.sender = new ethers.Contract(
      getAddress(app.contractInfo.sender),
      app.contractMetadata.RuneSenderV1.abi,
      app.signers.read
    )
    app.contracts.busd = new ethers.Contract(
      getAddress(app.contractInfo.busd),
      app.contractMetadata.BEP20.abi,
      app.signers.read
    )
    app.contracts.wbnb = new ethers.Contract(
      getAddress(app.contractInfo.wbnb),
      app.contractMetadata.BEP20.abi,
      app.signers.read
    )

    // app.web3.on('networkChanged', function(networkId) {
    //   process.exit()
    // })

    app.ethersProvider.on('network', (newNetwork, oldNetwork) => {
      // When a Provider makes its initial connection, it emits a "network"
      // event with a null oldNetwork along with the newNetwork. So, if the
      // oldNetwork exists, it represents a changing network
      if (oldNetwork?.chainId === 56) {
        log(`Network changed, exiting. From: ${oldNetwork} To: ${newNetwork}`)
        process.exit()
      }
    })
  } catch (e) {
    log(`Couldn't setup provider.`, e)

    setTimeout(() => _initProvider(app), 60 * 1000)
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

export function initWeb3(app) {
  app.contractInfo = contractInfo
  app.contractMetadata = {}
  app.contractMetadata.ArcaneRaidV1 = ArcaneRaidV1
  app.contractMetadata.ArcaneTraderV1 = ArcaneTraderV1
  app.contractMetadata.RXSMarketplace = RXSMarketplace
  app.contractMetadata.ArcaneCharacters = ArcaneCharacters
  app.contractMetadata.ArcaneCharacterFactoryV3 = ArcaneCharacterFactoryV3
  app.contractMetadata.ArcaneBarracksFacetV1 = ArcaneBarracksFacetV1
  app.contractMetadata.ArcaneProfile = ArcaneProfile
  app.contractMetadata.ArcaneItems = ArcaneItems
  app.contractMetadata.RuneSenderV1 = RuneSenderV1
  app.contractMetadata.BEP20 = BEP20Contract

  app.signers = {
    read: undefined,
    write: undefined,
  }

  initProvider(app)
}
