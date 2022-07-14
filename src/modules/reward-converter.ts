import path from 'path'
import jetpack from 'fs-jetpack'
import { log } from '@rune-backend-sdk/util'


export async function convertRewards(app) {
  log('Convert rewards')

  const userCache = {}

  const evolutionServers = [
    {
      "key": "oceanic1",
      "name": "Oceanic",
      "regionId": 1,
      "endpoint": "oceanic1.runeevolution.com",
      "status": "offline",
      "playerCount": 0,
      "rewardItemAmount": 0,
      "rewardWinnerAmount": 0,
      "version": "1.6.3",
      "gameMode": "Mix Game 1",
      "roundId": 41691,
      "roundStartedAt": 1644146543,
      "roundStartedDate": "Mon Aug 30 2021 20:18:35 GMT+0000 (Coordinated Universal Time)",
      "timeLeft": 286,
      "timeLeftFancy": "2:13",
      "timeLeftText": "4:46",
      "speculatorCount": 0
    },
    {
      "key": "europe1",
      "name": "Europe",
      "regionId": 1,
      "endpoint": "europe1.runeevolution.com",
      "status": "offline",
      "version": "1.6.3",
      "rewardItemAmount": 0,
      "rewardWinnerAmount": 0,
      "playerCount": 0,
      "gameMode": "Sprite Leader",
      "roundId": 39824,
      "roundStartedAt": 1644146527,
      "roundStartedDate": "Mon Aug 30 2021 20:19:08 GMT+0000 (Coordinated Universal Time)",
      "timeLeft": 275,
      "timeLeftFancy": "2:49",
      "timeLeftText": "4:35",
      "speculatorCount": 0
    },
    {
      "key": "europe2",
      "name": "Europe",
      "regionId": 2,
      "endpoint": "europe2.runeevolution.com",
      "status": "offline",
      "version": "1.6.3",
      "rewardItemAmount": 0,
      "rewardWinnerAmount": 0,
      "playerCount": 0,
      "gameMode": "Sticky Mode",
      "roundId": 20870,
      "roundStartedAt": 1637351412,
      "roundStartedDate": "Mon Aug 30 2021 20:19:08 GMT+0000 (Coordinated Universal Time)",
      "timeLeft": 47,
      "timeLeftFancy": "2:49",
      "timeLeftText": "0:47",
      "speculatorCount": 0
    },
    {
      "key": "europe3",
      "name": "Europe",
      "regionId": 3,
      "endpoint": "europe3.runeevolution.com",
      "status": "online",
      "version": "1.6.3",
      "rewardItemAmount": 0.006,
      "rewardWinnerAmount": 0.021,
      "playerCount": 3,
      "gameMode": "Sprite Leader",
      "roundId": 39824,
      "roundStartedAt": 1644146527,
      "roundStartedDate": "Mon Aug 30 2021 20:19:08 GMT+0000 (Coordinated Universal Time)",
      "timeLeft": 275,
      "timeLeftFancy": "2:49",
      "timeLeftText": "4:35"
    },
    {
      "key": "na1",
      "name": "North America",
      "regionId": 1,
      "endpoint": "na1.runeevolution.com",
      "status": "offline",
      "playerCount": 0,
      "rewardItemAmount": 0,
      "rewardWinnerAmount": 0,
      "version": "1.6.3",
      "gameMode": "Leadercap",
      "roundId": 45684,
      "roundStartedAt": 1644146371,
      "roundStartedDate": "Mon Aug 30 2021 20:20:06 GMT+0000 (Coordinated Universal Time)",
      "timeLeft": 118,
      "timeLeftFancy": "3:47",
      "timeLeftText": "1:58",
      "speculatorCount": 0
    },
    {
      "key": "sa1",
      "name": "South America",
      "regionId": 1,
      "endpoint": "sa1.runeevolution.com",
      "status": "offline",
      "playerCount": 0,
      "rewardItemAmount": 0,
      "rewardWinnerAmount": 0,
      "version": "1.6.3",
      "gameMode": "Lets Be Friends",
      "roundId": 41057,
      "roundStartedAt": 1644146323,
      "roundStartedDate": "Mon Aug 30 2021 20:17:58 GMT+0000 (Coordinated Universal Time)",
      "timeLeft": 70,
      "timeLeftFancy": "1:39",
      "timeLeftText": "1:10",
      "speculatorCount": 0
    },
    {
      "key": "sa2",
      "name": "South America",
      "regionId": 2,
      "endpoint": "sa2.runeevolution.com",
      "status": "offline",
      "playerCount": 0,
      "rewardItemAmount": 0,
      "rewardWinnerAmount": 0,
      "version": "1.6.0",
      "gameMode": "Standard",
      "roundId": 31127,
      "roundStartedAt": 1639661096,
      "roundStartedDate": "Mon Aug 30 2021 20:20:29 GMT+0000 (Coordinated Universal Time)",
      "timeLeft": 39,
      "timeLeftFancy": "4:09",
      "timeLeftText": "0:39",
      "speculatorCount": 0
    },
    {
      "key": "sa3",
      "name": "South America",
      "regionId": 3,
      "endpoint": "sa3.runeevolution.com",
      "status": "offline",
      "playerCount": 0,
      "rewardItemAmount": 0,
      "rewardWinnerAmount": 0,
      "version": "1.6.3",
      "gameMode": "Mix Game 2",
      "roundId": 19136,
      "roundStartedAt": 1636618815,
      "roundStartedDate": "Mon Aug 30 2021 20:20:29 GMT+0000 (Coordinated Universal Time)",
      "timeLeft": 85,
      "timeLeftFancy": "4:09",
      "timeLeftText": "1:25",
      "speculatorCount": 0
    },
    {
      "key": "sa4",
      "name": "South America",
      "regionId": 4,
      "endpoint": "sa4.runeevolution.com",
      "status": "offline",
      "playerCount": 0,
      "rewardItemAmount": 0,
      "rewardWinnerAmount": 0,
      "version": "1.6.3",
      "gameMode": "Sprite Leader",
      "roundId": 26876,
      "roundStartedAt": 1639130586,
      "roundStartedDate": "Mon Aug 30 2021 20:20:29 GMT+0000 (Coordinated Universal Time)",
      "timeLeft": 90,
      "timeLeftFancy": "4:09",
      "timeLeftText": "1:30",
      "speculatorCount": 0
    },
    {
      "key": "sa5",
      "name": "South America",
      "regionId": 5,
      "endpoint": "sa5.runeevolution.com",
      "status": "offline",
      "playerCount": 0,
      "rewardItemAmount": 0,
      "rewardWinnerAmount": 0,
      "version": "1.6.3",
      "gameMode": "Leadercap",
      "roundId": 19408,
      "roundStartedAt": 1636878670,
      "roundStartedDate": "Mon Aug 30 2021 20:20:29 GMT+0000 (Coordinated Universal Time)",
      "timeLeft": 255,
      "timeLeftFancy": "4:09",
      "timeLeftText": "4:15",
      "speculatorCount": 0
    },
    {
      "key": "asia1",
      "name": "Asia",
      "regionId": 1,
      "endpoint": "asia1.runeevolution.com",
      "status": "offline",
      "playerCount": 0,
      "rewardItemAmount": 0,
      "rewardWinnerAmount": 0,
      "version": "1.6.3",
      "gameMode": "Mix Game 1",
      "roundId": 43042,
      "roundStartedAt": 1644146338,
      "roundStartedDate": "Mon Aug 30 2021 20:19:55 GMT+0000 (Coordinated Universal Time)",
      "timeLeft": 84,
      "timeLeftFancy": "3:35",
      "timeLeftText": "1:24",
      "speculatorCount": 0
    },
    {
      "key": "asia2",
      "name": "Asia",
      "regionId": 2,
      "endpoint": "asia2.runeevolution.com",
      "status": "offline",
      "playerCount": 0,
      "rewardItemAmount": 0,
      "rewardWinnerAmount": 0,
      "version": "1.6.3",
      "gameMode": "Marco Polo",
      "roundId": 36899,
      "roundStartedAt": 1642978339,
      "roundStartedDate": "Mon Aug 30 2021 20:16:48 GMT+0000 (Coordinated Universal Time)",
      "timeLeft": 44,
      "timeLeftFancy": "0:27",
      "timeLeftText": "0:44",
      "speculatorCount": 0
    },
    {
      "key": "asia3",
      "name": "Asia",
      "regionId": 3,
      "endpoint": "asia3.runeevolution.com",
      "status": "offline",
      "playerCount": 0,
      "rewardItemAmount": 0,
      "rewardWinnerAmount": 0,
      "version": "1.6.0",
      "gameMode": "Orb Master",
      "roundId": 21982,
      "roundStartedAt": 1636933444,
      "roundStartedDate": "Mon Aug 30 2021 20:19:05 GMT+0000 (Coordinated Universal Time)",
      "timeLeft": 149,
      "timeLeftFancy": "2:44",
      "timeLeftText": "2:29",
      "speculatorCount": 0
    },
    {
      "key": "asia4",
      "name": "Asia",
      "regionId": 4,
      "endpoint": "asia4.runeevolution.com",
      "status": "offline",
      "playerCount": 0,
      "rewardItemAmount": 0,
      "rewardWinnerAmount": 0,
      "version": "1.6.3",
      "gameMode": "Fast Drake",
      "roundId": 19220,
      "roundStartedAt": 1636878411,
      "roundStartedDate": "Mon Aug 30 2021 20:17:47 GMT+0000 (Coordinated Universal Time)",
      "timeLeft": 182,
      "timeLeftFancy": "1:25",
      "timeLeftText": "3:02",
      "speculatorCount": 0
    }
  ]

  for (const server of evolutionServers) {
    log('Server', server.key)

    try {
      const playerRewards = jetpack.read(path.resolve(`./db/evolution/${server.key}/playerRewards.json`), 'json') || {}

      for (const address of Object.keys(playerRewards)) {
        if (userCache[address.toLowerCase()]) continue

        const user = await app.db.loadUser(address)

        userCache[address.toLowerCase()] = user

        user.rewardHistory = user.rewardHistory.filter(r => !!r.timestamp)

        for (const runeKey of Object.keys(user.lifetimeRewards.runes)) {
          const runeAmount = user.lifetimeRewards.runes[runeKey]


          if (user.address == '0xe2948dA8c5638B75C56ab4198f49C385E5aB34D5') {
            console.log(user)
            console.log(user.rewardHistory.filter(r => r.rune === runeKey).reduce((sum, r) => sum + r.value, 0))
          }

          user.rewards.runes[runeKey] = runeAmount - user.rewardHistory.filter(r => r.rune === runeKey).reduce((sum, r) => sum + r.value, 0)

          if (user.rewards.runes[runeKey] < 0.000000001) {
            user.rewards.runes[runeKey] = 0
          }

          user.rewards.items = user.lifetimeRewards.items
        }

        app.db.saveUser(user)
      }
    } catch(e) {
      log('Error', e)
    }
  }

  console.log('Done')
}

