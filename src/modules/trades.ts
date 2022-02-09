export async function migrateTrades(app) {
  for (const trade of app.db.trades) {
    delete trade.item
  }

  await app.db.saveTrades()
}
