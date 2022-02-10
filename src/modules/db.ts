import * as ethers from 'ethers'
import beautify from 'json-beautify'
import jetpack from 'fs-jetpack'
import path from 'path'
import { log, removeDupes } from '../util'
import { decodeItem } from '../util/item-decoder'
import { achievementData } from '../data/achievements'
import { itemData, ItemTypeToText, ItemSlotToText, RuneNames, ItemAttributesById, ItemAttributes, SkillNames, ClassNames, ItemRarity } from '../data/items'

export function initDb(app) {
  app.db = {
    app: jetpack.read(path.resolve('./db/app.json'), 'json'),
    trades: removeDupes(jetpack.read(path.resolve('./db/trades.json'), 'json')),
    farms: jetpack.read(path.resolve('./db/farms.json'), 'json'),
    runes: jetpack.read(path.resolve('./db/runes.json'), 'json'),
    classes: jetpack.read(path.resolve('./db/classes.json'), 'json'),
    guilds: jetpack.read(path.resolve('./db/guilds.json'), 'json'),
    stats: jetpack.read(path.resolve('./db/stats.json'), 'json'),
    historical: jetpack.read(path.resolve('./db/historical.json'), 'json'),
    barracksEvents: jetpack.read(path.resolve('./db/barracks/events.json'), 'json'),
    blacksmithEvents: jetpack.read(path.resolve('./db/blacksmith/events.json'), 'json'),
    raidEvents: jetpack.read(path.resolve('./db/raid/events.json'), 'json'),
    guildsEvents: jetpack.read(path.resolve('./db/guilds/events.json'), 'json'),
    itemsEvents: jetpack.read(path.resolve('./db/items/events.json'), 'json'),
    charactersEvents: jetpack.read(path.resolve('./db/characters/events.json'), 'json'),
    usersEvents: jetpack.read(path.resolve('./db/users/events.json'), 'json'),
    tradesEvents: jetpack.read(path.resolve('./db/trades/events.json'), 'json'),
    // evolutionLeaderboardHistory: jetpack.read(path.resolve('./db/evolution/leaderboardHistory.json'), 'json'),
    // evolutionRewardHistory: jetpack.read(path.resolve('./db/evolution/rewardHistory.json'), 'json'),
    evolutionHistorical: jetpack.read(path.resolve('./db/evolution/historical.json'), 'json'),
    evolutionRealms: jetpack.read(path.resolve('./db/evolution/realms.json'), 'json') || [],
    evolutionServers: jetpack.read(path.resolve('./db/evolution/servers.json'), 'json'),
    evolutionConfig: jetpack.read(path.resolve('./db/evolution/config.json'), 'json') || {
      "rewardItemAmountPerLegitPlayer": 0.001,
      "rewardItemAmountMax": 0.02,
      "rewardWinnerAmountPerLegitPlayer": 0.003,
      "rewardWinnerAmountMax": 0.04,
      "rewardItemAmount": 0.02,
      "rewardWinnerAmount": 0.04
    },
    evolution: {
      playerCount: 0,
      banList: [],
      modList: ['0xDfA8f768d82D719DC68E12B199090bDc3691fFc7']
    },
    infinite: {
      banList: [],
      modList: ['0xDfA8f768d82D719DC68E12B199090bDc3691fFc7']
    },
    sanctuary: {
      banList: [],
      modList: []
    },
    guardians: {
      banList: [],
      modList: []
    },
    raid: {
      banList: [],
      modList: ['0xDfA8f768d82D719DC68E12B199090bDc3691fFc7']
    }
  }

  if (process.env.RUNE_ENV === 'local') {
    app.db.evolutionRealms = [
      {
        "key": "local1",
        "name": "Local",
        "regionId": 1,
        "playerCount": 0,
        "speculatorCount": 0,
        "version": "1.0.0",
        "endpoint": "http://localhost:3006",
        "games": [],
        "status": "online",
        "rewardItemAmount": 0,
        "rewardWinnerAmount": 0
      }
    ]
  }

  app.db.saveConfig = async () => {
    log('Saving: config')
    app.config.updatedDate = (new Date()).toString()
    app.config.updatedTimestamp = new Date().getTime()
    jetpack.write(path.resolve('./db/config.json'), beautify(app.config, null, 2, 100), { atomic: true })
  }

  app.db.saveTrades = async () => {
    log('Saving: trades')
    jetpack.write(path.resolve('./db/trades.json'), beautify(removeDupes(app.db.trades), null, 2, 100), { atomic: true })
  }

  app.db.saveTradesEvents = async () => {
    log('Saving: tradesEvents')
    jetpack.write(path.resolve('./db/trades/events.json'), beautify(app.db.tradesEvents, null, 2, 100), { atomic: true })
  }

  app.db.saveBarracksEvents = async () => {
    log('Saving: barracksEvents')
    jetpack.write(path.resolve('./db/barracks/events.json'), beautify(app.db.barracksEvents, null, 2, 100), { atomic: true })
  }

  app.db.saveCharactersEvents = async () => {
    log('Saving: charactersEvent')
    jetpack.write(path.resolve('./db/characters/events.json'), beautify(app.db.charactersEvents, null, 2, 100), { atomic: true })
  }

  app.db.saveItemsEvents = async () => {
    log('Saving: itemsEvents')
    jetpack.write(path.resolve('./db/items/events.json'), beautify(app.db.itemsEvents, null, 2, 100), { atomic: true })
  }

  app.db.saveFarms = async () => {
    log('Saving: farms')
    jetpack.write(path.resolve('./db/farms.json'), beautify(app.db.farms, null, 2, 100), { atomic: true })
  }

  app.db.saveGuilds = async () => {
    log('Saving: guilds')
    jetpack.write(path.resolve('./db/guilds.json'), beautify(app.db.guilds, null, 2, 100), { atomic: true })
  }

  app.db.saveRunes = async () => {
    log('Saving: runes')
    jetpack.write(path.resolve('./db/runes.json'), beautify(app.db.runes, null, 2, 100), { atomic: true })
  }

  app.db.saveStats = async () => {
    log('Saving: stats')
    jetpack.write(path.resolve('./db/stats.json'), beautify(app.db.stats, null, 2, 100), { atomic: true })
  }

  app.db.saveHistorical = async () => {
    log('Saving: historical')
    jetpack.write(path.resolve('./db/historical.json'), beautify(app.db.historical, null, 2, 100), { atomic: true })
  }

  app.db.saveApp = async () => {
    log('Saving: app')
    jetpack.write(path.resolve('./db/app.json'), beautify(app, null, 2, 100), { atomic: true })
  }

  app.db.updateLeaderboardByUser = async (user) => {
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

  app.db.loadCharacter = (characterId) => {
    return {
      id: characterId,
      ownersCount: 0,
      ...(jetpack.read(path.resolve(`./db/characters/${characterId}/overview.json`), 'json') || {}),
      owners: (jetpack.read(path.resolve(`./db/characters/${characterId}/owners.json`), 'json') || []),
    }
  }

  app.db.saveCharacter = async (character) => {
    jetpack.write(path.resolve(`./db/characters/${character.id}/overview.json`), beautify({
      ...character,
      owners: undefined,
      ownersCount: character.owners.length,
    }, null, 2), { atomic: true })

    jetpack.write(path.resolve(`./db/characters/${character.id}/owners.json`), beautify(character.owners, null, 2), { atomic: true })
  }

  app.db.saveCharacterOwner = async (character, characterData) => {
    if (!character.owners.find(o => o === characterData.owner)) {
      character.owners.push(characterData.owner)
      character.owners = character.owners.filter(o => o != characterData.from)
    }
    
    await app.db.saveCharacter(character)
  }

  app.db.loadItem = (itemId) => {
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

  app.db.saveItem = async (item) => {
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

  app.db.saveItemOwner = async (item, itemData) => {
    if (!item.owners.find(o => o === itemData.owner)) {
      item.owners.push(itemData.owner)
      item.owners = item.owners.filter(o => o != itemData.from)
    }

    if (!app.db.stats.items[item.id]) app.db.stats.items[item.id] = {}

    app.db.stats.items[item.id].total = (await app.contracts.items.itemCount(item.id)).toNumber()
    app.db.stats.items[item.id].burned = 0 //(await items.itemBurnCount(item.id)).toNumber()
    
    await app.db.saveItem(item)
  }

  app.db.saveItemTrade = async (item, trade) => {
    const found = item.market.find(i => i.seller === trade.seller && i.buyer === trade.buyer && i.tokenId === trade.tokenId)

    if (found) {
      for (const key of Object.keys(trade)) {
        found[key] = trade[key]
      }
    } else {
      item.market.push(trade)
    }

    await app.db.saveItem(item)
  }

  app.db.saveItemToken = async (item, token) => {
    const found = item.tokens.find(i => i.id === token.id)

    if (found) {
      for (const key of Object.keys(token)) {
        found[key] = token[key]
      }
    } else {
      item.tokens.push(token)
    }

    await app.db.saveItem(item)
  }

  app.db.loadToken = (tokenId) => {
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

  app.db.updateTokenMeta = async (token) => {
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

  app.db.saveToken = async (token) => {
    app.db.updateTokenMeta(token)

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

  app.db.saveTokenTrade = async (token, trade) => {
    const found = token.trades.find(i => i.seller === trade.seller && i.buyer === trade.buyer && i.tokenId === trade.tokenId)

    if (found) {
      for (const key of Object.keys(trade)) {
        found[key] = trade[key]
      }
    } else {
      token.trades.push(trade)
    }

    await app.db.saveToken(token)
  }

  app.db.saveTokenTransfer = async (token, itemData) => {
    const found = token.transfers.find(i => i.owner === itemData.owner && i.tokenId === itemData.tokenId)

    if (found) {
      for (const key of Object.keys(itemData)) {
        found[key] = itemData[key]
      }
    } else {
      token.transfers.push(itemData)
    }

    await app.db.saveToken(token)
  }

  app.db.loadUser = (address) => {
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
      rewardHistory: [],
      rewards: {
        runes: {},
        items: {}
      },
      lifetimeRewards: {
        runes: {},
        items: {}
      },
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

  app.db.loadGuild = (id) => {
    log('Loading guild', id)
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

  app.db.addGuildMember = (guild, user) => {
    if (!guild.members.includes(user.address)) {
      guild.members.push(user.address)
    }
  }

  app.db.saveGuild = async (guild) => {
    log('Saving guild', guild.name)
    app.db.updateAchievementsByGuild(guild)

    jetpack.write(path.resolve(`./db/guilds/${guild.id}/overview.json`), beautify({
      ...guild,
      memberCount: guild.members.length,
      activeMemberCount: guild.memberDetails.filter(m => m.achievementCount > 0).length,
      members: undefined,
    }, null, 2), { atomic: true })
    
    jetpack.write(path.resolve(`./db/guilds/${guild.id}/members.json`), beautify(guild.members, null, 2), { atomic: true })
    jetpack.write(path.resolve(`./db/guilds/${guild.id}/memberDetails.json`), beautify(guild.memberDetails, null, 2), { atomic: true })

    let g = app.db.guilds.find(g2 => g2.id === guild.id)

    if (!g) {
      g = {}

      app.db.guilds.push(g)
    }

    g.id = guild.id
    g.memberCount = guild.memberCount
    g.activeMemberCount = guild.activeMemberCount

  }

  app.db.updateAchievementsByGuild = (guild) => {
    let points = 0

    for (const member of guild.members) {
      const user = app.db.loadUser(member)

      if (!user?.points || user.points === null) continue

      points += user.points
    }

    guild.points = points
  }

  app.db.updateAchievementsByUser = async (user) => {
    if (!app.db.hasUserAchievement(user, 'CRAFT_1') && user.craftedItemCount >= 1) {
      app.db.addUserAchievement(user, 'CRAFT_1')
    }
    if (!app.db.hasUserAchievement(user, 'CRAFT_10') && user.craftedItemCount >= 10) {
      app.db.addUserAchievement(user, 'CRAFT_10')
    }
    if (!app.db.hasUserAchievement(user, 'CRAFT_100') && user.craftedItemCount >= 100) {
      app.db.addUserAchievement(user, 'CRAFT_100')
    }
    if (!app.db.hasUserAchievement(user, 'CRAFT_1000') && user.craftedItemCount >= 1000) {
      app.db.addUserAchievement(user, 'CRAFT_1000')
    }
    if (!app.db.hasUserAchievement(user, 'ACQUIRED_RUNE') && user.holdings?.rune >= 1) {
      app.db.addUserAchievement(user, 'ACQUIRED_RUNE')
    }
    if (!app.db.hasUserAchievement(user, 'BATTLE_RUNE_EVO')) {
      if (user.evolution?.overall?.rounds > 0) app.db.addUserAchievement(user, 'BATTLE_RUNE_EVO')
    }
    if (!app.db.hasUserAchievement(user, 'MEGA_RUNE_EVO')) {
      if (user.evolution?.overall?.wins > 0) app.db.addUserAchievement(user, 'MEGA_RUNE_EVO')
    }
    if (!app.db.hasUserAchievement(user, 'DOMINATE_RUNE_EVO')) {
      if (user.evolution?.overall?.winStreak > 25) app.db.addUserAchievement(user, 'DOMINATE_RUNE_EVO')
    }
  }

  app.db.updatePointsByUser = (user) => {
    const achievements = user.achievements.map(a => achievementData.find(b => b.id === a))

    user.points = 0

    for(const achievement of achievements) {
      user.points += achievement.points
    }
  }

  app.db.updateGuildByUser = async (user) => {
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

        const guild = app.db.loadGuild(user.guildId)

        app.db.addGuildMember(guild, user)

        await app.db.saveGuild(guild)
      } catch (e) {
      }
    }
  }

  app.db.saveUser = async (user) => {
    // log('Save user', user.address, user)

    // await app.db.updateGuildByUser(user)
    app.db.updatePointsByUser(user)

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

    // await app.db.updateLeaderboardByUser(user)
    await app.db.updateAchievementsByUser(user)

    jetpack.write(path.resolve(`./db/users/${user.address}/evolution.json`), beautify(user.evolution, null, 2), { atomic: true })
    jetpack.write(path.resolve(`./db/users/${user.address}/achievements.json`), beautify(user.achievements, null, 2), { atomic: true })
    jetpack.write(path.resolve(`./db/users/${user.address}/characters.json`), beautify(user.characters, null, 2), { atomic: true })
    jetpack.write(path.resolve(`./db/users/${user.address}/inventory.json`), beautify(user.inventory, null, 2), { atomic: true })
    jetpack.write(path.resolve(`./db/users/${user.address}/market.json`), beautify(user.market, null, 2), { atomic: true })
  }

  app.db.saveUserItem = async (user, item) => {
    const savedItem = user.inventory.items.find(i => i.tokenId === item.tokenId)

    if (savedItem) {
      for (const key of Object.keys(item)) {
        savedItem[key] = item[key]
      }
    } else {
      user.inventory.items.push(item)
    }

    await app.db.saveUser(user)
  }

  app.db.saveUserCharacter = async (user, character) => {
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

    await app.db.saveUser(user)
  }

  app.db.saveUserTrade = async (user, trade) => {
    const marketTrade = user.market.trades.find(i => i.tokenId === trade.tokenId)

    if (marketTrade) {
      for (const key of Object.keys(trade)) {
        marketTrade[key] = trade[key]
      }
    } else {
      user.market.trades.push(trade)
    }

    await app.db.saveUser(user)
  }

  app.db.hasUserAchievement = (user, achievementKey) => {
    const id = achievementData.find(i => i.key === achievementKey).id
    const achievement = user.achievements.find(i => i === id)

    return !!achievement
  }

  app.db.addUserAchievement = (user, achievementKey) => {
    const id = achievementData.find(i => i.key === achievementKey).id
    const achievement = user.achievements.find(i => i === id)

    if (!achievement) {
      user.achievements.push(id)
    }

    // saveUser(user)
  }

  app.db.findPrice = (symbol, timestamp) => {
    for (let i = 1; i < app.db.historical.price[symbol].length; i++) {
      if (app.db.historical.price[symbol][i][0] > timestamp * 1000) {
        return app.db.historical.price[symbol][i][1]
      }
    }

    return app.db.stats.prices[symbol]
  }

  app.db.addBanList = (game, target) => {
    if (!app.db[game].banList) app.db[game].banList = []

    if (!app.db[game].banList.includes(target)) {
      app.db[game].banList.push(target)
    }
  }

  app.db.saveBanList = () => {
    jetpack.write(path.resolve('./db/evolution/banList.json'), beautify(app.db.evolution.banList, null, 2, 100), { atomic: true })
  }

  app.db.addModList = (game, target) => {
    if (!app.db[game].modList) app.db[game].modList = []

    if (!app.db[game].modList.includes(target)) {
      app.db[game].modList.push(target)
    }
  }

  app.db.saveModList = () => {
    jetpack.write(path.resolve('./db/evolution/modList.json'), beautify(app.db.evolution.modList, null, 2, 100), { atomic: true })
  }
}