// export async function convertRewards(app) {
//   log('Convert rewards')

//   const userCache = {}

//   const evolutionServers = [
//     {
//       "key": "oceanic1",
//       "name": "Oceanic",
//       "regionId": 1,
//       "endpoint": "oceanic1.runeevolution.com",
//       "status": "offline",
//       "playerCount": 0,
//       "rewardItemAmount": 0,
//       "rewardWinnerAmount": 0,
//       "version": "1.6.3",
//       "gameMode": "Mix Game 1",
//       "roundId": 41691,
//       "roundStartedAt": 1644146543,
//       "roundStartedDate": "Mon Aug 30 2021 20:18:35 GMT+0000 (Coordinated Universal Time)",
//       "timeLeft": 286,
//       "timeLeftFancy": "2:13",
//       "timeLeftText": "4:46",
//       "speculatorCount": 0
//     },
//     {
//       "key": "europe1",
//       "name": "Europe",
//       "regionId": 1,
//       "endpoint": "europe1.runeevolution.com",
//       "status": "offline",
//       "version": "1.6.3",
//       "rewardItemAmount": 0,
//       "rewardWinnerAmount": 0,
//       "playerCount": 0,
//       "gameMode": "Sprite Leader",
//       "roundId": 39824,
//       "roundStartedAt": 1644146527,
//       "roundStartedDate": "Mon Aug 30 2021 20:19:08 GMT+0000 (Coordinated Universal Time)",
//       "timeLeft": 275,
//       "timeLeftFancy": "2:49",
//       "timeLeftText": "4:35",
//       "speculatorCount": 0
//     },
//     {
//       "key": "europe2",
//       "name": "Europe",
//       "regionId": 2,
//       "endpoint": "europe2.runeevolution.com",
//       "status": "offline",
//       "version": "1.6.3",
//       "rewardItemAmount": 0,
//       "rewardWinnerAmount": 0,
//       "playerCount": 0,
//       "gameMode": "Sticky Mode",
//       "roundId": 20870,
//       "roundStartedAt": 1637351412,
//       "roundStartedDate": "Mon Aug 30 2021 20:19:08 GMT+0000 (Coordinated Universal Time)",
//       "timeLeft": 47,
//       "timeLeftFancy": "2:49",
//       "timeLeftText": "0:47",
//       "speculatorCount": 0
//     },
//     {
//       "key": "europe3",
//       "name": "Europe",
//       "regionId": 3,
//       "endpoint": "europe3.runeevolution.com",
//       "status": "online",
//       "version": "1.6.3",
//       "rewardItemAmount": 0.006,
//       "rewardWinnerAmount": 0.021,
//       "playerCount": 3,
//       "gameMode": "Sprite Leader",
//       "roundId": 39824,
//       "roundStartedAt": 1644146527,
//       "roundStartedDate": "Mon Aug 30 2021 20:19:08 GMT+0000 (Coordinated Universal Time)",
//       "timeLeft": 275,
//       "timeLeftFancy": "2:49",
//       "timeLeftText": "4:35"
//     },
//     {
//       "key": "na1",
//       "name": "North America",
//       "regionId": 1,
//       "endpoint": "na1.runeevolution.com",
//       "status": "offline",
//       "playerCount": 0,
//       "rewardItemAmount": 0,
//       "rewardWinnerAmount": 0,
//       "version": "1.6.3",
//       "gameMode": "Leadercap",
//       "roundId": 45684,
//       "roundStartedAt": 1644146371,
//       "roundStartedDate": "Mon Aug 30 2021 20:20:06 GMT+0000 (Coordinated Universal Time)",
//       "timeLeft": 118,
//       "timeLeftFancy": "3:47",
//       "timeLeftText": "1:58",
//       "speculatorCount": 0
//     },
//     {
//       "key": "sa1",
//       "name": "South America",
//       "regionId": 1,
//       "endpoint": "sa1.runeevolution.com",
//       "status": "offline",
//       "playerCount": 0,
//       "rewardItemAmount": 0,
//       "rewardWinnerAmount": 0,
//       "version": "1.6.3",
//       "gameMode": "Lets Be Friends",
//       "roundId": 41057,
//       "roundStartedAt": 1644146323,
//       "roundStartedDate": "Mon Aug 30 2021 20:17:58 GMT+0000 (Coordinated Universal Time)",
//       "timeLeft": 70,
//       "timeLeftFancy": "1:39",
//       "timeLeftText": "1:10",
//       "speculatorCount": 0
//     },
//     {
//       "key": "sa2",
//       "name": "South America",
//       "regionId": 2,
//       "endpoint": "sa2.runeevolution.com",
//       "status": "offline",
//       "playerCount": 0,
//       "rewardItemAmount": 0,
//       "rewardWinnerAmount": 0,
//       "version": "1.6.0",
//       "gameMode": "Standard",
//       "roundId": 31127,
//       "roundStartedAt": 1639661096,
//       "roundStartedDate": "Mon Aug 30 2021 20:20:29 GMT+0000 (Coordinated Universal Time)",
//       "timeLeft": 39,
//       "timeLeftFancy": "4:09",
//       "timeLeftText": "0:39",
//       "speculatorCount": 0
//     },
//     {
//       "key": "sa3",
//       "name": "South America",
//       "regionId": 3,
//       "endpoint": "sa3.runeevolution.com",
//       "status": "offline",
//       "playerCount": 0,
//       "rewardItemAmount": 0,
//       "rewardWinnerAmount": 0,
//       "version": "1.6.3",
//       "gameMode": "Mix Game 2",
//       "roundId": 19136,
//       "roundStartedAt": 1636618815,
//       "roundStartedDate": "Mon Aug 30 2021 20:20:29 GMT+0000 (Coordinated Universal Time)",
//       "timeLeft": 85,
//       "timeLeftFancy": "4:09",
//       "timeLeftText": "1:25",
//       "speculatorCount": 0
//     },
//     {
//       "key": "sa4",
//       "name": "South America",
//       "regionId": 4,
//       "endpoint": "sa4.runeevolution.com",
//       "status": "offline",
//       "playerCount": 0,
//       "rewardItemAmount": 0,
//       "rewardWinnerAmount": 0,
//       "version": "1.6.3",
//       "gameMode": "Sprite Leader",
//       "roundId": 26876,
//       "roundStartedAt": 1639130586,
//       "roundStartedDate": "Mon Aug 30 2021 20:20:29 GMT+0000 (Coordinated Universal Time)",
//       "timeLeft": 90,
//       "timeLeftFancy": "4:09",
//       "timeLeftText": "1:30",
//       "speculatorCount": 0
//     },
//     {
//       "key": "sa5",
//       "name": "South America",
//       "regionId": 5,
//       "endpoint": "sa5.runeevolution.com",
//       "status": "offline",
//       "playerCount": 0,
//       "rewardItemAmount": 0,
//       "rewardWinnerAmount": 0,
//       "version": "1.6.3",
//       "gameMode": "Leadercap",
//       "roundId": 19408,
//       "roundStartedAt": 1636878670,
//       "roundStartedDate": "Mon Aug 30 2021 20:20:29 GMT+0000 (Coordinated Universal Time)",
//       "timeLeft": 255,
//       "timeLeftFancy": "4:09",
//       "timeLeftText": "4:15",
//       "speculatorCount": 0
//     },
//     {
//       "key": "asia1",
//       "name": "Asia",
//       "regionId": 1,
//       "endpoint": "asia1.runeevolution.com",
//       "status": "offline",
//       "playerCount": 0,
//       "rewardItemAmount": 0,
//       "rewardWinnerAmount": 0,
//       "version": "1.6.3",
//       "gameMode": "Mix Game 1",
//       "roundId": 43042,
//       "roundStartedAt": 1644146338,
//       "roundStartedDate": "Mon Aug 30 2021 20:19:55 GMT+0000 (Coordinated Universal Time)",
//       "timeLeft": 84,
//       "timeLeftFancy": "3:35",
//       "timeLeftText": "1:24",
//       "speculatorCount": 0
//     },
//     {
//       "key": "asia2",
//       "name": "Asia",
//       "regionId": 2,
//       "endpoint": "asia2.runeevolution.com",
//       "status": "offline",
//       "playerCount": 0,
//       "rewardItemAmount": 0,
//       "rewardWinnerAmount": 0,
//       "version": "1.6.3",
//       "gameMode": "Marco Polo",
//       "roundId": 36899,
//       "roundStartedAt": 1642978339,
//       "roundStartedDate": "Mon Aug 30 2021 20:16:48 GMT+0000 (Coordinated Universal Time)",
//       "timeLeft": 44,
//       "timeLeftFancy": "0:27",
//       "timeLeftText": "0:44",
//       "speculatorCount": 0
//     },
//     {
//       "key": "asia3",
//       "name": "Asia",
//       "regionId": 3,
//       "endpoint": "asia3.runeevolution.com",
//       "status": "offline",
//       "playerCount": 0,
//       "rewardItemAmount": 0,
//       "rewardWinnerAmount": 0,
//       "version": "1.6.0",
//       "gameMode": "Orb Master",
//       "roundId": 21982,
//       "roundStartedAt": 1636933444,
//       "roundStartedDate": "Mon Aug 30 2021 20:19:05 GMT+0000 (Coordinated Universal Time)",
//       "timeLeft": 149,
//       "timeLeftFancy": "2:44",
//       "timeLeftText": "2:29",
//       "speculatorCount": 0
//     },
//     {
//       "key": "asia4",
//       "name": "Asia",
//       "regionId": 4,
//       "endpoint": "asia4.runeevolution.com",
//       "status": "offline",
//       "playerCount": 0,
//       "rewardItemAmount": 0,
//       "rewardWinnerAmount": 0,
//       "version": "1.6.3",
//       "gameMode": "Fast Drake",
//       "roundId": 19220,
//       "roundStartedAt": 1636878411,
//       "roundStartedDate": "Mon Aug 30 2021 20:17:47 GMT+0000 (Coordinated Universal Time)",
//       "timeLeft": 182,
//       "timeLeftFancy": "1:25",
//       "timeLeftText": "3:02",
//       "speculatorCount": 0
//     }
//   ]

