"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initConfig = void 0;
var fs_jetpack_1 = __importDefault(require("fs-jetpack"));
var path_1 = __importDefault(require("path"));
function initConfig(app) {
    app.config = fs_jetpack_1.default.read(path_1.default.resolve('./db/config.json'), 'json');
    app.config.trades.updating = false;
    app.config.barracks.updating = false;
    app.config.blacksmith.updating = false;
    app.config.items.updating = false;
    app.config.characters.updating = false;
    app.config.test.updating = false;
}
exports.initConfig = initConfig;
