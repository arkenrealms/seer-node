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
import ArcaneItemsContract from '../contracts/ArcaneItems.json'
import BEP20Contract from '../contracts/BEP20.json'
import { QuoteToken } from "./farms.mjs"

const config = jetpack.read(path.resolve('./db/config.json'), 'json')
const trades = removeDupes(jetpack.read(path.resolve('./db/trades.json'), 'json'))
const characters = removeDupes(jetpack.read(path.resolve('./db/characters.json'), 'json'))
const items = removeDupes(jetpack.read(path.resolve('./db/items.json'), 'json'))
const equips = removeDupes(jetpack.read(path.resolve('./db/equips.json'), 'json'))
const farms = jetpack.read(path.resolve('./db/farms.json'), 'json')
const runes = jetpack.read(path.resolve('./db/runes.json'), 'json')
const inventory = jetpack.read(path.resolve('./db/inventory.json'), 'json')
const stats = jetpack.read(path.resolve('./db/stats.json'), 'json')

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
    "https://thrumming-still-leaf.bsc.quiknode.pro/b2f8a5b1bd0809dbf061112e1786b4a8e53c9a83/" //"https://bsc.getblock.io/mainnet/?api_key=3f594a5f-d0ed-48ca-b0e7-a57d04f76332" //networks[Math.floor(Math.random() * networks.length)]
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

const saveCharacters = () => {
  jetpack.write(path.resolve('./db/characters.json'), JSON.stringify(characters, null, 2))
}

const saveItems = () => {
  jetpack.write(path.resolve('./db/items.json'), JSON.stringify(items, null, 2))
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

const aggregateGuildMembers = async () => {
  const charactersContract = new ethers.Contract(getAddress(contracts.characters), ArcaneCharactersContract.abi, signer)
  const iface = new ethers.utils.Interface(ArcaneCharactersContract.abi)

  async function iterate(fromBlock, toBlock, logs) {
    if (fromBlock === toBlock) return logs
  
    const event = charactersContract.filters['Transfer(address,address,uint256)']()
    
    const topic = ethers.utils.id("CharacterMint(address,uint256,uint8)")

    config.trades.lastBlock = (fromBlock + 5000) < toBlock ? fromBlock + 5000 : toBlock
    const filter = {
      address: getAddress(contracts.characters),
      fromBlock,
      toBlock: config.trades.lastBlock,
      topics: event.topics
    }

    try {
      const logs2 = await web3Provider.getLogs(filter)
      console.log(logs)
      await wait(3000)
      return iterate(config.trades.lastBlock, toBlock, [...logs, ...logs2])
    } catch(e) {
      console.log(fromBlock, toBlock, config.trades.lastBlock, logs)
      return iterate(fromBlock, toBlock, logs)
    }

    return logs
  }

  const logs = await iterate(6141200, 6160300, [])
  // const logs = logs222

  async function processEvent(event) {
    const characterHolder = event.args.from

    // const block = await library.getBlock(log.blockNumber)
    return characterHolder
    // if (event.name === 'mintNFT') {
      
    // }
  }

  const airdropAddresses = []

  for (const log2 of logs) {
    const event = iface.parseLog(log2)

    const airdropAddress = await processEvent(event)

    airdropAddresses.push(airdropAddress)
  }

  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index
  }

  const rows = airdropAddresses.filter(onlyUnique).map(a => [a, 40000/airdropAddresses.length])

  const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n")

  const encodedUri = encodeURI(csvContent)
  window.open(encodedUri)
}

async function getAllBarracksEvents() {
  const Contract = ArcaneBarracksV1Contract

  const charactersContract = new ethers.Contract(getAddress(contracts.barracks), Contract.abi, signer)
  const iface = new ethers.utils.Interface(Contract.abi)

  async function iterate(fromBlock, toBlock, processLog) {
    if (config.trades.lastBlock === toBlock) return
  
    // event Equip(address indexed user, uint256 indexed tokenId, uint16 indexed itemId)
    // event Unequip(address indexed user, uint256 indexed tokenId, uint16 indexed itemId)
    // event ActionBurn(address indexed user, uint256 amount)
    // event ActionBonus(address indexed user, uint256 amount)
    // event ActionHiddenPool(address indexed user, uint256 amount)
    // event ActionFee(address indexed user, address indexed token, uint256 amount)
    const event = charactersContract.filters['Equip(address,uint256,uint16)']()
    
    config.trades.lastBlock = (fromBlock + 4000) < toBlock ? fromBlock + 4000 : toBlock
    const filter = {
      address: getAddress(contracts.barracks),
      fromBlock,
      toBlock: config.trades.lastBlock,
      topics: event.topics
    }

    try {
      const logs = await web3Provider.getLogs(filter)
      for(let i = 0; i < logs.length; i++) {
        processLog(logs[i])
      }

      await wait(3000)
      
      iterate(config.trades.lastBlock, toBlock, processLog)
    } catch(e) {
      console.log('error', e)
      console.log(fromBlock, toBlock)
      iterate(fromBlock, config.trades.lastBlock, toBlock, processLog)
    }
  }

  const equips = []

  async function processLog(log) {
    const event = iface.parseLog(log)
    // const block = await library.getBlock(log.blockNumber)
    
    if (event.name === 'Equip') {
      const equip = {
        user: event.args.user,
        tokenId: event.args.tokenId.toString(),
        itemId: event.args.itemId,
        timestamp: (new Date()).getTime()
      }

      console.log(equip)
      equips.push(equip)
    }
  }

  const blockNumber = await web3.eth.getBlockNumber()
  await iterate(7310654, blockNumber, processLog)

  jetpack.write('./db/equips.json', JSON.stringify(equips, null, 2))
}

