import path from 'path'
import jetpack from 'fs-jetpack'
import { log } from '@arken/node/util'
import oldPaymentRequests from '../data/oldPaymentRequests.json'

export async function convertPaymentRequests(app) {
  log('Convert payment requests')

  const application = await app.db.client.Application.findFirst({ where: { name: 'Arken Realms' } })
  const profile = await app.db.client.Profile.findFirst({ where: { name: 'RuneVault' } })

  for (const oldPaymentRequest of oldPaymentRequests) {
    const newPaymentRequest: Partial<any> = {
      meta: {
        id: oldPaymentRequest.id,
        address: oldPaymentRequest.address,
        username: oldPaymentRequest.username,
        tokenAddresses: oldPaymentRequest.tokenAddresses,
        tokenAmounts: oldPaymentRequest.tokenAmounts,
        to: oldPaymentRequest.to,
        tokenIds: oldPaymentRequest.tokenIds,
        itemIds: oldPaymentRequest.itemIds,
        claimedAt: oldPaymentRequest.claimedAt,
        signedData: oldPaymentRequest.signedData,
        data: oldPaymentRequest.data,
        message: oldPaymentRequest.message,
      },
      status: oldPaymentRequest.status,
      applicationId: application.id,
      ownerId: profile.id,
      createdBy: profile.id,
      editedBy: profile.id,
      deletedBy: profile.id,
      createdAt: new Date(oldPaymentRequest.createdAt),
      updatedAt: oldPaymentRequest.updatedAt ? new Date(oldPaymentRequest.updatedAt) : null,
    }
    console.log(newPaymentRequest)
    continue
    const res = await app.db.client.paymentRequest.create({
      data: newPaymentRequest,
    })

    console.log(res)
  }
}
