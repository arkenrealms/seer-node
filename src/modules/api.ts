import fs from 'fs'
import express from 'express'
import { getHighestId, toShort, log, random, sha256 } from '@rune-backend-sdk/util'
import * as websocketUtil from '@rune-backend-sdk/util/websocket'

const path = require('path')

const sockets = []
const clients = {}
const users = {}
const channels = {
  anonymous: [],
  players: [],
  mods: [],
  admins: []
}

function initEventHandler(app) {
  const { emitDirect, emitAll, io } = app.api

  log('API event handler')

  io.on('connection', function(socket) {
    const ip = socket.handshake.headers['x-forwarded-for']?.split(',')[0] || socket.conn.remoteAddress?.split(":")[3]
    // socket.request.connection.remoteAddress ::ffff:127.0.0.1
    // socket.conn.remoteAddress ::ffff:127.0.0.1
    // socket.conn.transport.socket._socket.remoteAddress ::ffff:127.0.0.1
    let hash = ip ? sha256(ip.slice(ip.length/2)) : ''
    hash = ip ? hash.slice(hash.length - 10, hash.length - 1) : ''

    sockets.push(socket.id)

    const client = {
      socket,
      hash
    }

    const user = {
      client,
      address: undefined
    }

    clients[socket.id] = client

    try {
      socket.onAny(function(eventName, req) {
        // log('onAny', eventName, req)
        if (!req || !req.id) return
        // console.log(eventName, req)
        if (app.api.eventCallbacks[req.id]) {
          log('Callback', eventName)
          app.api.eventCallbacks[req.id](req.data)
    
          delete app.api.eventCallbacks[req.id]
        } else {
          try {
            for (const cb of app.api.eventHandlers[eventName]) {
              cb(req, function(res) {
                socket.emit(res)
              })
            }
          } catch (e) {
            log('Event handler exception: ', e)
          }
        }
      })

      socket.on('disconnect', function() {
        sockets.splice(sockets.findIndex(s => s === socket.id), 1)

        delete clients[socket.id]
      })

      app.api.on('CS_ConnectRequest', async function (req, res) {
        log('CS_ConnectRequest', req)

        try {
          if (req.data.address) {
            user.address = req.data.address

            users[user.address] = user

            if (user.address === '0xa987f487639920A3c2eFe58C8FBDedB96253ed9B') {
              res('PlayerAction', { key: 'admin', createdAt: new Date().getTime() / 1000, count: app.api.sockets.length, message: `${app.api.sockets.length} players online` })
            }
          }

          res('CS_ConnectResponse', {
            id: req.id,
            data: { status: 1 }
          })
        } catch(e) {
          log('Error: ', e)
          res('CS_ConnectResponse', {
            id: req?.id,
            data: { status: 0, message: 'Error' }
          })
        }
      })
    } catch(e) {
      log('Live connection error', e)
    }
  })
}

const isLocalTest = process.env.LOCAL_TEST === 'true'

export async function initApi(app) {
  try {
    app.api = {}

    app.api.eventCallbacks = {}

    app.api.eventHandlers = {}

    app.api.server = express()

    const isHttps = isLocalTest ? false : true // process.env.SUDO_USER === 'dev' || process.env.OS_FLAVOUR === 'debian-10'

    if (isHttps) {
      app.api.https = require('https').createServer({
        key: fs.readFileSync(path.resolve('./privkey.pem')),
        cert: fs.readFileSync(path.resolve('./fullchain.pem'))
      }, app.api.server)
    
    } else {
      app.api.http = require('http').Server(app.api.server)
    }

    app.api.io = require('socket.io')(isHttps ? app.api.https : app.api.http, {
      secure: isHttps ? true : false,
      pingInterval: 30005,
      pingTimeout: 5000,
      upgradeTimeout: 3000,
      allowUpgrades: true,
      cookie: false,
      serveClient: false,
      allowEIO3: true,
      cors: {
        origin: "*"
      }
    })

    // Finalize
    if (isHttps) {
      const sslPort = process.env.LIVE_PORT || 8443
      app.api.https.listen(sslPort, function() {
        log(`:: Backend ready and listening on *:${sslPort}`)
      })
    } else {
      const port = process.env.LIVE_PORT || 8080
      app.api.http.listen(port, function() {
        log(`:: Backend ready and listening on *:${port}`)
      })
    }

    app.api.emitDirect = async function(socket, ...props) {
      websocketUtil.emitDirect(socket, ...props)
    }

    app.api.emitAddress = async function(address, ...props) {
      if (!users[address]) return
      websocketUtil.emitDirect(users[address], ...props)
    }

    app.api.emitChannel = async function(key, ...props) {
      if (!channels[key]) return
      for (const address of channels[key]) {
        app.api.emitAddress(address, ...props)
      }
    }

    app.api.emitAll = async function(...props) {
      websocketUtil.emitAll(app.api.io, ...props)
    }
    
    app.api.on = async function(eventName, cb) {
      if (!app.api.eventHandlers[eventName]) app.api.eventHandlers[eventName] = []

      app.api.eventHandlers[eventName].push(cb)
    }

    initEventHandler(app)
  } catch(e) {
    log('Error', e)
  }
}
