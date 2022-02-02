
export async function monitorSaves(app) {
  try {
    await app.db.saveTrades()
    await app.db.saveTradesEvents()
    await app.db.saveItemsEvents()
    await app.db.saveCharactersEvents()
    await app.db.saveBarracksEvents()
    await app.db.saveFarms()
    await app.db.saveGuilds()
    await app.db.saveStats()
    await app.db.saveRunes()
    await app.db.saveHistorical()
    await app.db.saveApp()
    await app.db.saveConfig()
    // await app.db.updateGit()
  } catch(e) {
    console.log('Git error', e)
  }

  setTimeout(() => monitorSaves(app), 5 * 60 * 1000)
}