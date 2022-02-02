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
exports.initProvider = void 0;
var ethers = __importStar(require("ethers"));
var web3_1 = __importDefault(require("web3"));
var util_1 = require("./util");
var web3_2 = require("./util/web3");
function _initProvider(app) {
    try {
        (0, util_1.log)('Setting up provider');
        app.provider = (0, web3_2.getRandomProvider)();
        app.web3 = new web3_1.default(app.provider);
        app.web3Provider = new ethers.providers.Web3Provider((0, web3_2.getRandomProvider)(), "any");
        app.web3Provider.pollingInterval = 15000;
        app.signers.read = app.web3Provider.getSigner();
        app.signers.write = app.web3Provider.getSigner();
        app.contracts.arcaneItems = new ethers.Contract((0, web3_2.getAddress)(app.contractInfo.items), app.contractMetadata.ArcaneItems.abi, app.signers.read);
        app.contracts.arcaneCharacters = new ethers.Contract((0, web3_2.getAddress)(app.contractInfo.characters), app.contractMetadata.ArcaneCharacters.abi, app.signers.read);
        app.contracts.arcaneBarracks = new ethers.Contract((0, web3_2.getAddress)(app.contractInfo.barracks), app.contractMetadata.ArcaneBarracksFacetV1.abi, app.signers.read);
        app.contracts.arcaneTrader = new ethers.Contract((0, web3_2.getAddress)(app.contractInfo.trader), app.contractMetadata.ArcaneTraderV1.abi, app.signers.read);
        app.contracts.arcaneCharacterFactory = new ethers.Contract((0, web3_2.getAddress)(app.contractInfo.characterFactory), app.contractMetadata.ArcaneCharacterFactoryV3.abi, app.signers.read);
        app.contracts.arcaneProfile = new ethers.Contract((0, web3_2.getAddress)(app.contractInfo.profile), app.contractMetadata.ArcaneProfile.abi, app.signers.read);
        app.contracts.busd = new ethers.Contract((0, web3_2.getAddress)(app.contractInfo.busd), app.contractMetadata.BEP20Contract.abi, app.signers.read);
        app.contracts.wbnb = new ethers.Contract((0, web3_2.getAddress)(app.contractInfo.wbnb), app.contractMetadata.BEP20Contract.abi, app.signers.read);
    }
    catch (e) {
        (0, util_1.log)("Couldn't setup provider.");
    }
}
function initProvider(app) {
    _initProvider(app);
    setInterval(function () {
        // Something happened, lets restart the provider
        if (new Date().getTime() > app.config.trades.updatedTimestamp + 10 * 60 * 1000) {
            _initProvider(app);
        }
    }, 15 * 60 * 1000);
}
exports.initProvider = initProvider;
// web3Provider.on("network", (newNetwork, oldNetwork) => {
// When a Provider makes its initial connection, it emits a "network"
// event with a null oldNetwork along with the newNetwork. So, if the
// oldNetwork exists, it represents a changing network
// process.exit()
// });
