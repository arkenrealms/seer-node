import fetch from 'node-fetch'
import path from 'path'
import jetpack, { find } from 'fs-jetpack'
import beautify from 'json-beautify'
import { fancyTimeFormat } from '../util/time'
import md5 from 'js-md5'
import { log, logError } from '../util'
import { getClientSocket } from '../util/socket'
import { verifySignature, getSignedRequest } from '../util/web3'

const shortId = require('shortid')

async function onCommand() {

}

async function sendCommand() {

}


async function signCommand() {

}

async function isConnected() {

}

const ioCallbacks = {}

async function rsCall(client, name, data = undefined) {
  return new Promise(resolve => {
    const id = shortId()
    
    ioCallbacks[id] = resolve

    client.reqTimeout = setTimeout(function() {
      resolve({ status: 0, message: 'Request timeout' })

      delete ioCallbacks[id]
    }, 5 * 1000)

    if (!client.socket?.connected) {
      logError('Not connected to realm server.')
      return
    }

    log('Emit Realm', name, { id, data })

    client.socket.emit(name, { id, data })
  })
}

const games = {
  raid: {
    realms: {}
  },
  evolution: {
    realms: {}
  },
  infinite: {
    realms: {}
  },
  guardians: {
    realms: {}
  },
  sanctuary: {
    realms: {}
  }
}

function setRealmOffline(realm) {
  realm.status = 'offline'
  realm.playerCount = 0
  realm.speculatorCount = 0
  realm.rewardItemAmount = 0
  realm.rewardWinnerAmount = 0
}

async function setRealmConfig(app, realm) {
  const configRes = await rsCall(games.evolution.realms[realm.key].client, 'SetConfigRequest', app.db.evolutionConfig) as any

  if (configRes.status !== 1) {
    setRealmOffline(realm)
    return
  }
}

async function updateRealm(app, realm) {
  try {
    const infoRes = await rsCall(games.evolution.realms[realm.key].client, 'InfoRequest') as any

    if (!infoRes || infoRes.status !== 1) {
      setRealmOffline(realm)
      return
    }
    
    const { data } = infoRes

    realm.playerCount = data.playerCount
    realm.speculatorCount = data.speculatorCount
    realm.version = data.version

    realm.games = data.games.map(game => ({
      id: game.id,
      playerCount: game.playerTotal,
      speculatorCount: game.speculatorTotal,
      version: game.version,
      rewardItemAmount: game.rewardItemAmount,
      rewardWinnerAmount: game.rewardWinnerAmount,
      gameMode: game.gameMode,
      roundId: game.round.id,
      roundStartedAt: game.round.startedAt,
      timeLeft: ~~(5 * 60 - (((new Date().getTime()) / 1000 - game.round.startedAt))),
      timeLeftText: fancyTimeFormat(5 * 60 - (((new Date().getTime()) / 1000 - game.round.startedAt))),
      endpoint: (function() { const url = new URL((process.env.RUNE_ENV === 'local' ? 'http://' : 'https://') + realm.endpoint); url.port = game.port; return url.toString(); })().replace('http://', '').replace('https://', '').replace('/', '')
    }))
    // realm.totalLegitPlayers = data.totalLegitPlayers

    delete realm.timeLeftFancy

    realm.status = 'online'
  } catch(e) {
    logError(e)

    realm.status = 'offline'
    realm.playerCount = 0
    realm.speculatorCount = 0
    realm.rewardItemAmount = 0
    realm.rewardWinnerAmount = 0
  }

  // log('Updated server', server)

  return realm
}

async function updateRealms(app) {
  log('Updating Evolution realms')

  let playerCount = 0

  for (const realm of app.db.evolutionRealms) {
    await updateRealm(app, realm)

    const hist = jetpack.read(path.resolve(`./db/evolution/${realm.key}/historical.json`), 'json') || {}

    if (!hist.playerCount) hist.playerCount = []

    const oldTime = (new Date(hist.playerCount[hist.playerCount.length-1]?.[0] || 0)).getTime()
    const newTime = (new Date()).getTime()
    const diff = newTime - oldTime
    if (diff / (1000 * 60 * 60 * 1) > 1) {
      hist.playerCount.push([newTime, realm.playerCount])
    }

    jetpack.write(path.resolve(`./db/evolution/${realm.key}/historical.json`), beautify(hist, null, 2), { atomic: true })

    playerCount += realm.playerCount

    log(`Realm server updated: ${realm.key}`)
  }

  app.db.evolution.playerCount = playerCount

  for (const server of app.db.evolutionServers) {
    server.status = 'offline'
  }

  const evolutionServers = app.db.evolutionRealms.map(r => r.games.length > 0 ? { ...(app.db.evolutionServers.find(e => e.key === r.key) || {}), ...r.games[0], key: r.key, name: r.name, status: r.status, regionId: r.regionId } : {})

  for (const evolutionServer of evolutionServers) {
    const server = app.db.evolutionServers.find(s => s.key === evolutionServer.key)

    if (!server) {
      if (evolutionServer.key) {
        app.db.evolutionServers.push(evolutionServer)
      }
      continue
    }

    server.status = evolutionServer.status
    server.version = evolutionServer.version
    server.rewardItemAmount = evolutionServer.rewardItemAmount
    server.rewardWinnerAmount = evolutionServer.rewardWinnerAmount
    server.gameMode = evolutionServer.gameMode
    server.roundId = evolutionServer.roundId
    server.roundStartedAt = evolutionServer.roundStartedAt
    server.roundStartedDate = evolutionServer.roundStartedDate
    server.timeLeft = evolutionServer.timeLeft
    server.timeLeftText = evolutionServer.timeLeftText
    server.playerCount = evolutionServer.playerCount
    server.speculatorCount = evolutionServer.speculatorCount
    server.endpoint = evolutionServer.endpoint
  }


  jetpack.write(path.resolve('./db/evolution/realms.json'), beautify(app.db.evolutionRealms, null, 2), { atomic: true })

  // Update old servers file
  jetpack.write(path.resolve('./db/evolution/servers.json'), beautify(app.db.evolutionServers, null, 2), { atomic: true })

  log('Realm and server info generated')

  // Update overall historics
  const hist = jetpack.read(path.resolve(`./db/evolution/historical.json`), 'json') || {}

  if (!hist.playerCount) hist.playerCount = []

  const oldTime = (new Date(hist.playerCount[hist.playerCount.length-1]?.[0] || 0)).getTime()
  const newTime = (new Date()).getTime()
  const diff = newTime - oldTime
  if (diff / (1000 * 60 * 60 * 1) > 1) {
    hist.playerCount.push([newTime, playerCount])
  }

  jetpack.write(path.resolve(`./db/evolution/historical.json`), beautify(hist, null, 2), { atomic: true })
}

function cleanupClient(client) {
  client.socket?.close()
  client.isConnecting = false
  client.isAuthed = false

  clearTimeout(client.timeout)
  clearTimeout(client.pingReplyTimeout)
  clearTimeout(client.pingerTimeout)
}

function disconnectClient(client) {
  client.socket.close()
  cleanupClient(client)
}

