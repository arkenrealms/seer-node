import fetch from 'node-fetch'
import { log, log } from '@rune-backend-sdk/util'

export async function monitorGuildMemberDetails(app) {
  try {
    const transformProfileResponse = (profileResponse) => {
      const { 0: userId, 1: numberPoints, 2: teamId, 3: nftAddress, 4: tokenId, 5: isActive } = profileResponse

      return {
        userId: Number(userId),
        points: Number(numberPoints),
        teamId: Number(teamId),
        tokenId: Number(tokenId),
        nftAddress,
        isActive,
      }
    }

    for (const g of app.db.guilds) {
      log(g)
      const guild = app.db.loadGuild(g.id)

      guild.memberDetails = []

      for (const member of guild.members) {
        const user = await app.db.loadUser(member)

        if (!user.username) {
          const usernameSearch = await ((await fetch(`https://rune-api.binzy.workers.dev/users/${user.address}`)).json())
    
          if (!!usernameSearch.message && usernameSearch.message === "No user exists" || !(usernameSearch.username)) {
            continue
          } else {
            user.username = usernameSearch.username
          }
        }

        const hasRegistered = (await app.contracts.profile.hasRegistered(user.address))

        if (!hasRegistered) continue

        const profileResponse = await app.contracts.profile.getUserProfile(user.address)
        const { userId, teamId, tokenId, nftAddress, isActive } = transformProfileResponse(profileResponse)

        if (teamId !== guild.id) continue

        user.isGuildMembershipActive = isActive
        user.guildMembershipTokenId = tokenId

        guild.memberDetails.push({
          address: user.address,
          username: user.username,
          points: user.points,
          achievementCount: user.achievements.length,
          isActive: user.isGuildMembershipActive,
          characterId: await app.contracts.characters.getCharacterId(tokenId)
        })

        // log(`Sync guild ${guild.id} member ${guild.memberDetails.length} / ${guild.memberCount}`)

        await app.db.saveUser(user)
      }

      await app.db.saveGuild(guild)
    }
  } catch(e) {
    log('Error', e)
  }

  setTimeout(() => monitorGuildMemberDetails(app), 5 * 60 * 60 * 1000)
}
