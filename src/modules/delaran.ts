import { isValidRequest, getSignedRequest } from '@rune-backend-sdk/util/web3'

async function monitorPlayerConnections(app) {
  let connectedPlayers = []
  let warnPlayers = []
  
  for (const realm of app.db.evolutionRealms) {
    for (const game of app.games.evolution.realms[realm.key].games) {
      for (const player of game.connectedPlayers) {
        if (connectedPlayers.includes(player)) {
          warnPlayers.push(player)
        }
      }

      connectedPlayers = [...connectedPlayers, ...game.connectedPlayers]
    }
  }
  
  for (const realm of app.db.infiniteRealms) {
    for (const game of app.games.infinite.realms[realm.key].games) {
      for (const player of game.connectedPlayers) {
        if (connectedPlayers.includes(player)) {
          warnPlayers.push(player)
        }
      }

      connectedPlayers = [...connectedPlayers, ...game.connectedPlayers]
    }
  }

  warnPlayers.push('0x1a367CA7bD311F279F1dfAfF1e60c4d797Faa6eb') // Testman

  for (const player of warnPlayers) {
    const data = { target: player }
    const signature = await getSignedRequest(app.web3, app.secrets.find(s => s.id === 'evolution-signer'), data)
  
    app.realm.emitAll('CallRequest', { method: 'RS_KickUser', signature, data: { data } })
  }
}

export async function engageDelaran(app) {
  if (!app.delaran) {
    app.delaran = {}
  }

  setTimeout(() => monitorPlayerConnections(app), 60 * 1000)
}
