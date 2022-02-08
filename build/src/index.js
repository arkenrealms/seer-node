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
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = __importStar(require("dotenv"));
var util_1 = require("./util");
var process_1 = require("./util/process");
var config_1 = require("./modules/config");
var db_1 = require("./modules/db");
var web3_1 = require("./modules/web3");
var getAllItemEvents_1 = require("./modules/getAllItemEvents");
var getAllBarracksEvents_1 = require("./modules/getAllBarracksEvents");
var getAllMarketEvents_1 = require("./modules/getAllMarketEvents");
var getAllCharacterEvents_1 = require("./modules/getAllCharacterEvents");
var monitorGuildMemberDetails_1 = require("./modules/monitorGuildMemberDetails");
var monitorSaves_1 = require("./modules/monitorSaves");
var monitorEvolutionStats2_1 = require("./modules/monitorEvolutionStats2");
var monitorItemEvents_1 = require("./modules/monitorItemEvents");
var monitorBarracksEvents_1 = require("./modules/monitorBarracksEvents");
var monitorMarketEvents_1 = require("./modules/monitorMarketEvents");
var monitorCharacterEvents_1 = require("./modules/monitorCharacterEvents");
var monitorGeneralStats_1 = require("./modules/monitorGeneralStats");
var monitorCraftingStats_1 = require("./modules/monitorCraftingStats");
var monitorEvolutionStats_1 = require("./modules/monitorEvolutionStats");
var monitorMeta_1 = require("./modules/monitorMeta");
var monitorCoordinator_1 = require("./modules/monitorCoordinator");
var cube_bridge_1 = require("./modules/cube-bridge");
var tests = __importStar(require("./tests"));
dotenv.config();
process.env.REACT_APP_PUBLIC_URL = "https://rune.game/";
if (util_1.isDebug) {
    (0, util_1.log)('Running DB in DEBUG mode');
}
function init() {
    return __awaiter(this, void 0, void 0, function () {
        var app_1, _loop_1, _i, _a, module_1, e_1;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    (0, process_1.catchExceptions)();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, , 7]);
                    app_1 = {};
                    app_1.subProcesses = process_1.subProcesses;
                    app_1.flags = {};
                    app_1.moduleConfig = [
                        {
                            name: 'initConfig',
                            instance: config_1.initConfig,
                            async: false,
                            timeout: 0
                        },
                        {
                            name: 'initDb',
                            instance: db_1.initDb,
                            async: false,
                            timeout: 0
                        },
                        {
                            name: 'initWeb3',
                            instance: web3_1.initWeb3,
                            async: false,
                            timeout: 0
                        },
                        // {
                        //   name: 'convertRewards',
                        //   instance: convertRewards,
                        //   async: true,
                        //   timeout: 0
                        // },
                        {
                            name: 'initCubeBridge',
                            instance: cube_bridge_1.initCubeBridge,
                            async: false,
                            timeout: 0
                        },
                        // {
                        //   name: 'monitorRealmServers',
                        //   instance: monitorRealmServers,
                        //   async: false,
                        //   timeout: 0
                        // },
                        {
                            name: 'getAllItemEvents',
                            instance: getAllItemEvents_1.getAllItemEvents,
                            async: false,
                            timeout: 1 * 60 * 1000
                        },
                        {
                            name: 'getAllBarracksEvents',
                            instance: getAllBarracksEvents_1.getAllBarracksEvents,
                            async: false,
                            timeout: 1 * 60 * 1000
                        },
                        {
                            name: 'getAllCharacterEvents',
                            instance: getAllCharacterEvents_1.getAllCharacterEvents,
                            async: false,
                            timeout: 1 * 60 * 1000
                        },
                        {
                            name: 'monitorGuildMemberDetails',
                            instance: monitorGuildMemberDetails_1.monitorGuildMemberDetails,
                            async: false,
                            timeout: 1 * 60 * 1000
                        },
                        {
                            name: 'monitorSaves',
                            instance: monitorSaves_1.monitorSaves,
                            async: false,
                            timeout: 5 * 60 * 1000
                        },
                        {
                            name: 'monitorEvolutionStats',
                            instance: monitorEvolutionStats_1.monitorEvolutionStats,
                            async: true,
                            timeout: 0
                        },
                        {
                            name: 'monitorEvolutionStats2',
                            instance: monitorEvolutionStats2_1.monitorEvolutionStats2,
                            async: false,
                            timeout: 1 * 10 * 1000
                        },
                        {
                            name: 'getAllMarketEvents',
                            instance: getAllMarketEvents_1.getAllMarketEvents,
                            async: true,
                            timeout: 0
                        },
                        {
                            name: 'monitorItemEvents',
                            instance: monitorItemEvents_1.monitorItemEvents,
                            async: true,
                            timeout: 0
                        },
                        {
                            name: 'monitorBarracksEvents',
                            instance: monitorBarracksEvents_1.monitorBarracksEvents,
                            async: true,
                            timeout: 0
                        },
                        {
                            name: 'monitorMarketEvents',
                            instance: monitorMarketEvents_1.monitorMarketEvents,
                            async: true,
                            timeout: 0
                        },
                        {
                            name: 'monitorCharacterEvents',
                            instance: monitorCharacterEvents_1.monitorCharacterEvents,
                            async: true,
                            timeout: 0
                        },
                        {
                            name: 'monitorGeneralStats',
                            instance: monitorGeneralStats_1.monitorGeneralStats,
                            async: true,
                            timeout: 0
                        },
                        {
                            name: 'monitorCraftingStats',
                            instance: monitorCraftingStats_1.monitorCraftingStats,
                            async: true,
                            timeout: 0
                        },
                        {
                            name: 'monitorMeta',
                            instance: monitorMeta_1.monitorMeta,
                            async: true,
                            timeout: 0
                        },
                        {
                            name: 'monitorCoordinator',
                            instance: monitorCoordinator_1.monitorCoordinator,
                            async: true,
                            timeout: 0
                        },
                    ];
                    app_1.modules = {};
                    _loop_1 = function (module_1) {
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    app_1.modules[module_1.name] = module_1.instance;
                                    if (!module_1.timeout) return [3 /*break*/, 1];
                                    setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    if (!module_1.async) return [3 /*break*/, 2];
                                                    return [4 /*yield*/, module_1.instance(app_1)];
                                                case 1:
                                                    _a.sent();
                                                    return [3 /*break*/, 3];
                                                case 2:
                                                    module_1.instance(app_1);
                                                    _a.label = 3;
                                                case 3: return [2 /*return*/];
                                            }
                                        });
                                    }); }, module_1.timeout);
                                    return [3 /*break*/, 4];
                                case 1:
                                    if (!module_1.async) return [3 /*break*/, 3];
                                    return [4 /*yield*/, module_1.instance(app_1)];
                                case 2:
                                    _c.sent();
                                    return [3 /*break*/, 4];
                                case 3:
                                    module_1.instance(app_1);
                                    _c.label = 4;
                                case 4: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, _a = app_1.moduleConfig;
                    _b.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 5];
                    module_1 = _a[_i];
                    return [5 /*yield**/, _loop_1(module_1)];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    if (app_1.flags.testMigrateTrades)
                        tests.migrateTrades(app_1);
                    if (app_1.flags.testUpdateUserAchievements)
                        tests.updateUserAchievements(app_1);
                    if (app_1.flags.testSaveToken)
                        tests.saveToken(app_1);
                    if (app_1.flags.testMonitorMarketEvents)
                        tests.monitorMarketEvents(app_1);
                    return [3 /*break*/, 7];
                case 6:
                    e_1 = _b.sent();
                    (0, util_1.logError)(e_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
init();
// Force restart after an hour
setTimeout(function () {
    process.exit(1);
}, 1 * 60 * 60 * 1000);