export async function connectRealm(app, realm) {
  log('Connecting to realm', realm)
  const { client } = games.evolution.realms[realm.key]

  if (client.socket?.connected) {
    cleanupClient(client)
  }

  client.isConnecting = true
  client.socket = getClientSocket('https://' + realm.endpoint) // TODO: RS should be running things

  client.socket.on('connect', async () => {
    try {
      log('Connected: ' + realm.key)

      const res = await rsCall(client, 'AuthRequest', 'myverysexykey') as any

      if (res.status === 1) {
        client.isAuthed = true

        clearTimeout(client.timeout)

        await setRealmConfig(app, realm)
        await updateRealm(app, realm)
      }

      client.isConnecting = false

      const pinger = async () => {
        client.pingReplyTimeout = setTimeout(function() {
          log('Realm didnt respond in time, disconnecting')
          cleanupClient(client)
        }, 20 * 1000)

        await rsCall(client, 'PingRequest')

        clearTimeout(client.pingReplyTimeout)

        client.pingerTimeout = setTimeout(pinger, 5 * 1000)
      }

      client.pingerTimeout = setTimeout(pinger, 5 * 1000)
    } catch(e) {
      logError(e)
    }
  })

  client.socket.on('disconnect', () => {
    log('Disconnected: ' + realm.key)
    cleanupClient(client)
  })

  client.socket.on('PingRequest', function (msg) {
    log(msg)

    client.socket.emit('PingResponse')
  })

  client.socket.on('PongRequest', function (msg) {
    log(msg)

    client.socket.emit('PongResponse')
  })

  client.socket.on('BanPlayerRequest', async function (req) {
    console.log(req)
    try {
      log('Ban', req)

      if (await verifySignature(req.signature) && app.db.evolution.modList.includes(req.signature.address)) {
        app.db.addBanList('evolution', req.data.target)
  
        app.db.saveBanList()

        app.realm.emitAll('BanUserRequest', {
          signature: await getSignedRequest(md5(JSON.stringify({ target: req.data.target }))),
          data: {
            target: req.data.target
          }
        })
        
        client.socket.emit('BanUserResponse', {
          id: req.id,
          data: { status: 1 }
        })
      } else {
        client.socket.emit('BanUserResponse', {
          id: req.id,
          data: { status: 0, message: 'Invalid signature' }
        })
      }
    } catch (e) {
      logError(e)
      
      client.socket.emit('BanUserResponse', {
        id: req.id,
        data: { status: 0, message: e }
      })
    }
  })

  client.socket.on('ReportPlayerRequest', function (msg) {
    log(msg)

    const { currentGamePlayers, currentPlayer, reportedPlayer } = msg

    if (currentPlayer.name.indexOf('Guest') !== -1 || currentPlayer.name.indexOf('Unknown') !== -1) return // No guest reports

    if (!app.db.evolution.reportList[reportedPlayer.address])
      app.db.evolution.reportList[reportedPlayer.address] = []
    
    if (!app.db.evolution.reportList[reportedPlayer.address].includes(currentPlayer.address))
      app.db.evolution.reportList[reportedPlayer.address].push(currentPlayer.address)
    
    // if (app.db.evolution.reportList[reportedPlayer.address].length >= 6) {
    //   app.db.evolution.banList.push(reportedPlayer.address)

    //   disconnectPlayer(reportedPlayer)
    //   // emitDirect(client.sockets[reportedPlayer.id], 'OnBanned', true)
    //   return
    // }

    // if (currentGamePlayers.length >= 4) {
    //   const reportsFromCurrentGamePlayers = app.db.evolution.reportList[reportedPlayer.address].filter(function(n) {
    //     return currentGamePlayers.indexOf(n) !== -1;
    //   })

    //   if (reportsFromCurrentGamePlayers.length >= currentGamePlayers.length / 3) {
    //     app.db.evolution.banList.push(reportedPlayer.address)

    //     disconnectPlayer(reportedPlayer)
    //     // emitDirect(client.sockets[reportedPlayer.id], 'OnBanned', true)
    //     return
    //   }
    // }

    // Relay the report to connected realm servers


  })

// {
//   id: 'vLgqLC_oa',
//   signature: {
//     address: '0xDfA8f768d82D719DC68E12B199090bDc3691fFc7',
//     hash: '0xaa426a32a8f0dae65f160e52d3c0004582e796942894c199255298a05b5f40a473b4257e367e5c285a1eeaf9a8f69b14b8fc273377ab4c79e256962a3434978a1c',
//     data: '96a190dbd01b86b08d6feafc6444481b'
//   },
//   data: {
//     id: '7mrEmDnd6',
//     data: {
//       id: 1,
//       startedAt: 1644133312,
//       leaders: [Array],
//       players: [Array]
//     }
//   }
// }
// {
//   id: 2,
//   startedAt: 1644135785,
//   leaders: [],
//   players: [
//     {
//       name: 'Sdadasd',
//       id: 'ovEbbscHo3D7aWVBAAAD',
//       avatar: 0,
//       network: 'bsc',
//       address: '0x191727d22f2693100acef8e48F8FeaEaa06d30b1',
//       device: 'desktop',
//       position: [Object],
//       target: [Object],
//       clientPosition: [Object],
//       clientTarget: [Object],
//       rotation: null,
//       xp: 0,
//       latency: 12627.5,
//       kills: 0,
//       deaths: 0,
//       points: 0,
//       evolves: 0,
//       powerups: 0,
//       rewards: 0,
//       orbs: 0,
//       rewardHistory: [],
//       isMod: false,
//       isBanned: false,
//       isMasterClient: false,
//       isDisconnected: true,
//       isDead: true,
//       isJoining: false,
//       isSpectating: false,
//       isStuck: false,
//       isInvincible: false,
//       isPhased: false,
//       overrideSpeed: 0.5,
//       overrideCameraSize: null,
//       cameraSize: 3,
//       speed: 0.5,
//       joinedAt: 0,
//       hash: '',
//       lastReportedTime: 1644135787011,
//       lastUpdate: 1644135787016,
//       gameMode: 'Deathmatch',
//       phasedUntil: 1644135814266,
//       log: [Object],
//       startedRoundAt: 1644135785
//     }
//   ]
// }
  client.socket.on('SaveRoundRequest', async function (req) {
    try {
      log('SaveRoundRequest', req)

      if (!await verifySignature(req.signature) && app.db.evolution.modList.includes(req.signature.address)) {
        client.socket.emit('SaveRoundResponse', {
          id: req.id,
          data: { status: 0, message: 'Invalid signature' }
        })
        return
      }

      const users = []
      // log(req)
      // Iterate the winners, determine the winning amounts, validate, save to user rewards
      // Iterate all players and save their log / stats 
      for (const player of req.data.round.players) {
        const user = app.db.loadUser(player.address)

        log(player.address, player.pickups)
        for (const pickup of player.pickups) {
          if (pickup.type === 'rune') {
            // TODO: change to authoritative
            if (pickup.quantity > app.db.evolutionConfig.rewardItemAmountMax) {
              client.socket.emit('SaveRoundResponse', {
                id: req.id,
                data: { status: 0, message: 'Invalid reward' }
              })
              return
            }

            if (!user.rewards.runes[pickup.rewardItemName.toLowerCase()]) {
              user.rewards.runes[pickup.rewardItemName.toLowerCase()] = 0
            }

            user.rewards.runes[pickup.rewardItemName.toLowerCase()] += pickup.quantity

            if (!user.lifetimeRewards.runes[pickup.rewardItemName.toLowerCase()]) {
              user.lifetimeRewards.runes[pickup.rewardItemName.toLowerCase()] = 0
            }

            user.lifetimeRewards.runes[pickup.rewardItemName.toLowerCase()] += pickup.quantity
          } else {
            user.rewards.items[pickup.id] = {
              name: pickup.name,
              rarity: pickup.rarity,
              quantity: pickup.quantity
            }

            user.lifetimeRewards.items[pickup.id] = {
              name: pickup.name,
              rarity: pickup.rarity,
              quantity: pickup.quantity
            }
          }

          // user.rewardTracking.push(req.tracking)
        }

        users.push(user)
      }

      const rewardWinnerMap = {
        0: Math.round((req.data.rewardWinnerAmount * 1) * 1000) / 1000,
        1: Math.round((req.data.rewardWinnerAmount * 0.25) * 1000) / 1000,
        2: Math.round((req.data.rewardWinnerAmount * 0.15) * 1000) / 1000,
        3: Math.round((req.data.rewardWinnerAmount * 0.05) * 1000) / 1000,
        4: Math.round((req.data.rewardWinnerAmount * 0.05) * 1000) / 1000,
        5: Math.round((req.data.rewardWinnerAmount * 0.05) * 1000) / 1000,
        6: Math.round((req.data.rewardWinnerAmount * 0.05) * 1000) / 1000,
        7: Math.round((req.data.rewardWinnerAmount * 0.05) * 1000) / 1000,
        8: Math.round((req.data.rewardWinnerAmount * 0.05) * 1000) / 1000,
        9: Math.round((req.data.rewardWinnerAmount * 0.05) * 1000) / 1000,
      }

      // Calculate winnings
      for (const index in req.data.round.winners.slice(0, 10)) {
        const player = req.data.round.winners[index]
        const user = users.find(u => u.address === player.address)

        if (!user.rewards.runes['zod']) {
          user.rewards.runes['zod'] = 0
        }

        user.rewards.runes['zod'] += rewardWinnerMap[index]

        if (!user.lifetimeRewards.runes['zod']) {
          user.lifetimeRewards.runes['zod'] = 0
        }

        user.lifetimeRewards.runes['zod'] += rewardWinnerMap[index]
      }

      for (const user of users) {
        app.db.saveUser(user)
      }

      log('Round saved')
      
      client.socket.emit('SaveRoundResponse', {
        id: req.id,
        data: { status: 1 }
      })
    } catch (e) {
      logError(e)
      
      client.socket.emit('SaveRoundResponse', {
        id: req.id,
        data: { status: 0, message: e }
      })

      disconnectClient(client)
    }

    // Iterate the items found, add to user.evolution.rewards
    // Itereate the runes found, add to user.evolution.runes
    // Iterate the winners, add to the user.evolution.runes
    // Add winning stats to user.evolution



    // function sendLeaderReward(leaders) {
    //   log('Leader: ', leaders[0])

    //   if (leaders[0]?.address) {
    //     try {
    //       if (!app.db.evolution.playerRewards[leaders[0].address]) app.db.evolution.playerRewards[leaders[0].address] = {}
    //       if (!app.db.evolution.playerRewards[leaders[0].address].pending) app.db.evolution.playerRewards[leaders[0].address].pending = {}
    //       if (!app.db.evolution.playerRewards[leaders[0].address].pending.zod) app.db.evolution.playerRewards[leaders[0].address].pending.zod = 0
        
    //       app.db.evolution.playerRewards[leaders[0].address].pending.zod  = Math.round((app.db.evolution.playerRewards[leaders[0].address].pending.zod + app.config.rewardWinnerAmount * 1) * 1000) / 1000

    //       publishEvent('OnRoundWinner', leaders[0].name)
    //     } catch(e) {
    //       log(e)
    //     }
    //   }
    //   if (leaders[1]?.address) {
    //     try {
    //       if (!app.db.evolution.playerRewards[leaders[1].address]) app.db.evolution.playerRewards[leaders[1].address] = {}
    //       if (!app.db.evolution.playerRewards[leaders[1].address].pending) app.db.evolution.playerRewards[leaders[1].address].pending = {}
    //       if (!app.db.evolution.playerRewards[leaders[1].address].pending.zod) app.db.evolution.playerRewards[leaders[1].address].pending.zod = 0
        
    //       app.db.evolution.playerRewards[leaders[1].address].pending.zod  = Math.round((app.db.evolution.playerRewards[leaders[1].address].pending.zod + app.config.rewardWinnerAmount * 0.25) * 1000) / 1000
    //     } catch(e) {
    //       log(e)
    //     }
    //   }
    //   if (leaders[2]?.address) {
    //     try {
    //       if (!app.db.evolution.playerRewards[leaders[2].address]) app.db.evolution.playerRewards[leaders[2].address] = {}
    //       if (!app.db.evolution.playerRewards[leaders[2].address].pending) app.db.evolution.playerRewards[leaders[2].address].pending = {}
    //       if (!app.db.evolution.playerRewards[leaders[2].address].pending.zod) app.db.evolution.playerRewards[leaders[2].address].pending.zod = 0
        
    //       app.db.evolution.playerRewards[leaders[2].address].pending.zod  = Math.round((app.db.evolution.playerRewards[leaders[2].address].pending.zod + app.config.rewardWinnerAmount * 0.15) * 1000) / 1000
    //     } catch(e) {
    //       log(e)
    //     }
    //   }
    //   if (leaders[3]?.address) {
    //     try {
    //       if (!app.db.evolution.playerRewards[leaders[3].address]) app.db.evolution.playerRewards[leaders[3].address] = {}
    //       if (!app.db.evolution.playerRewards[leaders[3].address].pending) app.db.evolution.playerRewards[leaders[3].address].pending = {}
    //       if (!app.db.evolution.playerRewards[leaders[3].address].pending.zod) app.db.evolution.playerRewards[leaders[3].address].pending.zod = 0
        
    //       app.db.evolution.playerRewards[leaders[3].address].pending.zod  = Math.round((app.db.evolution.playerRewards[leaders[3].address].pending.zod + app.config.rewardWinnerAmount * 0.05) * 1000) / 1000
    //     } catch(e) {
    //       log(e)
    //     }
    //   }
    //   if (leaders[4]?.address) {
    //     try {
    //       if (!app.db.evolution.playerRewards[leaders[4].address]) app.db.evolution.playerRewards[leaders[4].address] = {}
    //       if (!app.db.evolution.playerRewards[leaders[4].address].pending) app.db.evolution.playerRewards[leaders[4].address].pending = {}
    //       if (!app.db.evolution.playerRewards[leaders[4].address].pending.zod) app.db.evolution.playerRewards[leaders[4].address].pending.zod = 0
        
    //       app.db.evolution.playerRewards[leaders[4].address].pending.zod  = Math.round((app.db.evolution.playerRewards[leaders[4].address].pending.zod + app.config.rewardWinnerAmount * 0.05) * 1000) / 1000
    //     } catch(e) {
    //       log(e)
    //     }
    //   }
    //   if (leaders[5]?.address) {
    //     try {
    //       if (!app.db.evolution.playerRewards[leaders[5].address]) app.db.evolution.playerRewards[leaders[5].address] = {}
    //       if (!app.db.evolution.playerRewards[leaders[5].address].pending) app.db.evolution.playerRewards[leaders[5].address].pending = {}
    //       if (!app.db.evolution.playerRewards[leaders[5].address].pending.zod) app.db.evolution.playerRewards[leaders[5].address].pending.zod = 0
        
    //       app.db.evolution.playerRewards[leaders[5].address].pending.zod  = Math.round((app.db.evolution.playerRewards[leaders[5].address].pending.zod + app.config.rewardWinnerAmount * 0.05) * 1000) / 1000
    //     } catch(e) {
    //       log(e)
    //     }
    //   }
    //   if (leaders[6]?.address) {
    //     try {
    //       if (!app.db.evolution.playerRewards[leaders[6].address]) app.db.evolution.playerRewards[leaders[6].address] = {}
    //       if (!app.db.evolution.playerRewards[leaders[6].address].pending) app.db.evolution.playerRewards[leaders[6].address].pending = {}
    //       if (!app.db.evolution.playerRewards[leaders[6].address].pending.zod) app.db.evolution.playerRewards[leaders[6].address].pending.zod = 0
        
    //       app.db.evolution.playerRewards[leaders[6].address].pending.zod  = Math.round((app.db.evolution.playerRewards[leaders[6].address].pending.zod + app.config.rewardWinnerAmount * 0.05) * 1000) / 1000
    //     } catch(e) {
    //       log(e)
    //     }
    //   }
    //   if (leaders[7]?.address) {
    //     try {
    //       if (!app.db.evolution.playerRewards[leaders[7].address]) app.db.evolution.playerRewards[leaders[7].address] = {}
    //       if (!app.db.evolution.playerRewards[leaders[7].address].pending) app.db.evolution.playerRewards[leaders[7].address].pending = {}
    //       if (!app.db.evolution.playerRewards[leaders[7].address].pending.zod) app.db.evolution.playerRewards[leaders[7].address].pending.zod = 0
        
    //       app.db.evolution.playerRewards[leaders[7].address].pending.zod  = Math.round((app.db.evolution.playerRewards[leaders[7].address].pending.zod + app.config.rewardWinnerAmount * 0.05) * 1000) / 1000
    //     } catch(e) {
    //       log(e)
    //     }
    //   }
    //   if (leaders[8]?.address) {
    //     try {
    //       if (!app.db.evolution.playerRewards[leaders[8].address]) app.db.evolution.playerRewards[leaders[8].address] = {}
    //       if (!app.db.evolution.playerRewards[leaders[8].address].pending) app.db.evolution.playerRewards[leaders[8].address].pending = {}
    //       if (!app.db.evolution.playerRewards[leaders[8].address].pending.zod) app.db.evolution.playerRewards[leaders[8].address].pending.zod = 0
        
    //       app.db.evolution.playerRewards[leaders[8].address].pending.zod  = Math.round((app.db.evolution.playerRewards[leaders[8].address].pending.zod + app.config.rewardWinnerAmount * 0.05) * 1000) / 1000
    //     } catch(e) {
    //       log(e)
    //     }
    //   }
    //   if (leaders[9]?.address) {
    //     try {
    //       if (!app.db.evolution.playerRewards[leaders[9].address]) app.db.evolution.playerRewards[leaders[9].address] = {}
    //       if (!app.db.evolution.playerRewards[leaders[9].address].pending) app.db.evolution.playerRewards[leaders[9].address].pending = {}
    //       if (!app.db.evolution.playerRewards[leaders[9].address].pending.zod) app.db.evolution.playerRewards[leaders[9].address].pending.zod = 0
        
    //       app.db.evolution.playerRewards[leaders[9].address].pending.zod  = Math.round((app.db.evolution.playerRewards[leaders[9].address].pending.zod + app.config.rewardWinnerAmount * 0.05) * 1000) / 1000
    //     } catch(e) {
    //       log(e)
    //     }
    //   }
    // }

  })

  client.socket.onAny(function(eventName, res) {
    // log('Event All', eventName, res)
    if (!res || !res.id) return
    // console.log(eventName, res)
    if (ioCallbacks[res.id]) {
      log('Callback', eventName)

      clearTimeout(client.reqTimeout)

      ioCallbacks[res.id](res.data)

      delete ioCallbacks[res.id]
    }
  })

  client.socket.connect()

  client.connectTimeout = setTimeout(function() {
    if (!client.isAuthed) {
      log(`Couldnt connect/authorize ${realm.key} on ${realm.endpoint}`)
      disconnectClient(client)
    }
  }, 20 * 1000)
}

