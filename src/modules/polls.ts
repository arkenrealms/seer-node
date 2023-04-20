export async function initPolls(app) {
  app.polls = {}

  app.api.addListener('GetPolls', function () {
    // GetPolls
    // CreatePoll
    // GetPoll
    // VotePoll
  })
}
