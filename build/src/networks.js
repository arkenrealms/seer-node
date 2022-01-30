"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var secrets_json_1 = __importDefault(require("../secrets.json"));
var hdwallet_provider_1 = __importDefault(require("@truffle/hdwallet-provider"));
exports.default = {
    development: {
        host: "localhost",
        port: 8545,
        networkId: "*",
    },
    mainnet: {
        provider: function () {
            return new hdwallet_provider_1.default(secrets_json_1.default.mnemonic, "https://bsc-dataseed2.ninicoin.io/" // `https://web3-provider-proxy.binzy.workers.dev/` // `http://127.0.0.1:8545/` // `https://bsc-dataseed2.ninicoin.io/` //
            );
        },
        networkId: 56,
        gasPrice: 11e6,
    },
};
