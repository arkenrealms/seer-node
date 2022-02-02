"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.getAllBarracksEvents = void 0;
var ethers_1 = __importDefault(require("ethers"));
var util_1 = require("../util");
var web3_1 = require("../util/web3");
var decodeItem_1 = require("../util/decodeItem");
function getAllBarracksEvents(app) {
    return __awaiter(this, void 0, void 0, function () {
        // @ts-ignore
        function processLog(log, updateConfig) {
            if (updateConfig === void 0) { updateConfig = true; }
            return __awaiter(this, void 0, void 0, function () {
                var e, _a, userAddress, tokenId, itemId, user, item, _b, userAddress, tokenId, itemId, user, item, e2;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            e = iface_1.parseLog(log);
                            if (!(e.name === 'Equip')) return [3 /*break*/, 2];
                            _a = e.args, userAddress = _a.user, tokenId = _a.tokenId, itemId = _a.itemId;
                            user = app.db.loadUser(userAddress);
                            item = {
                                status: "equipped",
                                tokenId: tokenId.toString(),
                                updatedAt: new Date().getTime(),
                                id: (0, decodeItem_1.decodeItem)(tokenId.toString()).id
                            };
                            return [4 /*yield*/, app.db.saveUserItem(user, item)];
                        case 1:
                            _c.sent();
                            _c.label = 2;
                        case 2:
                            if (!(e.name === 'Unequip')) return [3 /*break*/, 4];
                            _b = e.args, userAddress = _b.user, tokenId = _b.tokenId, itemId = _b.itemId;
                            user = app.db.loadUser(userAddress);
                            item = {
                                status: "unequipped",
                                tokenId: tokenId.toString(),
                                itemId: itemId,
                                updatedAt: new Date().getTime(),
                                id: (0, decodeItem_1.decodeItem)(tokenId.toString()).id
                                // ...decodeItem(tokenId.toString())
                            };
                            return [4 /*yield*/, app.db.saveUserItem(user, item)];
                        case 3:
                            _c.sent();
                            _c.label = 4;
                        case 4:
                            if (e.name === 'ActionBurn') {
                            }
                            if (e.name === 'ActionBonus') {
                            }
                            if (e.name === 'ActionHiddenPool') {
                            }
                            if (e.name === 'ActionFee') {
                            }
                            if (e.name === 'ActionSwap') {
                            }
                            e2 = app.db.barracksEvents.find(function (t) { return t.transactionHash === log.transactionHash; });
                            if (!e2) {
                                app.db.barracksEvents.push(__assign(__assign({}, log), e));
                            }
                            return [2 /*return*/];
                    }
                });
            });
        }
        var iface_1, blockNumber, events, _loop_1, _i, events_1, event_1, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (app.config.barracks.updating)
                        return [2 /*return*/];
                    (0, util_1.log)('[Barracks] Updating');
                    app.config.barracks.updating = true;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    iface_1 = new ethers_1.default.utils.Interface(app.contractMetadata.ArcaneBarracksFacetV1.abi);
                    return [4 /*yield*/, app.web3.eth.getBlockNumber()];
                case 2:
                    blockNumber = _a.sent();
                    events = [
                        'Equip(address,uint256,uint16)',
                        'Unequip(address,uint256,uint16)',
                        'ActionBurn(address,uint256)',
                        'ActionBonus(address,uint256)',
                        'ActionHiddenPool(address,uint256)',
                        'ActionFee(address,address,uint256)',
                        'ActionSwap(address,address,uint256)',
                    ];
                    _loop_1 = function (event_1) {
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, (0, web3_1.iterateBlocks)(app.web3Provider.getLogs, "Barracks Events: ".concat(event_1), (0, web3_1.getAddress)(app.contracts.barracks), app.config.barracks.lastBlock[event_1], blockNumber, app.contractMetadata.arcaneBarracks.filters[event_1](), processLog, function (blockNumber2) {
                                        return __awaiter(this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                app.config.barracks.lastBlock[event_1] = blockNumber2;
                                                return [2 /*return*/];
                                            });
                                        });
                                    })];
                                case 1:
                                    _b.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, events_1 = events;
                    _a.label = 3;
                case 3:
                    if (!(_i < events_1.length)) return [3 /*break*/, 6];
                    event_1 = events_1[_i];
                    return [5 /*yield**/, _loop_1(event_1)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    (0, util_1.log)('Finished');
                    return [3 /*break*/, 8];
                case 7:
                    e_1 = _a.sent();
                    (0, util_1.logError)(e_1);
                    return [3 /*break*/, 8];
                case 8:
                    app.config.barracks.updating = false;
                    app.config.barracks.updatedDate = (new Date()).toString();
                    app.config.barracks.updatedTimestamp = new Date().getTime();
                    // await app.db.saveBarracksEvents()
                    // await app.db.saveConfig()
                    setTimeout(function () { return getAllBarracksEvents(app); }, 15 * 60 * 1000);
                    return [2 /*return*/];
            }
        });
    });
}
exports.getAllBarracksEvents = getAllBarracksEvents;
