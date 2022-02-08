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
exports.initCubeBridge = void 0;
var fs_1 = __importDefault(require("fs"));
var express_1 = __importDefault(require("express"));
var util_1 = require("../util");
var websocketUtil = __importStar(require("../util/websocket"));
var path = require('path');
function initEventHandler(app) {
    var _a = app.cubeBridge, emitDirect = _a.emitDirect, emitAll = _a.emitAll, io = _a.io;
    io.on('connection', function (socket) {
        try {
            // Use by GS to tell DB it's connected
            socket.on('RC_AuthRequest', function (req) {
                if (req.data !== 'myverysexykey') {
                    (0, util_1.log)('Invalid databaser creds:', req);
                    emitDirect(socket, 'RC_AuthResponse', {
                        id: req.id,
                        data: { status: 0 }
                    });
                    return;
                }
                socket.authed = true;
                emitDirect(socket, 'RC_AuthResponse', {
                    id: req.id,
                    data: { status: 1 }
                });
            });
            socket.on('RC_GetUserRequest', function (req) {
                if (!socket.authed) {
                    emitDirect(socket, 'RC_GetUserResponse', {
                        id: req.id,
                        data: {
                            status: 0
                        }
                    });
                    return;
                }
                emitDirect(socket, 'RC_GetUserResponse', {
                    id: req.id,
                    data: {
                        status: 1,
                        user: app.db.loadUser(req.data.address)
                    }
                });
            });
            socket.on('RC_ReduceRewardsRequest', function (req) {
                return __awaiter(this, void 0, void 0, function () {
                    var user, _i, _a, rune, _b, _c, item, e_1;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                if (!socket.authed) {
                                    emitDirect(socket, 'RC_ReduceRewardsResponse', {
                                        id: req.id,
                                        data: {
                                            status: 0
                                        }
                                    });
                                    return [2 /*return*/];
                                }
                                _d.label = 1;
                            case 1:
                                _d.trys.push([1, 3, , 4]);
                                console.log(req);
                                user = app.db.loadUser(req.data.address);
                                if (!user.rewardHistory)
                                    user.rewardHistory = [];
                                for (_i = 0, _a = req.data.runes; _i < _a.length; _i++) {
                                    rune = _a[_i];
                                    user.rewardHistory.push({
                                        rune: rune.key,
                                        value: rune.value
                                    });
                                    user.rewards.runes[rune.key] -= rune.value;
                                }
                                for (_b = 0, _c = req.data.items; _b < _c.length; _b++) {
                                    item = _c[_b];
                                    user.rewardHistory.push({
                                        item: JSON.parse(JSON.stringify(user.rewards.items[item.key]))
                                    });
                                    delete user.rewards.items[item.key];
                                }
                                return [4 /*yield*/, app.db.saveUser(user)];
                            case 2:
                                _d.sent();
                                emitDirect(socket, 'RC_ReduceRewardsResponse', {
                                    id: req.id,
                                    data: {
                                        status: 1
                                    }
                                });
                                return [3 /*break*/, 4];
                            case 3:
                                e_1 = _d.sent();
                                (0, util_1.logError)(e_1);
                                emitDirect(socket, 'RC_ReduceRewardsResponse', {
                                    id: req.id,
                                    data: {
                                        status: 0
                                    }
                                });
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                });
            });
            socket.on('RC_EvolutionRealmListRequest', function (req) {
                if (!socket.authed) {
                    emitDirect(socket, 'RC_EvolutionRealmListResponse', {
                        id: req.id,
                        data: {
                            status: 0
                        }
                    });
                    return;
                }
                emitDirect(socket, 'RC_EvolutionRealmListResponse', {
                    id: req.id,
                    data: {
                        status: 1,
                        list: app.db.evolutionServers
                    }
                });
            });
            socket.onAny(function (eventName, res) {
                // log('onAny', eventName, res)
                if (!res || !res.id)
                    return;
                // console.log(eventName, res)
                if (app.cubeBridge.ioCallbacks[res.id]) {
                    (0, util_1.log)('Callback', eventName);
                    app.cubeBridge.ioCallbacks[res.id](res.data);
                    delete app.cubeBridge.ioCallbacks[res.id];
                }
            });
            socket.on('disconnect', function () {
            });
        }
        catch (e) {
            (0, util_1.logError)(e);
        }
    });
}
function initCubeBridge(app) {
    return __awaiter(this, void 0, void 0, function () {
        var isHttps, sslPort_1, port_1;
        return __generator(this, function (_a) {
            app.cubeBridge = {};
            app.cubeBridge.ioCallbacks = {};
            app.cubeBridge.server = (0, express_1.default)();
            isHttps = false // process.env.SUDO_USER === 'dev' || process.env.OS_FLAVOUR === 'debian-10'
            ;
            if (isHttps) {
                app.cubeBridge.https = require('https').createServer({
                    key: fs_1.default.readFileSync(path.resolve('./privkey.pem')),
                    cert: fs_1.default.readFileSync(path.resolve('./fullchain.pem'))
                }, app.cubeBridge.server);
            }
            else {
                app.cubeBridge.http = require('http').Server(app.cubeBridge.server);
            }
            app.cubeBridge.io = require('socket.io')(isHttps ? app.cubeBridge.https : app.cubeBridge.http, {
                secure: isHttps ? true : false,
                pingInterval: 30005,
                pingTimeout: 5000,
                upgradeTimeout: 3000,
                allowUpgrades: true,
                cookie: false,
                serveClient: true,
                allowEIO3: false,
                cors: {
                    origin: "*"
                }
            });
            // Finalize
            if (isHttps) {
                sslPort_1 = process.env.CUBE_BRIDGE_PORT || 443;
                app.cubeBridge.https.listen(sslPort_1, function () {
                    (0, util_1.log)(":: Backend ready and listening on *:".concat(sslPort_1));
                });
            }
            else {
                port_1 = process.env.CUBE_BRIDGE_PORT || 7777;
                app.cubeBridge.http.listen(port_1, function () {
                    (0, util_1.log)(":: Backend ready and listening on *:".concat(port_1));
                });
            }
            app.cubeBridge.emitDirect = websocketUtil.emitDirect.bind(null, app.cubeBridge.io);
            app.cubeBridge.emitAll = websocketUtil.emitAll.bind(null, app.cubeBridge.io);
            initEventHandler(app);
            return [2 /*return*/];
        });
    });
}
exports.initCubeBridge = initCubeBridge;
