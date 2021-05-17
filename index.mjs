import contracts from "./contracts.mjs"
import ethers from 'ethers'
import Web3 from "web3"
import networks from "./networks.mjs"
import jetpack from 'fs-jetpack'
import { exec } from 'child_process'
import ArcaneBarracksV1Contract from './contracts/ArcaneBarracksV1.json'
import ArcaneCharactersContract from './contracts/ArcaneCharacters.json'

process
  .on("unhandledRejection", (reason, p) => {
    console.warn(reason, "Unhandled Rejection at Promise", p);
  })
  .on("uncaughtException", (err) => {
    console.warn(err, "Uncaught Exception thrown");
    //process.exit(1);
  });

const network = "mainnet";
const provider = networks[network].provider();
const web3 = new Web3(provider);

const gasPrice = 6;
let nonce;
let pending = false

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


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
  // const filter = charactersContract.filters.Transfer(getAddress(contracts.characters), null)

  // const logs = await charactersContract.queryFilter(filter, 6141000, "latest");

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

// 0x2c51b570b11da6c0852aadd059402e390a936b39
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

async function monitorTraderEvents() {
  const equips = jetpack.read('./db/equips.json', 'json')

  const Contract = ArcaneTraderV1Contract
  const web3Provider = new ethers.providers.Web3Provider(provider)
  web3Provider.pollingInterval = 15000
  const signer = web3Provider.getSigner()

  const contract = new ethers.Contract(getAddress(contracts.trader), Contract.abi, signer)

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

async function catchup() {
  // await getAllBarracksEvents()
  await run();
}

async function run() {
  const accounts = await web3.eth.getAccounts();
  const account = accounts[3];

  await monitorBarracksEvents()
}

catchup();