export async function connectRealms(app) {
  log('Connecting to Evolution realms')

  try {
    for (const realm of app.db.evolutionRealms) {
      if (!games.evolution.realms[realm.key]) {
        games.evolution.realms[realm.key] = {}
        for (const key in Object.keys(realm)) {
          games.evolution.realms[realm.key][key] = realm[key]
        }
      }

      if (!games.evolution.realms[realm.key].client) {
        games.evolution.realms[realm.key].client = {
          isAuthed: false,
          isConnecting: false,
          socket: null,
          connectTimeout: null,
          reqTimeout: null
        }
      }

      if (!games.evolution.realms[realm.key].client.isConnecting && !games.evolution.realms[realm.key].client.isAuthed) {
        await connectRealm(app, realm)
      }
    }

    await updateRealms(app)
  } catch(e) {
    logError(e)
  }
}

export async function emitAll(app, ...args) {
  for (const realm of app.db.evolutionRealms) {
    if (games.evolution.realms[realm.key]?.client?.authed) {
      games.evolution.realms[realm.key]?.client?.socket.emit(...args)
    }
  }
}

export async function monitorEvolutionRealms(app) {
  if (!app.realm) {
    app.realm = {}
    app.realm.apiAddress = '0x4b64Ff29Ee3B68fF9de11eb1eFA577647f83151C'
    app.realm.apiSignature = await getSignedRequest('evolution')
    app.realm.emitAll = emitAll.bind(null, app)
  }

  connectRealms(app)

  setTimeout(() => monitorEvolutionRealms(app), 30 * 1000)
}


