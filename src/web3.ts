import * as ethers from 'ethers';
import Web3 from 'web3';
import { log } from '@arken/node/util';
import { getAddress, getRandomProvider } from '@arken/node/util/web3';
import { symbolMap } from '@arken/node/util/decoder';
import contractInfo from '@arken/node/legacy/contractInfo';
import BEP20 from '@arken/node/legacy/contracts/BEP20.json';
import ArcaneCharacterFactoryV4 from '@arken/node/legacy/contracts/ArcaneCharacterFactoryV4.json';
import ArcaneItemMintingStation from '@arken/node/legacy/contracts/ArcaneItemMintingStation.json';
import ArcaneItems from '@arken/node/legacy/contracts/ArcaneItems.json';
import ArcaneTraderV1 from '@arken/node/legacy/contracts/ArcaneTraderV1.json';
import PancakeRouterV2 from '@arken/node/legacy/contracts/PancakeRouterV2.abi.json';
import ArkenBlacksmith from '@arken/node/legacy/contracts/ArkenBlacksmith.abi.json';
import RuneCubeV1 from '@arken/node/legacy/contracts/RuneCubeV1.json';
import ArkenChest from '@arken/node/legacy/contracts/ArkenChest.json';
import RuneTimelock from '@arken/node/legacy/contracts/RuneTimelock.abi.json';
import RXSMarketplace from '@arken/node/legacy/contracts/RXSMarketplace.json';
import secrets from '../secrets.json';

const tokens = [];

// TODO: make await, or set on ctx
function initProvider(ctx) {
  try {
    log('Setting up provider');

    ctx.contractInfo = { bsc: contractInfo };
    ctx.contractMetadata = { bsc: {} as any };
    ctx.contractMetadata.bsc.ArcaneCharacterFactory = ArcaneCharacterFactoryV4;
    ctx.contractMetadata.bsc.ArcaneTrader = ArcaneTraderV1;
    ctx.contractMetadata.bsc.ArcaneItems = ArcaneItems;
    ctx.contractMetadata.bsc.ArcaneItemMintingStation = ArcaneItemMintingStation;
    ctx.contractMetadata.bsc.RXSMarketplace = RXSMarketplace;
    ctx.contractMetadata.bsc.BEP20 = BEP20;
    ctx.contractMetadata.bsc.ArkenChest = ArkenChest;
    ctx.contractMetadata.bsc.RuneCube = RuneCubeV1;
    ctx.contractMetadata.bsc.PancakeRouterV2 = { abi: PancakeRouterV2 };
    ctx.contractMetadata.bsc.ArkenBlacksmith = { abi: ArkenBlacksmith };
    ctx.contractMetadata.bsc.RuneTimelock = { abi: RuneTimelock };

    ctx.secrets = secrets.find((signer) => signer.id === 'default-signer');
    try {
      ctx.web3Provider = { bsc: getRandomProvider(secrets.find((signer) => signer.id === 'default-signer')) };
    } catch (e) {
      console.warn('Could not initiate web3 provider');
    }
    ctx.web3 = { bsc: new Web3(ctx.web3Provider.bsc) };

    ctx.ethersProvider = { bsc: new ethers.providers.Web3Provider(ctx.web3Provider.bsc, 'any') };
    ctx.ethersProvider.bsc.pollingInterval = 15000;

    ctx.signers = {} as any;
    ctx.signers.read = ctx.ethersProvider.bsc.getSigner();
    ctx.signers.write = ctx.ethersProvider.bsc.getSigner();

    ctx.signers.wallet = new ethers.Wallet(secrets.find((signer) => signer.id === 'default-signer').key);

    ctx.contracts = { bsc: {} as any };
    ctx.contracts.bsc.characterFactory = new ethers.Contract(
      getAddress(ctx.contractInfo.bsc.characterFactory),
      ctx.contractMetadata.bsc.ArcaneCharacterFactory.abi,
      ctx.signers.read
    );
    ctx.contracts.bsc.blacksmith = new ethers.Contract(
      getAddress(ctx.contractInfo.bsc.blacksmith),
      ctx.contractMetadata.bsc.ArkenBlacksmith.abi,
      ctx.signers.read
    );
    ctx.contracts.bsc.arcaneItems = new ethers.Contract(
      getAddress(ctx.contractInfo.bsc.items),
      ctx.contractMetadata.bsc.ArcaneItems.abi,
      ctx.signers.read
    );
    ctx.contracts.bsc.arcaneTrader = new ethers.Contract(
      getAddress(ctx.contractInfo.bsc.trader),
      ctx.contractMetadata.bsc.ArcaneTrader.abi,
      ctx.signers.read
    );
    ctx.contracts.bsc.arcaneItemMintingStation = new ethers.Contract(
      getAddress(ctx.contractInfo.bsc.itemMintingStation),
      ctx.contractMetadata.bsc.ArcaneItemMintingStation.abi,
      ctx.signers.read
    );
    ctx.contracts.bsc.market = new ethers.Contract(
      getAddress(ctx.contractInfo.bsc.market),
      ctx.contractMetadata.bsc.RXSMarketplace.abi,
      ctx.signers.write
    );
    ctx.contracts.bsc.chest = new ethers.Contract(
      getAddress(ctx.contractInfo.bsc.chest),
      ctx.contractMetadata.bsc.ArkenChest.abi,
      ctx.signers.write
    );
    ctx.contracts.bsc.cube = new ethers.Contract(
      getAddress(ctx.contractInfo.bsc.cube),
      ctx.contractMetadata.bsc.RuneCube.abi,
      ctx.signers.write
    );
    ctx.contracts.bsc.busd = new ethers.Contract(
      getAddress(ctx.contractInfo.bsc.busd),
      ctx.contractMetadata.bsc.BEP20.abi,
      ctx.signers.read
    );
    ctx.contracts.bsc.wbnb = new ethers.Contract(
      getAddress(ctx.contractInfo.bsc.wbnb),
      ctx.contractMetadata.bsc.BEP20.abi,
      ctx.signers.read
    );
    ctx.contracts.bsc.rxs = new ethers.Contract(
      getAddress(ctx.contractInfo.bsc.rxs),
      ctx.contractMetadata.bsc.BEP20.abi,
      ctx.signers.read
    );
    ctx.contracts.bsc.rune = new ethers.Contract(
      getAddress(ctx.contractInfo.bsc.rune),
      ctx.contractMetadata.bsc.BEP20.abi,
      ctx.signers.read
    );

    for (const token of ['pepe', 'doge']) {
      ctx.contracts.bsc[token.toLowerCase()] = new ethers.Contract(
        getAddress(ctx.contractInfo.bsc[token]),
        ctx.contractMetadata.bsc.BEP20.abi,
        ctx.signers.read
      );
    }
    for (const token of Object.values(symbolMap)) {
      ctx.contracts.bsc[token.toLowerCase()] = new ethers.Contract(
        getAddress(ctx.contractInfo.bsc[token.toLowerCase()]),
        ctx.contractMetadata.bsc.BEP20.abi,
        ctx.signers.read
      );
    }
  } catch (e) {
    log(`Couldn't setup provider.`, e);

    setTimeout(() => initProvider(ctx), 60 * 1000);
  }
}

// export function initProvider(ctx) {
//   _initProvider(ctx);

//   // setInterval(() => {
//   //   // Something hctxened, lets restart the provider
//   //   if (new Date().getTime() > ctx.config.trades.updatedTimestamp + 10 * 60 * 1000) {
//   //     _initProvider(ctx)
//   //   }
//   // }, 15 * 60 * 1000)
// }

export function initWeb3(ctx) {
  return initProvider(ctx);
}
