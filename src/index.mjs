import * as dotenv from 'dotenv'

dotenv.config()

process.env.REACT_APP_PUBLIC_URL = "https://rune.farm/"

import { itemData, ItemTypeToText, ItemSlotToText, RuneNames, ItemAttributesById, ItemAttributes, SkillNames, ClassNames, ItemRarity } from './data/items.mjs'
import { ItemsMainCategoriesType } from './data/items.type.mjs'
import contracts from "./contracts.mjs"
import secrets from "../secrets.json"
import ethers from 'ethers'
import Web3 from "web3"
import BigNumber from "bignumber.js"
import fetch from "node-fetch"
import path from 'path'
import networks from "./networks.mjs"
import jetpack from 'fs-jetpack'
import ipfsClient, { CID } from 'ipfs-http-client'
import HDWalletProvider from "@truffle/hdwallet-provider"
import { wait, round, removeDupes, toLong, toShort, getAddress, updateGit } from './util.mjs'
import farmsData, { MAINNET, TESTNET } from './farms.mjs'
import ArcaneRaidV1 from '../contracts/ArcaneRaidV1.json'
import ArcaneTraderV1 from '../contracts/ArcaneTraderV1.json'
import ArcaneCharacters from '../contracts/ArcaneCharacters.json'
import ArcaneCharacterFactoryV3 from '../contracts/ArcaneCharacterFactoryV3.json'
import ArcaneBarracksFacetV1 from '../contracts/ArcaneBarracksFacetV1.json'
import ArcaneProfile from '../contracts/ArcaneProfile.json'
import ArcaneItems from '../contracts/ArcaneItems.json'
import BEP20Contract from '../contracts/BEP20.json'
import { QuoteToken } from "./farms.mjs"
import { decodeItem } from "./util/decodeItem.mjs"
import { achievementData } from './data/achievements.mjs'
// import * as Bridge from "./bridge.mjs"

const config = jetpack.read(path.resolve('./db/config.json'), 'json')
const app = jetpack.read(path.resolve('./db/app.json'), 'json')
const trades = removeDupes(jetpack.read(path.resolve('./db/trades.json'), 'json'))
const farms = jetpack.read(path.resolve('./db/farms.json'), 'json')
const runes = jetpack.read(path.resolve('./db/runes.json'), 'json')
const stats = jetpack.read(path.resolve('./db/stats.json'), 'json')
const historical = jetpack.read(path.resolve('./db/historical.json'), 'json')
const barracksEvents = jetpack.read(path.resolve('./db/barracks/events.json'), 'json')
const blacksmithEvents = jetpack.read(path.resolve('./db/blacksmith/events.json'), 'json')
const raidEvents = jetpack.read(path.resolve('./db/raid/events.json'), 'json')
const guildsEvents = jetpack.read(path.resolve('./db/guilds/events.json'), 'json')
const itemsEvents = jetpack.read(path.resolve('./db/items/events.json'), 'json')
const charactersEvents = jetpack.read(path.resolve('./db/characters/events.json'), 'json')
const usersEvents = jetpack.read(path.resolve('./db/users/events.json'), 'json')
const tradesEvents = jetpack.read(path.resolve('./db/trades/events.json'), 'json')
const evolutionLeaderboardHistory = jetpack.read(path.resolve('./db/evolution/leaderboardHistory.json'), 'json')
const evolutionRewardHistory = jetpack.read(path.resolve('./db/evolution/rewardHistory.json'), 'json')
const evolutionRewards = jetpack.read(path.resolve('./db/evolution/rewards.json'), 'json')
const evolutionHistorical = jetpack.read(path.resolve('./db/evolution/historical.json'), 'json')
const evolutionServers = jetpack.read(path.resolve('./db/evolution/servers.json'), 'json')

config.trades.updating = false
config.barracks.updating = false
config.blacksmith.updating = false
config.items.updating = false
config.characters.updating = false
config.test.updating = false

