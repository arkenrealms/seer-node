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
            if ((_a = games.evolution.realms[server.key].connection) === null || _a === void 0 ? void 0 : _a.socket.connected) {
                games.evolution.realms[server.key].connection.socket.close();
            }
            client = {
                authed: false,
                socket: (0, socket_1.getClientSocket)('http://' + server.endpoint)
            };
            client.socket.on('connect', function () { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            (0, util_1.log)('Connected: ' + server.key);
                            return [4 /*yield*/, rsCall(client, 'AuthRequest', 'myverysexykey')];
                        case 1:
                            res = _a.sent();
                            if (res.success === 1) {
                                client.authed = true;
                            }
                            return [2 /*return*/];
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
                    var _a, _b, _c, e_1;
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
                                    data: { success: 1 }
                                });
                                return [3 /*break*/, 5];
                            case 4:
                                client.socket.emit('BanUserResponse', {
                                    id: req.id,
                                    data: { success: 0, message: 'Invalid signature' }
                                });
                                _e.label = 5;
                            case 5: return [3 /*break*/, 7];
                            case 6:
                                e_1 = _e.sent();
                                (0, util_1.logError)(e_1);
                                client.socket.emit('BanUserResponse', {
                                    id: req.id,
                                    data: { success: 0, message: e_1 }
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
            client.socket.on('RoundFinishedRequest', function (msg) {
                (0, util_1.log)(msg);
                // function sendLeaderReward(leaders) {
                //   log('Leader: ', leaders[0])
                //   if (leaders[0]?.address) {
                //     try {
                //       if (!app.db.evolution.playerRewards[leaders[0].address]) app.db.evolution.playerRewards[leaders[0].address] = {}
                //       if (!app.db.evolution.playerRewards[leaders[0].address].pending) app.db.evolution.playerRewards[leaders[0].address].pending = {}
                //       if (!app.db.evolution.playerRewards[leaders[0].address].pending.zod) app.db.evolution.playerRewards[leaders[0].address].pending.zod = 0
                //       app.db.evolution.playerRewards[leaders[0].address].pending.zod  = Math.round((app.db.evolution.playerRewards[leaders[0].address].pending.zod + app.config.rewardWinnerAmount * 1) * 1000) / 1000
                //       publishEvent('OnRoundWinner', leaders[0].name)
                //     } catch(e) {
                //       log(e)
                //     }
                //   }
                //   if (leaders[1]?.address) {
                //     try {
                //       if (!app.db.evolution.playerRewards[leaders[1].address]) app.db.evolution.playerRewards[leaders[1].address] = {}
                //       if (!app.db.evolution.playerRewards[leaders[1].address].pending) app.db.evolution.playerRewards[leaders[1].address].pending = {}
                //       if (!app.db.evolution.playerRewards[leaders[1].address].pending.zod) app.db.evolution.playerRewards[leaders[1].address].pending.zod = 0
                //       app.db.evolution.playerRewards[leaders[1].address].pending.zod  = Math.round((app.db.evolution.playerRewards[leaders[1].address].pending.zod + app.config.rewardWinnerAmount * 0.25) * 1000) / 1000
                //     } catch(e) {
                //       log(e)
                //     }
                //   }
                //   if (leaders[2]?.address) {
                //     try {
                //       if (!app.db.evolution.playerRewards[leaders[2].address]) app.db.evolution.playerRewards[leaders[2].address] = {}
                //       if (!app.db.evolution.playerRewards[leaders[2].address].pending) app.db.evolution.playerRewards[leaders[2].address].pending = {}
                //       if (!app.db.evolution.playerRewards[leaders[2].address].pending.zod) app.db.evolution.playerRewards[leaders[2].address].pending.zod = 0
                //       app.db.evolution.playerRewards[leaders[2].address].pending.zod  = Math.round((app.db.evolution.playerRewards[leaders[2].address].pending.zod + app.config.rewardWinnerAmount * 0.15) * 1000) / 1000
                //     } catch(e) {
                //       log(e)
                //     }
                //   }
                //   if (leaders[3]?.address) {
                //     try {
                //       if (!app.db.evolution.playerRewards[leaders[3].address]) app.db.evolution.playerRewards[leaders[3].address] = {}
                //       if (!app.db.evolution.playerRewards[leaders[3].address].pending) app.db.evolution.playerRewards[leaders[3].address].pending = {}
                //       if (!app.db.evolution.playerRewards[leaders[3].address].pending.zod) app.db.evolution.playerRewards[leaders[3].address].pending.zod = 0
                //       app.db.evolution.playerRewards[leaders[3].address].pending.zod  = Math.round((app.db.evolution.playerRewards[leaders[3].address].pending.zod + app.config.rewardWinnerAmount * 0.05) * 1000) / 1000
                //     } catch(e) {
                //       log(e)
                //     }
                //   }
                //   if (leaders[4]?.address) {
                //     try {
                //       if (!app.db.evolution.playerRewards[leaders[4].address]) app.db.evolution.playerRewards[leaders[4].address] = {}
                //       if (!app.db.evolution.playerRewards[leaders[4].address].pending) app.db.evolution.playerRewards[leaders[4].address].pending = {}
                //       if (!app.db.evolution.playerRewards[leaders[4].address].pending.zod) app.db.evolution.playerRewards[leaders[4].address].pending.zod = 0
                //       app.db.evolution.playerRewards[leaders[4].address].pending.zod  = Math.round((app.db.evolution.playerRewards[leaders[4].address].pending.zod + app.config.rewardWinnerAmount * 0.05) * 1000) / 1000
                //     } catch(e) {
                //       log(e)
                //     }
                //   }
                //   if (leaders[5]?.address) {
                //     try {
                //       if (!app.db.evolution.playerRewards[leaders[5].address]) app.db.evolution.playerRewards[leaders[5].address] = {}
                //       if (!app.db.evolution.playerRewards[leaders[5].address].pending) app.db.evolution.playerRewards[leaders[5].address].pending = {}
                //       if (!app.db.evolution.playerRewards[leaders[5].address].pending.zod) app.db.evolution.playerRewards[leaders[5].address].pending.zod = 0
                //       app.db.evolution.playerRewards[leaders[5].address].pending.zod  = Math.round((app.db.evolution.playerRewards[leaders[5].address].pending.zod + app.config.rewardWinnerAmount * 0.05) * 1000) / 1000
                //     } catch(e) {
                //       log(e)
                //     }
                //   }
                //   if (leaders[6]?.address) {
                //     try {
                //       if (!app.db.evolution.playerRewards[leaders[6].address]) app.db.evolution.playerRewards[leaders[6].address] = {}
                //       if (!app.db.evolution.playerRewards[leaders[6].address].pending) app.db.evolution.playerRewards[leaders[6].address].pending = {}
                //       if (!app.db.evolution.playerRewards[leaders[6].address].pending.zod) app.db.evolution.playerRewards[leaders[6].address].pending.zod = 0
                //       app.db.evolution.playerRewards[leaders[6].address].pending.zod  = Math.round((app.db.evolution.playerRewards[leaders[6].address].pending.zod + app.config.rewardWinnerAmount * 0.05) * 1000) / 1000
                //     } catch(e) {
                //       log(e)
                //     }
                //   }
                //   if (leaders[7]?.address) {
                //     try {
                //       if (!app.db.evolution.playerRewards[leaders[7].address]) app.db.evolution.playerRewards[leaders[7].address] = {}
                //       if (!app.db.evolution.playerRewards[leaders[7].address].pending) app.db.evolution.playerRewards[leaders[7].address].pending = {}
                //       if (!app.db.evolution.playerRewards[leaders[7].address].pending.zod) app.db.evolution.playerRewards[leaders[7].address].pending.zod = 0
                //       app.db.evolution.playerRewards[leaders[7].address].pending.zod  = Math.round((app.db.evolution.playerRewards[leaders[7].address].pending.zod + app.config.rewardWinnerAmount * 0.05) * 1000) / 1000
                //     } catch(e) {
                //       log(e)
                //     }
                //   }
                //   if (leaders[8]?.address) {
                //     try {
                //       if (!app.db.evolution.playerRewards[leaders[8].address]) app.db.evolution.playerRewards[leaders[8].address] = {}
                //       if (!app.db.evolution.playerRewards[leaders[8].address].pending) app.db.evolution.playerRewards[leaders[8].address].pending = {}
                //       if (!app.db.evolution.playerRewards[leaders[8].address].pending.zod) app.db.evolution.playerRewards[leaders[8].address].pending.zod = 0
                //       app.db.evolution.playerRewards[leaders[8].address].pending.zod  = Math.round((app.db.evolution.playerRewards[leaders[8].address].pending.zod + app.config.rewardWinnerAmount * 0.05) * 1000) / 1000
                //     } catch(e) {
                //       log(e)
                //     }
                //   }
                //   if (leaders[9]?.address) {
                //     try {
                //       if (!app.db.evolution.playerRewards[leaders[9].address]) app.db.evolution.playerRewards[leaders[9].address] = {}
                //       if (!app.db.evolution.playerRewards[leaders[9].address].pending) app.db.evolution.playerRewards[leaders[9].address].pending = {}
                //       if (!app.db.evolution.playerRewards[leaders[9].address].pending.zod) app.db.evolution.playerRewards[leaders[9].address].pending.zod = 0
                //       app.db.evolution.playerRewards[leaders[9].address].pending.zod  = Math.round((app.db.evolution.playerRewards[leaders[9].address].pending.zod + app.config.rewardWinnerAmount * 0.05) * 1000) / 1000
                //     } catch(e) {
                //       log(e)
                //     }
                //   }
                // }
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
            games.evolution.realms[server.key].connection = client;
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
                if (!((_a = games.evolution.realms[server.key].connection) === null || _a === void 0 ? void 0 : _a.authed)) {
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
                if ((_b = (_a = games.evolution.realms[server.key]) === null || _a === void 0 ? void 0 : _a.connection) === null || _b === void 0 ? void 0 : _b.authed) {
                    (_d = (_c = games.evolution.realms[server.key]) === null || _c === void 0 ? void 0 : _c.connection) === null || _d === void 0 ? void 0 : (_g = _d.socket).emit.apply(_g, args);
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
