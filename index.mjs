import contracts from "./contracts.mjs"
import secrets from "./secrets.json"
import ethers from 'ethers'
import Web3 from "web3"
// import networks from "./networks.mjs"
import jetpack from 'fs-jetpack'
import HDWalletProvider from "@truffle/hdwallet-provider"
import { exec } from 'child_process'
import ArcaneTraderV1Contract from './contracts/ArcaneTraderV1.json'
import ArcaneCharactersContract from './contracts/ArcaneCharacters.json'

const networks = ["https://bsc-dataseed.binance.org/", "https://bsc-dataseed1.defibit.io/", "https://bsc-dataseed1.ninicoin.io/", "https://bsc-dataseed2.defibit.io/", "https://bsc-dataseed3.defibit.io/", "https://bsc-dataseed4.defibit.io/", "https://bsc-dataseed2.ninicoin.io/", "https://bsc-dataseed3.ninicoin.io/", "https://bsc-dataseed4.ninicoin.io/", "https://bsc-dataseed1.binance.org/", "https://bsc-dataseed2.binance.org/", "https://bsc-dataseed3.binance.org/", "https://bsc-dataseed4.binance.org/"]

const getRandomProvider = () => {
  return new HDWalletProvider(
    secrets.mnemonic,
    networks[Math.floor(Math.random() * networks.length)]
  )
}

const network = "mainnet";
let provider = getRandomProvider();
const web3 = new Web3(provider);

process
  .on("unhandledRejection", (reason, p) => {
    console.warn(reason, "Unhandled Rejection at Promise", p);
  })
  .on("uncaughtException", (err) => {
    console.warn(err, "Uncaught Exception thrown. Rotating provider");

    provider = getRandomProvider();
    // run();
    //process.exit(1);
  });


const gasPrice = 6;
let nonce;
let pending = false

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function round(num, precision) {
  const _precision = 10 ** precision
  return Math.ceil(num * _precision) / _precision
}


const toLong = (x) => ethers.utils.parseEther(x + '')
const toShort = (x) => round(parseFloat(ethers.utils.formatEther(x)), 4)


const getAddress = (address) => {
  const mainNetChainId = 56
  const chainId = process.env.REACT_APP_CHAIN_ID
  return address[chainId] ? address[chainId] : address[mainNetChainId]
}


