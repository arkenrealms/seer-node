import * as dotenv from 'dotenv'

dotenv.config()

process.env.REACT_APP_PUBLIC_URL = "https://rune.game/"

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
import beautify from 'json-beautify'
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
import { stat } from 'fs'
// import * as Bridge from "./bridge.mjs"

const config = jetpack.read(path.resolve('./db/config.json'), 'json')
const app = jetpack.read(path.resolve('./db/app.json'), 'json')
const trades = removeDupes(jetpack.read(path.resolve('./db/trades.json'), 'json'))
const farms = jetpack.read(path.resolve('./db/farms.json'), 'json')
const runes = jetpack.read(path.resolve('./db/runes.json'), 'json')
const classes = jetpack.read(path.resolve('./db/classes.json'), 'json')
const guilds = jetpack.read(path.resolve('./db/guilds.json'), 'json')
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
const evolutionHistorical = jetpack.read(path.resolve('./db/evolution/historical.json'), 'json')
const evolutionServers = jetpack.read(path.resolve('./db/evolution/servers.json'), 'json')


console.log('STARTING...')

// const fetchPrice = async (id, vs = 'usd') => {
//   const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${vs}`)

//   return parseFloat((await response.json())[id][vs])
// }
// const fetchPrices = async () => {
  // const response = await fetch('https://api.coingecko.com/api/v3/coins/list')
  // prices = (await response.json())
// }

const getRandomProvider = () => {
  return new HDWalletProvider(
    secrets.mnemonic,
    "wss://thrumming-still-leaf.bsc.quiknode.pro/b2f8a5b1bd0809dbf061112e1786b4a8e53c9a83/" //"https://bsc.getblock.io/mainnet/?api_key=3f594a5f-d0ed-48ca-b0e7-a57d04f76332" //networks[Math.floor(Math.random() * networks.length)]
  )
}

// const blocknativeApiKey = '58a45321-bf96-485c-ab9b-e0610e181d26'

let provider
let web3
let web3Provider 
let signer
let arcaneItemsContract
let arcaneCharactersContract
let arcaneBarracksContract
let arcaneTraderContract
let arcaneCharacterFactoryContract
let arcaneProfileContract
let busdContract
let wbnbContract

const setupProvider = () => {
  console.log('Setting up provider')

  provider = getRandomProvider()
  web3 = new Web3(provider)

  web3Provider = new ethers.providers.Web3Provider(getRandomProvider(), "any")
  web3Provider.pollingInterval = 15000

  signer = web3Provider.getSigner()

  arcaneItemsContract = new ethers.Contract(getAddress(contracts.items), ArcaneItems.abi, signer)
  arcaneCharactersContract = new ethers.Contract(getAddress(contracts.characters), ArcaneCharacters.abi, signer)
  arcaneBarracksContract = new ethers.Contract(getAddress(contracts.barracks), ArcaneBarracksFacetV1.abi, signer)
  arcaneTraderContract = new ethers.Contract(getAddress(contracts.trader), ArcaneTraderV1.abi, signer)
  arcaneCharacterFactoryContract = new ethers.Contract(getAddress(contracts.characterFactory), ArcaneCharacterFactoryV3.abi, signer)
  arcaneProfileContract = new ethers.Contract(getAddress(contracts.profile), ArcaneProfile.abi, signer)
  busdContract = new ethers.Contract(getAddress(contracts.busd), BEP20Contract.abi, signer)
  wbnbContract = new ethers.Contract(getAddress(contracts.wbnb), BEP20Contract.abi, signer)

  config.trades.updating = false
  config.barracks.updating = false
  config.blacksmith.updating = false
  config.items.updating = false
  config.characters.updating = false
  config.test.updating = false
}

setupProvider()

setInterval(() => {
  // Something happened, lets restart the provider
  if (new Date().getTime() > config.trades.updatedTimestamp + 10 * 60 * 1000) {
    setupProvider()
  }
}, 15 * 60 * 1000)

// web3Provider.on("network", (newNetwork, oldNetwork) => {
  // When a Provider makes its initial connection, it emits a "network"
  // event with a null oldNetwork along with the newNetwork. So, if the
  // oldNetwork exists, it represents a changing network
  // process.exit()
// });

process
  .on("unhandledRejection", (reason, p) => {
    console.warn(reason, "Unhandled Rejection at Promise", p)
  })
  .on("uncaughtException", (err) => {
    console.warn(err, "Uncaught Exception thrown.")

    // process.exit(1)

    //provider = getRandomProvider()
    // run()
    // setTimeout(() => {
    //   process.exit(1)
    // }, 60 * 1000)
  })

const average = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length
const ordinalise = n => n+(n%10==1&&n%100!=11?'st':n%10==2&&n%100!=12?'nd':n%10==3&&n%100!=13?'rd':'th')
const commarise = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

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
      await processLog(logs[i], false)
    }

    // await wait(3 * 1000)
    
    if (updateConfig && toBlock2 > 0) {
      await updateConfig(toBlock2)
    }

    await iterateBlocks(name, address, toBlock2, toBlock, event, processLog, updateConfig)
  } catch(e) {
    console.log('error', e)
    console.log(name, address, fromBlock, toBlock, event)
    // process.exit(1)
  }
}
  
const saveConfig = async () => {
  config.updatedDate = (new Date()).toString()
  config.updatedTimestamp = new Date().getTime()
  jetpack.write(path.resolve('./db/config.json'), beautify(config, null, 2, 100), { atomic: true })
}

const saveTrades = async () => {
  jetpack.write(path.resolve('./db/trades.json'), beautify(removeDupes(trades), null, 2, 100), { atomic: true })
}

const saveTradesEvents = async () => {
  jetpack.write(path.resolve('./db/trades/events.json'), beautify(tradesEvents, null, 2, 100), { atomic: true })
}

const saveBarracksEvents = async () => {
  jetpack.write(path.resolve('./db/barracks/events.json'), beautify(barracksEvents, null, 2, 100), { atomic: true })
}

const saveCharactersEvents = async () => {
  jetpack.write(path.resolve('./db/characters/events.json'), beautify(charactersEvents, null, 2, 100), { atomic: true })
}

const saveItemsEvents = async () => {
  jetpack.write(path.resolve('./db/items/events.json'), beautify(itemsEvents, null, 2, 100), { atomic: true })
}

const saveFarms = async () => {
  jetpack.write(path.resolve('./db/farms.json'), beautify(farms, null, 2, 100), { atomic: true })
}

const saveGuilds = async () => {
  jetpack.write(path.resolve('./db/guilds.json'), beautify(guilds, null, 2, 100), { atomic: true })
}

const saveRunes = async () => {
  jetpack.write(path.resolve('./db/runes.json'), beautify(runes, null, 2, 100), { atomic: true })
}

const saveStats = async () => {
  jetpack.write(path.resolve('./db/stats.json'), beautify(stats, null, 2, 100), { atomic: true })
}

const saveHistorical = async () => {
  jetpack.write(path.resolve('./db/historical.json'), beautify(historical, null, 2, 100), { atomic: true })
}

const saveApp = async () => {
  jetpack.write(path.resolve('./db/app.json'), beautify(app, null, 2, 100), { atomic: true })
}

const updateLeaderboardByUser = async (user) => {
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

  jetpack.write(path.resolve(`./db/leaderboard.json`), beautify(leaderboard, null, 2), { atomic: true })
}

const loadCharacter = (characterId) => {
  return {
    id: characterId,
    ownersCount: 0,
    ...(jetpack.read(path.resolve(`./db/characters/${characterId}/overview.json`), 'json') || {}),
    owners: (jetpack.read(path.resolve(`./db/characters/${characterId}/owners.json`), 'json') || []),
  }
}

const saveCharacter = async (character) => {
  jetpack.write(path.resolve(`./db/characters/${character.id}/overview.json`), beautify({
    ...character,
    owners: undefined,
    ownersCount: character.owners.length,
  }, null, 2), { atomic: true })

  jetpack.write(path.resolve(`./db/characters/${character.id}/owners.json`), beautify(character.owners, null, 2), { atomic: true })
}

