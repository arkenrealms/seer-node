import contracts from "./contracts.mjs"
import secrets from "./secrets.json"
import ethers from 'ethers'
import Web3 from "web3"
// import networks from "./networks.mjs"
import jetpack from 'fs-jetpack'
import HDWalletProvider from "@truffle/hdwallet-provider"
import { wait, round, removeDupes, toLong, toShort, getAddress, updateGit } from './util.mjs'
import ArcaneTraderV1Contract from './contracts/ArcaneTraderV1.json'
import ArcaneCharactersContract from './contracts/ArcaneCharacters.json'

const config = jetpack.read('./db/config.json', 'json')
const trades = removeDupes(jetpack.read('./db/trades.json', 'json'))
const characters = removeDupes(jetpack.read('./db/characters.json', 'json'))
const equips = removeDupes(jetpack.read('./db/equips.json', 'json'))
const inventory = jetpack.read('./db/inventory.json', 'json')

const getRandomProvider = () => {
  return new HDWalletProvider(
    secrets.mnemonic,
    "https://thrumming-still-leaf.bsc.quiknode.pro/b2f8a5b1bd0809dbf061112e1786b4a8e53c9a83/" //"https://bsc.getblock.io/mainnet/?api_key=3f594a5f-d0ed-48ca-b0e7-a57d04f76332" //networks[Math.floor(Math.random() * networks.length)]
  )
}

const blocknativeApiKey = '58a45321-bf96-485c-ab9b-e0610e181d26'

let provider = getRandomProvider()
const web3 = new Web3(provider)

process
  .on("unhandledRejection", (reason, p) => {
    console.warn(reason, "Unhandled Rejection at Promise", p)
  })
  .on("uncaughtException", (err) => {
    console.warn(err, "Uncaught Exception thrown. Rotating provider")

    //provider = getRandomProvider()
    // run()
    process.exit(1)
  })

const saveConfig = () => {
  jetpack.write('./db/config.json', JSON.stringify(config, null, 2))
}

const saveEquips = () => {
  jetpack.write('./db/equips.json', JSON.stringify(equips, null, 2))
}

const saveInventory = () => {
  jetpack.write('./db/inventory.json', JSON.stringify(inventory, null, 2))
}

const saveTrades = () => {
  jetpack.write('./db/trades.json', JSON.stringify(trades, null, 2))
}

const saveCharacters = () => {
  jetpack.write('./db/characters.json', JSON.stringify(characters, null, 2))
}

const aggregateGuildMembers = async () => {
  const web3Provider = new ethers.providers.Web3Provider(library)
  web3Provider.pollingInterval = 15000
  const signer = web3Provider.getSigner()

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
  const web3Provider = new ethers.providers.Web3Provider(provider)
  web3Provider.pollingInterval = 15000
  const signer = web3Provider.getSigner()

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
        itemId: event.args.itemId
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
  const web3Provider = new ethers.providers.Web3Provider(provider)
  web3Provider.pollingInterval = 15000
  const signer = web3Provider.getSigner()

  const contract = new ethers.Contract(getAddress(contracts.barracks), Contract.abi, signer)

  contract.on('Equip', async (user, tokenId, itemId) => {
    const equip = {
      user,
      tokenId: tokenId.toString(),
      itemId
    }

    console.log(equip)
    equips.push(equip)

    saveEquips()
    saveConfig()
    updateGit()
  })
}