const aggregateGuildMembers = async () => {
  const web3Provider = new ethers.providers.Web3Provider(library)
  web3Provider.pollingInterval = 15000
  const signer = web3Provider.getSigner()

  const charactersContract = new ethers.Contract(getAddress(contracts.characters), ArcaneCharactersContract.abi, signer)
  const iface = new ethers.utils.Interface(ArcaneCharactersContract.abi);

  async function iterate(fromBlock, toBlock, logs) {
    const event = charactersContract.filters['Transfer(address,address,uint256)']()
    
    const topic = ethers.utils.id("CharacterMint(address,uint256,uint8)");

    const lastBlock = (fromBlock + 5000) < toBlock ? fromBlock + 5000 : toBlock
    const filter = {
      address: getAddress(contracts.characters),
      fromBlock,
      toBlock: lastBlock,
      topics: event.topics
    }

    try {
      const logs2 = await web3Provider.getLogs(filter)
      if (lastBlock !== toBlock && logs2.length > 0) {
        console.log(logs)
        await wait(3000)
        return iterate(fromBlock+5000, toBlock, [...logs, ...logs2])
      }
    } catch(e) {
      console.log(fromBlock, toBlock, logs)
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
    return self.indexOf(value) === index;
  }
  console.log(airdropAddresses)
  const rows = airdropAddresses.filter(onlyUnique).map(a => [a, 40000/airdropAddresses.length])
  console.log(rows)
  const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  window.open(encodedUri);
}

async function getAllBarracksEvents() {
  const Contract = ArcaneBarracksV1Contract
  const web3Provider = new ethers.providers.Web3Provider(provider)
  web3Provider.pollingInterval = 15000
  const signer = web3Provider.getSigner()

  const charactersContract = new ethers.Contract(getAddress(contracts.barracks), Contract.abi, signer)
  const iface = new ethers.utils.Interface(Contract.abi);

  async function iterate(fromBlock, toBlock, processLog) {
    // event Equip(address indexed user, uint256 indexed tokenId, uint16 indexed itemId);
    // event Unequip(address indexed user, uint256 indexed tokenId, uint16 indexed itemId);
    // event ActionBurn(address indexed user, uint256 amount);
    // event ActionBonus(address indexed user, uint256 amount);
    // event ActionHiddenPool(address indexed user, uint256 amount);
    // event ActionFee(address indexed user, address indexed token, uint256 amount);
    const event = charactersContract.filters['Equip(address,uint256,uint16)']()
    
    const lastBlock = (fromBlock + 5000) < toBlock ? fromBlock + 5000 : toBlock
    const filter = {
      address: getAddress(contracts.barracks),
      fromBlock,
      toBlock: lastBlock,
      topics: event.topics
    }

    try {
      const logs = await web3Provider.getLogs(filter)
      if (lastBlock !== toBlock) {
        for(let i = 0; i < logs.length; i++) {
          processLog(logs[i])
        }

        await wait(3000)
        
        return iterate(fromBlock+5000, toBlock, processLog)
      }
    } catch(e) {
      console.log('error', e)
      console.log(fromBlock, toBlock)
      return iterate(fromBlock, toBlock, processLog)
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

    jetpack.write('./db/equips.json', JSON.stringify(equips, null, 2))

    exec('cd db && git add -A && git commit -m "build: Binzy doz it" && git push --set-upstream origin master', (err, stdout, stderr) => {
      // handle err, stdout & stderr
     });
  })
}

let tradeCounter = 1

function removeDupes(list) {
  const seen = {};
  return list.filter(function(item) {
      const k = item.seller + item.tokenId;
      return seen.hasOwnProperty(k) ? false : (seen[k] = true);
  })
}

const trades = removeDupes(jetpack.read('./db/trades.json', 'json'))
let lastBlock = 7496405

async function getAllTradeEvents() {
  tradeCounter = trades[trades.length-1].id

  const Contract = ArcaneTraderV1Contract
  provider = getRandomProvider();
  const web3Provider = new ethers.providers.Web3Provider(provider)
  web3Provider.pollingInterval = 15000
  const signer = web3Provider.getSigner()

  const contract = new ethers.Contract(getAddress(contracts.trader), Contract.abi, signer)
  const iface = new ethers.utils.Interface(Contract.abi);

  async function iterate(fromBlock, toBlock, processLog) {
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
    
    const toBlock2 = (fromBlock + 5000) < toBlock ? fromBlock + 5000 : toBlock

    for (const event of events) {
      try {
        const filter = {
          address: getAddress(contracts.trader),
          fromBlock,
          toBlock: toBlock2,
          topics: event.topics
        }
    
        const logs = await web3Provider.getLogs(filter)

        for(let i = 0; i < logs.length; i++) {
          processLog(logs[i])
        }
  
        if (toBlock2 !== toBlock) {
          await wait(10000)
          
          await iterate(toBlock2, toBlock, processLog)
        }
      } catch(e) {
        console.log('error', e)
        console.log(fromBlock, toBlock)
        // await iterate(fromBlock, toBlock, processLog)
      }
    }
  }

  async function processLog(log) {
    const event = iface.parseLog(log)
    // const block = await library.getBlock(log.blockNumber)
    
    if (event.name === 'List') {
      const { seller, buyer, tokenId, price } = event.args

      let trade = trades.find(t => t.seller === seller && t.tokenId === tokenId.toString())

      if (!trade) {
        trade = {
          id: ++tradeCounter,
          seller,
          buyer,
          tokenId: tokenId.toString(),
          price: toShort(price),
          status: "available",
          hotness: 0,
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime()
        }
        trades.push(trade)
      }
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
  }

  const blockNumber = await web3.eth.getBlockNumber()
  await iterate(lastBlock, blockNumber, processLog)

  jetpack.write('./db/trades.json', JSON.stringify(trades, null, 2))
  updateGit()

  lastBlock = blockNumber

  console.log('Finished', lastBlock)
  setTimeout(getAllTradeEvents, 2 * 60 * 1000) // Manually update every 5 mins
}

function updateGit() {
  exec('cd db && git add -A && git commit -m "build: Binzy doz it" && git push --set-upstream origin master', (err, stdout, stderr) => {
    // handle err, stdout & stderr
    console.log(err, stderr, stdout)
   });
}

async function monitorTraderEvents() {
  tradeCounter = trades[trades.length-1].id

  const Contract = ArcaneTraderV1Contract

  // event List(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Update(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Delist(address indexed seller, uint256 tokenId);
  // event Buy(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Recover(address indexed user, address indexed seller, uint256 tokenId);

  let contract 
  let web3Provider

  const monitor = () => {
    provider = getRandomProvider();

    // if (web3Provider) web3Provider.pollingInterval = 15000000

    web3Provider = new ethers.providers.Web3Provider(provider)
    web3Provider.pollingInterval = 15000
    const signer = web3Provider.getSigner()

    if (contract) {
      contract.off('List')
      contract.off('Update')
      contract.off('Delist')
      contract.off('Buy')
    }
  
    contract = new ethers.Contract(getAddress(contracts.trader), Contract.abi, signer)

    contract.on('List', async (seller, buyer, tokenId, price) => {
      const trade = {
        id: ++tradeCounter,
        seller,
        buyer,
        tokenId: tokenId.toString(),
        price: toShort(price),
        status: "available",
        hotness: 0,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime()
      }

      trades.push(trade)

      console.log(trade)
      jetpack.write('./db/trades.json', JSON.stringify(trades, null, 2))
      updateGit()
    })

    contract.on('Update', async (seller, buyer, tokenId, price) => {
      const trade = trades.find(t => t.seller === seller && t.tokenId === tokenId.toString())

      trade.buyer = buyer
      trade.price = toShort(price)
      trade.updatedAt = new Date().getTime()

      console.log(trade)
      jetpack.write('./db/trades.json', JSON.stringify(trades, null, 2))
      updateGit()
    })

    contract.on('Delist', async (seller, tokenId) => {
      const trade = trades.find(t => t.seller === seller && t.tokenId === tokenId.toString())

      trade.status = "delisted"
      trade.updatedAt = new Date().getTime()

      console.log(trade)
      jetpack.write('./db/trades.json', JSON.stringify(trades, null, 2))
      updateGit()
    })

    contract.on('Buy', async (seller, buyer, tokenId, price) => {
      const trade = trades.find(t => t.seller === seller && t.tokenId === tokenId.toString())

      trade.status = "sold"
      trade.updatedAt = new Date().getTime()

      console.log(trade)
      jetpack.write('./db/trades.json', JSON.stringify(trades, null, 2))
      updateGit()
    })

    // setTimeout(monitor, 15 * 60 * 1000)
  }

  monitor()
}


async function catchup() {
  // await getAllBarracksEvents()
  await getAllTradeEvents()
  getAllTradeEvents()
  // setInterval(getAllTradeEvents, 2 * 60 * 1000) // Manually update every 5 mins
  // await run();
}

async function run() {
  const accounts = await web3.eth.getAccounts();
  const account = accounts[3];

  // await monitorBarracksEvents()
  await monitorTraderEvents()


}

catchup();
