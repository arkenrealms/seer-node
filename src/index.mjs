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
import ArcaneRaidV1Contract from '../contracts/ArcaneRaidV1.json'
import ArcaneTraderV1Contract from '../contracts/ArcaneTraderV1.json'
import ArcaneCharactersContract from '../contracts/ArcaneCharacters.json'
import ArcaneBarracksFacetV1 from '../contracts/ArcaneBarracksFacetV1.json'
import ArcaneItemsContract from '../contracts/ArcaneItems.json'
import BEP20Contract from '../contracts/BEP20.json'
import { QuoteToken } from "./farms.mjs"
import { decodeItem } from "./util/decodeItem.mjs"

const config = jetpack.read(path.resolve('./db/config.json'), 'json')
const trades = removeDupes(jetpack.read(path.resolve('./db/trades.json'), 'json'))
const characters = removeDupes(jetpack.read(path.resolve('./db/characters.json'), 'json'))
const items = removeDupes(jetpack.read(path.resolve('./db/items.json'), 'json'))
const equips = removeDupes(jetpack.read(path.resolve('./db/equips.json'), 'json'))
const farms = jetpack.read(path.resolve('./db/farms.json'), 'json')
const runes = jetpack.read(path.resolve('./db/runes.json'), 'json')
const inventory = jetpack.read(path.resolve('./db/inventory.json'), 'json')
const stats = jetpack.read(path.resolve('./db/stats.json'), 'json')
const historical = jetpack.read(path.resolve('./db/historical.json'), 'json')
const barracksEvents = jetpack.read(path.resolve('./db/barracks/events.json'), 'json')
const blacksmithEvents = jetpack.read(path.resolve('./db/blacksmith/events.json'), 'json')
const raidEvents = jetpack.read(path.resolve('./db/raid/events.json'), 'json')
const guildsEvents = jetpack.read(path.resolve('./db/guilds/events.json'), 'json')
const itemsEvents = jetpack.read(path.resolve('./db/items/events.json'), 'json')
const charactersEvents = jetpack.read(path.resolve('./db/characters/events.json'), 'json')
const usersEvents = jetpack.read(path.resolve('./db/users/events.json'), 'json')


config.trades.updating = false
config.barracks.updating = false
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

const saveEquips = () => {
  jetpack.write(path.resolve('./db/equips.json'), JSON.stringify(equips, null, 2))
}

const saveInventory = () => {
  jetpack.write(path.resolve('./db/inventory.json'), JSON.stringify(inventory, null, 2))
}

const saveTrades = () => {
  jetpack.write(path.resolve('./db/trades.json'), JSON.stringify(trades, null, 2))
}

const saveBarracksEvents = () => {
  jetpack.write(path.resolve('./db/barracks/events.json'), JSON.stringify(barracksEvents, null, 2))
}

const saveCharacters = () => {
  jetpack.write(path.resolve('./db/characters.json'), JSON.stringify(characters, null, 2))
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


const loadItem = (itemId) => {
  return {
    ...(jetpack.read(path.resolve(`./db/items/${itemId}/overview.json`), 'json') || {}),
    id: itemId,
    perfectCount: 0,
    ownersCount: 0,
    marketTradesListedCount: 0,
    marketTradesSoldCount: 0,
    owners: (jetpack.read(path.resolve(`./db/items/${itemId}/owners.json`), 'json') || []),
    market: (jetpack.read(path.resolve(`./db/items/${itemId}/market.json`), 'json') || [])
  }
}

const saveItem = (item) => {
  jetpack.write(path.resolve(`./db/items/${item.id}/overview.json`), JSON.stringify({
    ...item,
    owners: undefined,
    market: undefined,
    perfectCount: item.owners.filter(i => i.perfect === 100).length,
    ownersCount: item.owners.length,
    marketTradesPerfectCount: item.market.filter(i => i.perfect === 100).length,
    marketTradesListedCount: item.market.filter(i => i.status === 'listed').length,
    marketTradesSoldCount: item.market.filter(i => i.status === 'sold').length
  }, null, 2))

  jetpack.write(path.resolve(`./db/items/${item.id}/owners.json`), JSON.stringify(item.owners, null, 2))
  jetpack.write(path.resolve(`./db/items/${item.id}/market.json`), JSON.stringify(item.market, null, 2))
}

const saveItemOwner = (item, itemData) => {
  if (!item.owners.find(o => o === itemData.owner)) {
    item.owners.push(itemData.owner)
    item.owners = item.owners.filter(o => o != itemData.from)
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
    ...(jetpack.read(path.resolve(`./db/users/${address}/overview.json`), 'json') || {}),
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
    inventoryItemCount: user.inventory.items.filter(i => i.status === 'unequipped').length,
    equippedItemCount: user.inventory.items.filter(i => i.status === 'equipped').length
  }, null, 2))

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

  config.barracks.updating = true

  config.barracks.counter = barracksEvents[barracksEvents.length-1]?.id || 1

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
}