// import fetch from 'node-fetch'
// import path from 'path'
// import jetpack from 'fs-jetpack'
// import beautify from 'json-beautify'
// import { fancyTimeFormat } from '../util/time'
// import { average, groupBySub } from '../util'
// import { log } from '../util'
// import { median } from '../util/math'

// export async function monitorEvolutionStats(app) {

//   return

//   // Update evolution player rewards
//   try {
//     log('Update evolution player rewards')
//     for (const server of app.db.evolutionServers) {
//       if (server.status !== 'online') continue

//       log('Server', server.key)

//       try {
//         const rand = Math.floor(Math.random() * Math.floor(999999))
//         const response = await fetch(`http://${server.endpoint}/data/playerRewards.json?${rand}`)
      
//         const data = await response.json()

//         jetpack.write(path.resolve(`./db/evolution/${server.key}/playerRewards.json`), beautify(data, null, 2), { atomic: true })
//       } catch(e) {
//         log(e)
//       }
//     }
//   } catch(e) {
//     log(e)
//   }

  
//   const playerRoundWinners = {}
//   const playerRewardWinners = {}


//   const leaderboards: any = {
//     europe1: {},
//     europe2: {},
//     na1: {},
//     sa1: {},
//     asia1: {},
//     asia2: {},
//     asia3: {},
//     asia4: {},
//     oceanic1: {},
//     overall: {}
//   }

//   // Update evolution leaderboard history
//   try {
//     log('Update evolution leaderboard history')

//     const evolutionPlayers = jetpack.read(path.resolve(`./db/evolution/players.json`), 'json') || []

//     const mapAddressToUsername = {}

//     for (const server of app.db.evolutionServers) {
//       if (server.status !== 'online') continue
//       log('Server', server.key)

//       try {
//         let leaderboardHistory = jetpack.read(path.resolve(`./db/evolution/${server.key}/leaderboardHistory.json`), 'json') || []
//         const rand = Math.floor(Math.random() * Math.floor(999999))
//         const response = await fetch(`https://${server.endpoint}/data/leaderboardHistory.json?${rand}`)
      
//         jetpack.write(path.resolve(`./db/evolution/${server.key}/leaderboardHistoryLiveLatest.json`), beautify(leaderboardHistory, null, 2), { atomic: true })

//         let data = await response.json()
//         let lastIndex = 0

//         if (leaderboardHistory.length > 0) {
//           const lastRoundItem = leaderboardHistory.slice(leaderboardHistory.length - 10).reverse().filter(r => r.filter(p => p.name.indexOf('Unknown') !== 0).length > 0)[0]

//           // log('Last round', lastRoundItem)
//           for (let i = 0; i < data.length; i++) {
//             if (!data[i].length || !data[i][0]) continue
//             // if (data[i][0].name.indexOf('Unknown') === 0) continue

//             if (data[i].length === lastRoundItem.length && data[i][0].joinedAt === lastRoundItem[0].joinedAt && data[i][0].id === lastRoundItem[0].id && (typeof(data[i][0].position) === 'string' || !data[i][0].position ? data[i][0].position : data[i][0].position.x.toFixed(4) === lastRoundItem[0].position.x.toFixed(4) && data[i][0].position.y.toFixed(4) === lastRoundItem[0].position.y.toFixed(4))) { //  && data[i][0].position === lastRoundItem[0].position
//               lastIndex = i
//             }
//           }
//         }
        
//         log('Starting from', lastIndex, server.key)

//         if (lastIndex === 0 && leaderboardHistory.length > 0) {
//           console.warn("Shouldnt start from 0", server.key)

//           playerRoundWinners[server.key] = leaderboardHistory
//         } else {
//           const dupChecker = {}

//           leaderboardHistory = leaderboardHistory.concat(data.slice(lastIndex+1)).filter(p => {
//             if (p.length === 0) return
//             if (p[0].joinedAt < 1625322027) return

//             const key = (typeof(p[0].position) === 'string' || !p[0].position ? p[0].position : p[0].position.x.toFixed(4) + p[0].position.y.toFixed(4))+p[0].joinedAt
//             if (dupChecker[key]) return

//             dupChecker[key] = true

//             return p
//           })
      
//           jetpack.write(path.resolve(`./db/evolution/${server.key}/leaderboardHistory.json`), beautify(leaderboardHistory, null, 2), { atomic: true })
      
//           playerRoundWinners[server.key] = leaderboardHistory

//           const recentPlayerAddresses = []
      
//           for (let i = lastIndex; i < leaderboardHistory.length; i++) {
//             for (let j = 0; j < leaderboardHistory[i].length; j++) {
//               if (!leaderboardHistory[i][j].address) continue
//               if (recentPlayerAddresses.includes(leaderboardHistory[i][j].address)) continue
              
//               recentPlayerAddresses.push(leaderboardHistory[i][j].address)
//             }
//           }

//           leaderboards[server.key] = {
//             kills: [],
//             deaths: [],
//             powerups: [],
//             evolves: [],
//             points: [],
//             rewards: [],
//             orbs: [],
//             revenges: [],
//             rounds: [],
//             wins: [],
//             timeSpent: [],
//             winRatio: [],
//             killDeathRatio: [],
//             roundPointRatio: [],
//             averageLatency: []
//           }

//           const playerAddresses = recentPlayerAddresses // evolutionPlayers.map(p => p.address)

//           for (const address of playerAddresses) {
//             if (address.toLowerCase() === "0xc84ce216fef4EC8957bD0Fb966Bb3c3E2c938082".toLowerCase() ||
//             address.toLowerCase() === "0xa987f487639920A3c2eFe58C8FBDedB96253ed9B".toLowerCase()) continue

//             try {
//               const user = app.db.loadUser(address)

//               if (address === '0x9aAe5CBe5C124e1BE62BD83eD07367d57F8998E0') {
//                 log(user)
//               }
//               if (!evolutionPlayers.find(p => p.address === address)) {
//                 evolutionPlayers.push({
//                   address
//                 })
//               }

//               if (!user.evolution) user.evolution = {}
//               if (!user.evolution.hashes) user.evolution.hashes = []

//               {
//                 let winStreak = 0
//                 let savedWinStreak = 0
//                 let rounds = 0
//                 let wins = 0
//                 let kills = 0
//                 let deaths = 0
//                 let powerups = 0
//                 let evolves = 0
//                 let points = 0
//                 let rewards = 0
//                 let orbs = 0
//                 let revenges = 0
//                 const latency = []
//                 const hashHistory = {}
//                 const hashHistory2 = {}

//                 for (const round of leaderboardHistory) {
//                   if (round.length === 0) continue

