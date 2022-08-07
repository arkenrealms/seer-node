import * as ethers from 'ethers'
import { log } from '@rune-backend-sdk/util'
import { iterateBlocks, getAddress } from '@rune-backend-sdk/util/web3'
import { decodeItem } from '@rune-backend-sdk/util/item-decoder'
import { RuneNames } from '@rune-backend-sdk/data/items'

export async function getAllItemEvents(app, retry = false) {
  if (app.config.items.updating) return

  log('[Items] Updating')

  app.config.items.updating = true

  try {
    const contract = new ethers.Contract(getAddress(app.contractInfo.items), app.contractMetadata.ArcaneItems.abi, app.signers.read)
    const iface = new ethers.utils.Interface(app.contractMetadata.ArcaneItems.abi)

    // @ts-ignore
    async function processLog(logInfo, updateConfig = true) {
      try {
        const e = iface.parseLog(logInfo)
        
        // console.log(e.name, e)

        if (e.name === 'Transfer') {
          const { from, to: userAddress, tokenId } = e.args
          log(from, userAddress, tokenId)

          const user = await app.db.loadUser(userAddress)
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

            for (const runeId of decodedItem.recipe.requirement) {
              const runeSymbol = RuneNames(runeId).toLowerCase()
              app.db.oracle.income.runes.week[runeSymbol] += 1
            }

            if (itemData.perfection === 1) {
              await app.notices.add('mythic_crafted', { address: token.owner, itemName: decodedItem.name, tokenId: itemData.tokenId, message: `${user.username} found a mythic ${decodedItem.name}!` })
            }
          }

          await app.db.saveUserItem(user, itemData)
          await app.db.saveTokenTransfer(token, itemData)

          await app.db.saveItemOwner(app.db.loadItem(itemData.id), itemData)
        }

        const e2 = app.db.itemsEvents.find(t => t.transactionHash === logInfo.transactionHash)

        if (!e2) {
          app.db.itemsEvents.push({
            // id: ++config.items.counter,
            ...logInfo,
            ...e
          })
        }
      
        // await saveConfig()

        // if (updateConfig) {
        //   config.items.lastBlock = logInfo.blockNumber
        //   saveConfig()
        // }
      } catch (ex) {
        log(ex)
        log("Error parsing log: ", logInfo)
      }
    }

    const blockNumber = await app.web3.eth.getBlockNumber()

    if (parseInt(blockNumber) > 10000) {
      const events = [
        'Transfer'
      ]
      
      for (const event of events) {
        await iterateBlocks(app, `Items Events: ${event}`, getAddress(app.contractInfo.items), app.config.items.lastBlock[event], blockNumber, contract.filters[event](), processLog, async function (blockNumber2) {
          app.config.items.lastBlock[event] = blockNumber2
          // await saveConfig()
        })
      }
    } else {
      log('Error parsing block number', blockNumber)
    }
    
    log('Finished')
  } catch(e) {
    log('Error', e)
  }

  app.config.items.updating = false
  app.config.items.updatedDate = (new Date()).toString()
  app.config.items.updatedTimestamp = new Date().getTime()

  // await saveItemsEvents()
  // await saveConfig()

  if (retry) {
    setTimeout(() => getAllItemEvents(app), 30 * 60 * 1000)
  }
}

export async function monitorItemEvents(app) {
  app.contracts.items.on('Transfer', async () => {
    await app.modules.getAllItemEvents(app)
  })
}
