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
exports.getAllMarketEvents = void 0;
var ethers_1 = __importDefault(require("ethers"));
var util_1 = require("../util");
var web3_1 = require("../util/web3");
var decodeItem_1 = require("../util/decodeItem");
function getAllMarketEvents(app) {
    return __awaiter(this, void 0, void 0, function () {
        // @ts-ignore
        function processLog(log, updateConfig) {
            if (updateConfig === void 0) { updateConfig = true; }
            return __awaiter(this, void 0, void 0, function () {
                var e, _a, seller_1, buyer, tokenId_1, price, trade, _b, seller_2, buyer, tokenId_2, price, specificTrades, _i, specificTrades_1, specificTrade, _c, seller_3, buyer, tokenId_3, price, specificTrades, _d, specificTrades_2, specificTrade, _e, seller_4, buyer, tokenId_4, price, specificTrades, _f, specificTrades_3, specificTrade, e2;
                return __generator(this, function (_g) {
                    switch (_g.label) {
                        case 0:
                            e = iface_1.parseLog(log);
                            log(e.name, e.args.tokenId);
                            if (!(e.name === 'List')) return [3 /*break*/, 5];
                            _a = e.args, seller_1 = _a.seller, buyer = _a.buyer, tokenId_1 = _a.tokenId, price = _a.price;
                            trade = app.db.trades.find(function (t) { return t.seller.toLowerCase() === seller_1.toLowerCase() && t.tokenId === tokenId_1.toString(); });
                            if (!(!trade || trade.blockNumber < log.blockNumber)) return [3 /*break*/, 5];
                            trade = {
                                id: (0, util_1.getHighestId)(app.db.trades) + 1
                            };
                            trade.seller = seller_1;
                            trade.buyer = buyer;
                            trade.tokenId = tokenId_1.toString();
                            trade.price = (0, util_1.toShort)(price);
                            trade.status = "available";
                            trade.hotness = 0;
                            trade.createdAt = new Date().getTime();
                            trade.updatedAt = new Date().getTime();
                            trade.blockNumber = log.blockNumber;
                            trade.item = { id: (0, decodeItem_1.decodeItem)(tokenId_1.toString()).id };
                            // trade.item = decodeItem(trade.tokenId)
                            app.db.trades.push(trade);
                            log('Adding trade', trade);
                            return [4 /*yield*/, app.db.saveUserTrade(app.db.loadUser(seller_1), trade)];
                        case 1:
                            _g.sent();
                            return [4 /*yield*/, app.db.saveTokenTrade(app.db.loadToken(trade.tokenId), trade)];
                        case 2:
                            _g.sent();
                            return [4 /*yield*/, app.db.saveItemTrade(app.db.loadItem(trade.item.id), trade)];
                        case 3:
                            _g.sent();
                            return [4 /*yield*/, app.db.saveItemToken(app.db.loadItem(trade.item.id), { id: trade.tokenId, item: trade.item })
                                // await saveConfig()
                            ];
                        case 4:
                            _g.sent();
                            // await saveConfig()
                            log('List', trade);
                            _g.label = 5;
                        case 5:
                            if (!(e.name === 'Update')) return [3 /*break*/, 12];
                            _b = e.args, seller_2 = _b.seller, buyer = _b.buyer, tokenId_2 = _b.tokenId, price = _b.price;
                            specificTrades = app.db.trades.find(function (t) { return t.seller.toLowerCase() === seller_2.toLowerCase() && t.tokenId === tokenId_2.toString() && t.status === 'available' && t.blockNumber < log.blockNumber; });
                            _i = 0, specificTrades_1 = specificTrades;
                            _g.label = 6;
                        case 6:
                            if (!(_i < specificTrades_1.length)) return [3 /*break*/, 12];
                            specificTrade = specificTrades_1[_i];
                            specificTrade.buyer = buyer;
                            specificTrade.price = (0, util_1.toShort)(price);
                            specificTrade.updatedAt = new Date().getTime();
                            specificTrade.blockNumber = log.blockNumber;
                            specificTrade.item = { id: (0, decodeItem_1.decodeItem)(tokenId_2.toString()).id };
                            // specificTrade.item = decodeItem(specificTrade.tokenId)
                            return [4 /*yield*/, app.db.saveUserTrade(app.db.loadUser(seller_2), specificTrade)];
                        case 7:
                            // specificTrade.item = decodeItem(specificTrade.tokenId)
                            _g.sent();
                            return [4 /*yield*/, app.db.saveTokenTrade(app.db.loadToken(specificTrade.tokenId), specificTrade)];
                        case 8:
                            _g.sent();
                            return [4 /*yield*/, app.db.saveItemTrade(app.db.loadItem(specificTrade.item.id), specificTrade)];
                        case 9:
                            _g.sent();
                            return [4 /*yield*/, app.db.saveItemToken(app.db.loadItem(specificTrade.item.id), { id: specificTrade.tokenId, item: specificTrade.item })];
                        case 10:
                            _g.sent();
                            log('Update', specificTrade);
                            _g.label = 11;
                        case 11:
                            _i++;
                            return [3 /*break*/, 6];
                        case 12:
                            if (!(e.name === 'Delist')) return [3 /*break*/, 19];
                            _c = e.args, seller_3 = _c.seller, buyer = _c.buyer, tokenId_3 = _c.tokenId, price = _c.price;
                            specificTrades = app.db.trades.filter(function (t) { return t.seller.toLowerCase() === seller_3.toLowerCase() && t.tokenId === tokenId_3.toString() && t.status === 'available' && t.blockNumber < log.blockNumber; });
                            _d = 0, specificTrades_2 = specificTrades;
                            _g.label = 13;
                        case 13:
                            if (!(_d < specificTrades_2.length)) return [3 /*break*/, 19];
                            specificTrade = specificTrades_2[_d];
                            specificTrade.status = "delisted";
                            specificTrade.updatedAt = new Date().getTime();
                            specificTrade.blockNumber = log.blockNumber;
                            specificTrade.item = { id: (0, decodeItem_1.decodeItem)(tokenId_3.toString()).id };
                            // specificTrade.item = decodeItem(specificTrade.tokenId)
                            log('Delisting trade', specificTrade);
                            return [4 /*yield*/, app.db.saveUserTrade(app.db.loadUser(seller_3), specificTrade)];
                        case 14:
                            _g.sent();
                            return [4 /*yield*/, app.db.saveTokenTrade(app.db.loadToken(specificTrade.tokenId), specificTrade)];
                        case 15:
                            _g.sent();
                            return [4 /*yield*/, app.db.saveItemTrade(app.db.loadItem(specificTrade.item.id), specificTrade)];
                        case 16:
                            _g.sent();
                            return [4 /*yield*/, app.db.saveItemToken(app.db.loadItem(specificTrade.item.id), { id: specificTrade.tokenId, item: specificTrade.item })];
                        case 17:
                            _g.sent();
                            log('Delist', specificTrade);
                            _g.label = 18;
                        case 18:
                            _d++;
                            return [3 /*break*/, 13];
                        case 19:
                            if (!(e.name === 'Buy')) return [3 /*break*/, 27];
                            _e = e.args, seller_4 = _e.seller, buyer = _e.buyer, tokenId_4 = _e.tokenId, price = _e.price;
                            specificTrades = app.db.trades.filter(function (t) { return t.seller.toLowerCase() === seller_4.toLowerCase() && t.tokenId === tokenId_4.toString() && t.status === 'available' && t.blockNumber < log.blockNumber; });
                            _f = 0, specificTrades_3 = specificTrades;
                            _g.label = 20;
                        case 20:
                            if (!(_f < specificTrades_3.length)) return [3 /*break*/, 27];
                            specificTrade = specificTrades_3[_f];
                            specificTrade.status = "sold";
                            specificTrade.buyer = buyer;
                            specificTrade.updatedAt = new Date().getTime();
                            specificTrade.blockNumber = log.blockNumber;
                            specificTrade.item = { id: (0, decodeItem_1.decodeItem)(tokenId_4.toString()).id };
                            // specificTrade.item = decodeItem(specificTrade.tokenId)
                            return [4 /*yield*/, app.db.saveUserTrade(app.db.loadUser(seller_4), specificTrade)];
                        case 21:
                            // specificTrade.item = decodeItem(specificTrade.tokenId)
                            _g.sent();
                            return [4 /*yield*/, app.db.saveUserTrade(app.db.loadUser(buyer), specificTrade)];
                        case 22:
                            _g.sent();
                            return [4 /*yield*/, app.db.saveTokenTrade(app.db.loadToken(specificTrade.tokenId), specificTrade)];
                        case 23:
                            _g.sent();
                            return [4 /*yield*/, app.db.saveItemTrade(app.db.loadItem(specificTrade.item.id), specificTrade)];
                        case 24:
                            _g.sent();
                            return [4 /*yield*/, app.db.saveItemToken(app.db.loadItem(specificTrade.item.id), { id: specificTrade.tokenId, item: specificTrade.item })];
                        case 25:
                            _g.sent();
                            log('Buy', specificTrade);
                            _g.label = 26;
                        case 26:
                            _f++;
                            return [3 /*break*/, 20];
                        case 27:
                            e2 = app.db.tradesEvents.find(function (t) { return t.transactionHash === log.transactionHash; });
                            if (!e2) {
                                app.db.tradesEvents.push(__assign(__assign({}, log), e));
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
                    if (app.config.trades.updating)
                        return [2 /*return*/];
                    (0, util_1.log)('[Market] Updating');
                    app.config.trades.updating = true;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    iface_1 = new ethers_1.default.utils.Interface(app.contractInstance.ArcaneTraderV1.abi);
                    return [4 /*yield*/, app.web3.eth.getBlockNumber()];
                case 2:
                    blockNumber = _a.sent();
                    events = [
                        'List(address,address,uint256,uint256)',
                        'Update(address,address,uint256,uint256)',
                        'Delist(address,uint256)',
                        'Buy(address,address,uint256,uint256)',
                    ];
                    _loop_1 = function (event_1) {
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, (0, web3_1.iterateBlocks)(app.web3Provider.getLogs, "Market Events: ".concat(event_1), (0, web3_1.getAddress)(app.contracts.trader), app.config.trades.lastBlock[event_1], blockNumber, app.contracts.arcaneTrader.filters[event_1](), processLog, function (blockNumber2) {
                                        return __awaiter(this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                app.config.trades.lastBlock[event_1] = blockNumber2;
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
                    app.config.trades.updating = false;
                    app.config.trades.updatedDate = (new Date()).toString();
                    app.config.trades.updatedTimestamp = new Date().getTime();
                    // await saveTrades()
                    // await saveConfig()
                    setTimeout(function () { return getAllMarketEvents(app); }, 2 * 60 * 1000);
                    return [2 /*return*/];
            }
        });
    });
}
exports.getAllMarketEvents = getAllMarketEvents;