//                   const currentPlayer = round.find(r => r.address === address)
//                   const wasConnected = currentPlayer ? (currentPlayer.latency === undefined || (currentPlayer.latency >= 10 && currentPlayer.latency <= 1000)) : false
//                   const wasActive = currentPlayer ? (currentPlayer.powerups >= 100) : false
//                   if (currentPlayer) {
//                     mapAddressToUsername[address] = currentPlayer.name

//                     if (!user.evolution.hashes.includes(currentPlayer.hash)) user.evolution.hashes.push(currentPlayer.hash)

//                     if (wasConnected) { 
//                       latency.push(currentPlayer.latency)
//                     }

//                     if (wasActive) {
//                       kills += currentPlayer.kills || 0
//                       deaths += currentPlayer.deaths || 0
//                       powerups += currentPlayer.powerups || 0
//                       evolves += currentPlayer.evolves || 0
//                       points += currentPlayer.points || 0
//                       rewards += currentPlayer.rewards || 0
//                       orbs += currentPlayer.orbs || 0
//                       revenges += (currentPlayer.log?.revenge ? currentPlayer.log.revenge : 0)
//                       rounds++
//                     }

//                     if (currentPlayer.log?.kills) {
//                       for (const hash of currentPlayer.log.kills) {
//                         if (!hashHistory[hash]) hashHistory[hash] = 0

//                         hashHistory[hash]++
//                       }

//                       for (const player of round) {
//                         if (!hashHistory2[player.hash]) hashHistory2[player.hash] = 0
//                         if (player.hash === currentPlayer.hash) continue
//                         if (currentPlayer.log.kills.includes(player.hash)) continue

//                         hashHistory2[player.hash]++
//                       }
//                     }
//                   }

//                   const winner = round.sort(((a, b) => b.points - a.points))[0]

//                   if (winner.address === address) {
//                     wins++
//                     winStreak++
        
//                     if (winStreak > savedWinStreak) savedWinStreak = winStreak
//                   } else {
//                     winStreak = 0
//                   }
//                 }

//                 if (!user.evolution.servers) user.evolution.servers = {}
//                 if (!user.evolution.servers[server.key]) user.evolution.servers[server.key] = {}
//                 if (!user.evolution.servers[server.key].winStreak) user.evolution.servers[server.key].winStreak = 0
//                 if (!user.evolution.overall) user.evolution.overall = {}
//                 if (!user.evolution.overall.winStreak) user.evolution.overall.winStreak = 0

//                 // if (savedWinStreak > user.evolution.servers[server.key].winStreak) {
//                   user.evolution.servers[server.key].winStreak = savedWinStreak
//                 // }

//                 user.evolution.servers[server.key].kills = kills
//                 user.evolution.servers[server.key].deaths = deaths
//                 user.evolution.servers[server.key].powerups = powerups
//                 user.evolution.servers[server.key].evolves = evolves
//                 user.evolution.servers[server.key].points = points
//                 user.evolution.servers[server.key].rewards = rewards
//                 user.evolution.servers[server.key].orbs = orbs
//                 user.evolution.servers[server.key].revenges = revenges
//                 user.evolution.servers[server.key].wins = wins
//                 user.evolution.servers[server.key].rounds = rounds
//                 user.evolution.servers[server.key].winRatio = rounds > 5 ? wins / rounds : 0
//                 user.evolution.servers[server.key].killDeathRatio = rounds >= 5 && deaths > 0 ? kills / deaths : kills
//                 user.evolution.servers[server.key].roundPointRatio = rounds >= 5 && rounds > 0 ? points / rounds : 0
//                 user.evolution.servers[server.key].averageLatency = rounds >= 5 ? average(latency) : 0
//                 user.evolution.servers[server.key].timeSpent = parseFloat((rounds * 5 / 60).toFixed(1))
//                 user.evolution.servers[server.key].hashHistory = hashHistory
//                 user.evolution.servers[server.key].hashHistory2 = hashHistory2

//                 for (const statKey of ['kills', 'deaths', 'powerups', 'evolves', 'points', 'rewards', 'orbs', 'revenges', 'rounds', 'wins', 'timeSpent', 'winRatio', 'killDeathRatio', 'roundPointRatio', 'averageLatency']) {
//                   leaderboards[server.key][statKey].push({
//                     name: mapAddressToUsername[user.address],
//                     address: user.address,
//                     count: user.evolution.servers[server.key][statKey]
//                   })
//                 }
//               }

//               user.evolution.lastUpdated = (new Date()).getTime()
              
//             if (address === '0x9aAe5CBe5C124e1BE62BD83eD07367d57F8998E0') {
//               log(user)
//             }
//               await app.db.saveUser(user)
//             } catch(e) {
//               log(e)
//             }
//           }

//           for (const statKey of ['kills', 'deaths', 'powerups', 'evolves', 'points', 'rewards', 'orbs', 'revenges', 'rounds', 'wins', 'timeSpent', 'winRatio', 'killDeathRatio', 'roundPointRatio']) {
//             leaderboards[server.key][statKey] = leaderboards[server.key][statKey].filter(a => !!a.count).sort((a, b) => b.count - a.count)
//           }

//           for (const statKey of ['averageLatency']) {
//             leaderboards[server.key][statKey] = leaderboards[server.key][statKey].filter(a => !!a.count).sort((a, b) => a.count - b.count)
//           }

//           for (const address of playerAddresses) {
//             if (address.toLowerCase() === "0xc84ce216fef4EC8957bD0Fb966Bb3c3E2c938082".toLowerCase()) continue

//             const user = app.db.loadUser(address)

//             if (!user.evolution.servers[server.key]) user.evolution.servers[server.key] = {}

//             user.evolution.servers[server.key].ranking = {}

//             for (const statKey of ['kills', 'deaths', 'powerups', 'evolves', 'points', 'rewards', 'orbs', 'revenges', 'rounds', 'wins', 'timeSpent', 'winRatio', 'killDeathRatio', 'roundPointRatio', 'averageLatency']) {
//               user.evolution.servers[server.key].ranking[statKey] = {
//                 position: leaderboards[server.key][statKey].findIndex(item => item.address == user.address) + 1,
//                 total: leaderboards[server.key][statKey].length
//               }
//             }

//             await app.db.saveUser(user)
//           }

//           leaderboards[server.key].lastUpdated = (new Date()).getTime()

//           jetpack.write(path.resolve(`./db/evolution/${server.key}/leaderboard2.json`), beautify(leaderboards[server.key], null, 2), { atomic: true })
//         }
//       } catch(e) {
//         log(e)
//       }
//     }

//     leaderboards.overall = {
//       kills: [],
//       deaths: [],
//       powerups: [],
//       evolves: [],
//       points: [],
//       rewards: [],
//       orbs: [],
//       revenges: [],
//       rounds: [],
//       wins: [],
//       timeSpent: [],
//       winRatio: [],
//       killDeathRatio: [],
//       roundPointRatio: [],
//       averageLatency: []
//     }

//     for (const player of evolutionPlayers) {
//       const user = app.db.loadUser(player.address)

//       if (!user.evolution) user.evolution = {}
//       if (!user.evolution.overall) user.evolution.overall = {}

//       user.evolution.overall.kills = 0
//       user.evolution.overall.deaths = 0
//       user.evolution.overall.powerups = 0
//       user.evolution.overall.evolves = 0
//       user.evolution.overall.points = 0
//       user.evolution.overall.rewards = 0
//       user.evolution.overall.orbs = 0
//       user.evolution.overall.revenges = 0
//       user.evolution.overall.rounds = 0
//       user.evolution.overall.wins = 0
//       user.evolution.overall.timeSpent = 0

//       let latency = []

//       for (const key in user.evolution.servers) {
//         const server = user.evolution.servers[key]
//         user.evolution.overall.kills += server.kills || 0
//         user.evolution.overall.deaths += server.deaths || 0
//         user.evolution.overall.powerups += server.powerups || 0
//         user.evolution.overall.evolves += server.evolves || 0
//         user.evolution.overall.points += server.points || 0
//         user.evolution.overall.rewards += server.rewards || 0
//         user.evolution.overall.orbs += server.orbs || 0
//         user.evolution.overall.revenges += server.revenges || 0
//         user.evolution.overall.rounds += server.rounds || 0
//         user.evolution.overall.wins += server.wins || 0
//         user.evolution.overall.timeSpent += server.timeSpent || 0

//         if (server.winStreak > user.evolution.overall.winStreak) {
//           user.evolution.overall.winStreak = server.winStreak
//         }
//         if (server.averageLatency) {
//           latency.push(server.averageLatency)
//         }
//       }

