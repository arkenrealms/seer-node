import fetch from 'node-fetch'
import path from 'path'
import jetpack, { find } from 'fs-jetpack'
import beautify from 'json-beautify'
import { fancyTimeFormat } from '@rune-backend-sdk/util/time'
import md5 from 'js-md5'
import { log, logError } from '@rune-backend-sdk/util'
import { getClientSocket } from '@rune-backend-sdk/util/socket'
import { isValidRequest, getSignedRequest } from '@rune-backend-sdk/util/web3'

const shortId = require('shortid')

const ioCallbacks = {}

async function rsCall(app, realm, name, data = undefined) {
  const id = shortId()
  const signature = await getSignedRequest(app.web3, app.secrets, data)
  
  return new Promise(async (resolve) => {
    ioCallbacks[id] = {}

    ioCallbacks[id].resolve = resolve

    ioCallbacks[id].reqTimeout = setTimeout(function() {
      resolve({ status: 0, message: 'Request timeout' })

      delete ioCallbacks[id]
    }, 60 * 1000)

    if (!realm.client.socket?.connected) {
      logError('Not connected to realm server.')
      return
    }

    log('Emit Realm', realm.key, name, { id, data })

    realm.client.socket.emit(name, { id, signature, data })
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
  const configRes = await rsCall(app, games.evolution.realms[realm.key], 'SetConfigRequest', { config: { ...app.db.evolutionConfig, roundId: realm.roundId } }) as any

  if (configRes.status !== 1) {
    setRealmOffline(realm)
    return
  }
}

async function updateRealm(app, realm) {
  try {
    realm.games = []

    const infoRes = await rsCall(app, games.evolution.realms[realm.key], 'InfoRequest', { config: { } }) as any // roundId: realm.roundId 

    if (!infoRes || infoRes.status !== 1) {
      setRealmOffline(realm)
      return
    }
    
    log('infoRes', infoRes.data.games)

    const { data } = infoRes

    realm.playerCount = data.playerCount
    realm.speculatorCount = data.speculatorCount
    realm.version = data.version

    realm.games = data.games.map(game => ({
      id: game.id,
      playerCount: game.playerCount,
      speculatorCount: game.speculatorCount,
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

    delete realm.timeLeftFancy

    realm.status = 'online'
  } catch(e) {
    logError(e)

    setRealmOffline(realm)
  }

  // log('Updated server', server)

  return realm
}

async function updateRealms(app) {
  log('Updating Evolution realms')

  let playerCount = 0

  for (const realm of app.db.evolutionRealms) {
    if (realm.key === 'ptr1' || realm.key === 'tournament1') continue 

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

    log(`Realm ${realm.key} updated`, realm)
  }

  app.db.evolution.playerCount = playerCount

  for (const server of app.db.evolutionServers) {
    if (server.key === 'tournament1') continue
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
  log('Cleaning up', client.key)

  client.socket?.close()
  client.isConnected = false
  client.isConnecting = false
  client.isAuthed = false

  clearTimeout(client.timeout)
  clearTimeout(client.pingReplyTimeout)
  clearTimeout(client.pingerTimeout)
}

function disconnectClient(client) {
  log('Disconnecting client', client.key)

  cleanupClient(client)
}

const runes = ['el', 'eld', 'tir', 'nef', 'ith', 'tal', 'ral', 'ort', 'thul', 'amn', 'sol', 'shael', 'dol', 'hel', 'io', 'lum', 'ko', 'fal', 'lem',  'pul', 'um', 'mal', 'ist', 'gul', 'vex', 'ohm', 'lo', 'sur', 'ber', 'jah', 'cham', 'zod']

export async function connectRealm(app, realm) {
  log('Connecting to realm', realm)
  const { client } = games.evolution.realms[realm.key]

  if (client.isConnected || client.socket?.connected) {
    log(`Realm ${realm.key} already connected, disconnecting`)
    cleanupClient(client)
  }

  client.isConnecting = true
  client.socket = getClientSocket((process.env.RUNE_ENV === 'local' ? 'http://' : 'https://') + realm.endpoint) // TODO: RS should be running things

  client.socket.on('connect', async () => {
    try {
      client.isConnected = true

      log('Connected: ' + realm.key)

      const res = await rsCall(app, games.evolution.realms[realm.key], 'AuthRequest', 'myverysexykey') as any

      if (res.status === 1) {
        client.isAuthed = true

        clearTimeout(client.connectTimeout)

        await setRealmConfig(app, realm)
        await updateRealm(app, realm)
      }

      client.isConnecting = false

      const pinger = async () => {
        clearTimeout(client.pingReplyTimeout)

        client.pingReplyTimeout = setTimeout(function() {
          log(`Realm ${realm.key} didnt respond in time, disconnecting`)
          cleanupClient(client)
        }, 70 * 1000)

        await rsCall(app, games.evolution.realms[realm.key], 'PingRequest')

        clearTimeout(client.pingReplyTimeout)

        if (!client.isConnected) return
        
        client.pingerTimeout = setTimeout(async () => await pinger(), 15 * 1000)
      }

      client.pingerTimeout = setTimeout(async () => await pinger(), 15 * 1000)
    } catch(e) {
      logError(e)
      log(`Disconnecting ${realm.key} due to error`)
      cleanupClient(client)
    }
  })

  client.socket.on('disconnect', () => {
    log('Disconnected: ' + realm.key)
    cleanupClient(client)
  })

  client.socket.on('PingRequest', function (msg) {
    log('PingRequest', realm.key, msg)

    client.socket.emit('PingResponse')
  })

  client.socket.on('PongRequest', function (msg) {
    log('PongRequest', realm.key, msg)

    client.socket.emit('PongResponse')
  })

  client.socket.on('BanPlayerRequest', async function (req) {
    console.log(req)
    try {
      log('Ban', realm.key, req)

      if (await isValidRequest(app.web3, req) && app.db.evolution.modList.includes(req.signature.address)) {
        app.db.addBanList('evolution', req.data.target)
  
        app.db.saveBanList()

        app.realm.emitAll('BanUserRequest', {
          signature: await getSignedRequest(app.web3, app.secrets, md5(JSON.stringify({ target: req.data.target }))),
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
    log('ReportPlayerRequest', realm.key, msg)

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
    // Iterate the items found, add to user.evolution.rewards
    // Itereate the runes found, add to user.evolution.runes
    // Iterate the winners, add to the user.evolution.runes
    // Add winning stats to user.evolution
    try {
      log('SaveRoundRequest', realm.key, req)

      if (!await isValidRequest(app.web3, req) && app.db.evolution.modList.includes(req.signature.address)) {
        client.socket.emit('SaveRoundResponse', {
          id: req.id,
          data: { status: 0, message: 'Invalid signature' }
        })
        return
      }

      // if (req.data.roundId > realm.roundId) {
      //   client.socket.emit('SaveRoundResponse', {
      //     id: req.id,
      //     data: { status: 0, message: 'Invalid round id' }
      //   })
      //   return
      // }

      const users = []

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

            const runeSymbol = pickup.rewardItemName.toLowerCase()

            if (!runes.includes(runeSymbol)) {
              continue
            }

            if (!user.rewards.runes[runeSymbol] || user.rewards.runes[runeSymbol] < 0.000000001) {
              user.rewards.runes[runeSymbol] = 0
            }

            user.rewards.runes[runeSymbol] += pickup.quantity

            if (!user.lifetimeRewards.runes[runeSymbol] || user.lifetimeRewards.runes[runeSymbol] < 0.000000001) {
              user.lifetimeRewards.runes[runeSymbol] = 0
            }

            user.lifetimeRewards.runes[runeSymbol] += pickup.quantity
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

        if (user.rewards.runes['zod'] < 0) {
          user.rewards.runes['zod'] = 0
        }

        user.rewards.runes['zod'] += rewardWinnerMap[index]

        if (!user.lifetimeRewards.runes['zod']) {
          user.lifetimeRewards.runes['zod'] = 0
        }

        user.lifetimeRewards.runes['zod'] += rewardWinnerMap[index]
      }

      for (const user of users) {
        await app.db.saveUser(user)
      }

      if (req.data.roundId > realm.roundId) {
        realm.roundId = req.data.roundId
      } else if (req.data.roundId < realm.roundId) {
        client.socket.emit('SaveRoundResponse', {
          id: req.id,
          data: { status: 0, message: `Round id too low (realm.roundId = ${realm.roundId})` }
        })
        return
      } else {
        realm.roundId += 1
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
  })

  client.socket.onAny(function(eventName, res) {
    // log('Event All', eventName, res)
    if (!res || !res.id) return
    // console.log(eventName, res)
    if (ioCallbacks[res.id]) {
      log('Callback', eventName, res)

      clearTimeout(ioCallbacks[res.id].reqTimeout)

      ioCallbacks[res.id].resolve(res.data)

      delete ioCallbacks[res.id]
    }
  })

  client.socket.connect()

  client.connectTimeout = setTimeout(function() {
    if (!client.isAuthed) {
      log(`Couldnt connect/authorize ${realm.key} on ${realm.endpoint}`)
      disconnectClient(client)
    }
  }, 60 * 1000)
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
        games.evolution.realms[realm.key].key = realm.key

        games.evolution.realms[realm.key].client = {
          isAuthed: false,
          isConnecting: false,
          isConnected: false,
          socket: null,
          connectTimeout: null,
          reqTimeout: null
        }
      }

      if (!realm.roundId) {
        realm.roundId = 1
      }

      if (realm.key === 'ptr1' || realm.key === 'tournament1') continue 

      if (!games.evolution.realms[realm.key].client.isConnected && !games.evolution.realms[realm.key].client.isConnecting && !games.evolution.realms[realm.key].client.isAuthed) {
        await connectRealm(app, realm)
      }
    }
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
    app.realm.apiSignature = await getSignedRequest(app.web3, app.secrets, 'evolution')
    app.realm.emitAll = emitAll.bind(null, app)
  }

  await connectRealms(app)
  await updateRealms(app)

  setTimeout(() => monitorEvolutionRealms(app), 30 * 1000)
}
