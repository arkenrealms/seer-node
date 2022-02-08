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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDb = void 0;
var ethers = __importStar(require("ethers"));
var json_beautify_1 = __importDefault(require("json-beautify"));
var fs_jetpack_1 = __importDefault(require("fs-jetpack"));
var path_1 = __importDefault(require("path"));
var util_1 = require("../util");
var decodeItem_1 = require("../util/decodeItem");
var achievements_1 = require("../data/achievements");
var items_1 = require("../data/items");
function initDb(app) {
    var _this = this;
    app.db = {
        app: fs_jetpack_1.default.read(path_1.default.resolve('./db/app.json'), 'json'),
        trades: (0, util_1.removeDupes)(fs_jetpack_1.default.read(path_1.default.resolve('./db/trades.json'), 'json')),
        farms: fs_jetpack_1.default.read(path_1.default.resolve('./db/farms.json'), 'json'),
        runes: fs_jetpack_1.default.read(path_1.default.resolve('./db/runes.json'), 'json'),
        classes: fs_jetpack_1.default.read(path_1.default.resolve('./db/classes.json'), 'json'),
        guilds: fs_jetpack_1.default.read(path_1.default.resolve('./db/guilds.json'), 'json'),
        stats: fs_jetpack_1.default.read(path_1.default.resolve('./db/stats.json'), 'json'),
        historical: fs_jetpack_1.default.read(path_1.default.resolve('./db/historical.json'), 'json'),
        barracksEvents: fs_jetpack_1.default.read(path_1.default.resolve('./db/barracks/events.json'), 'json'),
        blacksmithEvents: fs_jetpack_1.default.read(path_1.default.resolve('./db/blacksmith/events.json'), 'json'),
        raidEvents: fs_jetpack_1.default.read(path_1.default.resolve('./db/raid/events.json'), 'json'),
        guildsEvents: fs_jetpack_1.default.read(path_1.default.resolve('./db/guilds/events.json'), 'json'),
        itemsEvents: fs_jetpack_1.default.read(path_1.default.resolve('./db/items/events.json'), 'json'),
        charactersEvents: fs_jetpack_1.default.read(path_1.default.resolve('./db/characters/events.json'), 'json'),
        usersEvents: fs_jetpack_1.default.read(path_1.default.resolve('./db/users/events.json'), 'json'),
        tradesEvents: fs_jetpack_1.default.read(path_1.default.resolve('./db/trades/events.json'), 'json'),
        evolutionLeaderboardHistory: fs_jetpack_1.default.read(path_1.default.resolve('./db/evolution/leaderboardHistory.json'), 'json'),
        evolutionRewardHistory: fs_jetpack_1.default.read(path_1.default.resolve('./db/evolution/rewardHistory.json'), 'json'),
        evolutionHistorical: fs_jetpack_1.default.read(path_1.default.resolve('./db/evolution/historical.json'), 'json'),
        evolutionServers: fs_jetpack_1.default.read(path_1.default.resolve('./db/evolution/servers.json'), 'json'),
        evolution: {
            banList: [],
            modList: ['0xDfA8f768d82D719DC68E12B199090bDc3691fFc7']
        },
        infinite: {
            banList: [],
            modList: ['0xDfA8f768d82D719DC68E12B199090bDc3691fFc7']
        },
        sanctuary: {
            banList: [],
            modList: []
        },
        guardians: {
            banList: [],
            modList: []
        },
        raid: {
            banList: [],
            modList: ['0xDfA8f768d82D719DC68E12B199090bDc3691fFc7']
        }
    };
    app.db.saveConfig = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            app.config.updatedDate = (new Date()).toString();
            app.config.updatedTimestamp = new Date().getTime();
            fs_jetpack_1.default.write(path_1.default.resolve('./db/config.json'), (0, json_beautify_1.default)(app.config, null, 2, 100), { atomic: true });
            return [2 /*return*/];
        });
    }); };
    app.db.saveTrades = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            fs_jetpack_1.default.write(path_1.default.resolve('./db/trades.json'), (0, json_beautify_1.default)((0, util_1.removeDupes)(app.db.trades), null, 2, 100), { atomic: true });
            return [2 /*return*/];
        });
    }); };
    app.db.saveTradesEvents = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            fs_jetpack_1.default.write(path_1.default.resolve('./db/trades/events.json'), (0, json_beautify_1.default)(app.db.tradesEvents, null, 2, 100), { atomic: true });
            return [2 /*return*/];
        });
    }); };
    app.db.saveBarracksEvents = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            fs_jetpack_1.default.write(path_1.default.resolve('./db/barracks/events.json'), (0, json_beautify_1.default)(app.db.barracksEvents, null, 2, 100), { atomic: true });
            return [2 /*return*/];
        });
    }); };
    app.db.saveCharactersEvents = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            fs_jetpack_1.default.write(path_1.default.resolve('./db/characters/events.json'), (0, json_beautify_1.default)(app.db.charactersEvents, null, 2, 100), { atomic: true });
            return [2 /*return*/];
        });
    }); };
    app.db.saveItemsEvents = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            fs_jetpack_1.default.write(path_1.default.resolve('./db/items/events.json'), (0, json_beautify_1.default)(app.db.itemsEvents, null, 2, 100), { atomic: true });
            return [2 /*return*/];
        });
    }); };
    app.db.saveFarms = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            fs_jetpack_1.default.write(path_1.default.resolve('./db/farms.json'), (0, json_beautify_1.default)(app.db.farms, null, 2, 100), { atomic: true });
            return [2 /*return*/];
        });
    }); };
    app.db.saveGuilds = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            fs_jetpack_1.default.write(path_1.default.resolve('./db/guilds.json'), (0, json_beautify_1.default)(app.db.guilds, null, 2, 100), { atomic: true });
            return [2 /*return*/];
        });
    }); };
    app.db.saveRunes = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            fs_jetpack_1.default.write(path_1.default.resolve('./db/runes.json'), (0, json_beautify_1.default)(app.db.runes, null, 2, 100), { atomic: true });
            return [2 /*return*/];
        });
    }); };
    app.db.saveStats = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            fs_jetpack_1.default.write(path_1.default.resolve('./db/stats.json'), (0, json_beautify_1.default)(app.db.stats, null, 2, 100), { atomic: true });
            return [2 /*return*/];
        });
    }); };
    app.db.saveHistorical = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            fs_jetpack_1.default.write(path_1.default.resolve('./db/historical.json'), (0, json_beautify_1.default)(app.db.historical, null, 2, 100), { atomic: true });
            return [2 /*return*/];
        });
    }); };
    app.db.saveApp = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            fs_jetpack_1.default.write(path_1.default.resolve('./db/app.json'), (0, json_beautify_1.default)(app, null, 2, 100), { atomic: true });
            return [2 /*return*/];
        });
    }); };
    app.db.updateLeaderboardByUser = function (user) { return __awaiter(_this, void 0, void 0, function () {
        var leaderboard;
        return __generator(this, function (_a) {
            leaderboard = __assign({ mostInventoryItems: {
                    value: 0,
                    address: null
                }, mostMarketItemsListed: {
                    value: 0,
                    address: null
                }, mostMarketItemsSold: {
                    value: 0,
                    address: null
                }, mostItemsTransferred: {
                    value: 0,
                    address: null
                }, mostItemsCrafted: {
                    value: 0,
                    address: null
                }, mostCharactersCreated: {
                    value: 0,
                    address: null
                }, mostItemsCraftedByItemId: {
                    1: {
                        value: 0,
                        address: null
                    }
                }, mostPerfectItemsAttained: {
                    value: 0,
                    address: null
                }, mostPerfectItemsCrafted: {
                    value: 0,
                    address: null
                }, highestAveragePefectionScore: {
                    value: 0,
                    address: null
                }, top10Crafters: {
                    since: 1622310971556,
                    list: []
                }, top10CraftersByItemId: {
                    since: 1622310971556,
                    list: []
                } }, (fs_jetpack_1.default.read(path_1.default.resolve("./db/leaderboard.json"), 'json') || {}));
            if (user.inventoryItemCount > leaderboard.mostInventoryItems.value) {
                leaderboard.mostInventoryItems.value = user.inventoryItemCount;
                leaderboard.mostInventoryItems.address = user.address;
            }
            if (user.marketTradeListedCount > leaderboard.mostMarketItemsListed.value) {
                leaderboard.mostMarketItemsListed.value = user.marketTradeListedCount;
                leaderboard.mostMarketItemsListed.address = user.address;
            }
            if (user.marketTradeSoldCount > leaderboard.mostMarketItemsSold.value) {
                leaderboard.mostMarketItemsSold.value = user.marketTradeSoldCount;
                leaderboard.mostMarketItemsSold.address = user.address;
            }
            if (user.transferredOutCount > leaderboard.mostItemsTransferred.value && user.address !== '0x85C07b6a475Ee19218D0ef9C278C7e58715Af842') {
                leaderboard.mostItemsTransferred.value = user.transferredOutCount;
                leaderboard.mostItemsTransferred.address = user.address;
            }
            fs_jetpack_1.default.write(path_1.default.resolve("./db/leaderboard.json"), (0, json_beautify_1.default)(leaderboard, null, 2), { atomic: true });
            return [2 /*return*/];
        });
    }); };
    app.db.loadCharacter = function (characterId) {
        return __assign(__assign({ id: characterId, ownersCount: 0 }, (fs_jetpack_1.default.read(path_1.default.resolve("./db/characters/".concat(characterId, "/overview.json")), 'json') || {})), { owners: (fs_jetpack_1.default.read(path_1.default.resolve("./db/characters/".concat(characterId, "/owners.json")), 'json') || []) });
    };
    app.db.saveCharacter = function (character) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            fs_jetpack_1.default.write(path_1.default.resolve("./db/characters/".concat(character.id, "/overview.json")), (0, json_beautify_1.default)(__assign(__assign({}, character), { owners: undefined, ownersCount: character.owners.length }), null, 2), { atomic: true });
            fs_jetpack_1.default.write(path_1.default.resolve("./db/characters/".concat(character.id, "/owners.json")), (0, json_beautify_1.default)(character.owners, null, 2), { atomic: true });
            return [2 /*return*/];
        });
    }); };
    app.db.saveCharacterOwner = function (character, characterData) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!character.owners.find(function (o) { return o === characterData.owner; })) {
                        character.owners.push(characterData.owner);
                        character.owners = character.owners.filter(function (o) { return o != characterData.from; });
                    }
                    return [4 /*yield*/, app.db.saveCharacter(character)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    app.db.loadItem = function (itemId) {
        return __assign(__assign({ id: itemId, perfectCount: 0, ownersCount: 0, marketTradesListedCount: 0, marketTradesSoldCount: 0 }, (fs_jetpack_1.default.read(path_1.default.resolve("./db/items/".concat(itemId, "/overview.json")), 'json') || {})), { owners: (fs_jetpack_1.default.read(path_1.default.resolve("./db/items/".concat(itemId, "/owners.json")), 'json') || []), market: (fs_jetpack_1.default.read(path_1.default.resolve("./db/items/".concat(itemId, "/market.json")), 'json') || []), tokens: (fs_jetpack_1.default.read(path_1.default.resolve("./db/items/".concat(itemId, "/tokens.json")), 'json') || []) });
    };
    app.db.saveItem = function (item) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            fs_jetpack_1.default.write(path_1.default.resolve("./db/items/".concat(item.id, "/overview.json")), (0, json_beautify_1.default)(__assign(__assign({}, item), { owners: undefined, market: undefined, tokens: undefined, perfectCount: item.tokens.filter(function (i) { return i.item.perfection === 1; }).length, ownersCount: item.owners.length, marketTradesPerfectCount: item.market.filter(function (i) { return i.item.perfection === 1; }).length, marketTradesListedCount: item.market.filter(function (i) { return i.status === 'listed'; }).length, marketTradesSoldCount: item.market.filter(function (i) { return i.status === 'sold'; }).length }), null, 2), { atomic: true });
            fs_jetpack_1.default.write(path_1.default.resolve("./db/items/".concat(item.id, "/owners.json")), (0, json_beautify_1.default)(item.owners, null, 2), { atomic: true });
            fs_jetpack_1.default.write(path_1.default.resolve("./db/items/".concat(item.id, "/market.json")), (0, json_beautify_1.default)(item.market, null, 2), { atomic: true });
            fs_jetpack_1.default.write(path_1.default.resolve("./db/items/".concat(item.id, "/tokens.json")), (0, json_beautify_1.default)(item.tokens, null, 2), { atomic: true });
            return [2 /*return*/];
        });
    }); };
    app.db.saveItemOwner = function (item, itemData) { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!item.owners.find(function (o) { return o === itemData.owner; })) {
                        item.owners.push(itemData.owner);
                        item.owners = item.owners.filter(function (o) { return o != itemData.from; });
                    }
                    if (!app.db.stats.items[item.id])
                        app.db.stats.items[item.id] = {};
                    _a = app.db.stats.items[item.id];
                    return [4 /*yield*/, app.contracts.items.itemCount(item.id)];
                case 1:
                    _a.total = (_b.sent()).toNumber();
                    app.db.stats.items[item.id].burned = 0; //(await items.itemBurnCount(item.id)).toNumber()
                    return [4 /*yield*/, app.db.saveItem(item)];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    app.db.saveItemTrade = function (item, trade) { return __awaiter(_this, void 0, void 0, function () {
        var found, _i, _a, key;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    found = item.market.find(function (i) { return i.seller === trade.seller && i.buyer === trade.buyer && i.tokenId === trade.tokenId; });
                    if (found) {
                        for (_i = 0, _a = Object.keys(trade); _i < _a.length; _i++) {
                            key = _a[_i];
                            found[key] = trade[key];
                        }
                    }
                    else {
                        item.market.push(trade);
                    }
                    return [4 /*yield*/, app.db.saveItem(item)];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    app.db.saveItemToken = function (item, token) { return __awaiter(_this, void 0, void 0, function () {
        var found, _i, _a, key;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    found = item.tokens.find(function (i) { return i.id === token.id; });
                    if (found) {
                        for (_i = 0, _a = Object.keys(token); _i < _a.length; _i++) {
                            key = _a[_i];
                            found[key] = token[key];
                        }
                    }
                    else {
                        item.tokens.push(token);
                    }
                    return [4 /*yield*/, app.db.saveItem(item)];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    app.db.loadToken = function (tokenId) {
        return __assign(__assign({ id: tokenId, ownersCount: 0, marketTradesListedCount: 0, marketTradesSoldCount: 0 }, (fs_jetpack_1.default.read(path_1.default.resolve("./db/tokens/".concat(tokenId, "/overview.json")), 'json') || {})), { transfers: (fs_jetpack_1.default.read(path_1.default.resolve("./db/tokens/".concat(tokenId, "/transfers.json")), 'json') || []), trades: (fs_jetpack_1.default.read(path_1.default.resolve("./db/tokens/".concat(tokenId, "/trades.json")), 'json') || []), meta: (fs_jetpack_1.default.read(path_1.default.resolve("./db/tokens/".concat(tokenId, "/meta.json")), 'json') || {}) });
    };
    app.db.updateTokenMeta = function (token) { return __awaiter(_this, void 0, void 0, function () {
        var item;
        return __generator(this, function (_a) {
            try {
                item = (0, decodeItem_1.decodeItem)(token.id);
                item.icon = item.icon.replace('undefined', 'https://rune.game/');
                if (item.recipe) {
                    item.recipe.requirement = item.recipe.requirement.map(function (r) { return (__assign(__assign({}, r), { id: items_1.RuneNames[r.id] })); });
                }
                item.branches[1].attributes.map(function (a) { return (__assign(__assign({}, a), { description: items_1.ItemAttributesById[a.id].description })); });
                token.meta = __assign(__assign({ "description": Array.isArray(item.branches[1].description) ? item.branches[1].description[0] : item.branches[1].description, "home_url": "https://rune.game", "external_url": "https://rune.game/token/" + token.id, "image_url": item.icon, "language": "en-US" }, item), { "type": items_1.ItemTypeToText[item.type], "slots": item.slots.map(function (s) { return items_1.ItemSlotToText[s]; }) });
                delete token.meta.category;
                delete token.meta.value;
                delete token.meta.hotness;
                delete token.meta.createdDate;
                token.meta.attributes = token.meta.attributes.map(function (a) { return (__assign(__assign({}, a), { trait_type: a.description.replace('{value}% ', '').replace(': {value}', '').replace('{value} ', '') })); });
            }
            catch (e) {
            }
            return [2 /*return*/];
        });
    }); };
    app.db.saveToken = function (token) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            app.db.updateTokenMeta(token);
            fs_jetpack_1.default.write(path_1.default.resolve("./db/tokens/".concat(token.id, "/overview.json")), (0, json_beautify_1.default)(__assign(__assign({}, token), { transfers: undefined, trades: undefined, meta: undefined }), null, 2), { atomic: true });
            fs_jetpack_1.default.write(path_1.default.resolve("./db/tokens/".concat(token.id, "/transfers.json")), (0, json_beautify_1.default)(token.transfers, null, 2), { atomic: true });
            fs_jetpack_1.default.write(path_1.default.resolve("./db/tokens/".concat(token.id, "/trades.json")), (0, json_beautify_1.default)(token.trades, null, 2), { atomic: true });
            fs_jetpack_1.default.write(path_1.default.resolve("./db/tokens/".concat(token.id, "/meta.json")), (0, json_beautify_1.default)(token.meta, null, 2), { atomic: true });
            return [2 /*return*/];
        });
    }); };
    app.db.saveTokenTrade = function (token, trade) { return __awaiter(_this, void 0, void 0, function () {
        var found, _i, _a, key;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    found = token.trades.find(function (i) { return i.seller === trade.seller && i.buyer === trade.buyer && i.tokenId === trade.tokenId; });
                    if (found) {
                        for (_i = 0, _a = Object.keys(trade); _i < _a.length; _i++) {
                            key = _a[_i];
                            found[key] = trade[key];
                        }
                    }
                    else {
                        token.trades.push(trade);
                    }
                    return [4 /*yield*/, app.db.saveToken(token)];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    app.db.saveTokenTransfer = function (token, itemData) { return __awaiter(_this, void 0, void 0, function () {
        var found, _i, _a, key;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    found = token.transfers.find(function (i) { return i.owner === itemData.owner && i.tokenId === itemData.tokenId; });
                    if (found) {
                        for (_i = 0, _a = Object.keys(itemData); _i < _a.length; _i++) {
                            key = _a[_i];
                            found[key] = itemData[key];
                        }
                    }
                    else {
                        token.transfers.push(itemData);
                    }
                    return [4 /*yield*/, app.db.saveToken(token)];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    app.db.loadUser = function (address) {
        return __assign(__assign({ address: address, inventoryItemCount: 0, equippedItemCount: 0, marketTradeListedCount: 0, marketTradeSoldCount: 0, transferredOutCount: 0, holdings: {}, points: 0, username: undefined, guildId: undefined, joinedGuildAt: undefined, isGuildMembershipActive: false, guildMembershipTokenId: null, rewardHistory: [], rewards: {
                runes: {},
                items: {}
            }, lifetimeRewards: {
                runes: {},
                items: {}
            } }, (fs_jetpack_1.default.read(path_1.default.resolve("./db/users/".concat(address, "/overview.json")), 'json') || {})), { achievements: (fs_jetpack_1.default.read(path_1.default.resolve("./db/users/".concat(address, "/achievements.json")), 'json') || []), characters: (fs_jetpack_1.default.read(path_1.default.resolve("./db/users/".concat(address, "/characters.json")), 'json') || []), evolution: (fs_jetpack_1.default.read(path_1.default.resolve("./db/users/".concat(address, "/evolution.json")), 'json') || {}), inventory: __assign({ items: [] }, (fs_jetpack_1.default.read(path_1.default.resolve("./db/users/".concat(address, "/inventory.json")), 'json') || {})), market: __assign({ trades: [] }, (fs_jetpack_1.default.read(path_1.default.resolve("./db/users/".concat(address, "/market.json")), 'json') || {})) });
    };
    var guildInfoMap = {
        1: {
            name: "The First Ones",
            description: "Formed after the discovery of a cache of hidden texts in an abandoned, secret Horadric meeting place. This group of scholars was brought together by Bin Zy.",
            icon: 'https://rune.game/images/teams/the-first-ones.png',
            backgroundColor: '#fff',
            discord: {
                role: '862170863827025950',
                channel: '862153263804448769'
            }
        },
        2: {
            name: "The Archivists",
            description: "The Archivists are an order based in Westmarch. These brave souls wade into battle wielding tome and quill, armored not in ensorcelled plate or links of chain, but in the knowledge of generations past. These archivists fight not only for the future of humanity, but for mankind's past as well. The members of their honored fraternity are many, and their numbers grow every day.",
            icon: 'https://rune.game/images/teams/the-first-ones.png',
            backgroundColor: '#fff',
            discord: {
                role: '862171000446779394',
                channel: '862153353264627732'
            }
        },
        3: {
            name: "Knights of Westmarch",
            description: "Pure at heart, during the\u00A0Darkening of Tristrum, the knights closely followed the teachings of the\u00A0Zakaram.\u00A0The knights have since become a largely secular order, more focused on defending Westmarch from physical rather than spiritual harm.\u00A0They are led by a knight commander.",
            icon: 'https://rune.game/images/teams/knights-of-westmarch.png',
            backgroundColor: '#fff',
            discord: {
                role: '862171051450040320',
                channel: '862153403030700062'
            }
        },
        4: {
            name: "The Protectors",
            description: "After the destruction of the Worldstone, these survivors banded together to find and protect the Worldstone shards from falling into the hands of evil.",
            icon: 'https://rune.game/images/teams/the-protectors.png',
            backgroundColor: '#fff',
            discord: {
                role: '',
                channel: ''
            }
        },
        5: {
            name: "The Destroyers",
            description: "After the destruction of the Worldstone, these dark souls serve Hell in the destruction of all living things.",
            icon: 'https://rune.game/images/teams/the-destroyers.png',
            backgroundColor: '#fff',
            discord: {
                role: '',
                channel: ''
            }
        }
    };
    app.db.loadGuild = function (id) {
        (0, util_1.log)('Loading guild', id);
        return __assign(__assign(__assign({ id: id, memberCount: 0, activeMemberCount: 0, points: 0 }, guildInfoMap[id]), (fs_jetpack_1.default.read(path_1.default.resolve("./db/guilds/".concat(id, "/overview.json")), 'json') || {})), { members: (fs_jetpack_1.default.read(path_1.default.resolve("./db/guilds/".concat(id, "/members.json")), 'json') || []), memberDetails: (fs_jetpack_1.default.read(path_1.default.resolve("./db/guilds/".concat(id, "/memberDetails.json")), 'json') || []) });
    };
    app.db.addGuildMember = function (guild, user) {
        if (!guild.members.includes(user.address)) {
            guild.members.push(user.address);
        }
    };
    app.db.saveGuild = function (guild) { return __awaiter(_this, void 0, void 0, function () {
        var g;
        return __generator(this, function (_a) {
            (0, util_1.log)('Saving guild', guild.name);
            app.db.updateAchievementsByGuild(guild);
            fs_jetpack_1.default.write(path_1.default.resolve("./db/guilds/".concat(guild.id, "/overview.json")), (0, json_beautify_1.default)(__assign(__assign({}, guild), { memberCount: guild.members.length, activeMemberCount: guild.memberDetails.filter(function (m) { return m.achievementCount > 0; }).length, members: undefined }), null, 2), { atomic: true });
            fs_jetpack_1.default.write(path_1.default.resolve("./db/guilds/".concat(guild.id, "/members.json")), (0, json_beautify_1.default)(guild.members, null, 2), { atomic: true });
            fs_jetpack_1.default.write(path_1.default.resolve("./db/guilds/".concat(guild.id, "/memberDetails.json")), (0, json_beautify_1.default)(guild.memberDetails, null, 2), { atomic: true });
            g = app.db.guilds.find(function (g2) { return g2.id === guild.id; });
            if (!g) {
                g = {};
                app.db.guilds.push(g);
            }
            g.id = guild.id;
            g.memberCount = guild.memberCount;
            g.activeMemberCount = guild.activeMemberCount;
            return [2 /*return*/];
        });
    }); };
    app.db.updateAchievementsByGuild = function (guild) {
        var points = 0;
        for (var _i = 0, _a = guild.members; _i < _a.length; _i++) {
            var member = _a[_i];
            var user = app.db.loadUser(member);
            if (!(user === null || user === void 0 ? void 0 : user.points) || user.points === null)
                continue;
            points += user.points;
        }
        guild.points = points;
    };
    app.db.updateAchievementsByUser = function (user) { return __awaiter(_this, void 0, void 0, function () {
        var _a, _b, _c, _d, _e, _f, _g;
        return __generator(this, function (_h) {
            if (!app.db.hasUserAchievement(user, 'CRAFT_1') && user.craftedItemCount >= 1) {
                app.db.addUserAchievement(user, 'CRAFT_1');
            }
            if (!app.db.hasUserAchievement(user, 'CRAFT_10') && user.craftedItemCount >= 10) {
                app.db.addUserAchievement(user, 'CRAFT_10');
            }
            if (!app.db.hasUserAchievement(user, 'CRAFT_100') && user.craftedItemCount >= 100) {
                app.db.addUserAchievement(user, 'CRAFT_100');
            }
            if (!app.db.hasUserAchievement(user, 'CRAFT_1000') && user.craftedItemCount >= 1000) {
                app.db.addUserAchievement(user, 'CRAFT_1000');
            }
            if (!app.db.hasUserAchievement(user, 'ACQUIRED_RUNE') && ((_a = user.holdings) === null || _a === void 0 ? void 0 : _a.rune) >= 1) {
                app.db.addUserAchievement(user, 'ACQUIRED_RUNE');
            }
            if (!app.db.hasUserAchievement(user, 'BATTLE_RUNE_EVO')) {
                if (((_c = (_b = user.evolution) === null || _b === void 0 ? void 0 : _b.overall) === null || _c === void 0 ? void 0 : _c.rounds) > 0)
                    app.db.addUserAchievement(user, 'BATTLE_RUNE_EVO');
            }
            if (!app.db.hasUserAchievement(user, 'MEGA_RUNE_EVO')) {
                if (((_e = (_d = user.evolution) === null || _d === void 0 ? void 0 : _d.overall) === null || _e === void 0 ? void 0 : _e.wins) > 0)
                    app.db.addUserAchievement(user, 'MEGA_RUNE_EVO');
            }
            if (!app.db.hasUserAchievement(user, 'DOMINATE_RUNE_EVO')) {
                if (((_g = (_f = user.evolution) === null || _f === void 0 ? void 0 : _f.overall) === null || _g === void 0 ? void 0 : _g.winStreak) > 25)
                    app.db.addUserAchievement(user, 'DOMINATE_RUNE_EVO');
            }
            return [2 /*return*/];
        });
    }); };
    app.db.updatePointsByUser = function (user) { return __awaiter(_this, void 0, void 0, function () {
        var achievements, _i, achievements_2, achievement;
        return __generator(this, function (_a) {
            achievements = user.achievements.map(function (a) { return achievements_1.achievementData.find(function (b) { return b.id === a; }); });
            user.points = 0;
            for (_i = 0, achievements_2 = achievements; _i < achievements_2.length; _i++) {
                achievement = achievements_2[_i];
                user.points += achievement.points;
            }
            return [2 /*return*/];
        });
    }); };
    app.db.updateGuildByUser = function (user) { return __awaiter(_this, void 0, void 0, function () {
        var abi, bscProvider, contract, result, guild, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(user.joinedGuildAt === undefined)) return [3 /*break*/, 5];
                    abi = [{
                            "inputs": [
                                {
                                    "internalType": "address",
                                    "name": "_userAddress",
                                    "type": "address"
                                }
                            ],
                            "name": "getUserProfile",
                            "outputs": [
                                {
                                    "internalType": "uint256",
                                    "name": "",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "address",
                                    "name": "",
                                    "type": "address"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "bool",
                                    "name": "",
                                    "type": "bool"
                                }
                            ],
                            "stateMutability": "view",
                            "type": "function"
                        }];
                    bscProvider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
                    contract = new ethers.Contract('0x2C51b570B11dA6c0852aADD059402E390a936B39', abi, bscProvider);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, contract.getUserProfile(user.address)];
                case 2:
                    result = _a.sent();
                    user.guildId = ethers.BigNumber.from(result[2]).toNumber();
                    user.joinedGuildAt = new Date().getTime();
                    guild = app.db.loadGuild(user.guildId);
                    app.db.addGuildMember(guild, user);
                    return [4 /*yield*/, app.db.saveGuild(guild)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    app.db.saveUser = function (user) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // log('Save user', user.address)
                // await app.db.updateGuildByUser(user)
                return [4 /*yield*/, app.db.updatePointsByUser(user)];
                case 1:
                    // log('Save user', user.address)
                    // await app.db.updateGuildByUser(user)
                    _a.sent();
                    fs_jetpack_1.default.write(path_1.default.resolve("./db/users/".concat(user.address, "/overview.json")), (0, json_beautify_1.default)(__assign(__assign({}, user), { inventory: undefined, market: undefined, characters: undefined, achievements: undefined, evolution: undefined, craftedItemCount: user.inventory.items.filter(function (i) { return i.status === 'created'; }).length, inventoryItemCount: user.inventory.items.filter(function (i) { return i.status === 'unequipped'; }).length, equippedItemCount: user.inventory.items.filter(function (i) { return i.status === 'equipped'; }).length, transferredOutCount: user.inventory.items.filter(function (i) { return i.status === 'transferred_out'; }).length, transferredInCount: user.inventory.items.filter(function (i) { return i.status === 'transferred_in'; }).length }), null, 2), { atomic: true });
                    return [4 /*yield*/, app.db.updateLeaderboardByUser(user)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, app.db.updateAchievementsByUser(user)];
                case 3:
                    _a.sent();
                    fs_jetpack_1.default.write(path_1.default.resolve("./db/users/".concat(user.address, "/evolution.json")), (0, json_beautify_1.default)(user.evolution, null, 2), { atomic: true });
                    fs_jetpack_1.default.write(path_1.default.resolve("./db/users/".concat(user.address, "/achievements.json")), (0, json_beautify_1.default)(user.achievements, null, 2), { atomic: true });
                    fs_jetpack_1.default.write(path_1.default.resolve("./db/users/".concat(user.address, "/characters.json")), (0, json_beautify_1.default)(user.characters, null, 2), { atomic: true });
                    fs_jetpack_1.default.write(path_1.default.resolve("./db/users/".concat(user.address, "/inventory.json")), (0, json_beautify_1.default)(user.inventory, null, 2), { atomic: true });
                    fs_jetpack_1.default.write(path_1.default.resolve("./db/users/".concat(user.address, "/market.json")), (0, json_beautify_1.default)(user.market, null, 2), { atomic: true });
                    return [2 /*return*/];
            }
        });
    }); };
    app.db.saveUserItem = function (user, item) { return __awaiter(_this, void 0, void 0, function () {
        var savedItem, _i, _a, key;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    savedItem = user.inventory.items.find(function (i) { return i.tokenId === item.tokenId; });
                    if (savedItem) {
                        for (_i = 0, _a = Object.keys(item); _i < _a.length; _i++) {
                            key = _a[_i];
                            savedItem[key] = item[key];
                        }
                    }
                    else {
                        user.inventory.items.push(item);
                    }
                    return [4 /*yield*/, app.db.saveUser(user)];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    app.db.saveUserCharacter = function (user, character) { return __awaiter(_this, void 0, void 0, function () {
        var savedItem;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Wipe char list for old format (no block number)
                    if (!user.characters.filter(function (i) { return i.blockNumber && i.blockNumber > 0; }).length) {
                        user.characters = [];
                    }
                    savedItem = user.characters.find(function (i) { return i.tokenId === character.tokenId && i.blockNumber === character.blockNumber; });
                    if (savedItem) {
                        // for (const key of Object.keys(character)) {
                        //   savedItem[key] = character[key]
                        // }
                    }
                    else {
                        user.characters.push(character);
                    }
                    return [4 /*yield*/, app.db.saveUser(user)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    app.db.saveUserTrade = function (user, trade) { return __awaiter(_this, void 0, void 0, function () {
        var marketTrade, _i, _a, key;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    marketTrade = user.market.trades.find(function (i) { return i.tokenId === trade.tokenId; });
                    if (marketTrade) {
                        for (_i = 0, _a = Object.keys(trade); _i < _a.length; _i++) {
                            key = _a[_i];
                            marketTrade[key] = trade[key];
                        }
                    }
                    else {
                        user.market.trades.push(trade);
                    }
                    return [4 /*yield*/, app.db.saveUser(user)];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    app.db.hasUserAchievement = function (user, achievementKey) {
        var id = achievements_1.achievementData.find(function (i) { return i.key === achievementKey; }).id;
        var achievement = user.achievements.find(function (i) { return i === id; });
        return !!achievement;
    };
    app.db.addUserAchievement = function (user, achievementKey) {
        var id = achievements_1.achievementData.find(function (i) { return i.key === achievementKey; }).id;
        var achievement = user.achievements.find(function (i) { return i === id; });
        if (!achievement) {
            user.achievements.push(id);
        }
        // saveUser(user)
    };
    app.db.findPrice = function (symbol, timestamp) {
        for (var i = 1; i < app.db.historical.price[symbol].length; i++) {
            if (app.db.historical.price[symbol][i][0] > timestamp * 1000) {
                return app.db.historical.price[symbol][i][1];
            }
        }
        return app.db.stats.prices[symbol];
    };
    app.db.addBanList = function (game, target) {
        if (!app.db[game].banList)
            app.db[game].banList = [];
        if (!app.db[game].banList.includes(target)) {
            app.db[game].banList.push(target);
        }
    };
    app.db.saveBanList = function () {
        fs_jetpack_1.default.write(path_1.default.resolve('./db/evolution/banList.json'), (0, json_beautify_1.default)(app.db.evolution.banList, null, 2, 100), { atomic: true });
    };
    app.db.addModList = function (game, target) {
        if (!app.db[game].modList)
            app.db[game].modList = [];
        if (!app.db[game].modList.includes(target)) {
            app.db[game].modList.push(target);
        }
    };
    app.db.saveModList = function () {
        fs_jetpack_1.default.write(path_1.default.resolve('./db/evolution/modList.json'), (0, json_beautify_1.default)(app.db.evolution.modList, null, 2, 100), { atomic: true });
    };
}
exports.initDb = initDb;