const fetchPrice = async (id, vs = 'usd') => {
  const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${vs}`)

  return parseFloat((await response.json())[id][vs])
}
const fetchPrices = async () => {
  // const response = await fetch('https://api.coingecko.com/api/v3/coins/list')
  // prices = (await response.json())
}

const getRandomProvider = () => {
  return new HDWalletProvider(
    secrets.mnemonic,
    "wss://thrumming-still-leaf.bsc.quiknode.pro/b2f8a5b1bd0809dbf061112e1786b4a8e53c9a83/" //"https://bsc.getblock.io/mainnet/?api_key=3f594a5f-d0ed-48ca-b0e7-a57d04f76332" //networks[Math.floor(Math.random() * networks.length)]
  )
}

const blocknativeApiKey = '58a45321-bf96-485c-ab9b-e0610e181d26'

let provider = getRandomProvider()
const web3 = new Web3(provider)

const web3Provider = new ethers.providers.Web3Provider(getRandomProvider())
web3Provider.pollingInterval = 15000

const signer = web3Provider.getSigner()

const arcaneItemsContract = new ethers.Contract(getAddress(contracts.items), ArcaneItems.abi, signer)
const arcaneCharactersContract = new ethers.Contract(getAddress(contracts.characters), ArcaneCharacters.abi, signer)
const arcaneBarracksContract = new ethers.Contract(getAddress(contracts.barracks), ArcaneBarracksFacetV1.abi, signer)
const arcaneTraderContract = new ethers.Contract(getAddress(contracts.trader), ArcaneTraderV1.abi, signer)
const arcaneCharacterFactoryContract = new ethers.Contract(getAddress(contracts.characterFactory), ArcaneCharacterFactoryV3.abi, signer)
const arcaneProfileContract = new ethers.Contract(getAddress(contracts.profile), ArcaneProfile.abi, signer)
const busdContract = new ethers.Contract(getAddress(contracts.busd), BEP20Contract.abi, signer)
const wbnbContract = new ethers.Contract(getAddress(contracts.wbnb), BEP20Contract.abi, signer)

process
  .on("unhandledRejection", (reason, p) => {
    console.warn(reason, "Unhandled Rejection at Promise", p)
  })
  .on("uncaughtException", (err) => {
    console.warn(err, "Uncaught Exception thrown.")

    //provider = getRandomProvider()
    // run()
    setTimeout(() => {
      process.exit(1)
    }, 60 * 1000)
  })

const average = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length

async function iterateBlocks(name, address, fromBlock, toBlock, event, processLog, updateConfig) {
  if (!toBlock) return
  if (fromBlock === toBlock) return

  // event List(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Update(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Delist(address indexed seller, uint256 tokenId);
  // event Buy(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Recover(address indexed user, address indexed seller, uint256 tokenId);

  try {
    const toBlock2 = (fromBlock + 5000) < toBlock ? fromBlock + 5000 : toBlock

    const filter = {
      address,
      fromBlock,
      toBlock: toBlock2,
      topics: event.topics
    }

    console.log(name, 'Iterating block', fromBlock, 'to', toBlock2, 'eventually', toBlock, 'for', event.topics)

    const logs = await web3Provider.getLogs(filter)

    for(let i = 0; i < logs.length; i++) {
      processLog(logs[i], false)
    }

    // await wait(3 * 1000)
    
    if (updateConfig && toBlock2 > 0) {
      updateConfig(toBlock2)
    }

    await iterateBlocks(name, address, toBlock2, toBlock, event, processLog, updateConfig)
  } catch(e) {
    console.log('error', e)
    console.log(fromBlock, toBlock)
    process.exit(1)
  }
}
  
const saveConfig = () => {
  jetpack.write(path.resolve('./db/config.json'), JSON.stringify(config, null, 2))
}

const saveTrades = () => {
  jetpack.write(path.resolve('./db/trades.json'), JSON.stringify(trades, null, 2))
}

const saveTradesEvents = () => {
  jetpack.write(path.resolve('./db/trades/events.json'), JSON.stringify(tradesEvents, null, 2))
}

const saveBarracksEvents = () => {
  jetpack.write(path.resolve('./db/barracks/events.json'), JSON.stringify(barracksEvents, null, 2))
}

const saveCharactersEvents = () => {
  jetpack.write(path.resolve('./db/characters/events.json'), JSON.stringify(charactersEvents, null, 2))
}

const saveItemsEvents = () => {
  jetpack.write(path.resolve('./db/items/events.json'), JSON.stringify(itemsEvents, null, 2))
}

const saveFarms = () => {
  jetpack.write(path.resolve('./db/farms.json'), JSON.stringify(farms, null, 2))
}

const saveRunes = () => {
  jetpack.write(path.resolve('./db/runes.json'), JSON.stringify(runes, null, 2))
}

const saveStats = () => {
  jetpack.write(path.resolve('./db/stats.json'), JSON.stringify(stats, null, 2))
}

const saveHistorical = () => {
  jetpack.write(path.resolve('./db/historical.json'), JSON.stringify(historical, null, 2))
}

const saveApp = () => {
  jetpack.write(path.resolve('./db/app.json'), JSON.stringify(app, null, 2))
}

const updateLeaderboardByUser = (user) => {
  const leaderboard = {
    mostInventoryItems: {
      value: 0,
      address: null
    },
    mostMarketItemsListed: {
      value: 0,
      address: null
    },
    mostMarketItemsSold: {
      value: 0,
      address: null
    },
    mostItemsTransferred: {
      value: 0,
      address: null
    },
    mostItemsCrafted: {
      value: 0,
      address: null
    },
    mostCharactersCreated: {
      value: 0,
      address: null
    },
    mostItemsCraftedByItemId: {
      1: {
        value: 0,
        address: null
      }
    },
    mostPerfectItemsAttained: {
      value: 0,
      address: null
    },
    mostPerfectItemsCrafted: {
      value: 0,
      address: null
    },
    highestAveragePefectionScore: {
      value: 0,
      address: null
    },
    top10Crafters: {
      since: 1622310971556,
      list: []
    },
    top10CraftersByItemId: {
      since: 1622310971556,
      list: []
    },
    ...(jetpack.read(path.resolve(`./db/leaderboard.json`), 'json') || {})
  }

  if (user.inventoryItemCount > leaderboard.mostInventoryItems.value) {
    leaderboard.mostInventoryItems.value = user.inventoryItemCount
    leaderboard.mostInventoryItems.address = user.address
  }

  if (user.marketTradeListedCount > leaderboard.mostMarketItemsListed.value) {
    leaderboard.mostMarketItemsListed.value = user.marketTradeListedCount
    leaderboard.mostMarketItemsListed.address = user.address
  }

  if (user.marketTradeSoldCount > leaderboard.mostMarketItemsSold.value) {
    leaderboard.mostMarketItemsSold.value = user.marketTradeSoldCount
    leaderboard.mostMarketItemsSold.address = user.address
  }

  if (user.transferredOutCount > leaderboard.mostItemsTransferred.value && user.address !== '0x85C07b6a475Ee19218D0ef9C278C7e58715Af842') {
    leaderboard.mostItemsTransferred.value = user.transferredOutCount
    leaderboard.mostItemsTransferred.address = user.address
  }

  jetpack.write(path.resolve(`./db/leaderboard.json`), JSON.stringify(leaderboard, null, 2))
}

const loadCharacter = (characterId) => {
  return {
    id: characterId,
    ownersCount: 0,
    ...(jetpack.read(path.resolve(`./db/characters/${characterId}/overview.json`), 'json') || {}),
    owners: (jetpack.read(path.resolve(`./db/characters/${characterId}/owners.json`), 'json') || []),
  }
}

const saveCharacter = (character) => {
  jetpack.write(path.resolve(`./db/characters/${character.id}/overview.json`), JSON.stringify({
    ...character,
    owners: undefined,
    ownersCount: character.owners.length,
  }, null, 2))

  jetpack.write(path.resolve(`./db/characters/${character.id}/owners.json`), JSON.stringify(character.owners, null, 2))
}

const saveCharacterOwner = (character, characterData) => {
  if (!character.owners.find(o => o === characterData.owner)) {
    character.owners.push(characterData.owner)
    character.owners = character.owners.filter(o => o != characterData.from)
  }
  
  saveCharacter(character)
}

const loadItem = (itemId) => {
  return {
    id: itemId,
    perfectCount: 0,
    ownersCount: 0,
    marketTradesListedCount: 0,
    marketTradesSoldCount: 0,
    ...(jetpack.read(path.resolve(`./db/items/${itemId}/overview.json`), 'json') || {}),
    owners: (jetpack.read(path.resolve(`./db/items/${itemId}/owners.json`), 'json') || []),
    market: (jetpack.read(path.resolve(`./db/items/${itemId}/market.json`), 'json') || []),
    tokens: (jetpack.read(path.resolve(`./db/items/${itemId}/tokens.json`), 'json') || [])
  }
}

const saveItem = (item) => {
  jetpack.write(path.resolve(`./db/items/${item.id}/overview.json`), JSON.stringify({
    ...item,
    owners: undefined,
    market: undefined,
    tokens: undefined,
    perfectCount: item.tokens.filter(i => i.item.perfection === 1).length,
    ownersCount: item.owners.length,
    marketTradesPerfectCount: item.market.filter(i => i.item.perfection === 1).length,
    marketTradesListedCount: item.market.filter(i => i.status === 'listed').length,
    marketTradesSoldCount: item.market.filter(i => i.status === 'sold').length
  }, null, 2))

  jetpack.write(path.resolve(`./db/items/${item.id}/owners.json`), JSON.stringify(item.owners, null, 2))
  jetpack.write(path.resolve(`./db/items/${item.id}/market.json`), JSON.stringify(item.market, null, 2))
  jetpack.write(path.resolve(`./db/items/${item.id}/tokens.json`), JSON.stringify(item.tokens, null, 2))
}

const saveItemOwner = async (item, itemData) => {
  if (!item.owners.find(o => o === itemData.owner)) {
    item.owners.push(itemData.owner)
    item.owners = item.owners.filter(o => o != itemData.from)
  }

  if (!stats.items[item.id]) stats.items[item.id] = {}

  stats.items[item.id].total = (await arcaneItemsContract.itemCount(item.id)).toNumber()
  stats.items[item.id].burned = 0 //(await arcaneItemsContract.itemBurnCount(item.id)).toNumber()
  
  saveItem(item)
}

const saveItemTrade = (item, trade) => {
  const found = item.market.find(i => i.seller === trade.seller && i.buyer === trade.buyer && i.tokenId === trade.tokenId)

  if (found) {
    for (const key of Object.keys(trade)) {
      found[key] = trade[key]
    }
  } else {
    item.market.push(trade)
  }

  saveItem(item)
}

const saveItemToken = (item, token) => {
  const found = item.tokens.find(i => i.id === token.id)

  if (found) {
    for (const key of Object.keys(token)) {
      found[key] = token[key]
    }
  } else {
    item.tokens.push(token)
  }

  saveItem(item)
}

const loadToken = (tokenId) => {
  return {
    id: tokenId,
    ownersCount: 0,
    marketTradesListedCount: 0,
    marketTradesSoldCount: 0,
    ...(jetpack.read(path.resolve(`./db/tokens/${tokenId}/overview.json`), 'json') || {}),
    transfers: (jetpack.read(path.resolve(`./db/tokens/${tokenId}/transfers.json`), 'json') || []),
    trades: (jetpack.read(path.resolve(`./db/tokens/${tokenId}/trades.json`), 'json') || [])
  }
}

const saveToken = (token) => {
  jetpack.write(path.resolve(`./db/tokens/${token.id}/overview.json`), JSON.stringify({
    ...token,
    transfers: undefined,
    trades: undefined
  }, null, 2))

  jetpack.write(path.resolve(`./db/tokens/${token.id}/transfers.json`), JSON.stringify(token.transfers, null, 2))
  jetpack.write(path.resolve(`./db/tokens/${token.id}/trades.json`), JSON.stringify(token.trades, null, 2))
}

const saveTokenTrade = (token, trade) => {
  const found = token.trades.find(i => i.seller === trade.seller && i.buyer === trade.buyer && i.tokenId === trade.tokenId)

  if (found) {
    for (const key of Object.keys(trade)) {
      found[key] = trade[key]
    }
  } else {
    token.trades.push(trade)
  }

  saveToken(token)
}

const saveTokenTransfer = (token, itemData) => {
  const found = token.transfers.find(i => i.owner === itemData.owner && i.tokenId === itemData.tokenId)

  if (found) {
    for (const key of Object.keys(itemData)) {
      found[key] = itemData[key]
    }
  } else {
    token.transfers.push(itemData)
  }

  saveToken(token)
}

const loadUser = (address) => {
  return {
    address,
    inventoryItemCount: 0,
    equippedItemCount: 0,
    marketTradeListedCount: 0,
    marketTradeSoldCount: 0,
    transferredOutCount: 0,
    holdings: {},
    points: 0,
    ...(jetpack.read(path.resolve(`./db/users/${address}/overview.json`), 'json') || {}),
    achievements: (jetpack.read(path.resolve(`./db/users/${address}/achievements.json`), 'json') || []),
    characters: (jetpack.read(path.resolve(`./db/users/${address}/characters.json`), 'json') || []),
    inventory: {
      items: [],
      ...(jetpack.read(path.resolve(`./db/users/${address}/inventory.json`), 'json') || {})
    },
    market: {
      trades: [],
      ...(jetpack.read(path.resolve(`./db/users/${address}/market.json`), 'json') || {})
    }
  }
}

const updateAchievementsByUser = (user) => {
  if (!hasUserAchievement(user, 'CRAFT_1') && user.craftedItemCount >= 1) {
    addUserAchievement(user, 'CRAFT_1')
  }
  if (!hasUserAchievement(user, 'CRAFT_10') && user.craftedItemCount >= 10) {
    addUserAchievement(user, 'CRAFT_10')
  }
  if (!hasUserAchievement(user, 'CRAFT_100') && user.craftedItemCount >= 100) {
    addUserAchievement(user, 'CRAFT_100')
  }
  if (!hasUserAchievement(user, 'CRAFT_1000') && user.craftedItemCount >= 1000) {
    addUserAchievement(user, 'CRAFT_1000')
  }
  if (!hasUserAchievement(user, 'ACQUIRED_RUNE') && user.holdings?.rune >= 1) {
    addUserAchievement(user, 'ACQUIRED_RUNE')
  }
  if (!hasUserAchievement(user, 'BATTLE_RUNE_EVO')) {
    const complete = evolutionLeaderboardHistory.filter(l => l.filter(l2 => l2.address === user.address).length > 0).length > 0
    if (complete) addUserAchievement(user, 'BATTLE_RUNE_EVO')
  }
  if (!hasUserAchievement(user, 'MEGA_RUNE_EVO')) {
    const groupedRoundPlayers = groupBySub(evolutionLeaderboardHistory.map((leaderboard) => {
      let winner = leaderboard[0]

      for (const p of leaderboard) {
        if (p.points > winner.points) {
          winner = p
        }
      }
      return { winner }
    }).filter(p => !!p.winner && p.winner.joinedAt >= 1625322027), 'winner', 'address')

    const complete = groupedRoundPlayers[user.address]?.reduce((total, p) => total + p.winner.kills, 0) >= 100

    if (complete) addUserAchievement(user, 'MEGA_RUNE_EVO')
  }
  if (!hasUserAchievement(user, 'DOMINATE_RUNE_EVO')) {
    let winStreak = 0
    let totalStreak = 0

    for (const round of evolutionLeaderboardHistory) {
      if (round.length > 0 && round.sort(((a, b) => b.winner?.kills - a.winner?.kills))[0].address === user.address) {
        winStreak++
        
        if (winStreak > totalStreak) totalStreak = winStreak
      } else {
        winStreak = 0
      }
    }

    const complete = totalStreak >= 25
    if (complete) addUserAchievement(user, 'DOMINATE_RUNE_EVO')
  }
}

const updatePointsByUser = (user) => {
  const achievements = user.achievements.map(a => achievementData.find(b => b.id === a))

  user.points = 0

  for(const achievement of achievements) {
    user.points += achievement.points
  }
}

const saveUser = (user) => {
  // console.log('Save user', user.address)

  updatePointsByUser(user)

  jetpack.write(path.resolve(`./db/users/${user.address}/overview.json`), JSON.stringify({
    ...user,
    inventory: undefined,
    market: undefined,
    characters: undefined,
    achievements: undefined,
    craftedItemCount: user.inventory.items.filter(i => i.status === 'created').length,
    inventoryItemCount: user.inventory.items.filter(i => i.status === 'unequipped').length,
    equippedItemCount: user.inventory.items.filter(i => i.status === 'equipped').length,
    transferredOutCount: user.inventory.items.filter(i => i.status === 'transferred_out').length,
    transferredInCount: user.inventory.items.filter(i => i.status === 'transferred_in').length
  }, null, 2))

  updateLeaderboardByUser(user)
  updateAchievementsByUser(user)

  jetpack.write(path.resolve(`./db/users/${user.address}/achievements.json`), JSON.stringify(user.achievements, null, 2))
  jetpack.write(path.resolve(`./db/users/${user.address}/characters.json`), JSON.stringify(user.characters, null, 2))
  jetpack.write(path.resolve(`./db/users/${user.address}/inventory.json`), JSON.stringify(user.inventory, null, 2))
  jetpack.write(path.resolve(`./db/users/${user.address}/market.json`), JSON.stringify(user.market, null, 2))
}

const saveUserItem = (user, item) => {
  const savedItem = user.inventory.items.find(i => i.tokenId === item.tokenId)

  if (savedItem) {
    for (const key of Object.keys(item)) {
      savedItem[key] = item[key]
    }
  } else {
    user.inventory.items.push(item)
  }

  saveUser(user)
}

const saveUserCharacter = (user, character) => {
  const savedItem = user.characters.find(i => i.tokenId === character.tokenId)

  if (savedItem) {
    for (const key of Object.keys(character)) {
      savedItem[key] = character[key]
    }
  } else {
    user.characters.push(character)
  }

  saveUser(user)
}

const saveUserTrade = (user, trade) => {
  const marketTrade = user.market.trades.find(i => i.tokenId === trade.tokenId)

  if (marketTrade) {
    for (const key of Object.keys(trade)) {
      marketTrade[key] = trade[key]
    }
  } else {
    user.market.trades.push(trade)
  }

  saveUser(user)
}

const hasUserAchievement = (user, achievementKey) => {
  const id = achievementData.find(i => i.key === achievementKey).id
  const achievement = user.achievements.find(i => i === id)

  return !!achievement
}

const addUserAchievement = (user, achievementKey) => {
  const id = achievementData.find(i => i.key === achievementKey).id
  const achievement = user.achievements.find(i => i === id)

  if (!achievement) {
    user.achievements.push(id)
  }

  // saveUser(user)
}

const groupBySub = function(xs, key, subkey) {
  return xs.reduce(function(rv, x) {
      if (!x[key][subkey]) return rv;
      (rv[x[key][subkey]] = rv[x[key][subkey]] || []).push(x);
      return rv;
  }, {}) || null;
};

const groupBy = function(xs, key) {
  return xs.reduce(function(rv, x) {
      if (!x[key]) return rv;
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
  }, {}) || null;
};

async function getAllBarracksEvents() {
  if (config.barracks.updating) return

  console.log('[Barracks] Updating')

  config.barracks.updating = true

  const iface = new ethers.utils.Interface(ArcaneBarracksFacetV1.abi)

  async function processLog(log, updateConfig = true) {
    const e = iface.parseLog(log)
    
    // console.log(e.name, e)

    if (e.name === 'Equip') {
      const { user: userAddress, tokenId, itemId } = e.args

      const user = loadUser(userAddress)

      const item = {
        status: "equipped",
        tokenId: tokenId.toString(),
        updatedAt: new Date().getTime(),
        id: decodeItem(tokenId.toString()).id
      }
      
      saveUserItem(user, item)
    }

    if (e.name === 'Unequip') {
      const { user: userAddress, tokenId, itemId } = e.args

      const user = loadUser(userAddress)

      const item = {
        status: "unequipped",
        tokenId: tokenId.toString(),
        itemId: itemId,
        updatedAt: new Date().getTime(),
        id: decodeItem(tokenId.toString()).id
        // ...decodeItem(tokenId.toString())
      }
      
      saveUserItem(user, item)
    }

    if (e.name === 'ActionBurn') {
      
    }

    if (e.name === 'ActionBonus') {
      
    }

    if (e.name === 'ActionHiddenPool') {
      
    }

    if (e.name === 'ActionFee') {
      
    }

    if (e.name === 'ActionSwap') {
      
    }

    const e2 = barracksEvents.find(t => t.transactionHash === log.transactionHash)

    if (!e2) {
      barracksEvents.push({
        // id: ++config.barracks.counter,
        ...log,
        ...e
      })
    }
  
    saveBarracksEvents()

    // if (updateConfig && log.blockNumber > config.barracks.lastBlock) {
    //   config.barracks.lastBlock = log.blockNumber
    //   saveConfig()
    // }
  }

  const blockNumber = await web3.eth.getBlockNumber()

  const events = [
    'Equip(address,uint256,uint16)',
    'Unequip(address,uint256,uint16)',
    'ActionBurn(address,uint256)',
    'ActionBonus(address,uint256)',
    'ActionHiddenPool(address,uint256)',
    'ActionFee(address,address,uint256)',
    'ActionSwap(address,address,uint256)',
  ]
  
  for (const event of events) {
    await iterateBlocks(`Barracks Events: ${event}`, getAddress(contracts.barracks), config.barracks.lastBlock[event], blockNumber, arcaneBarracksContract.filters[event](), processLog, function (blockNumber) {
      config.barracks.lastBlock[event] = blockNumber
      saveConfig()
    })
  }

  console.log('Finished')

  saveBarracksEvents()
  saveConfig()
  await updateGit()

  config.barracks.updating = false
}

async function monitorBarracksEvents() {
  arcaneBarracksContract.on('Equip', async () => {
    await getAllBarracksEvents()
  })

  arcaneBarracksContract.on('Unequip', async () => {
    await getAllBarracksEvents()
  })

  arcaneBarracksContract.on('ActionBurn', async () => {
    await getAllBarracksEvents()
  })

  arcaneBarracksContract.on('ActionBonus', async () => {
    await getAllBarracksEvents()
  })

  arcaneBarracksContract.on('ActionHiddenPool', async () => {
    await getAllBarracksEvents()
  })

  arcaneBarracksContract.on('ActionFee', async () => {
    await getAllBarracksEvents()
  })

  arcaneBarracksContract.on('ActionSwap', async () => {
    await getAllBarracksEvents()
  })
}

async function getAllMarketEvents() {
  if (config.trades.updating) return

  console.log('[Market] Updating')

  config.trades.updating = true

  const iface = new ethers.utils.Interface(ArcaneTraderV1.abi);

  async function processLog(log, updateConfig = true) {
    const e = iface.parseLog(log)
    console.log(e.name, e.args.tokenId)
    if (e.name === 'List') {
      const { seller, buyer, tokenId, price } = e.args

      let trade = trades.find(t => t.seller.toLowerCase() === seller.toLowerCase() && t.tokenId === tokenId.toString())

      if (trade?.blockNumber >= log.blockNumber)
        return

      trade = {
        id: ++config.trades.counter
      }

      trades.push(trade)

      trade.seller = seller
      trade.buyer = buyer
      trade.tokenId = tokenId.toString()
      trade.price = toShort(price)
      trade.status = "available"
      trade.hotness = 0
      trade.createdAt = new Date().getTime()
      trade.updatedAt = new Date().getTime()
      trade.blockNumber = log.blockNumber
      trade.item = { id: decodeItem(tokenId.toString()).id }
      // trade.item = decodeItem(trade.tokenId)

      saveUserTrade(loadUser(seller), trade)
      saveTokenTrade(loadToken(trade.tokenId), trade)
      saveItemTrade(loadItem(trade.item.id), trade)
      saveItemToken(loadItem(trade.item.id), { id: trade.tokenId, item: trade.item })
      saveConfig()
      
      console.log('List', trade)
    }

    if (e.name === 'Update') {
      const { seller, buyer, tokenId, price } = e.args

      const trade = trades.find(t => t.seller.toLowerCase() === seller.toLowerCase() && t.tokenId === tokenId.toString())

      if (trade.blockNumber >= log.blockNumber)
        return

      trade.buyer = buyer
      trade.price = toShort(price)
      trade.updatedAt = new Date().getTime()
      trade.blockNumber = log.blockNumber
      trade.item = { id: decodeItem(tokenId.toString()).id }
      // trade.item = decodeItem(trade.tokenId)

      saveUserTrade(loadUser(seller), trade)
      saveTokenTrade(loadToken(trade.tokenId), trade)
      saveItemTrade(loadItem(trade.item.id), trade)
      saveItemToken(loadItem(trade.item.id), { id: trade.tokenId, item: trade.item })
      
      console.log('Update', trade)
    }

    if (e.name === 'Delist') {
      const { seller, buyer, tokenId, price } = e.args

      const trade = trades.find(t => t.seller.toLowerCase() === seller.toLowerCase() && t.tokenId === tokenId.toString())

      if (trade.blockNumber >= log.blockNumber)
        return
  
      trade.status = "delisted"
      trade.updatedAt = new Date().getTime()
      trade.blockNumber = log.blockNumber
      trade.item = { id: decodeItem(tokenId.toString()).id }
      // trade.item = decodeItem(trade.tokenId)

      saveUserTrade(loadUser(seller), trade)
      saveTokenTrade(loadToken(trade.tokenId), trade)
      saveItemTrade(loadItem(trade.item.id), trade)
      saveItemToken(loadItem(trade.item.id), { id: trade.tokenId, item: trade.item })
      
      console.log('Delist', trade)
    }

    if (e.name === 'Buy') {
      const { seller, buyer, tokenId, price } = e.args

      const trade = trades.find(t => t.seller.toLowerCase() === seller.toLowerCase() && t.tokenId === tokenId.toString())

      if (trade.blockNumber >= log.blockNumber)
        return

      trade.status = "sold"
      trade.buyer = buyer
      trade.updatedAt = new Date().getTime()
      trade.blockNumber = log.blockNumber
      trade.item = { id: decodeItem(tokenId.toString()).id }
      // trade.item = decodeItem(trade.tokenId)

      saveUserTrade(loadUser(seller), trade)
      saveUserTrade(loadUser(buyer), trade)
      saveTokenTrade(loadToken(trade.tokenId), trade)
      saveItemTrade(loadItem(trade.item.id), trade)
      saveItemToken(loadItem(trade.item.id), { id: trade.tokenId, item: trade.item })
      
      console.log('Buy', trade)
    }

    const e2 = tradesEvents.find(t => t.transactionHash === log.transactionHash)

    if (!e2) {
      tradesEvents.push({
        // id: ++config.trades.counter,
        ...log,
        ...e
      })
    }

    saveTrades()
    saveTradesEvents()

    // if (updateConfig) {
    //   config.trades.lastBlock = log.blockNumber
    //   saveConfig()
    // }
  }

  const blockNumber = await web3.eth.getBlockNumber()

  const events = [
    'List(address,address,uint256,uint256)',
    'Update(address,address,uint256,uint256)',
    'Delist(address,uint256)',
    'Buy(address,address,uint256,uint256)',
  ]
  
  for (const event of events) {
    await iterateBlocks(`Market Events: ${event}`, getAddress(contracts.trader), config.trades.lastBlock[event], blockNumber, arcaneTraderContract.filters[event](), processLog, function (blockNumber) {
      config.trades.lastBlock[event] = blockNumber
      saveConfig()
    })
  }

  console.log('Finished')

  saveTrades()
  saveConfig()
  await updateGit()

  config.trades.updating = false
  // setTimeout(getAllMarketEvents, 2 * 60 * 1000) // Manually update every 5 mins
}

async function monitorMarketEvents() {
  // event List(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Update(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Delist(address indexed seller, uint256 tokenId);
  // event Buy(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Recover(address indexed user, address indexed seller, uint256 tokenId);

  arcaneTraderContract.on('List', async () => {
    await getAllMarketEvents()
  })

  arcaneTraderContract.on('Update', async () => {
    await getAllMarketEvents()
  })

  arcaneTraderContract.on('Delist', async () => {
    await getAllMarketEvents()
  })

  arcaneTraderContract.on('Buy', async () => {
    await getAllMarketEvents()
  })
}

async function getAllCharacterEvents() {
  if (config.characters.updating) return

  console.log('[Characters] Updating')

  config.characters.updating = true

  const iface = new ethers.utils.Interface(ArcaneCharacters.abi)

  async function processLog(log, updateConfig = true) {
    const e = iface.parseLog(log)
    
    // console.log(e.name, e)

    if (e.name === 'Transfer') {
      const { from, to: userAddress, tokenId } = e.args

      const user = loadUser(userAddress)

      const characterData = {
        owner: userAddress,
        from,
        status: from === '0x0000000000000000000000000000000000000000' ? "created" : 'transferred_in',
        tokenId: tokenId.toString(),
        transferredAt: new Date().getTime(),
        id: await arcaneCharactersContract.getCharacterId(tokenId.toString())
      }

      saveUserCharacter(user, characterData)
      // saveTokenTransfer(loadToken(characterData.tokenId), characterData)

      if (from !== '0x0000000000000000000000000000000000000000') {
        saveUserCharacter(user, { ...characterData, status: 'transferred_out' })
      }

      saveCharacterOwner(loadCharacter(characterData.id), characterData)
    }

    const e2 = charactersEvents.find(t => t.transactionHash === log.transactionHash)

    if (!e2) {
      charactersEvents.push({
        id: ++config.characters.counter,
        ...log,
        ...e
      })
    }
  
    saveCharactersEvents()

    // if (updateConfig) {
    //   config.characters.lastBlock = log.blockNumber
    //   saveConfig()
    // }
  }

  const blockNumber = await web3.eth.getBlockNumber()

  const events = [
    'Transfer'
  ]
  
  for (const event of events) {
    await iterateBlocks(`Characters Events: ${event}`, getAddress(contracts.characters), config.characters.lastBlock[event], blockNumber, arcaneCharactersContract.filters[event](), processLog, function (blockNumber) {
      config.characters.lastBlock[event] = blockNumber
      saveConfig()
    })
  }
  console.log('Finished')

  saveCharactersEvents()
  saveConfig()
  await updateGit()

  config.characters.updating = false
}

async function monitorCharacterEvents() {
  const contract = new ethers.Contract(getAddress(contracts.characters), ArcaneCharacters.abi, signer)

  contract.on('Transfer', async (from, to, tokenId, log) => {
    await getAllCharacterEvents()
  })
}

async function getAllItemEvents() {
  if (config.items.updating) return

  console.log('[Items] Updating')

  config.items.updating = true

  const contract = new ethers.Contract(getAddress(contracts.items), ArcaneItems.abi, signer)
  const iface = new ethers.utils.Interface(ArcaneItems.abi)

  async function processLog(log, updateConfig = true) {
    const e = iface.parseLog(log)
    
    // console.log(e.name, e)

    if (e.name === 'Transfer') {
      const { from, to: userAddress, tokenId } = e.args

      const user = loadUser(userAddress)
      const decodedItem = decodeItem(tokenId.toString())

      const itemData = {
        owner: userAddress,
        from,
        status: from === '0x0000000000000000000000000000000000000000' ? "created" : 'transferred_in',
        tokenId: tokenId.toString(),
        createdAt: new Date().getTime(),
        id: decodedItem.id,
        perfection: decodedItem.perfection
      }

      const token = loadToken(itemData.tokenId)

      if (from === '0x0000000000000000000000000000000000000000') {
        token.owner = itemData.userAddress
        token.creator = itemData.userAddress
        token.createdAt = itemData.createdAt
      }

      saveUserItem(user, itemData)
      saveTokenTransfer(token, itemData)

      if (from !== '0x0000000000000000000000000000000000000000') {
        saveUserItem(user, { ...itemData, status: 'transferred_out' })
      }

      await saveItemOwner(loadItem(itemData.id), itemData)
    }

    const e2 = itemsEvents.find(t => t.transactionHash === log.transactionHash)

    if (!e2) {
      itemsEvents.push({
        // id: ++config.items.counter,
        ...log,
        ...e
      })
    }
  
    saveItemsEvents()
    saveConfig()

    // if (updateConfig) {
    //   config.items.lastBlock = log.blockNumber
    //   saveConfig()
    // }
  }

  const blockNumber = await web3.eth.getBlockNumber()

  const events = [
    'Transfer'
  ]
  
  for (const event of events) {
    await iterateBlocks(`Items Events: ${event}`, getAddress(contracts.items), config.items.lastBlock[event], blockNumber, contract.filters[event](), processLog, function (blockNumber) {
      config.items.lastBlock[event] = blockNumber
      saveConfig()
    })
  }

  console.log('Finished')

  saveItemsEvents()
  saveConfig()
  await updateGit()

  config.items.updating = false
}

async function monitorItemEvents() {
  arcaneItemsContract.on('Transfer', async () => {
    await getAllItemEvents()
  })
}

async function monitorGeneralStats() {
  console.log('[Stats] Updating')

  try {
    stats.totalCharacters = (await arcaneCharactersContract.totalSupply()).toNumber()

    if (!stats.characters) stats.characters = {}
  
    for (let i = 1; i <= 7; i++) {
      if (!stats.characters[i]) stats.characters[i] = {}

      stats.characters[i].total = (await arcaneCharactersContract.characterCount(i)).toNumber()
    }
  } catch (e) {
    console.error(e)
  }

  try {
    stats.totalItems = (await arcaneItemsContract.totalSupply()).toNumber()

    if (!stats.items) stats.items = {}
  
    for (let i = 1; i <= 20; i++) {
      if (!stats.items[i]) stats.items[i] = {}

      stats.items[i].total = (await arcaneItemsContract.itemCount(i)).toNumber()
      stats.items[i].burned = (await arcaneItemsContract.itemBurnCount(i)).toNumber()
    }
  } catch (e) {
    console.error(e)
  }

  // const arcaneRaidContract = new ethers.Contract(getAddress(contracts.raid), ArcaneRaidV1.abi, signer)

  // Update farms
  {
    console.log('Update farms')

    if (!stats.prices) stats.prices = { busd: 1 }
    if (!stats.liquidity) stats.liquidity = {}
    stats.totalBusdLiquidity = 0
    stats.totalBnbLiquidity = 0
  
    for (let i = 0; i < farmsData.length; i++) {
      const farm = farmsData[i]
      try {
        if (farm.chefKey !== 'DOL') continue
    
        // console.log(farm.lpSymbol)
      
        if (farm.lpSymbol.indexOf('BUSD') !== -1) {
          const value = toShort(await busdContract.balanceOf(getAddress(farm.lpAddresses)))
          
          // console.log('has', value)

          if (!['USDT-BUSD LP', 'BUSD-BNB LP'].includes(farm.lpSymbol)) {
            if (!stats.liquidity[farm.lpSymbol]) stats.liquidity[farm.lpSymbol] = {}
            stats.liquidity[farm.lpSymbol].value = value
      
            stats.totalBusdLiquidity += value
          }
        } else if (farm.lpSymbol.indexOf('BNB') !== -1) {
          const value = toShort(await wbnbContract.balanceOf(getAddress(farm.lpAddresses)))
          
          // console.log('has', value)
    
          if (!['BTCB-BNB LP', 'BUSD-BNB LP'].includes(farm.lpSymbol)) {
            if (!stats.liquidity[farm.lpSymbol]) stats.liquidity[farm.lpSymbol] = {}
            stats.liquidity[farm.lpSymbol].value = value
    
            stats.totalBnbLiquidity += value
          }
        }
    
        const lpAddress = getAddress(farm.isTokenOnly ? farm.tokenLpAddresses : farm.lpAddresses)

        const tokenContract = new ethers.Contract(getAddress(farm.tokenAddresses), BEP20Contract.abi, signer)
        const lpContract = new ethers.Contract(farm.isTokenOnly ? getAddress(farm.tokenAddresses) : lpAddress, BEP20Contract.abi, signer)
        const quotedContract = new ethers.Contract(getAddress(farm.quoteTokenAdresses), BEP20Contract.abi, signer)
    
        const tokenBalanceLP = (await tokenContract.balanceOf(lpAddress)).toString()
        const quoteTokenBlanceLP = (await quotedContract.balanceOf(lpAddress)).toString()
        const lpTokenBalanceMC = (await lpContract.balanceOf(getAddress(contracts.raid))).toString()
        const lpTotalSupply = (await lpContract.totalSupply()).toString()
        const tokenDecimals = await tokenContract.decimals()
        const quoteTokenDecimals = await quotedContract.decimals()

        let tokenAmount
        let lpTotalInQuoteToken
        let tokenPriceVsQuote
        if (farm.isTokenOnly) {
          tokenAmount = new BigNumber(lpTokenBalanceMC).div(new BigNumber(10).pow(tokenDecimals))
          if (farm.tokenSymbol === QuoteToken.BUSD && farm.quoteTokenSymbol === QuoteToken.BUSD) {
            tokenPriceVsQuote = new BigNumber(1)
          } else {
            tokenPriceVsQuote = new BigNumber(quoteTokenBlanceLP).div(new BigNumber(tokenBalanceLP))
          }
          lpTotalInQuoteToken = tokenAmount.times(tokenPriceVsQuote)
        } else {
          // Ratio in % a LP tokens that are in staking, vs the total number in circulation
          const lpTokenRatio = new BigNumber(lpTokenBalanceMC).div(new BigNumber(lpTotalSupply))
    
          // Total value in staking in quote token value
          lpTotalInQuoteToken = new BigNumber(quoteTokenBlanceLP)
            .div(new BigNumber(10).pow(18))
            .times(new BigNumber(2))
            .times(lpTokenRatio)
    
          // Amount of token in the LP that are considered staking (i.e amount of token * lp ratio)
          tokenAmount = new BigNumber(tokenBalanceLP).div(new BigNumber(10).pow(tokenDecimals)).times(lpTokenRatio)
          const quoteTokenAmount = new BigNumber(quoteTokenBlanceLP)
            .div(new BigNumber(10).pow(quoteTokenDecimals))
            .times(lpTokenRatio)
    
          if (tokenAmount.comparedTo(0) > 0) {
            tokenPriceVsQuote = quoteTokenAmount.div(tokenAmount)
          } else {
            tokenPriceVsQuote = new BigNumber(quoteTokenBlanceLP).div(new BigNumber(tokenBalanceLP))
          }
        }
    
        if (farm.quoteTokenSymbol === QuoteToken.BUSD) {
          const tokenSymbol = farm.tokenSymbol.toLowerCase()
          // console.log(tokenSymbol, tokenPriceVsQuote.toNumber())
          stats.prices[tokenSymbol] = tokenPriceVsQuote.toNumber()
        }

        if (farm.lpSymbol === 'BUSD-BNB LP') {
          stats.prices.bnb = 1 / tokenPriceVsQuote.toNumber()
          stats.prices.wbnb = 1 / tokenPriceVsQuote.toNumber()
        }
        

        // console.log(tokenAmount)
        // console.log(lpTotalInQuoteToken)
        // console.log(tokenPriceVsQuote)
        // console.log(quoteTokenBlanceLP)
        // console.log(lpTokenBalanceMC)
        // console.log(lpTotalSupply)
        farm.tokenAmount = tokenAmount.toNumber()
        farm.lpTotalInQuoteToken = lpTotalInQuoteToken.toNumber()
        farm.tokenPriceVsQuote = tokenPriceVsQuote.toNumber()
        farm.tokenBalanceLP = toShort(tokenBalanceLP.toString())
        farm.quoteTokenBlanceLP = toShort(quoteTokenBlanceLP.toString())
        farm.lpTokenBalanceMC = toShort(lpTokenBalanceMC.toString())
        farm.lpTotalSupply = toShort(lpTotalSupply.toString())
        farm.tokenDecimals = tokenDecimals
        farm.quoteTokenDecimals = quoteTokenDecimals
        farm.tokenTotalSupply = toShort((await tokenContract.totalSupply()).toString())
        farm.tokenTotalBurned = toShort((await tokenContract.balanceOf('0x000000000000000000000000000000000000dEaD')).toString())

        // console.log(farm)

        farms[farm.lpSymbol] = farm
      } catch(e) {
        console.log(e)

        // i -= 1
      }
    }

    saveFarms()

    console.log("Done updating farms")
  }

  // Update stats
  {
    console.log('Update stats')

    // Update TVL
    {
      console.log('Updating TVL')

      stats.tvl = 0

      for (const tokenSymbol of Object.keys(farms)) {
        const farm = farms[tokenSymbol]
        let liquidity = farm.lpTotalInQuoteToken

        if (!farm.lpTotalInQuoteToken) {
          liquidity = 0
        } else {
          liquidity = stats.prices[farm.quoteTokenSymbol.toLowerCase()] * farm.lpTotalInQuoteToken
        }

        stats.tvl += liquidity
      }
    }

    // Update historical token prices
    {
      console.log('Update historical token prices')
      if (!historical.price) historical.price = {}

      for (const tokenSymbol in stats.prices) {
        if (!historical.price[tokenSymbol]) historical.price[tokenSymbol] = []

        const currentPrice = stats.prices[tokenSymbol]
        const historicalPrice = historical.price[tokenSymbol]

        const oldTime = (new Date(historicalPrice[historicalPrice.length-1]?.[0] || 0)).getTime()
        const newTime = (new Date()).getTime()
        const diff = newTime - oldTime

        if (diff / (1000 * 60 * 60 * 24) > 1) {
          historicalPrice.push([newTime, currentPrice])
        }
      }
    }

    // Update liquidity
    {
      console.log('Update liquidity')
      if (!historical.liquidity) historical.liquidity = {
        total: [],
        busd: [],
        bnb: []
      }

      stats.totalLiquidity = stats.totalBusdLiquidity + (stats.totalBnbLiquidity * stats.prices.bnb)

      const oldTime = (new Date(historical.liquidity.total[historical.liquidity.total.length-1]?.[0] || 0)).getTime()
      const newTime = (new Date()).getTime()
      const diff = newTime - oldTime

      if (diff / (1000 * 60 * 60 * 24) > 1) {
        historical.liquidity.total.push([newTime, stats.totalLiquidity])
        historical.liquidity.busd.push([newTime, stats.totalBusdLiquidity])
        historical.liquidity.bnb.push([newTime, stats.totalBnbLiquidity])
      }
    }

    // Update market
    {
      console.log('Update market')

      stats.marketItemsAvailable = trades.filter(t => t.status === 'available').length
      stats.marketItemsSold = trades.filter(t => t.status === 'sold').length
      stats.marketItemsDelisted = trades.filter(t => t.status === 'delisted').length
      stats.marketAverageSoldPrice = average(trades.filter(t => t.status === 'sold').map(t => t.price))
    }

    // Update runes
    {
      console.log('Update runes')

      stats.totalRunes = Object.keys(runes).length - 1
    }

    // Update community
    {
      console.log('Update community')

      stats.totalCommunities = 8
      stats.totalPolls = 50
    }

    // Update game info
    {
      console.log('Update game info')

      stats.totalGuilds = 3
      stats.totalClasses = 7
      stats.totalRunewords = 7
    }
    
    // Update stat historical
    {
      console.log('Update stat historical')

      if (!historical.stats) historical.stats = {}

      if (!historical.stats.totalCharacters) historical.stats.totalCharacters = []
      if (!historical.stats.totalItems) historical.stats.totalItems = []
      if (!historical.stats.tvl) historical.stats.tvl = []
      if (!historical.stats.marketItemsAvailable) historical.stats.marketItemsAvailable = []
      if (!historical.stats.marketItemsSold) historical.stats.marketItemsSold = []
      if (!historical.stats.marketItemsDelisted) historical.stats.marketItemsDelisted = []
      if (!historical.stats.marketAverageSoldPrice) historical.stats.marketAverageSoldPrice = []
      if (!historical.stats.totalCommunities) historical.stats.totalCommunities = []
      if (!historical.stats.totalClasses) historical.stats.totalClasses = []
      if (!historical.stats.totalGuilds) historical.stats.totalGuilds = []
      if (!historical.stats.totalPolls) historical.stats.totalPolls = []
      if (!historical.stats.totalRunes) historical.stats.totalRunes = []
      if (!historical.stats.totalRunewords) historical.stats.totalRunewords = []

      const oldTime = (new Date(historical.stats.updatedAt || 0)).getTime()
      const newTime = (new Date()).getTime()
      const diff = newTime - oldTime

      if (diff / (1000 * 60 * 60 * 24) > 1) {
        historical.stats.totalCharacters.push([newTime, stats.totalCharacters])
        historical.stats.totalItems.push([newTime, stats.totalItems])
        historical.stats.tvl.push([newTime, stats.tvl])
        historical.stats.marketItemsAvailable.push([newTime, stats.marketItemsAvailable])
        historical.stats.marketItemsSold.push([newTime, stats.marketItemsSold])
        historical.stats.marketItemsDelisted.push([newTime, stats.marketItemsDelisted])
        historical.stats.marketAverageSoldPrice.push([newTime, stats.marketAverageSoldPrice])
        historical.stats.totalCommunities.push([newTime, stats.totalCommunities])
        historical.stats.totalClasses.push([newTime, stats.totalClasses])
        historical.stats.totalGuilds.push([newTime, stats.totalGuilds])
        historical.stats.totalPolls.push([newTime, stats.totalPolls])
        historical.stats.totalRunes.push([newTime, stats.totalRunes])
        historical.stats.totalRunewords.push([newTime, stats.totalRunewords])

        historical.stats.updatedAt = newTime
      }
    }

    saveStats()
    saveHistorical()
  }

  // Update app
  {
    console.log('Update app')
    // Update Profile config
    {
      console.log('Updating Profile config')

      app.config.characterMintCost = toShort((await arcaneCharacterFactoryContract.tokenPrice()).toString())
      app.config.profileRegisterCost = toShort((await arcaneProfileContract.numberRuneToRegister()).toString())
    }

    saveApp()
  }

  // Update runes
  {
    console.log('Update runes')

    for (const tokenSymbol in stats.prices) {
      if (tokenSymbol === 'bnb' || tokenSymbol === 'usdt' || tokenSymbol === 'busd') continue

      if (!runes[tokenSymbol]) runes[tokenSymbol] = {}

      runes[tokenSymbol].price = stats.prices[tokenSymbol]
    }
    
    for (const tokenSymbol of Object.keys(farms)) {
      const farm = farms[tokenSymbol]

      if (farm.isTokenOnly) {
        const symbol = tokenSymbol.toLowerCase()

        const tokenContract = new ethers.Contract(getAddress(contracts[symbol]), BEP20Contract.abi, signer)

        const raidHoldings = toShort((await tokenContract.balanceOf(getAddress(contracts.raid))).toString())
        const botHoldings = toShort((await tokenContract.balanceOf(getAddress(contracts.botAddress))).toString())
        const vaultHoldings = toShort((await tokenContract.balanceOf(getAddress(contracts.vaultAddress))).toString())
        const vault2Holdings = toShort((await tokenContract.balanceOf(getAddress(contracts.vault2Address))).toString())
        const vault3Holdings = toShort((await tokenContract.balanceOf(getAddress(contracts.vault3Address))).toString())
        const devHoldings = toShort((await tokenContract.balanceOf(getAddress(contracts.devAddress))).toString())
        const charityHoldings = toShort((await tokenContract.balanceOf(getAddress(contracts.charityAddress))).toString())

        const totalSupply = farm.tokenTotalSupply
        const circulatingSupply = farm.tokenTotalSupply - farm.tokenTotalBurned
        const totalBurned = farm.tokenTotalBurned

        if (!runes[symbol]) runes[symbol] = {}

        runes[symbol].totalSupply = totalSupply
        runes[symbol].circulatingSupply = circulatingSupply
        runes[symbol].totalBurned = totalBurned
        runes[symbol].holders = {}
        runes[symbol].holders.raid = raidHoldings
        runes[symbol].holders.vault = vaultHoldings
        runes[symbol].holders.vault2 = vault2Holdings
        runes[symbol].holders.vault3 = vault3Holdings
        runes[symbol].holders.dev = devHoldings
        runes[symbol].holders.charity = charityHoldings
        runes[symbol].holders.bot = botHoldings

        if (!historical.totalSupply) historical.totalSupply = {}
        if (!historical.totalSupply[symbol]) historical.totalSupply[symbol] = []
        if (!historical.circulatingSupply) historical.circulatingSupply = {}
        if (!historical.circulatingSupply[symbol]) historical.circulatingSupply[symbol] = []
        if (!historical.totalBurned) historical.totalBurned = {}
        if (!historical.totalBurned[symbol]) historical.totalBurned[symbol] = []
        if (!historical.raid) historical.raid = {}
        if (!historical.raid.holdings) historical.raid.holdings = {}
        if (!historical.raid.holdings[symbol]) historical.raid.holdings[symbol] = []
        if (!historical.bot) historical.bot = {}
        if (!historical.bot.holdings) historical.bot.holdings = {}
        if (!historical.bot.holdings[symbol]) historical.bot.holdings[symbol] = []
        if (!historical.vault) historical.vault = {}
        if (!historical.vault.holdings) historical.vault.holdings = {}
        if (!historical.vault.holdings[symbol]) historical.vault.holdings[symbol] = []
        if (!historical.vault2) historical.vault2 = {}
        if (!historical.vault2.holdings) historical.vault2.holdings = {}
        if (!historical.vault2.holdings[symbol]) historical.vault2.holdings[symbol] = []
        if (!historical.vault3) historical.vault3 = {}
        if (!historical.vault3.holdings) historical.vault3.holdings = {}
        if (!historical.vault3.holdings[symbol]) historical.vault3.holdings[symbol] = []
        if (!historical.dev) historical.dev = {}
        if (!historical.dev.holdings) historical.dev.holdings = {}
        if (!historical.dev.holdings[symbol]) historical.dev.holdings[symbol] = []
        if (!historical.charity) historical.charity = {}
        if (!historical.charity.holdings) historical.charity.holdings = {}
        if (!historical.charity.holdings[symbol]) historical.charity.holdings[symbol] = []

        const oldTime = (new Date(historical.totalSupply[symbol][historical.totalSupply[symbol].length-1]?.[0] || 0)).getTime()
        const newTime = (new Date()).getTime()
        const diff = newTime - oldTime

        if (diff / (1000 * 60 * 60 * 24) > 1) {
          historical.totalSupply[symbol].push([newTime, totalSupply])
          historical.circulatingSupply[symbol].push([newTime, circulatingSupply])
          historical.totalBurned[symbol].push([newTime, totalBurned])
          historical.raid.holdings[symbol].push([newTime, raidHoldings])
          historical.bot.holdings[symbol].push([newTime, botHoldings])
          historical.vault.holdings[symbol].push([newTime, vaultHoldings])
          historical.vault2.holdings[symbol].push([newTime, vault2Holdings])
          historical.vault3.holdings[symbol].push([newTime, vault3Holdings])
          historical.dev.holdings[symbol].push([newTime, devHoldings])
          historical.charity.holdings[symbol].push([newTime, charityHoldings])
        }
      }
    }
    
    saveRunes()
  }
  
  saveHistorical()
  saveConfig()

  await updateGit()

  setTimeout(monitorGeneralStats, 15 * 60 * 1000)
}

async function monitorCraftingStats() {
  // Update crafting competitions
  {
    console.log('Update crafting competitions')

    const craftersData = jetpack.read(path.resolve('./db/crafting/overall.json'), 'json')
    const craftingCompetition1Data = jetpack.read(path.resolve('./db/crafting/competition1.json'), 'json')
    const craftingCompetition2Data = jetpack.read(path.resolve('./db/crafting/competition2.json'), 'json')
    const craftingCompetition3Data = jetpack.read(path.resolve('./db/crafting/competition3.json'), 'json')

    const data = {
      all: [
        { name: 'Overall', count: 10, data: craftersData.total },
        { name: 'Genesis', count: 3, data: craftersData.genesis },
        { name: 'Destiny', count: 3, data: craftersData.destiny },
        { name: 'Grace', count: 3, data: craftersData.grace },
        { name: 'Glory', count: 3, data: craftersData.glory },
        { name: 'Titan', count: 3, data: craftersData.titan },
        { name: 'Smoke', count: 3, data: craftersData.smoke },
        { name: 'Flash', count: 3, data: craftersData.flash },
        { name: 'Lorekeeper', count: 3, data: craftersData.lorekeeper },
        { name: 'Fury', count: 3, data: craftersData.fury },
        { name: 'Steel', count: 3, data: craftersData.steel },
      ],
      competition1: [
        { name: 'Overall', count: 10, data: craftingCompetition1Data.total },
        { name: 'Titan', count: 3, data: craftingCompetition1Data.titan },
        { name: 'Smoke', count: 3, data: craftingCompetition1Data.smoke },
        { name: 'Flash', count: 3, data: craftingCompetition1Data.flash },
      ],
      competition2: [
        { name: 'Overall', count: 10, data: craftingCompetition2Data.total },
        { name: 'Destiny', count: 3, data: craftingCompetition2Data.destiny },
        { name: 'Grace', count: 3, data: craftingCompetition2Data.grace },
        { name: 'Glory', count: 3, data: craftingCompetition2Data.glory },
        { name: 'Titan', count: 3, data: craftingCompetition2Data.titan },
        { name: 'Flash', count: 3, data: craftingCompetition2Data.flash },
        { name: 'Fury', count: 3, data: craftingCompetition2Data.fury },
      ],
      competition3: [
        { name: 'Overall', count: 10, data: craftingCompetition3Data.total },
        { name: 'Fury', count: 3, data: craftingCompetition3Data.fury },
        { name: 'Flash', count: 3, data: craftingCompetition3Data.flash },
        { name: 'Titan', count: 3, data: craftingCompetition3Data.titan },
        { name: 'Glory', count: 3, data: craftingCompetition3Data.glory },
        { name: 'Grace', count: 3, data: craftingCompetition3Data.grace },
        { name: 'Genesis', count: 3, data: craftingCompetition3Data.genesis },
        { name: 'Destiny', count: 3, data: craftingCompetition3Data.destiny },
        { name: 'Wrath', count: 3, data: craftingCompetition3Data.wrath },
        { name: 'Fortress', count: 3, data: craftingCompetition3Data.fortress },
        { name: 'Elder', count: 3, data: craftingCompetition3Data.elder },
        { name: 'Pledge', count: 3, data: craftingCompetition3Data.pledge }
      ],
      competition4: []
    }

    jetpack.write(path.resolve('./db/crafting/leaderboard.json'), JSON.stringify(data, null, 2))
  }

  await updateGit()

  setTimeout(monitorCraftingStats, 15 * 60 * 1000)
}


function findPrice(symbol, timestamp) {
  for (let i = 1; i < historical.price[symbol].length; i++) {
    if (historical.price[symbol][i][0] > timestamp) {
      return historical.price[symbol][i][1]
    }
  }

  return stats.prices[symbol]
}

async function monitorEvolutionStats() {
  let playerRoundWinners
  let playerRewardWinners

  // Update evolution historical
  try {
    {
      console.log('Update evolution historical 1')

      if (!evolutionHistorical.playerCount) evolutionHistorical.playerCount = []

      let playerCount = 0

      for (const server of evolutionServers) {
        try {
          const rand = Math.floor(Math.random() * Math.floor(999999))
          const response = await fetch(`https://${server.endpoint}/info?${rand}`)
        
          let data = await response.json()

          server.playerCount = data.playerTotal
          server.speculatorCount = data.speculatorTotal
          server.version = data.version
          server.rewardItemAmount = data.rewardItemAmount
          server.rewardWinnerAmount = data.rewardWinnerAmount

          server.status = "online"
        } catch(e) {
          console.log(e)

          server.status = "offline"
          server.playerCount = 0
          server.speculatorCount = 0
          server.rewardItemAmount = 0
          server.rewardWinnerAmount = 0
        }

        playerCount += server.playerCount
      }

      jetpack.write(path.resolve('./db/evolution/servers.json'), JSON.stringify(evolutionServers, null, 2))

      const oldTime = (new Date(evolutionHistorical.playerCount[evolutionHistorical.playerCount.length-1]?.[0] || 0)).getTime()
      const newTime = (new Date()).getTime()
      const diff = newTime - oldTime
      if (diff / (1000 * 60 * 60 * 1) > 1) {
        evolutionHistorical.playerCount.push([newTime, playerCount])
      }

      jetpack.write(path.resolve('./db/evolution/historical.json'), JSON.stringify(evolutionHistorical, null, 2))
    }
    {
      console.log('Update evolution historical 2')
    }
  } catch(e) {
    console.log(e)
  }

  // Update evolution leaderboard history
  try {
    console.log('Update evolution leaderboard history')

    for (const server of evolutionServers) {
      try {
        const rand = Math.floor(Math.random() * Math.floor(999999))
        const response = await fetch(`https://${server.endpoint}/data/leaderboardHistory.json?${rand}`)
      
        let data = await response.json()

        const lastRoundItem = evolutionLeaderboardHistory.slice(evolutionLeaderboardHistory.length - 10).reverse().filter(r => r.length > 0)[0]
        let lastIndex = 0
        console.log('Last round', lastRoundItem)
        for (let i = 0; i < data.length; i++) {
          if (!data[i][0]) continue
          if (data[i].length === lastRoundItem.length && data[i][0].joinedAt === lastRoundItem[0].joinedAt && data[i][0].id === lastRoundItem[0].id) { //  && data[i][0].position === lastRoundItem[0].position
            lastIndex = i
          }
        }
        
        console.log('Starting from', lastIndex)

        if (lastIndex === 0) {
          console.warn("Shouldnt start from 0")

          playerRoundWinners = evolutionLeaderboardHistory
        } else {
          const dupChecker = {}

          data = evolutionLeaderboardHistory.concat(data.slice(lastIndex)).filter(p => {
            if (p.length === 0) return
            if (p[0].joinedAt < 1625322027) return
            if (dupChecker[p[0].position+p[0].joinedAt]) return

            dupChecker[p[0].position+p[0].joinedAt] = true

            return p
          })
      
          jetpack.write(path.resolve('./db/evolution/leaderboardHistory.json'), JSON.stringify(data, null, 2))
      
          playerRoundWinners = data
      
          for (let i = lastIndex; i < data.length; i++) {
            for (let j = 0; j < data[i].length; j++) {
              if (!data[i][j].address) continue
      
              try {
                const user = loadUser(data[i][j].address)
                saveUser(user)
              } catch(e) {
                console.log(e)
              }
            }
          }
        }
      } catch(e) {
        console.log(e)
      }
    }
  } catch(e) {
    console.log(e)
  }

  // Update evolution hash map
  try {
    console.log('Update evolution hash map')
    const data = {
      toName: {},
      toHash: {}
    }

    for (const round of playerRoundWinners) {
      for (const player of round) {
        if (player.hash && player.joinedAt >= 1625322027) {
          if (!data.toName[player.hash]) data.toName[player.hash] = []
          if (!data.toHash[player.name]) data.toHash[player.name] = []

          if (!data.toName[player.hash].includes(player.name)) {
            data.toName[player.hash].push(player.name)
          }

          if (!data.toHash[player.name].includes(player.hash)) {
            data.toHash[player.name].push(player.hash)
          }
        }
      }
    }

    jetpack.write(path.resolve('./db/evolution/hashmap.json'), JSON.stringify(data, null, 2))
  } catch(e) {
    console.log(e)
  }

  // Update evolution reward history
  try {
    console.log('Update evolution reward history')
    for (const server of evolutionServers) {
      try {
        const rand = Math.floor(Math.random() * Math.floor(999999))
        const response = await fetch(`https://${server.endpoint}/data/rewardHistory.json?${rand}`)
      
        let data = await response.json()

        const lastRewardItem = evolutionRewardHistory[evolutionRewardHistory.length-1]
        let lastIndex = 0

        for (let i = 0; i < data.length; i++) {
          if (data[i].symbol === lastRewardItem.symbol && data[i].quantity === lastRewardItem.quantity && data[i].winner.address === lastRewardItem.winner.address) { //  && data[i].pos.x === lastRewardItem.pos.x && data[i].pos.y === lastRewardItem.pos.y
            lastIndex = i
          }
        }

        console.log('Starting from', lastIndex)

        if (lastIndex === 0) {
          console.warn("Shouldnt start from 0")

          playerRewardWinners = evolutionRewardHistory
        } else {
          data = evolutionRewardHistory.concat(data.slice(lastIndex)).filter(p => !!p.winner && p.winner.address && (!p.winner.lastUpdate || (p.winner.lastUpdate >= 1625322027 && p.winner.lastUpdate <= 1625903860)))

          for (const win of data) {
            if (!win.monetary) win.monetary = 0

            if (win.winner.lastUpdate) {
              if (win.winner.lastUpdate < 1625552384) {
                win.quantity = 1
              } else {
                win.quantity = 0.1
              }
            }

            if (win.symbol) {
              win.monetary = findPrice(win.symbol, win.winner.lastUpdate) * win.quantity
            }
          }

          jetpack.write(path.resolve('./db/evolution/rewardHistory.json'), JSON.stringify(data, null, 2))

          playerRewardWinners = data
        }
      } catch(e) {
        console.log(e)
      }
    }
  } catch(e) {
    console.log(e)
  }

  // Update evolution rewards
  try {
    console.log('Update evolution rewards')
    const rand = Math.floor(Math.random() * Math.floor(999999))
    const response = await fetch(`https://rune-evolution-europe1.oa.r.appspot.com/data/rewards.json?${rand}`)
  
    const data = await response.json()

    jetpack.write(path.resolve('./db/evolution/rewards.json'), JSON.stringify(data, null, 2))
  } catch(e) {
    console.log(e)
  }

  // Update evolution player rewards
  {
    console.log('Update evolution player rewards')
    const rand = Math.floor(Math.random() * Math.floor(999999))
    const response = await fetch(`https://rune-evolution-europe1.oa.r.appspot.com/data/playerRewards.json?${rand}`)
  
    const data = await response.json()

    jetpack.write(path.resolve('./db/evolution/playerRewards.json'), JSON.stringify(data, null, 2))
  }

  // Update evolution info
  {
    console.log('Update evolution info')
    const rand = Math.floor(Math.random() * Math.floor(999999))
    const response = await fetch(`https://rune-evolution-europe1.oa.r.appspot.com/info?${rand}`)
  
    const data = await response.json()

    jetpack.write(path.resolve('./db/evolution/info.json'), JSON.stringify(data, null, 2))
  }

  // Update evolution leaderboard
  {
    const roundsPlayed = {}

    for (const round of playerRoundWinners) {
      for (const player of round) {
        if (player.joinedAt >= 1625322027 && player.name.indexOf('Guest') === -1) {
          if (!roundsPlayed[player.address]) {
            roundsPlayed[player.address] = {
              address: player.address,
              name: player.name,
              rounds: 0,
              kills: 0,
              deaths: 0,
              points: 0,
              rewards: 0,
              evolves: 0,
              powerups: 0
            }
          }
  
          roundsPlayed[player.address].kills += player.kills
          roundsPlayed[player.address].deaths += player.deaths
          roundsPlayed[player.address].points += player.points
          roundsPlayed[player.address].powerups += player.powerups
          roundsPlayed[player.address].rewards += player.rewards
          roundsPlayed[player.address].evolves += player.evolves

          roundsPlayed[player.address].rounds++
        }
      }
    }
    
    const groupedWinPlayers = groupBySub(playerRoundWinners.map((leaderboard) => {
      let winner = leaderboard[0]

      for (const p of leaderboard) {
        if (p.points > winner.points) {
          winner = p
        }
      }
      return { winner }
    }), 'winner', 'address')

    const findUsername = (address) => {
      for (const lb of evolutionLeaderboardHistory) {
        for (const pl of lb) {
          if (pl.address === address && pl.name.indexOf('Guest') === -1) {
            return pl.name
          }
        }
      }

      return address.slice(0, 6)
    }


    let evolutionEarningsDistributed = 0

    const groupedRewardPlayers = {}
    
    for (const reward of playerRewardWinners) {
      // if (reward.winner.lastUpdate) continue // skip old winners
      if (!groupedRewardPlayers[reward.winner.address]) groupedRewardPlayers[reward.winner.address] = { monetary: 0 }

      groupedRewardPlayers[reward.winner.address].address = reward.winner.address
      groupedRewardPlayers[reward.winner.address].name = findUsername(reward.winner.address)
      groupedRewardPlayers[reward.winner.address].monetary += reward.monetary

      evolutionEarningsDistributed += reward.monetary
    }

    for (const wins of Object.values(groupedWinPlayers)) {
      for (const win of wins) {
        if (win.winner.lastUpdate > 1625903860) continue // skip new winners

        if (!groupedRewardPlayers[win.winner.address]) groupedRewardPlayers[win.winner.address] = { monetary: 0 }

        let quantity = 0
        if (win.winner.lastUpdate < 1625552384) {
          quantity = 1
        } else {
          quantity = 0.3
        }

        const monetary = findPrice('zod', win.winner.lastUpdate) * quantity

        groupedRewardPlayers[win.winner.address].address = win.winner.address
        groupedRewardPlayers[win.winner.address].name = findUsername(win.winner.address)
        groupedRewardPlayers[win.winner.address].monetary += monetary
  
        evolutionEarningsDistributed += monetary
      }
    }

    stats.evolutionEarningsDistributed = evolutionEarningsDistributed

    const historicalEarnings = historical.evolutionEarningsDistributed

    if (historicalEarnings.length) {
      const oldTime = (new Date(evolutionEarningsDistributed[historicalEarnings.length-1]?.[0] || 0)).getTime()
      const newTime = (new Date()).getTime()
      const diff = newTime - oldTime
  
      if (diff / (1000 * 60 * 60 * 24) > 1) {
        historicalEarnings.push([newTime, stats.evolutionEarningsDistributed])
      }
    } else {
      const newTime = (new Date()).getTime()
      historicalEarnings.push([newTime, stats.evolutionEarningsDistributed])
    }

    saveHistorical()

  // {
  //   "type": "rune",
  //   "symbol": "ral",
  //   "quantity": 4.21,
  //   "winner": {
  //     "address": "0x545612032BeaDED7E9f5F5Ab611aF6428026E53E"
  //   },
  //   "tx": "0x4c2465dbe4fc6a7d774db429d0dd94fd06dfcc36c59e319aaf241da281dd5250"
  // },

    const data = {
      // all: [
      //   {
      //     name: 'Overall',
      //     count: 10,
      //     data: Object.keys(groupedRewardPlayers).map(address => ({
      //       username: groupedRewardPlayers[address][0].winner.name,
      //       count: groupedRewardPlayers[address].length
      //     })).sort(function(a, b) {
      //       return b.count - a.count;
      //     })
      //   }
      // ],
      monetary: [
        {
          name: 'Earnings',
          count: 10,
          data: Object.keys(groupedRewardPlayers).map(address => ({
            username: groupedRewardPlayers[address].name,
            count: groupedRewardPlayers[address].monetary
          })).sort(function(a, b) {
            return b.count - a.count;
          })
        }
      ],
      wins: [
        {
          name: 'Wins',
          count: 10,
          data: Object.keys(groupedWinPlayers).map(address => ({
            username: groupedWinPlayers[address].find(g => g.winner.name.indexOf('Guest') === -1)?.winner.name || groupedWinPlayers[address][0].winner.name,
            count: groupedWinPlayers[address].length
          })).sort(function(a, b) {
            return b.count - a.count;
          })
        }
      ],
      rounds: [
        {
          name: 'Rounds',
          count: 10,
          data: Object.keys(roundsPlayed).map(address => ({
            username: roundsPlayed[address].name,
            count: roundsPlayed[address].rounds
          })).sort(function(a, b) {
            return b.count - a.count;
          })
        }
      ],
      rewards: [
        {
          name: 'Rewards',
          count: 10,
          data: Object.keys(roundsPlayed).map(address => ({
            username: roundsPlayed[address].name,
            count: roundsPlayed[address].rewards
          })).sort(function(a, b) {
            return b.count - a.count;
          })
        }
      ],
      points: [
        {
          name: 'Points',
          count: 10,
          data: Object.keys(roundsPlayed).map(address => ({
            username: roundsPlayed[address].name,
            count: roundsPlayed[address].points
          })).sort(function(a, b) {
            return b.count - a.count;
          })
        }
      ],
      kills: [
        {
          name: 'Kills',
          count: 10,
          data: Object.keys(roundsPlayed).map(address => ({
            username: roundsPlayed[address].name,
            count: roundsPlayed[address].kills
          })).sort(function(a, b) {
            return b.count - a.count;
          })
        }
      ],
      deaths: [
        {
          name: 'Deaths',
          count: 10,
          data: Object.keys(roundsPlayed).map(address => ({
            username: roundsPlayed[address].name,
            count: roundsPlayed[address].deaths
          })).sort(function(a, b) {
            return b.count - a.count;
          })
        }
      ],
      powerups: [
        {
          name: 'Powerups',
          count: 10,
          data: Object.keys(roundsPlayed).map(address => ({
            username: roundsPlayed[address].name,
            count: roundsPlayed[address].powerups
          })).sort(function(a, b) {
            return b.count - a.count;
          })
        }
      ],
      evolves: [
        {
          name: 'Evolves',
          count: 10,
          data: Object.keys(roundsPlayed).map(address => ({
            username: roundsPlayed[address].name,
            count: roundsPlayed[address].evolves
          })).sort(function(a, b) {
            return b.count - a.count;
          })
        }
      ],
    }

    jetpack.write(path.resolve('./db/evolution/leaderboard.json'), JSON.stringify(data, null, 2))
  }

  await saveStats()
  await updateGit()

  setTimeout(monitorEvolutionStats, 10 * 60 * 1000)
}


