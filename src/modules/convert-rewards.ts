import path from 'path'
import jetpack from 'fs-jetpack'
import { log } from '../util'

export async function convertRewards(app) {
  log('Convert rewards')

  const userCache = {}

  // Iterate every realm playerRewards
  // Combine into the user.evolution.rewards object
  for (const server of app.db.evolutionServers) {
    log('Server', server.key)

    try {
      const playerRewards = jetpack.read(path.resolve(`./db/evolution/${server.key}/playerRewards.json`), 'json') || {}

      for (const address of Object.keys(playerRewards)) {
        const user = userCache[address.toLowerCase()] || app.db.loadUser(address)
        if (address === '0x865f4a1eDEdBf68f05E0DD27242d397Bb8b1255b') {
          console.log(111, address, user)
        }
        const rewards = playerRewards[address]

        if (!userCache[address.toLowerCase()]) {
          user.rewards = {
            runes: {},
            items: {}
          }

          userCache[address.toLowerCase()] = user
        }

        for (const key of Object.keys(rewards.pending)) {
          if (!user.rewards.runes[key]) user.rewards.runes[key] = 0

          user.rewards.runes[key] += rewards.pending[key]
        }

        for (const index in rewards.pendingItems) {
          const item = rewards.pendingItems[index]
          user.rewards.items[item.id] = {
            name: item.name,
            rarity: item.rarity,
            quantity: item.quantity
          }
        }

        if (address === '0x865f4a1eDEdBf68f05E0DD27242d397Bb8b1255b') {
          console.log(222, address, rewards, user)
        }
        if (Object.keys(user.rewards.items).length > 0) {
          console.log(address)
        }

        app.db.saveUser(user)
      }
    } catch(e) {
      log(e)
    }
  }
}