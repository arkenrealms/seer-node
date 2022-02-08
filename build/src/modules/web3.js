"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWeb3 = exports.initProvider = void 0;
var ethers = __importStar(require("ethers"));
var web3_1 = __importDefault(require("web3"));
var util_1 = require("../util");
var web3_2 = require("../util/web3");
var contracts_1 = __importDefault(require("../contracts"));
var ArcaneRaidV1_json_1 = __importDefault(require("../../contracts/ArcaneRaidV1.json"));
var ArcaneTraderV1_json_1 = __importDefault(require("../../contracts/ArcaneTraderV1.json"));
var ArcaneCharacters_json_1 = __importDefault(require("../../contracts/ArcaneCharacters.json"));
var ArcaneCharacterFactoryV3_json_1 = __importDefault(require("../../contracts/ArcaneCharacterFactoryV3.json"));
var ArcaneBarracksFacetV1_json_1 = __importDefault(require("../../contracts/ArcaneBarracksFacetV1.json"));
var ArcaneProfile_json_1 = __importDefault(require("../../contracts/ArcaneProfile.json"));
var ArcaneItems_json_1 = __importDefault(require("../../contracts/ArcaneItems.json"));
var BEP20_json_1 = __importDefault(require("../../contracts/BEP20.json"));
function _initProvider(app) {
    try {
        (0, util_1.log)('Setting up provider');
        app.web3Provider = (0, web3_2.getRandomProvider)();
        app.web3 = new web3_1.default(app.web3Provider);
        app.ethersProvider = new ethers.providers.Web3Provider(app.web3Provider, 'any');
        app.ethersProvider.pollingInterval = 15000;
        app.signers = {};
        app.signers.read = app.ethersProvider.getSigner();
        app.signers.write = app.ethersProvider.getSigner();
        app.contracts = {};
        app.contracts.items = new ethers.Contract((0, web3_2.getAddress)(app.contractInfo.items), app.contractMetadata.ArcaneItems.abi, app.signers.read);
        app.contracts.characters = new ethers.Contract((0, web3_2.getAddress)(app.contractInfo.characters), app.contractMetadata.ArcaneCharacters.abi, app.signers.read);
        app.contracts.barracks = new ethers.Contract((0, web3_2.getAddress)(app.contractInfo.barracks), app.contractMetadata.ArcaneBarracksFacetV1.abi, app.signers.read);
        app.contracts.trader = new ethers.Contract((0, web3_2.getAddress)(app.contractInfo.trader), app.contractMetadata.ArcaneTraderV1.abi, app.signers.read);
        app.contracts.characterFactory = new ethers.Contract((0, web3_2.getAddress)(app.contractInfo.characterFactory), app.contractMetadata.ArcaneCharacterFactoryV3.abi, app.signers.read);
        app.contracts.profile = new ethers.Contract((0, web3_2.getAddress)(app.contractInfo.profile), app.contractMetadata.ArcaneProfile.abi, app.signers.read);
        app.contracts.busd = new ethers.Contract((0, web3_2.getAddress)(app.contractInfo.busd), app.contractMetadata.BEP20Contract.abi, app.signers.read);
        app.contracts.wbnb = new ethers.Contract((0, web3_2.getAddress)(app.contractInfo.wbnb), app.contractMetadata.BEP20Contract.abi, app.signers.read);
    }
    catch (e) {
        (0, util_1.log)("Couldn't setup provider.");
    }
}
function initProvider(app) {
    _initProvider(app);
    // setInterval(() => {
    //   // Something happened, lets restart the provider
    //   if (new Date().getTime() > app.config.trades.updatedTimestamp + 10 * 60 * 1000) {
    //     _initProvider(app)
    //   }
    // }, 15 * 60 * 1000)
}
exports.initProvider = initProvider;
// ethersProvider.on("network", (newNetwork, oldNetwork) => {
// When a Provider makes its initial connection, it emits a "network"
// event with a null oldNetwork along with the newNetwork. So, if the
// oldNetwork exists, it represents a changing network
// process.exit()
// });
function initWeb3(app) {
    app.contractInfo = contracts_1.default;
    app.contractMetadata = {};
    app.contractMetadata.ArcaneRaidV1 = ArcaneRaidV1_json_1.default;
    app.contractMetadata.ArcaneTraderV1 = ArcaneTraderV1_json_1.default;
    app.contractMetadata.ArcaneCharacters = ArcaneCharacters_json_1.default;
    app.contractMetadata.ArcaneCharacterFactoryV3 = ArcaneCharacterFactoryV3_json_1.default;
    app.contractMetadata.ArcaneBarracksFacetV1 = ArcaneBarracksFacetV1_json_1.default;
    app.contractMetadata.ArcaneProfile = ArcaneProfile_json_1.default;
    app.contractMetadata.ArcaneItems = ArcaneItems_json_1.default;
    app.contractMetadata.BEP20Contract = BEP20_json_1.default;
    app.signers = {
        read: undefined,
        write: undefined
    };
    initProvider(app);
}
exports.initWeb3 = initWeb3;