async function monitorMeta() {
  console.log('Saving achievement data')
  jetpack.write(path.resolve('./db/achievements.json'), JSON.stringify(achievementData, null, 2))

  console.log('Saving item data')
  jetpack.write(path.resolve('./db/items.json'), JSON.stringify(itemData, null, 2))

  console.log('Saving item attribute data')
  jetpack.write(path.resolve('./db/itemAttributes.json'), JSON.stringify(ItemAttributes, null, 2))

  console.log('Saving skill data')
  jetpack.write(path.resolve('./db/skills.json'), JSON.stringify(SkillNames, null, 2))

  console.log('Saving class data')
  jetpack.write(path.resolve('./db/classes.json'), JSON.stringify(ClassNames, null, 2))

  console.log('Saving item rarity data')
  jetpack.write(path.resolve('./db/itemRarity.json'), JSON.stringify(ItemRarity, null, 2))

  console.log('Saving item type data')
  jetpack.write(path.resolve('./db/itemTypes.json'), JSON.stringify(ItemTypeToText, null, 2))

  console.log('Saving item slot data')
  jetpack.write(path.resolve('./db/itemSlots.json'), JSON.stringify(ItemSlotToText, null, 2))

  try {
    process.env.REACT_APP_PUBLIC_URL = 'https://rune.farm/'

    for (const item of itemData[ItemsMainCategoriesType.OTHER]) {
      item.icon = item.icon.replace('undefined', 'https://rune.farm/')

      if (item.recipe) {
        item.recipe.requirement = item.recipe.requirement.map(r => ({...r, id: RuneNames[r.id]}))
      }

      item.branches[1].attributes.map(a => ({...a, description: ItemAttributesById[a.id].description }))

      const itemJson = {
        "description": Array.isArray(item.branches[1].description) ? item.branches[1].description[0] : item.branches[1].description,
        "home_url": "https://rune.farm",
        "external_url": "https://rune.farm/catalog/" + item.id,
        "image_url": item.icon,
        "language": "en-US",
        ...item,
        "type": ItemTypeToText[item.type],
        "slots": item.slots.map(s => ItemSlotToText[s])
      }
      // const itemJson = {
      //   "id": 1,
      //   "name": "Steel",
      //   "icon": "/images/items/00001.png",
      //   "value": "0",
      //   "type": 1,
      //   "isNew": false,
      //   "isEquipable": true,
      //   "isUnequipable": false,
      //   "isTradeable": true,
      //   "isTransferable": true,
      //   "isCraftable": false,
      //   "isDisabled": false,
      //   "isRuneword": true,
      //   "isRetired": true,
      //   "createdDate": 12111,
      //   "hotness": 6,
      //   "recipe": {
      //     "requirement": [
      //       {
      //         "id": 2,
      //         "quantity": 1
      //       },
      //       {
      //         "id": 0,
      //         "quantity": 1
      //       }
      //     ]
      //   },
      //   "version": 3,
      //   "shortTokenId": "10030000101000900030002...694",
      //   "rarity": {
      //     "id": 6,
      //     "name": "Magical"
      //   },
      //   "tokenId": "100300001010009000300020000000000000000000000000000000000000000000000000694",
      //   "details": {
      //     "Type": "Sword",
      //     "Subtype": "Night Blade",
      //     "Rune Word": "Tir El",
      //     "Distribution": "Crafted",
      //     "Date": "April 20, 2021 - June 4, 2021",
      //     "Max Supply": "Unknown"
      //   },
      //   "branches": {
      //     "1": {
      //       "description": [
      //         "Made by Men, this blade is common but has minimal downsides."
      //       ],
      //       "attributes": [
      //         {
      //           "id": 1,
      //           "min": 5,
      //           "max": 15,
      //           "description": "{value}% Increased Harvest Yield"
      //         },
      //         {
      //           "id": 2,
      //           "min": 0,
      //           "max": 5,
      //           "description": "{value}% Harvest Fee"
      //         },
      //         {
      //           "id": 3,
      //           "min": 0,
      //           "max": 2,
      //           "description": "Harvest Fee Token: {value}",
      //           "map": {
      //             "0": "EL",
      //             "1": "ELD",
      //             "2": "TIR",
      //             "3": "NEF",
      //             "4": "ETH",
      //             "5": "ITH",
      //             "6": "TAL",
      //             "7": "RAL",
      //             "8": "ORT",
      //             "9": "THUL",
      //             "10": "AMN",
      //             "11": "SOL",
      //             "12": "SHAEL",
      //             "13": "DOL",
      //             "14": "HEL",
      //             "15": "IO",
      //             "16": "LUM",
      //             "17": "KO",
      //             "18": "FAL",
      //             "19": "LEM",
      //             "20": "PUL",
      //             "21": "UM",
      //             "22": "MAL",
      //             "23": "IST",
      //             "24": "GUL",
      //             "25": "VEX",
      //             "26": "OHM",
      //             "27": "LO",
      //             "28": "SUR",
      //             "29": "BER",
      //             "30": "JAH",
      //             "31": "CHAM",
      //             "32": "ZOD"
      //           }
      //         }
      //       ],
      //       "perfection": [
      //         15,
      //         0
      //       ]
      //     },
      //     "2": {
      //       "description": "Made by Men, this blade is common but has minimal downsides.",
      //       "attributes": [
      //         {
      //           "id": 1,
      //           "min": 16,
      //           "max": 20,
      //           "description": "{value}% Increased Attack Speed"
      //         },
      //         {
      //           "id": 3,
      //           "min": 6,
      //           "max": 8,
      //           "description": "{value}% Less Damage"
      //         },
      //         {
      //           "id": 4,
      //           "min": 81,
      //           "max": 100,
      //           "description": "{value} Increased Maximum Rage"
      //         },
      //         {
      //           "id": 5,
      //           "min": 3,
      //           "max": 5,
      //           "description": "{value} Increased Elemental Resists"
      //         },
      //         {
      //           "id": 7,
      //           "min": 3,
      //           "max": 5,
      //           "description": "{value} Increased Minion Attack Speed"
      //         },
      //         {
      //           "id": 8,
      //           "value": 3,
      //           "description": "{value} Increased Light Radius"
      //         }
      //       ]
      //     }
      //   },
      //   "shorthand": "9-3",
      //   "mods": [
      //     {
      //       "variant": 0,
      //       "value": 9,
      //       "attributeId": 1
      //     },
      //     {
      //       "variant": 0,
      //       "value": 3,
      //       "attributeId": 2
      //     },
      //     {
      //       "variant": 0,
      //       "value": 2,
      //       "attributeId": 3
      //     },
      //     {
      //       "variant": 0,
      //       "value": 0
      //     },
      //     {
      //       "variant": 0,
      //       "value": 0
      //     },
      //     {
      //       "variant": 0,
      //       "value": 0
      //     },
      //     {
      //       "variant": 0,
      //       "value": 0
      //     },
      //     {
      //       "variant": 0,
      //       "value": 0
      //     },
      //     {
      //       "variant": 0,
      //       "value": 0
      //     },
      //     {
      //       "variant": 0,
      //       "value": 0
      //     },
      //     {
      //       "variant": 0,
      //       "value": 0
      //     },
      //     {
      //       "variant": 0,
      //       "value": 0
      //     },
      //     {
      //       "variant": 0,
      //       "value": 0
      //     },
      //     {
      //       "variant": 0,
      //       "value": 0
      //     },
      //     {
      //       "variant": 0,
      //       "value": 0
      //     },
      //     {
      //       "variant": 0,
      //       "value": 694
      //     }
      //   ],
      //   "attributes": [
      //     {
      //       "id": 1,
      //       "min": 5,
      //       "max": 15,
      //       "description": "{value}% Increased Harvest Yield",
      //       "variant": 0,
      //       "value": 9,
      //       "attributeId": 1
      //     },
      //     {
      //       "id": 2,
      //       "min": 0,
      //       "max": 5,
      //       "description": "{value}% Harvest Fee",
      //       "variant": 0,
      //       "value": 3,
      //       "attributeId": 2
      //     },
      //     {
      //       "id": 3,
      //       "min": 0,
      //       "max": 2,
      //       "description": "Harvest Fee Token: {value}",
      //       "map": {
      //         "0": "EL",
      //         "1": "ELD",
      //         "2": "TIR",
      //         "3": "NEF",
      //         "4": "ETH",
      //         "5": "ITH",
      //         "6": "TAL",
      //         "7": "RAL",
      //         "8": "ORT",
      //         "9": "THUL",
      //         "10": "AMN",
      //         "11": "SOL",
      //         "12": "SHAEL",
      //         "13": "DOL",
      //         "14": "HEL",
      //         "15": "IO",
      //         "16": "LUM",
      //         "17": "KO",
      //         "18": "FAL",
      //         "19": "LEM",
      //         "20": "PUL",
      //         "21": "UM",
      //         "22": "MAL",
      //         "23": "IST",
      //         "24": "GUL",
      //         "25": "VEX",
      //         "26": "OHM",
      //         "27": "LO",
      //         "28": "SUR",
      //         "29": "BER",
      //         "30": "JAH",
      //         "31": "CHAM",
      //         "32": "ZOD"
      //       },
      //       "variant": 0,
      //       "value": 2,
      //       "attributeId": 3
      //     }
      //   ],
      //   "perfection": 0.4,
      //   "category": "weapon",
      //   "slots": [
      //     1,
      //     2
      //   ],
      //   "meta": {
      //     "harvestYield": 9,
      //     "harvestFeeToken": "TIR",
      //     "harvestFeePercent": 3,
      //     "harvestFees": {
      //       "TIR": 3
      //     },
      //     "chanceToSendHarvestToHiddenPool": 0,
      //     "chanceToLoseHarvest": 0,
      //     "harvestBurn": 0
      //   }
      // }
      
      delete itemJson.category
      delete itemJson.value
      delete itemJson.hotness
      delete itemJson.createdDate
      // delete item.shortTokenId
      // delete item.shorthand

      // if (!isToken) {
      //   delete item.tokenId
      //   delete item.rarity
      //   delete item.mods
      //   delete item.attributes
      //   delete item.perfection
      //   delete item.meta
      // }

      console.log('Saving item meta', itemJson.id)

      jetpack.write(path.resolve('./db/items/' + itemJson.id + '/meta.json'), JSON.stringify(itemJson, null, 2))

      // const ipfs = ipfsClient.create({
      //   host: 'ipfs.rune.game',
      //   protocol: 'https',
      //   port: 443,
      //   apiPath: '/api/v0'
      // })

      // await ipfs.files.add('/items/999999.json', Buffer.from(JSON.stringify(itemJson, null, 2)))

      // const cid = await ipfs.add(
      //   { path: '/items/999999.json', content: JSON.stringify(itemJson, null, 2) }, 
      //   // { wrapWithDirectory: true }
      //   // cid: 'QmcZ774UPRJ3Qzuyg76ayc2AFM26ZfZQai8Ub5THKmwtbF', 
      // )

      // console.log(cid)

    }
  } catch (e) {
    console.log(e)
  }

  await updateGit()

  setTimeout(monitorMeta, 10 * 60 * 1000)
}

