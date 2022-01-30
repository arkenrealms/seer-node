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
exports.updateGit = exports.getAddress = exports.toShort = exports.toLong = exports.removeDupes = exports.round = exports.wait = void 0;
var child_process_1 = require("child_process");
var ethers_1 = __importDefault(require("ethers"));
var util_1 = __importDefault(require("util"));
function wait(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
exports.wait = wait;
function round(num, precision) {
    var _precision = Math.pow(10, precision);
    return Math.ceil(num * _precision) / _precision;
}
exports.round = round;
function removeDupes(list) {
    var seen = {};
    return list.filter(function (item) {
        var k1 = item.seller + item.tokenId + item.blockNumber;
        var k2 = item.id;
        var exists = seen.hasOwnProperty(k1) || seen.hasOwnProperty(k2);
        if (!exists) {
            seen[k1] = true;
            seen[k2] = true;
        }
        return !exists;
    });
}
exports.removeDupes = removeDupes;
var toLong = function (x) { return ethers_1.default.utils.parseEther(x + ''); };
exports.toLong = toLong;
var toShort = function (x) { return round(parseFloat(ethers_1.default.utils.formatEther(x)), 4); };
exports.toShort = toShort;
var getAddress = function (address) {
    var mainNetChainId = 56;
    var chainId = process.env.REACT_APP_CHAIN_ID;
    return address[chainId] ? address[chainId] : address[mainNetChainId];
};
exports.getAddress = getAddress;
var updatingGit = false;
function updateGit() {
    return __awaiter(this, void 0, void 0, function () {
        var execPromise, e2_1, _a, err, stdout, stderr, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (updatingGit)
                        return [2 /*return*/];
                    updatingGit = true;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 8, , 9]);
                    execPromise = util_1.default.promisify(child_process_1.exec);
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, execPromise('rm ./db/.git/index.lock')];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e2_1 = _b.sent();
                    return [3 /*break*/, 5];
                case 5: return [4 /*yield*/, execPromise('cd db && git add -A && git commit -m "build: Binzy doz it" && git push --set-upstream origin master')];
                case 6:
                    _a = _b.sent(), err = _a.err, stdout = _a.stdout, stderr = _a.stderr;
                    console.log(err, stderr, stdout);
                    return [4 /*yield*/, wait(100)];
                case 7:
                    _b.sent();
                    return [3 /*break*/, 9];
                case 8:
                    e_1 = _b.sent();
                    console.log(e_1);
                    return [3 /*break*/, 9];
                case 9:
                    updatingGit = false;
                    return [2 /*return*/];
            }
        });
    });
}
exports.updateGit = updateGit;
