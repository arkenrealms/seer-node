export async function connect() {

  const username = 'foghorn'
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
    const data = JSON.parse(event.data)
    // console.log(data)
    if (data.error) {
      addChatMessage(null, 'System', data.error)
    } else if (data.joined) {
      const p = document.createElement('p')
      p.innerText = data.joined
      roster.push(p)
      setRoster(roster)
    } else if (data.quit) {
      // roster.remove(data.quit) // may not work
      setRoster(roster)
    } else if (data.ready) {
      // All pre-join messages have been delivered.
      // if (!wroteWelcomeMessages) {
      //   wroteWelcomeMessages = true;
      //   addChatMessage(null,
      //       "Welcome to the Trollbox");
      // }
    } else if (data.timestamp > lastSeenTimestamp) {
      const found = !!messages.find(
        (m) => m.name === data.message.name && m.text === data.message.text && m.timestamp === data.timestamp,
      )

      if (found) return

      await addChatMessage(data.timestamp, data.name, data.message)
      lastSeenTimestamp = data.timestamp
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

export async function addChannel() {

}

export async function sendUserEvent(channel, data) {

}

export async function sendChannelEvent(channel, data) {

}