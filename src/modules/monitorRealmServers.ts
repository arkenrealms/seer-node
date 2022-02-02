import ethers from 'ethers'
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
  if (games.evolution.realms[server.key].connection?.socket.connected) {
    games.evolution.realms[server.key].connection.socket.close()
  }

  const client = {
    authed: false,
    socket: getClientSocket('http://' + server.endpoint)
  }

  client.socket.on('connect', async () => {
    log('Connected: ' + server.key)

    const res = await rsCall(client, 'AuthRequest', 'myverysexykey') as any

    if (res.success === 1) {
      client.authed = true
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
          data: { success: 1 }
        })
      } else {
        client.socket.emit('BanUserResponse', {
          id: req.id,
          data: { success: 0, message: 'Invalid signature' }
        })
      }
    } catch (e) {
      logError(e)
      
      client.socket.emit('BanUserResponse', {
        id: req.id,
        data: { success: 0, message: e }
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


  client.socket.on('RoundFinishedRequest', function (msg) {
    log(msg)

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

  games.evolution.realms[server.key].connection = client
}

export async function connectRealms(app) {
  for (const server of app.db.evolutionServers) {
    if (!games.evolution.realms[server.key]) {
      games.evolution.realms[server.key] = {}
      for (const key in Object.keys(server)) {
        games.evolution.realms[server.key][key] = server[key]
      }
    }

    if (!games.evolution.realms[server.key].connection?.authed) {
      connectRealm(app, server)
    }
  }
}

export async function emitAll(app, ...args) {
  for (const server of app.db.evolutionServers) {
    if (games.evolution.realms[server.key]?.connection?.authed) {
      games.evolution.realms[server.key]?.connection?.socket.emit(...args)
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