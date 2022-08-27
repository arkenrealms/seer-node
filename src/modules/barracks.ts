import * as ethers from 'ethers'
import BigNumber from 'bignumber.js'
import { log } from '@rune-backend-sdk/util'
import { iterateBlocks, getAddress } from '@rune-backend-sdk/util/web3'
import { decodeItem } from '@rune-backend-sdk/util/item-decoder'
import { RuneId } from '@rune-backend-sdk/data/items'
import { getHighestId, toShort } from '@rune-backend-sdk/util'
import contractInfo from '@rune-backend-sdk/contractInfo'
import { ItemSlot } from 'rune-backend-sdk/src/data/items'

export const AddressToRune: any = {}

for (const key of Object.keys(RuneId)) {
  // @ts-ignore
  AddressToRune[contractInfo[key.toLowerCase()][56]] = key
}

const EquipmentCache = {}

export async function getPlayerEquipment(app, address) {
  try {
    if (EquipmentCache[address]) return EquipmentCache[address]

    const ids = []

    const leftHand = await app.contracts.barracks.methods.getEquippedItem(address, ItemSlot.LeftHand).call()
    if (leftHand) ids.push([ItemSlot.LeftHand, new BigNumber(leftHand).toString()])

    const rightHand = await app.contracts.barracks.methods.getEquippedItem(address, ItemSlot.RightHand).call()
    if (rightHand) ids.push([ItemSlot.RightHand, new BigNumber(rightHand).toString()])

    const head = await app.contracts.barracks.methods.getEquippedItem(address, ItemSlot.Head).call()
    if (head) ids.push([ItemSlot.Head, new BigNumber(head).toString()])

    const hands = await app.contracts.barracks.methods.getEquippedItem(address, ItemSlot.Hands).call()
    if (hands) ids.push([ItemSlot.Hands, new BigNumber(hands).toString()])

    const belt = await app.contracts.barracks.methods.getEquippedItem(address, ItemSlot.Waist).call()
    if (belt) ids.push([ItemSlot.Waist, new BigNumber(belt).toString()])

    const legs = await app.contracts.barracks.methods.getEquippedItem(address, ItemSlot.Legs).call()
    if (legs) ids.push([ItemSlot.Legs, new BigNumber(legs).toString()])

    const chest = await app.contracts.barracks.methods.getEquippedItem(address, ItemSlot.Chest).call()
    if (chest) ids.push([ItemSlot.Chest, new BigNumber(chest).toString()])

    const feet = await app.contracts.barracks.methods.getEquippedItem(address, ItemSlot.Feet).call()
    if (feet) ids.push([ItemSlot.Feet, new BigNumber(feet).toString()])

    const trinket1 = await app.contracts.barracks.methods.getEquippedItem(address, ItemSlot.Trinket1).call()
    if (trinket1) ids.push([ItemSlot.Trinket1, new BigNumber(trinket1).toString()])

    const trinket2 = await app.contracts.barracks.methods.getEquippedItem(address, ItemSlot.Trinket2).call()
    if (trinket2) ids.push([ItemSlot.Trinket2, new BigNumber(trinket2).toString()])

    const trinket3 = await app.contracts.barracks.methods.getEquippedItem(address, ItemSlot.Trinket3).call()
    if (trinket3) ids.push([ItemSlot.Trinket3, new BigNumber(trinket3).toString()])

    const pet = await app.contracts.barracks.methods.getEquippedItem(address, ItemSlot.Pet).call()
    if (pet) ids.push([ItemSlot.Pet, new BigNumber(pet).toString()])

    const neck = await app.contracts.barracks.methods.getEquippedItem(address, ItemSlot.Neck).call()
    if (neck) ids.push([ItemSlot.Neck, new BigNumber(neck).toString()])

    const finger1 = await app.contracts.barracks.methods.getEquippedItem(address, ItemSlot.Finger1).call()
    if (finger1) ids.push([ItemSlot.Finger1, new BigNumber(finger1).toString()])

    const finger2 = await app.contracts.barracks.methods.getEquippedItem(address, ItemSlot.Finger2).call()
    if (finger2) ids.push([ItemSlot.Finger2, new BigNumber(finger2).toString()])

    EquipmentCache[address] = ids

    return ids
  } catch(e) {
    log(e)
  }

  return []
}

