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
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitorGuildMemberDetails = void 0;
var util_1 = require("../util");
function monitorGuildMemberDetails(app) {
    return __awaiter(this, void 0, void 0, function () {
        var transformProfileResponse, _i, _a, g, guild, _b, _c, member, user, usernameSearch, hasRegistered, profileResponse, _d, userId, teamId, tokenId, nftAddress, isActive, _e, _f;
        var _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
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
                    _i = 0, _a = app.db.guilds;
                    _h.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 14];
                    g = _a[_i];
                    (0, util_1.log)(g);
                    guild = app.db.loadGuild(g.id);
                    guild.memberDetails = [];
                    _b = 0, _c = guild.members;
                    _h.label = 2;
                case 2:
                    if (!(_b < _c.length)) return [3 /*break*/, 11];
                    member = _c[_b];
                    user = app.db.loadUser(member);
                    if (!!user.username) return [3 /*break*/, 5];
                    return [4 /*yield*/, fetch("https://rune-api.binzy.workers.dev/users/".concat(user.address))];
                case 3: return [4 /*yield*/, ((_h.sent()).json())];
                case 4:
                    usernameSearch = _h.sent();
                    if (!!usernameSearch.message && usernameSearch.message === "No user exists" || !(usernameSearch.username)) {
                        return [3 /*break*/, 10];
                    }
                    else {
                        user.username = usernameSearch.username;
                    }
                    _h.label = 5;
                case 5: return [4 /*yield*/, app.contracts.arcaneProfile.hasRegistered(user.address)];
                case 6:
                    hasRegistered = (_h.sent());
                    if (!hasRegistered)
                        return [3 /*break*/, 10];
                    return [4 /*yield*/, app.contracts.arcaneProfile.getUserProfile(user.address)];
                case 7:
                    profileResponse = _h.sent();
                    _d = transformProfileResponse(profileResponse), userId = _d.userId, teamId = _d.teamId, tokenId = _d.tokenId, nftAddress = _d.nftAddress, isActive = _d.isActive;
                    if (teamId !== guild.id)
                        return [3 /*break*/, 10];
                    user.isGuildMembershipActive = isActive;
                    user.guildMembershipTokenId = tokenId;
                    _f = (_e = guild.memberDetails).push;
                    _g = {
                        address: user.address,
                        username: user.username,
                        points: user.points,
                        achievementCount: user.achievements.length,
                        isActive: user.isGuildMembershipActive
                    };
                    return [4 /*yield*/, app.contracts.arcaneCharacters.getCharacterId(tokenId)];
                case 8:
                    _f.apply(_e, [(_g.characterId = _h.sent(),
                            _g)]);
                    (0, util_1.log)("Sync guild ".concat(guild.id, " member ").concat(guild.memberDetails.length, " / ").concat(guild.memberCount));
                    return [4 /*yield*/, app.db.saveUser(user)];
                case 9:
                    _h.sent();
                    _h.label = 10;
                case 10:
                    _b++;
                    return [3 /*break*/, 2];
                case 11: return [4 /*yield*/, app.db.saveGuild(guild)];
                case 12:
                    _h.sent();
                    _h.label = 13;
                case 13:
                    _i++;
                    return [3 /*break*/, 1];
                case 14:
                    setTimeout(function () { return monitorGuildMemberDetails(app); }, 10 * 60 * 1000);
                    return [2 /*return*/];
            }
        });
    });
}
exports.monitorGuildMemberDetails = monitorGuildMemberDetails;
