import fetch from 'node-fetch'
import path from 'path'
import jetpack from 'fs-jetpack'
import beautify from 'json-beautify'
import { log } from '../util'
import { fancyTimeFormat } from '../util/time'

export async function monitorEvolutionStats2(app) {

  // Update evolution historical
  try {
    {
      log('Update evolution historical 1')

      if (!app.db.evolutionHistorical.playerCount) app.db.evolutionHistorical.playerCount = []

      let playerCount = 0

      for (const server of app.db.evolutionServers) {
        try {
          const rand = Math.floor(Math.random() * Math.floor(999999))
          const response = await fetch(`https://${server.endpoint}/info?${rand}`)
        
          let data = await response.json()

          server.playerCount = data.playerTotal
          server.speculatorCount = data.speculatorTotal
          server.version = data.version
          server.rewardItemAmount = data.rewardItemAmount
          server.rewardWinnerAmount = data.rewardWinnerAmount
          server.gameMode = data.gameMode
          server.roundId = data.round.id
          server.roundStartedAt = data.round.startedAt
          server.timeLeft = ~~(5 * 60 - (((new Date().getTime()) / 1000 - data.round.startedAt)))
          server.timeLeftText = fancyTimeFormat(5 * 60 - (((new Date().getTime()) / 1000 - data.round.startedAt)))
          // server.totalLegitPlayers = data.totalLegitPlayers

          server.status = "online"
        } catch(e) {
          if ((e + '').toString().indexOf('invalid json response body') === -1) log(e)

          server.status = "offline"
          server.playerCount = 0
          server.speculatorCount = 0
          server.rewardItemAmount = 0
          server.rewardWinnerAmount = 0
        }

        const hist = jetpack.read(path.resolve(`./db/evolution/${server.key}/historical.json`), 'json') || {}

        if (!hist.playerCount) hist.playerCount = []

        const oldTime = (new Date(hist.playerCount[hist.playerCount.length-1]?.[0] || 0)).getTime()
        const newTime = (new Date()).getTime()
        const diff = newTime - oldTime
        if (diff / (1000 * 60 * 60 * 1) > 1) {
          hist.playerCount.push([newTime, server.playerCount])
        }

        jetpack.write(path.resolve(`./db/evolution/${server.key}/historical.json`), beautify(hist, null, 2), { atomic: true })

        playerCount += server.playerCount
      }

      jetpack.write(path.resolve('./db/evolution/servers.json'), beautify(app.db.evolutionServers, null, 2), { atomic: true })

      // app.db.updateGames()

      const oldTime = (new Date(app.db.evolutionHistorical.playerCount[app.db.evolutionHistorical.playerCount.length-1]?.[0] || 0)).getTime()
      const newTime = (new Date()).getTime()
      const diff = newTime - oldTime
      if (diff / (1000 * 60 * 60 * 1) > 1) {
        app.db.evolutionHistorical.playerCount.push([newTime, playerCount])
      }

      jetpack.write(path.resolve(`./db/evolution/historical.json`), beautify(app.db.evolutionHistorical, null, 2), { atomic: true })
    }
    {
      log('Update evolution historical 2')
    }
  } catch(e) {
    log(e)
  }

  // Update evolution info
  try {
    log('Update evolution info')
    for (const server of app.db.evolutionServers) {
      if (server.status !== 'online') continue
      try {
        const rand = Math.floor(Math.random() * Math.floor(999999))
        const response = await fetch(`https://${server.endpoint}/info?${rand}`)
      
        const data = await response.json()

        jetpack.write(path.resolve(`./db/evolution/${server.key}/info.json`), beautify(data, null, 2), { atomic: true })
      } catch(e) {
        log(e)
      }
    }
  } catch(e) {
    log(e)
  }

  setTimeout(() => monitorEvolutionStats2(app), 30 * 1000)
}
