import fs from 'fs'
import express from 'express'
import { log, logError } from '../util'
import * as websocketUtil from '../util/websocket'

const path = require('path')

function initEventHandler(app) {
  const { emitDirect, emitAll, io } = app.cubeBridge

  log('Cube event handler')
  
  io.on('connection', function(socket) {
    try {
      // Use by GS to tell DB it's connected
      socket.on('RC_AuthRequest', function(req) {
        if (req.data !== 'myverysexykey') {
          log('Invalid databaser creds:', req)
          emitDirect(socket, 'RC_AuthResponse', {
            id: req.id,
            data: { status: 0 }
          })
          return
        }

        socket.authed = true
  
        emitDirect(socket, 'RC_AuthResponse', {
          id: req.id,
          data: { status: 1 }
        })
      })
  
      socket.on('RC_GetUserRequest', function(req) {
        if (!socket.authed) {
          emitDirect(socket, 'RC_GetUserResponse', {
            id: req.id,
            data: {
              status: 0
            }
          })
          return
        }
        
        emitDirect(socket, 'RC_GetUserResponse', {
          id: req.id,
          data: {
            status: 1,
            user: app.db.loadUser(req.data.address)
          }
        })
      })

      socket.on('RC_SaveUserClaimRequest', async function(req) {
        if (!socket.authed) {
          emitDirect(socket, 'RC_SaveUserClaimResponse', {
            id: req.id,
            data: {
              status: 0
            }
          })
          return
        }

        try {
          const user = app.db.loadUser(req.data.address)

          if (!user.rewardHistory) user.rewardHistory = []

          for (const rune of req.data.runes) {
            user.rewardHistory.push({
              id: req.data.id,
              rune: rune.key,
              value: rune.value,
              timestamp: new Date().getTime()
            })

            user.rewards.runes[rune.key] -= rune.value
          }

          for (const item of req.data.items) {
            user.rewardHistory.push({
              id: req.data.id,
              item: JSON.parse(JSON.stringify(user.rewards.items[item.key])),
              quantity: item.quantity,
              timestamp: new Date().getTime()
            })

            delete user.rewards.items[item.key]
          }

          if (!user.claimRequests) user.claimRequests = []
  
          let claimRequest = user.claimRequests.find(c => c.requestId === req.data.requestId)
  
          if (!claimRequest) {
            claimRequest = {
              id: req.data.id,
              requestId: req.data.requestId,
              timestamp: new Date().getTime()
            }
  
            user.claimRequests.push(claimRequest)
  
            claimRequest.status = 'processing'
          }

          await app.db.saveUser(user)

          emitDirect(socket, 'RC_SaveUserClaimResponse', {
            id: req.id,
            data: {
              status: 1
            }
          })
        } catch (e) {
          logError(e)

          emitDirect(socket, 'RC_SaveUserClaimResponse', {
            id: req.id,
            data: {
              status: 0
            }
          })
        }
      })
      
      socket.on('RC_EvolutionRealmListRequest', function(req) {
        if (!socket.authed) {
          emitDirect(socket, 'RC_EvolutionRealmListResponse', {
            id: req.id,
            data: {
              status: 0
            }
          })
          return
        }

        emitDirect(socket, 'RC_EvolutionRealmListResponse', {
          id: req.id,
          data: {
            status: 1,
            list: app.db.evolutionServers
          }
        })
      })

      socket.onAny(function(eventName, res) {
        // log('onAny', eventName, res)
        if (!res || !res.id) return
        // console.log(eventName, res)
        if (app.cubeBridge.ioCallbacks[res.id]) {
          log('Callback', eventName)
          app.cubeBridge.ioCallbacks[res.id](res.data)
    
          delete app.cubeBridge.ioCallbacks[res.id]
        }
      })

      socket.on('disconnect', function() {
      })
    } catch(e) {
      logError(e)
    }
  })
}

export async function initCubeBridge(app) {
  app.cubeBridge = {}

  app.cubeBridge.ioCallbacks = {}

  app.cubeBridge.server = express()

  const isHttps = false // process.env.SUDO_USER === 'dev' || process.env.OS_FLAVOUR === 'debian-10'

  if (isHttps) {
    app.cubeBridge.https = require('https').createServer({
      key: fs.readFileSync(path.resolve('./privkey.pem')),
      cert: fs.readFileSync(path.resolve('./fullchain.pem'))
    }, app.cubeBridge.server)
  
  } else {
    app.cubeBridge.http = require('http').Server(app.cubeBridge.server)
  }

  app.cubeBridge.io = require('socket.io')(isHttps ? app.cubeBridge.https : app.cubeBridge.http, {
    secure: isHttps ? true : false,
    pingInterval: 30005,
    pingTimeout: 5000,
    upgradeTimeout: 3000,
    allowUpgrades: true,
    cookie: false,
    serveClient: true,
    allowEIO3: false,
    cors: {
      origin: "*"
    }
  })

  // Finalize
  if (isHttps) {
    const sslPort = process.env.CUBE_BRIDGE_PORT || 443
    app.cubeBridge.https.listen(sslPort, function() {
      log(`:: Backend ready and listening on *:${sslPort}`)
    })
  } else {
    const port = process.env.CUBE_BRIDGE_PORT || 7777
    app.cubeBridge.http.listen(port, function() {
      log(`:: Backend ready and listening on *:${port}`)
    })
  }

  app.cubeBridge.emitDirect = websocketUtil.emitDirect.bind(null, app.cubeBridge.io)
  app.cubeBridge.emitAll = websocketUtil.emitAll.bind(null, app.cubeBridge.io)

  initEventHandler(app)
}