//   // Iterate every realm playerRewards
//   // Combine into the user.evolution.rewards object
//   for (const server of evolutionServers) {
//     log('Server', server.key)

//     try {
//       const playerRewards = jetpack.read(path.resolve(`./db/evolution/${server.key}/playerRewards.json`), 'json') || {}

//       for (const address of Object.keys(playerRewards)) {
//         const user = userCache[address.toLowerCase()] || app.db.loadUser(address)
//         if (address === '0x124e75Ae14A4311BB434Dec465953e84BbF3aB35') {
//           console.log(111, address, user)
//         }
//         const rewards = playerRewards[address]

//         if (!userCache[address.toLowerCase()]) {
//           user.lifetimeRewards = {
//             runes: {},
//             items: {}
//           }

//           userCache[address.toLowerCase()] = user
//         }

//         for (const key of Object.keys(rewards.pending)) {
//           if (!user.lifetimeRewards.runes[key]) user.lifetimeRewards.runes[key] = 0

//           user.lifetimeRewards.runes[key] += rewards.pending[key]
//         }

//         for (const index in rewards.pendingItems) {
//           const item = rewards.pendingItems[index]
//           user.lifetimeRewards.items[item.id] = {
//             name: item.name,
//             rarity: item.rarity,
//             quantity: item.quantity
//           }
//         }

//         if (address === '0x124e75Ae14A4311BB434Dec465953e84BbF3aB35') {
//           console.log(222, address, rewards, user)
//         }
//         if (Object.keys(user.lifetimeRewards.items).length > 0) {
//           console.log(address)
//         }

//         app.db.saveUser(user)
//       }

//       console.log('Done')
//     } catch(e) {
//       log('Error', e)
//     }
//   }
// }