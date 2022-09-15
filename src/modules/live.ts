import fs from 'fs'
import express from 'express'
import { getHighestId, toShort, log, random } from '@rune-backend-sdk/util'
import * as websocketUtil from '@rune-backend-sdk/util/websocket'
import { decodeItem } from '@rune-backend-sdk/util/item-decoder'
import { isValidRequest, getSignedRequest } from '@rune-backend-sdk/util/web3'
import shortId from 'shortid'

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


      socket.on('CS_SiteQuestRequest', async function (req) {
        log('CS_SiteQuestRequest', req)

        try {
          
        } catch(e) {
          socket.emit('CS_SiteQuestResponse', {
            id: req?.id,
            data: { status: 0, message: 'Invalid signature' }
          })
        }
      })

      socket.on('CS_ClaimSkinRequest', async function (req) {
        log('CS_ClaimSkinRequest', req)

        try {
          const tokenId = req.data.tokenId
          const ownerAddress = await app.contracts.items.ownerOf(tokenId)

          if (!await isValidRequest(app.web3, req) || req.signature.address !== ownerAddress) {
            socket.emit('CS_ClaimSkinResponse', {
              id: req.id,
              data: { status: 0, message: 'Invalid signature' }
            })
            return
          }
          
          if (app.db.tokenSkins[tokenId] !== undefined) {
            socket.emit('CS_ClaimSkinResponse', {
              id: req.id,
              data: { status: 0, message: 'Already claimed' }
            })
            return
          }
          
          const item = decodeItem(tokenId)

          if (!app.db?.skins?.[item.id]?.[item.rarity.name.toLowerCase()]) {
            socket.emit('CS_ClaimSkinResponse', {
              id: req.id,
              data: { status: 0, message: 'No skins exist yet' }
            })
            return
          }

          let skin

          if (['Legendary', 'Unique', 'Mythic'].includes(item.rarity.name) && app.db.skins[item.id].mythic.length > 0) {
            skin = app.db.skins[item.id].mythic[random(0, app.db.skins[item.id].mythic.length-1)]
            app.db.skins[item.id].mythic = app.db.skins[item.id].mythic.filter(s => s !== skin)
          } else if (['Legendary', 'Unique', 'Mythic', 'Epic'].includes(item.rarity.name) && app.db.skins[item.id].epic.length > 0) {
            skin = app.db.skins[item.id].epic[random(0, app.db.skins[item.id].epic.length-1)]
            app.db.skins[item.id].epic = app.db.skins[item.id].epic.filter(s => s !== skin)
          } else if (['Legendary', 'Unique', 'Mythic', 'Epic', 'Rare'].includes(item.rarity.name) && app.db.skins[item.id].rare.length > 0) {
            skin = app.db.skins[item.id].rare[random(0, app.db.skins[item.id].rare.length-1)]
            app.db.skins[item.id].rare = app.db.skins[item.id].rare.filter(s => s !== skin)
          } else if (['Legendary', 'Unique', 'Mythic', 'Epic', 'Rare', 'Magical'].includes(item.rarity.name) && app.db.skins[item.id].magical.length > 0) {
            skin = app.db.skins[item.id].magical[random(0, app.db.skins[item.id].magical.length-1)]
            app.db.skins[item.id].magical = app.db.skins[item.id].magical.filter(s => s !== skin)
          }

          app.db.tokenSkins[tokenId] = skin

          const token = await app.db.loadToken(tokenId)

          if (!token.defaultImage) token.defaultImage = token.image

          token.image = `https://cache.rune.game/${skin}`

          app.db.queueSave(() => app.db.saveSkins())
          app.db.queueSave(() => app.db.saveTokenSkins())
          app.db.queueSave(() => app.db.saveToken(token))

          socket.emit('CS_ClaimSkinResponse', {
            id: req?.id,
            data: { status: 1 }
          })
        } catch(e) {
          socket.emit('CS_ClaimSkinResponse', {
            id: req?.id,
            data: { status: 0, message: 'Error' }
          })
        }
      })

      socket.on('CS_DetachSkinRequest', async function (req) {
        log('CS_DetachSkinRequest', req)

        try {
          const tokenId = req.data.tokenId
          const ownerAddress = await app.contracts.items.ownerOf(tokenId)

          if (!await isValidRequest(app.web3, req) || req.signature.address !== ownerAddress) {
            socket.emit('CS_DetachSkinResponse', {
              id: req.id,
              data: { status: 0, message: 'Invalid signature' }
            })
            return
          }
          
          if (!app.db.tokenSkins[tokenId]) {
            socket.emit('CS_DetachSkinResponse', {
              id: req.id,
              data: { status: 0, message: 'Already detached' }
            })
            return
          }

          const item = decodeItem(tokenId)

          if (!app.db.userSkins[ownerAddress]) app.db.userSkins[ownerAddress] = {}
          if (!app.db.userSkins[ownerAddress][item.id]) app.db.userSkins[ownerAddress][item.id] = []

          app.db.userSkins[ownerAddress][item.id].push(app.db.tokenSkins[tokenId])

          app.db.tokenSkins[tokenId] = null

          const token = await app.db.loadToken(tokenId)

          token.image = token.defaultImage

          app.db.queueSave(() => app.db.saveSkins())
          app.db.queueSave(() => app.db.saveTokenSkins())
          app.db.queueSave(() => app.db.saveUserSkins())
          app.db.queueSave(() => app.db.saveToken(token))

          socket.emit('CS_DetachSkinResponse', {
            id: req?.id,
            data: { status: 1 }
          })
        } catch(e) {
          socket.emit('CS_DetachSkinResponse', {
            id: req?.id,
            data: { status: 0, message: 'Error' }
          })
        }
      })

      socket.on('CS_AttachSkinRequest', async function (req) {
        log('CS_AttachSkinRequest', req)

        try {
          const tokenId = req.data.tokenId
          const skin = req.data.skin
          const ownerAddress = await app.contracts.items.ownerOf(tokenId)

          if (!await isValidRequest(app.web3, req) || req.signature.address !== ownerAddress) {
            socket.emit('CS_AttachSkinResponse', {
              id: req.id,
              data: { status: 0, message: 'Invalid signature' }
            })
            return
          }
          
          if (app.db.tokenSkins[tokenId] || !skin) {
            socket.emit('CS_AttachSkinResponse', {
              id: req.id,
              data: { status: 0, message: 'Already attached' }
            })
            return
          }

          const item = decodeItem(tokenId)

          if (!app.db.userSkins[ownerAddress]) app.db.userSkins[ownerAddress] = {}
          if (!app.db.userSkins[ownerAddress][item.id]) app.db.userSkins[ownerAddress][item.id] = []

          app.db.userSkins[ownerAddress][item.id] = app.db.userSkins[ownerAddress][item.id].filter(s => s !== skin)

          app.db.tokenSkins[tokenId] = skin

          const token = await app.db.loadToken(tokenId)

          token.image = `https://cache.rune.game/${skin}`

          app.db.queueSave(() => app.db.saveSkins())
          app.db.queueSave(() => app.db.saveTokenSkins())
          app.db.queueSave(() => app.db.saveUserSkins())
          app.db.queueSave(() => app.db.saveToken(token))

          socket.emit('CS_AttachSkinResponse', {
            id: req?.id,
            data: { status: 1 }
          })
        } catch(e) {
          socket.emit('CS_AttachSkinResponse', {
            id: req?.id,
            data: { status: 0, message: 'Error' }
          })
        }
      })

      socket.on('CS_GetUserSkinsRequest', async function (req) {
        log('CS_GetUserSkinsRequest', req)

        try {
          socket.emit('CS_GetUserSkinsResponse', {
            id: req.id,
            data: { status: 1, data: app.db.userSkins?.[req.data.address] || {} }
          })
        } catch(e) {
          socket.emit('CS_GetUserSkinsResponse', {
            id: req?.id,
            data: { status: 0, message: 'Error' }
          })
        }
      })

      socket.on('CS_GetTokenSkinsRequest', async function (req) {
        log('CS_GetTokenSkinsRequest', req)

        try {
          socket.emit('CS_GetTokenSkinsResponse', {
            id: req.id,
            data: { status: 1, data: app.db.tokenSkins }
          })
        } catch(e) {
          socket.emit('CS_GetTokenSkinsResponse', {
            id: req?.id,
            data: { status: 0, message: 'Error' }
          })
        }
      })

      socket.emit('RS_ConnectRequest', {
        id: shortId()
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

    app.live.emitDirect = async function(socket, ...props) {
      websocketUtil.emitDirect(socket, ...props)
    }

    app.live.emitAll = async function(...props) {
      websocketUtil.emitAll(app.live.io, ...props)
    }

    initEventHandler(app)
  } catch(e) {
    log('Error', e)
  }
}