async function monitorBarracksEvents() {
  const equips = jetpack.read('./db/equips.json', 'json')

  const Contract = ArcaneBarracksV1Contract

  const contract = new ethers.Contract(getAddress(contracts.barracks), Contract.abi, signer)

  contract.on('Equip', async (user, tokenId, itemId) => {
    const equip = {
      user,
      tokenId: tokenId.toString(),
      itemId,
      timestamp: (new Date()).getTime()
    }

    console.log(equip)
    equips.push(equip)

    saveEquips()
    saveConfig()
    await updateGit()
  })
}

async function getAllMarketEvents() {
  config.trades.counter = trades[trades.length-1]?.id || 1

  const contract = new ethers.Contract(getAddress(contracts.trader), ArcaneTraderV1Contract.abi, signer)
  const iface = new ethers.utils.Interface(ArcaneTraderV1Contract.abi);

  async function iterate(fromBlock, toBlock, event, processLog) {
    if (fromBlock === toBlock) return
  
    // event List(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
    // event Update(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
    // event Delist(address indexed seller, uint256 tokenId);
    // event Buy(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
    // event Recover(address indexed user, address indexed seller, uint256 tokenId);

    try {
      const toBlock2 = (fromBlock + 5000) < toBlock ? fromBlock + 5000 : toBlock
  
      const filter = {
        address: getAddress(contracts.trader),
        fromBlock,
        toBlock: toBlock2,
        topics: event.topics
      }
  
      console.log('Iterating block', fromBlock, 'to', toBlock2, 'eventually', toBlock, 'for', event.topics)

      const logs = await web3Provider.getLogs(filter)

      for(let i = 0; i < logs.length; i++) {
        processLog(logs[i], false)
      }

      // await wait(3 * 1000)
      
      await iterate(toBlock2, toBlock, event, processLog)
    } catch(e) {
      console.log('error', e)
      console.log(fromBlock, toBlock)
      process.exit(1)
    }
  }

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
    contract.filters['List(address,address,uint256,uint256)'](),
    contract.filters['Update(address,address,uint256,uint256)'](),
    contract.filters['Delist(address,uint256)'](),
    contract.filters['Buy(address,address,uint256,uint256)'](),
  ]
  
  for (const event of events) {
    await iterate(config.trades.lastBlock, blockNumber, event, processLog)
  }

  config.trades.lastBlock = blockNumber

  console.log('Finished', config.trades.lastBlock)

  saveTrades()
  saveConfig()
  await updateGit()
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

  contract.on('List', async (seller, buyer, tokenId, price, log) => {
    let trade = trades.find(t => t.seller === seller && t.tokenId === tokenId.toString())

    if (!trade) {
      trade = {
        id: ++config.trades.counter
      }

      trades.push(trade)
    }

    if (trade.blockNumber >= log.blockNumber)
      return
  
    trade.seller = seller
    trade.buyer = buyer
    trade.tokenId = tokenId.toString()
    trade.price = toShort(price)
    trade.status = "available"
    trade.hotness = 0
    trade.createdAt = new Date().getTime()
    trade.updatedAt = new Date().getTime()
    trade.blockNumber = log.blockNumber

    console.log(trade)
    saveTrades()
    saveConfig()
    await updateGit()
  })

  contract.on('Update', async (seller, buyer, tokenId, price, log) => {
    const trade = trades.find(t => t.seller === seller && t.tokenId === tokenId.toString())

    if (trade.blockNumber >= log.blockNumber)
      return

    trade.buyer = buyer
    trade.price = toShort(price)
    trade.blockNumber = log.blockNumber
    trade.updatedAt = new Date().getTime()

    console.log(trade)
    saveTrades()
    saveConfig()
    await updateGit()
  })

  contract.on('Delist', async (seller, tokenId, log) => {
    const trade = trades.find(t => t.seller === seller && t.tokenId === tokenId.toString())

    if (trade.blockNumber >= log.blockNumber)
      return

    trade.status = "delisted"
    trade.blockNumber = log.blockNumber
    trade.delistedAt = new Date().getTime()

    console.log(trade)
    saveTrades()
    saveConfig()
    await updateGit()
  })

  contract.on('Buy', async (seller, buyer, tokenId, price, log) => {
    const trade = trades.find(t => t.seller === seller && t.tokenId === tokenId.toString())

    if (trade.blockNumber >= log.blockNumber)
      return

    trade.status = "sold"
    trade.blockNumber = log.blockNumber
    trade.boughtAt = new Date().getTime()

    console.log(trade)
    saveTrades()
    saveConfig()
    await updateGit()
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

    console.log(character)
    saveCharacters()
    saveConfig()
    await updateGit()
  })
}

