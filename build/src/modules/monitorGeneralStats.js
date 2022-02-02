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
exports.monitorGeneralStats = void 0;
var ethers_1 = __importDefault(require("ethers"));
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var util_1 = require("../util");
var util_2 = require("../util");
var web3_1 = require("../util/web3");
var farms_1 = __importStar(require("../farms"));
function monitorGeneralStats(app) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function () {
        var _e, i, _f, e_1, _g, i, _h, _j, e_2, i, farm, value, _k, value, _l, lpAddress, tokenContract, lpContract, quotedContract, tokenBalanceLP, quoteTokenBlanceLP, lpTokenBalanceMC, lpTotalSupply, tokenDecimals, quoteTokenDecimals, tokenAmount, lpTotalInQuoteToken, tokenPriceVsQuote, lpTokenRatio, quoteTokenAmount, tokenSymbol, _m, _o, _p, _q, e_3, _i, _r, tokenSymbol, farm, liquidity, tokenSymbol, currentPrice, historicalPrice, oldTime, newTime, diff, oldTime, newTime, diff, oldTime, newTime, diff, _s, _t, _u, _v, tokenSymbol, _w, _x, tokenSymbol, farm, symbol, tokenContract, raidHoldings, _y, botHoldings, _z, bot2Holdings, _0, bot3Holdings, _1, vaultHoldings, _2, vault2Holdings, _3, vault3Holdings, _4, devHoldings, _5, charityHoldings, _6, deployerHoldings, _7, characterFactoryHoldings, _8, lockedLiquidityHoldings, _9, v2LiquidityHoldings, _10, evolutionHoldings, _11, vaultTotalHoldings, botTotalHoldings, orgCashHoldings, orgTokenHoldings, orgHoldings, totalSupply, circulatingSupply, totalBurned, oldTime, newTime, diff, e_4, _12, _13, rune, _14, _15, symbol, oldTime, newTime, diff, e_5;
        return __generator(this, function (_16) {
            switch (_16.label) {
                case 0:
                    _16.trys.push([0, 56, , 57]);
                    (0, util_2.log)('[Stats] Updating');
                    _16.label = 1;
                case 1:
                    _16.trys.push([1, 7, , 8]);
                    _e = app.db.stats;
                    return [4 /*yield*/, app.contracts.arcaneCharacters.totalSupply()];
                case 2:
                    _e.totalCharacters = (_16.sent()).toNumber();
                    if (!app.db.stats.characters)
                        app.db.stats.characters = {};
                    i = 1;
                    _16.label = 3;
                case 3:
                    if (!(i <= 7)) return [3 /*break*/, 6];
                    if (!app.db.stats.characters[i])
                        app.db.stats.characters[i] = {};
                    _f = app.db.stats.characters[i];
                    return [4 /*yield*/, app.contracts.arcaneCharacters.characterCount(i)];
                case 4:
                    _f.total = (_16.sent()).toNumber();
                    _16.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 8];
                case 7:
                    e_1 = _16.sent();
                    console.error(e_1);
                    return [3 /*break*/, 8];
                case 8:
                    _16.trys.push([8, 15, , 16]);
                    _g = app.db.stats;
                    return [4 /*yield*/, app.contracts.arcaneItems.totalSupply()];
                case 9:
                    _g.totalItems = (_16.sent()).toNumber();
                    if (!app.db.stats.items)
                        app.db.stats.items = {};
                    i = 1;
                    _16.label = 10;
                case 10:
                    if (!(i <= 30)) return [3 /*break*/, 14];
                    if (!app.db.stats.items[i])
                        app.db.stats.items[i] = {};
                    _h = app.db.stats.items[i];
                    return [4 /*yield*/, app.contracts.arcaneItems.itemCount(i)];
                case 11:
                    _h.total = (_16.sent()).toNumber();
                    _j = app.db.stats.items[i];
                    return [4 /*yield*/, app.contracts.arcaneItems.itemBurnCount(i)];
                case 12:
                    _j.burned = (_16.sent()).toNumber();
                    _16.label = 13;
                case 13:
                    i++;
                    return [3 /*break*/, 10];
                case 14: return [3 /*break*/, 16];
                case 15:
                    e_2 = _16.sent();
                    console.error(e_2);
                    return [3 /*break*/, 16];
                case 16:
                    (0, util_2.log)('Update farms');
                    if (!app.db.stats.prices)
                        app.db.stats.prices = { busd: 1 };
                    if (!app.db.stats.liquidity)
                        app.db.stats.liquidity = {};
                    app.db.stats.totalBusdLiquidity = 0;
                    app.db.stats.totalBnbLiquidity = 0;
                    i = 0;
                    _16.label = 17;
                case 17:
                    if (!(i < farms_1.default.length)) return [3 /*break*/, 33];
                    farm = farms_1.default[i];
                    _16.label = 18;
                case 18:
                    _16.trys.push([18, 31, , 32]);
                    if (!(farm.lpSymbol.indexOf('BUSD') !== -1)) return [3 /*break*/, 20];
                    _k = util_1.toShort;
                    return [4 /*yield*/, app.contracts.busd.balanceOf((0, web3_1.getAddress)(farm.lpAddresses))];
                case 19:
                    value = _k.apply(void 0, [_16.sent()]);
                    // log('has', value)
                    if (!['USDT-BUSD LP', 'BUSD-BNB LP'].includes(farm.lpSymbol)) {
                        if (!app.db.stats.liquidity[farm.lpSymbol])
                            app.db.stats.liquidity[farm.lpSymbol] = {};
                        app.db.stats.liquidity[farm.lpSymbol].value = value;
                        app.db.stats.totalBusdLiquidity += value;
                    }
                    return [3 /*break*/, 22];
                case 20:
                    if (!(farm.lpSymbol.indexOf('BNB') !== -1)) return [3 /*break*/, 22];
                    _l = util_1.toShort;
                    return [4 /*yield*/, app.contracts.wbnb.balanceOf((0, web3_1.getAddress)(farm.lpAddresses))];
                case 21:
                    value = _l.apply(void 0, [_16.sent()]);
                    // log('has', value)
                    if (!['BTCB-BNB LP', 'BUSD-BNB LP'].includes(farm.lpSymbol)) {
                        if (!app.db.stats.liquidity[farm.lpSymbol])
                            app.db.stats.liquidity[farm.lpSymbol] = {};
                        app.db.stats.liquidity[farm.lpSymbol].value = value;
                        app.db.stats.totalBnbLiquidity += value;
                    }
                    _16.label = 22;
                case 22:
                    lpAddress = (0, web3_1.getAddress)(farm.isTokenOnly ? farm.tokenLpAddresses : farm.lpAddresses);
                    tokenContract = new ethers_1.default.Contract((0, web3_1.getAddress)(farm.tokenAddresses), app.contractMetadata.BEP20.abi, app.signers.read);
                    lpContract = new ethers_1.default.Contract(farm.isTokenOnly ? (0, web3_1.getAddress)(farm.tokenAddresses) : lpAddress, app.contractMetadata.BEP20.abi, app.signers.read);
                    quotedContract = new ethers_1.default.Contract((0, web3_1.getAddress)(farm.quoteTokenAdresses), app.contractMetadata.BEP20.abi, app.signers.read);
                    return [4 /*yield*/, tokenContract.balanceOf(lpAddress)];
                case 23:
                    tokenBalanceLP = (_16.sent()).toString();
                    return [4 /*yield*/, quotedContract.balanceOf(lpAddress)];
                case 24:
                    quoteTokenBlanceLP = (_16.sent()).toString();
                    return [4 /*yield*/, lpContract.balanceOf((0, web3_1.getAddress)(app.contractInfo.raid))];
                case 25:
                    lpTokenBalanceMC = (_16.sent()).toString();
                    return [4 /*yield*/, lpContract.totalSupply()];
                case 26:
                    lpTotalSupply = (_16.sent()).toString();
                    return [4 /*yield*/, tokenContract.decimals()];
                case 27:
                    tokenDecimals = _16.sent();
                    return [4 /*yield*/, quotedContract.decimals()];
                case 28:
                    quoteTokenDecimals = _16.sent();
                    tokenAmount = void 0;
                    lpTotalInQuoteToken = void 0;
                    tokenPriceVsQuote = void 0;
                    if (farm.isTokenOnly) {
                        tokenAmount = new bignumber_js_1.default(lpTokenBalanceMC).div(new bignumber_js_1.default(10).pow(tokenDecimals));
                        if (farm.tokenSymbol === farms_1.QuoteToken.BUSD && farm.quoteTokenSymbol === farms_1.QuoteToken.BUSD) {
                            tokenPriceVsQuote = new bignumber_js_1.default(1);
                        }
                        else {
                            tokenPriceVsQuote = new bignumber_js_1.default(quoteTokenBlanceLP).div(new bignumber_js_1.default(tokenBalanceLP));
                        }
                        lpTotalInQuoteToken = tokenAmount.times(tokenPriceVsQuote);
                    }
                    else {
                        lpTokenRatio = new bignumber_js_1.default(lpTokenBalanceMC).div(new bignumber_js_1.default(lpTotalSupply));
                        // Total value in staking in quote token value
                        lpTotalInQuoteToken = new bignumber_js_1.default(quoteTokenBlanceLP)
                            .div(new bignumber_js_1.default(10).pow(18))
                            .times(new bignumber_js_1.default(2))
                            .times(lpTokenRatio);
                        // Amount of token in the LP that are considered staking (i.e amount of token * lp ratio)
                        tokenAmount = new bignumber_js_1.default(tokenBalanceLP).div(new bignumber_js_1.default(10).pow(tokenDecimals)).times(lpTokenRatio);
                        quoteTokenAmount = new bignumber_js_1.default(quoteTokenBlanceLP)
                            .div(new bignumber_js_1.default(10).pow(quoteTokenDecimals))
                            .times(lpTokenRatio);
                        if (tokenAmount.comparedTo(0) > 0) {
                            tokenPriceVsQuote = quoteTokenAmount.div(tokenAmount);
                        }
                        else {
                            tokenPriceVsQuote = new bignumber_js_1.default(quoteTokenBlanceLP).div(new bignumber_js_1.default(tokenBalanceLP));
                        }
                    }
                    if (farm.quoteTokenSymbol === farms_1.QuoteToken.BUSD) {
                        tokenSymbol = farm.tokenSymbol.toLowerCase();
                        // log(tokenSymbol, tokenPriceVsQuote.toNumber())orgToken
                        app.db.stats.prices[tokenSymbol] = tokenPriceVsQuote.toNumber();
                    }
                    if (farm.lpSymbol === 'BUSD-BNB LP') {
                        app.db.stats.prices.bnb = 1 / tokenPriceVsQuote.toNumber();
                        app.db.stats.prices.wbnb = 1 / tokenPriceVsQuote.toNumber();
                    }
                    // log(tokenAmount)
                    // log(lpTotalInQuoteToken)
                    // log(tokenPriceVsQuote)
                    // log(quoteTokenBlanceLP)
                    // log(lpTokenBalanceMC)
                    // log(lpTotalSupply)
                    farm.tokenAmount = tokenAmount.toNumber();
                    farm.lpTotalInQuoteToken = lpTotalInQuoteToken.toNumber();
                    farm.tokenPriceVsQuote = tokenPriceVsQuote.toNumber();
                    farm.tokenBalanceLP = (0, util_1.toShort)(tokenBalanceLP.toString());
                    farm.quoteTokenBlanceLP = (0, util_1.toShort)(quoteTokenBlanceLP.toString());
                    farm.lpTokenBalanceMC = (0, util_1.toShort)(lpTokenBalanceMC.toString());
                    farm.lpTotalSupply = (0, util_1.toShort)(lpTotalSupply.toString());
                    farm.tokenDecimals = tokenDecimals;
                    farm.quoteTokenDecimals = quoteTokenDecimals;
                    _m = farm;
                    _o = util_1.toShort;
                    return [4 /*yield*/, app.contracts.token.totalSupply()];
                case 29:
                    _m.tokenTotalSupply = _o.apply(void 0, [(_16.sent()).toString()]);
                    _p = farm;
                    _q = util_1.toShort;
                    return [4 /*yield*/, app.contracts.token.balanceOf('0x000000000000000000000000000000000000dEaD')];
                case 30:
                    _p.tokenTotalBurned = _q.apply(void 0, [(_16.sent()).toString()]);
                    // log(farm)
                    app.db.farms[farm.lpSymbol] = farm;
                    return [3 /*break*/, 32];
                case 31:
                    e_3 = _16.sent();
                    (0, util_2.log)(e_3);
                    return [3 /*break*/, 32];
                case 32:
                    i++;
                    return [3 /*break*/, 17];
                case 33:
                    (0, util_2.log)("Done updating farms");
                    // Update stats
                    {
                        (0, util_2.log)('Update stats');
                        // Update TVL
                        {
                            (0, util_2.log)('Updating TVL');
                            app.db.stats.tvl = 0;
                            for (_i = 0, _r = Object.keys(app.db.farms); _i < _r.length; _i++) {
                                tokenSymbol = _r[_i];
                                farm = app.db.farms[tokenSymbol];
                                liquidity = farm.lpTotalInQuoteToken;
                                if (!farm.lpTotalInQuoteToken) {
                                    liquidity = 0;
                                }
                                else {
                                    liquidity = app.db.stats.prices[farm.quoteTokenSymbol.toLowerCase()] * farm.lpTotalInQuoteToken;
                                }
                                app.db.stats.tvl += liquidity;
                            }
                        }
                        // Update historical token prices
                        {
                            (0, util_2.log)('Update historical token prices');
                            if (!app.db.historical.price)
                                app.db.historical.price = {};
                            for (tokenSymbol in app.db.stats.prices) {
                                if (!app.db.historical.price[tokenSymbol])
                                    app.db.historical.price[tokenSymbol] = [];
                                currentPrice = app.db.stats.prices[tokenSymbol];
                                historicalPrice = app.db.historical.price[tokenSymbol];
                                oldTime = (new Date(((_a = historicalPrice[historicalPrice.length - 1]) === null || _a === void 0 ? void 0 : _a[0]) || 0)).getTime();
                                newTime = (new Date()).getTime();
                                diff = newTime - oldTime;
                                if (diff / (1000 * 60 * 60 * 24) > 1) {
                                    historicalPrice.push([newTime, currentPrice]);
                                }
                            }
                        }
                        // Update liquidity
                        {
                            (0, util_2.log)('Update liquidity');
                            if (!app.db.historical.liquidity)
                                app.db.historical.liquidity = {
                                    total: [],
                                    busd: [],
                                    bnb: []
                                };
                            app.db.stats.totalLiquidity = app.db.stats.totalBusdLiquidity + (app.db.stats.totalBnbLiquidity * app.db.stats.prices.bnb);
                            oldTime = (new Date(((_b = app.db.historical.liquidity.total[app.db.historical.liquidity.total.length - 1]) === null || _b === void 0 ? void 0 : _b[0]) || 0)).getTime();
                            newTime = (new Date()).getTime();
                            diff = newTime - oldTime;
                            if (diff / (1000 * 60 * 60 * 24) > 1) {
                                app.db.historical.liquidity.total.push([newTime, app.db.stats.totalLiquidity]);
                                app.db.historical.liquidity.busd.push([newTime, app.db.stats.totalBusdLiquidity]);
                                app.db.historical.liquidity.bnb.push([newTime, app.db.stats.totalBnbLiquidity]);
                            }
                        }
                        // Update market
                        {
                            (0, util_2.log)('Update market');
                            app.db.stats.marketItemsAvailable = app.db.trades.filter(function (t) { return t.status === 'available'; }).length;
                            app.db.stats.marketItemsSold = app.db.trades.filter(function (t) { return t.status === 'sold'; }).length;
                            app.db.stats.marketItemsDelisted = app.db.trades.filter(function (t) { return t.status === 'delisted'; }).length;
                            app.db.stats.marketAverageSoldPrice = (0, util_1.average)(app.db.trades.filter(function (t) { return t.status === 'sold'; }).map(function (t) { return t.price; }));
                        }
                        // Update runes
                        {
                            (0, util_2.log)('Update runes');
                            app.db.stats.totalRunes = Object.keys(app.db.runes).length - 1;
                        }
                        // Update community
                        {
                            (0, util_2.log)('Update community');
                            app.db.stats.totalCommunities = 8;
                            app.db.stats.totalPolls = 50;
                        }
                        // Update game info
                        {
                            (0, util_2.log)('Update game info');
                            app.db.stats.totalGuilds = app.db.guilds.length;
                            app.db.stats.totalClasses = Object.keys(app.db.classes).length;
                            app.db.stats.totalRunewords = 7;
                        }
                        // Update stat historical
                        {
                            (0, util_2.log)('Update stat historical');
                            if (!app.db.historical.stats)
                                app.db.historical.stats = {};
                            if (!app.db.historical.stats.totalCharacters)
                                app.db.historical.stats.totalCharacters = [];
                            if (!app.db.historical.stats.totalItems)
                                app.db.historical.stats.totalItems = [];
                            if (!app.db.historical.stats.tvl)
                                app.db.historical.stats.tvl = [];
                            if (!app.db.historical.stats.marketItemsAvailable)
                                app.db.historical.stats.marketItemsAvailable = [];
                            if (!app.db.historical.stats.marketItemsSold)
                                app.db.historical.stats.marketItemsSold = [];
                            if (!app.db.historical.stats.marketItemsDelisted)
                                app.db.historical.stats.marketItemsDelisted = [];
                            if (!app.db.historical.stats.marketAverageSoldPrice)
                                app.db.historical.stats.marketAverageSoldPrice = [];
                            if (!app.db.historical.stats.totalCommunities)
                                app.db.historical.stats.totalCommunities = [];
                            if (!app.db.historical.stats.totalClasses)
                                app.db.historical.stats.totalClasses = [];
                            if (!app.db.historical.stats.totalGuilds)
                                app.db.historical.stats.totalGuilds = [];
                            if (!app.db.historical.stats.totalPolls)
                                app.db.historical.stats.totalPolls = [];
                            if (!app.db.historical.stats.totalRunes)
                                app.db.historical.stats.totalRunes = [];
                            if (!app.db.historical.stats.totalRunewords)
                                app.db.historical.stats.totalRunewords = [];
                            oldTime = (new Date(app.db.historical.stats.updatedAt || 0)).getTime();
                            newTime = (new Date()).getTime();
                            diff = newTime - oldTime;
                            if (diff / (1000 * 60 * 60 * 24) > 1) {
                                app.db.historical.stats.totalCharacters.push([newTime, app.db.stats.totalCharacters]);
                                app.db.historical.stats.totalItems.push([newTime, app.db.stats.totalItems]);
                                app.db.historical.stats.tvl.push([newTime, app.db.stats.tvl]);
                                app.db.historical.stats.marketItemsAvailable.push([newTime, app.db.stats.marketItemsAvailable]);
                                app.db.historical.stats.marketItemsSold.push([newTime, app.db.stats.marketItemsSold]);
                                app.db.historical.stats.marketItemsDelisted.push([newTime, app.db.stats.marketItemsDelisted]);
                                app.db.historical.stats.marketAverageSoldPrice.push([newTime, app.db.stats.marketAverageSoldPrice]);
                                app.db.historical.stats.totalCommunities.push([newTime, app.db.stats.totalCommunities]);
                                app.db.historical.stats.totalClasses.push([newTime, app.db.stats.totalClasses]);
                                app.db.historical.stats.totalGuilds.push([newTime, app.db.stats.totalGuilds]);
                                app.db.historical.stats.totalPolls.push([newTime, app.db.stats.totalPolls]);
                                app.db.historical.stats.totalRunes.push([newTime, app.db.stats.totalRunes]);
                                app.db.historical.stats.totalRunewords.push([newTime, app.db.stats.totalRunewords]);
                                app.db.historical.stats.updatedAt = newTime;
                            }
                        }
                    }
                    (0, util_2.log)('Update app');
                    (0, util_2.log)('Updating Profile config');
                    _s = app.config;
                    _t = util_1.toShort;
                    return [4 /*yield*/, app.contracts.arcaneCharacterFactory.tokenPrice()];
                case 34:
                    _s.characterMintCost = _t.apply(void 0, [(_16.sent()).toString()]);
                    _u = app.config;
                    _v = util_1.toShort;
                    return [4 /*yield*/, app.contracts.arcaneProfile.numberRuneToRegister()];
                case 35:
                    _u.profileRegisterCost = _v.apply(void 0, [(_16.sent()).toString()]);
                    (0, util_2.log)('Update runes');
                    for (tokenSymbol in app.db.stats.prices) {
                        if (tokenSymbol === 'bnb' || tokenSymbol === 'usdt' || tokenSymbol === 'busd')
                            continue;
                        if (!app.db.runes[tokenSymbol])
                            app.db.runes[tokenSymbol] = {};
                        app.db.runes[tokenSymbol].price = app.db.stats.prices[tokenSymbol];
                    }
                    _w = 0, _x = Object.keys(app.db.farms);
                    _16.label = 36;
                case 36:
                    if (!(_w < _x.length)) return [3 /*break*/, 55];
                    tokenSymbol = _x[_w];
                    _16.label = 37;
                case 37:
                    _16.trys.push([37, 53, , 54]);
                    farm = app.db.farms[tokenSymbol];
                    if (!farm.isTokenOnly) return [3 /*break*/, 52];
                    symbol = tokenSymbol.toLowerCase();
                    tokenContract = new ethers_1.default.Contract((0, web3_1.getAddress)(app.db.contracts[symbol]), app.contractMetadata.BEP20.abi, app.signers.read);
                    _y = util_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf((0, web3_1.getAddress)(app.contractInfo.raid))];
                case 38:
                    raidHoldings = _y.apply(void 0, [(_16.sent()).toString()]);
                    _z = util_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf((0, web3_1.getAddress)(app.contractInfo.botAddress))];
                case 39:
                    botHoldings = _z.apply(void 0, [(_16.sent()).toString()]);
                    _0 = util_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf((0, web3_1.getAddress)(app.contractInfo.bot2Address))];
                case 40:
                    bot2Holdings = _0.apply(void 0, [(_16.sent()).toString()]);
                    _1 = util_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf((0, web3_1.getAddress)(app.contractInfo.bot3Address))];
                case 41:
                    bot3Holdings = _1.apply(void 0, [(_16.sent()).toString()]);
                    _2 = util_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf((0, web3_1.getAddress)(app.contractInfo.vaultAddress))];
                case 42:
                    vaultHoldings = _2.apply(void 0, [(_16.sent()).toString()]);
                    _3 = util_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf((0, web3_1.getAddress)(app.contractInfo.vault2Address))];
                case 43:
                    vault2Holdings = _3.apply(void 0, [(_16.sent()).toString()]);
                    _4 = util_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf((0, web3_1.getAddress)(app.contractInfo.vault3Address))];
                case 44:
                    vault3Holdings = _4.apply(void 0, [(_16.sent()).toString()]);
                    _5 = util_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf((0, web3_1.getAddress)(app.contractInfo.devAddress))];
                case 45:
                    devHoldings = _5.apply(void 0, [(_16.sent()).toString()]);
                    _6 = util_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf((0, web3_1.getAddress)(app.contractInfo.charityAddress))];
                case 46:
                    charityHoldings = _6.apply(void 0, [(_16.sent()).toString()]);
                    _7 = util_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf((0, web3_1.getAddress)(app.contractInfo.deployerAddress))];
                case 47:
                    deployerHoldings = _7.apply(void 0, [(_16.sent()).toString()]);
                    _8 = util_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf((0, web3_1.getAddress)(app.contractInfo.characterFactory))];
                case 48:
                    characterFactoryHoldings = _8.apply(void 0, [(_16.sent()).toString()]);
                    _9 = util_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf((0, web3_1.getAddress)(app.contractInfo.lockedLiquidityAddress))];
                case 49:
                    lockedLiquidityHoldings = _9.apply(void 0, [(_16.sent()).toString()]) * 0.61;
                    _10 = util_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf((0, web3_1.getAddress)(app.contractInfo.v2LiquidityAddress))];
                case 50:
                    v2LiquidityHoldings = _10.apply(void 0, [(_16.sent()).toString()]) * 0.99;
                    _11 = util_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf((0, web3_1.getAddress)(app.contractInfo.evolutionAddress))];
                case 51:
                    evolutionHoldings = _11.apply(void 0, [(_16.sent()).toString()]);
                    vaultTotalHoldings = vaultHoldings + vault2Holdings + vault3Holdings;
                    botTotalHoldings = botHoldings + bot2Holdings + bot3Holdings;
                    orgCashHoldings = 0;
                    orgTokenHoldings = vaultTotalHoldings + characterFactoryHoldings + botTotalHoldings + v2LiquidityHoldings + lockedLiquidityHoldings + evolutionHoldings;
                    orgHoldings = vaultTotalHoldings + characterFactoryHoldings + botTotalHoldings + v2LiquidityHoldings + evolutionHoldings;
                    totalSupply = farm.tokenTotalSupply;
                    circulatingSupply = farm.tokenTotalSupply - farm.tokenTotalBurned;
                    totalBurned = farm.tokenTotalBurned;
                    if (!app.db.runes[symbol])
                        app.db.runes[symbol] = {};
                    app.db.runes[symbol].totalSupply = totalSupply;
                    app.db.runes[symbol].circulatingSupply = circulatingSupply;
                    app.db.runes[symbol].totalBurned = totalBurned;
                    app.db.runes[symbol].holders = {};
                    app.db.runes[symbol].holders.raid = raidHoldings;
                    app.db.runes[symbol].holders.vault = vaultHoldings;
                    app.db.runes[symbol].holders.vault2 = vault2Holdings;
                    app.db.runes[symbol].holders.vault3 = vault3Holdings;
                    app.db.runes[symbol].holders.vaultTotal = vaultTotalHoldings;
                    app.db.runes[symbol].holders.characterFactory = characterFactoryHoldings;
                    app.db.runes[symbol].holders.dev = devHoldings;
                    app.db.runes[symbol].holders.charity = charityHoldings;
                    app.db.runes[symbol].holders.deployer = deployerHoldings;
                    app.db.runes[symbol].holders.bot = botHoldings;
                    app.db.runes[symbol].holders.bot2 = bot2Holdings;
                    app.db.runes[symbol].holders.bot3 = bot3Holdings;
                    app.db.runes[symbol].holders.botTotal = botTotalHoldings;
                    app.db.runes[symbol].holders.lockedLiquidity = lockedLiquidityHoldings;
                    app.db.runes[symbol].holders.v2Liquidity = v2LiquidityHoldings;
                    app.db.runes[symbol].holders.orgCash = orgCashHoldings;
                    app.db.runes[symbol].holders.orgToken = orgTokenHoldings;
                    app.db.runes[symbol].holders.org = orgHoldings;
                    app.db.runes[symbol].holders.evolution = evolutionHoldings;
                    if (!app.db.historical.totalSupply)
                        app.db.historical.totalSupply = {};
                    if (!app.db.historical.totalSupply[symbol])
                        app.db.historical.totalSupply[symbol] = [];
                    if (!app.db.historical.circulatingSupply)
                        app.db.historical.circulatingSupply = {};
                    if (!app.db.historical.circulatingSupply[symbol])
                        app.db.historical.circulatingSupply[symbol] = [];
                    if (!app.db.historical.totalBurned)
                        app.db.historical.totalBurned = {};
                    if (!app.db.historical.totalBurned[symbol])
                        app.db.historical.totalBurned[symbol] = [];
                    if (!app.db.historical.raid)
                        app.db.historical.raid = {};
                    if (!app.db.historical.raid.holdings)
                        app.db.historical.raid.holdings = {};
                    if (!app.db.historical.raid.holdings[symbol])
                        app.db.historical.raid.holdings[symbol] = [];
                    if (!app.db.historical.bot)
                        app.db.historical.bot = {};
                    if (!app.db.historical.bot.holdings)
                        app.db.historical.bot.holdings = {};
                    if (!app.db.historical.bot.holdings[symbol])
                        app.db.historical.bot.holdings[symbol] = [];
                    if (!app.db.historical.bot2)
                        app.db.historical.bot2 = {};
                    if (!app.db.historical.bot2.holdings)
                        app.db.historical.bot2.holdings = {};
                    if (!app.db.historical.bot2.holdings[symbol])
                        app.db.historical.bot2.holdings[symbol] = [];
                    if (!app.db.historical.bot3)
                        app.db.historical.bot3 = {};
                    if (!app.db.historical.bot3.holdings)
                        app.db.historical.bot3.holdings = {};
                    if (!app.db.historical.bot3.holdings[symbol])
                        app.db.historical.bot3.holdings[symbol] = [];
                    if (!app.db.historical.botTotal)
                        app.db.historical.botTotal = {};
                    if (!app.db.historical.botTotal.holdings)
                        app.db.historical.botTotal.holdings = {};
                    if (!app.db.historical.botTotal.holdings[symbol])
                        app.db.historical.botTotal.holdings[symbol] = [];
                    if (!app.db.historical.vault)
                        app.db.historical.vault = {};
                    if (!app.db.historical.vault.holdings)
                        app.db.historical.vault.holdings = {};
                    if (!app.db.historical.vault.holdings[symbol])
                        app.db.historical.vault.holdings[symbol] = [];
                    if (!app.db.historical.vault2)
                        app.db.historical.vault2 = {};
                    if (!app.db.historical.vault2.holdings)
                        app.db.historical.vault2.holdings = {};
                    if (!app.db.historical.vault2.holdings[symbol])
                        app.db.historical.vault2.holdings[symbol] = [];
                    if (!app.db.historical.vault3)
                        app.db.historical.vault3 = {};
                    if (!app.db.historical.vault3.holdings)
                        app.db.historical.vault3.holdings = {};
                    if (!app.db.historical.vault3.holdings[symbol])
                        app.db.historical.vault3.holdings[symbol] = [];
                    if (!app.db.historical.vaultTotal)
                        app.db.historical.vaultTotal = {};
                    if (!app.db.historical.vaultTotal.holdings)
                        app.db.historical.vaultTotal.holdings = {};
                    if (!app.db.historical.vaultTotal.holdings[symbol])
                        app.db.historical.vaultTotal.holdings[symbol] = [];
                    if (!app.db.historical.characterFactory)
                        app.db.historical.characterFactory = {};
                    if (!app.db.historical.characterFactory.holdings)
                        app.db.historical.characterFactory.holdings = {};
                    if (!app.db.historical.characterFactory.holdings[symbol])
                        app.db.historical.characterFactory.holdings[symbol] = [];
                    if (!app.db.historical.dev)
                        app.db.historical.dev = {};
                    if (!app.db.historical.dev.holdings)
                        app.db.historical.dev.holdings = {};
                    if (!app.db.historical.dev.holdings[symbol])
                        app.db.historical.dev.holdings[symbol] = [];
                    if (!app.db.historical.charity)
                        app.db.historical.charity = {};
                    if (!app.db.historical.charity.holdings)
                        app.db.historical.charity.holdings = {};
                    if (!app.db.historical.charity.holdings[symbol])
                        app.db.historical.charity.holdings[symbol] = [];
                    if (!app.db.historical.deployer)
                        app.db.historical.deployer = {};
                    if (!app.db.historical.deployer.holdings)
                        app.db.historical.deployer.holdings = {};
                    if (!app.db.historical.deployer.holdings[symbol])
                        app.db.historical.deployer.holdings[symbol] = [];
                    if (!app.db.historical.lockedLiquidity)
                        app.db.historical.lockedLiquidity = {};
                    if (!app.db.historical.lockedLiquidity.holdings)
                        app.db.historical.lockedLiquidity.holdings = {};
                    if (!app.db.historical.lockedLiquidity.holdings[symbol])
                        app.db.historical.lockedLiquidity.holdings[symbol] = [];
                    if (!app.db.historical.v2Liquidity)
                        app.db.historical.v2Liquidity = {};
                    if (!app.db.historical.v2Liquidity.holdings)
                        app.db.historical.v2Liquidity.holdings = {};
                    if (!app.db.historical.v2Liquidity.holdings[symbol])
                        app.db.historical.v2Liquidity.holdings[symbol] = [];
                    if (!app.db.historical.org)
                        app.db.historical.org = {};
                    if (!app.db.historical.org.holdings)
                        app.db.historical.org.holdings = {};
                    if (!app.db.historical.org.holdings[symbol])
                        app.db.historical.org.holdings[symbol] = [];
                    if (!app.db.historical.orgCash)
                        app.db.historical.orgCash = {};
                    if (!app.db.historical.orgCash.holdings)
                        app.db.historical.orgCash.holdings = {};
                    if (!app.db.historical.orgCash.holdings[symbol])
                        app.db.historical.orgCash.holdings[symbol] = [];
                    if (!app.db.historical.orgToken)
                        app.db.historical.orgToken = {};
                    if (!app.db.historical.orgToken.holdings)
                        app.db.historical.orgToken.holdings = {};
                    if (!app.db.historical.orgToken.holdings[symbol])
                        app.db.historical.orgToken.holdings[symbol] = [];
                    if (!app.db.historical.evolution)
                        app.db.historical.evolution = {};
                    if (!app.db.historical.evolution.holdings)
                        app.db.historical.evolution.holdings = {};
                    if (!app.db.historical.evolution.holdings[symbol])
                        app.db.historical.evolution.holdings[symbol] = [];
                    oldTime = (new Date(((_c = app.db.historical.totalSupply[symbol][app.db.historical.totalSupply[symbol].length - 1]) === null || _c === void 0 ? void 0 : _c[0]) || 0)).getTime();
                    newTime = (new Date()).getTime();
                    diff = newTime - oldTime;
                    if (diff / (1000 * 60 * 60 * 24) > 1) {
                        app.db.historical.totalSupply[symbol].push([newTime, totalSupply]);
                        app.db.historical.circulatingSupply[symbol].push([newTime, circulatingSupply]);
                        app.db.historical.totalBurned[symbol].push([newTime, totalBurned]);
                        app.db.historical.raid.holdings[symbol].push([newTime, raidHoldings]);
                        app.db.historical.bot.holdings[symbol].push([newTime, botHoldings]);
                        app.db.historical.bot2.holdings[symbol].push([newTime, bot2Holdings]);
                        app.db.historical.bot3.holdings[symbol].push([newTime, bot3Holdings]);
                        app.db.historical.botTotal.holdings[symbol].push([newTime, botTotalHoldings]);
                        app.db.historical.vault.holdings[symbol].push([newTime, vaultHoldings]);
                        app.db.historical.vault2.holdings[symbol].push([newTime, vault2Holdings]);
                        app.db.historical.vault3.holdings[symbol].push([newTime, vault3Holdings]);
                        app.db.historical.vaultTotal.holdings[symbol].push([newTime, vaultTotalHoldings]);
                        app.db.historical.characterFactory.holdings[symbol].push([newTime, characterFactoryHoldings]);
                        app.db.historical.dev.holdings[symbol].push([newTime, devHoldings]);
                        app.db.historical.charity.holdings[symbol].push([newTime, charityHoldings]);
                        app.db.historical.deployer.holdings[symbol].push([newTime, deployerHoldings]);
                        app.db.historical.lockedLiquidity.holdings[symbol].push([newTime, lockedLiquidityHoldings]);
                        app.db.historical.v2Liquidity.holdings[symbol].push([newTime, v2LiquidityHoldings]);
                        app.db.historical.org.holdings[symbol].push([newTime, orgHoldings]);
                        app.db.historical.orgCash.holdings[symbol].push([newTime, orgCashHoldings]);
                        app.db.historical.orgToken.holdings[symbol].push([newTime, orgTokenHoldings]);
                        app.db.historical.evolution.holdings[symbol].push([newTime, evolutionHoldings]);
                    }
                    _16.label = 52;
                case 52: return [3 /*break*/, 54];
                case 53:
                    e_4 = _16.sent();
                    (0, util_2.log)(e_4);
                    return [3 /*break*/, 54];
                case 54:
                    _w++;
                    return [3 /*break*/, 36];
                case 55:
                    app.db.runes.totals = {};
                    app.db.runes.totals.raid = 0;
                    app.db.runes.totals.vault = 0;
                    app.db.runes.totals.vault2 = 0;
                    app.db.runes.totals.vault3 = 0;
                    app.db.runes.totals.vaultTotal = 0;
                    app.db.runes.totals.characterFactory = 0;
                    app.db.runes.totals.dev = 0;
                    app.db.runes.totals.charity = 0;
                    app.db.runes.totals.deployer = 0;
                    app.db.runes.totals.bot = 0;
                    app.db.runes.totals.bot2 = 0;
                    app.db.runes.totals.bot3 = 0;
                    app.db.runes.totals.botTotal = 0;
                    app.db.runes.totals.lockedLiquidity = 0;
                    app.db.runes.totals.v2Liquidity = 0;
                    app.db.runes.totals.org = 0;
                    app.db.runes.totals.orgCash = 0;
                    app.db.runes.totals.orgToken = 0;
                    app.db.runes.totals.evolution = 0;
                    for (_12 = 0, _13 = Object.keys(app.db.runes); _12 < _13.length; _12++) {
                        rune = _13[_12];
                        // if (rune === 'totals') continue
                        if (app.db.runes[rune].holders) {
                            app.db.runes.totals.raid += app.db.runes[rune].holders.raid * app.db.runes[rune].price;
                            app.db.runes.totals.vault += app.db.runes[rune].holders.vault * app.db.runes[rune].price;
                            app.db.runes.totals.vault2 += app.db.runes[rune].holders.vault2 * app.db.runes[rune].price;
                            app.db.runes.totals.vault3 += app.db.runes[rune].holders.vault3 * app.db.runes[rune].price;
                            app.db.runes.totals.vaultTotal += app.db.runes[rune].holders.vaultTotal * app.db.runes[rune].price;
                            app.db.runes.totals.characterFactory += app.db.runes[rune].holders.characterFactory * app.db.runes[rune].price;
                            app.db.runes.totals.dev += app.db.runes[rune].holders.dev * app.db.runes[rune].price;
                            app.db.runes.totals.charity += app.db.runes[rune].holders.charity * app.db.runes[rune].price;
                            app.db.runes.totals.deployer += app.db.runes[rune].holders.deployer * app.db.runes[rune].price;
                            app.db.runes.totals.bot += app.db.runes[rune].holders.bot * app.db.runes[rune].price;
                            app.db.runes.totals.bot2 += app.db.runes[rune].holders.bot2 * app.db.runes[rune].price;
                            app.db.runes.totals.bot3 += app.db.runes[rune].holders.bot3 * app.db.runes[rune].price;
                            app.db.runes.totals.botTotal += app.db.runes[rune].holders.botTotal * app.db.runes[rune].price;
                            app.db.runes.totals.lockedLiquidity += app.db.runes[rune].holders.lockedLiquidity * app.db.runes[rune].price;
                            app.db.runes.totals.v2Liquidity += app.db.runes[rune].holders.v2Liquidity * app.db.runes[rune].price;
                            app.db.runes.totals.org += app.db.runes[rune].holders.org * app.db.runes[rune].price;
                            app.db.runes.totals.orgToken += app.db.runes[rune].holders.orgToken * app.db.runes[rune].price;
                            app.db.runes.totals.orgCash += app.db.runes[rune].holders.orgCash;
                            // if (rune === 'BUSD' || rune === 'USDT' || rune === 'USDC') {
                            // }
                        }
                    }
                    if (!app.db.historical.total)
                        app.db.historical.total = {};
                    if (!app.db.historical.total.totals)
                        app.db.historical.total.totals = {};
                    for (_14 = 0, _15 = Object.keys(app.db.runes.totals); _14 < _15.length; _14++) {
                        symbol = _15[_14];
                        if (!app.db.historical.total.totals[symbol])
                            app.db.historical.total.totals[symbol] = [];
                        oldTime = (new Date(((_d = app.db.historical.total.totals[symbol][app.db.historical.total.totals[symbol].length - 1]) === null || _d === void 0 ? void 0 : _d[0]) || 0)).getTime();
                        newTime = (new Date()).getTime();
                        diff = newTime - oldTime;
                        if (diff / (1000 * 60 * 60 * 24) > 1) {
                            app.db.historical.total.totals[symbol].push([newTime, app.db.runes.totals[symbol]]);
                        }
                    }
                    // await saveConfig()
                    setTimeout(function () { return monitorGeneralStats(app); }, 2 * 60 * 1000);
                    return [3 /*break*/, 57];
                case 56:
                    e_5 = _16.sent();
                    (0, util_2.log)(e_5);
                    return [3 /*break*/, 57];
                case 57: return [2 /*return*/];
            }
        });
    });
}
exports.monitorGeneralStats = monitorGeneralStats;