const saveCharacterOwner = async (character, characterData) => {
  if (!character.owners.find(o => o === characterData.owner)) {
    character.owners.push(characterData.owner)
    character.owners = character.owners.filter(o => o != characterData.from)
  }
  
  await saveCharacter(character)
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

const saveItem = async (item) => {
  jetpack.write(path.resolve(`./db/items/${item.id}/overview.json`), beautify({
    ...item,
    owners: undefined,
    market: undefined,
    tokens: undefined,
    perfectCount: item.tokens.filter(i => i.item.perfection === 1).length,
    ownersCount: item.owners.length,
    marketTradesPerfectCount: item.market.filter(i => i.item.perfection === 1).length,
    marketTradesListedCount: item.market.filter(i => i.status === 'listed').length,
    marketTradesSoldCount: item.market.filter(i => i.status === 'sold').length
  }, null, 2), { atomic: true })

  jetpack.write(path.resolve(`./db/items/${item.id}/owners.json`), beautify(item.owners, null, 2), { atomic: true })
  jetpack.write(path.resolve(`./db/items/${item.id}/market.json`), beautify(item.market, null, 2), { atomic: true })
  jetpack.write(path.resolve(`./db/items/${item.id}/tokens.json`), beautify(item.tokens, null, 2), { atomic: true })
}

const saveItemOwner = async (item, itemData) => {
  if (!item.owners.find(o => o === itemData.owner)) {
    item.owners.push(itemData.owner)
    item.owners = item.owners.filter(o => o != itemData.from)
  }

  if (!stats.items[item.id]) stats.items[item.id] = {}

  stats.items[item.id].total = (await arcaneItemsContract.itemCount(item.id)).toNumber()
  stats.items[item.id].burned = 0 //(await arcaneItemsContract.itemBurnCount(item.id)).toNumber()
  
  await saveItem(item)
}

const saveItemTrade = async (item, trade) => {
  const found = item.market.find(i => i.seller === trade.seller && i.buyer === trade.buyer && i.tokenId === trade.tokenId)

  if (found) {
    for (const key of Object.keys(trade)) {
      found[key] = trade[key]
    }
  } else {
    item.market.push(trade)
  }

  await saveItem(item)
}

const saveItemToken = async (item, token) => {
  const found = item.tokens.find(i => i.id === token.id)

  if (found) {
    for (const key of Object.keys(token)) {
      found[key] = token[key]
    }
  } else {
    item.tokens.push(token)
  }

  await saveItem(item)
}

const loadToken = (tokenId) => {
  return {
    id: tokenId,
    ownersCount: 0,
    marketTradesListedCount: 0,
    marketTradesSoldCount: 0,
    ...(jetpack.read(path.resolve(`./db/tokens/${tokenId}/overview.json`), 'json') || {}),
    transfers: (jetpack.read(path.resolve(`./db/tokens/${tokenId}/transfers.json`), 'json') || []),
    trades: (jetpack.read(path.resolve(`./db/tokens/${tokenId}/trades.json`), 'json') || []),
    meta: (jetpack.read(path.resolve(`./db/tokens/${tokenId}/meta.json`), 'json') || {})
  }
}

const updateTokenMeta = async (token) => {
  try {
    const item = decodeItem(token.id)

    item.icon = item.icon.replace('undefined', 'https://rune.game/')

    if (item.recipe) {
      item.recipe.requirement = item.recipe.requirement.map(r => ({...r, id: RuneNames[r.id]}))
    }

    item.branches[1].attributes.map(a => ({
      ...a,
      description: ItemAttributesById[a.id].description
    }))

    token.meta = {
      "description": Array.isArray(item.branches[1].description) ? item.branches[1].description[0] : item.branches[1].description,
      "home_url": "https://rune.game",
      "external_url": "https://rune.game/token/" + token.id,
      "image_url": item.icon,
      "language": "en-US",
      ...item,
      "type": ItemTypeToText[item.type],
      "slots": item.slots.map(s => ItemSlotToText[s])
    }

    delete token.meta.category
    delete token.meta.value
    delete token.meta.hotness
    delete token.meta.createdDate

    token.meta.attributes = token.meta.attributes.map(a => ({
      ...a,
      trait_type: a.description.replace('{value}% ', '').replace(': {value}', '').replace('{value} ', '')
    }))
  } catch(e) {
    
  }
}

const saveToken = async (token) => {
  updateTokenMeta(token)

  jetpack.write(path.resolve(`./db/tokens/${token.id}/overview.json`), beautify({
    ...token,
    transfers: undefined,
    trades: undefined,
    meta: undefined
  }, null, 2), { atomic: true })

  jetpack.write(path.resolve(`./db/tokens/${token.id}/transfers.json`), beautify(token.transfers, null, 2), { atomic: true })
  jetpack.write(path.resolve(`./db/tokens/${token.id}/trades.json`), beautify(token.trades, null, 2), { atomic: true })
  jetpack.write(path.resolve(`./db/tokens/${token.id}/meta.json`), beautify(token.meta, null, 2), { atomic: true })
}

const saveTokenTrade = async (token, trade) => {
  const found = token.trades.find(i => i.seller === trade.seller && i.buyer === trade.buyer && i.tokenId === trade.tokenId)

  if (found) {
    for (const key of Object.keys(trade)) {
      found[key] = trade[key]
    }
  } else {
    token.trades.push(trade)
  }

  await saveToken(token)
}

const saveTokenTransfer = async (token, itemData) => {
  const found = token.transfers.find(i => i.owner === itemData.owner && i.tokenId === itemData.tokenId)

  if (found) {
    for (const key of Object.keys(itemData)) {
      found[key] = itemData[key]
    }
  } else {
    token.transfers.push(itemData)
  }

  await saveToken(token)
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
    username: undefined,
    guildId: undefined,
    joinedGuildAt: undefined,
    isGuildMembershipActive: false,
    guildMembershipTokenId: null,
    ...(jetpack.read(path.resolve(`./db/users/${address}/overview.json`), 'json') || {}),
    achievements: (jetpack.read(path.resolve(`./db/users/${address}/achievements.json`), 'json') || []),
    characters: (jetpack.read(path.resolve(`./db/users/${address}/characters.json`), 'json') || []),
    evolution: (jetpack.read(path.resolve(`./db/users/${address}/evolution.json`), 'json') || {}),
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

const guildInfoMap = {
  1: {
    name: "The First Ones",
    description: `Formed after the discovery of a cache of hidden texts in an abandoned, secret Horadric meeting place. This group of scholars was brought together by Bin Zy.`,
    icon: 'https://rune.game/images/teams/the-first-ones.png',
    backgroundColor: '#fff',
    discord: {
      role: '862170863827025950',
      channel: '862153263804448769'
    }
  },
  2: {
    name: "The Archivists",
    description: `The Archivists are an order based in Westmarch. These brave souls wade into battle wielding tome and quill, armored not in ensorcelled plate or links of chain, but in the knowledge of generations past. These archivists fight not only for the future of humanity, but for mankind's past as well. The members of their honored fraternity are many, and their numbers grow every day.`,
    icon: 'https://rune.game/images/teams/the-first-ones.png',
    backgroundColor: '#fff',
    discord: {
      role: '862171000446779394',
      channel: '862153353264627732'
    }
  },
  3: {
    name: "Knights of Westmarch",
    description: `Pure at heart, during the Darkening of Tristrum, the knights closely followed the teachings of the Zakaram. The knights have since become a largely secular order, more focused on defending Westmarch from physical rather than spiritual harm. They are led by a knight commander.`,
    icon: 'https://rune.game/images/teams/knights-of-westmarch.png',
    backgroundColor: '#fff',
    discord: {
      role: '862171051450040320',
      channel: '862153403030700062'
    }
  },
  4: {
    name: "The Protectors",
    description: `After the destruction of the Worldstone, these survivors banded together to find and protect the Worldstone shards from falling into the hands of evil.`,
    icon: 'https://rune.game/images/teams/the-protectors.png',
    backgroundColor: '#fff',
    discord: {
      role: '',
      channel: ''
    }
  },
  5: {
    name: "The Destroyers",
    description: `After the destruction of the Worldstone, these dark souls serve Hell in the destruction of all living things.`,
    icon: 'https://rune.game/images/teams/the-destroyers.png',
    backgroundColor: '#fff',
    discord: {
      role: '',
      channel: ''
    }
  }
}

const loadGuild = (id) => {
  console.log('Loading guild', id)
  return {
    id,
    memberCount: 0,
    activeMemberCount: 0,
    points: 0,
    ...guildInfoMap[id],
    ...(jetpack.read(path.resolve(`./db/guilds/${id}/overview.json`), 'json') || {}),
    members: (jetpack.read(path.resolve(`./db/guilds/${id}/members.json`), 'json') || []),
    memberDetails: (jetpack.read(path.resolve(`./db/guilds/${id}/memberDetails.json`), 'json') || []),
  }
}

const addGuildMember = (guild, user) => {
  if (!guild.members.includes(user.address)) {
    guild.members.push(user.address)
  }
}

const saveGuild = async (guild) => {
  console.log('Saving guild', guild.name)
  updateAchievementsByGuild(guild)

  jetpack.write(path.resolve(`./db/guilds/${guild.id}/overview.json`), beautify({
    ...guild,
    memberCount: guild.members.length,
    activeMemberCount: guild.memberDetails.filter(m => m.achievementCount > 0).length,
    members: undefined,
  }, null, 2), { atomic: true })
  
  jetpack.write(path.resolve(`./db/guilds/${guild.id}/members.json`), beautify(guild.members, null, 2), { atomic: true })
  jetpack.write(path.resolve(`./db/guilds/${guild.id}/memberDetails.json`), beautify(guild.memberDetails, null, 2), { atomic: true })

  let g = guilds.find(g2 => g2.id === guild.id)

  if (!g) {
    g = {}

    guilds.push(g)
  }

  g.id = guild.id
  g.memberCount = guild.memberCount
  g.activeMemberCount = guild.activeMemberCount

}

const updateAchievementsByGuild = (guild) => {
  let points = 0

  for (const member of guild.members) {
    const user = loadUser(member)

    if (!user?.points || user.points === null) continue

    points += user.points
  }

  guild.points = points
}

const updateAchievementsByUser = async (user) => {
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
    if (user.evolution?.overall?.rounds > 0) addUserAchievement(user, 'BATTLE_RUNE_EVO')
  }
  if (!hasUserAchievement(user, 'MEGA_RUNE_EVO')) {
    if (user.evolution?.overall?.wins > 0) addUserAchievement(user, 'MEGA_RUNE_EVO')
  }
  if (!hasUserAchievement(user, 'DOMINATE_RUNE_EVO')) {
    if (user.evolution?.overall?.winStreak > 25) addUserAchievement(user, 'DOMINATE_RUNE_EVO')
  }
}

const updatePointsByUser = async (user) => {
  const achievements = user.achievements.map(a => achievementData.find(b => b.id === a))

  user.points = 0

  for(const achievement of achievements) {
    user.points += achievement.points
  }
}

const updateGuildByUser = async (user) => {
  if (user.joinedGuildAt === undefined) {
    const abi = [{
      "inputs": [
        {
          "internalType": "address",
          "name": "_userAddress",
          "type": "address"
        }
      ],
      "name": "getUserProfile",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }]

    const bscProvider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/')
    const contract = new ethers.Contract('0x2C51b570B11dA6c0852aADD059402E390a936B39', abi, bscProvider)

    try {
      const result = await contract.getUserProfile(user.address)
      user.guildId = ethers.BigNumber.from(result[2]).toNumber()
      user.joinedGuildAt = new Date().getTime()

      const guild = loadGuild(user.guildId)

      addGuildMember(guild, user)

      await saveGuild(guild)
    } catch (e) {
    }
  }
}

const saveUser = async (user) => {
  // console.log('Save user', user.address)

  await updateGuildByUser(user)
  await updatePointsByUser(user)

  jetpack.write(path.resolve(`./db/users/${user.address}/overview.json`), beautify({
    ...user,
    inventory: undefined,
    market: undefined,
    characters: undefined,
    achievements: undefined,
    evolution: undefined,
    craftedItemCount: user.inventory.items.filter(i => i.status === 'created').length,
    inventoryItemCount: user.inventory.items.filter(i => i.status === 'unequipped').length,
    equippedItemCount: user.inventory.items.filter(i => i.status === 'equipped').length,
    transferredOutCount: user.inventory.items.filter(i => i.status === 'transferred_out').length,
    transferredInCount: user.inventory.items.filter(i => i.status === 'transferred_in').length
  }, null, 2), { atomic: true })

  await updateLeaderboardByUser(user)
  await updateAchievementsByUser(user)

  jetpack.write(path.resolve(`./db/users/${user.address}/evolution.json`), beautify(user.evolution, null, 2), { atomic: true })
  jetpack.write(path.resolve(`./db/users/${user.address}/achievements.json`), beautify(user.achievements, null, 2), { atomic: true })
  jetpack.write(path.resolve(`./db/users/${user.address}/characters.json`), beautify(user.characters, null, 2), { atomic: true })
  jetpack.write(path.resolve(`./db/users/${user.address}/inventory.json`), beautify(user.inventory, null, 2), { atomic: true })
  jetpack.write(path.resolve(`./db/users/${user.address}/market.json`), beautify(user.market, null, 2), { atomic: true })
}

const saveUserItem = async (user, item) => {
  const savedItem = user.inventory.items.find(i => i.tokenId === item.tokenId)

  if (savedItem) {
    for (const key of Object.keys(item)) {
      savedItem[key] = item[key]
    }
  } else {
    user.inventory.items.push(item)
  }

  await saveUser(user)
}

const saveUserCharacter = async (user, character) => {
  // Wipe char list for old format (no block number)
  if (!user.characters.filter(i => i.blockNumber && i.blockNumber > 0).length) {
    user.characters = []
  }

  const savedItem = user.characters.find(i => i.tokenId === character.tokenId && i.blockNumber === character.blockNumber)

  if (savedItem) {
    // for (const key of Object.keys(character)) {
    //   savedItem[key] = character[key]
    // }
  } else {
    user.characters.push(character)
  }

  await saveUser(user)
}

const saveUserTrade = async (user, trade) => {
  const marketTrade = user.market.trades.find(i => i.tokenId === trade.tokenId)

  if (marketTrade) {
    for (const key of Object.keys(trade)) {
      marketTrade[key] = trade[key]
    }
  } else {
    user.market.trades.push(trade)
  }

  await saveUser(user)
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

  try {
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
        
        await saveUserItem(user, item)
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
        
        await saveUserItem(user, item)
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
      await iterateBlocks(`Barracks Events: ${event}`, getAddress(contracts.barracks), config.barracks.lastBlock[event], blockNumber, arcaneBarracksContract.filters[event](), processLog, async function (blockNumber2) {
        config.barracks.lastBlock[event] = blockNumber2
        // await saveConfig()
      })
    }

    console.log('Finished')
  } catch(e) {
    console.log(e)
  }

  config.barracks.updating = false
  config.barracks.updatedDate = (new Date()).toString()
  config.barracks.updatedTimestamp = new Date().getTime()

  // await saveBarracksEvents()
  // await saveConfig()

  setTimeout(getAllBarracksEvents, 15 * 60 * 1000)
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

function getHighestId(arr) {
  let highest = 0

  for (const item of arr) {
    if (item.id > highest) {
      highest = item.id
    }
  }

  return highest
}

async function getAllMarketEvents() {
  if (config.trades.updating) return

  console.log('[Market] Updating')

  config.trades.updating = true

  try {
    const iface = new ethers.utils.Interface(ArcaneTraderV1.abi);

    async function processLog(log, updateConfig = true) {
      const e = iface.parseLog(log)
      console.log(e.name, e.args.tokenId)
      if (e.name === 'List') {
        const { seller, buyer, tokenId, price } = e.args

        let trade = trades.find(t => t.seller.toLowerCase() === seller.toLowerCase() && t.tokenId === tokenId.toString())

        if (!trade || trade.blockNumber < log.blockNumber) {
          trade = {
            id: getHighestId(trades) + 1
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
          trade.item = { id: decodeItem(tokenId.toString()).id }
          // trade.item = decodeItem(trade.tokenId)

          trades.push(trade)

          console.log('Adding trade', trade)

          await saveUserTrade(loadUser(seller), trade)
          await saveTokenTrade(loadToken(trade.tokenId), trade)
          await saveItemTrade(loadItem(trade.item.id), trade)
          await saveItemToken(loadItem(trade.item.id), { id: trade.tokenId, item: trade.item })
          // await saveConfig()
          
          console.log('List', trade)
        }
      }

      if (e.name === 'Update') {
        const { seller, buyer, tokenId, price } = e.args

        const specificTrades = trades.find(t => t.seller.toLowerCase() === seller.toLowerCase() && t.tokenId === tokenId.toString() && t.status === 'available' && t.blockNumber < log.blockNumber)

        for (const specificTrade of specificTrades) {
          specificTrade.buyer = buyer
          specificTrade.price = toShort(price)
          specificTrade.updatedAt = new Date().getTime()
          specificTrade.blockNumber = log.blockNumber
          specificTrade.item = { id: decodeItem(tokenId.toString()).id }
          // specificTrade.item = decodeItem(specificTrade.tokenId)

          await saveUserTrade(loadUser(seller), specificTrade)
          await saveTokenTrade(loadToken(specificTrade.tokenId), specificTrade)
          await saveItemTrade(loadItem(specificTrade.item.id), specificTrade)
          await saveItemToken(loadItem(specificTrade.item.id), { id: specificTrade.tokenId, item: specificTrade.item })
          
          console.log('Update', specificTrade)
        }
      }

      if (e.name === 'Delist') {
        const { seller, buyer, tokenId, price } = e.args

        const specificTrades = trades.filter(t => t.seller.toLowerCase() === seller.toLowerCase() && t.tokenId === tokenId.toString() && t.status === 'available' && t.blockNumber < log.blockNumber)
        
        for (const specificTrade of specificTrades) {
          specificTrade.status = "delisted"
          specificTrade.updatedAt = new Date().getTime()
          specificTrade.blockNumber = log.blockNumber
          specificTrade.item = { id: decodeItem(tokenId.toString()).id }
          // specificTrade.item = decodeItem(specificTrade.tokenId)

          console.log('Delisting trade', specificTrade)

          await saveUserTrade(loadUser(seller), specificTrade)
          await saveTokenTrade(loadToken(specificTrade.tokenId), specificTrade)
          await saveItemTrade(loadItem(specificTrade.item.id), specificTrade)
          await saveItemToken(loadItem(specificTrade.item.id), { id: specificTrade.tokenId, item: specificTrade.item })
          
          console.log('Delist', specificTrade)
        }
      }

      if (e.name === 'Buy') {
        const { seller, buyer, tokenId, price } = e.args

        const specificTrades = trades.filter(t => t.seller.toLowerCase() === seller.toLowerCase() && t.tokenId === tokenId.toString() && t.status === 'available' && t.blockNumber < log.blockNumber)

        for (const specificTrade of specificTrades) {
          specificTrade.status = "sold"
          specificTrade.buyer = buyer
          specificTrade.updatedAt = new Date().getTime()
          specificTrade.blockNumber = log.blockNumber
          specificTrade.item = { id: decodeItem(tokenId.toString()).id }
          // specificTrade.item = decodeItem(specificTrade.tokenId)
    
          await saveUserTrade(loadUser(seller), specificTrade)
          await saveUserTrade(loadUser(buyer), specificTrade)
          await saveTokenTrade(loadToken(specificTrade.tokenId), specificTrade)
          await saveItemTrade(loadItem(specificTrade.item.id), specificTrade)
          await saveItemToken(loadItem(specificTrade.item.id), { id: specificTrade.tokenId, item: specificTrade.item })
          
          console.log('Buy', specificTrade)
        }
      }

      const e2 = tradesEvents.find(t => t.transactionHash === log.transactionHash)

      if (!e2) {
        tradesEvents.push({
          // id: ++config.trades.counter,
          ...log,
          ...e
        })
      }


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
      await iterateBlocks(`Market Events: ${event}`, getAddress(contracts.trader), config.trades.lastBlock[event], blockNumber, arcaneTraderContract.filters[event](), processLog, async function (blockNumber2) {
        config.trades.lastBlock[event] = blockNumber2
        // await saveConfig()
      })
    }

    console.log('Finished')
  } catch(e) {
    console.log(e)
  }

  config.trades.updating = false
  config.trades.updatedDate = (new Date()).toString()
  config.trades.updatedTimestamp = new Date().getTime()

  // await saveTrades()
  // await saveConfig()

  setTimeout(getAllMarketEvents, 2 * 60 * 1000)
}

async function monitorMarketEvents() {
  // event List(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Update(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Delist(address indexed seller, uint256 tokenId);
  // event Buy(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Recover(address indexed user, address indexed seller, uint256 tokenId);

  try {
    arcaneTraderContract.on('List', async () => {
      try {
        await getAllMarketEvents()
      } catch(e) {
        console.log(e)
      }
    })

    arcaneTraderContract.on('Update', async () => {
      try {
        await getAllMarketEvents()
      } catch(e) {
        console.log(e)
      }
    })

    arcaneTraderContract.on('Delist', async () => {
      try {
        await getAllMarketEvents()
      } catch(e) {
        console.log(e)
      }
    })

    arcaneTraderContract.on('Buy', async () => {
      try {
        await getAllMarketEvents()
      } catch(e) {
        console.log(e)
      }
    })
  } catch(e) {
    console.log(e)
  }
}

async function getAllCharacterEvents() {
  if (config.characters.updating) return

  console.log('[Characters] Updating')

  config.characters.updating = true

  try {
    const iface = new ethers.utils.Interface(ArcaneCharacters.abi)

    async function processLog(log, updateConfig = true) {
      const e = iface.parseLog(log)
      
      // console.log(e.name, e)

      if (e.name === 'Transfer') {
        const { from, to: userAddress, tokenId } = e.args

        const user = loadUser(userAddress)

        if (!user.characters.length) {
          console.log('New user: ' + userAddress)
        }

        const characterData = {
          owner: userAddress,
          from,
          status: from === '0x0000000000000000000000000000000000000000' ? "created" : 'transferred_in',
          tokenId: tokenId.toString(),
          transferredAt: new Date().getTime(),
          blockNumber: log.blockNumber,
          tx: log.transactionHash,
          id: await arcaneCharactersContract.getCharacterId(tokenId.toString())
        }

        await saveUserCharacter(user, characterData)
        // saveTokenTransfer(loadToken(characterData.tokenId), characterData)

        if (from !== '0x0000000000000000000000000000000000000000') {
          await saveUserCharacter(user, { ...characterData, status: 'transferred_out' })
        }

        await saveCharacterOwner(loadCharacter(characterData.id), characterData)
      }

      const e2 = charactersEvents.find(t => t.transactionHash === log.transactionHash)

      if (!e2) {
        charactersEvents.push({
          id: getHighestId(charactersEvents) + 1,
          ...log,
          ...e
        })
      }
    

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
      await iterateBlocks(`Characters Events: ${event}`, getAddress(contracts.characters), config.characters.lastBlock[event], blockNumber, arcaneCharactersContract.filters[event](), processLog, async function (blockNumber2) {
        config.characters.lastBlock[event] = blockNumber2
        // await saveConfig()
      })
    }
    console.log('Finished')
  } catch(e) {
    console.log(e)
  }

  config.characters.updating = false
  config.characters.updatedDate = (new Date()).toString()
  config.characters.updatedTimestamp = new Date().getTime()

  // await saveCharactersEvents()
  // await saveConfig()

  setTimeout(getAllCharacterEvents, 2 * 60 * 1000)
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

  try {
    const contract = new ethers.Contract(getAddress(contracts.items), ArcaneItems.abi, signer)
    const iface = new ethers.utils.Interface(ArcaneItems.abi)

    async function processLog(log, updateConfig = true) {
      try {
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

          await saveUserItem(user, itemData)
          await saveTokenTransfer(token, itemData)

          if (from !== '0x0000000000000000000000000000000000000000') {
            await saveUserItem(user, { ...itemData, status: 'transferred_out' })
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
      
        // await saveConfig()

        // if (updateConfig) {
        //   config.items.lastBlock = log.blockNumber
        //   saveConfig()
        // }
      } catch (ex) {
        console.log(ex)
        console.log("Error parsing log: ", log)
      }
    }

    const blockNumber = await web3.eth.getBlockNumber()

    const events = [
      'Transfer'
    ]
    
    for (const event of events) {
      await iterateBlocks(`Items Events: ${event}`, getAddress(contracts.items), config.items.lastBlock[event], blockNumber, contract.filters[event](), processLog, async function (blockNumber2) {
        config.items.lastBlock[event] = blockNumber2
        // await saveConfig()
      })
    }

    console.log('Finished')
  } catch(e) {
    console.log(e)
  }

  config.items.updating = false
  config.items.updatedDate = (new Date()).toString()
  config.items.updatedTimestamp = new Date().getTime()

  // await saveItemsEvents()
  // await saveConfig()

  setTimeout(getAllItemEvents, 2 * 60 * 1000)
}

async function monitorItemEvents() {
  arcaneItemsContract.on('Transfer', async () => {
    await getAllItemEvents()
  })
}

async function monitorGeneralStats() {
  try {
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
    
      for (let i = 1; i <= 30; i++) {
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
            // console.log(tokenSymbol, tokenPriceVsQuote.toNumber())orgToken
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

        stats.totalGuilds = guilds.length
        stats.totalClasses = Object.keys(classes).length
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
        try {
          const farm = farms[tokenSymbol]

          if (farm.isTokenOnly) {
            const symbol = tokenSymbol.toLowerCase()

            const tokenContract = new ethers.Contract(getAddress(contracts[symbol]), BEP20Contract.abi, signer)

            const raidHoldings = toShort((await tokenContract.balanceOf(getAddress(contracts.raid))).toString())
            const botHoldings = toShort((await tokenContract.balanceOf(getAddress(contracts.botAddress))).toString())
            const bot2Holdings = toShort((await tokenContract.balanceOf(getAddress(contracts.bot2Address))).toString())
            const bot3Holdings = toShort((await tokenContract.balanceOf(getAddress(contracts.bot3Address))).toString())
            const vaultHoldings = toShort((await tokenContract.balanceOf(getAddress(contracts.vaultAddress))).toString())
            const vault2Holdings = toShort((await tokenContract.balanceOf(getAddress(contracts.vault2Address))).toString())
            const vault3Holdings = toShort((await tokenContract.balanceOf(getAddress(contracts.vault3Address))).toString())
            const devHoldings = toShort((await tokenContract.balanceOf(getAddress(contracts.devAddress))).toString())
            const charityHoldings = toShort((await tokenContract.balanceOf(getAddress(contracts.charityAddress))).toString())
            const deployerHoldings = toShort((await tokenContract.balanceOf(getAddress(contracts.deployerAddress))).toString())
            const characterFactoryHoldings = toShort((await tokenContract.balanceOf(getAddress(contracts.characterFactory))).toString())
            const lockedLiquidityHoldings = toShort((await tokenContract.balanceOf(getAddress(contracts.lockedLiquidityAddress))).toString()) * 0.61
            const v2LiquidityHoldings = toShort((await tokenContract.balanceOf(getAddress(contracts.v2LiquidityAddress))).toString()) * 0.99
            const evolutionHoldings = toShort((await tokenContract.balanceOf(getAddress(contracts.evolutionAddress))).toString())
            // const cashHoldings = toShort((await tokenContract.balanceOf(getAddress(contracts.cashAddress))).toString())
            const vaultTotalHoldings = vaultHoldings + vault2Holdings + vault3Holdings
            const botTotalHoldings = botHoldings + bot2Holdings + bot3Holdings
            const orgCashHoldings = 0
            const orgTokenHoldings = vaultTotalHoldings + characterFactoryHoldings + botTotalHoldings + v2LiquidityHoldings + lockedLiquidityHoldings + evolutionHoldings
            const orgHoldings = vaultTotalHoldings + characterFactoryHoldings + botTotalHoldings + v2LiquidityHoldings + evolutionHoldings

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
            runes[symbol].holders.vaultTotal = vaultTotalHoldings
            runes[symbol].holders.characterFactory = characterFactoryHoldings
            runes[symbol].holders.dev = devHoldings
            runes[symbol].holders.charity = charityHoldings
            runes[symbol].holders.deployer = deployerHoldings
            runes[symbol].holders.bot = botHoldings
            runes[symbol].holders.bot2 = bot2Holdings
            runes[symbol].holders.bot3 = bot3Holdings
            runes[symbol].holders.botTotal = botTotalHoldings
            runes[symbol].holders.lockedLiquidity = lockedLiquidityHoldings
            runes[symbol].holders.v2Liquidity = v2LiquidityHoldings
            runes[symbol].holders.orgCash = orgCashHoldings
            runes[symbol].holders.orgToken = orgTokenHoldings
            runes[symbol].holders.org = orgHoldings
            runes[symbol].holders.evolution = evolutionHoldings

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
            if (!historical.bot2) historical.bot2 = {}
            if (!historical.bot2.holdings) historical.bot2.holdings = {}
            if (!historical.bot2.holdings[symbol]) historical.bot2.holdings[symbol] = []
            if (!historical.bot3) historical.bot3 = {}
            if (!historical.bot3.holdings) historical.bot3.holdings = {}
            if (!historical.bot3.holdings[symbol]) historical.bot3.holdings[symbol] = []
            if (!historical.botTotal) historical.botTotal = {}
            if (!historical.botTotal.holdings) historical.botTotal.holdings = {}
            if (!historical.botTotal.holdings[symbol]) historical.botTotal.holdings[symbol] = []
            if (!historical.vault) historical.vault = {}
            if (!historical.vault.holdings) historical.vault.holdings = {}
            if (!historical.vault.holdings[symbol]) historical.vault.holdings[symbol] = []
            if (!historical.vault2) historical.vault2 = {}
            if (!historical.vault2.holdings) historical.vault2.holdings = {}
            if (!historical.vault2.holdings[symbol]) historical.vault2.holdings[symbol] = []
            if (!historical.vault3) historical.vault3 = {}
            if (!historical.vault3.holdings) historical.vault3.holdings = {}
            if (!historical.vault3.holdings[symbol]) historical.vault3.holdings[symbol] = []
            if (!historical.vaultTotal) historical.vaultTotal = {}
            if (!historical.vaultTotal.holdings) historical.vaultTotal.holdings = {}
            if (!historical.vaultTotal.holdings[symbol]) historical.vaultTotal.holdings[symbol] = []
            if (!historical.characterFactory) historical.characterFactory = {}
            if (!historical.characterFactory.holdings) historical.characterFactory.holdings = {}
            if (!historical.characterFactory.holdings[symbol]) historical.characterFactory.holdings[symbol] = []
            if (!historical.dev) historical.dev = {}
            if (!historical.dev.holdings) historical.dev.holdings = {}
            if (!historical.dev.holdings[symbol]) historical.dev.holdings[symbol] = []
            if (!historical.charity) historical.charity = {}
            if (!historical.charity.holdings) historical.charity.holdings = {}
            if (!historical.charity.holdings[symbol]) historical.charity.holdings[symbol] = []
            if (!historical.deployer) historical.deployer = {}
            if (!historical.deployer.holdings) historical.deployer.holdings = {}
            if (!historical.deployer.holdings[symbol]) historical.deployer.holdings[symbol] = []
            if (!historical.lockedLiquidity) historical.lockedLiquidity = {}
            if (!historical.lockedLiquidity.holdings) historical.lockedLiquidity.holdings = {}
            if (!historical.lockedLiquidity.holdings[symbol]) historical.lockedLiquidity.holdings[symbol] = []
            if (!historical.v2Liquidity) historical.v2Liquidity = {}
            if (!historical.v2Liquidity.holdings) historical.v2Liquidity.holdings = {}
            if (!historical.v2Liquidity.holdings[symbol]) historical.v2Liquidity.holdings[symbol] = []
            if (!historical.org) historical.org = {}
            if (!historical.org.holdings) historical.org.holdings = {}
            if (!historical.org.holdings[symbol]) historical.org.holdings[symbol] = []
            if (!historical.orgCash) historical.orgCash = {}
            if (!historical.orgCash.holdings) historical.orgCash.holdings = {}
            if (!historical.orgCash.holdings[symbol]) historical.orgCash.holdings[symbol] = []
            if (!historical.orgToken) historical.orgToken = {}
            if (!historical.orgToken.holdings) historical.orgToken.holdings = {}
            if (!historical.orgToken.holdings[symbol]) historical.orgToken.holdings[symbol] = []
            if (!historical.evolution) historical.evolution = {}
            if (!historical.evolution.holdings) historical.evolution.holdings = {}
            if (!historical.evolution.holdings[symbol]) historical.evolution.holdings[symbol] = []

            const oldTime = (new Date(historical.totalSupply[symbol][historical.totalSupply[symbol].length-1]?.[0] || 0)).getTime()
            const newTime = (new Date()).getTime()
            const diff = newTime - oldTime

            if (diff / (1000 * 60 * 60 * 24) > 1) {
              historical.totalSupply[symbol].push([newTime, totalSupply])
              historical.circulatingSupply[symbol].push([newTime, circulatingSupply])
              historical.totalBurned[symbol].push([newTime, totalBurned])
              historical.raid.holdings[symbol].push([newTime, raidHoldings])
              historical.bot.holdings[symbol].push([newTime, botHoldings])
              historical.bot2.holdings[symbol].push([newTime, bot2Holdings])
              historical.bot3.holdings[symbol].push([newTime, bot3Holdings])
              historical.botTotal.holdings[symbol].push([newTime, botTotalHoldings])
              historical.vault.holdings[symbol].push([newTime, vaultHoldings])
              historical.vault2.holdings[symbol].push([newTime, vault2Holdings])
              historical.vault3.holdings[symbol].push([newTime, vault3Holdings])
              historical.vaultTotal.holdings[symbol].push([newTime, vaultTotalHoldings])
              historical.characterFactory.holdings[symbol].push([newTime, characterFactoryHoldings])
              historical.dev.holdings[symbol].push([newTime, devHoldings])
              historical.charity.holdings[symbol].push([newTime, charityHoldings])
              historical.deployer.holdings[symbol].push([newTime, deployerHoldings])
              historical.lockedLiquidity.holdings[symbol].push([newTime, lockedLiquidityHoldings])
              historical.v2Liquidity.holdings[symbol].push([newTime, v2LiquidityHoldings])
              historical.org.holdings[symbol].push([newTime, orgHoldings])
              historical.orgCash.holdings[symbol].push([newTime, orgCashHoldings])
              historical.orgToken.holdings[symbol].push([newTime, orgTokenHoldings])
              historical.evolution.holdings[symbol].push([newTime, evolutionHoldings])
            }
          }
        } catch(e) {
          console.log(e)
        }
      }
    
      runes.totals = {}
      runes.totals.raid = 0
      runes.totals.vault = 0
      runes.totals.vault2 = 0
      runes.totals.vault3 = 0
      runes.totals.vaultTotal = 0
      runes.totals.characterFactory = 0
      runes.totals.dev = 0
      runes.totals.charity = 0
      runes.totals.deployer = 0
      runes.totals.bot = 0
      runes.totals.bot2 = 0
      runes.totals.bot3 = 0
      runes.totals.botTotal = 0
      runes.totals.lockedLiquidity = 0
      runes.totals.v2Liquidity = 0
      runes.totals.org = 0
      runes.totals.orgCash = 0
      runes.totals.orgToken = 0
      runes.totals.evolution = 0

      for (const rune of Object.keys(runes)) {
        // if (rune === 'totals') continue
        if (runes[rune].holders) {
          runes.totals.raid += runes[rune].holders.raid * runes[rune].price
          runes.totals.vault += runes[rune].holders.vault * runes[rune].price
          runes.totals.vault2 += runes[rune].holders.vault2 * runes[rune].price
          runes.totals.vault3 += runes[rune].holders.vault3 * runes[rune].price
          runes.totals.vaultTotal += runes[rune].holders.vaultTotal * runes[rune].price
          runes.totals.characterFactory += runes[rune].holders.characterFactory * runes[rune].price
          runes.totals.dev += runes[rune].holders.dev * runes[rune].price
          runes.totals.charity += runes[rune].holders.charity * runes[rune].price
          runes.totals.deployer += runes[rune].holders.deployer * runes[rune].price
          runes.totals.bot += runes[rune].holders.bot * runes[rune].price
          runes.totals.bot2 += runes[rune].holders.bot2 * runes[rune].price
          runes.totals.bot3 += runes[rune].holders.bot3 * runes[rune].price
          runes.totals.botTotal += runes[rune].holders.botTotal * runes[rune].price
          runes.totals.lockedLiquidity += runes[rune].holders.lockedLiquidity * runes[rune].price
          runes.totals.v2Liquidity += runes[rune].holders.v2Liquidity * runes[rune].price
          runes.totals.org += runes[rune].holders.org * runes[rune].price
          runes.totals.orgToken += runes[rune].holders.orgToken * runes[rune].price
          runes.totals.orgCash += runes[rune].holders.orgCash

          // if (rune === 'BUSD' || rune === 'USDT' || rune === 'USDC') {
          // }
        }
      }

      if (!historical.total) historical.total = {}
      if (!historical.total.totals) historical.total.totals = {}


      for (const symbol of Object.keys(runes.totals)) {
        if (!historical.total.totals[symbol]) historical.total.totals[symbol] = []

        const oldTime = (new Date(historical.total.totals[symbol][historical.total.totals[symbol].length-1]?.[0] || 0)).getTime()
        const newTime = (new Date()).getTime()
        const diff = newTime - oldTime

        if (diff / (1000 * 60 * 60 * 24) > 1) {
          historical.total.totals[symbol].push([newTime, runes.totals[symbol]])
        }
      }
    }
    
    // await saveConfig()

    setTimeout(monitorGeneralStats, 2 * 60 * 1000)
  } catch (e) {
    console.log(e)
  }
}

function median(values) {
  if(values.length ===0) return 0;

  values.sort(function(a,b){
    return a-b;
  });

  var half = Math.floor(values.length / 2);

  if (values.length % 2)
    return values[half];

  return (values[half - 1] + values[half]) / 2.0;
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

    jetpack.write(path.resolve('./db/crafting/leaderboard.json'), beautify(data, null, 2), { atomic: true })
  }

  setTimeout(monitorCraftingStats, 2 * 60 * 1000)
}


function findPrice(symbol, timestamp) {
  for (let i = 1; i < historical.price[symbol].length; i++) {
    if (historical.price[symbol][i][0] > timestamp * 1000) {
      return historical.price[symbol][i][1]
    }
  }

  return stats.prices[symbol]
}

async function monitorEvolutionStats() {
  const playerRoundWinners = {}
  const playerRewardWinners = {}


  const leaderboards = {
    europe1: {},
    europe2: {},
    na1: {},
    sa1: {},
    asia1: {},
    asia2: {},
    asia3: {},
    asia4: {},
    oceanic1: {},
    overall: {}
  }

  // Update evolution leaderboard history
  try {
    console.log('Update evolution leaderboard history')

    const evolutionPlayers = jetpack.read(path.resolve(`./db/evolution/players.json`), 'json') || []

    const mapAddressToUsername = {}

    for (const server of evolutionServers) {
      if (server.status !== 'online') continue
      console.log('Server', server.key)

      try {
        let leaderboardHistory = jetpack.read(path.resolve(`./db/evolution/${server.key}/leaderboardHistory.json`), 'json') || []
        const rand = Math.floor(Math.random() * Math.floor(999999))
        const response = await fetch(`https://${server.endpoint}/data/leaderboardHistory.json?${rand}`)
      
        jetpack.write(path.resolve(`./db/evolution/${server.key}/leaderboardHistoryLiveLatest.json`), beautify(leaderboardHistory, null, 2), { atomic: true })

        let data = await response.json()
        let lastIndex = 0

        if (leaderboardHistory.length > 0) {
          const lastRoundItem = leaderboardHistory.slice(leaderboardHistory.length - 10).reverse().filter(r => r.filter(p => p.name.indexOf('Unknown') !== 0).length > 0)[0]

          // console.log('Last round', lastRoundItem)
          for (let i = 0; i < data.length; i++) {
            if (!data[i].length || !data[i][0]) continue
            // if (data[i][0].name.indexOf('Unknown') === 0) continue

            if (data[i].length === lastRoundItem.length && data[i][0].joinedAt === lastRoundItem[0].joinedAt && data[i][0].id === lastRoundItem[0].id && (typeof(data[i][0].position) === 'string' || !data[i][0].position ? data[i][0].position : data[i][0].position.x.toFixed(4) === lastRoundItem[0].position.x.toFixed(4) && data[i][0].position.y.toFixed(4) === lastRoundItem[0].position.y.toFixed(4))) { //  && data[i][0].position === lastRoundItem[0].position
              lastIndex = i
            }
          }
        }
        
        console.log('Starting from', lastIndex, server.key)

        if (lastIndex === 0 && leaderboardHistory.length > 0) {
          console.warn("Shouldnt start from 0", server.key)

          playerRoundWinners[server.key] = leaderboardHistory
        } else {
          const dupChecker = {}

          leaderboardHistory = leaderboardHistory.concat(data.slice(lastIndex+1)).filter(p => {
            if (p.length === 0) return
            if (p[0].joinedAt < 1625322027) return

            const key = (typeof(p[0].position) === 'string' || !p[0].position ? p[0].position : p[0].position.x.toFixed(4) + p[0].position.y.toFixed(4))+p[0].joinedAt
            if (dupChecker[key]) return

            dupChecker[key] = true

            return p
          })
      
          jetpack.write(path.resolve(`./db/evolution/${server.key}/leaderboardHistory.json`), beautify(leaderboardHistory, null, 2), { atomic: true })
      
          playerRoundWinners[server.key] = leaderboardHistory

          const recentPlayerAddresses = []
      
          for (let i = lastIndex; i < leaderboardHistory.length; i++) {
            for (let j = 0; j < leaderboardHistory[i].length; j++) {
              if (!leaderboardHistory[i][j].address) continue
              if (recentPlayerAddresses.includes(leaderboardHistory[i][j].address)) continue
              
              recentPlayerAddresses.push(leaderboardHistory[i][j].address)
            }
          }

          leaderboards[server.key] = {
            kills: [],
            deaths: [],
            powerups: [],
            evolves: [],
            points: [],
            rewards: [],
            orbs: [],
            revenges: [],
            rounds: [],
            wins: [],
            timeSpent: [],
            winRatio: [],
            killDeathRatio: [],
            roundPointRatio: [],
            averageLatency: []
          }

          const playerAddresses = recentPlayerAddresses // evolutionPlayers.map(p => p.address)

          for (const address of playerAddresses) {
            if (address.toLowerCase() === "0xc84ce216fef4EC8957bD0Fb966Bb3c3E2c938082".toLowerCase() ||
            address.toLowerCase() === "0xa987f487639920A3c2eFe58C8FBDedB96253ed9B".toLowerCase()) continue

            try {
              const user = loadUser(address)

              if (address === '0x9aAe5CBe5C124e1BE62BD83eD07367d57F8998E0') {
                console.log(user)
              }
              if (!evolutionPlayers.find(p => p.address === address)) {
                evolutionPlayers.push({
                  address
                })
              }

              if (!user.evolution) user.evolution = {}
              if (!user.evolution.hashes) user.evolution.hashes = []

              {
                let winStreak = 0
                let savedWinStreak = 0
                let rounds = 0
                let wins = 0
                let kills = 0
                let deaths = 0
                let powerups = 0
                let evolves = 0
                let points = 0
                let rewards = 0
                let orbs = 0
                let revenges = 0
                const latency = []
                const hashHistory = {}
                const hashHistory2 = {}

                for (const round of leaderboardHistory) {
                  if (round.length === 0) continue

                  const currentPlayer = round.find(r => r.address === address)
                  const wasConnected = currentPlayer ? (currentPlayer.latency === undefined || (currentPlayer.latency >= 10 && currentPlayer.latency <= 1000)) : false
                  const wasActive = currentPlayer ? (currentPlayer.powerups >= 100) : false
                  if (currentPlayer) {
                    mapAddressToUsername[address] = currentPlayer.name

                    if (!user.evolution.hashes.includes(currentPlayer.hash)) user.evolution.hashes.push(currentPlayer.hash)

                    if (wasConnected) { 
                      latency.push(currentPlayer.latency)
                    }

                    if (wasActive) {
                      kills += currentPlayer.kills || 0
                      deaths += currentPlayer.deaths || 0
                      powerups += currentPlayer.powerups || 0
                      evolves += currentPlayer.evolves || 0
                      points += currentPlayer.points || 0
                      rewards += currentPlayer.rewards || 0
                      orbs += currentPlayer.orbs || 0
                      revenges += (currentPlayer.log?.revenge ? currentPlayer.log.revenge : 0)
                      rounds++
                    }

                    if (currentPlayer.log?.kills) {
                      for (const hash of currentPlayer.log.kills) {
                        if (!hashHistory[hash]) hashHistory[hash] = 0

                        hashHistory[hash]++
                      }

                      for (const player of round) {
                        if (!hashHistory2[player.hash]) hashHistory2[player.hash] = 0
                        if (player.hash === currentPlayer.hash) continue
                        if (currentPlayer.log.kills.includes(player.hash)) continue

                        hashHistory2[player.hash]++
                      }
                    }
                  }

                  const winner = round.sort(((a, b) => b.points - a.points))[0]

                  if (winner.address === address) {
                    wins++
                    winStreak++
        
                    if (winStreak > savedWinStreak) savedWinStreak = winStreak
                  } else {
                    winStreak = 0
                  }
                }

                if (!user.evolution.servers) user.evolution.servers = {}
                if (!user.evolution.servers[server.key]) user.evolution.servers[server.key] = {}
                if (!user.evolution.servers[server.key].winStreak) user.evolution.servers[server.key].winStreak = 0
                if (!user.evolution.overall) user.evolution.overall = {}
                if (!user.evolution.overall.winStreak) user.evolution.overall.winStreak = 0

                // if (savedWinStreak > user.evolution.servers[server.key].winStreak) {
                  user.evolution.servers[server.key].winStreak = savedWinStreak
                // }

                user.evolution.servers[server.key].kills = kills
                user.evolution.servers[server.key].deaths = deaths
                user.evolution.servers[server.key].powerups = powerups
                user.evolution.servers[server.key].evolves = evolves
                user.evolution.servers[server.key].points = points
                user.evolution.servers[server.key].rewards = rewards
                user.evolution.servers[server.key].orbs = orbs
                user.evolution.servers[server.key].revenges = revenges
                user.evolution.servers[server.key].wins = wins
                user.evolution.servers[server.key].rounds = rounds
                user.evolution.servers[server.key].winRatio = rounds > 5 ? wins / rounds : 0
                user.evolution.servers[server.key].killDeathRatio = rounds >= 5 && deaths > 0 ? kills / deaths : kills
                user.evolution.servers[server.key].roundPointRatio = rounds >= 5 && rounds > 0 ? points / rounds : 0
                user.evolution.servers[server.key].averageLatency = rounds >= 5 ? average(latency) : 0
                user.evolution.servers[server.key].timeSpent = parseFloat((rounds * 5 / 60).toFixed(1))
                user.evolution.servers[server.key].hashHistory = hashHistory
                user.evolution.servers[server.key].hashHistory2 = hashHistory2

                for (const statKey of ['kills', 'deaths', 'powerups', 'evolves', 'points', 'rewards', 'orbs', 'revenges', 'rounds', 'wins', 'timeSpent', 'winRatio', 'killDeathRatio', 'roundPointRatio', 'averageLatency']) {
                  leaderboards[server.key][statKey].push({
                    name: mapAddressToUsername[user.address],
                    address: user.address,
                    count: user.evolution.servers[server.key][statKey]
                  })
                }
              }


              user.evolution.lastUpdated = (new Date()).getTime()
              
            if (address === '0x9aAe5CBe5C124e1BE62BD83eD07367d57F8998E0') {
              console.log(user)
            }
              await saveUser(user)
            } catch(e) {
              console.log(e)
            }
          }

          for (const statKey of ['kills', 'deaths', 'powerups', 'evolves', 'points', 'rewards', 'orbs', 'revenges', 'rounds', 'wins', 'timeSpent', 'winRatio', 'killDeathRatio', 'roundPointRatio']) {
            leaderboards[server.key][statKey] = leaderboards[server.key][statKey].filter(a => !!a.count).sort((a, b) => b.count - a.count)
          }

          for (const statKey of ['averageLatency']) {
            leaderboards[server.key][statKey] = leaderboards[server.key][statKey].filter(a => !!a.count).sort((a, b) => a.count - b.count)
          }

          for (const address of playerAddresses) {
            if (address.toLowerCase() === "0xc84ce216fef4EC8957bD0Fb966Bb3c3E2c938082".toLowerCase()) continue

            const user = loadUser(address)

            if (!user.evolution.servers[server.key]) user.evolution.servers[server.key] = {}

            user.evolution.servers[server.key].ranking = {}

            for (const statKey of ['kills', 'deaths', 'powerups', 'evolves', 'points', 'rewards', 'orbs', 'revenges', 'rounds', 'wins', 'timeSpent', 'winRatio', 'killDeathRatio', 'roundPointRatio', 'averageLatency']) {
              user.evolution.servers[server.key].ranking[statKey] = {
                position: leaderboards[server.key][statKey].findIndex(item => item.address == user.address) + 1,
                total: leaderboards[server.key][statKey].length
              }
            }

            await saveUser(user)
          }

          leaderboards[server.key].lastUpdated = (new Date()).getTime()

          jetpack.write(path.resolve(`./db/evolution/${server.key}/leaderboard2.json`), beautify(leaderboards[server.key], null, 2), { atomic: true })
        }
      } catch(e) {
        console.log(e)
      }
    }

    leaderboards.overall = {
      kills: [],
      deaths: [],
      powerups: [],
      evolves: [],
      points: [],
      rewards: [],
      orbs: [],
      revenges: [],
      rounds: [],
      wins: [],
      timeSpent: [],
      winRatio: [],
      killDeathRatio: [],
      roundPointRatio: [],
      averageLatency: []
    }

    for (const player of evolutionPlayers) {
      const user = loadUser(player.address)

      if (!user.evolution) user.evolution = {}
      if (!user.evolution.overall) user.evolution.overall = {}

      user.evolution.overall.kills = 0
      user.evolution.overall.deaths = 0
      user.evolution.overall.powerups = 0
      user.evolution.overall.evolves = 0
      user.evolution.overall.points = 0
      user.evolution.overall.rewards = 0
      user.evolution.overall.orbs = 0
      user.evolution.overall.revenges = 0
      user.evolution.overall.rounds = 0
      user.evolution.overall.wins = 0
      user.evolution.overall.timeSpent = 0

      let latency = []

      for (const key in user.evolution.servers) {
        const server = user.evolution.servers[key]
        user.evolution.overall.kills += server.kills || 0
        user.evolution.overall.deaths += server.deaths || 0
        user.evolution.overall.powerups += server.powerups || 0
        user.evolution.overall.evolves += server.evolves || 0
        user.evolution.overall.points += server.points || 0
        user.evolution.overall.rewards += server.rewards || 0
        user.evolution.overall.orbs += server.orbs || 0
        user.evolution.overall.revenges += server.revenges || 0
        user.evolution.overall.rounds += server.rounds || 0
        user.evolution.overall.wins += server.wins || 0
        user.evolution.overall.timeSpent += server.timeSpent || 0

        if (server.winStreak > user.evolution.overall.winStreak) {
          user.evolution.overall.winStreak = server.winStreak
        }
        if (server.averageLatency) {
          latency.push(server.averageLatency)
        }
      }

      user.evolution.overall.winRatio = user.evolution.overall.rounds >= 5 ? user.evolution.overall.wins / user.evolution.overall.rounds : 0
      user.evolution.overall.killDeathRatio = user.evolution.overall.rounds >= 5 && user.evolution.overall.deaths > 0 ? user.evolution.overall.kills / user.evolution.overall.deaths : user.evolution.overall.kills
      user.evolution.overall.roundPointRatio = user.evolution.overall.rounds >= 5 ? user.evolution.overall.points / user.evolution.overall.rounds : 0
      user.evolution.overall.averageLatency = latency.length > 0 ? average(latency) : 0

      for (const statKey of ['kills', 'deaths', 'powerups', 'evolves', 'points', 'rewards', 'orbs', 'revenges', 'rounds', 'wins', 'timeSpent', 'winRatio', 'killDeathRatio', 'roundPointRatio', 'averageLatency']) {
        if (user.evolution.overall[statKey] && user.evolution.overall[statKey] > 0 && user.evolution.overall[statKey] !== null) {
          leaderboards.overall[statKey].push({
            name: mapAddressToUsername[user.address],
            address: user.address,
            count: user.evolution.overall[statKey]
          })
        }
      }
    
      await saveUser(user)
    }

    // Sort descending
    for (const statKey of ['kills', 'deaths', 'powerups', 'evolves', 'points', 'rewards', 'orbs', 'revenges', 'rounds', 'wins', 'timeSpent', 'winRatio', 'killDeathRatio', 'roundPointRatio']) {
      leaderboards.overall[statKey] = leaderboards.overall[statKey].filter(a => !!a.count).sort((a, b) => b.count - a.count)
    }

    // Sort ascending
    for (const statKey of ['averageLatency']) {
      leaderboards.overall[statKey] = leaderboards.overall[statKey].filter(a => !!a.count).sort((a, b) => a.count - b.count)
    }

    for (const player of evolutionPlayers) {
      const user = loadUser(player.address)

      if (!user.evolution) user.evolution = {}
      if (!user.evolution.overall) user.evolution.overall = {}

      user.evolution.overall.ranking = {}

      for (const statKey of ['kills', 'deaths', 'powerups', 'evolves', 'points', 'rewards', 'orbs', 'revenges', 'rounds', 'wins', 'timeSpent', 'winRatio', 'killDeathRatio', 'roundPointRatio', 'averageLatency']) {
        user.evolution.overall.ranking[statKey] = {
          position: leaderboards.overall[statKey].findIndex(item => item.address == user.address) + 1,
          total: leaderboards.overall[statKey].length
        }
      }

      await saveUser(user)
    }

    jetpack.write(path.resolve(`./db/evolution/players.json`), beautify(evolutionPlayers, null, 2), { atomic: true })

      // const mapKeyToName = {
      //   kills: "Kills",
      //   deaths: "Deaths",
      //   powerups: "Powerups",
      //   evolves: "Evolves",
      //   points: "Points",
      //   rewards: "Rewards",
      //   orbs: "Orbs",
      //   revenges: "Revenges",
      //   rounds: "Rounds",
      //   wins: "Wins",
      //   timeSpent: "Time Spent",
      //   winRatio: "Win Ratio",
      //   killDeathRatio: "Kill Death Ratio",
      //   roundPointRatio: "Round Point Ratio",
      //   averageLatency: "Average Latency"
      // }

      // const reformattedLeaderboard = {}

      // for (const key in Object.keys(leaderboards.overall)) {
      //   const stat = leaderboards.overall[key]

      //   reformattedLeaderboard[key] = [{
      //     "name": mapKeyToName[key],
      //     "count": 10,
      //     "data": stat.map(s => ({
      //       username: mapAddressToUsername[s.address],
      //       count: s.count
      //     }))
      //   }]
      // }

    leaderboards.overall.lastUpdated = (new Date()).getTime()

    jetpack.write(path.resolve(`./db/evolution/leaderboard.json`), beautify(leaderboards.overall, null, 2), { atomic: true })
  } catch(e) {
    console.log(e)
  }

  // Update evolution hash map
  try {
    console.log('Update evolution hash map')

    for (const server of evolutionServers) {
      if (server.status !== 'online') continue
      if (!playerRoundWinners[server.key]) continue

      console.log('Server', server.key)

      try {
        const data = {
          toName: {},
          toHash: {}
        }

        for (const round of playerRoundWinners[server.key]) {
          if (server.status !== 'online') continue
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

        jetpack.write(path.resolve(`./db/evolution/${server.key}/hashmap.json`), beautify(data, null, 2), { atomic: true })
      } catch(e) {
        console.log(e)
      }
    }
  } catch(e) {
    console.log(e)
  }

  // Update evolution stats
  try {
    console.log('Update evolution stats')

    for (const server of evolutionServers) {
      if (server.status !== 'online') continue


      if (!playerRoundWinners[server.key]) continue
      try {
        const stats = {
          averagePlayerLatency: 0,
          averageWinnerLatency: 0,
          medianPlayerLatency: 0,
          medianWinnerLatency: 0
        }

        const playerLatencyList = []
        const winnerLatencyList = []

        for (const round of playerRoundWinners[server.key]) {
          if (server.status !== 'online') continue

          let winner
          for (const player of round) {
            if (!player.isDead && !player.isSpectating && player.latency && player.latency > 5 && player.latency < 600) {
              if (!winner || (player.winner && winner.winner && player.winner.points > winner.winner.points)) {
                winner = player
              }
            }
          }
          for (const player of round) {
            if (!player.isDead && !player.isSpectating && player.latency && player.latency > 5 && player.latency < 600 && winner !== player) {
              playerLatencyList.push(player.latency)
            }
          }

          if (winner) {
            winnerLatencyList.push(winner.latency)
          }
        }

        stats.medianPlayerLatency = median(playerLatencyList)
        stats.medianWinnerLatency = median(winnerLatencyList)
        stats.averagePlayerLatency = average(playerLatencyList)
        stats.averageWinnerLatency = average(winnerLatencyList)

        jetpack.write(path.resolve(`./db/evolution/${server.key}/stats.json`), beautify(stats, null, 2), { atomic: true })
      } catch(e) {
        console.log(e)
      }
    }
  } catch(e) {
    console.log(e)
  }

  // Update evolution reward history
  try {
    console.log('Update evolution reward history')
    for (const server of evolutionServers) {
      if (server.status !== 'online') continue

      console.log('Server', server.key)

      try {
        const rewardHistory = jetpack.read(path.resolve(`./db/evolution/${server.key}/rewardHistory.json`), 'json') || []
        const rand = Math.floor(Math.random() * Math.floor(999999))
        const response = await fetch(`https://${server.endpoint}/data/rewardHistory.json?${rand}`)
      
        const dupChecker = {}
        let data = await response.json()
        let lastIndex = 0

        if (!Array.isArray(data)) continue

        if (rewardHistory.length) {
          const lastRewardItem = rewardHistory[rewardHistory.length-1]

          for (let i = 0; i < data.length; i++) {
            if (data[i].symbol === lastRewardItem.symbol && data[i].quantity === lastRewardItem.quantity && data[i].winner.address === lastRewardItem.winner.address) { //  && data[i].pos.x === lastRewardItem.pos.x && data[i].pos.y === lastRewardItem.pos.y
              lastIndex = i
            }
          }
        }

        console.log('Starting from', lastIndex)

        if (lastIndex === 0 && rewardHistory.length) {
          console.warn("Shouldnt start from 0")

          playerRewardWinners[server.key] = rewardHistory
        } else {
          data = rewardHistory.concat(data.slice(lastIndex+1)).filter(p => {
            if (!p.winner.lastUpdate && dupChecker[p.tx]) return

            dupChecker[p.tx] = true

            return !!p.winner && p.winner.address && (!p.winner.lastUpdate || (p.winner.lastUpdate >= 1625322027 && p.winner.lastUpdate <= 1625903860))
          })

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

          jetpack.write(path.resolve(`./db/evolution/${server.key}/rewardHistory.json`), beautify(data, null, 2), { atomic: true })

          playerRewardWinners[server.key] = data
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
    for (const server of evolutionServers) {
      if (server.status !== 'online') continue

      console.log('Server', server.key)

      try {
        const rand = Math.floor(Math.random() * Math.floor(999999))
        const response = await fetch(`https://${server.endpoint}/data/rewards.json?${rand}`)
          
        const data = await response.json()

        jetpack.write(path.resolve(`./db/evolution/${server.key}/rewards.json`), beautify(data, null, 2), { atomic: true })
      } catch(e) {
        console.log(e)
      }
    }
  } catch(e) {
    console.log(e)
  }

  // Update evolution ban list
  try {
    console.log('Update evolution ban list')
    for (const server of evolutionServers) {
      if (server.status !== 'online') continue

      console.log('Server', server.key)

      try {
        const rand = Math.floor(Math.random() * Math.floor(999999))
        const response = await fetch(`https://${server.endpoint}/data/banList.json?${rand}`)
          
        const data = await response.json()

        jetpack.write(path.resolve(`./db/evolution/${server.key}/bans.json`), beautify(data, null, 2), { atomic: true })

        for (const banItem of data) {
          const user = loadUser(banItem)

          if (!user.evolution) user.evolution = {}
          if (!user.evolution.servers) user.evolution.servers = {}
          if (!user.evolution.servers[server.key]) user.evolution.servers[server.key] = {}

          user.evolution.servers[server.key].isBanned = true
          user.evolution.isBanned = true

          await saveUser(user)
        }
      } catch(e) {
        console.log(e)
      }
    }
  } catch(e) {
    console.log(e)
  }

  

  // Update evolution player rewards
  try {
    console.log('Update evolution player rewards')
    for (const server of evolutionServers) {
      if (server.status !== 'online') continue

      console.log('Server', server.key)

      try {
        const rand = Math.floor(Math.random() * Math.floor(999999))
        const response = await fetch(`https://${server.endpoint}/data/playerRewards.json?${rand}`)
      
        const data = await response.json()

        jetpack.write(path.resolve(`./db/evolution/${server.key}/playerRewards.json`), beautify(data, null, 2), { atomic: true })
      } catch(e) {
        console.log(e)
      }
    }
  } catch(e) {
    console.log(e)
  }

  

  // Update evolution player rewards
  try {
    console.log('Update evolution player rewards')
    for (const server of evolutionServers) {
      if (server.status !== 'online') continue

      console.log('Server', server.key)

      try {
        const rand = Math.floor(Math.random() * Math.floor(999999))
        const response = await fetch(`https://${server.endpoint}/data/log.json?${rand}`)
      
        const data = await response.json()

        jetpack.write(path.resolve(`./db/evolution/${server.key}/log.json`), beautify(data, null, 2), { atomic: true })
      } catch(e) {
        console.log(e)
      }
    }
  } catch(e) {
    console.log(e)
  }


  // Update evolution player rewards
  try {
    console.log('Update evolution player rewards')
    for (const server of evolutionServers) {
      if (server.status !== 'online') continue

      console.log('Server', server.key)

      try {
        const rand = Math.floor(Math.random() * Math.floor(999999))
        const response = await fetch(`https://${server.endpoint}/data/playerReports.json?${rand}`)
      
        const data = await response.json()

        jetpack.write(path.resolve(`./db/evolution/${server.key}/playerReports.json`), beautify(data, null, 2), { atomic: true })
      } catch(e) {
        console.log(e)
      }
    }
  } catch(e) {
    console.log(e)
  }

  // Update evolution leaderboard
  {
    for (const server of evolutionServers) {
      if (server.status !== 'online') continue
      if (!playerRoundWinners[server.key] || !Array.isArray(playerRewardWinners[server.key])) continue

      console.log('Server', server.key)

      try {
        const leaderboardHistory = jetpack.read(path.resolve(`./db/evolution/${server.key}/leaderboardHistory.json`), 'json') || []
        const roundsPlayed = {}

        for (const round of playerRoundWinners[server.key]) {
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
        
        const groupedWinPlayers = groupBySub(playerRoundWinners[server.key].map((leaderboard) => {
          let winner = leaderboard[0]

          for (const p of leaderboard) {
            if (p.points > winner.points) {
              winner = p
            }
          }

          if (!winner) return

          return { winner }
        }).filter(p => !!p), 'winner', 'address')

        const findUsername = (address) => {
          for (const lb of leaderboardHistory) {
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
        
        for (const reward of playerRewardWinners[server.key]) {
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

        for (const address of Object.keys(groupedRewardPlayers)) {
          if (groupedRewardPlayers[address].monetary > 0) {
            const user = loadUser(address)

            if (user?.evolution?.servers?.[server.key]) {
              user.evolution.servers[server.key].earnings = groupedRewardPlayers[address].monetary
  
              let earnings = 0
              for (const s of Object.keys(user.evolution.servers)) {
                if (Number.isFinite(user.evolution.servers[s].earnings)) earnings += user.evolution.servers[s].earnings
              }
  
              user.evolution.overall.earnings = earnings
    
              await saveUser(user)
            }
          }
        }

        const hist = jetpack.read(path.resolve(`./db/evolution/${server.key}/historical.json`), 'json') || {}

        if (!hist.earnings) hist.earnings = []

        const historicalEarnings = hist.earnings

        if (historicalEarnings?.length) {
          const oldTime = (new Date(evolutionEarningsDistributed[historicalEarnings.length-1]?.[0] || 0)).getTime()
          const newTime = (new Date()).getTime()
          const diff = newTime - oldTime
      
          if (diff / (1000 * 60 * 60 * 24) > 1) {
            historicalEarnings.push([newTime, evolutionEarningsDistributed])
          }
        } else {
          const newTime = (new Date()).getTime()
          historicalEarnings.push([newTime, evolutionEarningsDistributed])
        }

        jetpack.write(path.resolve(`./db/evolution/${server.key}/historical.json`), beautify(hist, null, 2), { atomic: true })

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

        jetpack.write(path.resolve(`./db/evolution/${server.key}/leaderboard.json`), beautify(data, null, 2), { atomic: true })
      } catch(e) {
        console.log(e)
      }
    }
  }


  setTimeout(monitorEvolutionStats, 5 * 60 * 1000)
}


function fancyTimeFormat(duration)
{   
    // Hours, minutes and seconds
    var hrs = ~~(duration / 3600);
    var mins = ~~((duration % 3600) / 60);
    var secs = ~~duration % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";

    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}
async function monitorEvolutionStats2() {

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
          server.gameMode = data.gameMode
          server.roundId = data.round.id
          server.roundStartedAt = data.round.startedAt
          server.timeLeft = ~~(5 * 60 - (((new Date().getTime()) / 1000 - data.round.startedAt)))
          server.timeLeftText = fancyTimeFormat(5 * 60 - (((new Date().getTime()) / 1000 - data.round.startedAt)))
          // server.totalLegitPlayers = data.totalLegitPlayers

          server.status = "online"
        } catch(e) {
          if ((e + '').toString().indexOf('invalid json response body') === -1) console.log(e)

          server.status = "offline"
          server.playerCount = 0
          server.speculatorCount = 0
          server.rewardItemAmount = 0
          server.rewardWinnerAmount = 0
        }

        const hist = jetpack.read(path.resolve(`./db/evolution/${server.key}/historical.json`), 'json') || {}

        if (!hist.playerCount) hist.playerCount = []

        const oldTime = (new Date(hist.playerCount[hist.playerCount.length-1]?.[0] || 0)).getTime()
        const newTime = (new Date()).getTime()
        const diff = newTime - oldTime
        if (diff / (1000 * 60 * 60 * 1) > 1) {
          hist.playerCount.push([newTime, server.playerCount])
        }

        jetpack.write(path.resolve(`./db/evolution/${server.key}/historical.json`), beautify(hist, null, 2), { atomic: true })

        playerCount += server.playerCount
      }

      jetpack.write(path.resolve('./db/evolution/servers.json'), beautify(evolutionServers, null, 2), { atomic: true })

      const oldTime = (new Date(evolutionHistorical.playerCount[evolutionHistorical.playerCount.length-1]?.[0] || 0)).getTime()
      const newTime = (new Date()).getTime()
      const diff = newTime - oldTime
      if (diff / (1000 * 60 * 60 * 1) > 1) {
        evolutionHistorical.playerCount.push([newTime, playerCount])
      }

      jetpack.write(path.resolve(`./db/evolution/historical.json`), beautify(evolutionHistorical, null, 2), { atomic: true })
    }
    {
      console.log('Update evolution historical 2')
    }
  } catch(e) {
    console.log(e)
  }

  // Update evolution info
  try {
    console.log('Update evolution info')
    for (const server of evolutionServers) {
      if (server.status !== 'online') continue
      try {
        const rand = Math.floor(Math.random() * Math.floor(999999))
        const response = await fetch(`https://${server.endpoint}/info?${rand}`)
      
        const data = await response.json()

        jetpack.write(path.resolve(`./db/evolution/${server.key}/info.json`), beautify(data, null, 2), { atomic: true })
      } catch(e) {
        console.log(e)
      }
    }
  } catch(e) {
    console.log(e)
  }

  setTimeout(monitorEvolutionStats2, 30 * 1000)
}

async function monitorCoordinator() {
  // Update coordinator refers
  try {
    console.log('Update coordinator refers')
    const rand = Math.floor(Math.random() * Math.floor(999999))
    const response = await fetch(`https://coordinator.rune.game/data/refers.json?${rand}`)

    const data = await response.json()

    jetpack.write(path.resolve(`./db/affiliate/refers.json`), beautify(data, null, 2), { atomic: true })
  } catch(e) {
    console.log(e)
  }

  setTimeout(monitorCoordinator, 2 * 60 * 1000)
}

async function monitorMeta() {
  console.log('Saving achievement data')
  jetpack.write(path.resolve('./db/achievements.json'), beautify(achievementData, null, 2), { atomic: true })

  console.log('Saving item data')
  jetpack.write(path.resolve('./db/items.json'), beautify(itemData, null, 2), { atomic: true })

  console.log('Saving item attribute data')
  jetpack.write(path.resolve('./db/itemAttributes.json'), beautify(ItemAttributes, null, 2), { atomic: true })

  console.log('Saving skill data')
  jetpack.write(path.resolve('./db/skills.json'), beautify(SkillNames, null, 2), { atomic: true })

  console.log('Saving class data')
  jetpack.write(path.resolve('./db/classes.json'), beautify(ClassNames, null, 2), { atomic: true })

  console.log('Saving item rarity data')
  jetpack.write(path.resolve('./db/itemRarity.json'), beautify(ItemRarity, null, 2), { atomic: true })

  console.log('Saving item type data')
  jetpack.write(path.resolve('./db/itemTypes.json'), beautify(ItemTypeToText, null, 2), { atomic: true })

  console.log('Saving item slot data')
  jetpack.write(path.resolve('./db/itemSlots.json'), beautify(ItemSlotToText, null, 2), { atomic: true })

  try {
    for (const item of itemData[ItemsMainCategoriesType.OTHER]) {
      item.icon = item.icon.replace('undefined', 'https://rune.game/')

      if (item.recipe) {
        item.recipe.requirement = item.recipe.requirement.map(r => ({...r, id: RuneNames[r.id]}))
      }

      item.branches[1].attributes.map(a => ({...a, description: ItemAttributesById[a.id].description }))

      const itemJson = {
        "description": Array.isArray(item.branches[1].description) ? item.branches[1].description[0] : item.branches[1].description,
        "home_url": "https://rune.game",
        "external_url": "https://rune.game/catalog/" + item.id,
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

      jetpack.write(path.resolve('./db/items/' + itemJson.id + '/meta.json'), beautify(itemJson, null, 2), { atomic: true })

      // const ipfs = ipfsClient.create({
      //   host: 'ipfs.rune.game',
      //   protocol: 'https',
      //   port: 443,
      //   apiPath: '/api/v0'
      // })

      // await ipfs.files.add('/items/999999.json', Buffer.from(beautify(itemJson, null, 2)))

      // const cid = await ipfs.add(
      //   { path: '/items/999999.json', content: beautify(itemJson, null, 2) }, 
      //   // { wrapWithDirectory: true }
      //   // cid: 'QmcZ774UPRJ3Qzuyg76ayc2AFM26ZfZQai8Ub5THKmwtbF', 
      // )

      // console.log(cid)

    }
  } catch (e) {
    console.log(e)
  }

  setTimeout(monitorMeta, 10 * 60 * 1000)
}


async function monitorGuildMemberDetails() {
  const transformProfileResponse = (profileResponse) => {
    const { 0: userId, 1: numberPoints, 2: teamId, 3: nftAddress, 4: tokenId, 5: isActive } = profileResponse

    return {
      userId: Number(userId),
      points: Number(numberPoints),
      teamId: Number(teamId),
      tokenId: Number(tokenId),
      nftAddress,
      isActive,
    }
  }

  console.log(guilds)
  for (const g of guilds) {
    console.log(g)
    const guild = loadGuild(g.id)

    guild.memberDetails = []

    for (const member of guild.members) {
      const user = loadUser(member)

      if (!user.username) {
        const usernameSearch = await ((await fetch(`https://rune-api.binzy.workers.dev/users/${user.address}`)).json())
  
        if (!!usernameSearch.message && usernameSearch.message === "No user exists" || !(usernameSearch.username)) {
          continue
        } else {
          user.username = usernameSearch.username
        }
      }

      const hasRegistered = (await arcaneProfileContract.hasRegistered(user.address))

      if (!hasRegistered) continue

      const profileResponse = await arcaneProfileContract.getUserProfile(user.address)
      const { userId, teamId, tokenId, nftAddress, isActive } = transformProfileResponse(profileResponse)

      if (teamId !== guild.id) continue

      user.isGuildMembershipActive = isActive
      user.guildMembershipTokenId = tokenId

      guild.memberDetails.push({
        address: user.address,
        username: user.username,
        points: user.points,
        achievementCount: user.achievements.length,
        isActive: user.isGuildMembershipActive,
        characterId: await arcaneCharactersContract.getCharacterId(tokenId)
      })

      console.log(`Sync guild ${guild.id} member ${guild.memberDetails.length} / ${guild.memberCount}`)

      await saveUser(user)
    }

    await saveGuild(guild)
  }

  setTimeout(monitorGuildMemberDetails, 10 * 60 * 1000)
}

async function onCommand() {

}

async function sendCommand() {

}


async function signCommand() {

}

async function isConnected() {

}

async function migrateTrades() {
  for (const trade of trades) {
    delete trade.item
  }

  await saveTrades()
}

async function monitorSaves() {
  try {
    await saveTrades()
    await saveTradesEvents()
    await saveItemsEvents()
    await saveCharactersEvents()
    await saveBarracksEvents()
    await saveFarms()
    await saveGuilds()
    await saveStats()
    await saveRunes()
    await saveHistorical()
    await saveApp()
    await saveConfig()
    // await updateGit()
  } catch(e) {
    console.log('Git error', e)
  }

  setTimeout(monitorSaves, 5 * 60 * 1000)
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

  // const token = loadToken('100300001010009000300020000000000000000000000000000000000000000000000000694')
  // saveToken(token)
  

  setTimeout(getAllItemEvents, 1 * 60 * 1000)
  setTimeout(getAllBarracksEvents, 1 * 60 * 1000)
  // setTimeout(getAllMarketEvents, 1 * 60 * 1000)
  setTimeout(getAllCharacterEvents, 1 * 60 * 1000)
  setTimeout(monitorGuildMemberDetails, 30 * 60 * 1000)
  setTimeout(monitorSaves, 5 * 60 * 1000)
  setTimeout(monitorEvolutionStats2, 10 * 1000)

  await getAllMarketEvents()
  await monitorItemEvents()
  await monitorBarracksEvents()
  await monitorMarketEvents()
  await monitorCharacterEvents()
  await monitorGeneralStats()
  await monitorCraftingStats()
  await monitorEvolutionStats()
  await monitorMeta()
  await monitorCoordinator()
}

run()

// Force restart after an hour
setTimeout(() => {
  process.exit(1)
}, 1 * 60 * 60 * 1000)
