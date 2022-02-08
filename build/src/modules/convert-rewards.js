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
exports.convertRewards = void 0;
var path_1 = __importDefault(require("path"));
var fs_jetpack_1 = __importDefault(require("fs-jetpack"));
var util_1 = require("../util");
function convertRewards(app) {
    return __awaiter(this, void 0, void 0, function () {
        var userCache, evolutionServers, _i, evolutionServers_1, server, playerRewards, _a, _b, address, user, rewards, _c, _d, key, index, item;
        return __generator(this, function (_e) {
            (0, util_1.log)('Convert rewards');
            userCache = {};
            evolutionServers = [
                {
                    "key": "oceanic1",
                    "name": "Oceanic",
                    "regionId": 1,
                    "endpoint": "oceanic1.runeevolution.com",
                    "status": "offline",
                    "playerCount": 0,
                    "rewardItemAmount": 0,
                    "rewardWinnerAmount": 0,
                    "version": "1.6.3",
                    "gameMode": "Mix Game 1",
                    "roundId": 41691,
                    "roundStartedAt": 1644146543,
                    "roundStartedDate": "Mon Aug 30 2021 20:18:35 GMT+0000 (Coordinated Universal Time)",
                    "timeLeft": 286,
                    "timeLeftFancy": "2:13",
                    "timeLeftText": "4:46",
                    "speculatorCount": 0
                },
                {
                    "key": "europe1",
                    "name": "Europe",
                    "regionId": 1,
                    "endpoint": "europe1.runeevolution.com",
                    "status": "offline",
                    "version": "1.6.3",
                    "rewardItemAmount": 0,
                    "rewardWinnerAmount": 0,
                    "playerCount": 0,
                    "gameMode": "Sprite Leader",
                    "roundId": 39824,
                    "roundStartedAt": 1644146527,
                    "roundStartedDate": "Mon Aug 30 2021 20:19:08 GMT+0000 (Coordinated Universal Time)",
                    "timeLeft": 275,
                    "timeLeftFancy": "2:49",
                    "timeLeftText": "4:35",
                    "speculatorCount": 0
                },
                {
                    "key": "europe2",
                    "name": "Europe",
                    "regionId": 2,
                    "endpoint": "europe2.runeevolution.com",
                    "status": "offline",
                    "version": "1.6.3",
                    "rewardItemAmount": 0,
                    "rewardWinnerAmount": 0,
                    "playerCount": 0,
                    "gameMode": "Sticky Mode",
                    "roundId": 20870,
                    "roundStartedAt": 1637351412,
                    "roundStartedDate": "Mon Aug 30 2021 20:19:08 GMT+0000 (Coordinated Universal Time)",
                    "timeLeft": 47,
                    "timeLeftFancy": "2:49",
                    "timeLeftText": "0:47",
                    "speculatorCount": 0
                },
                {
                    "key": "europe3",
                    "name": "Europe",
                    "regionId": 3,
                    "endpoint": "europe3.runeevolution.com",
                    "status": "online",
                    "version": "1.6.3",
                    "rewardItemAmount": 0.006,
                    "rewardWinnerAmount": 0.021,
                    "playerCount": 3,
                    "gameMode": "Sprite Leader",
                    "roundId": 39824,
                    "roundStartedAt": 1644146527,
                    "roundStartedDate": "Mon Aug 30 2021 20:19:08 GMT+0000 (Coordinated Universal Time)",
                    "timeLeft": 275,
                    "timeLeftFancy": "2:49",
                    "timeLeftText": "4:35"
                },
                {
                    "key": "na1",
                    "name": "North America",
                    "regionId": 1,
                    "endpoint": "na1.runeevolution.com",
                    "status": "offline",
                    "playerCount": 0,
                    "rewardItemAmount": 0,
                    "rewardWinnerAmount": 0,
                    "version": "1.6.3",
                    "gameMode": "Leadercap",
                    "roundId": 45684,
                    "roundStartedAt": 1644146371,
                    "roundStartedDate": "Mon Aug 30 2021 20:20:06 GMT+0000 (Coordinated Universal Time)",
                    "timeLeft": 118,
                    "timeLeftFancy": "3:47",
                    "timeLeftText": "1:58",
                    "speculatorCount": 0
                },
                {
                    "key": "sa1",
                    "name": "South America",
                    "regionId": 1,
                    "endpoint": "sa1.runeevolution.com",
                    "status": "offline",
                    "playerCount": 0,
                    "rewardItemAmount": 0,
                    "rewardWinnerAmount": 0,
                    "version": "1.6.3",
                    "gameMode": "Lets Be Friends",
                    "roundId": 41057,
                    "roundStartedAt": 1644146323,
                    "roundStartedDate": "Mon Aug 30 2021 20:17:58 GMT+0000 (Coordinated Universal Time)",
                    "timeLeft": 70,
                    "timeLeftFancy": "1:39",
                    "timeLeftText": "1:10",
                    "speculatorCount": 0
                },
                {
                    "key": "sa2",
                    "name": "South America",
                    "regionId": 2,
                    "endpoint": "sa2.runeevolution.com",
                    "status": "offline",
                    "playerCount": 0,
                    "rewardItemAmount": 0,
                    "rewardWinnerAmount": 0,
                    "version": "1.6.0",
                    "gameMode": "Standard",
                    "roundId": 31127,
                    "roundStartedAt": 1639661096,
                    "roundStartedDate": "Mon Aug 30 2021 20:20:29 GMT+0000 (Coordinated Universal Time)",
                    "timeLeft": 39,
                    "timeLeftFancy": "4:09",
                    "timeLeftText": "0:39",
                    "speculatorCount": 0
                },
                {
                    "key": "sa3",
                    "name": "South America",
                    "regionId": 3,
                    "endpoint": "sa3.runeevolution.com",
                    "status": "offline",
                    "playerCount": 0,
                    "rewardItemAmount": 0,
                    "rewardWinnerAmount": 0,
                    "version": "1.6.3",
                    "gameMode": "Mix Game 2",
                    "roundId": 19136,
                    "roundStartedAt": 1636618815,
                    "roundStartedDate": "Mon Aug 30 2021 20:20:29 GMT+0000 (Coordinated Universal Time)",
                    "timeLeft": 85,
                    "timeLeftFancy": "4:09",
                    "timeLeftText": "1:25",
                    "speculatorCount": 0
                },
                {
                    "key": "sa4",
                    "name": "South America",
                    "regionId": 4,
                    "endpoint": "sa4.runeevolution.com",
                    "status": "offline",
                    "playerCount": 0,
                    "rewardItemAmount": 0,
                    "rewardWinnerAmount": 0,
                    "version": "1.6.3",
                    "gameMode": "Sprite Leader",
                    "roundId": 26876,
                    "roundStartedAt": 1639130586,
                    "roundStartedDate": "Mon Aug 30 2021 20:20:29 GMT+0000 (Coordinated Universal Time)",
                    "timeLeft": 90,
                    "timeLeftFancy": "4:09",
                    "timeLeftText": "1:30",
                    "speculatorCount": 0
                },
                {
                    "key": "sa5",
                    "name": "South America",
                    "regionId": 5,
                    "endpoint": "sa5.runeevolution.com",
                    "status": "offline",
                    "playerCount": 0,
                    "rewardItemAmount": 0,
                    "rewardWinnerAmount": 0,
                    "version": "1.6.3",
                    "gameMode": "Leadercap",
                    "roundId": 19408,
                    "roundStartedAt": 1636878670,
                    "roundStartedDate": "Mon Aug 30 2021 20:20:29 GMT+0000 (Coordinated Universal Time)",
                    "timeLeft": 255,
                    "timeLeftFancy": "4:09",
                    "timeLeftText": "4:15",
                    "speculatorCount": 0
                },
                {
                    "key": "asia1",
                    "name": "Asia",
                    "regionId": 1,
                    "endpoint": "asia1.runeevolution.com",
                    "status": "offline",
                    "playerCount": 0,
                    "rewardItemAmount": 0,
                    "rewardWinnerAmount": 0,
                    "version": "1.6.3",
                    "gameMode": "Mix Game 1",
                    "roundId": 43042,
                    "roundStartedAt": 1644146338,
                    "roundStartedDate": "Mon Aug 30 2021 20:19:55 GMT+0000 (Coordinated Universal Time)",
                    "timeLeft": 84,
                    "timeLeftFancy": "3:35",
                    "timeLeftText": "1:24",
                    "speculatorCount": 0
                },
                {
                    "key": "asia2",
                    "name": "Asia",
                    "regionId": 2,
                    "endpoint": "asia2.runeevolution.com",
                    "status": "offline",
                    "playerCount": 0,
                    "rewardItemAmount": 0,
                    "rewardWinnerAmount": 0,
                    "version": "1.6.3",
                    "gameMode": "Marco Polo",
                    "roundId": 36899,
                    "roundStartedAt": 1642978339,
                    "roundStartedDate": "Mon Aug 30 2021 20:16:48 GMT+0000 (Coordinated Universal Time)",
                    "timeLeft": 44,
                    "timeLeftFancy": "0:27",
                    "timeLeftText": "0:44",
                    "speculatorCount": 0
                },
                {
                    "key": "asia3",
                    "name": "Asia",
                    "regionId": 3,
                    "endpoint": "asia3.runeevolution.com",
                    "status": "offline",
                    "playerCount": 0,
                    "rewardItemAmount": 0,
                    "rewardWinnerAmount": 0,
                    "version": "1.6.0",
                    "gameMode": "Orb Master",
                    "roundId": 21982,
                    "roundStartedAt": 1636933444,
                    "roundStartedDate": "Mon Aug 30 2021 20:19:05 GMT+0000 (Coordinated Universal Time)",
                    "timeLeft": 149,
                    "timeLeftFancy": "2:44",
                    "timeLeftText": "2:29",
                    "speculatorCount": 0
                },
                {
                    "key": "asia4",
                    "name": "Asia",
                    "regionId": 4,
                    "endpoint": "asia4.runeevolution.com",
                    "status": "offline",
                    "playerCount": 0,
                    "rewardItemAmount": 0,
                    "rewardWinnerAmount": 0,
                    "version": "1.6.3",
                    "gameMode": "Fast Drake",
                    "roundId": 19220,
                    "roundStartedAt": 1636878411,
                    "roundStartedDate": "Mon Aug 30 2021 20:17:47 GMT+0000 (Coordinated Universal Time)",
                    "timeLeft": 182,
                    "timeLeftFancy": "1:25",
                    "timeLeftText": "3:02",
                    "speculatorCount": 0
                }
            ];
            // Iterate every realm playerRewards
            // Combine into the user.evolution.rewards object
            for (_i = 0, evolutionServers_1 = evolutionServers; _i < evolutionServers_1.length; _i++) {
                server = evolutionServers_1[_i];
                (0, util_1.log)('Server', server.key);
                try {
                    playerRewards = fs_jetpack_1.default.read(path_1.default.resolve("./db/evolution/".concat(server.key, "/playerRewards.json")), 'json') || {};
                    for (_a = 0, _b = Object.keys(playerRewards); _a < _b.length; _a++) {
                        address = _b[_a];
                        user = userCache[address.toLowerCase()] || app.db.loadUser(address);
                        if (address === '0x865f4a1eDEdBf68f05E0DD27242d397Bb8b1255b') {
                            console.log(111, address, user);
                        }
                        rewards = playerRewards[address];
                        if (!userCache[address.toLowerCase()]) {
                            user.lifetimeRewards = {
                                runes: {},
                                items: {}
                            };
                            userCache[address.toLowerCase()] = user;
                        }
                        for (_c = 0, _d = Object.keys(rewards.pending); _c < _d.length; _c++) {
                            key = _d[_c];
                            if (!user.lifetimeRewards.runes[key])
                                user.lifetimeRewards.runes[key] = 0;
                            user.lifetimeRewards.runes[key] += rewards.pending[key];
                        }
                        for (index in rewards.pendingItems) {
                            item = rewards.pendingItems[index];
                            user.lifetimeRewards.items[item.id] = {
                                name: item.name,
                                rarity: item.rarity,
                                quantity: item.quantity
                            };
                        }
                        if (address === '0x865f4a1eDEdBf68f05E0DD27242d397Bb8b1255b') {
                            console.log(222, address, rewards, user);
                        }
                        if (Object.keys(user.lifetimeRewards.items).length > 0) {
                            console.log(address);
                        }
                        app.db.saveUser(user);
                    }
                }
                catch (e) {
                    (0, util_1.log)(e);
                }
            }
            return [2 /*return*/];
        });
    });
}
exports.convertRewards = convertRewards;
