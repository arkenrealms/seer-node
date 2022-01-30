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
var dotenv = __importStar(require("dotenv"));
dotenv.config();
process.env.REACT_APP_PUBLIC_URL = "https://rune.game/";
var items_mjs_1 = require("./data/items.mjs");
var items_type_mjs_1 = require("./data/items.type.mjs");
var contracts_mjs_1 = __importDefault(require("./contracts.mjs"));
var secrets_json_1 = __importDefault(require("../secrets.json"));
var ethers_1 = __importDefault(require("ethers"));
var web3_1 = __importDefault(require("web3"));
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var node_fetch_1 = __importDefault(require("node-fetch"));
var path_1 = __importDefault(require("path"));
var fs_jetpack_1 = __importDefault(require("fs-jetpack"));
var json_beautify_1 = __importDefault(require("json-beautify"));
var socket_io_client_1 = require("socket.io-client");
var hdwallet_provider_1 = __importDefault(require("@truffle/hdwallet-provider"));
var util_mjs_1 = require("./util.mjs");
var farms_mjs_1 = __importDefault(require("./farms.mjs"));
var ArcaneTraderV1_json_1 = __importDefault(require("../contracts/ArcaneTraderV1.json"));
var ArcaneCharacters_json_1 = __importDefault(require("../contracts/ArcaneCharacters.json"));
var ArcaneCharacterFactoryV3_json_1 = __importDefault(require("../contracts/ArcaneCharacterFactoryV3.json"));
var ArcaneBarracksFacetV1_json_1 = __importDefault(require("../contracts/ArcaneBarracksFacetV1.json"));
var ArcaneProfile_json_1 = __importDefault(require("../contracts/ArcaneProfile.json"));
var ArcaneItems_json_1 = __importDefault(require("../contracts/ArcaneItems.json"));
var BEP20_json_1 = __importDefault(require("../contracts/BEP20.json"));
var farms_mjs_2 = require("./farms.mjs");
var decodeItem_mjs_1 = require("./util/decodeItem.mjs");
var achievements_mjs_1 = require("./data/achievements.mjs");
// import * as Bridge from "./bridge.mjs"
var config = fs_jetpack_1.default.read(path_1.default.resolve('./db/config.json'), 'json');
var app = fs_jetpack_1.default.read(path_1.default.resolve('./db/app.json'), 'json');
var trades = (0, util_mjs_1.removeDupes)(fs_jetpack_1.default.read(path_1.default.resolve('./db/trades.json'), 'json'));
var farms = fs_jetpack_1.default.read(path_1.default.resolve('./db/farms.json'), 'json');
var runes = fs_jetpack_1.default.read(path_1.default.resolve('./db/runes.json'), 'json');
var classes = fs_jetpack_1.default.read(path_1.default.resolve('./db/classes.json'), 'json');
var guilds = fs_jetpack_1.default.read(path_1.default.resolve('./db/guilds.json'), 'json');
var stats = fs_jetpack_1.default.read(path_1.default.resolve('./db/stats.json'), 'json');
var historical = fs_jetpack_1.default.read(path_1.default.resolve('./db/historical.json'), 'json');
var barracksEvents = fs_jetpack_1.default.read(path_1.default.resolve('./db/barracks/events.json'), 'json');
var blacksmithEvents = fs_jetpack_1.default.read(path_1.default.resolve('./db/blacksmith/events.json'), 'json');
var raidEvents = fs_jetpack_1.default.read(path_1.default.resolve('./db/raid/events.json'), 'json');
var guildsEvents = fs_jetpack_1.default.read(path_1.default.resolve('./db/guilds/events.json'), 'json');
var itemsEvents = fs_jetpack_1.default.read(path_1.default.resolve('./db/items/events.json'), 'json');
var charactersEvents = fs_jetpack_1.default.read(path_1.default.resolve('./db/characters/events.json'), 'json');
var usersEvents = fs_jetpack_1.default.read(path_1.default.resolve('./db/users/events.json'), 'json');
var tradesEvents = fs_jetpack_1.default.read(path_1.default.resolve('./db/trades/events.json'), 'json');
var evolutionLeaderboardHistory = fs_jetpack_1.default.read(path_1.default.resolve('./db/evolution/leaderboardHistory.json'), 'json');
var evolutionRewardHistory = fs_jetpack_1.default.read(path_1.default.resolve('./db/evolution/rewardHistory.json'), 'json');
var evolutionHistorical = fs_jetpack_1.default.read(path_1.default.resolve('./db/evolution/historical.json'), 'json');
var evolutionServers = fs_jetpack_1.default.read(path_1.default.resolve('./db/evolution/servers.json'), 'json');
console.log('STARTING...');
// const fetchPrice = async (id, vs = 'usd') => {
//   const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${vs}`)
//   return parseFloat((await response.json())[id][vs])
// }
// const fetchPrices = async () => {
// const response = await fetch('https://api.coingecko.com/api/v3/coins/list')
// prices = (await response.json())
// }
var getRandomProvider = function () {
    return new hdwallet_provider_1.default(secrets_json_1.default.mnemonic, "wss://thrumming-still-leaf.bsc.quiknode.pro/b2f8a5b1bd0809dbf061112e1786b4a8e53c9a83/" //"https://bsc.getblock.io/mainnet/?api_key=3f594a5f-d0ed-48ca-b0e7-a57d04f76332" //networks[Math.floor(Math.random() * networks.length)]
    );
};
// const blocknativeApiKey = '58a45321-bf96-485c-ab9b-e0610e181d26'
var provider;
var web3;
var web3Provider;
var signer;
var arcaneItemsContract;
var arcaneCharactersContract;
var arcaneBarracksContract;
var arcaneTraderContract;
var arcaneCharacterFactoryContract;
var arcaneProfileContract;
var busdContract;
var wbnbContract;
var setupProvider = function () {
    console.log('Setting up provider');
    provider = getRandomProvider();
    web3 = new web3_1.default(provider);
    web3Provider = new ethers_1.default.providers.Web3Provider(getRandomProvider(), "any");
    web3Provider.pollingInterval = 15000;
    signer = web3Provider.getSigner();
    arcaneItemsContract = new ethers_1.default.Contract((0, util_mjs_1.getAddress)(contracts_mjs_1.default.items), ArcaneItems_json_1.default.abi, signer);
    arcaneCharactersContract = new ethers_1.default.Contract((0, util_mjs_1.getAddress)(contracts_mjs_1.default.characters), ArcaneCharacters_json_1.default.abi, signer);
    arcaneBarracksContract = new ethers_1.default.Contract((0, util_mjs_1.getAddress)(contracts_mjs_1.default.barracks), ArcaneBarracksFacetV1_json_1.default.abi, signer);
    arcaneTraderContract = new ethers_1.default.Contract((0, util_mjs_1.getAddress)(contracts_mjs_1.default.trader), ArcaneTraderV1_json_1.default.abi, signer);
    arcaneCharacterFactoryContract = new ethers_1.default.Contract((0, util_mjs_1.getAddress)(contracts_mjs_1.default.characterFactory), ArcaneCharacterFactoryV3_json_1.default.abi, signer);
    arcaneProfileContract = new ethers_1.default.Contract((0, util_mjs_1.getAddress)(contracts_mjs_1.default.profile), ArcaneProfile_json_1.default.abi, signer);
    busdContract = new ethers_1.default.Contract((0, util_mjs_1.getAddress)(contracts_mjs_1.default.busd), BEP20_json_1.default.abi, signer);
    wbnbContract = new ethers_1.default.Contract((0, util_mjs_1.getAddress)(contracts_mjs_1.default.wbnb), BEP20_json_1.default.abi, signer);
    config.trades.updating = false;
    config.barracks.updating = false;
    config.blacksmith.updating = false;
    config.items.updating = false;
    config.characters.updating = false;
    config.test.updating = false;
};
setupProvider();
setInterval(function () {
    // Something happened, lets restart the provider
    if (new Date().getTime() > config.trades.updatedTimestamp + 10 * 60 * 1000) {
        setupProvider();
    }
}, 15 * 60 * 1000);
// web3Provider.on("network", (newNetwork, oldNetwork) => {
// When a Provider makes its initial connection, it emits a "network"
// event with a null oldNetwork along with the newNetwork. So, if the
// oldNetwork exists, it represents a changing network
// process.exit()
// });
process
    .on("unhandledRejection", function (reason, p) {
    console.warn(reason, "Unhandled Rejection at Promise", p);
})
    .on("uncaughtException", function (err) {
    console.warn(err, "Uncaught Exception thrown.");
    // process.exit(1)
    //provider = getRandomProvider()
    // run()
    // setTimeout(() => {
    //   process.exit(1)
    // }, 60 * 1000)
});
var average = function (arr) { return arr.reduce(function (p, c) { return p + c; }, 0) / arr.length; };
var ordinalise = function (n) { return n + (n % 10 == 1 && n % 100 != 11 ? 'st' : n % 10 == 2 && n % 100 != 12 ? 'nd' : n % 10 == 3 && n % 100 != 13 ? 'rd' : 'th'); };
var commarise = function (n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); };
var getSocket = function (endpoint) {
    console.log('Connecting to', endpoint);
    return (0, socket_io_client_1.io)(endpoint, {
        transports: ['websocket'],
        upgrade: false,
        autoConnect: false,
        pingInterval: 5000,
        pingTimeout: 20000
        // extraHeaders: {
        //   "my-custom-header": "1234"
        // }
    });
};
var games = {
    evolution: {
        realms: {}
    },
    infinite: {
        realms: {}
    },
    guardians: {
        realms: {}
    },
    sanctuary: {
        realms: {}
    }
};
function updateGames() {
    var _loop_1 = function (server) {
        for (var key in Object.keys(server)) {
            if (!games.evolution.realms[server.key])
                games.evolution.realms[server.key] = {};
            games.evolution.realms[server.key][key] = server[key];
        }
        if (!games.evolution.realms[server.key].connection || !games.evolution.realms[server.key].connection.connected) {
            var socket_1 = getSocket('http://' + server.endpoint);
            socket_1.on('connect', function () {
                console.log('Connected: ' + server.key);
                socket_1.emit('ObserverJoin');
            });
            socket_1.on('disconnect', function () {
                console.log('Disconnected: ' + server.key);
            });
            socket_1.on('OnObserverPing', function (msg) {
                console.log(msg);
            });
            socket_1.on('OnObserverInit', function (msg) {
                console.log(msg);
            });
            socket_1.on('OnBanPlayer', function (msg) {
                try {
                    log('Ban', {
                        value: req.data.target,
                        caller: req.data.address
                    });
                    if ((yield verifySignature({ value: req.data.address, hash: req.data.signature }, req.data.address)) && db.modList.includes(req.data.address)) {
                        if (!db.banList.includes(req.data.target)) {
                            db.banList.push(req.data.target);
                        }
                        if (clients.find(function (c) { return c.address === req.data.target; })) {
                            disconnectPlayer(clients.find(function (c) { return c.address === req.data.target; }));
                        }
                        saveBanList();
                        socket_1.emit('BanUserResponse', {
                            id: req.id,
                            data: { success: 1 }
                        });
                    }
                    else {
                        socket_1.emit('BanUserResponse', {
                            id: req.id,
                            data: { success: 0 }
                        });
                    }
                }
                catch (e) {
                    console.log(e);
                    socket_1.emit('BanUserResponse', {
                        id: req.id,
                        data: { success: 0 }
                    });
                }
            });
            socket_1.on('OnReportPlayer', function (msg) {
                console.log(msg);
                var currentGamePlayers = msg.currentGamePlayers, currentPlayer = msg.currentPlayer, reportedPlayer = msg.reportedPlayer;
                if (currentPlayer.name.indexOf('Guest') !== -1 || currentPlayer.name.indexOf('Unknown') !== -1)
                    return; // No guest reports
                if (!db.reportList[reportedPlayer.address])
                    db.reportList[reportedPlayer.address] = [];
                if (!db.reportList[reportedPlayer.address].includes(currentPlayer.address))
                    db.reportList[reportedPlayer.address].push(currentPlayer.address);
                // if (db.reportList[reportedPlayer.address].length >= 6) {
                //   db.banList.push(reportedPlayer.address)
                //   disconnectPlayer(reportedPlayer)
                //   // emitDirect(sockets[reportedPlayer.id], 'OnBanned', true)
                //   return
                // }
                // if (currentGamePlayers.length >= 4) {
                //   const reportsFromCurrentGamePlayers = db.reportList[reportedPlayer.address].filter(function(n) {
                //     return currentGamePlayers.indexOf(n) !== -1;
                //   })
                //   if (reportsFromCurrentGamePlayers.length >= currentGamePlayers.length / 3) {
                //     db.banList.push(reportedPlayer.address)
                //     disconnectPlayer(reportedPlayer)
                //     // emitDirect(sockets[reportedPlayer.id], 'OnBanned', true)
                //     return
                //   }
                // }
                // Relay the report to connected realm servers
            });
            socket_1.on('OnObserverRoundFinished', function (msg) {
                console.log(msg);
                function sendLeaderReward(leaders) {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                    log('Leader: ', leaders[0]);
                    if ((_a = leaders[0]) === null || _a === void 0 ? void 0 : _a.address) {
                        try {
                            if (!db.playerRewards[leaders[0].address])
                                db.playerRewards[leaders[0].address] = {};
                            if (!db.playerRewards[leaders[0].address].pending)
                                db.playerRewards[leaders[0].address].pending = {};
                            if (!db.playerRewards[leaders[0].address].pending.zod)
                                db.playerRewards[leaders[0].address].pending.zod = 0;
                            db.playerRewards[leaders[0].address].pending.zod = Math.round((db.playerRewards[leaders[0].address].pending.zod + config.rewardWinnerAmount * 1) * 1000) / 1000;
                            publishEvent('OnRoundWinner', leaders[0].name);
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                    if ((_b = leaders[1]) === null || _b === void 0 ? void 0 : _b.address) {
                        try {
                            if (!db.playerRewards[leaders[1].address])
                                db.playerRewards[leaders[1].address] = {};
                            if (!db.playerRewards[leaders[1].address].pending)
                                db.playerRewards[leaders[1].address].pending = {};
                            if (!db.playerRewards[leaders[1].address].pending.zod)
                                db.playerRewards[leaders[1].address].pending.zod = 0;
                            db.playerRewards[leaders[1].address].pending.zod = Math.round((db.playerRewards[leaders[1].address].pending.zod + config.rewardWinnerAmount * 0.25) * 1000) / 1000;
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                    if ((_c = leaders[2]) === null || _c === void 0 ? void 0 : _c.address) {
                        try {
                            if (!db.playerRewards[leaders[2].address])
                                db.playerRewards[leaders[2].address] = {};
                            if (!db.playerRewards[leaders[2].address].pending)
                                db.playerRewards[leaders[2].address].pending = {};
                            if (!db.playerRewards[leaders[2].address].pending.zod)
                                db.playerRewards[leaders[2].address].pending.zod = 0;
                            db.playerRewards[leaders[2].address].pending.zod = Math.round((db.playerRewards[leaders[2].address].pending.zod + config.rewardWinnerAmount * 0.15) * 1000) / 1000;
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                    if ((_d = leaders[3]) === null || _d === void 0 ? void 0 : _d.address) {
                        try {
                            if (!db.playerRewards[leaders[3].address])
                                db.playerRewards[leaders[3].address] = {};
                            if (!db.playerRewards[leaders[3].address].pending)
                                db.playerRewards[leaders[3].address].pending = {};
                            if (!db.playerRewards[leaders[3].address].pending.zod)
                                db.playerRewards[leaders[3].address].pending.zod = 0;
                            db.playerRewards[leaders[3].address].pending.zod = Math.round((db.playerRewards[leaders[3].address].pending.zod + config.rewardWinnerAmount * 0.05) * 1000) / 1000;
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                    if ((_e = leaders[4]) === null || _e === void 0 ? void 0 : _e.address) {
                        try {
                            if (!db.playerRewards[leaders[4].address])
                                db.playerRewards[leaders[4].address] = {};
                            if (!db.playerRewards[leaders[4].address].pending)
                                db.playerRewards[leaders[4].address].pending = {};
                            if (!db.playerRewards[leaders[4].address].pending.zod)
                                db.playerRewards[leaders[4].address].pending.zod = 0;
                            db.playerRewards[leaders[4].address].pending.zod = Math.round((db.playerRewards[leaders[4].address].pending.zod + config.rewardWinnerAmount * 0.05) * 1000) / 1000;
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                    if ((_f = leaders[5]) === null || _f === void 0 ? void 0 : _f.address) {
                        try {
                            if (!db.playerRewards[leaders[5].address])
                                db.playerRewards[leaders[5].address] = {};
                            if (!db.playerRewards[leaders[5].address].pending)
                                db.playerRewards[leaders[5].address].pending = {};
                            if (!db.playerRewards[leaders[5].address].pending.zod)
                                db.playerRewards[leaders[5].address].pending.zod = 0;
                            db.playerRewards[leaders[5].address].pending.zod = Math.round((db.playerRewards[leaders[5].address].pending.zod + config.rewardWinnerAmount * 0.05) * 1000) / 1000;
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                    if ((_g = leaders[6]) === null || _g === void 0 ? void 0 : _g.address) {
                        try {
                            if (!db.playerRewards[leaders[6].address])
                                db.playerRewards[leaders[6].address] = {};
                            if (!db.playerRewards[leaders[6].address].pending)
                                db.playerRewards[leaders[6].address].pending = {};
                            if (!db.playerRewards[leaders[6].address].pending.zod)
                                db.playerRewards[leaders[6].address].pending.zod = 0;
                            db.playerRewards[leaders[6].address].pending.zod = Math.round((db.playerRewards[leaders[6].address].pending.zod + config.rewardWinnerAmount * 0.05) * 1000) / 1000;
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                    if ((_h = leaders[7]) === null || _h === void 0 ? void 0 : _h.address) {
                        try {
                            if (!db.playerRewards[leaders[7].address])
                                db.playerRewards[leaders[7].address] = {};
                            if (!db.playerRewards[leaders[7].address].pending)
                                db.playerRewards[leaders[7].address].pending = {};
                            if (!db.playerRewards[leaders[7].address].pending.zod)
                                db.playerRewards[leaders[7].address].pending.zod = 0;
                            db.playerRewards[leaders[7].address].pending.zod = Math.round((db.playerRewards[leaders[7].address].pending.zod + config.rewardWinnerAmount * 0.05) * 1000) / 1000;
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                    if ((_j = leaders[8]) === null || _j === void 0 ? void 0 : _j.address) {
                        try {
                            if (!db.playerRewards[leaders[8].address])
                                db.playerRewards[leaders[8].address] = {};
                            if (!db.playerRewards[leaders[8].address].pending)
                                db.playerRewards[leaders[8].address].pending = {};
                            if (!db.playerRewards[leaders[8].address].pending.zod)
                                db.playerRewards[leaders[8].address].pending.zod = 0;
                            db.playerRewards[leaders[8].address].pending.zod = Math.round((db.playerRewards[leaders[8].address].pending.zod + config.rewardWinnerAmount * 0.05) * 1000) / 1000;
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                    if ((_k = leaders[9]) === null || _k === void 0 ? void 0 : _k.address) {
                        try {
                            if (!db.playerRewards[leaders[9].address])
                                db.playerRewards[leaders[9].address] = {};
                            if (!db.playerRewards[leaders[9].address].pending)
                                db.playerRewards[leaders[9].address].pending = {};
                            if (!db.playerRewards[leaders[9].address].pending.zod)
                                db.playerRewards[leaders[9].address].pending.zod = 0;
                            db.playerRewards[leaders[9].address].pending.zod = Math.round((db.playerRewards[leaders[9].address].pending.zod + config.rewardWinnerAmount * 0.05) * 1000) / 1000;
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                }
            });
            socket_1.connect();
            games.evolution.realms[server.key].connection = socket_1;
        }
    };
    for (var _i = 0, evolutionServers_1 = evolutionServers; _i < evolutionServers_1.length; _i++) {
        var server = evolutionServers_1[_i];
        _loop_1(server);
    }
}
function monitorRealmServers() {
    updateGames();
    setTimeout(monitorRealmServers, 5 * 1000);
}
function iterateBlocks(name, address, fromBlock, toBlock, event, processLog, updateConfig) {
    return __awaiter(this, void 0, void 0, function () {
        var toBlock2, filter, logs, i, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!toBlock)
                        return [2 /*return*/];
                    if (fromBlock === toBlock)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 10, , 11]);
                    toBlock2 = (fromBlock + 5000) < toBlock ? fromBlock + 5000 : toBlock;
                    filter = {
                        address: address,
                        fromBlock: fromBlock,
                        toBlock: toBlock2,
                        topics: event.topics
                    };
                    console.log(name, 'Iterating block', fromBlock, 'to', toBlock2, 'eventually', toBlock, 'for', event.topics);
                    return [4 /*yield*/, web3Provider.getLogs(filter)];
                case 2:
                    logs = _a.sent();
                    i = 0;
                    _a.label = 3;
                case 3:
                    if (!(i < logs.length)) return [3 /*break*/, 6];
                    return [4 /*yield*/, processLog(logs[i], false)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 3];
                case 6:
                    if (!(updateConfig && toBlock2 > 0)) return [3 /*break*/, 8];
                    return [4 /*yield*/, updateConfig(toBlock2)];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [4 /*yield*/, iterateBlocks(name, address, toBlock2, toBlock, event, processLog, updateConfig)];
                case 9:
                    _a.sent();
                    return [3 /*break*/, 11];
                case 10:
                    e_1 = _a.sent();
                    console.log('error', e_1);
                    console.log(name, address, fromBlock, toBlock, event);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
var saveConfig = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        config.updatedDate = (new Date()).toString();
        config.updatedTimestamp = new Date().getTime();
        fs_jetpack_1.default.write(path_1.default.resolve('./db/config.json'), (0, json_beautify_1.default)(config, null, 2, 100), { atomic: true });
        return [2 /*return*/];
    });
}); };
var saveTrades = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        fs_jetpack_1.default.write(path_1.default.resolve('./db/trades.json'), (0, json_beautify_1.default)((0, util_mjs_1.removeDupes)(trades), null, 2, 100), { atomic: true });
        return [2 /*return*/];
    });
}); };
var saveTradesEvents = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        fs_jetpack_1.default.write(path_1.default.resolve('./db/trades/events.json'), (0, json_beautify_1.default)(tradesEvents, null, 2, 100), { atomic: true });
        return [2 /*return*/];
    });
}); };
var saveBarracksEvents = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        fs_jetpack_1.default.write(path_1.default.resolve('./db/barracks/events.json'), (0, json_beautify_1.default)(barracksEvents, null, 2, 100), { atomic: true });
        return [2 /*return*/];
    });
}); };
var saveCharactersEvents = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        fs_jetpack_1.default.write(path_1.default.resolve('./db/characters/events.json'), (0, json_beautify_1.default)(charactersEvents, null, 2, 100), { atomic: true });
        return [2 /*return*/];
    });
}); };
var saveItemsEvents = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        fs_jetpack_1.default.write(path_1.default.resolve('./db/items/events.json'), (0, json_beautify_1.default)(itemsEvents, null, 2, 100), { atomic: true });
        return [2 /*return*/];
    });
}); };
var saveFarms = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        fs_jetpack_1.default.write(path_1.default.resolve('./db/farms.json'), (0, json_beautify_1.default)(farms, null, 2, 100), { atomic: true });
        return [2 /*return*/];
    });
}); };
var saveGuilds = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        fs_jetpack_1.default.write(path_1.default.resolve('./db/guilds.json'), (0, json_beautify_1.default)(guilds, null, 2, 100), { atomic: true });
        return [2 /*return*/];
    });
}); };
var saveRunes = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        fs_jetpack_1.default.write(path_1.default.resolve('./db/runes.json'), (0, json_beautify_1.default)(runes, null, 2, 100), { atomic: true });
        return [2 /*return*/];
    });
}); };
var saveStats = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        fs_jetpack_1.default.write(path_1.default.resolve('./db/stats.json'), (0, json_beautify_1.default)(stats, null, 2, 100), { atomic: true });
        return [2 /*return*/];
    });
}); };
var saveHistorical = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        fs_jetpack_1.default.write(path_1.default.resolve('./db/historical.json'), (0, json_beautify_1.default)(historical, null, 2, 100), { atomic: true });
        return [2 /*return*/];
    });
}); };
var saveApp = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        fs_jetpack_1.default.write(path_1.default.resolve('./db/app.json'), (0, json_beautify_1.default)(app, null, 2, 100), { atomic: true });
        return [2 /*return*/];
    });
}); };
var updateLeaderboardByUser = function (user) { return __awaiter(void 0, void 0, void 0, function () {
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
var loadCharacter = function (characterId) {
    return __assign(__assign({ id: characterId, ownersCount: 0 }, (fs_jetpack_1.default.read(path_1.default.resolve("./db/characters/".concat(characterId, "/overview.json")), 'json') || {})), { owners: (fs_jetpack_1.default.read(path_1.default.resolve("./db/characters/".concat(characterId, "/owners.json")), 'json') || []) });
};
var saveCharacter = function (character) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        fs_jetpack_1.default.write(path_1.default.resolve("./db/characters/".concat(character.id, "/overview.json")), (0, json_beautify_1.default)(__assign(__assign({}, character), { owners: undefined, ownersCount: character.owners.length }), null, 2), { atomic: true });
        fs_jetpack_1.default.write(path_1.default.resolve("./db/characters/".concat(character.id, "/owners.json")), (0, json_beautify_1.default)(character.owners, null, 2), { atomic: true });
        return [2 /*return*/];
    });
}); };
var saveCharacterOwner = function (character, characterData) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!character.owners.find(function (o) { return o === characterData.owner; })) {
                    character.owners.push(characterData.owner);
                    character.owners = character.owners.filter(function (o) { return o != characterData.from; });
                }
                return [4 /*yield*/, saveCharacter(character)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var loadItem = function (itemId) {
    return __assign(__assign({ id: itemId, perfectCount: 0, ownersCount: 0, marketTradesListedCount: 0, marketTradesSoldCount: 0 }, (fs_jetpack_1.default.read(path_1.default.resolve("./db/items/".concat(itemId, "/overview.json")), 'json') || {})), { owners: (fs_jetpack_1.default.read(path_1.default.resolve("./db/items/".concat(itemId, "/owners.json")), 'json') || []), market: (fs_jetpack_1.default.read(path_1.default.resolve("./db/items/".concat(itemId, "/market.json")), 'json') || []), tokens: (fs_jetpack_1.default.read(path_1.default.resolve("./db/items/".concat(itemId, "/tokens.json")), 'json') || []) });
};
var saveItem = function (item) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        fs_jetpack_1.default.write(path_1.default.resolve("./db/items/".concat(item.id, "/overview.json")), (0, json_beautify_1.default)(__assign(__assign({}, item), { owners: undefined, market: undefined, tokens: undefined, perfectCount: item.tokens.filter(function (i) { return i.item.perfection === 1; }).length, ownersCount: item.owners.length, marketTradesPerfectCount: item.market.filter(function (i) { return i.item.perfection === 1; }).length, marketTradesListedCount: item.market.filter(function (i) { return i.status === 'listed'; }).length, marketTradesSoldCount: item.market.filter(function (i) { return i.status === 'sold'; }).length }), null, 2), { atomic: true });
        fs_jetpack_1.default.write(path_1.default.resolve("./db/items/".concat(item.id, "/owners.json")), (0, json_beautify_1.default)(item.owners, null, 2), { atomic: true });
        fs_jetpack_1.default.write(path_1.default.resolve("./db/items/".concat(item.id, "/market.json")), (0, json_beautify_1.default)(item.market, null, 2), { atomic: true });
        fs_jetpack_1.default.write(path_1.default.resolve("./db/items/".concat(item.id, "/tokens.json")), (0, json_beautify_1.default)(item.tokens, null, 2), { atomic: true });
        return [2 /*return*/];
    });
}); };
var saveItemOwner = function (item, itemData) { return __awaiter(void 0, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!item.owners.find(function (o) { return o === itemData.owner; })) {
                    item.owners.push(itemData.owner);
                    item.owners = item.owners.filter(function (o) { return o != itemData.from; });
                }
                if (!stats.items[item.id])
                    stats.items[item.id] = {};
                _a = stats.items[item.id];
                return [4 /*yield*/, arcaneItemsContract.itemCount(item.id)];
            case 1:
                _a.total = (_b.sent()).toNumber();
                stats.items[item.id].burned = 0; //(await arcaneItemsContract.itemBurnCount(item.id)).toNumber()
                return [4 /*yield*/, saveItem(item)];
            case 2:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); };
