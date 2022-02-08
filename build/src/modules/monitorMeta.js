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
exports.monitorMeta = void 0;
var path_1 = __importDefault(require("path"));
var fs_jetpack_1 = __importDefault(require("fs-jetpack"));
var json_beautify_1 = __importDefault(require("json-beautify"));
var achievements_1 = require("../data/achievements");
var items_type_1 = require("../data/items.type");
var items_1 = require("../data/items");
function monitorMeta(app) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, _a, _item, item, itemJson;
        return __generator(this, function (_b) {
            console.log('Saving achievement data');
            fs_jetpack_1.default.write(path_1.default.resolve('./db/achievements.json'), (0, json_beautify_1.default)(achievements_1.achievementData, null, 2), { atomic: true });
            console.log('Saving item data');
            fs_jetpack_1.default.write(path_1.default.resolve('./db/items.json'), (0, json_beautify_1.default)(items_1.itemData, null, 2), { atomic: true });
            console.log('Saving item attribute data');
            fs_jetpack_1.default.write(path_1.default.resolve('./db/itemAttributes.json'), (0, json_beautify_1.default)(items_1.ItemAttributes, null, 2), { atomic: true });
            console.log('Saving skill data');
            fs_jetpack_1.default.write(path_1.default.resolve('./db/skills.json'), (0, json_beautify_1.default)(items_1.SkillNames, null, 2), { atomic: true });
            console.log('Saving class data');
            fs_jetpack_1.default.write(path_1.default.resolve('./db/classes.json'), (0, json_beautify_1.default)(items_1.ClassNames, null, 2), { atomic: true });
            console.log('Saving item rarity data');
            fs_jetpack_1.default.write(path_1.default.resolve('./db/itemRarity.json'), (0, json_beautify_1.default)(items_1.ItemRarity, null, 2), { atomic: true });
            console.log('Saving item type data');
            fs_jetpack_1.default.write(path_1.default.resolve('./db/itemTypes.json'), (0, json_beautify_1.default)(items_1.ItemTypeToText, null, 2), { atomic: true });
            console.log('Saving item slot data');
            fs_jetpack_1.default.write(path_1.default.resolve('./db/itemSlots.json'), (0, json_beautify_1.default)(items_1.ItemSlotToText, null, 2), { atomic: true });
            try {
                for (_i = 0, _a = items_1.itemData[items_type_1.ItemsMainCategoriesType.OTHER]; _i < _a.length; _i++) {
                    _item = _a[_i];
                    item = _item;
                    item.icon = item.icon.replace('undefined', 'https://rune.game/');
                    if (item.recipe) {
                        item.recipe.requirement = item.recipe.requirement.map(function (r) { return (__assign(__assign({}, r), { id: items_1.RuneNames[r.id] })); });
                    }
                    item.branches[1].attributes.map(function (a) { return (__assign(__assign({}, a), { description: items_1.ItemAttributesById[a.id].description })); });
                    itemJson = __assign(__assign({ "description": Array.isArray(item.branches[1].description) ? item.branches[1].description[0] : item.branches[1].description, "home_url": "https://rune.game", "external_url": "https://rune.game/catalog/" + item.id, "image_url": item.icon, "language": "en-US" }, item), { "type": items_1.ItemTypeToText[item.type], "slots": item.slots.map(function (s) { return items_1.ItemSlotToText[s]; }) });
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
            setTimeout(function () { return monitorMeta(app); }, 10 * 60 * 1000);
            return [2 /*return*/];
        });
    });
}
exports.monitorMeta = monitorMeta;
