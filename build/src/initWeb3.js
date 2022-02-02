"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWeb3 = void 0;
var contracts_1 = __importDefault(require("./contracts"));
var ArcaneRaidV1_json_1 = __importDefault(require("../contracts/ArcaneRaidV1.json"));
var ArcaneTraderV1_json_1 = __importDefault(require("../contracts/ArcaneTraderV1.json"));
var ArcaneCharacters_json_1 = __importDefault(require("../contracts/ArcaneCharacters.json"));
var ArcaneCharacterFactoryV3_json_1 = __importDefault(require("../contracts/ArcaneCharacterFactoryV3.json"));
var ArcaneBarracksFacetV1_json_1 = __importDefault(require("../contracts/ArcaneBarracksFacetV1.json"));
var ArcaneProfile_json_1 = __importDefault(require("../contracts/ArcaneProfile.json"));
var ArcaneItems_json_1 = __importDefault(require("../contracts/ArcaneItems.json"));
var BEP20_json_1 = __importDefault(require("../contracts/BEP20.json"));
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
}
exports.initWeb3 = initWeb3;
