import * as ethers from 'ethers'
import { getHighestId, toShort, log } from '@rune-backend-sdk/util'
import { iterateBlocks, getAddress } from '@rune-backend-sdk/util/web3'
import { decodeItem } from '@rune-backend-sdk/util/item-decoder'

export async function getAllMarketEvents(app, retry = false) {
  if (app.config.trades.updating) return

  log('[Market] Updating')

  app.config.trades.updating = true

  try {
    const iface = new ethers.utils.Interface(app.contractMetadata.RXSMarketplace.abi);

    // @ts-ignore
    async function processLog(logInfo, updateConfig = true) {
      try {
        const e = iface.parseLog(logInfo)
        log(e.name, e.args.tokenId)
        if (e.name === 'List') {
          const { seller, buyer, tokenId, price } = e.args

          let trade = app.db.trades.find(t => t.seller.toLowerCase() === seller.toLowerCase() && t.tokenId === tokenId.toString())

          if (!trade || trade.blockNumber < logInfo.blockNumber) {
            trade = {
              id: getHighestId(app.db.trades) + 1,
            }

            const decodedItem = decodeItem(tokenId.toString())

            trade.seller = seller
            trade.buyer = buyer
            trade.tokenId = tokenId.toString()
            trade.price = toShort(price)
            trade.status = "available"
            trade.hotness = 0
            trade.createdAt = new Date().getTime()
            trade.updatedAt = new Date().getTime()
            trade.blockNumber = logInfo.blockNumber
            trade.item = { id: decodedItem.id, name: decodedItem.name }
            // trade.item = decodeItem(trade.tokenId)

            app.db.trades.push(trade)

            log('Adding trade', trade)

            const item = app.db.loadItem(trade.item.id)

            await app.db.saveUserTrade(await app.db.loadUser(seller), trade)
            await app.db.saveTokenTrade(app.db.loadToken(trade.tokenId), trade)
            await app.db.saveItemTrade(item, trade)
            await app.db.saveItemToken(item, { id: trade.tokenId, owner: seller, item: trade.item })
            // await saveConfig()
            
            log('List', trade)
          }
        }

        if (e.name === 'ListTimelocked') {
          const { seller, buyer, tokenId, price, earliestBuyTime } = e.args

          let trade = app.db.trades.find(t => t.seller.toLowerCase() === seller.toLowerCase() && t.tokenId === tokenId.toString())

          if (!trade || trade.blockNumber < logInfo.blockNumber) {
            trade = {
              id: getHighestId(app.db.trades) + 1,
            }

            const decodedItem = decodeItem(tokenId.toString())

            trade.seller = seller
            trade.buyer = buyer
            trade.tokenId = tokenId.toString()
            trade.price = toShort(price)
            trade.status = "available"
            trade.hotness = 0
            trade.createdAt = new Date().getTime()
            trade.updatedAt = new Date().getTime()
            trade.blockNumber = logInfo.blockNumber
            trade.releaseAt = toShort(earliestBuyTime)
            trade.item = { id: decodedItem.id, name: decodedItem.name }
            // trade.item = decodeItem(trade.tokenId)

            app.db.trades.push(trade)

            log('Adding trade', trade)

            const item = app.db.loadItem(trade.item.id)

            await app.db.saveUserTrade(await app.db.loadUser(seller), trade)
            await app.db.saveTokenTrade(app.db.loadToken(trade.tokenId), trade)
            await app.db.saveItemTrade(item, trade)
            await app.db.saveItemToken(item, { id: trade.tokenId, owner: seller, item: trade.item })
            // await saveConfig()
            
            log('ListTimelocked', trade)
          }
        }

        if (e.name === 'Update') {
          const { seller, buyer, tokenId, price } = e.args

          const specificTrades = app.db.trades.find(t => t.seller.toLowerCase() === seller.toLowerCase() && t.tokenId === tokenId.toString() && t.status === 'available' && t.blockNumber < logInfo.blockNumber)

          for (const specificTrade of specificTrades) {
            const decodedItem = decodeItem(tokenId.toString())

            specificTrade.buyer = buyer
            specificTrade.price = toShort(price)
            specificTrade.updatedAt = new Date().getTime()
            specificTrade.blockNumber = logInfo.blockNumber
            specificTrade.item = { id: decodedItem.id, name: decodedItem.name }
            // specificTrade.item = decodeItem(specificTrade.tokenId)

            const item = app.db.loadItem(specificTrade.item.id)

            await app.db.saveUserTrade(await app.db.loadUser(seller), specificTrade)
            await app.db.saveTokenTrade(app.db.loadToken(specificTrade.tokenId), specificTrade)
            await app.db.saveItemTrade(item, specificTrade)
            await app.db.saveItemToken(item, { id: specificTrade.tokenId, owner: seller, item: specificTrade.item })
            
            log('Update', specificTrade)
          }
        }

        if (e.name === 'Delist') {
          const { seller, buyer, tokenId, price } = e.args

          const specificTrades = app.db.trades.filter(t => t.seller.toLowerCase() === seller.toLowerCase() && t.tokenId === tokenId.toString() && t.status === 'available' && t.blockNumber < logInfo.blockNumber)
          
          for (const specificTrade of specificTrades) {
            const decodedItem = decodeItem(tokenId.toString())

            specificTrade.status = "delisted"
            specificTrade.updatedAt = new Date().getTime()
            specificTrade.blockNumber = logInfo.blockNumber
            specificTrade.item = { id: decodedItem.id, name: decodedItem.name }
            // specificTrade.item = decodeItem(specificTrade.tokenId)

            log('Delisting trade', specificTrade)

            const item = app.db.loadItem(specificTrade.item.id)

            await app.db.saveUserTrade(await app.db.loadUser(seller), specificTrade)
            await app.db.saveTokenTrade(app.db.loadToken(specificTrade.tokenId), specificTrade)
            await app.db.saveItemTrade(item, specificTrade)
            await app.db.saveItemToken(item, { id: specificTrade.tokenId, owner: seller, item: specificTrade.item })
            
            log('Delist', specificTrade)
          }
        }

        if (e.name === 'Buy') {
          const { seller, buyer, tokenId, price } = e.args

          const specificTrades = app.db.trades.filter(t => t.seller.toLowerCase() === seller.toLowerCase() && t.tokenId === tokenId.toString() && t.status === 'available' && t.blockNumber < logInfo.blockNumber)

          for (const specificTrade of specificTrades) {
            const decodedItem = decodeItem(tokenId.toString())

            specificTrade.status = "sold"
            specificTrade.buyer = buyer
            specificTrade.updatedAt = new Date().getTime()
            specificTrade.blockNumber = logInfo.blockNumber
            specificTrade.item = { id: decodedItem.id, name: decodedItem.name }
            // specificTrade.item = decodeItem(specificTrade.tokenId)

            const item = app.db.loadItem(specificTrade.item.id)
      
            await app.db.saveUserTrade(await app.db.loadUser(seller), specificTrade)
            await app.db.saveUserTrade(await app.db.loadUser(buyer), specificTrade)
            await app.db.saveTokenTrade(app.db.loadToken(specificTrade.tokenId), specificTrade)
            await app.db.saveItemTrade(item, specificTrade)
            await app.db.saveItemToken(item, { id: specificTrade.tokenId, owner: buyer, item: specificTrade.item })
            
            log('Buy', specificTrade)
          }
        }

        const e2 = app.db.tradesEvents.find(t => t.transactionHash === logInfo.transactionHash)

        if (!e2) {
          app.db.tradesEvents.push({
            // id: ++app.config.trades.counter,
            ...logInfo,
            ...e
          })
        }


        // if (updateConfig) {
        //   app.config.trades.lastBlock = logInfo.blockNumber
        //   saveConfig()
        // }
      } catch(e) {
        log("Error parsing log", logInfo, e)
      }
    }

    const blockNumber = await app.web3.eth.getBlockNumber()

    if (parseInt(blockNumber) > 10000) {
      const events = [
        // event List(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
        // event Update(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
        // event Delist(address indexed seller, uint256 tokenId);
        // event Buy(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
        // event Recover(address indexed user, address indexed seller, uint256 tokenId);
        'List(address,address,uint256,uint256)',
        'ListTimelocked(address,address,uint256,uint256,uint256)',
        'Update(address,address,uint256,uint256)',
        'Delist(address,uint256)',
        'Buy(address,address,uint256,uint256)',
      ]
      
      for (const event of events) {
        if (!app.contracts.market.filters[event]) {
          console.log('No handler for market event:', event)
          continue
        }

        await iterateBlocks(app, `Market Events: ${event}`, getAddress(app.contractInfo.market), app.config.trades.lastBlock[event], blockNumber, app.contracts.market.filters[event](), processLog, async function (blockNumber2) {
          app.config.trades.lastBlock[event] = blockNumber2
          // await saveConfig()
        })
      }

      log('Finished')
    } else {
      log('Error parsing block number', blockNumber)
    }
  } catch(e) {
    log('Error', e)
  }

  app.config.trades.updating = false
  app.config.trades.updatedDate = (new Date()).toString()
  app.config.trades.updatedTimestamp = new Date().getTime()

  // await saveTrades()
  // await saveConfig()

  if (retry) {
    setTimeout(() => getAllMarketEvents(app), 30 * 60 * 1000)
  }
}

export async function monitorMarketEvents(app) {
  // event List(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Update(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Delist(address indexed seller, uint256 tokenId);
  // event Buy(address indexed seller, address indexed buyer, uint256 tokenId, uint256 price);
  // event Recover(address indexed user, address indexed seller, uint256 tokenId);

  try {
    app.contracts.market.on('List', async () => {
      try {
        await app.modules.getAllMarketEvents(app)
      } catch(e) {
        log('Error', e)
      }
    })

    app.contracts.market.on('Update', async () => {
      try {
        await app.modules.getAllMarketEvents(app)
      } catch(e) {
        log('Error', e)
      }
    })

    app.contracts.market.on('Delist', async () => {
      try {
        await app.modules.getAllMarketEvents(app)
      } catch(e) {
        log('Error', e)
      }
    })

    app.contracts.market.on('Buy', async () => {
      try {
        await app.modules.getAllMarketEvents(app)
      } catch(e) {
        log('Error', e)
      }
    })
  } catch(e) {
    log('Error', e)
  }
}
