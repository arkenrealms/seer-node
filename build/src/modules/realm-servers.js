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
exports.monitorRealmServers = exports.emitAll = exports.connectRealms = exports.connectRealm = void 0;
var path_1 = __importDefault(require("path"));
var fs_jetpack_1 = __importDefault(require("fs-jetpack"));
var json_beautify_1 = __importDefault(require("json-beautify"));
var time_1 = require("../util/time");
var js_md5_1 = __importDefault(require("js-md5"));
var util_1 = require("../util");
var socket_1 = require("../util/socket");
var web3_1 = require("../util/web3");
var shortId = require('shortid');
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
var ioCallbacks = {};
function rsCall(client, name, data) {
    if (data === void 0) { data = undefined; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    var _a;
                    var id = shortId();
                    ioCallbacks[id] = resolve;
                    if (!((_a = client.socket) === null || _a === void 0 ? void 0 : _a.connected)) {
                        (0, util_1.logError)('Not connected to realm server.');
                        return;
                    }
                    (0, util_1.log)('Emit Realm', name, { id: id, data: data });
                    client.socket.emit(name, { id: id, data: data });
                })];
        });
    });
}
var games = {
    raid: {
        realms: {}
    },
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
function connectRealm(app, server) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var client;
        var _this = this;
        return __generator(this, function (_b) {
            if ((_a = games.evolution.realms[server.key].client) === null || _a === void 0 ? void 0 : _a.socket.connected) {
                games.evolution.realms[server.key].client.socket.close();
            }
            client = {
                authed: false,
                socket: (0, socket_1.getClientSocket)('http://' + server.endpoint.replace('3007', '3006'))
            };
            client.socket.on('connect', function () { return __awaiter(_this, void 0, void 0, function () {
                var res, playerCount, _i, _a, server_1, rand, response, data, e_1, hist, oldTime, newTime, diff, e_2;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 10, , 11]);
                            (0, util_1.log)('Connected: ' + server.key);
                            return [4 /*yield*/, rsCall(client, 'AuthRequest', 'myverysexykey')];
                        case 1:
                            res = _c.sent();
                            if (!(res.status === 1)) return [3 /*break*/, 9];
                            client.authed = true;
                            if (!app.db.evolutionHistorical.playerCount)
                                app.db.evolutionHistorical.playerCount = [];
                            playerCount = 0;
                            _i = 0, _a = app.db.evolutionServers;
                            _c.label = 2;
                        case 2:
                            if (!(_i < _a.length)) return [3 /*break*/, 8];
                            server_1 = _a[_i];
                            _c.label = 3;
                        case 3:
                            _c.trys.push([3, 5, , 6]);
                            rand = Math.floor(Math.random() * Math.floor(999999));
                            return [4 /*yield*/, rsCall(client, 'InfoRequest')];
                        case 4:
                            response = _c.sent();
                            data = response.data;
                            server_1.playerCount = data.playerTotal;
                            server_1.speculatorCount = data.speculatorTotal;
                            server_1.version = data.version;
                            server_1.rewardItemAmount = data.rewardItemAmount;
                            server_1.rewardWinnerAmount = data.rewardWinnerAmount;
                            server_1.gameMode = data.gameMode;
                            server_1.roundId = data.round.id;
                            server_1.roundStartedAt = data.round.startedAt;
                            server_1.timeLeft = ~~(5 * 60 - (((new Date().getTime()) / 1000 - data.round.startedAt)));
                            server_1.timeLeftText = (0, time_1.fancyTimeFormat)(5 * 60 - (((new Date().getTime()) / 1000 - data.round.startedAt)));
                            // server.totalLegitPlayers = data.totalLegitPlayers
                            server_1.status = "online";
                            return [3 /*break*/, 6];
                        case 5:
                            e_1 = _c.sent();
                            if ((e_1 + '').toString().indexOf('invalid json response body') === -1)
                                (0, util_1.log)(e_1);
                            server_1.status = "offline";
                            server_1.playerCount = 0;
                            server_1.speculatorCount = 0;
                            server_1.rewardItemAmount = 0;
                            server_1.rewardWinnerAmount = 0;
                            return [3 /*break*/, 6];
                        case 6:
                            hist = fs_jetpack_1.default.read(path_1.default.resolve("./db/evolution/".concat(server_1.key, "/historical.json")), 'json') || {};
                            if (!hist.playerCount)
                                hist.playerCount = [];
                            oldTime = (new Date(((_b = hist.playerCount[hist.playerCount.length - 1]) === null || _b === void 0 ? void 0 : _b[0]) || 0)).getTime();
                            newTime = (new Date()).getTime();
                            diff = newTime - oldTime;
                            if (diff / (1000 * 60 * 60 * 1) > 1) {
                                hist.playerCount.push([newTime, server_1.playerCount]);
                            }
                            fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/".concat(server_1.key, "/historical.json")), (0, json_beautify_1.default)(hist, null, 2), { atomic: true });
                            playerCount += server_1.playerCount;
                            _c.label = 7;
                        case 7:
                            _i++;
                            return [3 /*break*/, 2];
                        case 8:
                            fs_jetpack_1.default.write(path_1.default.resolve('./db/evolution/servers.json'), (0, json_beautify_1.default)(app.db.evolutionServers, null, 2), { atomic: true });
                            _c.label = 9;
                        case 9: return [3 /*break*/, 11];
                        case 10:
                            e_2 = _c.sent();
                            (0, util_1.logError)(e_2);
                            return [3 /*break*/, 11];
                        case 11: return [2 /*return*/];
                    }
                });
            }); });
            client.socket.on('disconnect', function () {
                (0, util_1.log)('Disconnected: ' + server.key);
            });
            client.socket.on('PingRequest', function (msg) {
                (0, util_1.log)(msg);
                client.socket.emit('PingResponse');
            });
            client.socket.on('BanPlayerRequest', function (req) {
                return __awaiter(this, void 0, void 0, function () {
                    var _a, _b, _c, e_3;
                    var _d;
                    return __generator(this, function (_e) {
                        switch (_e.label) {
                            case 0:
                                console.log(req);
                                _e.label = 1;
                            case 1:
                                _e.trys.push([1, 6, , 7]);
                                (0, util_1.log)('Ban', req);
                                return [4 /*yield*/, (0, web3_1.verifySignature)(req.signature)];
                            case 2:
                                if (!((_e.sent()) && app.db.evolution.modList.includes(req.signature.address))) return [3 /*break*/, 4];
                                app.db.addBanList('evolution', req.data.target);
                                app.db.saveBanList();
                                _b = (_a = app.realm).emitAll;
                                _c = ['BanUserRequest'];
                                _d = {};
                                return [4 /*yield*/, (0, web3_1.getSignedRequest)((0, js_md5_1.default)(JSON.stringify({ target: req.data.target })))];
                            case 3:
                                _b.apply(_a, _c.concat([(_d.signature = _e.sent(),
                                        _d.data = {
                                            target: req.data.target
                                        },
                                        _d)]));
                                client.socket.emit('BanUserResponse', {
                                    id: req.id,
                                    data: { status: 1 }
                                });
                                return [3 /*break*/, 5];
                            case 4:
                                client.socket.emit('BanUserResponse', {
                                    id: req.id,
                                    data: { status: 0, message: 'Invalid signature' }
                                });
                                _e.label = 5;
                            case 5: return [3 /*break*/, 7];
                            case 6:
                                e_3 = _e.sent();
                                (0, util_1.logError)(e_3);
                                client.socket.emit('BanUserResponse', {
                                    id: req.id,
                                    data: { status: 0, message: e_3 }
                                });
                                return [3 /*break*/, 7];
                            case 7: return [2 /*return*/];
                        }
                    });
                });
            });
            client.socket.on('ReportPlayerRequest', function (msg) {
                (0, util_1.log)(msg);
                var currentGamePlayers = msg.currentGamePlayers, currentPlayer = msg.currentPlayer, reportedPlayer = msg.reportedPlayer;
                if (currentPlayer.name.indexOf('Guest') !== -1 || currentPlayer.name.indexOf('Unknown') !== -1)
                    return; // No guest reports
                if (!app.db.evolution.reportList[reportedPlayer.address])
                    app.db.evolution.reportList[reportedPlayer.address] = [];
                if (!app.db.evolution.reportList[reportedPlayer.address].includes(currentPlayer.address))
                    app.db.evolution.reportList[reportedPlayer.address].push(currentPlayer.address);
                // if (app.db.evolution.reportList[reportedPlayer.address].length >= 6) {
                //   app.db.evolution.banList.push(reportedPlayer.address)
                //   disconnectPlayer(reportedPlayer)
                //   // emitDirect(client.sockets[reportedPlayer.id], 'OnBanned', true)
                //   return
                // }
                // if (currentGamePlayers.length >= 4) {
                //   const reportsFromCurrentGamePlayers = app.db.evolution.reportList[reportedPlayer.address].filter(function(n) {
                //     return currentGamePlayers.indexOf(n) !== -1;
                //   })
                //   if (reportsFromCurrentGamePlayers.length >= currentGamePlayers.length / 3) {
                //     app.db.evolution.banList.push(reportedPlayer.address)
                //     disconnectPlayer(reportedPlayer)
                //     // emitDirect(client.sockets[reportedPlayer.id], 'OnBanned', true)
                //     return
                //   }
                // }
                // Relay the report to connected realm servers
            });
            // {
            //   id: 'vLgqLC_oa',
            //   signature: {
            //     address: '0xDfA8f768d82D719DC68E12B199090bDc3691fFc7',
            //     hash: '0xaa426a32a8f0dae65f160e52d3c0004582e796942894c199255298a05b5f40a473b4257e367e5c285a1eeaf9a8f69b14b8fc273377ab4c79e256962a3434978a1c',
            //     data: '96a190dbd01b86b08d6feafc6444481b'
            //   },
            //   data: {
            //     id: '7mrEmDnd6',
            //     data: {
            //       id: 1,
            //       startedAt: 1644133312,
            //       leaders: [Array],
            //       players: [Array]
            //     }
            //   }
            // }
            // {
            //   id: 2,
            //   startedAt: 1644135785,
            //   leaders: [],
            //   players: [
            //     {
            //       name: 'Sdadasd',
            //       id: 'ovEbbscHo3D7aWVBAAAD',
            //       avatar: 0,
            //       network: 'bsc',
            //       address: '0x191727d22f2693100acef8e48F8FeaEaa06d30b1',
            //       device: 'desktop',
            //       position: [Object],
            //       target: [Object],
            //       clientPosition: [Object],
            //       clientTarget: [Object],
            //       rotation: null,
            //       xp: 0,
            //       latency: 12627.5,
            //       kills: 0,
            //       deaths: 0,
            //       points: 0,
            //       evolves: 0,
            //       powerups: 0,
            //       rewards: 0,
            //       orbs: 0,
            //       rewardHistory: [],
            //       isMod: false,
            //       isBanned: false,
            //       isMasterClient: false,
            //       isDisconnected: true,
            //       isDead: true,
            //       isJoining: false,
            //       isSpectating: false,
            //       isStuck: false,
            //       isInvincible: false,
            //       isPhased: false,
            //       overrideSpeed: 0.5,
            //       overrideCameraSize: null,
            //       cameraSize: 3,
            //       speed: 0.5,
            //       joinedAt: 0,
            //       hash: '',
            //       lastReportedTime: 1644135787011,
            //       lastUpdate: 1644135787016,
            //       gameMode: 'Deathmatch',
            //       phasedUntil: 1644135814266,
            //       log: [Object],
            //       startedRoundAt: 1644135785
            //     }
            //   ]
            // }
            client.socket.on('SaveRoundRequest', function (req) {
                return __awaiter(this, void 0, void 0, function () {
                    var _i, _a, player, user, _b, _c, pickup, e_4;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                _d.trys.push([0, 2, , 3]);
                                (0, util_1.log)('SaveRoundRequest', req);
                                return [4 /*yield*/, (0, web3_1.verifySignature)(req.signature)];
                            case 1:
                                if ((_d.sent()) && app.db.evolution.modList.includes(req.signature.address)) {
                                    console.log(req);
                                    // Iterate the winners, determine the winning amounts, validate, save to user rewards
                                    // Iterate all players and save their log / stats 
                                    for (_i = 0, _a = req.players; _i < _a.length; _i++) {
                                        player = _a[_i];
                                        user = app.db.loadUser(player.address);
                                        for (_b = 0, _c = player.pickups; _b < _c.length; _b++) {
                                            pickup = _c[_b];
                                            if (pickup.type === 'rune') {
                                                user.rewards.runes[pickup.rewardItemName.toLowerCase()] += pickup.quantity;
                                            }
                                            else {
                                                user.rewards.items[pickup.id] = {
                                                    name: pickup.name,
                                                    rarity: pickup.rarity,
                                                    quantity: pickup.quantity
                                                };
                                            }
                                        }
                                    }
                                    client.socket.emit('SaveRoundResponse', {
                                        id: req.id,
                                        data: { status: 1 }
                                    });
                                }
                                else {
                                    client.socket.emit('SaveRoundResponse', {
                                        id: req.id,
                                        data: { status: 0, message: 'Invalid signature' }
                                    });
                                }
                                return [3 /*break*/, 3];
                            case 2:
                                e_4 = _d.sent();
                                (0, util_1.logError)(e_4);
                                client.socket.emit('SaveRoundResponse', {
                                    id: req.id,
                                    data: { status: 0, message: e_4 }
                                });
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                });
            });
            client.socket.onAny(function (eventName, res) {
                // log('Event All', eventName, res)
                if (!res || !res.id)
                    return;
                // console.log(eventName, res)
                if (ioCallbacks[res.id]) {
                    (0, util_1.log)('Callback', eventName);
                    ioCallbacks[res.id](res.data);
                    delete ioCallbacks[res.id];
                }
            });
            client.socket.connect();
            games.evolution.realms[server.key].client = client;
            return [2 /*return*/];
        });
    });
}
exports.connectRealm = connectRealm;
function connectRealms(app) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var _i, _b, server, key;
        return __generator(this, function (_c) {
            for (_i = 0, _b = app.db.evolutionServers; _i < _b.length; _i++) {
                server = _b[_i];
                if (!games.evolution.realms[server.key]) {
                    games.evolution.realms[server.key] = {};
                    for (key in Object.keys(server)) {
                        games.evolution.realms[server.key][key] = server[key];
                    }
                }
                if (!((_a = games.evolution.realms[server.key].client) === null || _a === void 0 ? void 0 : _a.authed)) {
                    connectRealm(app, server);
                }
            }
            return [2 /*return*/];
        });
    });
}
exports.connectRealms = connectRealms;
function emitAll(app) {
    var _a, _b, _c, _d;
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return __awaiter(this, void 0, void 0, function () {
        var _e, _f, server;
        var _g;
        return __generator(this, function (_h) {
            for (_e = 0, _f = app.db.evolutionServers; _e < _f.length; _e++) {
                server = _f[_e];
                if ((_b = (_a = games.evolution.realms[server.key]) === null || _a === void 0 ? void 0 : _a.client) === null || _b === void 0 ? void 0 : _b.authed) {
                    (_d = (_c = games.evolution.realms[server.key]) === null || _c === void 0 ? void 0 : _c.client) === null || _d === void 0 ? void 0 : (_g = _d.socket).emit.apply(_g, args);
                }
            }
            return [2 /*return*/];
        });
    });
}
exports.emitAll = emitAll;
function monitorRealmServers(app) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!!app.realm) return [3 /*break*/, 2];
                    app.realm = {};
                    app.realm.apiAddress = '0x4b64Ff29Ee3B68fF9de11eb1eFA577647f83151C';
                    _a = app.realm;
                    return [4 /*yield*/, (0, web3_1.getSignedRequest)('evolution')];
                case 1:
                    _a.apiSignature = _b.sent();
                    app.realm.emitAll = emitAll.bind(null, app);
                    _b.label = 2;
                case 2:
                    connectRealms(app);
                    setTimeout(function () { return monitorRealmServers(app); }, 10 * 1000);
                    return [2 /*return*/];
            }
        });
    });
}
exports.monitorRealmServers = monitorRealmServers;
