import * as dotenv from 'dotenv'
import { log, logError, isDebug } from './util'
import { subProcesses, catchExceptions } from './util/process'
import { initConfig } from './modules/config'
import { initDb } from './modules/db'
import { initWeb3 } from './modules/web3'
import { convertRewards } from './modules/reward-converter'
import { monitorEvolutionRealms } from './modules/evolution'
import { migrateTrades } from './modules/trades'
import { monitorGuildMemberDetails } from './modules/guild'
import { monitorSaves } from './modules/save'
import { monitorItemEvents, getAllItemEvents } from './modules/items'
import { monitorBarracksEvents, getAllBarracksEvents } from './modules/barracks'
import { monitorMarketEvents, getAllMarketEvents } from './modules/market'
import { monitorCharacterEvents, getAllCharacterEvents } from './modules/characters'
import { monitorGeneralStats } from './modules/stats'
import { monitorCraftingStats } from './modules/crafting'
import { monitorMeta } from './modules/meta'
import { monitorCoordinator } from './modules/coordinator'
import { monitorSenderEvents } from './modules/sender'
import { initCubeBridge } from './modules/cube'
import * as tests from './tests'

dotenv.config()

process.env.REACT_APP_PUBLIC_URL = "https://rune.game/"

if (isDebug) {
  log('Running DB in DEBUG mode')
}

type App = {
  test: object
}

async function init() {
  catchExceptions()

  try {
    const app: any = {}

    app.subProcesses = subProcesses

    app.flags = {}

    app.moduleConfig = [
      {
        name: 'initConfig',
        instance: initConfig,
        async: false,
        timeout: 0
      },
      {
        name: 'initDb',
        instance: initDb,
        async: false,
        timeout: 0
      },
      {
        name: 'initWeb3',
        instance: initWeb3,
        async: false,
        timeout: 0
      },
      // {
      //   name: 'convertRewards',
      //   instance: convertRewards,
      //   async: true,
      //   timeout: 0
      // },
      {
        name: 'monitorSenderEvents',
        instance: monitorSenderEvents,
        async: false,
        timeout: 5 * 1000
      },
      {
        name: 'initCubeBridge',
        instance: initCubeBridge,
        async: false,
        timeout: 0
      },
      {
        name: 'monitorEvolutionRealms',
        instance: monitorEvolutionRealms,
        async: false,
        timeout: 0
      },
      {
        name: 'getAllItemEvents',
        instance: getAllItemEvents,
        async: false,
        timeout: 1 * 60 * 1000
      },
      {
        name: 'getAllBarracksEvents',
        instance: getAllBarracksEvents,
        async: false,
        timeout: 1 * 60 * 1000
      },
      {
        name: 'getAllCharacterEvents',
        instance: getAllCharacterEvents,
        async: false,
        timeout: 1 * 60 * 1000
      },
      {
        name: 'monitorGuildMemberDetails',
        instance: monitorGuildMemberDetails,
        async: false,
        timeout: 1 * 60 * 1000
      },
      {
        name: 'monitorSaves',
        instance: monitorSaves,
        async: false,
        timeout: 5 * 60 * 1000
      },
      {
        name: 'getAllMarketEvents',
        instance: getAllMarketEvents,
        async: true,
        timeout: 0
      },
      {
        name: 'monitorItemEvents',
        instance: monitorItemEvents,
        async: true,
        timeout: 0
      },
      {
        name: 'monitorBarracksEvents',
        instance: monitorBarracksEvents,
        async: true,
        timeout: 0
      },
      {
        name: 'monitorMarketEvents',
        instance: monitorMarketEvents,
        async: true,
        timeout: 0
      },
      {
        name: 'monitorCharacterEvents',
        instance: monitorCharacterEvents,
        async: true,
        timeout: 0
      },
      {
        name: 'monitorGeneralStats',
        instance: monitorGeneralStats,
        async: true,
        timeout: 0
      },
      {
        name: 'monitorCraftingStats',
        instance: monitorCraftingStats,
        async: true,
        timeout: 0
      },
      {
        name: 'monitorMeta',
        instance: monitorMeta,
        async: true,
        timeout: 0
      },
      {
        name: 'monitorCoordinator',
        instance: monitorCoordinator,
        async: true,
        timeout: 0
      },
    ]

    app.modules = {}
    
    for (const module of app.moduleConfig) {
      app.modules[module.name] = module.instance

      if (module.timeout) {
        setTimeout(async () => {
          if (module.async) {
            await module.instance(app)
          } else {
            module.instance(app)
          }
        }, module.timeout)
      } else {
        if (module.async) {
          await module.instance(app)
        } else {
          module.instance(app)
        }
      }
    }
  
    if (app.flags.testMigrateTrades)
      tests.migrateTrades(app)

    if (app.flags.testUpdateUserAchievements)
      tests.updateUserAchievements(app)

    if (app.flags.testSaveToken)
      tests.saveToken(app)

    if (app.flags.testMonitorMarketEvents)
      tests.monitorMarketEvents(app)
  } catch(e) {
    logError(e)
  }
}

init()

// Force restart after an hour
// setTimeout(() => {
//   process.exit(1)
// }, 1 * 60 * 60 * 1000)