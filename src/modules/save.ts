import { log } from '@rune-backend-sdk/util'

async function fastSaves(app) {
  log('[Save] Fast save')

  try {
    setTimeout(async () => await app.db.saveTrades(), 1 * 1000)
    setTimeout(async () => await app.db.saveFarms(), 25 * 1000)
    setTimeout(async () => await app.db.saveStats(), 35 * 1000)
    setTimeout(async () => await app.db.saveRunes(), 40 * 1000)
    setTimeout(async () => await app.db.saveOracle(), 45 * 1000)
  } catch(e) {
    console.log('Save error', e)
  }

  setTimeout(() => fastSaves(app), 2 * 60 * 1000)
}

async function slowSaves(app) {
  log('[Save] Slow save')

  try {
    setTimeout(async () => await app.db.saveTradesEvents(), 5 * 1000)
    setTimeout(async () => await app.db.saveItemsEvents(), 10 * 1000)
    setTimeout(async () => await app.db.saveCharactersEvents(), 15 * 1000)
    setTimeout(async () => await app.db.saveBarracksEvents(), 20 * 1000)
    setTimeout(async () => await app.db.saveGuilds(), 30 * 1000)
    setTimeout(async () => await app.db.saveHistorical(), 45 * 1000)
    setTimeout(async () => await app.db.saveLeaderboard(), 2 * 60 * 1000)
    setTimeout(async () => await app.db.saveEvolution(), 3 * 60 * 1000)
    setTimeout(async () => await app.db.saveConfig(), 3.5 * 60 * 1000)
    // setTimeout(async () => await app.db.saveApp(), 1 * 1000)
    // setTimeout(async () => await app.db.updateGit(), 1 * 1000)
  } catch(e) {
    console.log('Save error', e)
  }

  setTimeout(() => slowSaves(app), 5 * 60 * 1000)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

let isSaverRunning = false

async function processQueuedSaves(app) {
  if (isSaverRunning) return

  isSaverRunning = true

  while(1) {
    try {
      await app.db.processSave()
    } catch(e) {
      console.log('Process queued save error', e)
    }

    await sleep(0.1 * 1000)
  }
}

export async function monitorSaves(app) {
  setTimeout(function() {
    setTimeout(() => fastSaves(app), 0)
    setTimeout(() => slowSaves(app), 2 * 60 * 1000)
  }, 3 * 60 * 1000)

  setTimeout(() => processQueuedSaves(app), 1 * 1000)
}