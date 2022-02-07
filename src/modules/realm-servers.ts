import fetch from 'node-fetch'
import path from 'path'
import jetpack from 'fs-jetpack'
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

export async function connectRealm(app, server) {
  if (games.evolution.realms[server.key].client?.socket.connected) {
    games.evolution.realms[server.key].client.socket.close()
  }

  const client = {
    authed: false,
    socket: getClientSocket('http://' + server.endpoint.replace('3007', '3006'))
  }

  client.socket.on('connect', async () => {
    try {
      log('Connected: ' + server.key)

      const res = await rsCall(client, 'AuthRequest', 'myverysexykey') as any

      if (res.status === 1) {
        client.authed = true

        if (!app.db.evolutionHistorical.playerCount) app.db.evolutionHistorical.playerCount = []

        let playerCount = 0

        for (const server of app.db.evolutionServers) {
          try {
            const rand = Math.floor(Math.random() * Math.floor(999999))
            const response = await rsCall(client, 'InfoRequest') as any

            const { data } = response

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
      }
    } catch(e) {
      logError(e)
    }
  })

  client.socket.on('disconnect', () => {
    log('Disconnected: ' + server.key)
  })

  client.socket.on('PingRequest', function (msg) {
    log(msg)

    client.socket.emit('PingResponse')
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

      if (await verifySignature(req.signature) && app.db.evolution.modList.includes(req.signature.address)) {
        console.log(req)
        // Iterate the winners, determine the winning amounts, validate, save to user rewards
        // Iterate all players and save their log / stats 
        for (const player of req.players) {
          const user = app.db.loadUser(player.address)

          for (const pickup of player.pickups) {
            if (pickup.type === 'rune') {
              user.rewards.runes[pickup.rewardItemName.toLowerCase()] += pickup.quantity
            } else {
              user.rewards.items[pickup.id] = {
                name: pickup.name,
                rarity: pickup.rarity,
                quantity: pickup.quantity
              }
            }
          }
        }
        
        client.socket.emit('SaveRoundResponse', {
          id: req.id,
          data: { status: 1 }
        })
      } else {
        client.socket.emit('SaveRoundResponse', {
          id: req.id,
          data: { status: 0, message: 'Invalid signature' }
        })
      }
    } catch (e) {
      logError(e)
      
      client.socket.emit('SaveRoundResponse', {
        id: req.id,
        data: { status: 0, message: e }
      })
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
      ioCallbacks[res.id](res.data)

      delete ioCallbacks[res.id]
    }
  })

  client.socket.connect()

  games.evolution.realms[server.key].client = client
}

export async function connectRealms(app) {
  for (const server of app.db.evolutionServers) {
    if (!games.evolution.realms[server.key]) {
      games.evolution.realms[server.key] = {}
      for (const key in Object.keys(server)) {
        games.evolution.realms[server.key][key] = server[key]
      }
    }

    if (!games.evolution.realms[server.key].client?.authed) {
      connectRealm(app, server)
    }
  }
}

export async function emitAll(app, ...args) {
  for (const server of app.db.evolutionServers) {
    if (games.evolution.realms[server.key]?.client?.authed) {
      games.evolution.realms[server.key]?.client?.socket.emit(...args)
    }
  }
}

export async function monitorRealmServers(app) {
  if (!app.realm) {
    app.realm = {}
    app.realm.apiAddress = '0x4b64Ff29Ee3B68fF9de11eb1eFA577647f83151C'
    app.realm.apiSignature = await getSignedRequest('evolution')
    app.realm.emitAll = emitAll.bind(null, app)
  }

  connectRealms(app) 

  setTimeout(() => monitorRealmServers(app), 10 * 1000)
}