//       user.evolution.overall.winRatio = user.evolution.overall.rounds >= 5 ? user.evolution.overall.wins / user.evolution.overall.rounds : 0
//       user.evolution.overall.killDeathRatio = user.evolution.overall.rounds >= 5 && user.evolution.overall.deaths > 0 ? user.evolution.overall.kills / user.evolution.overall.deaths : user.evolution.overall.kills
//       user.evolution.overall.roundPointRatio = user.evolution.overall.rounds >= 5 ? user.evolution.overall.points / user.evolution.overall.rounds : 0
//       user.evolution.overall.averageLatency = latency.length > 0 ? average(latency) : 0

//       for (const statKey of ['kills', 'deaths', 'powerups', 'evolves', 'points', 'rewards', 'orbs', 'revenges', 'rounds', 'wins', 'timeSpent', 'winRatio', 'killDeathRatio', 'roundPointRatio', 'averageLatency']) {
//         if (user.evolution.overall[statKey] && user.evolution.overall[statKey] > 0 && user.evolution.overall[statKey] !== null) {
//           leaderboards.overall[statKey].push({
//             name: mapAddressToUsername[user.address],
//             address: user.address,
//             count: user.evolution.overall[statKey]
//           })
//         }
//       }
    
//       await app.db.saveUser(user)
//     }

//     // Sort descending
//     for (const statKey of ['kills', 'deaths', 'powerups', 'evolves', 'points', 'rewards', 'orbs', 'revenges', 'rounds', 'wins', 'timeSpent', 'winRatio', 'killDeathRatio', 'roundPointRatio']) {
//       leaderboards.overall[statKey] = leaderboards.overall[statKey].filter(a => !!a.count).sort((a, b) => b.count - a.count)
//     }

//     // Sort ascending
//     for (const statKey of ['averageLatency']) {
//       leaderboards.overall[statKey] = leaderboards.overall[statKey].filter(a => !!a.count).sort((a, b) => a.count - b.count)
//     }

//     for (const player of evolutionPlayers) {
//       const user = app.db.loadUser(player.address)

//       if (!user.evolution) user.evolution = {}
//       if (!user.evolution.overall) user.evolution.overall = {}

//       user.evolution.overall.ranking = {}

//       for (const statKey of ['kills', 'deaths', 'powerups', 'evolves', 'points', 'rewards', 'orbs', 'revenges', 'rounds', 'wins', 'timeSpent', 'winRatio', 'killDeathRatio', 'roundPointRatio', 'averageLatency']) {
//         user.evolution.overall.ranking[statKey] = {
//           position: leaderboards.overall[statKey].findIndex(item => item.address == user.address) + 1,
//           total: leaderboards.overall[statKey].length
//         }
//       }

//       await app.db.saveUser(user)
//     }

//     jetpack.write(path.resolve(`./db/evolution/players.json`), beautify(evolutionPlayers, null, 2), { atomic: true })

//       // const mapKeyToName = {
//       //   kills: "Kills",
//       //   deaths: "Deaths",
//       //   powerups: "Powerups",
//       //   evolves: "Evolves",
//       //   points: "Points",
//       //   rewards: "Rewards",
//       //   orbs: "Orbs",
//       //   revenges: "Revenges",
//       //   rounds: "Rounds",
//       //   wins: "Wins",
//       //   timeSpent: "Time Spent",
//       //   winRatio: "Win Ratio",
//       //   killDeathRatio: "Kill Death Ratio",
//       //   roundPointRatio: "Round Point Ratio",
//       //   averageLatency: "Average Latency"
//       // }

//       // const reformattedLeaderboard = {}

//       // for (const key in Object.keys(leaderboards.overall)) {
//       //   const stat = leaderboards.overall[key]

//       //   reformattedLeaderboard[key] = [{
//       //     "name": mapKeyToName[key],
//       //     "count": 10,
//       //     "data": stat.map(s => ({
//       //       username: mapAddressToUsername[s.address],
//       //       count: s.count
//       //     }))
//       //   }]
//       // }

//     leaderboards.overall.lastUpdated = (new Date()).getTime()

//     jetpack.write(path.resolve(`./db/evolution/leaderboard.json`), beautify(leaderboards.overall, null, 2), { atomic: true })
//   } catch(e) {
//     log(e)
//   }

//   // Update evolution hash map
//   try {
//     log('Update evolution hash map')

//     for (const server of app.db.evolutionServers) {
//       if (server.status !== 'online') continue
//       if (!playerRoundWinners[server.key]) continue

//       log('Server', server.key)

//       try {
//         const data = {
//           toName: {},
//           toHash: {}
//         }

//         for (const round of playerRoundWinners[server.key]) {
//           if (server.status !== 'online') continue
//           for (const player of round) {
//             if (player.hash && player.joinedAt >= 1625322027) {
//               if (!data.toName[player.hash]) data.toName[player.hash] = []
//               if (!data.toHash[player.name]) data.toHash[player.name] = []

//               if (!data.toName[player.hash].includes(player.name)) {
//                 data.toName[player.hash].push(player.name)
//               }

//               if (!data.toHash[player.name].includes(player.hash)) {
//                 data.toHash[player.name].push(player.hash)
//               }
//             }
//           }
//         }

//         jetpack.write(path.resolve(`./db/evolution/${server.key}/hashmap.json`), beautify(data, null, 2), { atomic: true })
//       } catch(e) {
//         log(e)
//       }
//     }
//   } catch(e) {
//     log(e)
//   }

//   // Update evolution stats
//   try {
//     log('Update evolution stats')

//     for (const server of app.db.evolutionServers) {
//       if (server.status !== 'online') continue


//       if (!playerRoundWinners[server.key]) continue
//       try {
//         const stats = {
//           averagePlayerLatency: 0,
//           averageWinnerLatency: 0,
//           medianPlayerLatency: 0,
//           medianWinnerLatency: 0
//         }

//         const playerLatencyList = []
//         const winnerLatencyList = []

//         for (const round of playerRoundWinners[server.key]) {
//           if (server.status !== 'online') continue

//           let winner
//           for (const player of round) {
//             if (!player.isDead && !player.isSpectating && player.latency && player.latency > 5 && player.latency < 600) {
//               if (!winner || (player.winner && winner.winner && player.winner.points > winner.winner.points)) {
//                 winner = player
//               }
//             }
//           }
//           for (const player of round) {
//             if (!player.isDead && !player.isSpectating && player.latency && player.latency > 5 && player.latency < 600 && winner !== player) {
//               playerLatencyList.push(player.latency)
//             }
//           }

//           if (winner) {
//             winnerLatencyList.push(winner.latency)
//           }
//         }

//         stats.medianPlayerLatency = median(playerLatencyList)
//         stats.medianWinnerLatency = median(winnerLatencyList)
//         stats.averagePlayerLatency = average(playerLatencyList)
//         stats.averageWinnerLatency = average(winnerLatencyList)

//         jetpack.write(path.resolve(`./db/evolution/${server.key}/stats.json`), beautify(stats, null, 2), { atomic: true })
//       } catch(e) {
//         log(e)
//       }
//     }
//   } catch(e) {
//     log(e)
//   }

//   // Update evolution reward history
//   try {
//     log('Update evolution reward history')
//     for (const server of app.db.evolutionServers) {
//       if (server.status !== 'online') continue

//       log('Server', server.key)

//       try {
//         const rewardHistory = jetpack.read(path.resolve(`./db/evolution/${server.key}/rewardHistory.json`), 'json') || []
//         const rand = Math.floor(Math.random() * Math.floor(999999))
//         const response = await fetch(`https://${server.endpoint}/data/rewardHistory.json?${rand}`)
      
//         const dupChecker = {}
//         let data = await response.json()
//         let lastIndex = 0

//         if (!Array.isArray(data)) continue

//         if (rewardHistory.length) {
//           const lastRewardItem = rewardHistory[rewardHistory.length-1]

//           for (let i = 0; i < data.length; i++) {
//             if (data[i].symbol === lastRewardItem.symbol && data[i].quantity === lastRewardItem.quantity && data[i].winner.address === lastRewardItem.winner.address) { //  && data[i].pos.x === lastRewardItem.pos.x && data[i].pos.y === lastRewardItem.pos.y
//               lastIndex = i
//             }
//           }
//         }

//         log('Starting from', lastIndex)

//         if (lastIndex === 0 && rewardHistory.length) {
//           console.warn("Shouldnt start from 0")

//           playerRewardWinners[server.key] = rewardHistory
//         } else {
//           data = rewardHistory.concat(data.slice(lastIndex+1)).filter(p => {
//             if (!p.winner.lastUpdate && dupChecker[p.tx]) return

