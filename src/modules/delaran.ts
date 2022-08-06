import { isValidRequest, getSignedRequest } from '@rune-backend-sdk/util/web3'
import { getHighestId, toShort, log } from '@rune-backend-sdk/util'

async function monitorPlayerConnections(app) {
  log('[delaran] Monitoring player connections')

  try {
    let connectedPlayers = []
    let warnPlayers = []
    
    for (const realm of app.db.evolution.realms) {
      if (app.games.evolution.realms[realm.key]?.games) {
        for (const game of app.games.evolution.realms[realm.key].games) {
          for (const player of game.connectedPlayers) {
            if (connectedPlayers.includes(player)) {
              warnPlayers.push(player)
            }
          }

          connectedPlayers = [...connectedPlayers, ...game.connectedPlayers]
        }
      }
    }
    
    for (const realm of app.db.infinite.realms) {
      if (app.games.infinite.realms[realm.key]?.games) {
        for (const game of app.games.infinite.realms[realm.key].games) {
          for (const player of game.connectedPlayers) {
            if (connectedPlayers.includes(player)) {
              warnPlayers.push(player)
            }
          }
    
          connectedPlayers = [...connectedPlayers, ...game.connectedPlayers]
        }
      }
    }

    // warnPlayers.push('0x1a367CA7bD311F279F1dfAfF1e60c4d797Faa6eb') // Testman

    for (const player of warnPlayers) {
      const data = { target: player }
      const signature = await getSignedRequest(app.web3, app.secrets.find(s => s.id === 'evolution-signer'), data)
    
      app.realm.emitAll('CallRequest', { data: { method: 'RS_KickUser', signature, data } })

      const user = await app.db.loadUser(player)

      if (!user.warnings) user.warnings = {}
      if (!user.warnings.delaran) user.warnings.delaran = 0

      user.warnings.delaran += 1

      await app.db.saveUser(user)
    }

    log(`[delaran] Warned players: ${warnPlayers.join(', ')}`)
  } catch(e) {
    log('Error in delaran', e)
  }

  setTimeout(() => monitorPlayerConnections(app), 60 * 1000)
}

export async function engageDelaran(app) {
  if (!app.delaran) {
    app.delaran = {}
  }

  setTimeout(() => monitorPlayerConnections(app), 60 * 1000)
}
