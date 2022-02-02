import ethers from 'ethers'
import { log, logError } from '../util'
import { iterateBlocks, getAddress } from '../util/web3'
import { decodeItem } from '../util/decodeItem'

export async function getAllBarracksEvents(app) {
  if (app.config.barracks.updating) return

  log('[Barracks] Updating')

  app.config.barracks.updating = true

  try {
    const iface = new ethers.utils.Interface(app.contractMetadata.ArcaneBarracksFacetV1.abi)

    // @ts-ignore
    async function processLog(log, updateConfig = true) {
      const e = iface.parseLog(log)
      
      // log(e.name, e)

      if (e.name === 'Equip') {
        const { user: userAddress, tokenId, itemId } = e.args

        const user = app.db.loadUser(userAddress)

        const item = {
          status: "equipped",
          tokenId: tokenId.toString(),
          updatedAt: new Date().getTime(),
          id: decodeItem(tokenId.toString()).id
        }
        
        await app.db.saveUserItem(user, item)
      }

      if (e.name === 'Unequip') {
        const { user: userAddress, tokenId, itemId } = e.args

        const user = app.db.loadUser(userAddress)

        const item = {
          status: "unequipped",
          tokenId: tokenId.toString(),
          itemId: itemId,
          updatedAt: new Date().getTime(),
          id: decodeItem(tokenId.toString()).id
          // ...decodeItem(tokenId.toString())
        }
        
        await app.db.saveUserItem(user, item)
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

      const e2 = app.db.barracksEvents.find(t => t.transactionHash === log.transactionHash)

      if (!e2) {
        app.db.barracksEvents.push({
          // id: ++config.barracks.counter,
          ...log,
          ...e
        })
      }
    

      // if (updateConfig && log.blockNumber > config.barracks.lastBlock) {
      //   config.barracks.lastBlock = log.blockNumber
      //   app.db.saveConfig()
      // }
    }

    const blockNumber = await app.web3.eth.getBlockNumber()

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
      await iterateBlocks(app.web3Provider.getLogs, `Barracks Events: ${event}`, getAddress(app.contracts.barracks), app.config.barracks.lastBlock[event], blockNumber, app.contractMetadata.arcaneBarracks.filters[event](), processLog, async function (blockNumber2) {
        app.config.barracks.lastBlock[event] = blockNumber2
        // await app.db.saveConfig()
      })
    }

    log('Finished')
  } catch(e) {
    logError(e)
  }

  app.config.barracks.updating = false
  app.config.barracks.updatedDate = (new Date()).toString()
  app.config.barracks.updatedTimestamp = new Date().getTime()

  // await app.db.saveBarracksEvents()
  // await app.db.saveConfig()

  setTimeout(() => getAllBarracksEvents(app), 15 * 60 * 1000)
}