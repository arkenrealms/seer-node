export async function initPaymentRequests(app) {
  app.paymentRequests = {}

  app.api.on('GetClaims', function () {
    // GetClaims
    // GetPendingClaims
    // GetAddressClaims
    // GetClaimHistory
    // CreateClaimRequest
    // GetClaimStatus
    // FinalizeClaim
  })
}
