import ethers from 'ethers'
import { log, logError } from '../util'
import { iterateBlocks, getAddress } from '../util/web3'
import { decodeItem } from '../util/decodeItem'

export async function getAllItemEvents(app) {
  if (app.config.items.updating) return

  log('[Items] Updating')

  app.config.items.updating = true

  try {
    const contract = new ethers.Contract(getAddress(app.contracts.items), app.contractMetadata.ArcaneItems.abi, app.signers.read)
    const iface = new ethers.utils.Interface(app.contractMetadata.ArcaneItems.abi)

    // @ts-ignore
    async function processLog(log2, updateConfig = true) {
      try {
        const e = iface.parseLog(log2)
        
        // console.log(e.name, e)

        if (e.name === 'Transfer') {
          const { from, to: userAddress, tokenId } = e.args

          const user = app.db.loadUser(userAddress)
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

          const token = app.db.loadToken(itemData.tokenId)

          if (from === '0x0000000000000000000000000000000000000000') {
            token.owner = itemData.owner
            token.creator = itemData.owner
            token.createdAt = itemData.createdAt
          }

          await app.db.saveUserItem(user, itemData)
          await app.db.saveTokenTransfer(token, itemData)

          if (from !== '0x0000000000000000000000000000000000000000') {
            await app.db.saveUserItem(user, { ...itemData, status: 'transferred_out' })
          }

          await app.db.saveItemOwner(app.db.loadItem(itemData.id), itemData)
        }

        const e2 = app.db.itemsEvents.find(t => t.transactionHash === log2.transactionHash)

        if (!e2) {
          app.db.itemsEvents.push({
            // id: ++config.items.counter,
            ...log2,
            ...e
          })
        }
      
        // await saveConfig()

        // if (updateConfig) {
        //   config.items.lastBlock = log2.blockNumber
        //   saveConfig()
        // }
      } catch (ex) {
        logError(ex)
        logError("Error parsing log: ", log2)
      }
    }

    const blockNumber = await app.web3.eth.getBlockNumber()

    const events = [
      'Transfer'
    ]
    
    for (const event of events) {
      await iterateBlocks(app.web3Provider.getLogs, `Items Events: ${event}`, getAddress(app.contracts.items), app.config.items.lastBlock[event], blockNumber, contract.filters[event](), processLog, async function (blockNumber2) {
        app.config.items.lastBlock[event] = blockNumber2
        // await saveConfig()
      })
    }

    log('Finished')
  } catch(e) {
    logError(e)
  }

  app.config.items.updating = false
  app.config.items.updatedDate = (new Date()).toString()
  app.config.items.updatedTimestamp = new Date().getTime()

  // await saveItemsEvents()
  // await saveConfig()

  setTimeout(() => getAllItemEvents(app), 2 * 60 * 1000)
}