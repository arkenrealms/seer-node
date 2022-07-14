import Web3 from 'web3'
import { getAddress, getRandomProvider } from '@rune-backend-sdk/util/web3'
import { log } from '@rune-backend-sdk/util'
import jetpack from 'fs-jetpack'

export async function generateAccounts(app) {
  try {
    app.accountGenerator = {}
    app.accountGenerator.startIndex = 0
    app.accountGenerator.total = 100000
    app.accountGenerator.accounts = []

    app.accountGenerator.web3Provider = getRandomProvider(app.secrets.find(s => s.id === 'account-generator'))
    app.accountGenerator.web3 = new Web3(app.accountGenerator.web3Provider)

    for (let i = app.accountGenerator.startIndex; i < app.accountGenerator.startIndex + app.accountGenerator.total; i++) {
      const res = app.accountGenerator.web3.eth.accounts.create(i)

      app.accountGenerator.accounts.push(res)
    }
  } catch(e) {
    log('Error', e)
  }
}