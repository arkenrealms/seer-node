import Web3 from 'web3'
import path from 'path'
import { getAddress, getRandomProvider } from '@rune-backend-sdk/util/web3'
import { log } from '@rune-backend-sdk/util'
import jetpack from 'fs-jetpack'

export async function generateAccounts(app) {
  try {
    app.accountGenerator = {}
    app.accountGenerator.startIndex = 0
    app.accountGenerator.total = 1000000
    app.accountGenerator.accounts = (jetpack.read(path.resolve(`./db/claimableAccounts.json`), 'json') || [])

    app.accountGenerator.web3Provider = getRandomProvider(app.secrets.find(s => s.id === 'account-generator'))
    app.accountGenerator.web3 = new Web3(app.accountGenerator.web3Provider)

    // for (let i = app.accountGenerator.startIndex; i < app.accountGenerator.startIndex + app.accountGenerator.total; i++) {
    //   const res = app.accountGenerator.web3.eth.accounts.create(i+'')
    //   console.log(i)
    //   app.accountGenerator.accounts.push(res.address)
    // }

    jetpack.writeAsync(path.resolve(`./db/claimableAccounts.json`), app.accountGenerator.accounts, { atomic: true, jsonIndent: 0 })
  } catch(e) {
    log('Error', e)
  }
}