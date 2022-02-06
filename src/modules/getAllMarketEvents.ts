import ethers from 'ethers'
import { getHighestId, toShort, log, logError } from '../util'
import { iterateBlocks, getAddress } from '../util/web3'
import { decodeItem } from '../util/decodeItem'

export async function getAllMarketEvents(app) {
  if (app.config.trades.updating) return

  log('[Market] Updating')

  app.config.trades.updating = true

  try {
    const iface = new ethers.utils.Interface(app.contractInstance.ArcaneTraderV1.abi);

    // @ts-ignore
    async function processLog(log, updateConfig = true) {
      const e = iface.parseLog(log)
      log(e.name, e.args.tokenId)
      if (e.name === 'List') {
        const { seller, buyer, tokenId, price } = e.args

        let trade = app.db.trades.find(t => t.seller.toLowerCase() === seller.toLowerCase() && t.tokenId === tokenId.toString())

        if (!trade || trade.blockNumber < log.blockNumber) {
          trade = {
            id: getHighestId(app.db.trades) + 1
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

          app.db.trades.push(trade)

          log('Adding trade', trade)

          await app.db.saveUserTrade(app.db.loadUser(seller), trade)
          await app.db.saveTokenTrade(app.db.loadToken(trade.tokenId), trade)
          await app.db.saveItemTrade(app.db.loadItem(trade.item.id), trade)
          await app.db.saveItemToken(app.db.loadItem(trade.item.id), { id: trade.tokenId, item: trade.item })
          // await saveConfig()
          
          log('List', trade)
        }
      }

      if (e.name === 'Update') {
        const { seller, buyer, tokenId, price } = e.args

        const specificTrades = app.db.trades.find(t => t.seller.toLowerCase() === seller.toLowerCase() && t.tokenId === tokenId.toString() && t.status === 'available' && t.blockNumber < log.blockNumber)

        for (const specificTrade of specificTrades) {
          specificTrade.buyer = buyer
          specificTrade.price = toShort(price)
          specificTrade.updatedAt = new Date().getTime()
          specificTrade.blockNumber = log.blockNumber
          specificTrade.item = { id: decodeItem(tokenId.toString()).id }
          // specificTrade.item = decodeItem(specificTrade.tokenId)

          await app.db.saveUserTrade(app.db.loadUser(seller), specificTrade)
          await app.db.saveTokenTrade(app.db.loadToken(specificTrade.tokenId), specificTrade)
          await app.db.saveItemTrade(app.db.loadItem(specificTrade.item.id), specificTrade)
          await app.db.saveItemToken(app.db.loadItem(specificTrade.item.id), { id: specificTrade.tokenId, item: specificTrade.item })
          
          log('Update', specificTrade)
        }
      }

      if (e.name === 'Delist') {
        const { seller, buyer, tokenId, price } = e.args

        const specificTrades = app.db.trades.filter(t => t.seller.toLowerCase() === seller.toLowerCase() && t.tokenId === tokenId.toString() && t.status === 'available' && t.blockNumber < log.blockNumber)
        
        for (const specificTrade of specificTrades) {
          specificTrade.status = "delisted"
          specificTrade.updatedAt = new Date().getTime()
          specificTrade.blockNumber = log.blockNumber
          specificTrade.item = { id: decodeItem(tokenId.toString()).id }
          // specificTrade.item = decodeItem(specificTrade.tokenId)

          log('Delisting trade', specificTrade)

          await app.db.saveUserTrade(app.db.loadUser(seller), specificTrade)
          await app.db.saveTokenTrade(app.db.loadToken(specificTrade.tokenId), specificTrade)
          await app.db.saveItemTrade(app.db.loadItem(specificTrade.item.id), specificTrade)
          await app.db.saveItemToken(app.db.loadItem(specificTrade.item.id), { id: specificTrade.tokenId, item: specificTrade.item })
          
          log('Delist', specificTrade)
        }
      }

      if (e.name === 'Buy') {
        const { seller, buyer, tokenId, price } = e.args

        const specificTrades = app.db.trades.filter(t => t.seller.toLowerCase() === seller.toLowerCase() && t.tokenId === tokenId.toString() && t.status === 'available' && t.blockNumber < log.blockNumber)

        for (const specificTrade of specificTrades) {
          specificTrade.status = "sold"
          specificTrade.buyer = buyer
          specificTrade.updatedAt = new Date().getTime()
          specificTrade.blockNumber = log.blockNumber
          specificTrade.item = { id: decodeItem(tokenId.toString()).id }
          // specificTrade.item = decodeItem(specificTrade.tokenId)
    
          await app.db.saveUserTrade(app.db.loadUser(seller), specificTrade)
          await app.db.saveUserTrade(app.db.loadUser(buyer), specificTrade)
          await app.db.saveTokenTrade(app.db.loadToken(specificTrade.tokenId), specificTrade)
          await app.db.saveItemTrade(app.db.loadItem(specificTrade.item.id), specificTrade)
          await app.db.saveItemToken(app.db.loadItem(specificTrade.item.id), { id: specificTrade.tokenId, item: specificTrade.item })
          
          log('Buy', specificTrade)
        }
      }

      const e2 = app.db.tradesEvents.find(t => t.transactionHash === log.transactionHash)

      if (!e2) {
        app.db.tradesEvents.push({
          // id: ++app.config.trades.counter,
          ...log,
          ...e
        })
      }


      // if (updateConfig) {
      //   app.config.trades.lastBlock = log.blockNumber
      //   saveConfig()
      // }
    }

    const blockNumber = await app.web3.eth.getBlockNumber()

    const events = [
      'List(address,address,uint256,uint256)',
      'Update(address,address,uint256,uint256)',
      'Delist(address,uint256)',
      'Buy(address,address,uint256,uint256)',
    ]
    
    for (const event of events) {
      await iterateBlocks(app.ethersProvider.getLogs, `Market Events: ${event}`, getAddress(app.contracts.trader), app.config.trades.lastBlock[event], blockNumber, app.contracts.arcaneTrader.filters[event](), processLog, async function (blockNumber2) {
        app.config.trades.lastBlock[event] = blockNumber2
        // await saveConfig()
      })
    }

    log('Finished')
  } catch(e) {
    logError(e)
  }

  app.config.trades.updating = false
  app.config.trades.updatedDate = (new Date()).toString()
  app.config.trades.updatedTimestamp = new Date().getTime()

  // await saveTrades()
  // await saveConfig()

  setTimeout(() => getAllMarketEvents(app), 2 * 60 * 1000)
}