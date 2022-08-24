import fs from 'fs'
import express from 'express'
import { getHighestId, toShort, log } from '@rune-backend-sdk/util'
import * as websocketUtil from '@rune-backend-sdk/util/websocket'

const path = require('path')

function initEventHandler(app) {
  const { emitDirect, emitAll, io } = app.live

  log('Live event handler')

  io.on('connection', function(socket) {
    try {
      socket.onAny(function(eventName, res) {
        // log('onAny', eventName, res)
        if (!res || !res.id) return
        // console.log(eventName, res)
        if (app.live.ioCallbacks[res.id]) {
          log('Callback', eventName)
          app.live.ioCallbacks[res.id](res.data)
    
          delete app.live.ioCallbacks[res.id]
        }
      })

      socket.on('disconnect', function() {
      })
    } catch(e) {
      log('Error', e)
    }
  })
}

export async function initLive(app) {
  try {
    app.live = {}

    app.live.ioCallbacks = {}

    app.live.server = express()

    const isHttps = true // process.env.SUDO_USER === 'dev' || process.env.OS_FLAVOUR === 'debian-10'

    if (isHttps) {
      app.live.https = require('https').createServer({
        key: fs.readFileSync(path.resolve('./privkey.pem')),
        cert: fs.readFileSync(path.resolve('./fullchain.pem'))
      }, app.live.server)
    
    } else {
      app.live.http = require('http').Server(app.live.server)
    }

    app.live.io = require('socket.io')(isHttps ? app.live.https : app.live.http, {
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
      app.live.https.listen(sslPort, function() {
        log(`:: Backend ready and listening on *:${sslPort}`)
      })
    } else {
      const port = process.env.LIVE_PORT || 8080
      app.live.http.listen(port, function() {
        log(`:: Backend ready and listening on *:${port}`)
      })
    }

    app.live.emitDirect = async function(...props) {
      websocketUtil.emitDirect(...props)
    }
    
    app.live.emitAll = async function(...props) {
      websocketUtil.emitAll(app.live.io, ...props)
    }

    initEventHandler(app)
  } catch(e) {
    log('Error', e)
  }
}