async function getAllMarketEvents() {
  if (config.trades.updating) return

  config.trades.updating = true
  config.trades.counter = trades[trades.length-1]?.id || 1

  const contract = new ethers.Contract(getAddress(contracts.trader), ArcaneTraderV1Contract.abi, signer)
  const iface = new ethers.utils.Interface(ArcaneTraderV1Contract.abi);

  async function processLog(log, updateConfig = true) {
    const event = iface.parseLog(log)
    
    if (event.name === 'List') {
      const { seller, buyer, tokenId, price } = event.args

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

      saveUserTrade(loadUser(seller), trade)
      saveTokenTrade(loadToken(trade.tokenId), trade)
      
      console.log('List', trade)
    }

    if (event.name === 'Update') {
      const { seller, buyer, tokenId, price } = event.args

      const trade = trades.find(t => t.seller === seller && t.tokenId === tokenId.toString())

      if (trade.blockNumber >= log.blockNumber)
        return

      trade.buyer = buyer
      trade.price = toShort(price)
      trade.updatedAt = new Date().getTime()
      trade.blockNumber = log.blockNumber

      saveUserTrade(loadUser(seller), trade)
      saveTokenTrade(loadToken(trade.tokenId), trade)
      
      console.log('Update', trade)
    }

    if (event.name === 'Delist') {
      const { seller, buyer, tokenId, price } = event.args

      const trade = trades.find(t => t.seller === seller && t.tokenId === tokenId.toString())

      if (trade.blockNumber >= log.blockNumber)
        return
  
      trade.status = "delisted"
      trade.updatedAt = new Date().getTime()
      trade.blockNumber = log.blockNumber

      saveUserTrade(loadUser(seller), trade)
      saveTokenTrade(loadToken(trade.tokenId), trade)
      
      console.log('Delist', trade)
    }

    if (event.name === 'Buy') {
      const { seller, buyer, tokenId, price } = event.args

      const trade = trades.find(t => t.seller === seller && t.tokenId === tokenId.toString())

      if (trade.blockNumber >= log.blockNumber)
        return

      trade.status = "sold"
      trade.updatedAt = new Date().getTime()
      trade.blockNumber = log.blockNumber

      saveUserTrade(loadUser(seller), trade)
      saveUserTrade(loadUser(buyer), trade)
      saveTokenTrade(loadToken(trade.tokenId), trade)
      
      console.log('Buy', trade)
    }

    saveTrades()

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
  config.trades.counter = trades[trades.length-1]?.id || 1

  // event List(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Update(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Delist(address indexed seller, uint256 tokenId);
  // event Buy(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Recover(address indexed user, address indexed seller, uint256 tokenId);

  const Contract = ArcaneTraderV1Contract
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

async function monitorCharacterEvents() {
  config.characters.counter = characters[characters.length-1]?.id || 1

  const Contract = ArcaneCharactersContract
  const contract = new ethers.Contract(getAddress(contracts.characters), Contract.abi, signer)

  contract.on('Transfer', async (from, to, tokenId, log) => {
    let character = characters.find(t => t.tokenId === tokenId.toString())

    if (!character) {
      character = {
        id: ++config.characters.counter
      }

      characters.push(character)
    }

    if (character.blockNumber >= log.blockNumber)
      return

    character.owner = to
    character.tokenId = tokenId.toString()
    character.transferredAt = new Date().getTime()
    character.blockNumber = log.blockNumber

    console.log('Character Transfer', character)
    saveCharacters()
    saveConfig()
    await updateGit()
  })
}

async function getAllItemEvents() {
  if (config.items.updating) return

  config.items.updating = true
  config.items.counter = itemsEvents[itemsEvents.length-1]?.id || 1

  const contract = new ethers.Contract(getAddress(contracts.items), ArcaneItemsContract.abi, signer)
  const iface = new ethers.utils.Interface(ArcaneItemsContract.abi)

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
  config.items.counter = items[items.length-1]?.id || 1

  const contract = new ethers.Contract(getAddress(contracts.items), ArcaneItemsContract.abi, signer)

  contract.on('Transfer', async (from, to, tokenId, log) => {
    
  })
}

async function monitorGeneralStats() {
  // stats.prices.bnb = await fetchPrice('binancecoin')

  const arcaneCharactersContract = new ethers.Contract(getAddress(contracts.characters), ArcaneCharactersContract.abi, signer)

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

  const arcaneItemsContract = new ethers.Contract(getAddress(contracts.items), ArcaneItemsContract.abi, signer)
  try {
    stats.totalItems = (await arcaneItemsContract.totalSupply()).toNumber()

    if (!stats.items) stats.items = {}
  
    for (let i = 1; i <= 7; i++) {
      if (!stats.items[i]) stats.items[i] = {}

      stats.items[i].total = (await arcaneItemsContract.itemCount(i)).toNumber()
      stats.items[i].burned = (await arcaneItemsContract.itemBurnCount(i)).toNumber()
    }
  } catch (e) {
    console.error(e)
  }

  // const arcaneRaidContract = new ethers.Contract(getAddress(contracts.raid), ArcaneRaidV1Contract.abi, signer)

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
        if (farm.chefKey !== 'AMN') continue
    
        // console.log(farm.lpSymbol)
      
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
    
    saveStats()
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

async function run() {
  await fetchPrices()

  getAllItemEvents()
  monitorItemEvents()

  getAllBarracksEvents()
  monitorBarracksEvents()

  getAllMarketEvents()
  monitorMarketEvents()
  
  monitorCharacterEvents()
  
  monitorGeneralStats()
}

run()

// Force restart after 15 mins
// setTimeout(() => {
//   process.exit(1)
// }, 15 * 60 * 1000)