//             dupChecker[p.tx] = true

//             return !!p.winner && p.winner.address && (!p.winner.lastUpdate || (p.winner.lastUpdate >= 1625322027 && p.winner.lastUpdate <= 1625903860))
//           })

//           for (const win of data) {
//             if (!win.monetary) win.monetary = 0

//             if (win.winner.lastUpdate) {
//               if (win.winner.lastUpdate < 1625552384) {
//                 win.quantity = 1
//               } else {
//                 win.quantity = 0.1
//               }
//             }

//             if (win.symbol) {
//               win.monetary = app.db.findPrice(win.symbol, win.winner.lastUpdate) * win.quantity
//             }
//           }

//           jetpack.write(path.resolve(`./db/evolution/${server.key}/rewardHistory.json`), beautify(data, null, 2), { atomic: true })

//           playerRewardWinners[server.key] = data
//         }
//       } catch(e) {
//         log(e)
//       }
//     }
//   } catch(e) {
//     log(e)
//   }

//   // Update evolution rewards
//   try {
//     log('Update evolution rewards')
//     for (const server of app.db.evolutionServers) {
//       if (server.status !== 'online') continue

//       log('Server', server.key)

//       try {
//         const rand = Math.floor(Math.random() * Math.floor(999999))
//         const response = await fetch(`https://${server.endpoint}/data/rewards.json?${rand}`)
          
//         const data = await response.json()

//         jetpack.write(path.resolve(`./db/evolution/${server.key}/rewards.json`), beautify(data, null, 2), { atomic: true })
//       } catch(e) {
//         log(e)
//       }
//     }
//   } catch(e) {
//     log(e)
//   }

//   // Update evolution ban list
//   try {
//     log('Update evolution ban list')
//     for (const server of app.db.evolutionServers) {
//       if (server.status !== 'online') continue

//       log('Server', server.key)

//       try {
//         const rand = Math.floor(Math.random() * Math.floor(999999))
//         const response = await fetch(`https://${server.endpoint}/data/banList.json?${rand}`)
          
//         const data = await response.json()

//         jetpack.write(path.resolve(`./db/evolution/${server.key}/bans.json`), beautify(data, null, 2), { atomic: true })

//         for (const banItem of data) {
//           const user = app.db.loadUser(banItem)

//           if (!user.evolution) user.evolution = {}
//           if (!user.evolution.servers) user.evolution.servers = {}
//           if (!user.evolution.servers[server.key]) user.evolution.servers[server.key] = {}

//           user.evolution.servers[server.key].isBanned = true
//           user.evolution.isBanned = true

//           await app.db.saveUser(user)
//         }
//       } catch(e) {
//         log(e)
//       }
//     }
//   } catch(e) {
//     log(e)
//   }

  


//   // Update evolution player rewards
//   try {
//     log('Update evolution player rewards')
//     for (const server of app.db.evolutionServers) {
//       if (server.status !== 'online') continue

//       log('Server', server.key)

//       try {
//         const rand = Math.floor(Math.random() * Math.floor(999999))
//         const response = await fetch(`https://${server.endpoint}/data/log.json?${rand}`)
      
//         const data = await response.json()

//         jetpack.write(path.resolve(`./db/evolution/${server.key}/log.json`), beautify(data, null, 2), { atomic: true })
//       } catch(e) {
//         log(e)
//       }
//     }
//   } catch(e) {
//     log(e)
//   }


//   // Update evolution player rewards
//   try {
//     log('Update evolution player rewards')
//     for (const server of app.db.evolutionServers) {
//       if (server.status !== 'online') continue

//       log('Server', server.key)

//       try {
//         const rand = Math.floor(Math.random() * Math.floor(999999))
//         const response = await fetch(`https://${server.endpoint}/data/playerReports.json?${rand}`)
      
//         const data = await response.json()

//         jetpack.write(path.resolve(`./db/evolution/${server.key}/playerReports.json`), beautify(data, null, 2), { atomic: true })
//       } catch(e) {
//         log(e)
//       }
//     }
//   } catch(e) {
//     log(e)
//   }

//   // Update evolution leaderboard
//   {
//     for (const server of app.db.evolutionServers) {
//       if (server.status !== 'online') continue
//       if (!playerRoundWinners[server.key] || !Array.isArray(playerRewardWinners[server.key])) continue

//       log('Server', server.key)

//       try {
//         const leaderboardHistory = jetpack.read(path.resolve(`./db/evolution/${server.key}/leaderboardHistory.json`), 'json') || []
//         const roundsPlayed = {}

//         for (const round of playerRoundWinners[server.key]) {
//           for (const player of round) {
//             if (player.joinedAt >= 1625322027 && player.name.indexOf('Guest') === -1) {
//               if (!roundsPlayed[player.address]) {
//                 roundsPlayed[player.address] = {
//                   address: player.address,
//                   name: player.name,
//                   rounds: 0,
//                   kills: 0,
//                   deaths: 0,
//                   points: 0,
//                   rewards: 0,
//                   evolves: 0,
//                   powerups: 0
//                 }
//               }
      
//               roundsPlayed[player.address].kills += player.kills
//               roundsPlayed[player.address].deaths += player.deaths
//               roundsPlayed[player.address].points += player.points
//               roundsPlayed[player.address].powerups += player.powerups
//               roundsPlayed[player.address].rewards += player.rewards
//               roundsPlayed[player.address].evolves += player.evolves

//               roundsPlayed[player.address].rounds++
//             }
//           }
//         }
        
//         const groupedWinPlayers = groupBySub(playerRoundWinners[server.key].map((leaderboard) => {
//           let winner = leaderboard[0]

//           for (const p of leaderboard) {
//             if (p.points > winner.points) {
//               winner = p
//             }
//           }

//           if (!winner) return

//           return { winner }
//         }).filter(p => !!p), 'winner', 'address')

//         const findUsername = (address) => {
//           for (const lb of leaderboardHistory) {
//             for (const pl of lb) {
//               if (pl.address === address && pl.name.indexOf('Guest') === -1) {
//                 return pl.name
//               }
//             }
//           }

//           return address.slice(0, 6)
//         }


//         let evolutionEarningsDistributed = 0

//         const groupedRewardPlayers = {}
        
//         for (const reward of playerRewardWinners[server.key]) {
//           // if (reward.winner.lastUpdate) continue // skip old winners
//           if (!groupedRewardPlayers[reward.winner.address]) groupedRewardPlayers[reward.winner.address] = { monetary: 0 }

//           groupedRewardPlayers[reward.winner.address].address = reward.winner.address
//           groupedRewardPlayers[reward.winner.address].name = findUsername(reward.winner.address)
//           groupedRewardPlayers[reward.winner.address].monetary += reward.monetary

//           evolutionEarningsDistributed += reward.monetary
//         }

//         for (const wins of Object.values(groupedWinPlayers)) {
//           const wins2: any = wins
//           for (const win of wins2) {
//             if (win.winner.lastUpdate > 1625903860) continue // skip new winners

//             if (!groupedRewardPlayers[win.winner.address]) groupedRewardPlayers[win.winner.address] = { monetary: 0 }

//             let quantity = 0
//             if (win.winner.lastUpdate < 1625552384) {
//               quantity = 1
//             } else {
//               quantity = 0.3
//             }

//             const monetary = app.db.findPrice('zod', win.winner.lastUpdate) * quantity

//             groupedRewardPlayers[win.winner.address].address = win.winner.address
//             groupedRewardPlayers[win.winner.address].name = findUsername(win.winner.address)
//             groupedRewardPlayers[win.winner.address].monetary += monetary
      
//             evolutionEarningsDistributed += monetary
//           }
//         }

//         for (const address of Object.keys(groupedRewardPlayers)) {
//           if (groupedRewardPlayers[address].monetary > 0) {
//             const user = app.db.loadUser(address)

//             if (user?.evolution?.servers?.[server.key]) {
//               user.evolution.servers[server.key].earnings = groupedRewardPlayers[address].monetary
  
//               let earnings = 0
//               for (const s of Object.keys(user.evolution.servers)) {
//                 if (Number.isFinite(user.evolution.servers[s].earnings)) earnings += user.evolution.servers[s].earnings
//               }
  
//               user.evolution.overall.earnings = earnings
    
//               await app.db.saveUser(user)
//             }
//           }
//         }

//         const hist = jetpack.read(path.resolve(`./db/evolution/${server.key}/historical.json`), 'json') || {}

//         if (!hist.earnings) hist.earnings = []

//         const historicalEarnings = hist.earnings