async function getAllMarketEvents() {
  config.trades.counter = characters[trades.length-1]?.id || 1

  const web3Provider = new ethers.providers.Web3Provider(getRandomProvider())
  web3Provider.pollingInterval = 15000
  const signer = web3Provider.getSigner()

  const Contract = ArcaneTraderV1Contract
  const contract = new ethers.Contract(getAddress(contracts.trader), Contract.abi, signer)
  const iface = new ethers.utils.Interface(Contract.abi);

  async function iterate(fromBlock, toBlock, processLog) {
    console.log(fromBlock, toBlock, fromBlock === toBlock)
    if (fromBlock === toBlock) return
  
    // event List(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
    // event Update(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
    // event Delist(address indexed seller, uint256 tokenId);
    // event Buy(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
    // event Recover(address indexed user, address indexed seller, uint256 tokenId);

    const events = [
      contract.filters['List(address,address,uint256,uint256)'](),
      contract.filters['Update(address,address,uint256,uint256)'](),
      contract.filters['Delist(address,uint256)'](),
      contract.filters['Buy(address,address,uint256,uint256)'](),
    ]
    
    for (const event of events) {
      const toBlock2 = (fromBlock + 5000) < toBlock ? fromBlock + 5000 : toBlock
  
      try {
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
        
        await iterate(toBlock2, toBlock, processLog)
      } catch(e) {
        console.log('error', e)
        console.log(fromBlock, toBlock)
        process.exit(1)
      }
    }
  }

  async function processLog(log, updateConfig = true) {
    const event = iface.parseLog(log)
    
    if (event.name === 'List') {
      const { seller, buyer, tokenId, price } = event.args

      let trade = trades.find(t => t.seller === seller && t.tokenId === tokenId.toString())

      if (!trade) {
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
      
      console.log('List', trade)
    }

    if (event.name === 'Update') {
      const { seller, buyer, tokenId, price } = event.args

      const trade = trades.find(t => t.seller === seller && t.tokenId === tokenId.toString())

      trade.buyer = buyer
      trade.price = toShort(price)
      trade.updatedAt = new Date().getTime()

      console.log('Update', trade)
    }

    if (event.name === 'Delist') {
      const { seller, buyer, tokenId, price } = event.args

      const trade = trades.find(t => t.seller === seller && t.tokenId === tokenId.toString())

      trade.status = "delisted"
      trade.updatedAt = new Date().getTime()

      console.log('Delist', trade)
    }

    if (event.name === 'Buy') {
      const { seller, buyer, tokenId, price } = event.args

      const trade = trades.find(t => t.seller === seller && t.tokenId === tokenId.toString())

      trade.status = "sold"
      trade.updatedAt = new Date().getTime()

      console.log('Buy', trade)
    }

    saveTrades()

    if (updateConfig) {
      config.trades.lastBlock = log.blockNumber
      saveConfig()
    }
  }

  const blockNumber = await web3.eth.getBlockNumber()
  await iterate(config.trades.lastBlock, blockNumber, processLog)

  config.trades.lastBlock = blockNumber

  console.log('Finished', config.trades.lastBlock)

  saveTrades()
  saveConfig()
  updateGit()
  // setTimeout(getAllMarketEvents, 2 * 60 * 1000) // Manually update every 5 mins
}

async function monitorMarketEvents() {
  config.trades.counter = characters[trades.length-1]?.id || 1

  // event List(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Update(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Delist(address indexed seller, uint256 tokenId);
  // event Buy(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Recover(address indexed user, address indexed seller, uint256 tokenId);

  const web3Provider = new ethers.providers.Web3Provider(getRandomProvider())
  web3Provider.pollingInterval = 15000
  const signer = web3Provider.getSigner()

  const Contract = ArcaneTraderV1Contract
  const contract = new ethers.Contract(getAddress(contracts.trader), Contract.abi, signer)

  contract.on('List', async (seller, buyer, tokenId, price) => {
    let trade = trades.find(t => t.seller === seller && t.tokenId === tokenId.toString())

    if (!trade) {
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

    console.log(trade)
    saveTrades()
    saveConfig()
    updateGit()
  })

  contract.on('Update', async (seller, buyer, tokenId, price) => {
    const trade = trades.find(t => t.seller === seller && t.tokenId === tokenId.toString())

    trade.buyer = buyer
    trade.price = toShort(price)
    trade.updatedAt = new Date().getTime()

    console.log(trade)
    saveTrades()
    saveConfig()
    updateGit()
  })

  contract.on('Delist', async (seller, tokenId) => {
    const trade = trades.find(t => t.seller === seller && t.tokenId === tokenId.toString())

    trade.status = "delisted"
    trade.updatedAt = new Date().getTime()

    console.log(trade)
    saveTrades()
    saveConfig()
    updateGit()
  })

  contract.on('Buy', async (seller, buyer, tokenId, price) => {
    const trade = trades.find(t => t.seller === seller && t.tokenId === tokenId.toString())

    trade.status = "sold"
    trade.updatedAt = new Date().getTime()

    console.log(trade)
    saveTrades()
    saveConfig()
    updateGit()
  })
}

async function monitorCharacterEvents() {
  config.characters.counter = characters[characters.length-1]?.id || 1

  const web3Provider = new ethers.providers.Web3Provider(getRandomProvider())
  web3Provider.pollingInterval = 15000
  const signer = web3Provider.getSigner()

  const Contract = ArcaneCharactersContract
  const contract = new ethers.Contract(getAddress(contracts.characters), Contract.abi, signer)

  contract.on('Transfer', async (from, to, tokenId) => {
    let character = characters.find(t => t.tokenId === tokenId.toString())

    if (!character) {
      character = {
        id: ++characterCounter
      }

      characters.push(character)
    }

    character.owner = to
    character.tokenId = tokenId.toString()

    console.log(character)
    saveCharacters()
    saveConfig()
    updateGit()
  })
}

async function run() {
  const accounts = await web3.eth.getAccounts()

  // monitorBarracksEvents()
  getAllMarketEvents()
  monitorMarketEvents()
  monitorCharacterEvents()
}

run()

// Force restart after 15 mins
setTimeout(() => {
  process.exit(1)
}, 15 * 60 * 1000)
