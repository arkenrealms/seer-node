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
exports.monitorEvolutionStats = void 0;
var path_1 = __importDefault(require("path"));
var fs_jetpack_1 = __importDefault(require("fs-jetpack"));
var json_beautify_1 = __importDefault(require("json-beautify"));
var util_1 = require("../util");
var util_2 = require("../util");
function monitorEvolutionStats(app) {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function () {
        var playerRoundWinners, playerRewardWinners, leaderboards, evolutionPlayers, mapAddressToUsername, _loop_1, _i, _f, server, _g, evolutionPlayers_1, player, user, latency, key, server, _h, _j, statKey, _k, _l, statKey, _m, _o, statKey, _loop_2, _p, evolutionPlayers_2, player, e_1, _q, _r, server, data, _s, _t, round, _u, round_1, player, _v, _w, server, stats, playerLatencyList, winnerLatencyList, _x, _y, round, winner, _z, round_2, player, _0, round_3, player, _loop_3, _1, _2, server, e_2, _3, _4, server, rand, response, data, e_3, e_4, _5, _6, server, rand, response, data, _7, data_1, banItem, user, e_5, e_6, _8, _9, server, rand, response, data, e_7, e_8, _10, _11, server, rand, response, data, e_9, e_10, _12, _13, server, rand, response, data, e_11, e_12, _loop_4, _14, _15, server;
        return __generator(this, function (_16) {
            switch (_16.label) {
                case 0:
                    playerRoundWinners = {};
                    playerRewardWinners = {};
                    leaderboards = {
                        europe1: {},
                        europe2: {},
                        na1: {},
                        sa1: {},
                        asia1: {},
                        asia2: {},
                        asia3: {},
                        asia4: {},
                        oceanic1: {},
                        overall: {}
                    };
                    _16.label = 1;
                case 1:
                    _16.trys.push([1, 14, , 15]);
                    (0, util_2.log)('Update evolution leaderboard history');
                    evolutionPlayers = fs_jetpack_1.default.read(path_1.default.resolve("./db/evolution/players.json"), 'json') || [];
                    mapAddressToUsername = {};
                    _loop_1 = function (server) {
                        var leaderboardHistory, rand, response, data, lastIndex, lastRoundItem, i, dupChecker_1, recentPlayerAddresses, i, j, playerAddresses, _loop_5, _17, playerAddresses_1, address, _18, _19, statKey, _20, _21, statKey, _loop_6, _22, playerAddresses_2, address, e_13;
                        return __generator(this, function (_23) {
                            switch (_23.label) {
                                case 0:
                                    if (server.status !== 'online')
                                        return [2 /*return*/, "continue"];
                                    (0, util_2.log)('Server', server.key);
                                    _23.label = 1;
                                case 1:
                                    _23.trys.push([1, 14, , 15]);
                                    leaderboardHistory = fs_jetpack_1.default.read(path_1.default.resolve("./db/evolution/".concat(server.key, "/leaderboardHistory.json")), 'json') || [];
                                    rand = Math.floor(Math.random() * Math.floor(999999));
                                    return [4 /*yield*/, fetch("https://".concat(server.endpoint, "/data/leaderboardHistory.json?").concat(rand))];
                                case 2:
                                    response = _23.sent();
                                    fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/".concat(server.key, "/leaderboardHistoryLiveLatest.json")), (0, json_beautify_1.default)(leaderboardHistory, null, 2), { atomic: true });
                                    return [4 /*yield*/, response.json()];
                                case 3:
                                    data = _23.sent();
                                    lastIndex = 0;
                                    if (leaderboardHistory.length > 0) {
                                        lastRoundItem = leaderboardHistory.slice(leaderboardHistory.length - 10).reverse().filter(function (r) { return r.filter(function (p) { return p.name.indexOf('Unknown') !== 0; }).length > 0; })[0];
                                        // log('Last round', lastRoundItem)
                                        for (i = 0; i < data.length; i++) {
                                            if (!data[i].length || !data[i][0])
                                                continue;
                                            // if (data[i][0].name.indexOf('Unknown') === 0) continue
                                            if (data[i].length === lastRoundItem.length && data[i][0].joinedAt === lastRoundItem[0].joinedAt && data[i][0].id === lastRoundItem[0].id && (typeof (data[i][0].position) === 'string' || !data[i][0].position ? data[i][0].position : data[i][0].position.x.toFixed(4) === lastRoundItem[0].position.x.toFixed(4) && data[i][0].position.y.toFixed(4) === lastRoundItem[0].position.y.toFixed(4))) { //  && data[i][0].position === lastRoundItem[0].position
                                                lastIndex = i;
                                            }
                                        }
                                    }
                                    (0, util_2.log)('Starting from', lastIndex, server.key);
                                    if (!(lastIndex === 0 && leaderboardHistory.length > 0)) return [3 /*break*/, 4];
                                    console.warn("Shouldnt start from 0", server.key);
                                    playerRoundWinners[server.key] = leaderboardHistory;
                                    return [3 /*break*/, 13];
                                case 4:
                                    dupChecker_1 = {};
                                    leaderboardHistory = leaderboardHistory.concat(data.slice(lastIndex + 1)).filter(function (p) {
                                        if (p.length === 0)
                                            return;
                                        if (p[0].joinedAt < 1625322027)
                                            return;
                                        var key = (typeof (p[0].position) === 'string' || !p[0].position ? p[0].position : p[0].position.x.toFixed(4) + p[0].position.y.toFixed(4)) + p[0].joinedAt;
                                        if (dupChecker_1[key])
                                            return;
                                        dupChecker_1[key] = true;
                                        return p;
                                    });
                                    fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/".concat(server.key, "/leaderboardHistory.json")), (0, json_beautify_1.default)(leaderboardHistory, null, 2), { atomic: true });
                                    playerRoundWinners[server.key] = leaderboardHistory;
                                    recentPlayerAddresses = [];
                                    for (i = lastIndex; i < leaderboardHistory.length; i++) {
                                        for (j = 0; j < leaderboardHistory[i].length; j++) {
                                            if (!leaderboardHistory[i][j].address)
                                                continue;
                                            if (recentPlayerAddresses.includes(leaderboardHistory[i][j].address))
                                                continue;
                                            recentPlayerAddresses.push(leaderboardHistory[i][j].address);
                                        }
                                    }
                                    leaderboards[server.key] = {
                                        kills: [],
                                        deaths: [],
                                        powerups: [],
                                        evolves: [],
                                        points: [],
                                        rewards: [],
                                        orbs: [],
                                        revenges: [],
                                        rounds: [],
                                        wins: [],
                                        timeSpent: [],
                                        winRatio: [],
                                        killDeathRatio: [],
                                        roundPointRatio: [],
                                        averageLatency: []
                                    };
                                    playerAddresses = recentPlayerAddresses // evolutionPlayers.map(p => p.address)
                                    ;
                                    _loop_5 = function (address) {
                                        var user, winStreak, savedWinStreak, rounds, wins, kills, deaths, powerups, evolves, points, rewards, orbs, revenges, latency, hashHistory, hashHistory2, _24, leaderboardHistory_1, round, currentPlayer, wasConnected, wasActive, _25, _26, hash, _27, round_4, player, winner, _28, _29, statKey, e_14;
                                        return __generator(this, function (_30) {
                                            switch (_30.label) {
                                                case 0:
                                                    if (address.toLowerCase() === "0xc84ce216fef4EC8957bD0Fb966Bb3c3E2c938082".toLowerCase() ||
                                                        address.toLowerCase() === "0xa987f487639920A3c2eFe58C8FBDedB96253ed9B".toLowerCase())
                                                        return [2 /*return*/, "continue"];
                                                    _30.label = 1;
                                                case 1:
                                                    _30.trys.push([1, 3, , 4]);
                                                    user = app.db.loadUser(address);
                                                    if (address === '0x9aAe5CBe5C124e1BE62BD83eD07367d57F8998E0') {
                                                        (0, util_2.log)(user);
                                                    }
                                                    if (!evolutionPlayers.find(function (p) { return p.address === address; })) {
                                                        evolutionPlayers.push({
                                                            address: address
                                                        });
                                                    }
                                                    if (!user.evolution)
                                                        user.evolution = {};
                                                    if (!user.evolution.hashes)
                                                        user.evolution.hashes = [];
                                                    {
                                                        winStreak = 0;
                                                        savedWinStreak = 0;
                                                        rounds = 0;
                                                        wins = 0;
                                                        kills = 0;
                                                        deaths = 0;
                                                        powerups = 0;
                                                        evolves = 0;
                                                        points = 0;
                                                        rewards = 0;
                                                        orbs = 0;
                                                        revenges = 0;
                                                        latency = [];
                                                        hashHistory = {};
                                                        hashHistory2 = {};
                                                        for (_24 = 0, leaderboardHistory_1 = leaderboardHistory; _24 < leaderboardHistory_1.length; _24++) {
                                                            round = leaderboardHistory_1[_24];
                                                            if (round.length === 0)
                                                                continue;
                                                            currentPlayer = round.find(function (r) { return r.address === address; });
                                                            wasConnected = currentPlayer ? (currentPlayer.latency === undefined || (currentPlayer.latency >= 10 && currentPlayer.latency <= 1000)) : false;
                                                            wasActive = currentPlayer ? (currentPlayer.powerups >= 100) : false;
                                                            if (currentPlayer) {
                                                                mapAddressToUsername[address] = currentPlayer.name;
                                                                if (!user.evolution.hashes.includes(currentPlayer.hash))
                                                                    user.evolution.hashes.push(currentPlayer.hash);
                                                                if (wasConnected) {
                                                                    latency.push(currentPlayer.latency);
                                                                }
                                                                if (wasActive) {
                                                                    kills += currentPlayer.kills || 0;
                                                                    deaths += currentPlayer.deaths || 0;
                                                                    powerups += currentPlayer.powerups || 0;
                                                                    evolves += currentPlayer.evolves || 0;
                                                                    points += currentPlayer.points || 0;
                                                                    rewards += currentPlayer.rewards || 0;
                                                                    orbs += currentPlayer.orbs || 0;
                                                                    revenges += (((_a = currentPlayer.log) === null || _a === void 0 ? void 0 : _a.revenge) ? currentPlayer.log.revenge : 0);
                                                                    rounds++;
                                                                }
                                                                if ((_b = currentPlayer.log) === null || _b === void 0 ? void 0 : _b.kills) {
                                                                    for (_25 = 0, _26 = currentPlayer.log.kills; _25 < _26.length; _25++) {
                                                                        hash = _26[_25];
                                                                        if (!hashHistory[hash])
                                                                            hashHistory[hash] = 0;
                                                                        hashHistory[hash]++;
                                                                    }
                                                                    for (_27 = 0, round_4 = round; _27 < round_4.length; _27++) {
                                                                        player = round_4[_27];
                                                                        if (!hashHistory2[player.hash])
                                                                            hashHistory2[player.hash] = 0;
                                                                        if (player.hash === currentPlayer.hash)
                                                                            continue;
                                                                        if (currentPlayer.log.kills.includes(player.hash))
                                                                            continue;
                                                                        hashHistory2[player.hash]++;
                                                                    }
                                                                }
                                                            }
                                                            winner = round.sort((function (a, b) { return b.points - a.points; }))[0];
                                                            if (winner.address === address) {
                                                                wins++;
                                                                winStreak++;
                                                                if (winStreak > savedWinStreak)
                                                                    savedWinStreak = winStreak;
                                                            }
                                                            else {
                                                                winStreak = 0;
                                                            }
                                                        }
                                                        if (!user.evolution.servers)
                                                            user.evolution.servers = {};
                                                        if (!user.evolution.servers[server.key])
                                                            user.evolution.servers[server.key] = {};
                                                        if (!user.evolution.servers[server.key].winStreak)
                                                            user.evolution.servers[server.key].winStreak = 0;
                                                        if (!user.evolution.overall)
                                                            user.evolution.overall = {};
                                                        if (!user.evolution.overall.winStreak)
                                                            user.evolution.overall.winStreak = 0;
                                                        // if (savedWinStreak > user.evolution.servers[server.key].winStreak) {
                                                        user.evolution.servers[server.key].winStreak = savedWinStreak;
                                                        // }
                                                        user.evolution.servers[server.key].kills = kills;
                                                        user.evolution.servers[server.key].deaths = deaths;
                                                        user.evolution.servers[server.key].powerups = powerups;
                                                        user.evolution.servers[server.key].evolves = evolves;
                                                        user.evolution.servers[server.key].points = points;
                                                        user.evolution.servers[server.key].rewards = rewards;
                                                        user.evolution.servers[server.key].orbs = orbs;
                                                        user.evolution.servers[server.key].revenges = revenges;
                                                        user.evolution.servers[server.key].wins = wins;
                                                        user.evolution.servers[server.key].rounds = rounds;
                                                        user.evolution.servers[server.key].winRatio = rounds > 5 ? wins / rounds : 0;
                                                        user.evolution.servers[server.key].killDeathRatio = rounds >= 5 && deaths > 0 ? kills / deaths : kills;
                                                        user.evolution.servers[server.key].roundPointRatio = rounds >= 5 && rounds > 0 ? points / rounds : 0;
                                                        user.evolution.servers[server.key].averageLatency = rounds >= 5 ? (0, util_1.average)(latency) : 0;
                                                        user.evolution.servers[server.key].timeSpent = parseFloat((rounds * 5 / 60).toFixed(1));
                                                        user.evolution.servers[server.key].hashHistory = hashHistory;
                                                        user.evolution.servers[server.key].hashHistory2 = hashHistory2;
                                                        for (_28 = 0, _29 = ['kills', 'deaths', 'powerups', 'evolves', 'points', 'rewards', 'orbs', 'revenges', 'rounds', 'wins', 'timeSpent', 'winRatio', 'killDeathRatio', 'roundPointRatio', 'averageLatency']; _28 < _29.length; _28++) {
                                                            statKey = _29[_28];
                                                            leaderboards[server.key][statKey].push({
                                                                name: mapAddressToUsername[user.address],
                                                                address: user.address,
                                                                count: user.evolution.servers[server.key][statKey]
                                                            });
                                                        }
                                                    }
                                                    user.evolution.lastUpdated = (new Date()).getTime();
                                                    if (address === '0x9aAe5CBe5C124e1BE62BD83eD07367d57F8998E0') {
                                                        (0, util_2.log)(user);
                                                    }
                                                    return [4 /*yield*/, app.db.saveUser(user)];
                                                case 2:
                                                    _30.sent();
                                                    return [3 /*break*/, 4];
                                                case 3:
                                                    e_14 = _30.sent();
                                                    (0, util_2.log)(e_14);
                                                    return [3 /*break*/, 4];
                                                case 4: return [2 /*return*/];
                                            }
                                        });
                                    };
                                    _17 = 0, playerAddresses_1 = playerAddresses;
                                    _23.label = 5;
                                case 5:
                                    if (!(_17 < playerAddresses_1.length)) return [3 /*break*/, 8];
                                    address = playerAddresses_1[_17];
                                    return [5 /*yield**/, _loop_5(address)];
                                case 6:
                                    _23.sent();
                                    _23.label = 7;
                                case 7:
                                    _17++;
                                    return [3 /*break*/, 5];
                                case 8:
                                    for (_18 = 0, _19 = ['kills', 'deaths', 'powerups', 'evolves', 'points', 'rewards', 'orbs', 'revenges', 'rounds', 'wins', 'timeSpent', 'winRatio', 'killDeathRatio', 'roundPointRatio']; _18 < _19.length; _18++) {
                                        statKey = _19[_18];
                                        leaderboards[server.key][statKey] = leaderboards[server.key][statKey].filter(function (a) { return !!a.count; }).sort(function (a, b) { return b.count - a.count; });
                                    }
                                    for (_20 = 0, _21 = ['averageLatency']; _20 < _21.length; _20++) {
                                        statKey = _21[_20];
                                        leaderboards[server.key][statKey] = leaderboards[server.key][statKey].filter(function (a) { return !!a.count; }).sort(function (a, b) { return a.count - b.count; });
                                    }
                                    _loop_6 = function (address) {
                                        var user, _31, _32, statKey;
                                        return __generator(this, function (_33) {
                                            switch (_33.label) {
                                                case 0:
                                                    if (address.toLowerCase() === "0xc84ce216fef4EC8957bD0Fb966Bb3c3E2c938082".toLowerCase())
                                                        return [2 /*return*/, "continue"];
                                                    user = app.db.loadUser(address);
                                                    if (!user.evolution.servers[server.key])
                                                        user.evolution.servers[server.key] = {};
                                                    user.evolution.servers[server.key].ranking = {};
                                                    for (_31 = 0, _32 = ['kills', 'deaths', 'powerups', 'evolves', 'points', 'rewards', 'orbs', 'revenges', 'rounds', 'wins', 'timeSpent', 'winRatio', 'killDeathRatio', 'roundPointRatio', 'averageLatency']; _31 < _32.length; _31++) {
                                                        statKey = _32[_31];
                                                        user.evolution.servers[server.key].ranking[statKey] = {
                                                            position: leaderboards[server.key][statKey].findIndex(function (item) { return item.address == user.address; }) + 1,
                                                            total: leaderboards[server.key][statKey].length
                                                        };
                                                    }
                                                    return [4 /*yield*/, app.db.saveUser(user)];
                                                case 1:
                                                    _33.sent();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    };
                                    _22 = 0, playerAddresses_2 = playerAddresses;
                                    _23.label = 9;
                                case 9:
                                    if (!(_22 < playerAddresses_2.length)) return [3 /*break*/, 12];
                                    address = playerAddresses_2[_22];
                                    return [5 /*yield**/, _loop_6(address)];
                                case 10:
                                    _23.sent();
                                    _23.label = 11;
                                case 11:
                                    _22++;
                                    return [3 /*break*/, 9];
                                case 12:
                                    leaderboards[server.key].lastUpdated = (new Date()).getTime();
                                    fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/".concat(server.key, "/leaderboard2.json")), (0, json_beautify_1.default)(leaderboards[server.key], null, 2), { atomic: true });
                                    _23.label = 13;
                                case 13: return [3 /*break*/, 15];
                                case 14:
                                    e_13 = _23.sent();
                                    (0, util_2.log)(e_13);
                                    return [3 /*break*/, 15];
                                case 15: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, _f = app.db.evolutionServers;
                    _16.label = 2;
                case 2:
                    if (!(_i < _f.length)) return [3 /*break*/, 5];
                    server = _f[_i];
                    return [5 /*yield**/, _loop_1(server)];
                case 3:
                    _16.sent();
                    _16.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    leaderboards.overall = {
                        kills: [],
                        deaths: [],
                        powerups: [],
                        evolves: [],
                        points: [],
                        rewards: [],
                        orbs: [],
                        revenges: [],
                        rounds: [],
                        wins: [],
                        timeSpent: [],
                        winRatio: [],
                        killDeathRatio: [],
                        roundPointRatio: [],
                        averageLatency: []
                    };
                    _g = 0, evolutionPlayers_1 = evolutionPlayers;
                    _16.label = 6;
                case 6:
                    if (!(_g < evolutionPlayers_1.length)) return [3 /*break*/, 9];
                    player = evolutionPlayers_1[_g];
                    user = app.db.loadUser(player.address);
                    if (!user.evolution)
                        user.evolution = {};
                    if (!user.evolution.overall)
                        user.evolution.overall = {};
                    user.evolution.overall.kills = 0;
                    user.evolution.overall.deaths = 0;
                    user.evolution.overall.powerups = 0;
                    user.evolution.overall.evolves = 0;
                    user.evolution.overall.points = 0;
                    user.evolution.overall.rewards = 0;
                    user.evolution.overall.orbs = 0;
                    user.evolution.overall.revenges = 0;
                    user.evolution.overall.rounds = 0;
                    user.evolution.overall.wins = 0;
                    user.evolution.overall.timeSpent = 0;
                    latency = [];
                    for (key in user.evolution.servers) {
                        server = user.evolution.servers[key];
                        user.evolution.overall.kills += server.kills || 0;
                        user.evolution.overall.deaths += server.deaths || 0;
                        user.evolution.overall.powerups += server.powerups || 0;
                        user.evolution.overall.evolves += server.evolves || 0;
                        user.evolution.overall.points += server.points || 0;
                        user.evolution.overall.rewards += server.rewards || 0;
                        user.evolution.overall.orbs += server.orbs || 0;
                        user.evolution.overall.revenges += server.revenges || 0;
                        user.evolution.overall.rounds += server.rounds || 0;
                        user.evolution.overall.wins += server.wins || 0;
                        user.evolution.overall.timeSpent += server.timeSpent || 0;
                        if (server.winStreak > user.evolution.overall.winStreak) {
                            user.evolution.overall.winStreak = server.winStreak;
                        }
                        if (server.averageLatency) {
                            latency.push(server.averageLatency);
                        }
                    }
                    user.evolution.overall.winRatio = user.evolution.overall.rounds >= 5 ? user.evolution.overall.wins / user.evolution.overall.rounds : 0;
                    user.evolution.overall.killDeathRatio = user.evolution.overall.rounds >= 5 && user.evolution.overall.deaths > 0 ? user.evolution.overall.kills / user.evolution.overall.deaths : user.evolution.overall.kills;
                    user.evolution.overall.roundPointRatio = user.evolution.overall.rounds >= 5 ? user.evolution.overall.points / user.evolution.overall.rounds : 0;
                    user.evolution.overall.averageLatency = latency.length > 0 ? (0, util_1.average)(latency) : 0;
                    for (_h = 0, _j = ['kills', 'deaths', 'powerups', 'evolves', 'points', 'rewards', 'orbs', 'revenges', 'rounds', 'wins', 'timeSpent', 'winRatio', 'killDeathRatio', 'roundPointRatio', 'averageLatency']; _h < _j.length; _h++) {
                        statKey = _j[_h];
                        if (user.evolution.overall[statKey] && user.evolution.overall[statKey] > 0 && user.evolution.overall[statKey] !== null) {
                            leaderboards.overall[statKey].push({
                                name: mapAddressToUsername[user.address],
                                address: user.address,
                                count: user.evolution.overall[statKey]
                            });
                        }
                    }
                    return [4 /*yield*/, app.db.saveUser(user)];
                case 7:
                    _16.sent();
                    _16.label = 8;
                case 8:
                    _g++;
                    return [3 /*break*/, 6];
                case 9:
                    // Sort descending
                    for (_k = 0, _l = ['kills', 'deaths', 'powerups', 'evolves', 'points', 'rewards', 'orbs', 'revenges', 'rounds', 'wins', 'timeSpent', 'winRatio', 'killDeathRatio', 'roundPointRatio']; _k < _l.length; _k++) {
                        statKey = _l[_k];
                        leaderboards.overall[statKey] = leaderboards.overall[statKey].filter(function (a) { return !!a.count; }).sort(function (a, b) { return b.count - a.count; });
                    }
                    // Sort ascending
                    for (_m = 0, _o = ['averageLatency']; _m < _o.length; _m++) {
                        statKey = _o[_m];
                        leaderboards.overall[statKey] = leaderboards.overall[statKey].filter(function (a) { return !!a.count; }).sort(function (a, b) { return a.count - b.count; });
                    }
                    _loop_2 = function (player) {
                        var user, _34, _35, statKey;
                        return __generator(this, function (_36) {
                            switch (_36.label) {
                                case 0:
                                    user = app.db.loadUser(player.address);
                                    if (!user.evolution)
                                        user.evolution = {};
                                    if (!user.evolution.overall)
                                        user.evolution.overall = {};
                                    user.evolution.overall.ranking = {};
                                    for (_34 = 0, _35 = ['kills', 'deaths', 'powerups', 'evolves', 'points', 'rewards', 'orbs', 'revenges', 'rounds', 'wins', 'timeSpent', 'winRatio', 'killDeathRatio', 'roundPointRatio', 'averageLatency']; _34 < _35.length; _34++) {
                                        statKey = _35[_34];
                                        user.evolution.overall.ranking[statKey] = {
                                            position: leaderboards.overall[statKey].findIndex(function (item) { return item.address == user.address; }) + 1,
                                            total: leaderboards.overall[statKey].length
                                        };
                                    }
                                    return [4 /*yield*/, app.db.saveUser(user)];
                                case 1:
                                    _36.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _p = 0, evolutionPlayers_2 = evolutionPlayers;
                    _16.label = 10;
                case 10:
                    if (!(_p < evolutionPlayers_2.length)) return [3 /*break*/, 13];
                    player = evolutionPlayers_2[_p];
                    return [5 /*yield**/, _loop_2(player)];
                case 11:
                    _16.sent();
                    _16.label = 12;
                case 12:
                    _p++;
                    return [3 /*break*/, 10];
                case 13:
                    fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/players.json"), (0, json_beautify_1.default)(evolutionPlayers, null, 2), { atomic: true });
                    // const mapKeyToName = {
                    //   kills: "Kills",
                    //   deaths: "Deaths",
                    //   powerups: "Powerups",
                    //   evolves: "Evolves",
                    //   points: "Points",
                    //   rewards: "Rewards",
                    //   orbs: "Orbs",
                    //   revenges: "Revenges",
                    //   rounds: "Rounds",
                    //   wins: "Wins",
                    //   timeSpent: "Time Spent",
                    //   winRatio: "Win Ratio",
                    //   killDeathRatio: "Kill Death Ratio",
                    //   roundPointRatio: "Round Point Ratio",
                    //   averageLatency: "Average Latency"
                    // }
                    // const reformattedLeaderboard = {}
                    // for (const key in Object.keys(leaderboards.overall)) {
                    //   const stat = leaderboards.overall[key]
                    //   reformattedLeaderboard[key] = [{
                    //     "name": mapKeyToName[key],
                    //     "count": 10,
                    //     "data": stat.map(s => ({
                    //       username: mapAddressToUsername[s.address],
                    //       count: s.count
                    //     }))
                    //   }]
                    // }
                    leaderboards.overall.lastUpdated = (new Date()).getTime();
                    fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/leaderboard.json"), (0, json_beautify_1.default)(leaderboards.overall, null, 2), { atomic: true });
                    return [3 /*break*/, 15];
                case 14:
                    e_1 = _16.sent();
                    (0, util_2.log)(e_1);
                    return [3 /*break*/, 15];
                case 15:
                    // Update evolution hash map
                    try {
                        (0, util_2.log)('Update evolution hash map');
                        for (_q = 0, _r = app.db.evolutionServers; _q < _r.length; _q++) {
                            server = _r[_q];
                            if (server.status !== 'online')
                                continue;
                            if (!playerRoundWinners[server.key])
                                continue;
                            (0, util_2.log)('Server', server.key);
                            try {
                                data = {
                                    toName: {},
                                    toHash: {}
                                };
                                for (_s = 0, _t = playerRoundWinners[server.key]; _s < _t.length; _s++) {
                                    round = _t[_s];
                                    if (server.status !== 'online')
                                        continue;
                                    for (_u = 0, round_1 = round; _u < round_1.length; _u++) {
                                        player = round_1[_u];
                                        if (player.hash && player.joinedAt >= 1625322027) {
                                            if (!data.toName[player.hash])
                                                data.toName[player.hash] = [];
                                            if (!data.toHash[player.name])
                                                data.toHash[player.name] = [];
                                            if (!data.toName[player.hash].includes(player.name)) {
                                                data.toName[player.hash].push(player.name);
                                            }
                                            if (!data.toHash[player.name].includes(player.hash)) {
                                                data.toHash[player.name].push(player.hash);
                                            }
                                        }
                                    }
                                }
                                fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/".concat(server.key, "/hashmap.json")), (0, json_beautify_1.default)(data, null, 2), { atomic: true });
                            }
                            catch (e) {
                                (0, util_2.log)(e);
                            }
                        }
                    }
                    catch (e) {
                        (0, util_2.log)(e);
                    }
                    // Update evolution stats
                    try {
                        (0, util_2.log)('Update evolution stats');
                        for (_v = 0, _w = app.db.evolutionServers; _v < _w.length; _v++) {
                            server = _w[_v];
                            if (server.status !== 'online')
                                continue;
                            if (!playerRoundWinners[server.key])
                                continue;
                            try {
                                stats = {
                                    averagePlayerLatency: 0,
                                    averageWinnerLatency: 0,
                                    medianPlayerLatency: 0,
                                    medianWinnerLatency: 0
                                };
                                playerLatencyList = [];
                                winnerLatencyList = [];
                                for (_x = 0, _y = playerRoundWinners[server.key]; _x < _y.length; _x++) {
                                    round = _y[_x];
                                    if (server.status !== 'online')
                                        continue;
                                    winner = void 0;
                                    for (_z = 0, round_2 = round; _z < round_2.length; _z++) {
                                        player = round_2[_z];
                                        if (!player.isDead && !player.isSpectating && player.latency && player.latency > 5 && player.latency < 600) {
                                            if (!winner || (player.winner && winner.winner && player.winner.points > winner.winner.points)) {
                                                winner = player;
                                            }
                                        }
                                    }
                                    for (_0 = 0, round_3 = round; _0 < round_3.length; _0++) {
                                        player = round_3[_0];
                                        if (!player.isDead && !player.isSpectating && player.latency && player.latency > 5 && player.latency < 600 && winner !== player) {
                                            playerLatencyList.push(player.latency);
                                        }
                                    }
                                    if (winner) {
                                        winnerLatencyList.push(winner.latency);
                                    }
                                }
                                stats.medianPlayerLatency = median(playerLatencyList);
                                stats.medianWinnerLatency = median(winnerLatencyList);
                                stats.averagePlayerLatency = (0, util_1.average)(playerLatencyList);
                                stats.averageWinnerLatency = (0, util_1.average)(winnerLatencyList);
                                fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/".concat(server.key, "/stats.json")), (0, json_beautify_1.default)(stats, null, 2), { atomic: true });
                            }
                            catch (e) {
                                (0, util_2.log)(e);
                            }
                        }
                    }
                    catch (e) {
                        (0, util_2.log)(e);
                    }
                    _16.label = 16;
                case 16:
                    _16.trys.push([16, 21, , 22]);
                    (0, util_2.log)('Update evolution reward history');
                    _loop_3 = function (server) {
                        var rewardHistory, rand, response, dupChecker_2, data, lastIndex, lastRewardItem, i, _37, data_2, win, e_15;
                        return __generator(this, function (_38) {
                            switch (_38.label) {
                                case 0:
                                    if (server.status !== 'online')
                                        return [2 /*return*/, "continue"];
                                    (0, util_2.log)('Server', server.key);
                                    _38.label = 1;
                                case 1:
                                    _38.trys.push([1, 4, , 5]);
                                    rewardHistory = fs_jetpack_1.default.read(path_1.default.resolve("./db/evolution/".concat(server.key, "/rewardHistory.json")), 'json') || [];
                                    rand = Math.floor(Math.random() * Math.floor(999999));
                                    return [4 /*yield*/, fetch("https://".concat(server.endpoint, "/data/rewardHistory.json?").concat(rand))];
                                case 2:
                                    response = _38.sent();
                                    dupChecker_2 = {};
                                    return [4 /*yield*/, response.json()];
                                case 3:
                                    data = _38.sent();
                                    lastIndex = 0;
                                    if (!Array.isArray(data))
                                        return [2 /*return*/, "continue"];
                                    if (rewardHistory.length) {
                                        lastRewardItem = rewardHistory[rewardHistory.length - 1];
                                        for (i = 0; i < data.length; i++) {
                                            if (data[i].symbol === lastRewardItem.symbol && data[i].quantity === lastRewardItem.quantity && data[i].winner.address === lastRewardItem.winner.address) { //  && data[i].pos.x === lastRewardItem.pos.x && data[i].pos.y === lastRewardItem.pos.y
                                                lastIndex = i;
                                            }
                                        }
                                    }
                                    (0, util_2.log)('Starting from', lastIndex);
                                    if (lastIndex === 0 && rewardHistory.length) {
                                        console.warn("Shouldnt start from 0");
                                        playerRewardWinners[server.key] = rewardHistory;
                                    }
                                    else {
                                        data = rewardHistory.concat(data.slice(lastIndex + 1)).filter(function (p) {
                                            if (!p.winner.lastUpdate && dupChecker_2[p.tx])
                                                return;
                                            dupChecker_2[p.tx] = true;
                                            return !!p.winner && p.winner.address && (!p.winner.lastUpdate || (p.winner.lastUpdate >= 1625322027 && p.winner.lastUpdate <= 1625903860));
                                        });
                                        for (_37 = 0, data_2 = data; _37 < data_2.length; _37++) {
                                            win = data_2[_37];
                                            if (!win.monetary)
                                                win.monetary = 0;
                                            if (win.winner.lastUpdate) {
                                                if (win.winner.lastUpdate < 1625552384) {
                                                    win.quantity = 1;
                                                }
                                                else {
                                                    win.quantity = 0.1;
                                                }
                                            }
                                            if (win.symbol) {
                                                win.monetary = app.db.findPrice(win.symbol, win.winner.lastUpdate) * win.quantity;
                                            }
                                        }
                                        fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/".concat(server.key, "/rewardHistory.json")), (0, json_beautify_1.default)(data, null, 2), { atomic: true });
                                        playerRewardWinners[server.key] = data;
                                    }
                                    return [3 /*break*/, 5];
                                case 4:
                                    e_15 = _38.sent();
                                    (0, util_2.log)(e_15);
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    };
                    _1 = 0, _2 = app.db.evolutionServers;
                    _16.label = 17;
                case 17:
                    if (!(_1 < _2.length)) return [3 /*break*/, 20];
                    server = _2[_1];
                    return [5 /*yield**/, _loop_3(server)];
                case 18:
                    _16.sent();
                    _16.label = 19;
                case 19:
                    _1++;
                    return [3 /*break*/, 17];
                case 20: return [3 /*break*/, 22];
                case 21:
                    e_2 = _16.sent();
                    (0, util_2.log)(e_2);
                    return [3 /*break*/, 22];
                case 22:
                    _16.trys.push([22, 30, , 31]);
                    (0, util_2.log)('Update evolution rewards');
                    _3 = 0, _4 = app.db.evolutionServers;
                    _16.label = 23;
                case 23:
                    if (!(_3 < _4.length)) return [3 /*break*/, 29];
                    server = _4[_3];
                    if (server.status !== 'online')
                        return [3 /*break*/, 28];
                    (0, util_2.log)('Server', server.key);
                    _16.label = 24;
                case 24:
                    _16.trys.push([24, 27, , 28]);
                    rand = Math.floor(Math.random() * Math.floor(999999));
                    return [4 /*yield*/, fetch("https://".concat(server.endpoint, "/data/rewards.json?").concat(rand))];
                case 25:
                    response = _16.sent();
                    return [4 /*yield*/, response.json()];
                case 26:
                    data = _16.sent();
                    fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/".concat(server.key, "/rewards.json")), (0, json_beautify_1.default)(data, null, 2), { atomic: true });
                    return [3 /*break*/, 28];
                case 27:
                    e_3 = _16.sent();
                    (0, util_2.log)(e_3);
                    return [3 /*break*/, 28];
                case 28:
                    _3++;
                    return [3 /*break*/, 23];
                case 29: return [3 /*break*/, 31];
                case 30:
                    e_4 = _16.sent();
                    (0, util_2.log)(e_4);
                    return [3 /*break*/, 31];
                case 31:
                    _16.trys.push([31, 43, , 44]);
                    (0, util_2.log)('Update evolution ban list');
                    _5 = 0, _6 = app.db.evolutionServers;
                    _16.label = 32;
                case 32:
                    if (!(_5 < _6.length)) return [3 /*break*/, 42];
                    server = _6[_5];
                    if (server.status !== 'online')
                        return [3 /*break*/, 41];
                    (0, util_2.log)('Server', server.key);
                    _16.label = 33;
                case 33:
                    _16.trys.push([33, 40, , 41]);
                    rand = Math.floor(Math.random() * Math.floor(999999));
                    return [4 /*yield*/, fetch("https://".concat(server.endpoint, "/data/banList.json?").concat(rand))];
                case 34:
                    response = _16.sent();
                    return [4 /*yield*/, response.json()];
                case 35:
                    data = _16.sent();
                    fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/".concat(server.key, "/bans.json")), (0, json_beautify_1.default)(data, null, 2), { atomic: true });
                    _7 = 0, data_1 = data;
                    _16.label = 36;
                case 36:
                    if (!(_7 < data_1.length)) return [3 /*break*/, 39];
                    banItem = data_1[_7];
                    user = app.db.loadUser(banItem);
                    if (!user.evolution)
                        user.evolution = {};
                    if (!user.evolution.servers)
                        user.evolution.servers = {};
                    if (!user.evolution.servers[server.key])
                        user.evolution.servers[server.key] = {};
                    user.evolution.servers[server.key].isBanned = true;
                    user.evolution.isBanned = true;
                    return [4 /*yield*/, app.db.saveUser(user)];
                case 37:
                    _16.sent();
                    _16.label = 38;
                case 38:
                    _7++;
                    return [3 /*break*/, 36];
                case 39: return [3 /*break*/, 41];
                case 40:
                    e_5 = _16.sent();
                    (0, util_2.log)(e_5);
                    return [3 /*break*/, 41];
                case 41:
                    _5++;
                    return [3 /*break*/, 32];
                case 42: return [3 /*break*/, 44];
                case 43:
                    e_6 = _16.sent();
                    (0, util_2.log)(e_6);
                    return [3 /*break*/, 44];
                case 44:
                    _16.trys.push([44, 52, , 53]);
                    (0, util_2.log)('Update evolution player rewards');
                    _8 = 0, _9 = app.db.evolutionServers;
                    _16.label = 45;
                case 45:
                    if (!(_8 < _9.length)) return [3 /*break*/, 51];
                    server = _9[_8];
                    if (server.status !== 'online')
                        return [3 /*break*/, 50];
                    (0, util_2.log)('Server', server.key);
                    _16.label = 46;
                case 46:
                    _16.trys.push([46, 49, , 50]);
                    rand = Math.floor(Math.random() * Math.floor(999999));
                    return [4 /*yield*/, fetch("https://".concat(server.endpoint, "/data/playerRewards.json?").concat(rand))];
                case 47:
                    response = _16.sent();
                    return [4 /*yield*/, response.json()];
                case 48:
                    data = _16.sent();
                    fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/".concat(server.key, "/playerRewards.json")), (0, json_beautify_1.default)(data, null, 2), { atomic: true });
                    return [3 /*break*/, 50];
                case 49:
                    e_7 = _16.sent();
                    (0, util_2.log)(e_7);
                    return [3 /*break*/, 50];
                case 50:
                    _8++;
                    return [3 /*break*/, 45];
                case 51: return [3 /*break*/, 53];
                case 52:
                    e_8 = _16.sent();
                    (0, util_2.log)(e_8);
                    return [3 /*break*/, 53];
                case 53:
                    _16.trys.push([53, 61, , 62]);
                    (0, util_2.log)('Update evolution player rewards');
                    _10 = 0, _11 = app.db.evolutionServers;
                    _16.label = 54;
                case 54:
                    if (!(_10 < _11.length)) return [3 /*break*/, 60];
                    server = _11[_10];
                    if (server.status !== 'online')
                        return [3 /*break*/, 59];
                    (0, util_2.log)('Server', server.key);
                    _16.label = 55;
                case 55:
                    _16.trys.push([55, 58, , 59]);
                    rand = Math.floor(Math.random() * Math.floor(999999));
                    return [4 /*yield*/, fetch("https://".concat(server.endpoint, "/data/log.json?").concat(rand))];
                case 56:
                    response = _16.sent();
                    return [4 /*yield*/, response.json()];
                case 57:
                    data = _16.sent();
                    fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/".concat(server.key, "/log.json")), (0, json_beautify_1.default)(data, null, 2), { atomic: true });
                    return [3 /*break*/, 59];
                case 58:
                    e_9 = _16.sent();
                    (0, util_2.log)(e_9);
                    return [3 /*break*/, 59];
                case 59:
                    _10++;
                    return [3 /*break*/, 54];
                case 60: return [3 /*break*/, 62];
                case 61:
                    e_10 = _16.sent();
                    (0, util_2.log)(e_10);
                    return [3 /*break*/, 62];
                case 62:
                    _16.trys.push([62, 70, , 71]);
                    (0, util_2.log)('Update evolution player rewards');
                    _12 = 0, _13 = app.db.evolutionServers;
                    _16.label = 63;
                case 63:
                    if (!(_12 < _13.length)) return [3 /*break*/, 69];
                    server = _13[_12];
                    if (server.status !== 'online')
                        return [3 /*break*/, 68];
                    (0, util_2.log)('Server', server.key);
                    _16.label = 64;
                case 64:
                    _16.trys.push([64, 67, , 68]);
                    rand = Math.floor(Math.random() * Math.floor(999999));
                    return [4 /*yield*/, fetch("https://".concat(server.endpoint, "/data/playerReports.json?").concat(rand))];
                case 65:
                    response = _16.sent();
                    return [4 /*yield*/, response.json()];
                case 66:
                    data = _16.sent();
                    fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/".concat(server.key, "/playerReports.json")), (0, json_beautify_1.default)(data, null, 2), { atomic: true });
                    return [3 /*break*/, 68];
                case 67:
                    e_11 = _16.sent();
                    (0, util_2.log)(e_11);
                    return [3 /*break*/, 68];
                case 68:
                    _12++;
                    return [3 /*break*/, 63];
                case 69: return [3 /*break*/, 71];
                case 70:
                    e_12 = _16.sent();
                    (0, util_2.log)(e_12);
                    return [3 /*break*/, 71];
                case 71:
                    _loop_4 = function (server) {
                        var leaderboardHistory_2, roundsPlayed_1, _39, _40, round, _41, round_5, player, groupedWinPlayers_1, findUsername, evolutionEarningsDistributed, groupedRewardPlayers_1, _42, _43, reward, _44, _45, wins, wins2, _46, wins2_1, win, quantity, monetary, _47, _48, address, user, earnings, _49, _50, s, hist, historicalEarnings, oldTime, newTime, diff, newTime, data, e_16;
                        return __generator(this, function (_51) {
                            switch (_51.label) {
                                case 0:
                                    if (server.status !== 'online')
                                        return [2 /*return*/, "continue"];
                                    if (!playerRoundWinners[server.key] || !Array.isArray(playerRewardWinners[server.key]))
                                        return [2 /*return*/, "continue"];
                                    (0, util_2.log)('Server', server.key);
                                    _51.label = 1;
                                case 1:
                                    _51.trys.push([1, 6, , 7]);
                                    leaderboardHistory_2 = fs_jetpack_1.default.read(path_1.default.resolve("./db/evolution/".concat(server.key, "/leaderboardHistory.json")), 'json') || [];
                                    roundsPlayed_1 = {};
                                    for (_39 = 0, _40 = playerRoundWinners[server.key]; _39 < _40.length; _39++) {
                                        round = _40[_39];
                                        for (_41 = 0, round_5 = round; _41 < round_5.length; _41++) {
                                            player = round_5[_41];
                                            if (player.joinedAt >= 1625322027 && player.name.indexOf('Guest') === -1) {
                                                if (!roundsPlayed_1[player.address]) {
                                                    roundsPlayed_1[player.address] = {
                                                        address: player.address,
                                                        name: player.name,
                                                        rounds: 0,
                                                        kills: 0,
                                                        deaths: 0,
                                                        points: 0,
                                                        rewards: 0,
                                                        evolves: 0,
                                                        powerups: 0
                                                    };
                                                }
                                                roundsPlayed_1[player.address].kills += player.kills;
                                                roundsPlayed_1[player.address].deaths += player.deaths;
                                                roundsPlayed_1[player.address].points += player.points;
                                                roundsPlayed_1[player.address].powerups += player.powerups;
                                                roundsPlayed_1[player.address].rewards += player.rewards;
                                                roundsPlayed_1[player.address].evolves += player.evolves;
                                                roundsPlayed_1[player.address].rounds++;
                                            }
                                        }
                                    }
                                    groupedWinPlayers_1 = (0, util_1.groupBySub)(playerRoundWinners[server.key].map(function (leaderboard) {
                                        var winner = leaderboard[0];
                                        for (var _i = 0, leaderboard_1 = leaderboard; _i < leaderboard_1.length; _i++) {
                                            var p = leaderboard_1[_i];
                                            if (p.points > winner.points) {
                                                winner = p;
                                            }
                                        }
                                        if (!winner)
                                            return;
                                        return { winner: winner };
                                    }).filter(function (p) { return !!p; }), 'winner', 'address');
                                    findUsername = function (address) {
                                        for (var _i = 0, leaderboardHistory_3 = leaderboardHistory_2; _i < leaderboardHistory_3.length; _i++) {
                                            var lb = leaderboardHistory_3[_i];
                                            for (var _a = 0, lb_1 = lb; _a < lb_1.length; _a++) {
                                                var pl = lb_1[_a];
                                                if (pl.address === address && pl.name.indexOf('Guest') === -1) {
                                                    return pl.name;
                                                }
                                            }
                                        }
                                        return address.slice(0, 6);
                                    };
                                    evolutionEarningsDistributed = 0;
                                    groupedRewardPlayers_1 = {};
                                    for (_42 = 0, _43 = playerRewardWinners[server.key]; _42 < _43.length; _42++) {
                                        reward = _43[_42];
                                        // if (reward.winner.lastUpdate) continue // skip old winners
                                        if (!groupedRewardPlayers_1[reward.winner.address])
                                            groupedRewardPlayers_1[reward.winner.address] = { monetary: 0 };
                                        groupedRewardPlayers_1[reward.winner.address].address = reward.winner.address;
                                        groupedRewardPlayers_1[reward.winner.address].name = findUsername(reward.winner.address);
                                        groupedRewardPlayers_1[reward.winner.address].monetary += reward.monetary;
                                        evolutionEarningsDistributed += reward.monetary;
                                    }
                                    for (_44 = 0, _45 = Object.values(groupedWinPlayers_1); _44 < _45.length; _44++) {
                                        wins = _45[_44];
                                        wins2 = wins;
                                        for (_46 = 0, wins2_1 = wins2; _46 < wins2_1.length; _46++) {
                                            win = wins2_1[_46];
                                            if (win.winner.lastUpdate > 1625903860)
                                                continue; // skip new winners
                                            if (!groupedRewardPlayers_1[win.winner.address])
                                                groupedRewardPlayers_1[win.winner.address] = { monetary: 0 };
                                            quantity = 0;
                                            if (win.winner.lastUpdate < 1625552384) {
                                                quantity = 1;
                                            }
                                            else {
                                                quantity = 0.3;
                                            }
                                            monetary = app.db.findPrice('zod', win.winner.lastUpdate) * quantity;
                                            groupedRewardPlayers_1[win.winner.address].address = win.winner.address;
                                            groupedRewardPlayers_1[win.winner.address].name = findUsername(win.winner.address);
                                            groupedRewardPlayers_1[win.winner.address].monetary += monetary;
                                            evolutionEarningsDistributed += monetary;
                                        }
                                    }
                                    _47 = 0, _48 = Object.keys(groupedRewardPlayers_1);
                                    _51.label = 2;
                                case 2:
                                    if (!(_47 < _48.length)) return [3 /*break*/, 5];
                                    address = _48[_47];
                                    if (!(groupedRewardPlayers_1[address].monetary > 0)) return [3 /*break*/, 4];
                                    user = app.db.loadUser(address);
                                    if (!((_d = (_c = user === null || user === void 0 ? void 0 : user.evolution) === null || _c === void 0 ? void 0 : _c.servers) === null || _d === void 0 ? void 0 : _d[server.key])) return [3 /*break*/, 4];
                                    user.evolution.servers[server.key].earnings = groupedRewardPlayers_1[address].monetary;
                                    earnings = 0;
                                    for (_49 = 0, _50 = Object.keys(user.evolution.servers); _49 < _50.length; _49++) {
                                        s = _50[_49];
                                        if (Number.isFinite(user.evolution.servers[s].earnings))
                                            earnings += user.evolution.servers[s].earnings;
                                    }
                                    user.evolution.overall.earnings = earnings;
                                    return [4 /*yield*/, app.db.saveUser(user)];
                                case 3:
                                    _51.sent();
                                    _51.label = 4;
                                case 4:
                                    _47++;
                                    return [3 /*break*/, 2];
                                case 5:
                                    hist = fs_jetpack_1.default.read(path_1.default.resolve("./db/evolution/".concat(server.key, "/historical.json")), 'json') || {};
                                    if (!hist.earnings)
                                        hist.earnings = [];
                                    historicalEarnings = hist.earnings;
                                    if (historicalEarnings === null || historicalEarnings === void 0 ? void 0 : historicalEarnings.length) {
                                        oldTime = (new Date(((_e = evolutionEarningsDistributed[historicalEarnings.length - 1]) === null || _e === void 0 ? void 0 : _e[0]) || 0)).getTime();
                                        newTime = (new Date()).getTime();
                                        diff = newTime - oldTime;
                                        if (diff / (1000 * 60 * 60 * 24) > 1) {
                                            historicalEarnings.push([newTime, evolutionEarningsDistributed]);
                                        }
                                    }
                                    else {
                                        newTime = (new Date()).getTime();
                                        historicalEarnings.push([newTime, evolutionEarningsDistributed]);
                                    }
                                    fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/".concat(server.key, "/historical.json")), (0, json_beautify_1.default)(hist, null, 2), { atomic: true });
                                    data = {
                                        // all: [
                                        //   {
                                        //     name: 'Overall',
                                        //     count: 10,
                                        //     data: Object.keys(groupedRewardPlayers).map(address => ({
                                        //       username: groupedRewardPlayers[address][0].winner.name,
                                        //       count: groupedRewardPlayers[address].length
                                        //     })).sort(function(a, b) {
                                        //       return b.count - a.count
                                        //     })
                                        //   }
                                        // ],
                                        monetary: [
                                            {
                                                name: 'Earnings',
                                                count: 10,
                                                data: Object.keys(groupedRewardPlayers_1).map(function (address) { return ({
                                                    username: groupedRewardPlayers_1[address].name,
                                                    count: groupedRewardPlayers_1[address].monetary
                                                }); }).sort(function (a, b) {
                                                    return b.count - a.count;
                                                })
                                            }
                                        ],
                                        wins: [
                                            {
                                                name: 'Wins',
                                                count: 10,
                                                data: Object.keys(groupedWinPlayers_1).map(function (address) {
                                                    var _a;
                                                    return ({
                                                        username: ((_a = groupedWinPlayers_1[address].find(function (g) { return g.winner.name.indexOf('Guest') === -1; })) === null || _a === void 0 ? void 0 : _a.winner.name) || groupedWinPlayers_1[address][0].winner.name,
                                                        count: groupedWinPlayers_1[address].length
                                                    });
                                                }).sort(function (a, b) {
                                                    return b.count - a.count;
                                                })
                                            }
                                        ],
                                        rounds: [
                                            {
                                                name: 'Rounds',
                                                count: 10,
                                                data: Object.keys(roundsPlayed_1).map(function (address) { return ({
                                                    username: roundsPlayed_1[address].name,
                                                    count: roundsPlayed_1[address].rounds
                                                }); }).sort(function (a, b) {
                                                    return b.count - a.count;
                                                })
                                            }
                                        ],
                                        rewards: [
                                            {
                                                name: 'Rewards',
                                                count: 10,
                                                data: Object.keys(roundsPlayed_1).map(function (address) { return ({
                                                    username: roundsPlayed_1[address].name,
                                                    count: roundsPlayed_1[address].rewards
                                                }); }).sort(function (a, b) {
                                                    return b.count - a.count;
                                                })
                                            }
                                        ],
                                        points: [
                                            {
                                                name: 'Points',
                                                count: 10,
                                                data: Object.keys(roundsPlayed_1).map(function (address) { return ({
                                                    username: roundsPlayed_1[address].name,
                                                    count: roundsPlayed_1[address].points
                                                }); }).sort(function (a, b) {
                                                    return b.count - a.count;
                                                })
                                            }
                                        ],
                                        kills: [
                                            {
                                                name: 'Kills',
                                                count: 10,
                                                data: Object.keys(roundsPlayed_1).map(function (address) { return ({
                                                    username: roundsPlayed_1[address].name,
                                                    count: roundsPlayed_1[address].kills
                                                }); }).sort(function (a, b) {
                                                    return b.count - a.count;
                                                })
                                            }
                                        ],
                                        deaths: [
                                            {
                                                name: 'Deaths',
                                                count: 10,
                                                data: Object.keys(roundsPlayed_1).map(function (address) { return ({
                                                    username: roundsPlayed_1[address].name,
                                                    count: roundsPlayed_1[address].deaths
                                                }); }).sort(function (a, b) {
                                                    return b.count - a.count;
                                                })
                                            }
                                        ],
                                        powerups: [
                                            {
                                                name: 'Powerups',
                                                count: 10,
                                                data: Object.keys(roundsPlayed_1).map(function (address) { return ({
                                                    username: roundsPlayed_1[address].name,
                                                    count: roundsPlayed_1[address].powerups
                                                }); }).sort(function (a, b) {
                                                    return b.count - a.count;
                                                })
                                            }
                                        ],
                                        evolves: [
                                            {
                                                name: 'Evolves',
                                                count: 10,
                                                data: Object.keys(roundsPlayed_1).map(function (address) { return ({
                                                    username: roundsPlayed_1[address].name,
                                                    count: roundsPlayed_1[address].evolves
                                                }); }).sort(function (a, b) {
                                                    return b.count - a.count;
                                                })
                                            }
                                        ],
                                    };
                                    fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/".concat(server.key, "/leaderboard.json")), (0, json_beautify_1.default)(data, null, 2), { atomic: true });
                                    return [3 /*break*/, 7];
                                case 6:
                                    e_16 = _51.sent();
                                    (0, util_2.log)(e_16);
                                    return [3 /*break*/, 7];
                                case 7: return [2 /*return*/];
                            }
                        });
                    };
                    _14 = 0, _15 = app.db.evolutionServers;
                    _16.label = 72;
                case 72:
                    if (!(_14 < _15.length)) return [3 /*break*/, 75];
                    server = _15[_14];
                    return [5 /*yield**/, _loop_4(server)];
                case 73:
                    _16.sent();
                    _16.label = 74;
                case 74:
                    _14++;
                    return [3 /*break*/, 72];
                case 75:
                    setTimeout(function () { return monitorEvolutionStats(app); }, 5 * 60 * 1000);
                    return [2 /*return*/];
            }
        });
    });
}
exports.monitorEvolutionStats = monitorEvolutionStats;
