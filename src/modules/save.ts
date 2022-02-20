
export async function monitorSaves(app) {
  try {
    setTimeout(async () => await app.db.saveTrades(), 1 * 1000)
    setTimeout(async () => await app.db.saveTradesEvents(), 5 * 1000)
    setTimeout(async () => await app.db.saveItemsEvents(), 10 * 1000)
    setTimeout(async () => await app.db.saveCharactersEvents(), 15 * 1000)
    setTimeout(async () => await app.db.saveBarracksEvents(), 20 * 1000)
    setTimeout(async () => await app.db.saveFarms(), 25 * 1000)
    setTimeout(async () => await app.db.saveGuilds(), 30 * 1000)
    setTimeout(async () => await app.db.saveStats(), 35 * 1000)
    setTimeout(async () => await app.db.saveRunes(), 40 * 1000)
    setTimeout(async () => await app.db.saveHistorical(), 45 * 1000)
    // setTimeout(async () => await app.db.saveApp(), 1 * 1000)
    setTimeout(async () => await app.db.saveConfig(), 50 * 1000)
    // setTimeout(async () => await app.db.updateGit(), 1 * 1000)
  } catch(e) {
    console.log('Save error', e)
  }

  setTimeout(() => monitorSaves(app), 10 * 60 * 1000)
}