import * as dotenv from 'dotenv'

dotenv.config()

import contracts from "./contracts.mjs"
import secrets from "../secrets.json"
import ethers from 'ethers'
import Web3 from "web3"
import BigNumber from "bignumber.js"
import fetch from "node-fetch"
import path from 'path'
import networks from "./networks.mjs"
import jetpack from 'fs-jetpack'
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

async function iterateBlocks(name, address, fromBlock, toBlock, event, processLog) {
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
    
    await iterateBlocks(name, address, toBlock2, toBlock, event, processLog)
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

  if (user.transferredOutCount > leaderboard.mostItemsTransferred.value) {
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

const saveItemOwner = (item, itemData) => {
  if (!item.owners.find(o => o === itemData.owner)) {
    item.owners.push(itemData.owner)
    item.owners = item.owners.filter(o => o != itemData.from)
  }
  
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
    ...(jetpack.read(path.resolve(`./db/users/${address}/overview.json`), 'json') || {}),
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

const saveUser = (user) => {
  jetpack.write(path.resolve(`./db/users/${user.address}/overview.json`), JSON.stringify({
    ...user,
    inventory: undefined,
    market: undefined,
    characters: undefined,
    craftedItemCount: user.inventory.items.filter(i => i.status === 'created').length,
    inventoryItemCount: user.inventory.items.filter(i => i.status === 'unequipped').length,
    equippedItemCount: user.inventory.items.filter(i => i.status === 'equipped').length,
    transferredOutCount: user.inventory.items.filter(i => i.status === 'transferred_out').length,
    transferredInCount: user.inventory.items.filter(i => i.status === 'transferred_in').length
  }, null, 2))

  updateLeaderboardByUser(user)

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

async function getAllBarracksEvents() {
  if (config.barracks.updating) return

  console.log('[Barracks] Updating')

  config.barracks.updating = true

  const contract = new ethers.Contract(getAddress(contracts.barracks), ArcaneBarracksFacetV1.abi, signer)
  const iface = new ethers.utils.Interface(ArcaneBarracksFacetV1.abi)

  async function processLog(log, updateConfig = true) {
    const e = iface.parseLog(log)
    
    console.log(e.name, e)

    if (e.name === 'Equip') {
      const { user: userAddress, tokenId, itemId } = e.args

      const user = loadUser(userAddress)

      const item = {
        status: "equipped",
        tokenId: tokenId.toString(),
        updatedAt: new Date().getTime(),
        ...decodeItem(tokenId.toString())
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
        ...decodeItem(tokenId.toString())
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
        id: ++config.barracks.counter,
        ...log,
        ...e
      })
    }
  
    saveBarracksEvents()

    if (updateConfig) {
      config.barracks.lastBlock = log.blockNumber
      saveConfig()
    }
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
    await iterateBlocks(`Barracks Events: ${event}`, getAddress(contracts.barracks), config.barracks.lastBlock, blockNumber, contract.filters[event](), processLog)
  }

  config.barracks.lastBlock = blockNumber

  console.log('Finished', config.barracks.lastBlock)

  saveBarracksEvents()
  saveConfig()
  await updateGit()

  config.barracks.updating = false
}

async function monitorBarracksEvents() {
  const contract = new ethers.Contract(getAddress(contracts.barracks), ArcaneBarracksFacetV1.abi, signer)

  contract.on('Equip', async () => {
    await getAllBarracksEvents()
  })

  contract.on('Unequip', async () => {
    await getAllBarracksEvents()
  })

  contract.on('ActionBurn', async () => {
    await getAllBarracksEvents()
  })

  contract.on('ActionBonus', async () => {
    await getAllBarracksEvents()
  })

  contract.on('ActionHiddenPool', async () => {
    await getAllBarracksEvents()
  })

  contract.on('ActionFee', async () => {
    await getAllBarracksEvents()
  })

  contract.on('ActionSwap', async () => {
    await getAllBarracksEvents()
  })
}

async function getAllMarketEvents() {
  if (config.trades.updating) return

  console.log('[Market] Updating')

  config.trades.updating = true

  const contract = new ethers.Contract(getAddress(contracts.trader), ArcaneTraderV1.abi, signer)
  const iface = new ethers.utils.Interface(ArcaneTraderV1.abi);

  async function processLog(log, updateConfig = true) {
    const e = iface.parseLog(log)
    
    if (e.name === 'List') {
      const { seller, buyer, tokenId, price } = e.args

      let trade = trades.find(t => t.seller === seller && t.tokenId === tokenId.toString())

      if (trade) {
        if (trade.blockNumber >= log.blockNumber) {
          return
        }
      } else {
        trade = {
          id: ++config.trades.counter
        }

        trades.push(trade)
      }

      trade.seller = seller
      trade.buyer = buyer
      trade.tokenId = tokenId.toString()
      trade.price = toShort(price)
      trade.status = "available"
      trade.hotness = 0
      trade.createdAt = new Date().getTime()
      trade.updatedAt = new Date().getTime()
      trade.blockNumber = log.blockNumber
      trade.item = decodeItem(trade.tokenId)

      saveUserTrade(loadUser(seller), trade)
      saveTokenTrade(loadToken(trade.tokenId), trade)
      saveItemTrade(loadItem(trade.item.id), trade)
      saveItemToken(loadItem(trade.item.id), { id: trade.tokenId, item: trade.item })
      
      console.log('List', trade)
    }

    if (e.name === 'Update') {
      const { seller, buyer, tokenId, price } = e.args

      const trade = trades.find(t => t.seller === seller && t.tokenId === tokenId.toString())

      if (trade.blockNumber >= log.blockNumber)
        return

      trade.buyer = buyer
      trade.price = toShort(price)
      trade.updatedAt = new Date().getTime()
      trade.blockNumber = log.blockNumber
      trade.item = decodeItem(trade.tokenId)

      saveUserTrade(loadUser(seller), trade)
      saveTokenTrade(loadToken(trade.tokenId), trade)
      saveItemTrade(loadItem(trade.item.id), trade)
      saveItemToken(loadItem(trade.item.id), { id: trade.tokenId, item: trade.item })
      
      console.log('Update', trade)
    }

    if (e.name === 'Delist') {
      const { seller, buyer, tokenId, price } = e.args

      const trade = trades.find(t => t.seller === seller && t.tokenId === tokenId.toString())

      if (trade.blockNumber >= log.blockNumber)
        return
  
      trade.status = "delisted"
      trade.updatedAt = new Date().getTime()
      trade.blockNumber = log.blockNumber
      trade.item = decodeItem(trade.tokenId)

      saveUserTrade(loadUser(seller), trade)
      saveTokenTrade(loadToken(trade.tokenId), trade)
      saveItemTrade(loadItem(trade.item.id), trade)
      saveItemToken(loadItem(trade.item.id), { id: trade.tokenId, item: trade.item })
      
      console.log('Delist', trade)
    }

    if (e.name === 'Buy') {
      const { seller, buyer, tokenId, price } = e.args

      const trade = trades.find(t => t.seller === seller && t.tokenId === tokenId.toString())

      if (trade.blockNumber >= log.blockNumber)
        return

      trade.status = "sold"
      trade.buyer = buyer
      trade.updatedAt = new Date().getTime()
      trade.blockNumber = log.blockNumber
      trade.item = decodeItem(trade.tokenId)

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
        id: ++config.trades.counter,
        ...log,
        ...e
      })
    }

    saveTrades()
    saveTradesEvents()

    if (updateConfig) {
      config.trades.lastBlock = log.blockNumber
      saveConfig()
    }
  }

  const blockNumber = await web3.eth.getBlockNumber()

  const events = [
    'List(address,address,uint256,uint256)',
    'Update(address,address,uint256,uint256)',
    'Delist(address,uint256)',
    'Buy(address,address,uint256,uint256)',
  ]
  
  for (const event of events) {
    await iterateBlocks(`Market Events: ${event}`, getAddress(contracts.trader), config.trades.lastBlock, blockNumber, contract.filters[event](), processLog)
  }

  config.trades.lastBlock = blockNumber

  console.log('Finished', config.trades.lastBlock)

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

  const Contract = ArcaneTraderV1
  const contract = new ethers.Contract(getAddress(contracts.trader), Contract.abi, signer)

  contract.on('List', async () => {
    await getAllMarketEvents()
  })

  contract.on('Update', async () => {
    await getAllMarketEvents()
  })

  contract.on('Delist', async () => {
    await getAllMarketEvents()
  })

  contract.on('Buy', async () => {
    await getAllMarketEvents()
  })
}

async function getAllCharacterEvents() {
  if (config.characters.updating) return

  console.log('[Characters] Updating')

  config.characters.updating = true

  const contract = new ethers.Contract(getAddress(contracts.characters), ArcaneCharacters.abi, signer)
  const iface = new ethers.utils.Interface(ArcaneCharacters.abi)

  async function processLog(log, updateConfig = true) {
    const e = iface.parseLog(log)
    
    console.log(e.name, e)

    if (e.name === 'Transfer') {
      const { from, to: userAddress, tokenId } = e.args

      const user = loadUser(userAddress)

      const characterData = {
        owner: userAddress,
        from,
        status: from === '0x0000000000000000000000000000000000000000' ? "created" : 'transferred_in',
        tokenId: tokenId.toString(),
        transferredAt: new Date().getTime(),
        id: await contract.getCharacterId(tokenId.toString())
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

    if (updateConfig) {
      config.characters.lastBlock = log.blockNumber
      saveConfig()
    }
  }

  const blockNumber = await web3.eth.getBlockNumber()

  const events = [
    'Transfer'
  ]
  
  for (const event of events) {
    await iterateBlocks(`Characters Events: ${event}`, getAddress(contracts.characters), config.characters.lastBlock, blockNumber, contract.filters[event](), processLog)
  }

  config.characters.lastBlock = blockNumber

  console.log('Finished', config.characters.lastBlock)

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
    
    console.log(e.name, e)

    if (e.name === 'Transfer') {
      const { from, to: userAddress, tokenId } = e.args

      const user = loadUser(userAddress)

      const itemData = {
        owner: userAddress,
        from,
        status: from === '0x0000000000000000000000000000000000000000' ? "created" : 'transferred_in',
        tokenId: tokenId.toString(),
        createdAt: new Date().getTime(),
        ...decodeItem(tokenId.toString())
      }

      saveUserItem(user, itemData)
      saveTokenTransfer(loadToken(itemData.tokenId), itemData)

      if (from !== '0x0000000000000000000000000000000000000000') {
        saveUserItem(user, { ...itemData, status: 'transferred_out' })
      }

      saveItemOwner(loadItem(itemData.id), itemData)
    }

    const e2 = itemsEvents.find(t => t.transactionHash === log.transactionHash)

    if (!e2) {
      itemsEvents.push({
        id: ++config.items.counter,
        ...log,
        ...e
      })
    }
  
    saveItemsEvents()

    if (updateConfig) {
      config.items.lastBlock = log.blockNumber
      saveConfig()
    }
  }

  const blockNumber = await web3.eth.getBlockNumber()

  const events = [
    'Transfer'
  ]
  
  for (const event of events) {
    await iterateBlocks(`Items Events: ${event}`, getAddress(contracts.items), config.items.lastBlock, blockNumber, contract.filters[event](), processLog)
  }

  config.items.lastBlock = blockNumber

  console.log('Finished', config.items.lastBlock)

  saveItemsEvents()
  saveConfig()
  await updateGit()

  config.items.updating = false
}

async function monitorItemEvents() {
  const contract = new ethers.Contract(getAddress(contracts.items), ArcaneItems.abi, signer)

  contract.on('Transfer', async () => {
    await getAllItemEvents()
  })
}

async function monitorGeneralStats() {
  console.log('[Stats] Updating')

  const arcaneCharactersContract = new ethers.Contract(getAddress(contracts.characters), ArcaneCharacters.abi, signer)

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

  const arcaneItemsContract = new ethers.Contract(getAddress(contracts.items), ArcaneItems.abi, signer)
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
        if (farm.chefKey !== 'SOL') continue
    
        console.log(farm.lpSymbol)
      
        if (farm.lpSymbol.indexOf('BUSD') !== -1) {
          const contract = new ethers.Contract(getAddress(contracts.busd), BEP20Contract.abi, signer)
          const value = toShort(await contract.balanceOf(getAddress(farm.lpAddresses)))
          
          // console.log('has', value)
          
          if (!['USDT-BUSD LP', 'BUSD-BNB LP'].includes(farm.lpSymbol)) {
            if (!stats.liquidity[farm.lpSymbol]) stats.liquidity[farm.lpSymbol] = {}
            stats.liquidity[farm.lpSymbol].value = value
      
            stats.totalBusdLiquidity += value
          }
        } else if (farm.lpSymbol.indexOf('BNB') !== -1) {
          const contract = new ethers.Contract(getAddress(contracts.wbnb), BEP20Contract.abi, signer)
          const value = toShort(await contract.balanceOf(getAddress(farm.lpAddresses)))
          
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
          stats.prices[tokenSymbol] = tokenPriceVsQuote.toNumber()
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

        i -= 1
      }
    }

    saveFarms()
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

      const characterFactoryContract = new ethers.Contract(getAddress(contracts.characterFactory), ArcaneCharacterFactoryV3.abi, signer)
      const profileContract = new ethers.Contract(getAddress(contracts.profile), ArcaneProfile.abi, signer)

      app.config.characterMintCost = toShort((await characterFactoryContract.tokenPrice()).toString())
      app.config.profileRegisterCost = toShort((await profileContract.numberRuneToRegister()).toString())
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

async function onCommand() {

}

async function sendCommand() {

}


async function signCommand() {

}

async function isConnected() {

}

async function run() {
  // await fetchPrices()

  // await Bridge.init({
  //   on: onCommand,
  //   send: sendCommand,
  //   sign: signCommand,
  //   isConnected
  // })

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
}

run()

// Force restart after 15 mins
setTimeout(() => {
  process.exit(1)
}, 30 * 60 * 1000)