var saveItemTrade = function (item, trade) { return __awaiter(void 0, void 0, void 0, function () {
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
                return [4 /*yield*/, saveItem(item)];
            case 1:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); };
var saveItemToken = function (item, token) { return __awaiter(void 0, void 0, void 0, function () {
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
                return [4 /*yield*/, saveItem(item)];
            case 1:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); };
var loadToken = function (tokenId) {
    return __assign(__assign({ id: tokenId, ownersCount: 0, marketTradesListedCount: 0, marketTradesSoldCount: 0 }, (fs_jetpack_1.default.read(path_1.default.resolve("./db/tokens/".concat(tokenId, "/overview.json")), 'json') || {})), { transfers: (fs_jetpack_1.default.read(path_1.default.resolve("./db/tokens/".concat(tokenId, "/transfers.json")), 'json') || []), trades: (fs_jetpack_1.default.read(path_1.default.resolve("./db/tokens/".concat(tokenId, "/trades.json")), 'json') || []), meta: (fs_jetpack_1.default.read(path_1.default.resolve("./db/tokens/".concat(tokenId, "/meta.json")), 'json') || {}) });
};
var updateTokenMeta = function (token) { return __awaiter(void 0, void 0, void 0, function () {
    var item;
    return __generator(this, function (_a) {
        try {
            item = (0, decodeItem_mjs_1.decodeItem)(token.id);
            item.icon = item.icon.replace('undefined', 'https://rune.game/');
            if (item.recipe) {
                item.recipe.requirement = item.recipe.requirement.map(function (r) { return (__assign(__assign({}, r), { id: items_mjs_1.RuneNames[r.id] })); });
            }
            item.branches[1].attributes.map(function (a) { return (__assign(__assign({}, a), { description: items_mjs_1.ItemAttributesById[a.id].description })); });
            token.meta = __assign(__assign({ "description": Array.isArray(item.branches[1].description) ? item.branches[1].description[0] : item.branches[1].description, "home_url": "https://rune.game", "external_url": "https://rune.game/token/" + token.id, "image_url": item.icon, "language": "en-US" }, item), { "type": items_mjs_1.ItemTypeToText[item.type], "slots": item.slots.map(function (s) { return items_mjs_1.ItemSlotToText[s]; }) });
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
var saveToken = function (token) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        updateTokenMeta(token);
        fs_jetpack_1.default.write(path_1.default.resolve("./db/tokens/".concat(token.id, "/overview.json")), (0, json_beautify_1.default)(__assign(__assign({}, token), { transfers: undefined, trades: undefined, meta: undefined }), null, 2), { atomic: true });
        fs_jetpack_1.default.write(path_1.default.resolve("./db/tokens/".concat(token.id, "/transfers.json")), (0, json_beautify_1.default)(token.transfers, null, 2), { atomic: true });
        fs_jetpack_1.default.write(path_1.default.resolve("./db/tokens/".concat(token.id, "/trades.json")), (0, json_beautify_1.default)(token.trades, null, 2), { atomic: true });
        fs_jetpack_1.default.write(path_1.default.resolve("./db/tokens/".concat(token.id, "/meta.json")), (0, json_beautify_1.default)(token.meta, null, 2), { atomic: true });
        return [2 /*return*/];
    });
}); };
var saveTokenTrade = function (token, trade) { return __awaiter(void 0, void 0, void 0, function () {
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
                return [4 /*yield*/, saveToken(token)];
            case 1:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); };
var saveTokenTransfer = function (token, itemData) { return __awaiter(void 0, void 0, void 0, function () {
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
                return [4 /*yield*/, saveToken(token)];
            case 1:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); };
var loadUser = function (address) {
    return __assign(__assign({ address: address, inventoryItemCount: 0, equippedItemCount: 0, marketTradeListedCount: 0, marketTradeSoldCount: 0, transferredOutCount: 0, holdings: {}, points: 0, username: undefined, guildId: undefined, joinedGuildAt: undefined, isGuildMembershipActive: false, guildMembershipTokenId: null }, (fs_jetpack_1.default.read(path_1.default.resolve("./db/users/".concat(address, "/overview.json")), 'json') || {})), { achievements: (fs_jetpack_1.default.read(path_1.default.resolve("./db/users/".concat(address, "/achievements.json")), 'json') || []), characters: (fs_jetpack_1.default.read(path_1.default.resolve("./db/users/".concat(address, "/characters.json")), 'json') || []), evolution: (fs_jetpack_1.default.read(path_1.default.resolve("./db/users/".concat(address, "/evolution.json")), 'json') || {}), inventory: __assign({ items: [] }, (fs_jetpack_1.default.read(path_1.default.resolve("./db/users/".concat(address, "/inventory.json")), 'json') || {})), market: __assign({ trades: [] }, (fs_jetpack_1.default.read(path_1.default.resolve("./db/users/".concat(address, "/market.json")), 'json') || {})) });
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
var loadGuild = function (id) {
    console.log('Loading guild', id);
    return __assign(__assign(__assign({ id: id, memberCount: 0, activeMemberCount: 0, points: 0 }, guildInfoMap[id]), (fs_jetpack_1.default.read(path_1.default.resolve("./db/guilds/".concat(id, "/overview.json")), 'json') || {})), { members: (fs_jetpack_1.default.read(path_1.default.resolve("./db/guilds/".concat(id, "/members.json")), 'json') || []), memberDetails: (fs_jetpack_1.default.read(path_1.default.resolve("./db/guilds/".concat(id, "/memberDetails.json")), 'json') || []) });
};
var addGuildMember = function (guild, user) {
    if (!guild.members.includes(user.address)) {
        guild.members.push(user.address);
    }
};
var saveGuild = function (guild) { return __awaiter(void 0, void 0, void 0, function () {
    var g;
    return __generator(this, function (_a) {
        console.log('Saving guild', guild.name);
        updateAchievementsByGuild(guild);
        fs_jetpack_1.default.write(path_1.default.resolve("./db/guilds/".concat(guild.id, "/overview.json")), (0, json_beautify_1.default)(__assign(__assign({}, guild), { memberCount: guild.members.length, activeMemberCount: guild.memberDetails.filter(function (m) { return m.achievementCount > 0; }).length, members: undefined }), null, 2), { atomic: true });
        fs_jetpack_1.default.write(path_1.default.resolve("./db/guilds/".concat(guild.id, "/members.json")), (0, json_beautify_1.default)(guild.members, null, 2), { atomic: true });
        fs_jetpack_1.default.write(path_1.default.resolve("./db/guilds/".concat(guild.id, "/memberDetails.json")), (0, json_beautify_1.default)(guild.memberDetails, null, 2), { atomic: true });
        g = guilds.find(function (g2) { return g2.id === guild.id; });
        if (!g) {
            g = {};
            guilds.push(g);
        }
        g.id = guild.id;
        g.memberCount = guild.memberCount;
        g.activeMemberCount = guild.activeMemberCount;
        return [2 /*return*/];
    });
}); };
var updateAchievementsByGuild = function (guild) {
    var points = 0;
    for (var _i = 0, _a = guild.members; _i < _a.length; _i++) {
        var member = _a[_i];
        var user = loadUser(member);
        if (!(user === null || user === void 0 ? void 0 : user.points) || user.points === null)
            continue;
        points += user.points;
    }
    guild.points = points;
};
var updateAchievementsByUser = function (user) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, _c, _d, _e, _f, _g;
    return __generator(this, function (_h) {
        if (!hasUserAchievement(user, 'CRAFT_1') && user.craftedItemCount >= 1) {
            addUserAchievement(user, 'CRAFT_1');
        }
        if (!hasUserAchievement(user, 'CRAFT_10') && user.craftedItemCount >= 10) {
            addUserAchievement(user, 'CRAFT_10');
        }
        if (!hasUserAchievement(user, 'CRAFT_100') && user.craftedItemCount >= 100) {
            addUserAchievement(user, 'CRAFT_100');
        }
        if (!hasUserAchievement(user, 'CRAFT_1000') && user.craftedItemCount >= 1000) {
            addUserAchievement(user, 'CRAFT_1000');
        }
        if (!hasUserAchievement(user, 'ACQUIRED_RUNE') && ((_a = user.holdings) === null || _a === void 0 ? void 0 : _a.rune) >= 1) {
            addUserAchievement(user, 'ACQUIRED_RUNE');
        }
        if (!hasUserAchievement(user, 'BATTLE_RUNE_EVO')) {
            if (((_c = (_b = user.evolution) === null || _b === void 0 ? void 0 : _b.overall) === null || _c === void 0 ? void 0 : _c.rounds) > 0)
                addUserAchievement(user, 'BATTLE_RUNE_EVO');
        }
        if (!hasUserAchievement(user, 'MEGA_RUNE_EVO')) {
            if (((_e = (_d = user.evolution) === null || _d === void 0 ? void 0 : _d.overall) === null || _e === void 0 ? void 0 : _e.wins) > 0)
                addUserAchievement(user, 'MEGA_RUNE_EVO');
        }
        if (!hasUserAchievement(user, 'DOMINATE_RUNE_EVO')) {
            if (((_g = (_f = user.evolution) === null || _f === void 0 ? void 0 : _f.overall) === null || _g === void 0 ? void 0 : _g.winStreak) > 25)
                addUserAchievement(user, 'DOMINATE_RUNE_EVO');
        }
        return [2 /*return*/];
    });
}); };
var updatePointsByUser = function (user) { return __awaiter(void 0, void 0, void 0, function () {
    var achievements, _i, achievements_1, achievement;
    return __generator(this, function (_a) {
        achievements = user.achievements.map(function (a) { return achievements_mjs_1.achievementData.find(function (b) { return b.id === a; }); });
        user.points = 0;
        for (_i = 0, achievements_1 = achievements; _i < achievements_1.length; _i++) {
            achievement = achievements_1[_i];
            user.points += achievement.points;
        }
        return [2 /*return*/];
    });
}); };
var updateGuildByUser = function (user) { return __awaiter(void 0, void 0, void 0, function () {
    var abi, bscProvider, contract, result, guild, e_2;
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
                bscProvider = new ethers_1.default.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
                contract = new ethers_1.default.Contract('0x2C51b570B11dA6c0852aADD059402E390a936B39', abi, bscProvider);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, contract.getUserProfile(user.address)];
            case 2:
                result = _a.sent();
                user.guildId = ethers_1.default.BigNumber.from(result[2]).toNumber();
                user.joinedGuildAt = new Date().getTime();
                guild = loadGuild(user.guildId);
                addGuildMember(guild, user);
                return [4 /*yield*/, saveGuild(guild)];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                e_2 = _a.sent();
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
var saveUser = function (user) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: 
            // console.log('Save user', user.address)
            return [4 /*yield*/, updateGuildByUser(user)];
            case 1:
                // console.log('Save user', user.address)
                _a.sent();
                return [4 /*yield*/, updatePointsByUser(user)];
            case 2:
                _a.sent();
                fs_jetpack_1.default.write(path_1.default.resolve("./db/users/".concat(user.address, "/overview.json")), (0, json_beautify_1.default)(__assign(__assign({}, user), { inventory: undefined, market: undefined, characters: undefined, achievements: undefined, evolution: undefined, craftedItemCount: user.inventory.items.filter(function (i) { return i.status === 'created'; }).length, inventoryItemCount: user.inventory.items.filter(function (i) { return i.status === 'unequipped'; }).length, equippedItemCount: user.inventory.items.filter(function (i) { return i.status === 'equipped'; }).length, transferredOutCount: user.inventory.items.filter(function (i) { return i.status === 'transferred_out'; }).length, transferredInCount: user.inventory.items.filter(function (i) { return i.status === 'transferred_in'; }).length }), null, 2), { atomic: true });
                return [4 /*yield*/, updateLeaderboardByUser(user)];
            case 3:
                _a.sent();
                return [4 /*yield*/, updateAchievementsByUser(user)];
            case 4:
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
var saveUserItem = function (user, item) { return __awaiter(void 0, void 0, void 0, function () {
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
                return [4 /*yield*/, saveUser(user)];
            case 1:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); };
var saveUserCharacter = function (user, character) { return __awaiter(void 0, void 0, void 0, function () {
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
                return [4 /*yield*/, saveUser(user)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var saveUserTrade = function (user, trade) { return __awaiter(void 0, void 0, void 0, function () {
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
                return [4 /*yield*/, saveUser(user)];
            case 1:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); };
var hasUserAchievement = function (user, achievementKey) {
    var id = achievements_mjs_1.achievementData.find(function (i) { return i.key === achievementKey; }).id;
    var achievement = user.achievements.find(function (i) { return i === id; });
    return !!achievement;
};
var addUserAchievement = function (user, achievementKey) {
    var id = achievements_mjs_1.achievementData.find(function (i) { return i.key === achievementKey; }).id;
    var achievement = user.achievements.find(function (i) { return i === id; });
    if (!achievement) {
        user.achievements.push(id);
    }
    // saveUser(user)
};
var groupBySub = function (xs, key, subkey) {
    return xs.reduce(function (rv, x) {
        if (!x[key][subkey])
            return rv;
        (rv[x[key][subkey]] = rv[x[key][subkey]] || []).push(x);
        return rv;
    }, {}) || null;
};
var groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
        if (!x[key])
            return rv;
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {}) || null;
};
function getAllBarracksEvents() {
    return __awaiter(this, void 0, void 0, function () {
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
                            user = loadUser(userAddress);
                            item = {
                                status: "equipped",
                                tokenId: tokenId.toString(),
                                updatedAt: new Date().getTime(),
                                id: (0, decodeItem_mjs_1.decodeItem)(tokenId.toString()).id
                            };
                            return [4 /*yield*/, saveUserItem(user, item)];
                        case 1:
                            _c.sent();
                            _c.label = 2;
                        case 2:
                            if (!(e.name === 'Unequip')) return [3 /*break*/, 4];
                            _b = e.args, userAddress = _b.user, tokenId = _b.tokenId, itemId = _b.itemId;
                            user = loadUser(userAddress);
                            item = {
                                status: "unequipped",
                                tokenId: tokenId.toString(),
                                itemId: itemId,
                                updatedAt: new Date().getTime(),
                                id: (0, decodeItem_mjs_1.decodeItem)(tokenId.toString()).id
                                // ...decodeItem(tokenId.toString())
                            };
                            return [4 /*yield*/, saveUserItem(user, item)];
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
                            e2 = barracksEvents.find(function (t) { return t.transactionHash === log.transactionHash; });
                            if (!e2) {
                                barracksEvents.push(__assign(__assign({}, log), e));
                            }
                            return [2 /*return*/];
                    }
                });
            });
        }
        var iface_1, blockNumber, events, _loop_2, _i, events_1, event_1, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (config.barracks.updating)
                        return [2 /*return*/];
                    console.log('[Barracks] Updating');
                    config.barracks.updating = true;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    iface_1 = new ethers_1.default.utils.Interface(ArcaneBarracksFacetV1_json_1.default.abi);
                    return [4 /*yield*/, web3.eth.getBlockNumber()];
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
                    _loop_2 = function (event_1) {
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, iterateBlocks("Barracks Events: ".concat(event_1), (0, util_mjs_1.getAddress)(contracts_mjs_1.default.barracks), config.barracks.lastBlock[event_1], blockNumber, arcaneBarracksContract.filters[event_1](), processLog, function (blockNumber2) {
                                        return __awaiter(this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                config.barracks.lastBlock[event_1] = blockNumber2;
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
                    return [5 /*yield**/, _loop_2(event_1)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    console.log('Finished');
                    return [3 /*break*/, 8];
                case 7:
                    e_3 = _a.sent();
                    console.log(e_3);
                    return [3 /*break*/, 8];
                case 8:
                    config.barracks.updating = false;
                    config.barracks.updatedDate = (new Date()).toString();
                    config.barracks.updatedTimestamp = new Date().getTime();
                    // await saveBarracksEvents()
                    // await saveConfig()
                    setTimeout(getAllBarracksEvents, 15 * 60 * 1000);
                    return [2 /*return*/];
            }
        });
    });
}
function monitorBarracksEvents() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            arcaneBarracksContract.on('Equip', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, getAllBarracksEvents()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            arcaneBarracksContract.on('Unequip', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, getAllBarracksEvents()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            arcaneBarracksContract.on('ActionBurn', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, getAllBarracksEvents()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            arcaneBarracksContract.on('ActionBonus', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, getAllBarracksEvents()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            arcaneBarracksContract.on('ActionHiddenPool', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, getAllBarracksEvents()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            arcaneBarracksContract.on('ActionFee', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, getAllBarracksEvents()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            arcaneBarracksContract.on('ActionSwap', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, getAllBarracksEvents()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
}
function getHighestId(arr) {
    var highest = 0;
    for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
        var item = arr_1[_i];
        if (item.id > highest) {
            highest = item.id;
        }
    }
    return highest;
}
function getAllMarketEvents() {
    return __awaiter(this, void 0, void 0, function () {
        function processLog(log, updateConfig) {
            if (updateConfig === void 0) { updateConfig = true; }
            return __awaiter(this, void 0, void 0, function () {
                var e, _a, seller_1, buyer, tokenId_1, price, trade, _b, seller_2, buyer, tokenId_2, price, specificTrades, _i, specificTrades_1, specificTrade, _c, seller_3, buyer, tokenId_3, price, specificTrades, _d, specificTrades_2, specificTrade, _e, seller_4, buyer, tokenId_4, price, specificTrades, _f, specificTrades_3, specificTrade, e2;
                return __generator(this, function (_g) {
                    switch (_g.label) {
                        case 0:
                            e = iface_2.parseLog(log);
                            console.log(e.name, e.args.tokenId);
                            if (!(e.name === 'List')) return [3 /*break*/, 5];
                            _a = e.args, seller_1 = _a.seller, buyer = _a.buyer, tokenId_1 = _a.tokenId, price = _a.price;
                            trade = trades.find(function (t) { return t.seller.toLowerCase() === seller_1.toLowerCase() && t.tokenId === tokenId_1.toString(); });
                            if (!(!trade || trade.blockNumber < log.blockNumber)) return [3 /*break*/, 5];
                            trade = {
                                id: getHighestId(trades) + 1
                            };
                            trade.seller = seller_1;
                            trade.buyer = buyer;
                            trade.tokenId = tokenId_1.toString();
                            trade.price = (0, util_mjs_1.toShort)(price);
                            trade.status = "available";
                            trade.hotness = 0;
                            trade.createdAt = new Date().getTime();
                            trade.updatedAt = new Date().getTime();
                            trade.blockNumber = log.blockNumber;
                            trade.item = { id: (0, decodeItem_mjs_1.decodeItem)(tokenId_1.toString()).id };
                            // trade.item = decodeItem(trade.tokenId)
                            trades.push(trade);
                            console.log('Adding trade', trade);
                            return [4 /*yield*/, saveUserTrade(loadUser(seller_1), trade)];
                        case 1:
                            _g.sent();
                            return [4 /*yield*/, saveTokenTrade(loadToken(trade.tokenId), trade)];
                        case 2:
                            _g.sent();
                            return [4 /*yield*/, saveItemTrade(loadItem(trade.item.id), trade)];
                        case 3:
                            _g.sent();
                            return [4 /*yield*/, saveItemToken(loadItem(trade.item.id), { id: trade.tokenId, item: trade.item })
                                // await saveConfig()
                            ];
                        case 4:
                            _g.sent();
                            // await saveConfig()
                            console.log('List', trade);
                            _g.label = 5;
                        case 5:
                            if (!(e.name === 'Update')) return [3 /*break*/, 12];
                            _b = e.args, seller_2 = _b.seller, buyer = _b.buyer, tokenId_2 = _b.tokenId, price = _b.price;
                            specificTrades = trades.find(function (t) { return t.seller.toLowerCase() === seller_2.toLowerCase() && t.tokenId === tokenId_2.toString() && t.status === 'available' && t.blockNumber < log.blockNumber; });
                            _i = 0, specificTrades_1 = specificTrades;
                            _g.label = 6;
                        case 6:
                            if (!(_i < specificTrades_1.length)) return [3 /*break*/, 12];
                            specificTrade = specificTrades_1[_i];
                            specificTrade.buyer = buyer;
                            specificTrade.price = (0, util_mjs_1.toShort)(price);
                            specificTrade.updatedAt = new Date().getTime();
                            specificTrade.blockNumber = log.blockNumber;
                            specificTrade.item = { id: (0, decodeItem_mjs_1.decodeItem)(tokenId_2.toString()).id };
                            // specificTrade.item = decodeItem(specificTrade.tokenId)
                            return [4 /*yield*/, saveUserTrade(loadUser(seller_2), specificTrade)];
                        case 7:
                            // specificTrade.item = decodeItem(specificTrade.tokenId)
                            _g.sent();
                            return [4 /*yield*/, saveTokenTrade(loadToken(specificTrade.tokenId), specificTrade)];
                        case 8:
                            _g.sent();
                            return [4 /*yield*/, saveItemTrade(loadItem(specificTrade.item.id), specificTrade)];
                        case 9:
                            _g.sent();
                            return [4 /*yield*/, saveItemToken(loadItem(specificTrade.item.id), { id: specificTrade.tokenId, item: specificTrade.item })];
                        case 10:
                            _g.sent();
                            console.log('Update', specificTrade);
                            _g.label = 11;
                        case 11:
                            _i++;
                            return [3 /*break*/, 6];
                        case 12:
                            if (!(e.name === 'Delist')) return [3 /*break*/, 19];
                            _c = e.args, seller_3 = _c.seller, buyer = _c.buyer, tokenId_3 = _c.tokenId, price = _c.price;
                            specificTrades = trades.filter(function (t) { return t.seller.toLowerCase() === seller_3.toLowerCase() && t.tokenId === tokenId_3.toString() && t.status === 'available' && t.blockNumber < log.blockNumber; });
                            _d = 0, specificTrades_2 = specificTrades;
                            _g.label = 13;
                        case 13:
                            if (!(_d < specificTrades_2.length)) return [3 /*break*/, 19];
                            specificTrade = specificTrades_2[_d];
                            specificTrade.status = "delisted";
                            specificTrade.updatedAt = new Date().getTime();
                            specificTrade.blockNumber = log.blockNumber;
                            specificTrade.item = { id: (0, decodeItem_mjs_1.decodeItem)(tokenId_3.toString()).id };
                            // specificTrade.item = decodeItem(specificTrade.tokenId)
                            console.log('Delisting trade', specificTrade);
                            return [4 /*yield*/, saveUserTrade(loadUser(seller_3), specificTrade)];
                        case 14:
                            _g.sent();
                            return [4 /*yield*/, saveTokenTrade(loadToken(specificTrade.tokenId), specificTrade)];
                        case 15:
                            _g.sent();
                            return [4 /*yield*/, saveItemTrade(loadItem(specificTrade.item.id), specificTrade)];
                        case 16:
                            _g.sent();
                            return [4 /*yield*/, saveItemToken(loadItem(specificTrade.item.id), { id: specificTrade.tokenId, item: specificTrade.item })];
                        case 17:
                            _g.sent();
                            console.log('Delist', specificTrade);
                            _g.label = 18;
                        case 18:
                            _d++;
                            return [3 /*break*/, 13];
                        case 19:
                            if (!(e.name === 'Buy')) return [3 /*break*/, 27];
                            _e = e.args, seller_4 = _e.seller, buyer = _e.buyer, tokenId_4 = _e.tokenId, price = _e.price;
                            specificTrades = trades.filter(function (t) { return t.seller.toLowerCase() === seller_4.toLowerCase() && t.tokenId === tokenId_4.toString() && t.status === 'available' && t.blockNumber < log.blockNumber; });
                            _f = 0, specificTrades_3 = specificTrades;
                            _g.label = 20;
                        case 20:
                            if (!(_f < specificTrades_3.length)) return [3 /*break*/, 27];
                            specificTrade = specificTrades_3[_f];
                            specificTrade.status = "sold";
                            specificTrade.buyer = buyer;
                            specificTrade.updatedAt = new Date().getTime();
                            specificTrade.blockNumber = log.blockNumber;
                            specificTrade.item = { id: (0, decodeItem_mjs_1.decodeItem)(tokenId_4.toString()).id };
                            // specificTrade.item = decodeItem(specificTrade.tokenId)
                            return [4 /*yield*/, saveUserTrade(loadUser(seller_4), specificTrade)];
                        case 21:
                            // specificTrade.item = decodeItem(specificTrade.tokenId)
                            _g.sent();
                            return [4 /*yield*/, saveUserTrade(loadUser(buyer), specificTrade)];
                        case 22:
                            _g.sent();
                            return [4 /*yield*/, saveTokenTrade(loadToken(specificTrade.tokenId), specificTrade)];
                        case 23:
                            _g.sent();
                            return [4 /*yield*/, saveItemTrade(loadItem(specificTrade.item.id), specificTrade)];
                        case 24:
                            _g.sent();
                            return [4 /*yield*/, saveItemToken(loadItem(specificTrade.item.id), { id: specificTrade.tokenId, item: specificTrade.item })];
                        case 25:
                            _g.sent();
                            console.log('Buy', specificTrade);
                            _g.label = 26;
                        case 26:
                            _f++;
                            return [3 /*break*/, 20];
                        case 27:
                            e2 = tradesEvents.find(function (t) { return t.transactionHash === log.transactionHash; });
                            if (!e2) {
                                tradesEvents.push(__assign(__assign({}, log), e));
                            }
                            return [2 /*return*/];
                    }
                });
            });
        }
        var iface_2, blockNumber, events, _loop_3, _i, events_2, event_2, e_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (config.trades.updating)
                        return [2 /*return*/];
                    console.log('[Market] Updating');
                    config.trades.updating = true;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    iface_2 = new ethers_1.default.utils.Interface(ArcaneTraderV1_json_1.default.abi);
                    return [4 /*yield*/, web3.eth.getBlockNumber()];
                case 2:
                    blockNumber = _a.sent();
                    events = [
                        'List(address,address,uint256,uint256)',
                        'Update(address,address,uint256,uint256)',
                        'Delist(address,uint256)',
                        'Buy(address,address,uint256,uint256)',
                    ];
                    _loop_3 = function (event_2) {
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, iterateBlocks("Market Events: ".concat(event_2), (0, util_mjs_1.getAddress)(contracts_mjs_1.default.trader), config.trades.lastBlock[event_2], blockNumber, arcaneTraderContract.filters[event_2](), processLog, function (blockNumber2) {
                                        return __awaiter(this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                config.trades.lastBlock[event_2] = blockNumber2;
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
                    _i = 0, events_2 = events;
                    _a.label = 3;
                case 3:
                    if (!(_i < events_2.length)) return [3 /*break*/, 6];
                    event_2 = events_2[_i];
                    return [5 /*yield**/, _loop_3(event_2)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    console.log('Finished');
                    return [3 /*break*/, 8];
                case 7:
                    e_4 = _a.sent();
                    console.log(e_4);
                    return [3 /*break*/, 8];
                case 8:
                    config.trades.updating = false;
                    config.trades.updatedDate = (new Date()).toString();
                    config.trades.updatedTimestamp = new Date().getTime();
                    // await saveTrades()
                    // await saveConfig()
                    setTimeout(getAllMarketEvents, 2 * 60 * 1000);
                    return [2 /*return*/];
            }
        });
    });
}
function monitorMarketEvents() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            // event List(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
            // event Update(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
            // event Delist(address indexed seller, uint256 tokenId);
            // event Buy(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
            // event Recover(address indexed user, address indexed seller, uint256 tokenId);
            try {
                arcaneTraderContract.on('List', function () { return __awaiter(_this, void 0, void 0, function () {
                    var e_5;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, getAllMarketEvents()];
                            case 1:
                                _a.sent();
                                return [3 /*break*/, 3];
                            case 2:
                                e_5 = _a.sent();
                                console.log(e_5);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); });
                arcaneTraderContract.on('Update', function () { return __awaiter(_this, void 0, void 0, function () {
                    var e_6;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, getAllMarketEvents()];
                            case 1:
                                _a.sent();
                                return [3 /*break*/, 3];
                            case 2:
                                e_6 = _a.sent();
                                console.log(e_6);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); });
                arcaneTraderContract.on('Delist', function () { return __awaiter(_this, void 0, void 0, function () {
                    var e_7;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, getAllMarketEvents()];
                            case 1:
                                _a.sent();
                                return [3 /*break*/, 3];
                            case 2:
                                e_7 = _a.sent();
                                console.log(e_7);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); });
                arcaneTraderContract.on('Buy', function () { return __awaiter(_this, void 0, void 0, function () {
                    var e_8;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, getAllMarketEvents()];
                            case 1:
                                _a.sent();
                                return [3 /*break*/, 3];
                            case 2:
                                e_8 = _a.sent();
                                console.log(e_8);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); });
            }
            catch (e) {
                console.log(e);
            }
            return [2 /*return*/];
        });
    });
}
function getAllCharacterEvents() {
    return __awaiter(this, void 0, void 0, function () {
        function processLog(log, updateConfig) {
            if (updateConfig === void 0) { updateConfig = true; }
            return __awaiter(this, void 0, void 0, function () {
                var e, _a, from, userAddress, tokenId, user, characterData, e2;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            e = iface_3.parseLog(log);
                            if (!(e.name === 'Transfer')) return [3 /*break*/, 6];
                            _a = e.args, from = _a.from, userAddress = _a.to, tokenId = _a.tokenId;
                            user = loadUser(userAddress);
                            if (!user.characters.length) {
                                console.log('New user: ' + userAddress);
                            }
                            _b = {
                                owner: userAddress,
                                from: from,
                                status: from === '0x0000000000000000000000000000000000000000' ? "created" : 'transferred_in',
                                tokenId: tokenId.toString(),
                                transferredAt: new Date().getTime(),
                                blockNumber: log.blockNumber,
                                tx: log.transactionHash
                            };
                            return [4 /*yield*/, arcaneCharactersContract.getCharacterId(tokenId.toString())];
                        case 1:
                            characterData = (_b.id = _c.sent(),
                                _b);
                            return [4 /*yield*/, saveUserCharacter(user, characterData)
                                // saveTokenTransfer(loadToken(characterData.tokenId), characterData)
                            ];
                        case 2:
                            _c.sent();
                            if (!(from !== '0x0000000000000000000000000000000000000000')) return [3 /*break*/, 4];
                            return [4 /*yield*/, saveUserCharacter(user, __assign(__assign({}, characterData), { status: 'transferred_out' }))];
                        case 3:
                            _c.sent();
                            _c.label = 4;
                        case 4: return [4 /*yield*/, saveCharacterOwner(loadCharacter(characterData.id), characterData)];
                        case 5:
                            _c.sent();
                            _c.label = 6;
                        case 6:
                            e2 = charactersEvents.find(function (t) { return t.transactionHash === log.transactionHash; });
                            if (!e2) {
                                charactersEvents.push(__assign(__assign({ id: getHighestId(charactersEvents) + 1 }, log), e));
                            }
                            return [2 /*return*/];
                    }
                });
            });
        }
        var iface_3, blockNumber, events, _loop_4, _i, events_3, event_3, e_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (config.characters.updating)
                        return [2 /*return*/];
                    console.log('[Characters] Updating');
                    config.characters.updating = true;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    iface_3 = new ethers_1.default.utils.Interface(ArcaneCharacters_json_1.default.abi);
                    return [4 /*yield*/, web3.eth.getBlockNumber()];
                case 2:
                    blockNumber = _a.sent();
                    events = [
                        'Transfer'
                    ];
                    _loop_4 = function (event_3) {
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, iterateBlocks("Characters Events: ".concat(event_3), (0, util_mjs_1.getAddress)(contracts_mjs_1.default.characters), config.characters.lastBlock[event_3], blockNumber, arcaneCharactersContract.filters[event_3](), processLog, function (blockNumber2) {
                                        return __awaiter(this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                config.characters.lastBlock[event_3] = blockNumber2;
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
                    _i = 0, events_3 = events;
                    _a.label = 3;
                case 3:
                    if (!(_i < events_3.length)) return [3 /*break*/, 6];
                    event_3 = events_3[_i];
                    return [5 /*yield**/, _loop_4(event_3)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    console.log('Finished');
                    return [3 /*break*/, 8];
                case 7:
                    e_9 = _a.sent();
                    console.log(e_9);
                    return [3 /*break*/, 8];
                case 8:
                    config.characters.updating = false;
                    config.characters.updatedDate = (new Date()).toString();
                    config.characters.updatedTimestamp = new Date().getTime();
                    // await saveCharactersEvents()
                    // await saveConfig()
                    setTimeout(getAllCharacterEvents, 2 * 60 * 1000);
                    return [2 /*return*/];
            }
        });
    });
}
function monitorCharacterEvents() {
    return __awaiter(this, void 0, void 0, function () {
        var contract;
        var _this = this;
        return __generator(this, function (_a) {
            contract = new ethers_1.default.Contract((0, util_mjs_1.getAddress)(contracts_mjs_1.default.characters), ArcaneCharacters_json_1.default.abi, signer);
            contract.on('Transfer', function (from, to, tokenId, log) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, getAllCharacterEvents()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
}
function getAllItemEvents() {
    return __awaiter(this, void 0, void 0, function () {
        function processLog(log, updateConfig) {
            if (updateConfig === void 0) { updateConfig = true; }
            return __awaiter(this, void 0, void 0, function () {
                var e, _a, from, userAddress, tokenId, user, decodedItem, itemData_1, token, e2, ex_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 7, , 8]);
                            e = iface_4.parseLog(log);
                            if (!(e.name === 'Transfer')) return [3 /*break*/, 6];
                            _a = e.args, from = _a.from, userAddress = _a.to, tokenId = _a.tokenId;
                            user = loadUser(userAddress);
                            decodedItem = (0, decodeItem_mjs_1.decodeItem)(tokenId.toString());
                            itemData_1 = {
                                owner: userAddress,
                                from: from,
                                status: from === '0x0000000000000000000000000000000000000000' ? "created" : 'transferred_in',
                                tokenId: tokenId.toString(),
                                createdAt: new Date().getTime(),
                                id: decodedItem.id,
                                perfection: decodedItem.perfection
                            };
                            token = loadToken(itemData_1.tokenId);
                            if (from === '0x0000000000000000000000000000000000000000') {
                                token.owner = itemData_1.userAddress;
                                token.creator = itemData_1.userAddress;
                                token.createdAt = itemData_1.createdAt;
                            }
                            return [4 /*yield*/, saveUserItem(user, itemData_1)];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, saveTokenTransfer(token, itemData_1)];
                        case 2:
                            _b.sent();
                            if (!(from !== '0x0000000000000000000000000000000000000000')) return [3 /*break*/, 4];
                            return [4 /*yield*/, saveUserItem(user, __assign(__assign({}, itemData_1), { status: 'transferred_out' }))];
                        case 3:
                            _b.sent();
                            _b.label = 4;
                        case 4: return [4 /*yield*/, saveItemOwner(loadItem(itemData_1.id), itemData_1)];
                        case 5:
                            _b.sent();
                            _b.label = 6;
                        case 6:
                            e2 = itemsEvents.find(function (t) { return t.transactionHash === log.transactionHash; });
                            if (!e2) {
                                itemsEvents.push(__assign(__assign({}, log), e));
                            }
                            return [3 /*break*/, 8];
                        case 7:
                            ex_1 = _b.sent();
                            console.log(ex_1);
                            console.log("Error parsing log: ", log);
                            return [3 /*break*/, 8];
                        case 8: return [2 /*return*/];
                    }
                });
            });
        }
        var contract, iface_4, blockNumber, events, _loop_5, _i, events_4, event_4, e_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (config.items.updating)
                        return [2 /*return*/];
                    console.log('[Items] Updating');
                    config.items.updating = true;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    contract = new ethers_1.default.Contract((0, util_mjs_1.getAddress)(contracts_mjs_1.default.items), ArcaneItems_json_1.default.abi, signer);
                    iface_4 = new ethers_1.default.utils.Interface(ArcaneItems_json_1.default.abi);
                    return [4 /*yield*/, web3.eth.getBlockNumber()];
                case 2:
                    blockNumber = _a.sent();
                    events = [
                        'Transfer'
                    ];
                    _loop_5 = function (event_4) {
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, iterateBlocks("Items Events: ".concat(event_4), (0, util_mjs_1.getAddress)(contracts_mjs_1.default.items), config.items.lastBlock[event_4], blockNumber, contract.filters[event_4](), processLog, function (blockNumber2) {
                                        return __awaiter(this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                config.items.lastBlock[event_4] = blockNumber2;
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
                    _i = 0, events_4 = events;
                    _a.label = 3;
                case 3:
                    if (!(_i < events_4.length)) return [3 /*break*/, 6];
                    event_4 = events_4[_i];
                    return [5 /*yield**/, _loop_5(event_4)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    console.log('Finished');
                    return [3 /*break*/, 8];
                case 7:
                    e_10 = _a.sent();
                    console.log(e_10);
                    return [3 /*break*/, 8];
                case 8:
                    config.items.updating = false;
                    config.items.updatedDate = (new Date()).toString();
                    config.items.updatedTimestamp = new Date().getTime();
                    // await saveItemsEvents()
                    // await saveConfig()
                    setTimeout(getAllItemEvents, 2 * 60 * 1000);
                    return [2 /*return*/];
            }
        });
    });
}
function monitorItemEvents() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            arcaneItemsContract.on('Transfer', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, getAllItemEvents()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
}
function monitorGeneralStats() {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function () {
        var _e, i, _f, e_11, _g, i, _h, _j, e_12, i, farm, value, _k, value, _l, lpAddress, tokenContract, lpContract, quotedContract, tokenBalanceLP, quoteTokenBlanceLP, lpTokenBalanceMC, lpTotalSupply, tokenDecimals, quoteTokenDecimals, tokenAmount, lpTotalInQuoteToken, tokenPriceVsQuote, lpTokenRatio, quoteTokenAmount, tokenSymbol, _m, _o, _p, _q, e_13, _i, _r, tokenSymbol, farm, liquidity, tokenSymbol, currentPrice, historicalPrice, oldTime, newTime, diff, oldTime, newTime, diff, oldTime, newTime, diff, _s, _t, _u, _v, tokenSymbol, _w, _x, tokenSymbol, farm, symbol, tokenContract, raidHoldings, _y, botHoldings, _z, bot2Holdings, _0, bot3Holdings, _1, vaultHoldings, _2, vault2Holdings, _3, vault3Holdings, _4, devHoldings, _5, charityHoldings, _6, deployerHoldings, _7, characterFactoryHoldings, _8, lockedLiquidityHoldings, _9, v2LiquidityHoldings, _10, evolutionHoldings, _11, vaultTotalHoldings, botTotalHoldings, orgCashHoldings, orgTokenHoldings, orgHoldings, totalSupply, circulatingSupply, totalBurned, oldTime, newTime, diff, e_14, _12, _13, rune, _14, _15, symbol, oldTime, newTime, diff, e_15;
        return __generator(this, function (_16) {
            switch (_16.label) {
                case 0:
                    _16.trys.push([0, 56, , 57]);
                    console.log('[Stats] Updating');
                    _16.label = 1;
                case 1:
                    _16.trys.push([1, 7, , 8]);
                    _e = stats;
                    return [4 /*yield*/, arcaneCharactersContract.totalSupply()];
                case 2:
                    _e.totalCharacters = (_16.sent()).toNumber();
                    if (!stats.characters)
                        stats.characters = {};
                    i = 1;
                    _16.label = 3;
                case 3:
                    if (!(i <= 7)) return [3 /*break*/, 6];
                    if (!stats.characters[i])
                        stats.characters[i] = {};
                    _f = stats.characters[i];
                    return [4 /*yield*/, arcaneCharactersContract.characterCount(i)];
                case 4:
                    _f.total = (_16.sent()).toNumber();
                    _16.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 8];
                case 7:
                    e_11 = _16.sent();
                    console.error(e_11);
                    return [3 /*break*/, 8];
                case 8:
                    _16.trys.push([8, 15, , 16]);
                    _g = stats;
                    return [4 /*yield*/, arcaneItemsContract.totalSupply()];
                case 9:
                    _g.totalItems = (_16.sent()).toNumber();
                    if (!stats.items)
                        stats.items = {};
                    i = 1;
                    _16.label = 10;
                case 10:
                    if (!(i <= 30)) return [3 /*break*/, 14];
                    if (!stats.items[i])
                        stats.items[i] = {};
                    _h = stats.items[i];
                    return [4 /*yield*/, arcaneItemsContract.itemCount(i)];
                case 11:
                    _h.total = (_16.sent()).toNumber();
                    _j = stats.items[i];
                    return [4 /*yield*/, arcaneItemsContract.itemBurnCount(i)];
                case 12:
                    _j.burned = (_16.sent()).toNumber();
                    _16.label = 13;
                case 13:
                    i++;
                    return [3 /*break*/, 10];
                case 14: return [3 /*break*/, 16];
                case 15:
                    e_12 = _16.sent();
                    console.error(e_12);
                    return [3 /*break*/, 16];
                case 16:
                    console.log('Update farms');
                    if (!stats.prices)
                        stats.prices = { busd: 1 };
                    if (!stats.liquidity)
                        stats.liquidity = {};
                    stats.totalBusdLiquidity = 0;
                    stats.totalBnbLiquidity = 0;
                    i = 0;
                    _16.label = 17;
                case 17:
                    if (!(i < farms_mjs_1.default.length)) return [3 /*break*/, 33];
                    farm = farms_mjs_1.default[i];
                    _16.label = 18;
                case 18:
                    _16.trys.push([18, 31, , 32]);
                    if (!(farm.lpSymbol.indexOf('BUSD') !== -1)) return [3 /*break*/, 20];
                    _k = util_mjs_1.toShort;
                    return [4 /*yield*/, busdContract.balanceOf((0, util_mjs_1.getAddress)(farm.lpAddresses))];
                case 19:
                    value = _k.apply(void 0, [_16.sent()]);
                    // console.log('has', value)
                    if (!['USDT-BUSD LP', 'BUSD-BNB LP'].includes(farm.lpSymbol)) {
                        if (!stats.liquidity[farm.lpSymbol])
                            stats.liquidity[farm.lpSymbol] = {};
                        stats.liquidity[farm.lpSymbol].value = value;
                        stats.totalBusdLiquidity += value;
                    }
                    return [3 /*break*/, 22];
                case 20:
                    if (!(farm.lpSymbol.indexOf('BNB') !== -1)) return [3 /*break*/, 22];
                    _l = util_mjs_1.toShort;
                    return [4 /*yield*/, wbnbContract.balanceOf((0, util_mjs_1.getAddress)(farm.lpAddresses))];
                case 21:
                    value = _l.apply(void 0, [_16.sent()]);
                    // console.log('has', value)
                    if (!['BTCB-BNB LP', 'BUSD-BNB LP'].includes(farm.lpSymbol)) {
                        if (!stats.liquidity[farm.lpSymbol])
                            stats.liquidity[farm.lpSymbol] = {};
                        stats.liquidity[farm.lpSymbol].value = value;
                        stats.totalBnbLiquidity += value;
                    }
                    _16.label = 22;
                case 22:
                    lpAddress = (0, util_mjs_1.getAddress)(farm.isTokenOnly ? farm.tokenLpAddresses : farm.lpAddresses);
                    tokenContract = new ethers_1.default.Contract((0, util_mjs_1.getAddress)(farm.tokenAddresses), BEP20_json_1.default.abi, signer);
                    lpContract = new ethers_1.default.Contract(farm.isTokenOnly ? (0, util_mjs_1.getAddress)(farm.tokenAddresses) : lpAddress, BEP20_json_1.default.abi, signer);
                    quotedContract = new ethers_1.default.Contract((0, util_mjs_1.getAddress)(farm.quoteTokenAdresses), BEP20_json_1.default.abi, signer);
                    return [4 /*yield*/, tokenContract.balanceOf(lpAddress)];
                case 23:
                    tokenBalanceLP = (_16.sent()).toString();
                    return [4 /*yield*/, quotedContract.balanceOf(lpAddress)];
                case 24:
                    quoteTokenBlanceLP = (_16.sent()).toString();
                    return [4 /*yield*/, lpContract.balanceOf((0, util_mjs_1.getAddress)(contracts_mjs_1.default.raid))];
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
                        if (farm.tokenSymbol === farms_mjs_2.QuoteToken.BUSD && farm.quoteTokenSymbol === farms_mjs_2.QuoteToken.BUSD) {
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
                    if (farm.quoteTokenSymbol === farms_mjs_2.QuoteToken.BUSD) {
                        tokenSymbol = farm.tokenSymbol.toLowerCase();
                        // console.log(tokenSymbol, tokenPriceVsQuote.toNumber())orgToken
                        stats.prices[tokenSymbol] = tokenPriceVsQuote.toNumber();
                    }
                    if (farm.lpSymbol === 'BUSD-BNB LP') {
                        stats.prices.bnb = 1 / tokenPriceVsQuote.toNumber();
                        stats.prices.wbnb = 1 / tokenPriceVsQuote.toNumber();
                    }
                    // console.log(tokenAmount)
                    // console.log(lpTotalInQuoteToken)
                    // console.log(tokenPriceVsQuote)
                    // console.log(quoteTokenBlanceLP)
                    // console.log(lpTokenBalanceMC)
                    // console.log(lpTotalSupply)
                    farm.tokenAmount = tokenAmount.toNumber();
                    farm.lpTotalInQuoteToken = lpTotalInQuoteToken.toNumber();
                    farm.tokenPriceVsQuote = tokenPriceVsQuote.toNumber();
                    farm.tokenBalanceLP = (0, util_mjs_1.toShort)(tokenBalanceLP.toString());
                    farm.quoteTokenBlanceLP = (0, util_mjs_1.toShort)(quoteTokenBlanceLP.toString());
                    farm.lpTokenBalanceMC = (0, util_mjs_1.toShort)(lpTokenBalanceMC.toString());
                    farm.lpTotalSupply = (0, util_mjs_1.toShort)(lpTotalSupply.toString());
                    farm.tokenDecimals = tokenDecimals;
                    farm.quoteTokenDecimals = quoteTokenDecimals;
                    _m = farm;
                    _o = util_mjs_1.toShort;
                    return [4 /*yield*/, tokenContract.totalSupply()];
                case 29:
                    _m.tokenTotalSupply = _o.apply(void 0, [(_16.sent()).toString()]);
                    _p = farm;
                    _q = util_mjs_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf('0x000000000000000000000000000000000000dEaD')];
                case 30:
                    _p.tokenTotalBurned = _q.apply(void 0, [(_16.sent()).toString()]);
                    // console.log(farm)
                    farms[farm.lpSymbol] = farm;
                    return [3 /*break*/, 32];
                case 31:
                    e_13 = _16.sent();
                    console.log(e_13);
                    return [3 /*break*/, 32];
                case 32:
                    i++;
                    return [3 /*break*/, 17];
                case 33:
                    console.log("Done updating farms");
                    // Update stats
                    {
                        console.log('Update stats');
                        // Update TVL
                        {
                            console.log('Updating TVL');
                            stats.tvl = 0;
                            for (_i = 0, _r = Object.keys(farms); _i < _r.length; _i++) {
                                tokenSymbol = _r[_i];
                                farm = farms[tokenSymbol];
                                liquidity = farm.lpTotalInQuoteToken;
                                if (!farm.lpTotalInQuoteToken) {
                                    liquidity = 0;
                                }
                                else {
                                    liquidity = stats.prices[farm.quoteTokenSymbol.toLowerCase()] * farm.lpTotalInQuoteToken;
                                }
                                stats.tvl += liquidity;
                            }
                        }
                        // Update historical token prices
                        {
                            console.log('Update historical token prices');
                            if (!historical.price)
                                historical.price = {};
                            for (tokenSymbol in stats.prices) {
                                if (!historical.price[tokenSymbol])
                                    historical.price[tokenSymbol] = [];
                                currentPrice = stats.prices[tokenSymbol];
                                historicalPrice = historical.price[tokenSymbol];
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
                            console.log('Update liquidity');
                            if (!historical.liquidity)
                                historical.liquidity = {
                                    total: [],
                                    busd: [],
                                    bnb: []
                                };
                            stats.totalLiquidity = stats.totalBusdLiquidity + (stats.totalBnbLiquidity * stats.prices.bnb);
                            oldTime = (new Date(((_b = historical.liquidity.total[historical.liquidity.total.length - 1]) === null || _b === void 0 ? void 0 : _b[0]) || 0)).getTime();
                            newTime = (new Date()).getTime();
                            diff = newTime - oldTime;
                            if (diff / (1000 * 60 * 60 * 24) > 1) {
                                historical.liquidity.total.push([newTime, stats.totalLiquidity]);
                                historical.liquidity.busd.push([newTime, stats.totalBusdLiquidity]);
                                historical.liquidity.bnb.push([newTime, stats.totalBnbLiquidity]);
                            }
                        }
                        // Update market
                        {
                            console.log('Update market');
                            stats.marketItemsAvailable = trades.filter(function (t) { return t.status === 'available'; }).length;
                            stats.marketItemsSold = trades.filter(function (t) { return t.status === 'sold'; }).length;
                            stats.marketItemsDelisted = trades.filter(function (t) { return t.status === 'delisted'; }).length;
                            stats.marketAverageSoldPrice = average(trades.filter(function (t) { return t.status === 'sold'; }).map(function (t) { return t.price; }));
                        }
                        // Update runes
                        {
                            console.log('Update runes');
                            stats.totalRunes = Object.keys(runes).length - 1;
                        }
                        // Update community
                        {
                            console.log('Update community');
                            stats.totalCommunities = 8;
                            stats.totalPolls = 50;
                        }
                        // Update game info
                        {
                            console.log('Update game info');
                            stats.totalGuilds = guilds.length;
                            stats.totalClasses = Object.keys(classes).length;
                            stats.totalRunewords = 7;
                        }
                        // Update stat historical
                        {
                            console.log('Update stat historical');
                            if (!historical.stats)
                                historical.stats = {};
                            if (!historical.stats.totalCharacters)
                                historical.stats.totalCharacters = [];
                            if (!historical.stats.totalItems)
                                historical.stats.totalItems = [];
                            if (!historical.stats.tvl)
                                historical.stats.tvl = [];
                            if (!historical.stats.marketItemsAvailable)
                                historical.stats.marketItemsAvailable = [];
                            if (!historical.stats.marketItemsSold)
                                historical.stats.marketItemsSold = [];
                            if (!historical.stats.marketItemsDelisted)
                                historical.stats.marketItemsDelisted = [];
                            if (!historical.stats.marketAverageSoldPrice)
                                historical.stats.marketAverageSoldPrice = [];
                            if (!historical.stats.totalCommunities)
                                historical.stats.totalCommunities = [];
                            if (!historical.stats.totalClasses)
                                historical.stats.totalClasses = [];
                            if (!historical.stats.totalGuilds)
                                historical.stats.totalGuilds = [];
                            if (!historical.stats.totalPolls)
                                historical.stats.totalPolls = [];
                            if (!historical.stats.totalRunes)
                                historical.stats.totalRunes = [];
                            if (!historical.stats.totalRunewords)
                                historical.stats.totalRunewords = [];
                            oldTime = (new Date(historical.stats.updatedAt || 0)).getTime();
                            newTime = (new Date()).getTime();
                            diff = newTime - oldTime;
                            if (diff / (1000 * 60 * 60 * 24) > 1) {
                                historical.stats.totalCharacters.push([newTime, stats.totalCharacters]);
                                historical.stats.totalItems.push([newTime, stats.totalItems]);
                                historical.stats.tvl.push([newTime, stats.tvl]);
                                historical.stats.marketItemsAvailable.push([newTime, stats.marketItemsAvailable]);
                                historical.stats.marketItemsSold.push([newTime, stats.marketItemsSold]);
                                historical.stats.marketItemsDelisted.push([newTime, stats.marketItemsDelisted]);
                                historical.stats.marketAverageSoldPrice.push([newTime, stats.marketAverageSoldPrice]);
                                historical.stats.totalCommunities.push([newTime, stats.totalCommunities]);
                                historical.stats.totalClasses.push([newTime, stats.totalClasses]);
                                historical.stats.totalGuilds.push([newTime, stats.totalGuilds]);
                                historical.stats.totalPolls.push([newTime, stats.totalPolls]);
                                historical.stats.totalRunes.push([newTime, stats.totalRunes]);
                                historical.stats.totalRunewords.push([newTime, stats.totalRunewords]);
                                historical.stats.updatedAt = newTime;
                            }
                        }
                    }
                    console.log('Update app');
                    console.log('Updating Profile config');
                    _s = app.config;
                    _t = util_mjs_1.toShort;
                    return [4 /*yield*/, arcaneCharacterFactoryContract.tokenPrice()];
                case 34:
                    _s.characterMintCost = _t.apply(void 0, [(_16.sent()).toString()]);
                    _u = app.config;
                    _v = util_mjs_1.toShort;
                    return [4 /*yield*/, arcaneProfileContract.numberRuneToRegister()];
                case 35:
                    _u.profileRegisterCost = _v.apply(void 0, [(_16.sent()).toString()]);
                    console.log('Update runes');
                    for (tokenSymbol in stats.prices) {
                        if (tokenSymbol === 'bnb' || tokenSymbol === 'usdt' || tokenSymbol === 'busd')
                            continue;
                        if (!runes[tokenSymbol])
                            runes[tokenSymbol] = {};
                        runes[tokenSymbol].price = stats.prices[tokenSymbol];
                    }
                    _w = 0, _x = Object.keys(farms);
                    _16.label = 36;
                case 36:
                    if (!(_w < _x.length)) return [3 /*break*/, 55];
                    tokenSymbol = _x[_w];
                    _16.label = 37;
                case 37:
                    _16.trys.push([37, 53, , 54]);
                    farm = farms[tokenSymbol];
                    if (!farm.isTokenOnly) return [3 /*break*/, 52];
                    symbol = tokenSymbol.toLowerCase();
                    tokenContract = new ethers_1.default.Contract((0, util_mjs_1.getAddress)(contracts_mjs_1.default[symbol]), BEP20_json_1.default.abi, signer);
                    _y = util_mjs_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf((0, util_mjs_1.getAddress)(contracts_mjs_1.default.raid))];
                case 38:
                    raidHoldings = _y.apply(void 0, [(_16.sent()).toString()]);
                    _z = util_mjs_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf((0, util_mjs_1.getAddress)(contracts_mjs_1.default.botAddress))];
                case 39:
                    botHoldings = _z.apply(void 0, [(_16.sent()).toString()]);
                    _0 = util_mjs_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf((0, util_mjs_1.getAddress)(contracts_mjs_1.default.bot2Address))];
                case 40:
                    bot2Holdings = _0.apply(void 0, [(_16.sent()).toString()]);
                    _1 = util_mjs_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf((0, util_mjs_1.getAddress)(contracts_mjs_1.default.bot3Address))];
                case 41:
                    bot3Holdings = _1.apply(void 0, [(_16.sent()).toString()]);
                    _2 = util_mjs_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf((0, util_mjs_1.getAddress)(contracts_mjs_1.default.vaultAddress))];
                case 42:
                    vaultHoldings = _2.apply(void 0, [(_16.sent()).toString()]);
                    _3 = util_mjs_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf((0, util_mjs_1.getAddress)(contracts_mjs_1.default.vault2Address))];
                case 43:
                    vault2Holdings = _3.apply(void 0, [(_16.sent()).toString()]);
                    _4 = util_mjs_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf((0, util_mjs_1.getAddress)(contracts_mjs_1.default.vault3Address))];
                case 44:
                    vault3Holdings = _4.apply(void 0, [(_16.sent()).toString()]);
                    _5 = util_mjs_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf((0, util_mjs_1.getAddress)(contracts_mjs_1.default.devAddress))];
                case 45:
                    devHoldings = _5.apply(void 0, [(_16.sent()).toString()]);
                    _6 = util_mjs_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf((0, util_mjs_1.getAddress)(contracts_mjs_1.default.charityAddress))];
                case 46:
                    charityHoldings = _6.apply(void 0, [(_16.sent()).toString()]);
                    _7 = util_mjs_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf((0, util_mjs_1.getAddress)(contracts_mjs_1.default.deployerAddress))];
                case 47:
                    deployerHoldings = _7.apply(void 0, [(_16.sent()).toString()]);
                    _8 = util_mjs_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf((0, util_mjs_1.getAddress)(contracts_mjs_1.default.characterFactory))];
                case 48:
                    characterFactoryHoldings = _8.apply(void 0, [(_16.sent()).toString()]);
                    _9 = util_mjs_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf((0, util_mjs_1.getAddress)(contracts_mjs_1.default.lockedLiquidityAddress))];
                case 49:
                    lockedLiquidityHoldings = _9.apply(void 0, [(_16.sent()).toString()]) * 0.61;
                    _10 = util_mjs_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf((0, util_mjs_1.getAddress)(contracts_mjs_1.default.v2LiquidityAddress))];
                case 50:
                    v2LiquidityHoldings = _10.apply(void 0, [(_16.sent()).toString()]) * 0.99;
                    _11 = util_mjs_1.toShort;
                    return [4 /*yield*/, tokenContract.balanceOf((0, util_mjs_1.getAddress)(contracts_mjs_1.default.evolutionAddress))];
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
                    if (!runes[symbol])
                        runes[symbol] = {};
                    runes[symbol].totalSupply = totalSupply;
                    runes[symbol].circulatingSupply = circulatingSupply;
                    runes[symbol].totalBurned = totalBurned;
                    runes[symbol].holders = {};
                    runes[symbol].holders.raid = raidHoldings;
                    runes[symbol].holders.vault = vaultHoldings;
                    runes[symbol].holders.vault2 = vault2Holdings;
                    runes[symbol].holders.vault3 = vault3Holdings;
                    runes[symbol].holders.vaultTotal = vaultTotalHoldings;
                    runes[symbol].holders.characterFactory = characterFactoryHoldings;
                    runes[symbol].holders.dev = devHoldings;
                    runes[symbol].holders.charity = charityHoldings;
                    runes[symbol].holders.deployer = deployerHoldings;
                    runes[symbol].holders.bot = botHoldings;
                    runes[symbol].holders.bot2 = bot2Holdings;
                    runes[symbol].holders.bot3 = bot3Holdings;
                    runes[symbol].holders.botTotal = botTotalHoldings;
                    runes[symbol].holders.lockedLiquidity = lockedLiquidityHoldings;
                    runes[symbol].holders.v2Liquidity = v2LiquidityHoldings;
                    runes[symbol].holders.orgCash = orgCashHoldings;
                    runes[symbol].holders.orgToken = orgTokenHoldings;
                    runes[symbol].holders.org = orgHoldings;
                    runes[symbol].holders.evolution = evolutionHoldings;
                    if (!historical.totalSupply)
                        historical.totalSupply = {};
                    if (!historical.totalSupply[symbol])
                        historical.totalSupply[symbol] = [];
                    if (!historical.circulatingSupply)
                        historical.circulatingSupply = {};
                    if (!historical.circulatingSupply[symbol])
                        historical.circulatingSupply[symbol] = [];
                    if (!historical.totalBurned)
                        historical.totalBurned = {};
                    if (!historical.totalBurned[symbol])
                        historical.totalBurned[symbol] = [];
                    if (!historical.raid)
                        historical.raid = {};
                    if (!historical.raid.holdings)
                        historical.raid.holdings = {};
                    if (!historical.raid.holdings[symbol])
                        historical.raid.holdings[symbol] = [];
                    if (!historical.bot)
                        historical.bot = {};
                    if (!historical.bot.holdings)
                        historical.bot.holdings = {};
                    if (!historical.bot.holdings[symbol])
                        historical.bot.holdings[symbol] = [];
                    if (!historical.bot2)
                        historical.bot2 = {};
                    if (!historical.bot2.holdings)
                        historical.bot2.holdings = {};
                    if (!historical.bot2.holdings[symbol])
                        historical.bot2.holdings[symbol] = [];
                    if (!historical.bot3)
                        historical.bot3 = {};
                    if (!historical.bot3.holdings)
                        historical.bot3.holdings = {};
                    if (!historical.bot3.holdings[symbol])
                        historical.bot3.holdings[symbol] = [];
                    if (!historical.botTotal)
                        historical.botTotal = {};
                    if (!historical.botTotal.holdings)
                        historical.botTotal.holdings = {};
                    if (!historical.botTotal.holdings[symbol])
                        historical.botTotal.holdings[symbol] = [];
                    if (!historical.vault)
                        historical.vault = {};
                    if (!historical.vault.holdings)
                        historical.vault.holdings = {};
                    if (!historical.vault.holdings[symbol])
                        historical.vault.holdings[symbol] = [];
                    if (!historical.vault2)
                        historical.vault2 = {};
                    if (!historical.vault2.holdings)
                        historical.vault2.holdings = {};
                    if (!historical.vault2.holdings[symbol])
                        historical.vault2.holdings[symbol] = [];
                    if (!historical.vault3)
                        historical.vault3 = {};
                    if (!historical.vault3.holdings)
                        historical.vault3.holdings = {};
                    if (!historical.vault3.holdings[symbol])
                        historical.vault3.holdings[symbol] = [];
                    if (!historical.vaultTotal)
                        historical.vaultTotal = {};
                    if (!historical.vaultTotal.holdings)
                        historical.vaultTotal.holdings = {};
                    if (!historical.vaultTotal.holdings[symbol])
                        historical.vaultTotal.holdings[symbol] = [];
                    if (!historical.characterFactory)
                        historical.characterFactory = {};
                    if (!historical.characterFactory.holdings)
                        historical.characterFactory.holdings = {};
                    if (!historical.characterFactory.holdings[symbol])
                        historical.characterFactory.holdings[symbol] = [];
                    if (!historical.dev)
                        historical.dev = {};
                    if (!historical.dev.holdings)
                        historical.dev.holdings = {};
                    if (!historical.dev.holdings[symbol])
                        historical.dev.holdings[symbol] = [];
                    if (!historical.charity)
                        historical.charity = {};
                    if (!historical.charity.holdings)
                        historical.charity.holdings = {};
                    if (!historical.charity.holdings[symbol])
                        historical.charity.holdings[symbol] = [];
                    if (!historical.deployer)
                        historical.deployer = {};
                    if (!historical.deployer.holdings)
                        historical.deployer.holdings = {};
                    if (!historical.deployer.holdings[symbol])
                        historical.deployer.holdings[symbol] = [];
                    if (!historical.lockedLiquidity)
                        historical.lockedLiquidity = {};
                    if (!historical.lockedLiquidity.holdings)
                        historical.lockedLiquidity.holdings = {};
                    if (!historical.lockedLiquidity.holdings[symbol])
                        historical.lockedLiquidity.holdings[symbol] = [];
                    if (!historical.v2Liquidity)
                        historical.v2Liquidity = {};
                    if (!historical.v2Liquidity.holdings)
                        historical.v2Liquidity.holdings = {};
                    if (!historical.v2Liquidity.holdings[symbol])
                        historical.v2Liquidity.holdings[symbol] = [];
                    if (!historical.org)
                        historical.org = {};
                    if (!historical.org.holdings)
                        historical.org.holdings = {};
                    if (!historical.org.holdings[symbol])
                        historical.org.holdings[symbol] = [];
                    if (!historical.orgCash)
                        historical.orgCash = {};
                    if (!historical.orgCash.holdings)
                        historical.orgCash.holdings = {};
                    if (!historical.orgCash.holdings[symbol])
                        historical.orgCash.holdings[symbol] = [];
                    if (!historical.orgToken)
                        historical.orgToken = {};
                    if (!historical.orgToken.holdings)
                        historical.orgToken.holdings = {};
                    if (!historical.orgToken.holdings[symbol])
                        historical.orgToken.holdings[symbol] = [];
                    if (!historical.evolution)
                        historical.evolution = {};
                    if (!historical.evolution.holdings)
                        historical.evolution.holdings = {};
                    if (!historical.evolution.holdings[symbol])
                        historical.evolution.holdings[symbol] = [];
                    oldTime = (new Date(((_c = historical.totalSupply[symbol][historical.totalSupply[symbol].length - 1]) === null || _c === void 0 ? void 0 : _c[0]) || 0)).getTime();
                    newTime = (new Date()).getTime();
                    diff = newTime - oldTime;
                    if (diff / (1000 * 60 * 60 * 24) > 1) {
                        historical.totalSupply[symbol].push([newTime, totalSupply]);
                        historical.circulatingSupply[symbol].push([newTime, circulatingSupply]);
                        historical.totalBurned[symbol].push([newTime, totalBurned]);
                        historical.raid.holdings[symbol].push([newTime, raidHoldings]);
                        historical.bot.holdings[symbol].push([newTime, botHoldings]);
                        historical.bot2.holdings[symbol].push([newTime, bot2Holdings]);
                        historical.bot3.holdings[symbol].push([newTime, bot3Holdings]);
                        historical.botTotal.holdings[symbol].push([newTime, botTotalHoldings]);
                        historical.vault.holdings[symbol].push([newTime, vaultHoldings]);
                        historical.vault2.holdings[symbol].push([newTime, vault2Holdings]);
                        historical.vault3.holdings[symbol].push([newTime, vault3Holdings]);
                        historical.vaultTotal.holdings[symbol].push([newTime, vaultTotalHoldings]);
                        historical.characterFactory.holdings[symbol].push([newTime, characterFactoryHoldings]);
                        historical.dev.holdings[symbol].push([newTime, devHoldings]);
                        historical.charity.holdings[symbol].push([newTime, charityHoldings]);
                        historical.deployer.holdings[symbol].push([newTime, deployerHoldings]);
                        historical.lockedLiquidity.holdings[symbol].push([newTime, lockedLiquidityHoldings]);
                        historical.v2Liquidity.holdings[symbol].push([newTime, v2LiquidityHoldings]);
                        historical.org.holdings[symbol].push([newTime, orgHoldings]);
                        historical.orgCash.holdings[symbol].push([newTime, orgCashHoldings]);
                        historical.orgToken.holdings[symbol].push([newTime, orgTokenHoldings]);
                        historical.evolution.holdings[symbol].push([newTime, evolutionHoldings]);
                    }
                    _16.label = 52;
                case 52: return [3 /*break*/, 54];
                case 53:
                    e_14 = _16.sent();
                    console.log(e_14);
                    return [3 /*break*/, 54];
                case 54:
                    _w++;
                    return [3 /*break*/, 36];
                case 55:
                    runes.totals = {};
                    runes.totals.raid = 0;
                    runes.totals.vault = 0;
                    runes.totals.vault2 = 0;
                    runes.totals.vault3 = 0;
                    runes.totals.vaultTotal = 0;
                    runes.totals.characterFactory = 0;
                    runes.totals.dev = 0;
                    runes.totals.charity = 0;
                    runes.totals.deployer = 0;
                    runes.totals.bot = 0;
                    runes.totals.bot2 = 0;
                    runes.totals.bot3 = 0;
                    runes.totals.botTotal = 0;
                    runes.totals.lockedLiquidity = 0;
                    runes.totals.v2Liquidity = 0;
                    runes.totals.org = 0;
                    runes.totals.orgCash = 0;
                    runes.totals.orgToken = 0;
                    runes.totals.evolution = 0;
                    for (_12 = 0, _13 = Object.keys(runes); _12 < _13.length; _12++) {
                        rune = _13[_12];
                        // if (rune === 'totals') continue
                        if (runes[rune].holders) {
                            runes.totals.raid += runes[rune].holders.raid * runes[rune].price;
                            runes.totals.vault += runes[rune].holders.vault * runes[rune].price;
                            runes.totals.vault2 += runes[rune].holders.vault2 * runes[rune].price;
                            runes.totals.vault3 += runes[rune].holders.vault3 * runes[rune].price;
                            runes.totals.vaultTotal += runes[rune].holders.vaultTotal * runes[rune].price;
                            runes.totals.characterFactory += runes[rune].holders.characterFactory * runes[rune].price;
                            runes.totals.dev += runes[rune].holders.dev * runes[rune].price;
                            runes.totals.charity += runes[rune].holders.charity * runes[rune].price;
                            runes.totals.deployer += runes[rune].holders.deployer * runes[rune].price;
                            runes.totals.bot += runes[rune].holders.bot * runes[rune].price;
                            runes.totals.bot2 += runes[rune].holders.bot2 * runes[rune].price;
                            runes.totals.bot3 += runes[rune].holders.bot3 * runes[rune].price;
                            runes.totals.botTotal += runes[rune].holders.botTotal * runes[rune].price;
                            runes.totals.lockedLiquidity += runes[rune].holders.lockedLiquidity * runes[rune].price;
                            runes.totals.v2Liquidity += runes[rune].holders.v2Liquidity * runes[rune].price;
                            runes.totals.org += runes[rune].holders.org * runes[rune].price;
                            runes.totals.orgToken += runes[rune].holders.orgToken * runes[rune].price;
                            runes.totals.orgCash += runes[rune].holders.orgCash;
                            // if (rune === 'BUSD' || rune === 'USDT' || rune === 'USDC') {
                            // }
                        }
                    }
                    if (!historical.total)
                        historical.total = {};
                    if (!historical.total.totals)
                        historical.total.totals = {};
                    for (_14 = 0, _15 = Object.keys(runes.totals); _14 < _15.length; _14++) {
                        symbol = _15[_14];
                        if (!historical.total.totals[symbol])
                            historical.total.totals[symbol] = [];
                        oldTime = (new Date(((_d = historical.total.totals[symbol][historical.total.totals[symbol].length - 1]) === null || _d === void 0 ? void 0 : _d[0]) || 0)).getTime();
                        newTime = (new Date()).getTime();
                        diff = newTime - oldTime;
                        if (diff / (1000 * 60 * 60 * 24) > 1) {
                            historical.total.totals[symbol].push([newTime, runes.totals[symbol]]);
                        }
                    }
                    // await saveConfig()
                    setTimeout(monitorGeneralStats, 2 * 60 * 1000);
                    return [3 /*break*/, 57];
                case 56:
                    e_15 = _16.sent();
                    console.log(e_15);
                    return [3 /*break*/, 57];
                case 57: return [2 /*return*/];
            }
        });
    });
}
function median(values) {
    if (values.length === 0)
        return 0;
    values.sort(function (a, b) {
        return a - b;
    });
    var half = Math.floor(values.length / 2);
    if (values.length % 2)
        return values[half];
    return (values[half - 1] + values[half]) / 2.0;
}
function monitorCraftingStats() {
    return __awaiter(this, void 0, void 0, function () {
        var craftersData, craftingCompetition1Data, craftingCompetition2Data, craftingCompetition3Data, data;
        return __generator(this, function (_a) {
            // Update crafting competitions
            {
                console.log('Update crafting competitions');
                craftersData = fs_jetpack_1.default.read(path_1.default.resolve('./db/crafting/overall.json'), 'json');
                craftingCompetition1Data = fs_jetpack_1.default.read(path_1.default.resolve('./db/crafting/competition1.json'), 'json');
                craftingCompetition2Data = fs_jetpack_1.default.read(path_1.default.resolve('./db/crafting/competition2.json'), 'json');
                craftingCompetition3Data = fs_jetpack_1.default.read(path_1.default.resolve('./db/crafting/competition3.json'), 'json');
                data = {
                    all: [
                        { name: 'Overall', count: 10, data: craftersData.total },
                        { name: 'Genesis', count: 3, data: craftersData.genesis },
                        { name: 'Destiny', count: 3, data: craftersData.destiny },
                        { name: 'Grace', count: 3, data: craftersData.grace },
                        { name: 'Glory', count: 3, data: craftersData.glory },
                        { name: 'Titan', count: 3, data: craftersData.titan },
                        { name: 'Smoke', count: 3, data: craftersData.smoke },
                        { name: 'Flash', count: 3, data: craftersData.flash },
                        { name: 'Lorekeeper', count: 3, data: craftersData.lorekeeper },
                        { name: 'Fury', count: 3, data: craftersData.fury },
                        { name: 'Steel', count: 3, data: craftersData.steel },
                    ],
                    competition1: [
                        { name: 'Overall', count: 10, data: craftingCompetition1Data.total },
                        { name: 'Titan', count: 3, data: craftingCompetition1Data.titan },
                        { name: 'Smoke', count: 3, data: craftingCompetition1Data.smoke },
                        { name: 'Flash', count: 3, data: craftingCompetition1Data.flash },
                    ],
                    competition2: [
                        { name: 'Overall', count: 10, data: craftingCompetition2Data.total },
                        { name: 'Destiny', count: 3, data: craftingCompetition2Data.destiny },
                        { name: 'Grace', count: 3, data: craftingCompetition2Data.grace },
                        { name: 'Glory', count: 3, data: craftingCompetition2Data.glory },
                        { name: 'Titan', count: 3, data: craftingCompetition2Data.titan },
                        { name: 'Flash', count: 3, data: craftingCompetition2Data.flash },
                        { name: 'Fury', count: 3, data: craftingCompetition2Data.fury },
                    ],
                    competition3: [
                        { name: 'Overall', count: 10, data: craftingCompetition3Data.total },
                        { name: 'Fury', count: 3, data: craftingCompetition3Data.fury },
                        { name: 'Flash', count: 3, data: craftingCompetition3Data.flash },
                        { name: 'Titan', count: 3, data: craftingCompetition3Data.titan },
                        { name: 'Glory', count: 3, data: craftingCompetition3Data.glory },
                        { name: 'Grace', count: 3, data: craftingCompetition3Data.grace },
                        { name: 'Genesis', count: 3, data: craftingCompetition3Data.genesis },
                        { name: 'Destiny', count: 3, data: craftingCompetition3Data.destiny },
                        { name: 'Wrath', count: 3, data: craftingCompetition3Data.wrath },
                        { name: 'Fortress', count: 3, data: craftingCompetition3Data.fortress },
                        { name: 'Elder', count: 3, data: craftingCompetition3Data.elder },
                        { name: 'Pledge', count: 3, data: craftingCompetition3Data.pledge }
                    ],
                    competition4: []
                };
                fs_jetpack_1.default.write(path_1.default.resolve('./db/crafting/leaderboard.json'), (0, json_beautify_1.default)(data, null, 2), { atomic: true });
            }
            setTimeout(monitorCraftingStats, 2 * 60 * 1000);
            return [2 /*return*/];
        });
    });
}
function findPrice(symbol, timestamp) {
    for (var i = 1; i < historical.price[symbol].length; i++) {
        if (historical.price[symbol][i][0] > timestamp * 1000) {
            return historical.price[symbol][i][1];
        }
    }
    return stats.prices[symbol];
}
function monitorEvolutionStats() {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function () {
        var playerRoundWinners, playerRewardWinners, leaderboards, evolutionPlayers, mapAddressToUsername, _loop_6, _i, evolutionServers_2, server, _f, evolutionPlayers_1, player, user, latency, key, server, _g, _h, statKey, _j, _k, statKey, _l, _m, statKey, _loop_7, _o, evolutionPlayers_2, player, e_16, _p, evolutionServers_3, server, data, _q, _r, round_4, _s, round_1, player, _t, evolutionServers_4, server, stats_1, playerLatencyList, winnerLatencyList, _u, _v, round_5, winner, _w, round_2, player, _x, round_3, player, _loop_8, _y, evolutionServers_5, server, e_17, _z, evolutionServers_6, server, rand, response, data, e_18, e_19, _0, evolutionServers_7, server, rand, response, data, _1, data_1, banItem, user, e_20, e_21, _2, evolutionServers_8, server, rand, response, data, e_22, e_23, _3, evolutionServers_9, server, rand, response, data, e_24, e_25, _4, evolutionServers_10, server, rand, response, data, e_26, e_27, _loop_9, _5, evolutionServers_11, server;
        return __generator(this, function (_6) {
            switch (_6.label) {
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
                    _6.label = 1;
                case 1:
                    _6.trys.push([1, 14, , 15]);
                    console.log('Update evolution leaderboard history');
                    evolutionPlayers = fs_jetpack_1.default.read(path_1.default.resolve("./db/evolution/players.json"), 'json') || [];
                    mapAddressToUsername = {};
                    _loop_6 = function (server) {
                        var leaderboardHistory, rand, response, data, lastIndex, lastRoundItem, i, dupChecker_1, recentPlayerAddresses, i, j, playerAddresses, _loop_10, _7, playerAddresses_1, address, _8, _9, statKey, _10, _11, statKey, _loop_11, _12, playerAddresses_2, address, e_28;
                        return __generator(this, function (_13) {
                            switch (_13.label) {
                                case 0:
                                    if (server.status !== 'online')
                                        return [2 /*return*/, "continue"];
                                    console.log('Server', server.key);
                                    _13.label = 1;
                                case 1:
                                    _13.trys.push([1, 14, , 15]);
                                    leaderboardHistory = fs_jetpack_1.default.read(path_1.default.resolve("./db/evolution/".concat(server.key, "/leaderboardHistory.json")), 'json') || [];
                                    rand = Math.floor(Math.random() * Math.floor(999999));
                                    return [4 /*yield*/, (0, node_fetch_1.default)("https://".concat(server.endpoint, "/data/leaderboardHistory.json?").concat(rand))];
                                case 2:
                                    response = _13.sent();
                                    fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/".concat(server.key, "/leaderboardHistoryLiveLatest.json")), (0, json_beautify_1.default)(leaderboardHistory, null, 2), { atomic: true });
                                    return [4 /*yield*/, response.json()];
                                case 3:
                                    data = _13.sent();
                                    lastIndex = 0;
                                    if (leaderboardHistory.length > 0) {
                                        lastRoundItem = leaderboardHistory.slice(leaderboardHistory.length - 10).reverse().filter(function (r) { return r.filter(function (p) { return p.name.indexOf('Unknown') !== 0; }).length > 0; })[0];
                                        // console.log('Last round', lastRoundItem)
                                        for (i = 0; i < data.length; i++) {
                                            if (!data[i].length || !data[i][0])
                                                continue;
                                            // if (data[i][0].name.indexOf('Unknown') === 0) continue
                                            if (data[i].length === lastRoundItem.length && data[i][0].joinedAt === lastRoundItem[0].joinedAt && data[i][0].id === lastRoundItem[0].id && (typeof (data[i][0].position) === 'string' || !data[i][0].position ? data[i][0].position : data[i][0].position.x.toFixed(4) === lastRoundItem[0].position.x.toFixed(4) && data[i][0].position.y.toFixed(4) === lastRoundItem[0].position.y.toFixed(4))) { //  && data[i][0].position === lastRoundItem[0].position
                                                lastIndex = i;
                                            }
                                        }
                                    }
                                    console.log('Starting from', lastIndex, server.key);
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
                                    _loop_10 = function (address) {
                                        var user, winStreak, savedWinStreak, rounds, wins, kills, deaths, powerups, evolves, points, rewards, orbs, revenges, latency, hashHistory, hashHistory2, _14, leaderboardHistory_1, round_7, currentPlayer, wasConnected, wasActive, _15, _16, hash, _17, round_6, player, winner, _18, _19, statKey, e_29;
                                        return __generator(this, function (_20) {
                                            switch (_20.label) {
                                                case 0:
                                                    if (address.toLowerCase() === "0xc84ce216fef4EC8957bD0Fb966Bb3c3E2c938082".toLowerCase() ||
                                                        address.toLowerCase() === "0xa987f487639920A3c2eFe58C8FBDedB96253ed9B".toLowerCase())
                                                        return [2 /*return*/, "continue"];
                                                    _20.label = 1;
                                                case 1:
                                                    _20.trys.push([1, 3, , 4]);
                                                    user = loadUser(address);
                                                    if (address === '0x9aAe5CBe5C124e1BE62BD83eD07367d57F8998E0') {
                                                        console.log(user);
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
                                                        for (_14 = 0, leaderboardHistory_1 = leaderboardHistory; _14 < leaderboardHistory_1.length; _14++) {
                                                            round_7 = leaderboardHistory_1[_14];
                                                            if (round_7.length === 0)
                                                                continue;
                                                            currentPlayer = round_7.find(function (r) { return r.address === address; });
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
                                                                    for (_15 = 0, _16 = currentPlayer.log.kills; _15 < _16.length; _15++) {
                                                                        hash = _16[_15];
                                                                        if (!hashHistory[hash])
                                                                            hashHistory[hash] = 0;
                                                                        hashHistory[hash]++;
                                                                    }
                                                                    for (_17 = 0, round_6 = round_7; _17 < round_6.length; _17++) {
                                                                        player = round_6[_17];
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
                                                            winner = round_7.sort((function (a, b) { return b.points - a.points; }))[0];
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
                                                        user.evolution.servers[server.key].averageLatency = rounds >= 5 ? average(latency) : 0;
                                                        user.evolution.servers[server.key].timeSpent = parseFloat((rounds * 5 / 60).toFixed(1));
                                                        user.evolution.servers[server.key].hashHistory = hashHistory;
                                                        user.evolution.servers[server.key].hashHistory2 = hashHistory2;
                                                        for (_18 = 0, _19 = ['kills', 'deaths', 'powerups', 'evolves', 'points', 'rewards', 'orbs', 'revenges', 'rounds', 'wins', 'timeSpent', 'winRatio', 'killDeathRatio', 'roundPointRatio', 'averageLatency']; _18 < _19.length; _18++) {
                                                            statKey = _19[_18];
                                                            leaderboards[server.key][statKey].push({
                                                                name: mapAddressToUsername[user.address],
                                                                address: user.address,
                                                                count: user.evolution.servers[server.key][statKey]
                                                            });
                                                        }
                                                    }
                                                    user.evolution.lastUpdated = (new Date()).getTime();
                                                    if (address === '0x9aAe5CBe5C124e1BE62BD83eD07367d57F8998E0') {
                                                        console.log(user);
                                                    }
                                                    return [4 /*yield*/, saveUser(user)];
                                                case 2:
                                                    _20.sent();
                                                    return [3 /*break*/, 4];
                                                case 3:
                                                    e_29 = _20.sent();
                                                    console.log(e_29);
                                                    return [3 /*break*/, 4];
                                                case 4: return [2 /*return*/];
                                            }
                                        });
                                    };
                                    _7 = 0, playerAddresses_1 = playerAddresses;
                                    _13.label = 5;
                                case 5:
                                    if (!(_7 < playerAddresses_1.length)) return [3 /*break*/, 8];
                                    address = playerAddresses_1[_7];
                                    return [5 /*yield**/, _loop_10(address)];
                                case 6:
                                    _13.sent();
                                    _13.label = 7;
                                case 7:
                                    _7++;
                                    return [3 /*break*/, 5];
                                case 8:
                                    for (_8 = 0, _9 = ['kills', 'deaths', 'powerups', 'evolves', 'points', 'rewards', 'orbs', 'revenges', 'rounds', 'wins', 'timeSpent', 'winRatio', 'killDeathRatio', 'roundPointRatio']; _8 < _9.length; _8++) {
                                        statKey = _9[_8];
                                        leaderboards[server.key][statKey] = leaderboards[server.key][statKey].filter(function (a) { return !!a.count; }).sort(function (a, b) { return b.count - a.count; });
                                    }
                                    for (_10 = 0, _11 = ['averageLatency']; _10 < _11.length; _10++) {
                                        statKey = _11[_10];
                                        leaderboards[server.key][statKey] = leaderboards[server.key][statKey].filter(function (a) { return !!a.count; }).sort(function (a, b) { return a.count - b.count; });
                                    }
                                    _loop_11 = function (address) {
                                        var user, _21, _22, statKey;
                                        return __generator(this, function (_23) {
                                            switch (_23.label) {
                                                case 0:
                                                    if (address.toLowerCase() === "0xc84ce216fef4EC8957bD0Fb966Bb3c3E2c938082".toLowerCase())
                                                        return [2 /*return*/, "continue"];
                                                    user = loadUser(address);
                                                    if (!user.evolution.servers[server.key])
                                                        user.evolution.servers[server.key] = {};
                                                    user.evolution.servers[server.key].ranking = {};
                                                    for (_21 = 0, _22 = ['kills', 'deaths', 'powerups', 'evolves', 'points', 'rewards', 'orbs', 'revenges', 'rounds', 'wins', 'timeSpent', 'winRatio', 'killDeathRatio', 'roundPointRatio', 'averageLatency']; _21 < _22.length; _21++) {
                                                        statKey = _22[_21];
                                                        user.evolution.servers[server.key].ranking[statKey] = {
                                                            position: leaderboards[server.key][statKey].findIndex(function (item) { return item.address == user.address; }) + 1,
                                                            total: leaderboards[server.key][statKey].length
                                                        };
                                                    }
                                                    return [4 /*yield*/, saveUser(user)];
                                                case 1:
                                                    _23.sent();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    };
                                    _12 = 0, playerAddresses_2 = playerAddresses;
                                    _13.label = 9;
                                case 9:
                                    if (!(_12 < playerAddresses_2.length)) return [3 /*break*/, 12];
                                    address = playerAddresses_2[_12];
                                    return [5 /*yield**/, _loop_11(address)];
                                case 10:
                                    _13.sent();
                                    _13.label = 11;
                                case 11:
                                    _12++;
                                    return [3 /*break*/, 9];
                                case 12:
                                    leaderboards[server.key].lastUpdated = (new Date()).getTime();
                                    fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/".concat(server.key, "/leaderboard2.json")), (0, json_beautify_1.default)(leaderboards[server.key], null, 2), { atomic: true });
                                    _13.label = 13;
                                case 13: return [3 /*break*/, 15];
                                case 14:
                                    e_28 = _13.sent();
                                    console.log(e_28);
                                    return [3 /*break*/, 15];
                                case 15: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, evolutionServers_2 = evolutionServers;
                    _6.label = 2;
                case 2:
                    if (!(_i < evolutionServers_2.length)) return [3 /*break*/, 5];
                    server = evolutionServers_2[_i];
                    return [5 /*yield**/, _loop_6(server)];
                case 3:
                    _6.sent();
                    _6.label = 4;
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
                    _f = 0, evolutionPlayers_1 = evolutionPlayers;
                    _6.label = 6;
                case 6:
                    if (!(_f < evolutionPlayers_1.length)) return [3 /*break*/, 9];
                    player = evolutionPlayers_1[_f];
                    user = loadUser(player.address);
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
                    user.evolution.overall.averageLatency = latency.length > 0 ? average(latency) : 0;
                    for (_g = 0, _h = ['kills', 'deaths', 'powerups', 'evolves', 'points', 'rewards', 'orbs', 'revenges', 'rounds', 'wins', 'timeSpent', 'winRatio', 'killDeathRatio', 'roundPointRatio', 'averageLatency']; _g < _h.length; _g++) {
                        statKey = _h[_g];
                        if (user.evolution.overall[statKey] && user.evolution.overall[statKey] > 0 && user.evolution.overall[statKey] !== null) {
                            leaderboards.overall[statKey].push({
                                name: mapAddressToUsername[user.address],
                                address: user.address,
                                count: user.evolution.overall[statKey]
                            });
                        }
                    }
                    return [4 /*yield*/, saveUser(user)];
                case 7:
                    _6.sent();
                    _6.label = 8;
                case 8:
                    _f++;
                    return [3 /*break*/, 6];
                case 9:
                    // Sort descending
                    for (_j = 0, _k = ['kills', 'deaths', 'powerups', 'evolves', 'points', 'rewards', 'orbs', 'revenges', 'rounds', 'wins', 'timeSpent', 'winRatio', 'killDeathRatio', 'roundPointRatio']; _j < _k.length; _j++) {
                        statKey = _k[_j];
                        leaderboards.overall[statKey] = leaderboards.overall[statKey].filter(function (a) { return !!a.count; }).sort(function (a, b) { return b.count - a.count; });
                    }
                    // Sort ascending
                    for (_l = 0, _m = ['averageLatency']; _l < _m.length; _l++) {
                        statKey = _m[_l];
                        leaderboards.overall[statKey] = leaderboards.overall[statKey].filter(function (a) { return !!a.count; }).sort(function (a, b) { return a.count - b.count; });
                    }
                    _loop_7 = function (player) {
                        var user, _24, _25, statKey;
                        return __generator(this, function (_26) {
                            switch (_26.label) {
                                case 0:
                                    user = loadUser(player.address);
                                    if (!user.evolution)
                                        user.evolution = {};
                                    if (!user.evolution.overall)
                                        user.evolution.overall = {};
                                    user.evolution.overall.ranking = {};
                                    for (_24 = 0, _25 = ['kills', 'deaths', 'powerups', 'evolves', 'points', 'rewards', 'orbs', 'revenges', 'rounds', 'wins', 'timeSpent', 'winRatio', 'killDeathRatio', 'roundPointRatio', 'averageLatency']; _24 < _25.length; _24++) {
                                        statKey = _25[_24];
                                        user.evolution.overall.ranking[statKey] = {
                                            position: leaderboards.overall[statKey].findIndex(function (item) { return item.address == user.address; }) + 1,
                                            total: leaderboards.overall[statKey].length
                                        };
                                    }
                                    return [4 /*yield*/, saveUser(user)];
                                case 1:
                                    _26.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _o = 0, evolutionPlayers_2 = evolutionPlayers;
                    _6.label = 10;
                case 10:
                    if (!(_o < evolutionPlayers_2.length)) return [3 /*break*/, 13];
                    player = evolutionPlayers_2[_o];
                    return [5 /*yield**/, _loop_7(player)];
                case 11:
                    _6.sent();
                    _6.label = 12;
                case 12:
                    _o++;
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
                    e_16 = _6.sent();
                    console.log(e_16);
                    return [3 /*break*/, 15];
                case 15:
                    // Update evolution hash map
                    try {
                        console.log('Update evolution hash map');
                        for (_p = 0, evolutionServers_3 = evolutionServers; _p < evolutionServers_3.length; _p++) {
                            server = evolutionServers_3[_p];
                            if (server.status !== 'online')
                                continue;
                            if (!playerRoundWinners[server.key])
                                continue;
                            console.log('Server', server.key);
                            try {
                                data = {
                                    toName: {},
                                    toHash: {}
                                };
                                for (_q = 0, _r = playerRoundWinners[server.key]; _q < _r.length; _q++) {
                                    round_4 = _r[_q];
                                    if (server.status !== 'online')
                                        continue;
                                    for (_s = 0, round_1 = round_4; _s < round_1.length; _s++) {
                                        player = round_1[_s];
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
                                console.log(e);
                            }
                        }
                    }
                    catch (e) {
                        console.log(e);
                    }
                    // Update evolution stats
                    try {
                        console.log('Update evolution stats');
                        for (_t = 0, evolutionServers_4 = evolutionServers; _t < evolutionServers_4.length; _t++) {
                            server = evolutionServers_4[_t];
                            if (server.status !== 'online')
                                continue;
                            if (!playerRoundWinners[server.key])
                                continue;
                            try {
                                stats_1 = {
                                    averagePlayerLatency: 0,
                                    averageWinnerLatency: 0,
                                    medianPlayerLatency: 0,
                                    medianWinnerLatency: 0
                                };
                                playerLatencyList = [];
                                winnerLatencyList = [];
                                for (_u = 0, _v = playerRoundWinners[server.key]; _u < _v.length; _u++) {
                                    round_5 = _v[_u];
                                    if (server.status !== 'online')
                                        continue;
                                    winner = void 0;
                                    for (_w = 0, round_2 = round_5; _w < round_2.length; _w++) {
                                        player = round_2[_w];
                                        if (!player.isDead && !player.isSpectating && player.latency && player.latency > 5 && player.latency < 600) {
                                            if (!winner || (player.winner && winner.winner && player.winner.points > winner.winner.points)) {
                                                winner = player;
                                            }
                                        }
                                    }
                                    for (_x = 0, round_3 = round_5; _x < round_3.length; _x++) {
                                        player = round_3[_x];
                                        if (!player.isDead && !player.isSpectating && player.latency && player.latency > 5 && player.latency < 600 && winner !== player) {
                                            playerLatencyList.push(player.latency);
                                        }
                                    }
                                    if (winner) {
                                        winnerLatencyList.push(winner.latency);
                                    }
                                }
                                stats_1.medianPlayerLatency = median(playerLatencyList);
                                stats_1.medianWinnerLatency = median(winnerLatencyList);
                                stats_1.averagePlayerLatency = average(playerLatencyList);
                                stats_1.averageWinnerLatency = average(winnerLatencyList);
                                fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/".concat(server.key, "/stats.json")), (0, json_beautify_1.default)(stats_1, null, 2), { atomic: true });
                            }
                            catch (e) {
                                console.log(e);
                            }
                        }
                    }
                    catch (e) {
                        console.log(e);
                    }
                    _6.label = 16;
                case 16:
                    _6.trys.push([16, 21, , 22]);
                    console.log('Update evolution reward history');
                    _loop_8 = function (server) {
                        var rewardHistory, rand, response, dupChecker_2, data, lastIndex, lastRewardItem, i, _27, data_2, win, e_30;
                        return __generator(this, function (_28) {
                            switch (_28.label) {
                                case 0:
                                    if (server.status !== 'online')
                                        return [2 /*return*/, "continue"];
                                    console.log('Server', server.key);
                                    _28.label = 1;
                                case 1:
                                    _28.trys.push([1, 4, , 5]);
                                    rewardHistory = fs_jetpack_1.default.read(path_1.default.resolve("./db/evolution/".concat(server.key, "/rewardHistory.json")), 'json') || [];
                                    rand = Math.floor(Math.random() * Math.floor(999999));
                                    return [4 /*yield*/, (0, node_fetch_1.default)("https://".concat(server.endpoint, "/data/rewardHistory.json?").concat(rand))];
                                case 2:
                                    response = _28.sent();
                                    dupChecker_2 = {};
                                    return [4 /*yield*/, response.json()];
                                case 3:
                                    data = _28.sent();
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
                                    console.log('Starting from', lastIndex);
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
                                        for (_27 = 0, data_2 = data; _27 < data_2.length; _27++) {
                                            win = data_2[_27];
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
                                                win.monetary = findPrice(win.symbol, win.winner.lastUpdate) * win.quantity;
                                            }
                                        }
                                        fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/".concat(server.key, "/rewardHistory.json")), (0, json_beautify_1.default)(data, null, 2), { atomic: true });
                                        playerRewardWinners[server.key] = data;
                                    }
                                    return [3 /*break*/, 5];
                                case 4:
                                    e_30 = _28.sent();
                                    console.log(e_30);
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    };
                    _y = 0, evolutionServers_5 = evolutionServers;
                    _6.label = 17;
                case 17:
                    if (!(_y < evolutionServers_5.length)) return [3 /*break*/, 20];
                    server = evolutionServers_5[_y];
                    return [5 /*yield**/, _loop_8(server)];
                case 18:
                    _6.sent();
                    _6.label = 19;
                case 19:
                    _y++;
                    return [3 /*break*/, 17];
                case 20: return [3 /*break*/, 22];
                case 21:
                    e_17 = _6.sent();
                    console.log(e_17);
                    return [3 /*break*/, 22];
                case 22:
                    _6.trys.push([22, 30, , 31]);
                    console.log('Update evolution rewards');
                    _z = 0, evolutionServers_6 = evolutionServers;
                    _6.label = 23;
                case 23:
                    if (!(_z < evolutionServers_6.length)) return [3 /*break*/, 29];
                    server = evolutionServers_6[_z];
                    if (server.status !== 'online')
                        return [3 /*break*/, 28];
                    console.log('Server', server.key);
                    _6.label = 24;
                case 24:
                    _6.trys.push([24, 27, , 28]);
                    rand = Math.floor(Math.random() * Math.floor(999999));
                    return [4 /*yield*/, (0, node_fetch_1.default)("https://".concat(server.endpoint, "/data/rewards.json?").concat(rand))];
                case 25:
                    response = _6.sent();
                    return [4 /*yield*/, response.json()];
                case 26:
                    data = _6.sent();
                    fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/".concat(server.key, "/rewards.json")), (0, json_beautify_1.default)(data, null, 2), { atomic: true });
                    return [3 /*break*/, 28];
                case 27:
                    e_18 = _6.sent();
                    console.log(e_18);
                    return [3 /*break*/, 28];
                case 28:
                    _z++;
                    return [3 /*break*/, 23];
                case 29: return [3 /*break*/, 31];
                case 30:
                    e_19 = _6.sent();
                    console.log(e_19);
                    return [3 /*break*/, 31];
                case 31:
                    _6.trys.push([31, 43, , 44]);
                    console.log('Update evolution ban list');
                    _0 = 0, evolutionServers_7 = evolutionServers;
                    _6.label = 32;
                case 32:
                    if (!(_0 < evolutionServers_7.length)) return [3 /*break*/, 42];
                    server = evolutionServers_7[_0];
                    if (server.status !== 'online')
                        return [3 /*break*/, 41];
                    console.log('Server', server.key);
                    _6.label = 33;
                case 33:
                    _6.trys.push([33, 40, , 41]);
                    rand = Math.floor(Math.random() * Math.floor(999999));
                    return [4 /*yield*/, (0, node_fetch_1.default)("https://".concat(server.endpoint, "/data/banList.json?").concat(rand))];
                case 34:
                    response = _6.sent();
                    return [4 /*yield*/, response.json()];
                case 35:
                    data = _6.sent();
                    fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/".concat(server.key, "/bans.json")), (0, json_beautify_1.default)(data, null, 2), { atomic: true });
                    _1 = 0, data_1 = data;
                    _6.label = 36;
                case 36:
                    if (!(_1 < data_1.length)) return [3 /*break*/, 39];
                    banItem = data_1[_1];
                    user = loadUser(banItem);
                    if (!user.evolution)
                        user.evolution = {};
                    if (!user.evolution.servers)
                        user.evolution.servers = {};
                    if (!user.evolution.servers[server.key])
                        user.evolution.servers[server.key] = {};
                    user.evolution.servers[server.key].isBanned = true;
                    user.evolution.isBanned = true;
                    return [4 /*yield*/, saveUser(user)];
                case 37:
                    _6.sent();
                    _6.label = 38;
                case 38:
                    _1++;
                    return [3 /*break*/, 36];
                case 39: return [3 /*break*/, 41];
                case 40:
                    e_20 = _6.sent();
                    console.log(e_20);
                    return [3 /*break*/, 41];
                case 41:
                    _0++;
                    return [3 /*break*/, 32];
                case 42: return [3 /*break*/, 44];
                case 43:
                    e_21 = _6.sent();
                    console.log(e_21);
                    return [3 /*break*/, 44];
                case 44:
                    _6.trys.push([44, 52, , 53]);
                    console.log('Update evolution player rewards');
                    _2 = 0, evolutionServers_8 = evolutionServers;
                    _6.label = 45;
                case 45:
                    if (!(_2 < evolutionServers_8.length)) return [3 /*break*/, 51];
                    server = evolutionServers_8[_2];
                    if (server.status !== 'online')
                        return [3 /*break*/, 50];
                    console.log('Server', server.key);
                    _6.label = 46;
                case 46:
                    _6.trys.push([46, 49, , 50]);
                    rand = Math.floor(Math.random() * Math.floor(999999));
                    return [4 /*yield*/, (0, node_fetch_1.default)("https://".concat(server.endpoint, "/data/playerRewards.json?").concat(rand))];
                case 47:
                    response = _6.sent();
                    return [4 /*yield*/, response.json()];
                case 48:
                    data = _6.sent();
                    fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/".concat(server.key, "/playerRewards.json")), (0, json_beautify_1.default)(data, null, 2), { atomic: true });
                    return [3 /*break*/, 50];
                case 49:
                    e_22 = _6.sent();
                    console.log(e_22);
                    return [3 /*break*/, 50];
                case 50:
                    _2++;
                    return [3 /*break*/, 45];
                case 51: return [3 /*break*/, 53];
                case 52:
                    e_23 = _6.sent();
                    console.log(e_23);
                    return [3 /*break*/, 53];
                case 53:
                    _6.trys.push([53, 61, , 62]);
                    console.log('Update evolution player rewards');
                    _3 = 0, evolutionServers_9 = evolutionServers;
                    _6.label = 54;
                case 54:
                    if (!(_3 < evolutionServers_9.length)) return [3 /*break*/, 60];
                    server = evolutionServers_9[_3];
                    if (server.status !== 'online')
                        return [3 /*break*/, 59];
                    console.log('Server', server.key);
                    _6.label = 55;
                case 55:
                    _6.trys.push([55, 58, , 59]);
                    rand = Math.floor(Math.random() * Math.floor(999999));
                    return [4 /*yield*/, (0, node_fetch_1.default)("https://".concat(server.endpoint, "/data/log.json?").concat(rand))];
                case 56:
                    response = _6.sent();
                    return [4 /*yield*/, response.json()];
                case 57:
                    data = _6.sent();
                    fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/".concat(server.key, "/log.json")), (0, json_beautify_1.default)(data, null, 2), { atomic: true });
                    return [3 /*break*/, 59];
                case 58:
                    e_24 = _6.sent();
                    console.log(e_24);
                    return [3 /*break*/, 59];
                case 59:
                    _3++;
                    return [3 /*break*/, 54];
                case 60: return [3 /*break*/, 62];
                case 61:
                    e_25 = _6.sent();
                    console.log(e_25);
                    return [3 /*break*/, 62];
                case 62:
                    _6.trys.push([62, 70, , 71]);
                    console.log('Update evolution player rewards');
                    _4 = 0, evolutionServers_10 = evolutionServers;
                    _6.label = 63;
                case 63:
                    if (!(_4 < evolutionServers_10.length)) return [3 /*break*/, 69];
                    server = evolutionServers_10[_4];
                    if (server.status !== 'online')
                        return [3 /*break*/, 68];
                    console.log('Server', server.key);
                    _6.label = 64;
                case 64:
                    _6.trys.push([64, 67, , 68]);
                    rand = Math.floor(Math.random() * Math.floor(999999));
                    return [4 /*yield*/, (0, node_fetch_1.default)("https://".concat(server.endpoint, "/data/playerReports.json?").concat(rand))];
                case 65:
                    response = _6.sent();
                    return [4 /*yield*/, response.json()];
                case 66:
                    data = _6.sent();
                    fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/".concat(server.key, "/playerReports.json")), (0, json_beautify_1.default)(data, null, 2), { atomic: true });
                    return [3 /*break*/, 68];
                case 67:
                    e_26 = _6.sent();
                    console.log(e_26);
                    return [3 /*break*/, 68];
                case 68:
                    _4++;
                    return [3 /*break*/, 63];
                case 69: return [3 /*break*/, 71];
                case 70:
                    e_27 = _6.sent();
                    console.log(e_27);
                    return [3 /*break*/, 71];
                case 71:
                    _loop_9 = function (server) {
                        var leaderboardHistory_2, roundsPlayed_1, _29, _30, round_9, _31, round_8, player, groupedWinPlayers_1, findUsername, evolutionEarningsDistributed, groupedRewardPlayers_1, _32, _33, reward, _34, _35, wins, _36, wins_1, win, quantity, monetary, _37, _38, address, user, earnings, _39, _40, s, hist, historicalEarnings, oldTime, newTime, diff, newTime, data, e_31;
                        return __generator(this, function (_41) {
                            switch (_41.label) {
                                case 0:
                                    if (server.status !== 'online')
                                        return [2 /*return*/, "continue"];
                                    if (!playerRoundWinners[server.key] || !Array.isArray(playerRewardWinners[server.key]))
                                        return [2 /*return*/, "continue"];
                                    console.log('Server', server.key);
                                    _41.label = 1;
                                case 1:
                                    _41.trys.push([1, 6, , 7]);
                                    leaderboardHistory_2 = fs_jetpack_1.default.read(path_1.default.resolve("./db/evolution/".concat(server.key, "/leaderboardHistory.json")), 'json') || [];
                                    roundsPlayed_1 = {};
                                    for (_29 = 0, _30 = playerRoundWinners[server.key]; _29 < _30.length; _29++) {
                                        round_9 = _30[_29];
                                        for (_31 = 0, round_8 = round_9; _31 < round_8.length; _31++) {
                                            player = round_8[_31];
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
                                    groupedWinPlayers_1 = groupBySub(playerRoundWinners[server.key].map(function (leaderboard) {
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
                                    for (_32 = 0, _33 = playerRewardWinners[server.key]; _32 < _33.length; _32++) {
                                        reward = _33[_32];
                                        // if (reward.winner.lastUpdate) continue // skip old winners
                                        if (!groupedRewardPlayers_1[reward.winner.address])
                                            groupedRewardPlayers_1[reward.winner.address] = { monetary: 0 };
                                        groupedRewardPlayers_1[reward.winner.address].address = reward.winner.address;
                                        groupedRewardPlayers_1[reward.winner.address].name = findUsername(reward.winner.address);
                                        groupedRewardPlayers_1[reward.winner.address].monetary += reward.monetary;
                                        evolutionEarningsDistributed += reward.monetary;
                                    }
                                    for (_34 = 0, _35 = Object.values(groupedWinPlayers_1); _34 < _35.length; _34++) {
                                        wins = _35[_34];
                                        for (_36 = 0, wins_1 = wins; _36 < wins_1.length; _36++) {
                                            win = wins_1[_36];
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
                                            monetary = findPrice('zod', win.winner.lastUpdate) * quantity;
                                            groupedRewardPlayers_1[win.winner.address].address = win.winner.address;
                                            groupedRewardPlayers_1[win.winner.address].name = findUsername(win.winner.address);
                                            groupedRewardPlayers_1[win.winner.address].monetary += monetary;
                                            evolutionEarningsDistributed += monetary;
                                        }
                                    }
                                    _37 = 0, _38 = Object.keys(groupedRewardPlayers_1);
                                    _41.label = 2;
                                case 2:
                                    if (!(_37 < _38.length)) return [3 /*break*/, 5];
                                    address = _38[_37];
                                    if (!(groupedRewardPlayers_1[address].monetary > 0)) return [3 /*break*/, 4];
                                    user = loadUser(address);
                                    if (!((_d = (_c = user === null || user === void 0 ? void 0 : user.evolution) === null || _c === void 0 ? void 0 : _c.servers) === null || _d === void 0 ? void 0 : _d[server.key])) return [3 /*break*/, 4];
                                    user.evolution.servers[server.key].earnings = groupedRewardPlayers_1[address].monetary;
                                    earnings = 0;
                                    for (_39 = 0, _40 = Object.keys(user.evolution.servers); _39 < _40.length; _39++) {
                                        s = _40[_39];
                                        if (Number.isFinite(user.evolution.servers[s].earnings))
                                            earnings += user.evolution.servers[s].earnings;
                                    }
                                    user.evolution.overall.earnings = earnings;
                                    return [4 /*yield*/, saveUser(user)];
                                case 3:
                                    _41.sent();
                                    _41.label = 4;
                                case 4:
                                    _37++;
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
                                        //       return b.count - a.count;
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
                                    e_31 = _41.sent();
                                    console.log(e_31);
                                    return [3 /*break*/, 7];
                                case 7: return [2 /*return*/];
                            }
                        });
                    };
                    _5 = 0, evolutionServers_11 = evolutionServers;
                    _6.label = 72;
                case 72:
                    if (!(_5 < evolutionServers_11.length)) return [3 /*break*/, 75];
                    server = evolutionServers_11[_5];
                    return [5 /*yield**/, _loop_9(server)];
                case 73:
                    _6.sent();
                    _6.label = 74;
                case 74:
                    _5++;
                    return [3 /*break*/, 72];
                case 75:
                    setTimeout(monitorEvolutionStats, 5 * 60 * 1000);
                    return [2 /*return*/];
            }
        });
    });
}
function fancyTimeFormat(duration) {
    // Hours, minutes and seconds
    var hrs = ~~(duration / 3600);
    var mins = ~~((duration % 3600) / 60);
    var secs = ~~duration % 60;
    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";
    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }
    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}
function monitorEvolutionStats2() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var playerCount, _i, evolutionServers_12, server, rand, response, data, e_32, hist, oldTime_1, newTime_1, diff_1, oldTime, newTime, diff, e_33, _c, evolutionServers_13, server, rand, response, data, e_34, e_35;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 9, , 10]);
                    console.log('Update evolution historical 1');
                    if (!evolutionHistorical.playerCount)
                        evolutionHistorical.playerCount = [];
                    playerCount = 0;
                    _i = 0, evolutionServers_12 = evolutionServers;
                    _d.label = 1;
                case 1:
                    if (!(_i < evolutionServers_12.length)) return [3 /*break*/, 8];
                    server = evolutionServers_12[_i];
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 5, , 6]);
                    rand = Math.floor(Math.random() * Math.floor(999999));
                    return [4 /*yield*/, (0, node_fetch_1.default)("https://".concat(server.endpoint, "/info?").concat(rand))];
                case 3:
                    response = _d.sent();
                    return [4 /*yield*/, response.json()];
                case 4:
                    data = _d.sent();
                    server.playerCount = data.playerTotal;
                    server.speculatorCount = data.speculatorTotal;
                    server.version = data.version;
                    server.rewardItemAmount = data.rewardItemAmount;
                    server.rewardWinnerAmount = data.rewardWinnerAmount;
                    server.gameMode = data.gameMode;
                    server.roundId = data.round.id;
                    server.roundStartedAt = data.round.startedAt;
                    server.timeLeft = ~~(5 * 60 - (((new Date().getTime()) / 1000 - data.round.startedAt)));
                    server.timeLeftText = fancyTimeFormat(5 * 60 - (((new Date().getTime()) / 1000 - data.round.startedAt)));
                    // server.totalLegitPlayers = data.totalLegitPlayers
                    server.status = "online";
                    return [3 /*break*/, 6];
                case 5:
                    e_32 = _d.sent();
                    if ((e_32 + '').toString().indexOf('invalid json response body') === -1)
                        console.log(e_32);
                    server.status = "offline";
                    server.playerCount = 0;
                    server.speculatorCount = 0;
                    server.rewardItemAmount = 0;
                    server.rewardWinnerAmount = 0;
                    return [3 /*break*/, 6];
                case 6:
                    hist = fs_jetpack_1.default.read(path_1.default.resolve("./db/evolution/".concat(server.key, "/historical.json")), 'json') || {};
                    if (!hist.playerCount)
                        hist.playerCount = [];
                    oldTime_1 = (new Date(((_a = hist.playerCount[hist.playerCount.length - 1]) === null || _a === void 0 ? void 0 : _a[0]) || 0)).getTime();
                    newTime_1 = (new Date()).getTime();
                    diff_1 = newTime_1 - oldTime_1;
                    if (diff_1 / (1000 * 60 * 60 * 1) > 1) {
                        hist.playerCount.push([newTime_1, server.playerCount]);
                    }
                    fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/".concat(server.key, "/historical.json")), (0, json_beautify_1.default)(hist, null, 2), { atomic: true });
                    playerCount += server.playerCount;
                    _d.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 1];
                case 8:
                    fs_jetpack_1.default.write(path_1.default.resolve('./db/evolution/servers.json'), (0, json_beautify_1.default)(evolutionServers, null, 2), { atomic: true });
                    updateGames();
                    oldTime = (new Date(((_b = evolutionHistorical.playerCount[evolutionHistorical.playerCount.length - 1]) === null || _b === void 0 ? void 0 : _b[0]) || 0)).getTime();
                    newTime = (new Date()).getTime();
                    diff = newTime - oldTime;
                    if (diff / (1000 * 60 * 60 * 1) > 1) {
                        evolutionHistorical.playerCount.push([newTime, playerCount]);
                    }
                    fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/historical.json"), (0, json_beautify_1.default)(evolutionHistorical, null, 2), { atomic: true });
                    {
                        console.log('Update evolution historical 2');
                    }
                    return [3 /*break*/, 10];
                case 9:
                    e_33 = _d.sent();
                    console.log(e_33);
                    return [3 /*break*/, 10];
                case 10:
                    _d.trys.push([10, 18, , 19]);
                    console.log('Update evolution info');
                    _c = 0, evolutionServers_13 = evolutionServers;
                    _d.label = 11;
                case 11:
                    if (!(_c < evolutionServers_13.length)) return [3 /*break*/, 17];
                    server = evolutionServers_13[_c];
                    if (server.status !== 'online')
                        return [3 /*break*/, 16];
                    _d.label = 12;
                case 12:
                    _d.trys.push([12, 15, , 16]);
                    rand = Math.floor(Math.random() * Math.floor(999999));
                    return [4 /*yield*/, (0, node_fetch_1.default)("https://".concat(server.endpoint, "/info?").concat(rand))];
                case 13:
                    response = _d.sent();
                    return [4 /*yield*/, response.json()];
                case 14:
                    data = _d.sent();
                    fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/".concat(server.key, "/info.json")), (0, json_beautify_1.default)(data, null, 2), { atomic: true });
                    return [3 /*break*/, 16];
                case 15:
                    e_34 = _d.sent();
                    console.log(e_34);
                    return [3 /*break*/, 16];
                case 16:
                    _c++;
                    return [3 /*break*/, 11];
                case 17: return [3 /*break*/, 19];
                case 18:
                    e_35 = _d.sent();
                    console.log(e_35);
                    return [3 /*break*/, 19];
                case 19:
                    setTimeout(monitorEvolutionStats2, 30 * 1000);
                    return [2 /*return*/];
            }
        });
    });
}
function monitorCoordinator() {
    return __awaiter(this, void 0, void 0, function () {
        var rand, response, data, e_36;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    console.log('Update coordinator refers');
                    rand = Math.floor(Math.random() * Math.floor(999999));
                    return [4 /*yield*/, (0, node_fetch_1.default)("https://coordinator.rune.game/data/refers.json?".concat(rand))];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    fs_jetpack_1.default.write(path_1.default.resolve("./db/affiliate/refers.json"), (0, json_beautify_1.default)(data, null, 2), { atomic: true });
                    return [3 /*break*/, 4];
                case 3:
                    e_36 = _a.sent();
                    console.log(e_36);
                    return [3 /*break*/, 4];
                case 4:
                    setTimeout(monitorCoordinator, 2 * 60 * 1000);
                    return [2 /*return*/];
            }
        });
    });
}
function monitorMeta() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, _a, item, itemJson;
        return __generator(this, function (_b) {
            console.log('Saving achievement data');
            fs_jetpack_1.default.write(path_1.default.resolve('./db/achievements.json'), (0, json_beautify_1.default)(achievements_mjs_1.achievementData, null, 2), { atomic: true });
            console.log('Saving item data');
            fs_jetpack_1.default.write(path_1.default.resolve('./db/items.json'), (0, json_beautify_1.default)(items_mjs_1.itemData, null, 2), { atomic: true });
            console.log('Saving item attribute data');
            fs_jetpack_1.default.write(path_1.default.resolve('./db/itemAttributes.json'), (0, json_beautify_1.default)(items_mjs_1.ItemAttributes, null, 2), { atomic: true });
            console.log('Saving skill data');
            fs_jetpack_1.default.write(path_1.default.resolve('./db/skills.json'), (0, json_beautify_1.default)(items_mjs_1.SkillNames, null, 2), { atomic: true });
            console.log('Saving class data');
            fs_jetpack_1.default.write(path_1.default.resolve('./db/classes.json'), (0, json_beautify_1.default)(items_mjs_1.ClassNames, null, 2), { atomic: true });
            console.log('Saving item rarity data');
            fs_jetpack_1.default.write(path_1.default.resolve('./db/itemRarity.json'), (0, json_beautify_1.default)(items_mjs_1.ItemRarity, null, 2), { atomic: true });
            console.log('Saving item type data');
            fs_jetpack_1.default.write(path_1.default.resolve('./db/itemTypes.json'), (0, json_beautify_1.default)(items_mjs_1.ItemTypeToText, null, 2), { atomic: true });
            console.log('Saving item slot data');
            fs_jetpack_1.default.write(path_1.default.resolve('./db/itemSlots.json'), (0, json_beautify_1.default)(items_mjs_1.ItemSlotToText, null, 2), { atomic: true });
            try {
                for (_i = 0, _a = items_mjs_1.itemData[items_type_mjs_1.ItemsMainCategoriesType.OTHER]; _i < _a.length; _i++) {
                    item = _a[_i];
                    item.icon = item.icon.replace('undefined', 'https://rune.game/');
                    if (item.recipe) {
                        item.recipe.requirement = item.recipe.requirement.map(function (r) { return (__assign(__assign({}, r), { id: items_mjs_1.RuneNames[r.id] })); });
                    }
                    item.branches[1].attributes.map(function (a) { return (__assign(__assign({}, a), { description: items_mjs_1.ItemAttributesById[a.id].description })); });
                    itemJson = __assign(__assign({ "description": Array.isArray(item.branches[1].description) ? item.branches[1].description[0] : item.branches[1].description, "home_url": "https://rune.game", "external_url": "https://rune.game/catalog/" + item.id, "image_url": item.icon, "language": "en-US" }, item), { "type": items_mjs_1.ItemTypeToText[item.type], "slots": item.slots.map(function (s) { return items_mjs_1.ItemSlotToText[s]; }) });
                    // const itemJson = {
                    //   "id": 1,
                    //   "name": "Steel",
                    //   "icon": "/images/items/00001.png",
                    //   "value": "0",
                    //   "type": 1,
                    //   "isNew": false,
                    //   "isEquipable": true,
                    //   "isUnequipable": false,
                    //   "isTradeable": true,
                    //   "isTransferable": true,
                    //   "isCraftable": false,
                    //   "isDisabled": false,
                    //   "isRuneword": true,
                    //   "isRetired": true,
                    //   "createdDate": 12111,
                    //   "hotness": 6,
                    //   "recipe": {
                    //     "requirement": [
                    //       {
                    //         "id": 2,
                    //         "quantity": 1
                    //       },
                    //       {
                    //         "id": 0,
                    //         "quantity": 1
                    //       }
                    //     ]
                    //   },
                    //   "version": 3,
                    //   "shortTokenId": "10030000101000900030002...694",
                    //   "rarity": {
                    //     "id": 6,
                    //     "name": "Magical"
                    //   },
                    //   "tokenId": "100300001010009000300020000000000000000000000000000000000000000000000000694",
                    //   "details": {
                    //     "Type": "Sword",
                    //     "Subtype": "Night Blade",
                    //     "Rune Word": "Tir El",
                    //     "Distribution": "Crafted",
                    //     "Date": "April 20, 2021 - June 4, 2021",
                    //     "Max Supply": "Unknown"
                    //   },
                    //   "branches": {
                    //     "1": {
                    //       "description": [
                    //         "Made by Men, this blade is common but has minimal downsides."
                    //       ],
                    //       "attributes": [
                    //         {
                    //           "id": 1,
                    //           "min": 5,
                    //           "max": 15,
                    //           "description": "{value}% Increased Harvest Yield"
                    //         },
                    //         {
                    //           "id": 2,
                    //           "min": 0,
                    //           "max": 5,
                    //           "description": "{value}% Harvest Fee"
                    //         },
                    //         {
                    //           "id": 3,
                    //           "min": 0,
                    //           "max": 2,
                    //           "description": "Harvest Fee Token: {value}",
                    //           "map": {
                    //             "0": "EL",
                    //             "1": "ELD",
                    //             "2": "TIR",
                    //             "3": "NEF",
                    //             "4": "ETH",
                    //             "5": "ITH",
                    //             "6": "TAL",
                    //             "7": "RAL",
                    //             "8": "ORT",
                    //             "9": "THUL",
                    //             "10": "AMN",
                    //             "11": "SOL",
                    //             "12": "SHAEL",
                    //             "13": "DOL",
                    //             "14": "HEL",
                    //             "15": "IO",
                    //             "16": "LUM",
                    //             "17": "KO",
                    //             "18": "FAL",
                    //             "19": "LEM",
                    //             "20": "PUL",
                    //             "21": "UM",
                    //             "22": "MAL",
                    //             "23": "IST",
                    //             "24": "GUL",
                    //             "25": "VEX",
                    //             "26": "OHM",
                    //             "27": "LO",
                    //             "28": "SUR",
                    //             "29": "BER",
                    //             "30": "JAH",
                    //             "31": "CHAM",
                    //             "32": "ZOD"
                    //           }
                    //         }
                    //       ],
                    //       "perfection": [
                    //         15,
                    //         0
                    //       ]
                    //     },
                    //     "2": {
                    //       "description": "Made by Men, this blade is common but has minimal downsides.",
                    //       "attributes": [
                    //         {
                    //           "id": 1,
                    //           "min": 16,
                    //           "max": 20,
                    //           "description": "{value}% Increased Attack Speed"
                    //         },
                    //         {
                    //           "id": 3,
                    //           "min": 6,
                    //           "max": 8,
                    //           "description": "{value}% Less Damage"
                    //         },
                    //         {
                    //           "id": 4,
                    //           "min": 81,
                    //           "max": 100,
                    //           "description": "{value} Increased Maximum Rage"
                    //         },
                    //         {
                    //           "id": 5,
                    //           "min": 3,
                    //           "max": 5,
                    //           "description": "{value} Increased Elemental Resists"
                    //         },
                    //         {
                    //           "id": 7,
                    //           "min": 3,
                    //           "max": 5,
                    //           "description": "{value} Increased Minion Attack Speed"
                    //         },
                    //         {
                    //           "id": 8,
                    //           "value": 3,
                    //           "description": "{value} Increased Light Radius"
                    //         }
                    //       ]
                    //     }
                    //   },
                    //   "shorthand": "9-3",
                    //   "mods": [
                    //     {
                    //       "variant": 0,
                    //       "value": 9,
                    //       "attributeId": 1
                    //     },
                    //     {
                    //       "variant": 0,
                    //       "value": 3,
                    //       "attributeId": 2
                    //     },
                    //     {
                    //       "variant": 0,
                    //       "value": 2,
                    //       "attributeId": 3
                    //     },
                    //     {
                    //       "variant": 0,
                    //       "value": 0
                    //     },
                    //     {
                    //       "variant": 0,
                    //       "value": 0
                    //     },
                    //     {
                    //       "variant": 0,
                    //       "value": 0
                    //     },
                    //     {
                    //       "variant": 0,
                    //       "value": 0
                    //     },
                    //     {
                    //       "variant": 0,
                    //       "value": 0
                    //     },
                    //     {
                    //       "variant": 0,
                    //       "value": 0
                    //     },
                    //     {
                    //       "variant": 0,
                    //       "value": 0
                    //     },
                    //     {
                    //       "variant": 0,
                    //       "value": 0
                    //     },
                    //     {
                    //       "variant": 0,
                    //       "value": 0
                    //     },
                    //     {
                    //       "variant": 0,
                    //       "value": 0
                    //     },
                    //     {
                    //       "variant": 0,
                    //       "value": 0
                    //     },
                    //     {
                    //       "variant": 0,
                    //       "value": 0
                    //     },
                    //     {
                    //       "variant": 0,
                    //       "value": 694
                    //     }
                    //   ],
                    //   "attributes": [
                    //     {
                    //       "id": 1,
                    //       "min": 5,
                    //       "max": 15,
                    //       "description": "{value}% Increased Harvest Yield",
                    //       "variant": 0,
                    //       "value": 9,
                    //       "attributeId": 1
                    //     },
                    //     {
                    //       "id": 2,
                    //       "min": 0,
                    //       "max": 5,
                    //       "description": "{value}% Harvest Fee",
                    //       "variant": 0,
                    //       "value": 3,
                    //       "attributeId": 2
                    //     },
                    //     {
                    //       "id": 3,
                    //       "min": 0,
                    //       "max": 2,
                    //       "description": "Harvest Fee Token: {value}",
                    //       "map": {
                    //         "0": "EL",
                    //         "1": "ELD",
                    //         "2": "TIR",
                    //         "3": "NEF",
                    //         "4": "ETH",
                    //         "5": "ITH",
                    //         "6": "TAL",
                    //         "7": "RAL",
                    //         "8": "ORT",
                    //         "9": "THUL",
                    //         "10": "AMN",
                    //         "11": "SOL",
                    //         "12": "SHAEL",
                    //         "13": "DOL",
                    //         "14": "HEL",
                    //         "15": "IO",
                    //         "16": "LUM",
                    //         "17": "KO",
                    //         "18": "FAL",
                    //         "19": "LEM",
                    //         "20": "PUL",
                    //         "21": "UM",
                    //         "22": "MAL",
                    //         "23": "IST",
                    //         "24": "GUL",
                    //         "25": "VEX",
                    //         "26": "OHM",
                    //         "27": "LO",
                    //         "28": "SUR",
                    //         "29": "BER",
                    //         "30": "JAH",
                    //         "31": "CHAM",
                    //         "32": "ZOD"
                    //       },
                    //       "variant": 0,
                    //       "value": 2,
                    //       "attributeId": 3
                    //     }
                    //   ],
                    //   "perfection": 0.4,
                    //   "category": "weapon",
                    //   "slots": [
                    //     1,
                    //     2
                    //   ],
                    //   "meta": {
                    //     "harvestYield": 9,
                    //     "harvestFeeToken": "TIR",
                    //     "harvestFeePercent": 3,
                    //     "harvestFees": {
                    //       "TIR": 3
                    //     },
                    //     "chanceToSendHarvestToHiddenPool": 0,
                    //     "chanceToLoseHarvest": 0,
                    //     "harvestBurn": 0
                    //   }
                    // }
                    delete itemJson.category;
                    delete itemJson.value;
                    delete itemJson.hotness;
                    delete itemJson.createdDate;
                    // delete item.shortTokenId
                    // delete item.shorthand
                    // if (!isToken) {
                    //   delete item.tokenId
                    //   delete item.rarity
                    //   delete item.mods
                    //   delete item.attributes
                    //   delete item.perfection
                    //   delete item.meta
                    // }
                    console.log('Saving item meta', itemJson.id);
                    fs_jetpack_1.default.write(path_1.default.resolve('./db/items/' + itemJson.id + '/meta.json'), (0, json_beautify_1.default)(itemJson, null, 2), { atomic: true });
                    // const ipfs = ipfsClient.create({
                    //   host: 'ipfs.rune.game',
                    //   protocol: 'https',
                    //   port: 443,
                    //   apiPath: '/api/v0'
                    // })
                    // await ipfs.files.add('/items/999999.json', Buffer.from(beautify(itemJson, null, 2)))
                    // const cid = await ipfs.add(
                    //   { path: '/items/999999.json', content: beautify(itemJson, null, 2) }, 
                    //   // { wrapWithDirectory: true }
                    //   // cid: 'QmcZ774UPRJ3Qzuyg76ayc2AFM26ZfZQai8Ub5THKmwtbF', 
                    // )
                    // console.log(cid)
                }
            }
            catch (e) {
                console.log(e);
            }
            setTimeout(monitorMeta, 10 * 60 * 1000);
            return [2 /*return*/];
        });
    });
}
function monitorGuildMemberDetails() {
    return __awaiter(this, void 0, void 0, function () {
        var transformProfileResponse, _i, guilds_1, g, guild, _a, _b, member, user, usernameSearch, hasRegistered, profileResponse, _c, userId, teamId, tokenId, nftAddress, isActive, _d, _e;
        var _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    transformProfileResponse = function (profileResponse) {
                        var userId = profileResponse[0], numberPoints = profileResponse[1], teamId = profileResponse[2], nftAddress = profileResponse[3], tokenId = profileResponse[4], isActive = profileResponse[5];
                        return {
                            userId: Number(userId),
                            points: Number(numberPoints),
                            teamId: Number(teamId),
                            tokenId: Number(tokenId),
                            nftAddress: nftAddress,
                            isActive: isActive,
                        };
                    };
                    console.log(guilds);
                    _i = 0, guilds_1 = guilds;
                    _g.label = 1;
                case 1:
                    if (!(_i < guilds_1.length)) return [3 /*break*/, 14];
                    g = guilds_1[_i];
                    console.log(g);
                    guild = loadGuild(g.id);
                    guild.memberDetails = [];
                    _a = 0, _b = guild.members;
                    _g.label = 2;
                case 2:
                    if (!(_a < _b.length)) return [3 /*break*/, 11];
                    member = _b[_a];
                    user = loadUser(member);
                    if (!!user.username) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, node_fetch_1.default)("https://rune-api.binzy.workers.dev/users/".concat(user.address))];
                case 3: return [4 /*yield*/, ((_g.sent()).json())];
                case 4:
                    usernameSearch = _g.sent();
                    if (!!usernameSearch.message && usernameSearch.message === "No user exists" || !(usernameSearch.username)) {
                        return [3 /*break*/, 10];
                    }
                    else {
                        user.username = usernameSearch.username;
                    }
                    _g.label = 5;
                case 5: return [4 /*yield*/, arcaneProfileContract.hasRegistered(user.address)];
                case 6:
                    hasRegistered = (_g.sent());
                    if (!hasRegistered)
                        return [3 /*break*/, 10];
                    return [4 /*yield*/, arcaneProfileContract.getUserProfile(user.address)];
                case 7:
                    profileResponse = _g.sent();
                    _c = transformProfileResponse(profileResponse), userId = _c.userId, teamId = _c.teamId, tokenId = _c.tokenId, nftAddress = _c.nftAddress, isActive = _c.isActive;
                    if (teamId !== guild.id)
                        return [3 /*break*/, 10];
                    user.isGuildMembershipActive = isActive;
                    user.guildMembershipTokenId = tokenId;
                    _e = (_d = guild.memberDetails).push;
                    _f = {
                        address: user.address,
                        username: user.username,
                        points: user.points,
                        achievementCount: user.achievements.length,
                        isActive: user.isGuildMembershipActive
                    };
                    return [4 /*yield*/, arcaneCharactersContract.getCharacterId(tokenId)];
                case 8:
                    _e.apply(_d, [(_f.characterId = _g.sent(),
                            _f)]);
                    console.log("Sync guild ".concat(guild.id, " member ").concat(guild.memberDetails.length, " / ").concat(guild.memberCount));
                    return [4 /*yield*/, saveUser(user)];
                case 9:
                    _g.sent();
                    _g.label = 10;
                case 10:
                    _a++;
                    return [3 /*break*/, 2];
                case 11: return [4 /*yield*/, saveGuild(guild)];
                case 12:
                    _g.sent();
                    _g.label = 13;
                case 13:
                    _i++;
                    return [3 /*break*/, 1];
                case 14:
                    setTimeout(monitorGuildMemberDetails, 10 * 60 * 1000);
                    return [2 /*return*/];
            }
        });
    });
}
function onCommand() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/];
        });
    });
}
function sendCommand() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/];
        });
    });
}
function signCommand() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/];
        });
    });
}
function isConnected() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/];
        });
    });
}
function migrateTrades() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, trades_1, trade;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    for (_i = 0, trades_1 = trades; _i < trades_1.length; _i++) {
                        trade = trades_1[_i];
                        delete trade.item;
                    }
                    return [4 /*yield*/, saveTrades()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function monitorSaves() {
    return __awaiter(this, void 0, void 0, function () {
        var e_37;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 13, , 14]);
                    return [4 /*yield*/, saveTrades()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, saveTradesEvents()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, saveItemsEvents()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, saveCharactersEvents()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, saveBarracksEvents()];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, saveFarms()];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, saveGuilds()];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, saveStats()];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, saveRunes()];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, saveHistorical()];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, saveApp()];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, saveConfig()
                        // await updateGit()
                    ];
                case 12:
                    _a.sent();
                    return [3 /*break*/, 14];
                case 13:
                    e_37 = _a.sent();
                    console.log('Git error', e_37);
                    return [3 /*break*/, 14];
                case 14:
                    setTimeout(monitorSaves, 5 * 60 * 1000);
                    return [2 /*return*/];
            }
        });
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            monitorRealmServers();
            return [2 /*return*/];
        });
    });
}
run();
// Force restart after an hour
setTimeout(function () {
    process.exit(1);
}, 1 * 60 * 60 * 1000);
