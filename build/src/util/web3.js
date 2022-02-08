"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSignedRequest = exports.verifySignature = exports.web3 = exports.getAddress = exports.iterateBlocks = exports.getRandomProvider = void 0;
var web3_1 = __importDefault(require("web3"));
var hdwallet_provider_1 = __importDefault(require("@truffle/hdwallet-provider"));
var secrets_json_1 = __importDefault(require("../../secrets.json"));
var _1 = require(".");
// const fetchPrice = async (id, vs = 'usd') => {
//   const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${vs}`)
//   return parseFloat((await response.json())[id][vs])
// }
// const fetchPrices = async () => {
// const response = await fetch('https://api.coingecko.com/api/v3/coins/list')
// prices = (await response.json())
// }
var getRandomProvider = function () {
    return new hdwallet_provider_1.default(secrets_json_1.default.mnemonic, "wss://thrumming-still-leaf.bsc.quiknode.pro/b2f8a5b1bd0809dbf061112e1786b4a8e53c9a83/" //"https://bsc.getblock.io/mainnet/?api_key=3f594a5f-d0ed-48ca-b0e7-a57d04f76332" //networks[Math.floor(Math.random() * networks.length)]
    );
};
exports.getRandomProvider = getRandomProvider;
// const blocknativeApiKey = '58a45321-bf96-485c-ab9b-e0610e181d26'
function iterateBlocks(app, name, address, fromBlock, toBlock, event, processLog, updateConfig) {
    return __awaiter(this, void 0, void 0, function () {
        var toBlock2, filter, logs, i, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!toBlock)
                        return [2 /*return*/];
                    if (fromBlock === toBlock)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 10, , 11]);
                    toBlock2 = (fromBlock + 5000) < toBlock ? fromBlock + 5000 : toBlock;
                    filter = {
                        address: address,
                        fromBlock: fromBlock,
                        toBlock: toBlock2,
                        topics: event.topics
                    };
                    (0, _1.log)(name, 'Iterating block', fromBlock, 'to', toBlock2, 'eventually', toBlock, 'for', event.topics);
                    return [4 /*yield*/, app.ethersProvider.getLogs(filter)];
                case 2:
                    logs = _a.sent();
                    i = 0;
                    _a.label = 3;
                case 3:
                    if (!(i < logs.length)) return [3 /*break*/, 6];
                    return [4 /*yield*/, processLog(logs[i], false)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 3];
                case 6:
                    if (!(updateConfig && toBlock2 > 0)) return [3 /*break*/, 8];
                    return [4 /*yield*/, updateConfig(toBlock2)];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [4 /*yield*/, iterateBlocks(app, name, address, toBlock2, toBlock, event, processLog, updateConfig)];
                case 9:
                    _a.sent();
                    return [3 /*break*/, 11];
                case 10:
                    e_1 = _a.sent();
                    (0, _1.logError)('Iterate Blocks Error', e_1);
                    (0, _1.logError)(name, address, fromBlock, toBlock, event);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
exports.iterateBlocks = iterateBlocks;
var getAddress = function (address) {
    var mainNetChainId = 56;
    var chainId = process.env.REACT_APP_CHAIN_ID;
    return address[chainId] ? address[chainId] : address[mainNetChainId];
};
exports.getAddress = getAddress;
var provider = (0, exports.getRandomProvider)();
// @ts-ignore
exports.web3 = new web3_1.default(provider);
function verifySignature(signature) {
    (0, _1.log)('Verifying', signature);
    try {
        return exports.web3.eth.accounts.recover(signature.data, signature.hash).toLowerCase() === signature.address.toLowerCase();
    }
    catch (e) {
        (0, _1.logError)(e);
        return false;
    }
}
exports.verifySignature = verifySignature;
function getSignedRequest(data) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    (0, _1.log)('Signing', data);
                    _a = {
                        address: secrets_json_1.default.address
                    };
                    return [4 /*yield*/, exports.web3.eth.accounts.sign(data, secrets_json_1.default.key)];
                case 1: return [2 /*return*/, (_a.hash = (_b.sent()).signature,
                        _a.data = data,
                        _a)];
            }
        });
    });
}
exports.getSignedRequest = getSignedRequest;
