export let config = {
}

const local = {
  requests: {},
  store: null,
  router: null,
  unlockResolve: null,
  events: {},
  clients: [],
  on: () => { console.warn("on() not set") },
  send: () => { console.warn("sender() not set") },
  sign: () => { console.warn("signer() not set") },
  isConnected: () => { console.warn("isConnected() not set") }
}

export const on = (event, listener) => {
  if (!Array.isArray(local.events[event])) {
    local.events[event] = [];
  }
  local.events[event].push(listener);
  return () => removeListener(event, listener);
}

export const removeListener = (event, listener) => {
  if (Array.isArray(local.events[event])) {
    const idx = local.events[event].indexOf(listener);
    if (idx > -1) {
      local.events[event].splice(idx, 1);
    }
  }
}

export const emit = (event, ...args) => {
  if (Array.isArray(local.events[event])) {
    local.events[event].forEach(listener => listener.apply(this, args));
  }
}

export const once = (event, listener) => {
  const remove = on(event, (...args) => {
    remove();
    listener.apply(this, args);
  });
}


export const ID = () => {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return '_' + Math.random().toString(36).substr(2, 9);
}

export const resolvePromptPasswordRequest = async (password) => {
  return new Promise(async (resolve) => {
    const res = {
      password
    }

    local.unlockResolve(res)
  })
}

export const runCommand = async (cmd, meta = {}) => {
  console.log('[Bridge] Running command', cmd.key)

  return new Promise(async (resolve, reject) => {
    emit(cmd.key, cmd.data ? cmd.data : undefined)

    if (cmd.responseId) {
      if (local.requests[cmd.responseId]) {
        console.log('[Bridge] Running response callback', cmd.responseId)

        local.requests[cmd.responseId].resolve(cmd.data)

        delete local.requests[cmd.responseId]
      }

      return resolve()
    }

    if (cmd.key === 'heartbeat') {
      console.log('[Bridge] Heartbeat')

      setTimeout(() => {
        sendCommand('heartbeat', 1)
      }, 1 * 60 * 1000)
    } else if (cmd.key === 'promptPasswordRequest') {
      const res = await promptPasswordRequest(cmd.data)

      return resolve(await sendCommand('promptPasswordResponse', res, meta.client, cmd.requestId))
    } else if (cmd.key === 'setProtocolConfig') {
      const { currentNetwork, protocolName, config } = cmd.data
    
      local.store.state.application.ethereum[currentNetwork].packages[protocolName] = config
      local.store.dispatch('application/updateState')
    } else if (cmd.key === 'setAccountRequest') {
      const res = await setAccountRequest(cmd.data)

      return resolve(await sendCommand('setAccountRequestResponse', res, meta.client, cmd.requestId))
    } else if (cmd.key === 'setMode') {
    } else if (cmd.key === 'updateReady') {
      console.log(cmd.data)

      await sendCommand('quitAndInstall')
    } else if (cmd.key === 'updateState') {
      local.store.commit(cmd.data.module + '/updateState', cmd.data.state)
    } else if (cmd.key === 'systemError') {
      console.warn('[Bridge] Received system error from desktop', cmd.data)

      notifications.error(cmd.data, 'System Error', {
        timeout: 5000,
        pauseOnHover: true
      })

      // Don't let promise callbacks get stuck
      for(let i in local.requests) {
        local.requests[i].reject()

        delete local.requests[i]
      }
    } else if (cmd.key === 'navigate') {
      local.router.push(cmd.data)
    } else {
      console.warn('[Bridge] Unhandled command:', cmd)

      return reject()
    }

    return resolve(await sendCommand('response', null, meta.client, cmd.requestId))
  })
}

export const initCommandMonitor = () => {
  local.on('command', (event, msg) => {
    console.log('[Bridge] Received command from desktop', msg)

    const cmd = JSON.parse(msg)

    runCommand(cmd)
  })
}

export const sendCommand = async (key, data = {}, peer = null, responseId = null) => {
  if (!local.isConnected()) {
    console.log('[Bridge] Cant send command. Reason: not connected to desktop app', key)

    // Ignore startup commands
    if (key !== 'initProtocol' && key !== 'error') {
      // local.store.commit('application/activateModal', 'welcome')
    }

    return false
  }

  const cmd = {
    key: key,
    responseId: responseId,
    requestId: ID(),
    data: data
  }

  console.log('[Bridge] Sending command', cmd)

  let _resolve, _reject
  let promise = new Promise((resolve, reject) => {
    _resolve = resolve
    _reject = reject
  })
  promise.resolve = _resolve
  promise.reject = _reject

  local.requests[cmd.requestId] = promise

  local.send('command', JSON.stringify(cmd))

  return promise
}

export async function connect() {
  const username = 'Bridge'
  const channel = 'main1'
  const hostname = 'edge-chat-demo.cloudflareworkers.com'

  const ws = new WebSocket('wss://' + hostname + '/api/room/' + channel + '/websocket')
  let rejoined = false
  const startTime = Date.now()

  const rejoin = async () => {
    if (!rejoined) {
      rejoined = true
      currentWebSocket = null

      // Don't try to reconnect too rapidly.
      const timeSinceLastJoin = Date.now() - startTime
      if (timeSinceLastJoin < 10000) {
      // Less than 10 seconds elapsed since last join. Pause a bit.
      await new Promise((resolve) => setTimeout(resolve, 10000 - timeSinceLastJoin))
      }

      // OK, reconnect now!
      join()
    }
  }

  ws.addEventListener('open', (event) => {
    currentWebSocket = ws

    // Send user info message.
    ws.send(JSON.stringify({ name: username }))
  })

  ws.addEventListener('message', async (event) => {
    console.log('[Bridge] Received command from client', msg)

    const data = JSON.parse(event.data)

    if (data.error) {
      console.log('[Bridge] Client error:', data.error)
    } else if (data.joined) {
      if (local.clients.find(c => c.address === data.joined)) return

      local.clients.push({
        quit: false,
        address: data.joined,
        connectedAt: (new Date()).getTime(),
        disconnectedAt: null
      })
    } else if (data.quit) {
      const client = local.clients.filter(c => c.address === data.joined)

      if (client) {
        client.quit = true
        client.disconnectedAt = (new Date()).getTime()
      }
    } else if (data.timestamp > lastSeenTimestamp) {
      const address = data.message.name
      const client = local.clients.filter(c => c.address === address)
      const cmd = JSON.parse(data.message.text)

      runCommand(client, cmd)
    }
  })

  ws.addEventListener('close', (event) => {
    console.log('WebSocket closed, reconnecting:', event.code, event.reason)
    rejoin()
  })

  ws.addEventListener('error', (event) => {
    console.log('WebSocket error, reconnecting:', event)
    rejoin()
  })
}

export async function sendUserEvent(channel, data) {

}

export async function sendChannelEvent(channel, data) {

}

export const init = (on, send, sign, isConnected) => {
  local.on = on
  local.send = send
  local.sign = sign
  local.isConnected = isConnected
  // local.store = store
  // local.router = router
  // local.bridge = typeof(window) !== 'undefined' && window.localStorage ? window.desktopBridge : undefined

  if (!local.isConnected()) {
    console.log('[Bridge] Not initializing. Reason: not connected to desktop app')

    return false
  }

  console.log('[Bridge] Initializing')

  on('promptPasswordRequest', (data) => {
    // DB.application.config.data[0].account.secret_question_1 = data.secret_question_1
  })

  sendCommand('init', 1)

  initCommandMonitor()
  initResizeMonitor()
  initContextMenuHandler()
}

