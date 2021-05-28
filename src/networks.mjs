import secrets from "../secrets.json"
import HDWalletProvider from "@truffle/hdwallet-provider"

export default {
  development: {
    host: "localhost",
    port: 8545,
    networkId: "*",
  },
  mainnet: {
    provider: () =>
      new HDWalletProvider(
        secrets.mnemonic,
        `https://bsc-dataseed2.ninicoin.io/` // `https://web3-provider-proxy.binzy.workers.dev/` // `http://127.0.0.1:8545/` // `https://bsc-dataseed2.ninicoin.io/` //
      ),
    networkId: 56,
    gasPrice: 11e6,
  },
};
