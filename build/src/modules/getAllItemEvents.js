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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllItemEvents = void 0;
var ethers = __importStar(require("ethers"));
var util_1 = require("../util");
var web3_1 = require("../util/web3");
var decodeItem_1 = require("../util/decodeItem");
function getAllItemEvents(app) {
    return __awaiter(this, void 0, void 0, function () {
        // @ts-ignore
        function processLog(log2, updateConfig) {
            if (updateConfig === void 0) { updateConfig = true; }
            return __awaiter(this, void 0, void 0, function () {
                var e, _a, from, userAddress, tokenId, user, decodedItem, itemData, token, e2, ex_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 7, , 8]);
                            e = iface_1.parseLog(log2);
                            if (!(e.name === 'Transfer')) return [3 /*break*/, 6];
                            _a = e.args, from = _a.from, userAddress = _a.to, tokenId = _a.tokenId;
                            user = app.db.loadUser(userAddress);
                            decodedItem = (0, decodeItem_1.decodeItem)(tokenId.toString());
                            itemData = {
                                owner: userAddress,
                                from: from,
                                status: from === '0x0000000000000000000000000000000000000000' ? "created" : 'transferred_in',
                                tokenId: tokenId.toString(),
                                createdAt: new Date().getTime(),
                                id: decodedItem.id,
                                perfection: decodedItem.perfection
                            };
                            token = app.db.loadToken(itemData.tokenId);
                            if (from === '0x0000000000000000000000000000000000000000') {
                                token.owner = itemData.owner;
                                token.creator = itemData.owner;
                                token.createdAt = itemData.createdAt;
                            }
                            return [4 /*yield*/, app.db.saveUserItem(user, itemData)];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, app.db.saveTokenTransfer(token, itemData)];
                        case 2:
                            _b.sent();
                            if (!(from !== '0x0000000000000000000000000000000000000000')) return [3 /*break*/, 4];
                            return [4 /*yield*/, app.db.saveUserItem(user, __assign(__assign({}, itemData), { status: 'transferred_out' }))];
                        case 3:
                            _b.sent();
                            _b.label = 4;
                        case 4: return [4 /*yield*/, app.db.saveItemOwner(app.db.loadItem(itemData.id), itemData)];
                        case 5:
                            _b.sent();
                            _b.label = 6;
                        case 6:
                            e2 = app.db.itemsEvents.find(function (t) { return t.transactionHash === log2.transactionHash; });
                            if (!e2) {
                                app.db.itemsEvents.push(__assign(__assign({}, log2), e));
                            }
                            return [3 /*break*/, 8];
                        case 7:
                            ex_1 = _b.sent();
                            (0, util_1.logError)(ex_1);
                            (0, util_1.logError)("Error parsing log: ", log2);
                            return [3 /*break*/, 8];
                        case 8: return [2 /*return*/];
                    }
                });
            });
        }
        var contract, iface_1, blockNumber, events, _loop_1, _i, events_1, event_1, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (app.config.items.updating)
                        return [2 /*return*/];
                    (0, util_1.log)('[Items] Updating');
                    app.config.items.updating = true;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    contract = new ethers.Contract((0, web3_1.getAddress)(app.contractInfo.items), app.contractMetadata.ArcaneItems.abi, app.signers.read);
                    iface_1 = new ethers.utils.Interface(app.contractMetadata.ArcaneItems.abi);
                    return [4 /*yield*/, app.web3.eth.getBlockNumber()];
                case 2:
                    blockNumber = _a.sent();
                    events = [
                        'Transfer'
                    ];
                    _loop_1 = function (event_1) {
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, (0, web3_1.iterateBlocks)(app, "Items Events: ".concat(event_1), (0, web3_1.getAddress)(app.contractInfo.items), app.config.items.lastBlock[event_1], blockNumber, contract.filters[event_1](), processLog, function (blockNumber2) {
                                        return __awaiter(this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                app.config.items.lastBlock[event_1] = blockNumber2;
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
                    app.config.items.updating = false;
                    app.config.items.updatedDate = (new Date()).toString();
                    app.config.items.updatedTimestamp = new Date().getTime();
                    // await saveItemsEvents()
                    // await saveConfig()
                    setTimeout(function () { return getAllItemEvents(app); }, 2 * 60 * 1000);
                    return [2 /*return*/];
            }
        });
    });
}
exports.getAllItemEvents = getAllItemEvents;
