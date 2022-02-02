"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitorMarketEvents = exports.saveToken = exports.migrateTrades = exports.updateUserAchievements = void 0;
function updateUserAchievements(app) {
    var user = app.db.loadUser('0x37470038C615Def104e1bee33c710bD16a09FdEf');
    app.db.updateAchievementsByUser(user);
    app.db.saveUser(user);
}
exports.updateUserAchievements = updateUserAchievements;
function migrateTrades(app) {
    migrateTrades(app);
}
exports.migrateTrades = migrateTrades;
function saveToken(app) {
    var token = app.db.loadToken('100300001010009000300020000000000000000000000000000000000000000000000000694');
    saveToken(token);
}
exports.saveToken = saveToken;
function monitorMarketEvents(app) {
    setTimeout(function () { return app.modules.getAllMarketEvents(app); }, 1 * 60 * 1000);
}
exports.monitorMarketEvents = monitorMarketEvents;
