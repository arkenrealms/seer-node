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
exports.monitorCraftingStats = void 0;
var path_1 = __importDefault(require("path"));
var fs_jetpack_1 = __importDefault(require("fs-jetpack"));
var json_beautify_1 = __importDefault(require("json-beautify"));
var util_1 = require("../util");
function monitorCraftingStats(app) {
    return __awaiter(this, void 0, void 0, function () {
        var craftersData, craftingCompetition1Data, craftingCompetition2Data, craftingCompetition3Data, data;
        return __generator(this, function (_a) {
            // Update crafting competitions
            {
                (0, util_1.log)('Update crafting competitions');
                craftersData = fs_jetpack_1.default.read(path_1.default.resolve('../db/crafting/overall.json'), 'json');
                craftingCompetition1Data = fs_jetpack_1.default.read(path_1.default.resolve('../db/crafting/competition1.json'), 'json');
                craftingCompetition2Data = fs_jetpack_1.default.read(path_1.default.resolve('../db/crafting/competition2.json'), 'json');
                craftingCompetition3Data = fs_jetpack_1.default.read(path_1.default.resolve('../db/crafting/competition3.json'), 'json');
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
                fs_jetpack_1.default.write(path_1.default.resolve('../db/crafting/leaderboard.json'), (0, json_beautify_1.default)(data, null, 2), { atomic: true });
            }
            setTimeout(function () { return monitorCraftingStats(app); }, 2 * 60 * 1000);
            return [2 /*return*/];
        });
    });
}
exports.monitorCraftingStats = monitorCraftingStats;
