import fetch from 'node-fetch'
import * as ethers from 'ethers'
import { log, logError } from '../util'
import { iterateBlocks, getAddress, getSignedRequest } from '../util/web3'

export async function getAllSenderEvents(app) {
  if (app.config.sender.updating) return

  log('[Sender] Updating')

  app.config.sender.updating = true

  try {
    const contractAddressToKey = {}
  
    for (const contractKey of Object.keys(app.contractInfo)) {
      contractAddressToKey[app.contractInfo[contractKey][56]] = contractKey
    }
  
    const rand = Math.floor(Math.random() * Math.floor(999999))
    const response = await fetch(`http://35.245.242.215/data/claimRequests.json`) // ?${rand}
    const claimRequests = await response.json()
  
    const iface = new ethers.utils.Interface(app.contractMetadata.RuneSenderV1.abi)

    // @ts-ignore
    async function processLog(log2, updateConfig = true) {
      try {
        const e = iface.parseLog(log2)
        
        // console.log(e.name, e)
        const user = await app.db.loadUser(e.args.to)

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

        claimRequest.status = 'completed'

        if (coordinatorRequest) {
          if (!user.rewardHistory) user.rewardHistory = []
  
          for (const index in coordinatorRequest.tokenAddresses) {
            const rune = {
              key: contractAddressToKey[coordinatorRequest.tokenAddresses[index]],
              value: coordinatorRequest.tokenAmounts[index]
            }

            const rewardHistoryItem = user.rewardHistory.find(r => r.id === coordinatorRequest.id)
            if (!rewardHistoryItem) {
              user.rewardHistory.push({
                id: coordinatorRequest.id,
                rune: rune.key,
                value: rune.value,
                timestamp: new Date().getTime(),
              })

              user.rewards.runes[rune.key] -= rune.value
            }
          }
        }

        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            signature: await getSignedRequest('rune-databaser/sender')
          }),
        }
    
        const finalizeRes = await (await fetch(`http://35.245.242.215/claim/${e.args.requestId}/finalize`, requestOptions)).json() // ?${rand}

        if (finalizeRes.status !== 1) {
          await app.db.saveUser(user)
        }
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

    // console.log(JSON.stringify(newCoordinatorRequests, null, 2))

    log('Finished')
  } catch(e) {
    logError(e)
  }

  app.config.sender.updating = false
  app.config.sender.updatedDate = (new Date()).toString()
  app.config.sender.updatedTimestamp = new Date().getTime()

  // await saveItemsEvents()
  // await saveConfig()

  setTimeout(() => getAllSenderEvents(app), 5 * 60 * 1000)
}

export async function monitorSenderEvents(app) {
  await getAllSenderEvents(app)

  app.contracts.sender.on('RewardsSent', async () => {
    await getAllSenderEvents(app)
  })
}
