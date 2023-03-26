import Web3 from 'web3'
import path from 'path'
import { getAddress, getRandomProvider } from '@rune-backend-sdk/util/web3'
import { log } from '@rune-backend-sdk/util'
import jetpack from 'fs-jetpack'

export async function generateAccounts(app) {
  try {
    const paymentRequests = await app.db.client.paymentRequest.findMany()
    // const paymentRequests = await app.db.client.paymentRequest.findMany({
    //   skip: 3,
    //   take: 10,
    // })
    console.log(paymentRequests)
    return
    
    app.accountGenerator = {}
    app.accountGenerator.startIndex = 0
    app.accountGenerator.endIndex = 100
    app.accountGenerator.accounts = (jetpack.read(path.resolve(`./db/claimableAccounts.json`), 'json') || {})

    app.accountGenerator.web3Provider = getRandomProvider(app.secrets.find(s => s.id === 'account-generator'))
    app.accountGenerator.web3 = new Web3(app.accountGenerator.web3Provider)

    for (let i = app.accountGenerator.startIndex; i < app.accountGenerator.endIndex; i++) {
      console.log(`Generating account ${i}`)
      
      const { address, sign } = app.accountGenerator.web3.eth.accounts.create(i+'')

      app.accountGenerator.accounts[address] = { evolution: sign('evolution').signature }
    }

    jetpack.writeAsync(path.resolve(`./db/claimableAccounts.json`), app.accountGenerator.accounts, { atomic: true, jsonIndent: 0 })
  } catch(e) {
    log('Error', e)
  }
}