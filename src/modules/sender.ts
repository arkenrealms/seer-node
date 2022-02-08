import fetch from 'node-fetch'
import * as ethers from 'ethers'
import { log, logError } from '../util'
import { iterateBlocks, getAddress, getSignedRequest } from '../util/web3'
import { decodeItem } from '../util/decodeItem'

export async function getAllSenderEvents(app) {
  if (app.config.sender.updating) return

  log('[Sender] Updating')

  const contractAddressToKey = {}

  for (const contractKey of Object.keys(app.contractInfo)) {
    contractAddressToKey[app.contractInfo[contractKey][56]] = contractKey
  }

  
  const rand = Math.floor(Math.random() * Math.floor(999999))
  const response = await fetch(`https://coordinator.rune.game/data/claimRequests.json`) // ?${rand}
  const claimRequests = await response.json()

  app.config.sender.updating = true

  const userCache = {}

  try {
    const iface = new ethers.utils.Interface(app.contractMetadata.RuneSenderV1.abi)

    // @ts-ignore
    async function processLog(log2, updateConfig = true) {
      try {
        const e = iface.parseLog(log2)
        
        // console.log(e.name, e)
        let user
        if (userCache[e.args.to]) {
          user = userCache[e.args.to]
        } else {
          user = await app.db.loadUser(e.args.to)
          userCache[e.args.to] = user

          if (e.args.to === '0x4F9f8027C22819a359270391128414AB48D72092') console.log('vv')
          user.rewards = JSON.parse(JSON.stringify(user.lifetimeRewards))
          user.rewardHistory = []
        }

        if (!user.claimRequests) user.claimRequests = []

        const coordinatorRequest = claimRequests.find(c => c.data?.requestId === e.args.requestId)

        let claimRequest = user.claimRequests.find(c => c.requestId === e.args.requestId)

        if (!claimRequest) {
          claimRequest = {
            id: coordinatorRequest?.id,
            requestId: e.args.requestId
          }

          user.claimRequests.push(claimRequest)
        }

        console.log(e.args.requestId)

        claimRequest.status = 'completed'

        if (coordinatorRequest) {
          if (!user.rewardHistory) user.rewardHistory = []
  
          for (const index in coordinatorRequest.tokenAddresses) {
            const rune = {
              key: contractAddressToKey[coordinatorRequest.tokenAddresses[index]],
              value: coordinatorRequest.tokenAmounts[index]
            }
            user.rewardHistory.push({
              id: coordinatorRequest.id,
              rune: rune.key,
              value: rune.value,
              timestamp: new Date().getTime()
            })
            if (e.args.to === '0x4F9f8027C22819a359270391128414AB48D72092') console.log('vvv', rune.key, rune.value, user.rewards.runes[rune.key])
            user.rewards.runes[rune.key] -= rune.value
            if (e.args.to === '0x4F9f8027C22819a359270391128414AB48D72092') console.log('vvv2', rune.key, rune.value, user.rewards.runes[rune.key])
          }
        }

        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            signature: await getSignedRequest('rune-databaser/sender')
          }),
        }
    
        const finalizeRes = await (await fetch(`https://coordinator.rune.game/claim/${e.args.requestId}/finalize`, requestOptions)).json() // ?${rand}

        console.log(finalizeRes)
        // if (finalizeRes.status !== 1) {
          await app.db.saveUser(user)
        // }


        // if (e.name === 'Transfer') {
          // const { from, to: userAddress, tokenIds } = e.args


        //   const user = app.db.loadUser(userAddress)
        //   const decodedItem = decodeItem(tokenId.toString())

        //   const itemData = {
        //     owner: userAddress,
        //     from,
        //     status: from === '0x0000000000000000000000000000000000000000' ? "created" : 'transferred_in',
        //     tokenId: tokenId.toString(),
        //     createdAt: new Date().getTime(),
        //     id: decodedItem.id,
        //     perfection: decodedItem.perfection
        //   }

        //   const token = app.db.loadToken(itemData.tokenId)

        //   if (from === '0x0000000000000000000000000000000000000000') {
        //     token.owner = itemData.owner
        //     token.creator = itemData.owner
        //     token.createdAt = itemData.createdAt
        //   }

        //   await app.db.saveUserItem(user, itemData)
        //   await app.db.saveTokenTransfer(token, itemData)

        //   if (from !== '0x0000000000000000000000000000000000000000') {
        //     await app.db.saveUserItem(user, { ...itemData, status: 'transferred_out' })
        //   }

        //   await app.db.saveItemOwner(app.db.loadItem(itemData.id), itemData)
        // // }

        // const e2 = app.db.senderEvents.find(t => t.transactionHash === log2.transactionHash)

        // if (!e2) {
        //   app.db.senderEvents.push({
        //     // id: ++config.sender.counter,
        //     ...log2,
        //     ...e
        //   })
        // }
      
        // await saveConfig()

        // if (updateConfig) {
        //   config.sender.lastBlock = log2.blockNumber
        //   saveConfig()
        // }
      } catch (ex) {
        logError(ex)
        logError("Error parsing log: ", log2)
      }
    }

    const blockNumber = await app.web3.eth.getBlockNumber()

    const events = [
      'RewardsSent(address,uint256,string)'
    ]
    
    for (const event of events) {
      await iterateBlocks(app, `Sender Events: ${event}`, getAddress(app.contractInfo.sender), app.config.sender.lastBlock[event] || 15000000, blockNumber, app.contracts.sender.filters[event](), processLog, async function (blockNumber2) {
        app.config.sender.lastBlock[event] = blockNumber2
        // await saveConfig()
      })
    }

    log('Finished')
  } catch(e) {
    logError(e)
  }

  app.config.sender.updating = false
  app.config.sender.updatedDate = (new Date()).toString()
  app.config.sender.updatedTimestamp = new Date().getTime()

  // await saveItemsEvents()
  // await saveConfig()

  // setTimeout(() => getAllSenderEvents(app), 2 * 60 * 1000)
}

export async function monitorSenderEvents(app) {
  await getAllSenderEvents(app)

  app.contracts.sender.on('RewardsSent', async () => {
    await getAllSenderEvents(app)
  })
}
