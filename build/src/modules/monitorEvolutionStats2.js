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
exports.monitorEvolutionStats2 = void 0;
var path_1 = __importDefault(require("path"));
var fs_jetpack_1 = __importDefault(require("fs-jetpack"));
var json_beautify_1 = __importDefault(require("json-beautify"));
var util_1 = require("../util");
function monitorEvolutionStats2(app) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var playerCount, _i, _c, server, rand, response, data, e_1, hist, oldTime_1, newTime_1, diff_1, oldTime, newTime, diff, e_2, _d, _e, server, rand, response, data, e_3, e_4;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 9, , 10]);
                    (0, util_1.log)('Update evolution historical 1');
                    if (!app.db.evolutionHistorical.playerCount)
                        app.db.evolutionHistorical.playerCount = [];
                    playerCount = 0;
                    _i = 0, _c = app.db.evolutionServers;
                    _f.label = 1;
                case 1:
                    if (!(_i < _c.length)) return [3 /*break*/, 8];
                    server = _c[_i];
                    _f.label = 2;
                case 2:
                    _f.trys.push([2, 5, , 6]);
                    rand = Math.floor(Math.random() * Math.floor(999999));
                    return [4 /*yield*/, fetch("https://".concat(server.endpoint, "/info?").concat(rand))];
                case 3:
                    response = _f.sent();
                    return [4 /*yield*/, response.json()];
                case 4:
                    data = _f.sent();
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
                    e_1 = _f.sent();
                    if ((e_1 + '').toString().indexOf('invalid json response body') === -1)
                        (0, util_1.log)(e_1);
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
                    _f.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 1];
                case 8:
                    fs_jetpack_1.default.write(path_1.default.resolve('./db/evolution/servers.json'), (0, json_beautify_1.default)(app.db.evolutionServers, null, 2), { atomic: true });
                    app.db.updateGames();
                    oldTime = (new Date(((_b = app.db.evolutionHistorical.playerCount[app.db.evolutionHistorical.playerCount.length - 1]) === null || _b === void 0 ? void 0 : _b[0]) || 0)).getTime();
                    newTime = (new Date()).getTime();
                    diff = newTime - oldTime;
                    if (diff / (1000 * 60 * 60 * 1) > 1) {
                        app.db.evolutionHistorical.playerCount.push([newTime, playerCount]);
                    }
                    fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/historical.json"), (0, json_beautify_1.default)(app.db.evolutionHistorical, null, 2), { atomic: true });
                    {
                        (0, util_1.log)('Update evolution historical 2');
                    }
                    return [3 /*break*/, 10];
                case 9:
                    e_2 = _f.sent();
                    (0, util_1.log)(e_2);
                    return [3 /*break*/, 10];
                case 10:
                    _f.trys.push([10, 18, , 19]);
                    (0, util_1.log)('Update evolution info');
                    _d = 0, _e = app.db.evolutionServers;
                    _f.label = 11;
                case 11:
                    if (!(_d < _e.length)) return [3 /*break*/, 17];
                    server = _e[_d];
                    if (server.status !== 'online')
                        return [3 /*break*/, 16];
                    _f.label = 12;
                case 12:
                    _f.trys.push([12, 15, , 16]);
                    rand = Math.floor(Math.random() * Math.floor(999999));
                    return [4 /*yield*/, fetch("https://".concat(server.endpoint, "/info?").concat(rand))];
                case 13:
                    response = _f.sent();
                    return [4 /*yield*/, response.json()];
                case 14:
                    data = _f.sent();
                    fs_jetpack_1.default.write(path_1.default.resolve("./db/evolution/".concat(server.key, "/info.json")), (0, json_beautify_1.default)(data, null, 2), { atomic: true });
                    return [3 /*break*/, 16];
                case 15:
                    e_3 = _f.sent();
                    (0, util_1.log)(e_3);
                    return [3 /*break*/, 16];
                case 16:
                    _d++;
                    return [3 /*break*/, 11];
                case 17: return [3 /*break*/, 19];
                case 18:
                    e_4 = _f.sent();
                    (0, util_1.log)(e_4);
                    return [3 /*break*/, 19];
                case 19:
                    setTimeout(function () { return monitorEvolutionStats2(app); }, 30 * 1000);
                    return [2 /*return*/];
            }
        });
    });
}
exports.monitorEvolutionStats2 = monitorEvolutionStats2;