//         if (historicalEarnings?.length) {
//           const oldTime = (new Date(evolutionEarningsDistributed[historicalEarnings.length-1]?.[0] || 0)).getTime()
//           const newTime = (new Date()).getTime()
//           const diff = newTime - oldTime
      
//           if (diff / (1000 * 60 * 60 * 24) > 1) {
//             historicalEarnings.push([newTime, evolutionEarningsDistributed])
//           }
//         } else {
//           const newTime = (new Date()).getTime()
//           historicalEarnings.push([newTime, evolutionEarningsDistributed])
//         }

//         jetpack.write(path.resolve(`./db/evolution/${server.key}/historical.json`), beautify(hist, null, 2), { atomic: true })

//       // {
//       //   "type": "rune",
//       //   "symbol": "ral",
//       //   "quantity": 4.21,
//       //   "winner": {
//       //     "address": "0x545612032BeaDED7E9f5F5Ab611aF6428026E53E"
//       //   },
//       //   "tx": "0x4c2465dbe4fc6a7d774db429d0dd94fd06dfcc36c59e319aaf241da281dd5250"
//       // },

//         const data = {
//           // all: [
//           //   {
//           //     name: 'Overall',
//           //     count: 10,
//           //     data: Object.keys(groupedRewardPlayers).map(address => ({
//           //       username: groupedRewardPlayers[address][0].winner.name,
//           //       count: groupedRewardPlayers[address].length
//           //     })).sort(function(a, b) {
//           //       return b.count - a.count
//           //     })
//           //   }
//           // ],
//           monetary: [
//             {
//               name: 'Earnings',
//               count: 10,
//               data: Object.keys(groupedRewardPlayers).map(address => ({
//                 username: groupedRewardPlayers[address].name,
//                 count: groupedRewardPlayers[address].monetary
//               })).sort(function(a, b) {
//                 return b.count - a.count
//               })
//             }
//           ],
//           wins: [
//             {
//               name: 'Wins',
//               count: 10,
//               data: Object.keys(groupedWinPlayers).map(address => ({
//                 username: groupedWinPlayers[address].find(g => g.winner.name.indexOf('Guest') === -1)?.winner.name || groupedWinPlayers[address][0].winner.name,
//                 count: groupedWinPlayers[address].length
//               })).sort(function(a, b) {
//                 return b.count - a.count
//               })
//             }
//           ],
//           rounds: [
//             {
//               name: 'Rounds',
//               count: 10,
//               data: Object.keys(roundsPlayed).map(address => ({
//                 username: roundsPlayed[address].name,
//                 count: roundsPlayed[address].rounds
//               })).sort(function(a, b) {
//                 return b.count - a.count
//               })
//             }
//           ],
//           rewards: [
//             {
//               name: 'Rewards',
//               count: 10,
//               data: Object.keys(roundsPlayed).map(address => ({
//                 username: roundsPlayed[address].name,
//                 count: roundsPlayed[address].rewards
//               })).sort(function(a, b) {
//                 return b.count - a.count
//               })
//             }
//           ],
//           points: [
//             {
//               name: 'Points',
//               count: 10,
//               data: Object.keys(roundsPlayed).map(address => ({
//                 username: roundsPlayed[address].name,
//                 count: roundsPlayed[address].points
//               })).sort(function(a, b) {
//                 return b.count - a.count
//               })
//             }
//           ],
//           kills: [
//             {
//               name: 'Kills',
//               count: 10,
//               data: Object.keys(roundsPlayed).map(address => ({
//                 username: roundsPlayed[address].name,
//                 count: roundsPlayed[address].kills
//               })).sort(function(a, b) {
//                 return b.count - a.count
//               })
//             }
//           ],
//           deaths: [
//             {
//               name: 'Deaths',
//               count: 10,
//               data: Object.keys(roundsPlayed).map(address => ({
//                 username: roundsPlayed[address].name,
//                 count: roundsPlayed[address].deaths
//               })).sort(function(a, b) {
//                 return b.count - a.count
//               })
//             }
//           ],
//           powerups: [
//             {
//               name: 'Powerups',
//               count: 10,
//               data: Object.keys(roundsPlayed).map(address => ({
//                 username: roundsPlayed[address].name,
//                 count: roundsPlayed[address].powerups
//               })).sort(function(a, b) {
//                 return b.count - a.count
//               })
//             }
//           ],
//           evolves: [
//             {
//               name: 'Evolves',
//               count: 10,
//               data: Object.keys(roundsPlayed).map(address => ({
//                 username: roundsPlayed[address].name,
//                 count: roundsPlayed[address].evolves
//               })).sort(function(a, b) {
//                 return b.count - a.count
//               })
//             }
//           ],
//         }

//         jetpack.write(path.resolve(`./db/evolution/${server.key}/leaderboard.json`), beautify(data, null, 2), { atomic: true })
//       } catch(e) {
//         log(e)
//       }
//     }
//   }

//   setTimeout(() => monitorEvolutionStats(app), 5 * 60 * 1000)
// }

// export async function monitorEvolutionStats2(app) {
//   return

//   // Update evolution historical
//   try {
//     {
//       log('Update evolution historical 1')

//       if (!app.db.evolutionHistorical.playerCount) app.db.evolutionHistorical.playerCount = []

//       let playerCount = 0

//       for (const server of app.db.evolutionServers) {
//         try {
//           const rand = Math.floor(Math.random() * Math.floor(999999))
//           const response = await fetch(`https://${server.endpoint}/info?${rand}`)
        
//           let data = await response.json()

//           server.playerCount = data.playerTotal
//           server.speculatorCount = data.speculatorTotal
//           server.version = data.version
//           server.rewardItemAmount = data.rewardItemAmount
//           server.rewardWinnerAmount = data.rewardWinnerAmount
//           server.gameMode = data.gameMode
//           server.roundId = data.round.id
//           server.roundStartedAt = data.round.startedAt
//           server.timeLeft = ~~(5 * 60 - (((new Date().getTime()) / 1000 - data.round.startedAt)))
//           server.timeLeftText = fancyTimeFormat(5 * 60 - (((new Date().getTime()) / 1000 - data.round.startedAt)))
//           // server.totalLegitPlayers = data.totalLegitPlayers

//           server.status = "online"
//         } catch(e) {
//           if ((e + '').toString().indexOf('invalid json response body') === -1) log(e)

//           // server.status = "offline"
//           server.playerCount = 0
//           server.speculatorCount = 0
//           server.rewardItemAmount = 0
//           server.rewardWinnerAmount = 0
//         }

//         const hist = jetpack.read(path.resolve(`./db/evolution/${server.key}/historical.json`), 'json') || {}

//         if (!hist.playerCount) hist.playerCount = []

//         const oldTime = (new Date(hist.playerCount[hist.playerCount.length-1]?.[0] || 0)).getTime()
//         const newTime = (new Date()).getTime()
//         const diff = newTime - oldTime
//         if (diff / (1000 * 60 * 60 * 1) > 1) {
//           hist.playerCount.push([newTime, server.playerCount])
//         }

//         jetpack.write(path.resolve(`./db/evolution/${server.key}/historical.json`), beautify(hist, null, 2), { atomic: true })

//         playerCount += server.playerCount
//       }

//       jetpack.write(path.resolve('./db/evolution/servers.json'), beautify(app.db.evolutionServers, null, 2), { atomic: true })

//       // app.db.updateGames()

//       const oldTime = (new Date(app.db.evolutionHistorical.playerCount[app.db.evolutionHistorical.playerCount.length-1]?.[0] || 0)).getTime()
//       const newTime = (new Date()).getTime()
//       const diff = newTime - oldTime
//       if (diff / (1000 * 60 * 60 * 1) > 1) {
//         app.db.evolutionHistorical.playerCount.push([newTime, playerCount])
//       }

//       jetpack.write(path.resolve(`./db/evolution/historical.json`), beautify(app.db.evolutionHistorical, null, 2), { atomic: true })
//     }
//     {
//       log('Update evolution historical 2')
//     }
//   } catch(e) {
//     log(e)
//   }

//   // Update evolution info
//   try {
//     log('Update evolution info')
//     for (const server of app.db.evolutionServers) {
//       if (server.status !== 'online') continue
//       try {
//         const rand = Math.floor(Math.random() * Math.floor(999999))
//         const response = await fetch(`https://${server.endpoint}/info?${rand}`)
      
//         const data = await response.json()

//         jetpack.write(path.resolve(`./db/evolution/${server.key}/info.json`), beautify(data, null, 2), { atomic: true })
//       } catch(e) {
//         log(e)
//       }
//     }
//   } catch(e) {
//     log(e)
//   }

//   setTimeout(() => monitorEvolutionStats2(app), 30 * 1000)
// }
