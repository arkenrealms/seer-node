import * as ethers from 'ethers';
import Web3 from 'web3';
import { log } from '@arken/node/util';
import { getAddress, getRandomProvider } from '@arken/node/util/web3';
import contractInfo from '@arken/node/legacy/contractInfo';
import BEP20Contract from '@arken/node/legacy/contracts/BEP20.json';
import secrets from '../secrets.json';

// TODO: make await, or set on ctx
function initProvider(ctx) {
  try {
    log('Setting up provider');

    const contractMetadata = { BEP20: BEP20Contract };

    const signers = {
      read: undefined,
      write: undefined,
    };

    const web3Provider = getRandomProvider(secrets.find((signer) => signer.id === 'default-signer'));

    const ethersProvider = new ethers.providers.Web3Provider(web3Provider, 'any');
    ethersProvider.pollingInterval = 15000;

    const res = {
      secrets,
      web3Provider,
      web3: new Web3(web3Provider),
      ethersProvider,
      signers: { read: ethersProvider.getSigner(), write: ethersProvider.getSigner() },
      contractInfo,
      contracts: {
        wbnb: new ethers.Contract(getAddress(contractInfo.wbnb), contractMetadata.BEP20.abi, signers.read),
      },
    };

    for (const key in res) {
      ctx[key] = res[key];
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
