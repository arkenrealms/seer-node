import path from 'path'
import jetpack from 'fs-jetpack'
import beautify from 'json-beautify'
import { log } from '@rune-backend-sdk/util'

export async function monitorCraftingStats(app) {
  try {
    // Update crafting competitions
    {
      log('Update crafting competitions')

      const craftersData = jetpack.read(path.resolve('./db/crafting/overall.json'), 'json')
      const craftingCompetition1Data = jetpack.read(path.resolve('./db/crafting/competition1.json'), 'json')
      const craftingCompetition2Data = jetpack.read(path.resolve('./db/crafting/competition2.json'), 'json')
      const craftingCompetition3Data = jetpack.read(path.resolve('./db/crafting/competition3.json'), 'json')

      const data = {
        all: [
          { name: 'Overall', count: 10, data: craftersData.total },
          { name: 'Genesis', count: 3, data: craftersData.genesis },
          { name: 'Destiny', count: 3, data: craftersData.destiny },
          { name: 'Grace', count: 3, data: craftersData.grace },
          { name: 'Glory', count: 3, data: craftersData.glory },
          { name: 'Titan', count: 3, data: craftersData.titan },
          { name: 'Smoke', count: 3, data: craftersData.smoke },
          { name: 'Flash', count: 3, data: craftersData.flash },
          { name: 'Lorekeeper', count: 3, data: craftersData.lorekeeper },
          { name: 'Fury', count: 3, data: craftersData.fury },
          { name: 'Steel', count: 3, data: craftersData.steel },
        ],
        competition1: [
          { name: 'Overall', count: 10, data: craftingCompetition1Data.total },
          { name: 'Titan', count: 3, data: craftingCompetition1Data.titan },
          { name: 'Smoke', count: 3, data: craftingCompetition1Data.smoke },
          { name: 'Flash', count: 3, data: craftingCompetition1Data.flash },
        ],
        competition2: [
          { name: 'Overall', count: 10, data: craftingCompetition2Data.total },
          { name: 'Destiny', count: 3, data: craftingCompetition2Data.destiny },
          { name: 'Grace', count: 3, data: craftingCompetition2Data.grace },
          { name: 'Glory', count: 3, data: craftingCompetition2Data.glory },
          { name: 'Titan', count: 3, data: craftingCompetition2Data.titan },
          { name: 'Flash', count: 3, data: craftingCompetition2Data.flash },
          { name: 'Fury', count: 3, data: craftingCompetition2Data.fury },
        ],
        competition3: [
          { name: 'Overall', count: 10, data: craftingCompetition3Data.total },
          { name: 'Fury', count: 3, data: craftingCompetition3Data.fury },
          { name: 'Flash', count: 3, data: craftingCompetition3Data.flash },
          { name: 'Titan', count: 3, data: craftingCompetition3Data.titan },
          { name: 'Glory', count: 3, data: craftingCompetition3Data.glory },
          { name: 'Grace', count: 3, data: craftingCompetition3Data.grace },
          { name: 'Genesis', count: 3, data: craftingCompetition3Data.genesis },
          { name: 'Destiny', count: 3, data: craftingCompetition3Data.destiny },
          { name: 'Wrath', count: 3, data: craftingCompetition3Data.wrath },
          { name: 'Fortress', count: 3, data: craftingCompetition3Data.fortress },
          { name: 'Elder', count: 3, data: craftingCompetition3Data.elder },
          { name: 'Pledge', count: 3, data: craftingCompetition3Data.pledge }
        ],
        competition4: []
      }

      jetpack.write(path.resolve('../db/crafting/leaderboard.json'), beautify(data, null, 2), { atomic: true, jsonIndent: 0 })
    }
  } catch(e) {
    log('Error', e)
  }

  setTimeout(() => monitorCraftingStats(app), 2 * 60 * 1000)
}