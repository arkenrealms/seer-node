import * as ethers from 'ethers'
import { log } from '@rune-backend-sdk/util'
import { iterateBlocks, getAddress } from '@rune-backend-sdk/util/web3'
import { decodeItem } from '@rune-backend-sdk/util/item-decoder'
import { ItemRarity, RuneNames } from '@rune-backend-sdk/data/items'

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

            if (Array.isArray(decodedItem.recipe?.requirement)) {
              for (const rune of decodedItem.recipe.requirement) {
                // console.log(rune, decodedItem.recipe.requirement, RuneNames)
                const runeSymbol = RuneNames[rune.id].toLowerCase()
                app.db.oracle.inflow.crafting.tokens.week[runeSymbol] += 1
              }
            }

            if (decodedItem.rarity.id === ItemRarity.Mythic.id) {
              await app.live.emitAll('PlayerAction', { key: 'item-craft', createdAt: new Date().getTime() / 1000, address: token.owner, itemName: decodedItem.name, tokenId: itemData.tokenId, username: user.username, message: `${user.username || `${userAddress.slice(0, 7)}...`} crafted a mythic ${decodedItem.name}` })
              await app.notices.add('item-craft', { key: 'item-craft', address: token.owner, itemName: decodedItem.name, tokenId: itemData.tokenId, username: user.username, message: `${user.username || `${userAddress.slice(0, 7)}...`} crafted a mythic ${decodedItem.name}` })
            } else if (decodedItem.rarity.id === ItemRarity.Epic.id) {
              await app.live.emitAll('PlayerAction', { key: 'item-craft', createdAt: new Date().getTime() / 1000, address: token.owner, itemName: decodedItem.name, tokenId: itemData.tokenId, username: user.username, message: `${user.username || `${userAddress.slice(0, 7)}...`} crafted an epic ${decodedItem.name}` })
              await app.notices.add('item-craft', { key: 'item-craft', address: token.owner, itemName: decodedItem.name, tokenId: itemData.tokenId, username: user.username, message: `${user.username || `${userAddress.slice(0, 7)}...`} crafted an epic ${decodedItem.name}` })
            } else if (decodedItem.rarity.id === ItemRarity.Rare.id) {
              await app.live.emitAll('PlayerAction', { key: 'item-craft', createdAt: new Date().getTime() / 1000, address: token.owner, itemName: decodedItem.name, tokenId: itemData.tokenId, username: user.username, message: `${user.username || `${userAddress.slice(0, 7)}...`} crafted a rare ${decodedItem.name}` })
            } else if (decodedItem.rarity.id === ItemRarity.Magical.id) {
              await app.live.emitAll('PlayerAction', { key: 'item-craft', createdAt: new Date().getTime() / 1000, address: token.owner, itemName: decodedItem.name, tokenId: itemData.tokenId, username: user.username, message: `${user.username || `${userAddress.slice(0, 7)}...`} crafted a magical ${decodedItem.name}` })
            }
          } else {
            if (decodedItem.id === 1205) {
              await app.db.saveCubeTransfer(from, userAddress)
            }

            const fromUser = await app.db.loadUser(from)

            if (!['0xcfA857d6EC2F59b050D7296FbcA8a91D061451f3', '0x5fE24631136D570D12920C9Fa0FEcaDA84E47673', '0x85C07b6a475Ee19218D0ef9C278C7e58715Af842', '0xa9b9195b19963f2d72a7f56bad3705ba536cdb66'].includes(from)) {
              await app.live.emitAll('PlayerAction', { key: 'item-transfer', createdAt: new Date().getTime() / 1000, address: token.owner, itemName: decodedItem.name, tokenId: itemData.tokenId, username: fromUser.username, username2: user.username, message: `${fromUser.username || `${from.slice(0, 7)}...`} transfered ${decodedItem.name} to ${user.username || `${userAddress.slice(0, 7)}...`}` })
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