async function monitorItemEvents() {
  config.items.counter = items[items.length-1]?.id || 1

  const Contract = ArcaneItemsContract
  const contract = new ethers.Contract(getAddress(contracts.items), Contract.abi, signer)

  contract.on('Transfer', async (from, to, tokenId, log) => {
    let item = items.find(t => t.tokenId === tokenId.toString())

    if (!item) {
      item = {
        id: ++config.items.counter
      }

      items.push(item)
    }

    if (item.blockNumber >= log.blockNumber)
      return

    item.owner = to
    item.tokenId = tokenId.toString()
    item.transferredAt = new Date().getTime()
    item.blockNumber = log.blockNumber

    console.log(item)
    saveItems()
    saveConfig()
    await updateGit()
  })
}

async function monitorGeneralStats() {
  stats.prices.bnb = await fetchPrice('binancecoin')

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


        console.log(tokenAmount)
        console.log(lpTotalInQuoteToken)
        console.log(tokenPriceVsQuote)
        console.log(quoteTokenBlanceLP)
        console.log(lpTokenBalanceMC)
        console.log(lpTotalSupply)
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
      if (!stats.historicalPrice) stats.historicalPrice = {}

      for (const tokenSymbol in stats.prices) {
        if (!stats.historicalPrice[tokenSymbol]) stats.historicalPrice[tokenSymbol] = []

        const currentPrice = stats.prices[tokenSymbol]
        const historicalPrice = stats.historicalPrice[tokenSymbol]

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
      if (!stats.historicalLiquidity) stats.historicalLiquidity = {
        total: [],
        busd: [],
        bnb: []
      }

      stats.totalLiquidity = stats.totalBusdLiquidity + (stats.totalBnbLiquidity * stats.prices.bnb)

      const oldTime = (new Date(stats.historicalLiquidity.total[stats.historicalLiquidity.total.length-1]?.[0] || 0)).getTime()
      const newTime = (new Date()).getTime()
      const diff = newTime - oldTime

      if (diff / (1000 * 60 * 60 * 24) > 1) {
        stats.historicalLiquidity.total.push([newTime, stats.totalLiquidity])
        stats.historicalLiquidity.busd.push([newTime, stats.totalBusdLiquidity])
        stats.historicalLiquidity.bnb.push([newTime, stats.totalBnbLiquidity])
      }
    }
    
    saveStats()
  }

  // Update runes
  {
    console.log('Update runes')

    for (const tokenSymbol in stats.prices) {
      if (tokenSymbol === 'bnb' || tokenSymbol === 'rune' || tokenSymbol === 'usdt') continue

      if (!runes[tokenSymbol]) runes[tokenSymbol] = {}

      runes[tokenSymbol].price = stats.prices[tokenSymbol]
    }
    
    for (const tokenSymbol of Object.keys(farms)) {
      const farm = farms[tokenSymbol]

      if (farm.isTokenOnly) {
        if (!runes[tokenSymbol.toLowerCase()]) runes[tokenSymbol.toLowerCase()] = {}

        runes[tokenSymbol.toLowerCase()].totalSupply = farm.tokenTotalSupply
        runes[tokenSymbol.toLowerCase()].circulatingSupply = farm.tokenTotalSupply - farm.tokenTotalBurned
        runes[tokenSymbol.toLowerCase()].totalBurned = farm.tokenTotalBurned
      }
    }
    
    saveRunes()
  }
  
  saveConfig()
  await updateGit()

  setTimeout(monitorGeneralStats, 15 * 60 * 1000)
}

async function run() {
  const accounts = await web3.eth.getAccounts()

  // monitorBarracksEvents()



  await fetchPrices()
  getAllMarketEvents()
  monitorMarketEvents()
  monitorCharacterEvents()
  monitorItemEvents()
  monitorGeneralStats()
}

run()

// Force restart after 15 mins
setTimeout(() => {
  process.exit(1)
}, 15 * 60 * 1000)