async function onCommand() {

}

async function sendCommand() {

}


async function signCommand() {

}

async function isConnected() {

}

function migrateTrades() {
  for (const trade of trades) {
    delete trade.item
  }

  saveTrades()
}

async function run() {
  // migrateTrades()

  // return
  // await fetchPrices()

  // await Bridge.init({
  //   on: onCommand,
  //   send: sendCommand,
  //   sign: signCommand,
  //   isConnected
  // })


  // const user = loadUser('0x37470038C615Def104e1bee33c710bD16a09FdEf')
  // updateAchievementsByUser(user)
  // saveUser(user)

  setInterval(getAllItemEvents, 15 * 60 * 1000)
  setInterval(getAllBarracksEvents, 15 * 60 * 1000)
  setInterval(getAllMarketEvents, 15 * 60 * 1000)
  setInterval(getAllCharacterEvents, 15 * 60 * 1000)

  getAllItemEvents()
  getAllBarracksEvents()
  getAllMarketEvents()
  getAllCharacterEvents()

  monitorItemEvents()
  monitorBarracksEvents()
  monitorMarketEvents()
  monitorCharacterEvents()
  
  monitorGeneralStats()
  monitorCraftingStats()
  monitorEvolutionStats()
  monitorMeta()

}

run()

// Force restart after 15 mins
setTimeout(() => {
  process.exit(1)
}, 30 * 60 * 1000)
