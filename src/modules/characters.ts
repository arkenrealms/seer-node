import * as ethers from 'ethers'
import { getHighestId, log, toShort } from '@rune-backend-sdk/util'
import { iterateBlocks, getAddress } from '@rune-backend-sdk/util/web3'

export async function getAllCharacterEvents(app, retry = false) {
  if (app.config.characters.updating) return

  log('[Characters] Updating')

  app.config.characters.updating = true

  try {
    const iface = new ethers.utils.Interface(app.contractMetadata.ArcaneCharacters.abi)

    // @ts-ignore
    async function processLog(logInfo, updateConfig = true) {
      const e = iface.parseLog(logInfo)
      
      // log(e.name, e)

      if (e.name === 'Transfer') {
        const { from, to: userAddress, tokenId } = e.args

        const user = await app.db.loadUser(userAddress)

        if (!user.characters.length) {
          log('New user: ' + userAddress)
        }

        const characterData = {
          owner: userAddress,
          from,
          status: from === '0x0000000000000000000000000000000000000000' ? "created" : 'transferred_in',
          tokenId: tokenId.toString(),
          transferredAt: new Date().getTime(),
          blockNumber: logInfo.blockNumber,
          tx: logInfo.transactionHash,
          id: await app.contracts.characters.getCharacterId(tokenId.toString())
        }

        await app.db.saveUserCharacter(user, characterData)
        // app.db.saveTokenTransfer(app.db.loadToken(characterData.tokenId), characterData)

        if (from === '0x0000000000000000000000000000000000000000') {
          // log('8888', logInfo, e)
          app.db.oracle.inflow.characterFees.tokens.week.rxs += app.config.characterMintCost

          await app.live.emitAll({ address: userAddress, username: user.username, message: `${user.username} created a new character` })
        } else {
          await app.db.saveUserCharacter(user, { ...characterData, status: 'transferred_out' })
        }

        await app.db.saveCharacterOwner(app.db.loadCharacter(characterData.id), characterData)
      }

      const e2 = app.db.charactersEvents.find(t => t.transactionHash === logInfo.transactionHash)

      if (!e2) {
        app.db.charactersEvents.push({
          id: getHighestId(app.db.charactersEvents) + 1,
          ...logInfo,
          ...e
        })
      }
    

      // if (updateConfig) {
      //   config.characters.lastBlock = logInfo.blockNumber
      //   saveConfig()
      // }
    }

    const blockNumber = await app.web3.eth.getBlockNumber()


    if (parseInt(blockNumber) > 10000) {
      const events = [
        'Transfer'
      ]
      
      for (const event of events) {
        await iterateBlocks(app, `Characters Events: ${event}`, getAddress(app.contractInfo.characters), app.config.characters.lastBlock[event], blockNumber, app.contracts.characters.filters[event](), processLog, async function (blockNumber2) {
          app.config.characters.lastBlock[event] = blockNumber2
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

  app.config.characters.updating = false
  app.config.characters.updatedDate = (new Date()).toString()
  app.config.characters.updatedTimestamp = new Date().getTime()

  // await saveCharactersEvents()
  // await saveConfig()

  if (retry) {
    setTimeout(() => getAllCharacterEvents(app), 30 * 60 * 1000)
  }
}

export async function monitorCharacterEvents(app) {
  app.contracts.characters.on('Transfer', async (from, to, tokenId, log) => {
    await app.modules.getAllCharacterEvents(app)
  })
}
