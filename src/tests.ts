

export function updateUserAchievements(app) {
  const user = app.db.loadUser('0x37470038C615Def104e1bee33c710bD16a09FdEf')
  app.db.updateAchievementsByUser(user)
  app.db.saveUser(user)
}

export function migrateTrades(app) {
  migrateTrades(app)
}

export function saveToken(app) {
  const token = app.db.loadToken('100300001010009000300020000000000000000000000000000000000000000000000000694')
  saveToken(token)
}

export function monitorMarketEvents(app) {
  setTimeout(() => app.modules.getAllMarketEvents(app), 1 * 60 * 1000)
}