export async function getAllBarracksEvents(app, retry = false) {
  if (app.config.barracks.updating) return

  log('[Barracks] Updating')

  app.config.barracks.updating = true

  try {
    const iface = new ethers.utils.Interface(app.contractMetadata.ArcaneBarracksFacetV1.abi)

    // @ts-ignore
    async function processLog(logInfo, updateConfig = true) {
      const e = iface.parseLog(logInfo)
      
      // log(e.name, e)

      if (e.name === 'Equip') {
        const { user: userAddress, tokenId, itemId } = e.args

        const user = await app.db.loadUser(userAddress)
        const decodedItem = decodeItem(tokenId.toString())

        const item = {
          status: "equipped",
          tokenId: tokenId.toString(),
          updatedAt: new Date().getTime(),
          id: decodedItem.id
        }
        await app.db.saveUserItem(user, item)
        
        await app.live.emitAll('PlayerAction', { key: 'raid1-equipped', address: user.address, username: user.username, itemName: decodedItem, tokenId: tokenId.toString(), message: `${user.username} equipped ${decodedItem.name}` })

      }

      if (e.name === 'Unequip') {
        const { user: userAddress, tokenId, itemId } = e.args

        const user = await app.db.loadUser(userAddress)
        const decodedItem = decodeItem(tokenId.toString())

        const item = {
          status: "unequipped",
          tokenId: tokenId.toString(),
          itemId: itemId,
          updatedAt: new Date().getTime(),
          id: decodedItem.id
          // ...decodeItem(tokenId.toString())
        }
        
        await app.db.saveUserItem(user, item)
        
        await app.live.emitAll('PlayerAction', { key: 'raid1-unequipped', address: user.address, username: user.username, itemName: decodedItem, tokenId: tokenId.toString(), message: `${user.username} unequipped ${decodedItem.name}` })
      }

      if (e.name === 'ActionBurn') {
        const { user: userAddress, amount } = e.args

        const user = await app.db.loadUser(userAddress)

        await app.live.emitAll('PlayerAction', { key: 'raid1-burn', address: user.address, username: user.username, message: `${user.username} burned ${toShort(amount)} rune rewards` })
      }

      if (e.name === 'ActionBonus') {
        const { user: userAddress, amount } = e.args

        const user = await app.db.loadUser(userAddress)

        await app.live.emitAll('PlayerAction', { key: 'raid1-bonus', address: user.address, username: user.username, message: `${user.username} yielded ${toShort(amount)} extra rewards` })
      }

      if (e.name === 'ActionHiddenPool') {
        const { user: userAddress, amount } = e.args

        const user = await app.db.loadUser(userAddress)

        await app.live.emitAll('PlayerAction', { key: 'raid1-hidden-pool', address: user.address, username: user.username, message: `${user.username} sent ${toShort(amount)} rewards to the hidden pool` })
      }

      if (e.name === 'ActionFee') {
        const { user: userAddress, token, amount } = e.args

        const user = await app.db.loadUser(userAddress)

        await app.live.emitAll('PlayerAction', { key: 'raid1-fee', address: user.address, username: user.username, message: `${user.username} paid ${toShort(amount)} ${AddressToRune[token]} in fees` })
      }

      const e2 = app.db.barracksEvents.find(t => t.transactionHash === logInfo.transactionHash)

      if (!e2) {
        app.db.barracksEvents.push({
          // id: ++config.barracks.counter,
          ...logInfo,
          ...e
        })
      }
    

      // if (updateConfig && logInfo.blockNumber > config.barracks.lastBlock) {
      //   config.barracks.lastBlock = logInfo.blockNumber
      //   app.db.saveConfig()
      // }
    }

    const blockNumber = await app.web3.eth.getBlockNumber()

    if (parseInt(blockNumber) > 10000) {
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
        await iterateBlocks(app, `Barracks Events: ${event}`, getAddress(app.contractInfo.barracks), app.config.barracks.lastBlock[event], blockNumber, app.contracts.barracks.filters[event](), processLog, async function (blockNumber2) {
          app.config.barracks.lastBlock[event] = blockNumber2
          // await app.db.saveConfig()
        })
      }
    } else {
      log('Error parsing block number', blockNumber)
    }
    
    log('Finished')
  } catch(e) {
    log('Error', e)
  }

  app.config.barracks.updating = false
  app.config.barracks.updatedDate = (new Date()).toString()
  app.config.barracks.updatedTimestamp = new Date().getTime()

  // await app.db.saveBarracksEvents()
  // await app.db.saveConfig()

  if (retry) {
    setTimeout(() => getAllBarracksEvents(app), 20 * 60 * 1000)
  }
}

export async function monitorBarracksEvents(app) {
  app.contracts.barracks.on('Equip', async () => {
    await app.modules.getAllBarracksEvents(app)
  })

  app.contracts.barracks.on('Unequip', async () => {
    await app.modules.getAllBarracksEvents(app)
  })

  app.contracts.barracks.on('ActionBurn', async () => {
    await app.modules.getAllBarracksEvents(app)
  })

  app.contracts.barracks.on('ActionBonus', async () => {
    await app.modules.getAllBarracksEvents(app)
  })

  app.contracts.barracks.on('ActionHiddenPool', async () => {
    await app.modules.getAllBarracksEvents(app)
  })

  app.contracts.barracks.on('ActionFee', async () => {
    await app.modules.getAllBarracksEvents(app)
  })

  app.contracts.barracks.on('ActionSwap', async () => {
    await app.modules.getAllBarracksEvents(app)
  })
}
