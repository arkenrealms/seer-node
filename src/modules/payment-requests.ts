export async function initPaymentRequests(app) {
  app.paymentRequests = {}

  app.api.addListener('GetClaims', function () {
    // GetClaims
    // GetPendingClaims
    // GetAddressClaims
    // GetClaimHistory
    // CreateClaimRequest
    // GetClaimStatus
    // FinalizeClaim
  })
}
