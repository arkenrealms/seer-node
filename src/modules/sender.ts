import fetch from 'node-fetch'
import * as ethers from 'ethers'
import { log, wait } from '@rune-backend-sdk/util'
import { iterateBlocks, getAddress, getSignedRequest } from '@rune-backend-sdk/util/web3'

async function monitorBalances(app) {
  
}

export async function getAllSenderEvents(app, retry = false) {
  if (app.config.sender.updating) return

  log('[Sender] Updating')

  app.config.sender.updating = true

  try {
    const contractAddressToKey = {}
  
    for (const contractKey of Object.keys(app.contractInfo)) {
      contractAddressToKey[app.contractInfo[contractKey][56]] = contractKey
    }
  
    const rand = Math.floor(Math.random() * Math.floor(999999))
    const response = await fetch(`${app.sender.coordinatorEndpoint}/data/claimRequests.json?${rand}`) // ?${rand}
    const claimRequests = await response.json()
  
    const iface = new ethers.utils.Interface(app.contractMetadata.RuneSenderV1.abi)

    // @ts-ignore
    async function processLog(log2, updateConfig = true) {
      try {
        const e = iface.parseLog(log2)
        
        console.log(e.name, e)
        const user = await app.db.loadUser(e.args.to)

        if (!user.claimRequests) user.claimRequests = []

        const coordinatorRequest = claimRequests.find(c => c.data?.requestId === e.args.requestId && c.status == 'completed')

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

              // if (!user.rewards.runes[rune.key]) {
              //   user.rewards.runes[rune.key] = 0
              // }

              // user.rewards.runes[rune.key] -= rune.value

              // if (user.rewards.runes[rune.key] < 0.000000001) {
              //   user.rewards.runes[rune.key] = 0
              // }
            }
          }
        }

        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            signature: await getSignedRequest(app.web3, app.secrets.find(s => s.id === 'coordinator-signer'), 'rune-databaser/sender')
          }),
        }
    
        const finalizeRes = await (await fetch(`${app.sender.coordinatorEndpoint}/claim/finalize/${e.args.requestId}`, requestOptions)).json() // ?${rand}

        if (finalizeRes.status !== 1) {
          await app.db.saveUser(user)

          //await app.live.emitAll({ address: trade.seller, username: seller.username, itemName: item.name, tokenId: trade.tokenId, message: `${seller.username} claimed ` })
        }
      } catch (ex) {
        log(ex)
        log("Error parsing log: ", log2)
        await wait(1000)
      }
    }

    const blockNumber = await app.web3.eth.getBlockNumber()


    if (parseInt(blockNumber) > 10000) {
      const events = [
        'RewardsSent(address,uint256,string)'
      ]
      
      for (const event of events) {
        await iterateBlocks(app, `Sender Events: ${event}`, getAddress(app.contractInfo.sender), app.config.sender.lastBlock[event] || 15000000, blockNumber, app.contracts.sender.filters[event](), processLog, async function (blockNumber2) {
          app.config.sender.lastBlock[event] = blockNumber2
          // await saveConfig()
        })
      }
    } else {
      log('Error parsing block number', blockNumber)
    }

    // console.log(JSON.stringify(newCoordinatorRequests, null, 2))

    log('Finished')
  } catch(e) {
    log('Error', e)
    await wait(1000)
  }

  app.config.sender.updating = false
  app.config.sender.updatedDate = (new Date()).toString()
  app.config.sender.updatedTimestamp = new Date().getTime()

  // await saveItemsEvents()
  // await saveConfig()

  if (retry) {
    setTimeout(() => getAllSenderEvents(app), 5 * 60 * 1000)
  }
}

export async function monitorSenderEvents(app) {
  app.sender = {}

  app.sender.coordinatorEndpoint = 'http://35.245.242.215'

  if (process.env.RUNE_ENV === 'local') {
    app.sender.coordinatorEndpoint = 'http://localhost:5001'
  }

  await getAllSenderEvents(app)

  app.contracts.sender.on('RewardsSent', async () => {
    await getAllSenderEvents(app)
  })
}
