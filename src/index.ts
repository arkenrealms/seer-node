import * as dotenv from 'dotenv'
import { log, isDebug } from '@rune-backend-sdk/util'
import { subProcesses, catchExceptions } from '@rune-backend-sdk/util/process'
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
import { monitorAirtable } from './modules/airtable'
import { monitorSenderEvents } from './modules/sender'
import { engageDelaran } from './modules/delaran'
import { monitorOracle } from './modules/oracle'
import { initCubeBridge } from './modules/cube'
import { initNotices } from './modules/notices'
import { initSkinner } from './modules/skinner'
import { initLive } from './modules/live'
import { generateAccounts } from './modules/account-generator'
import { migrateTokens } from './migrate'
// import { runTest } from './modules/tests/test-a'
import * as tests from './tests'

dotenv.config()

// console.log('env', process.env)

process.env.REACT_APP_PUBLIC_URL = "https://rune.game/"

if (isDebug) {
  log('Running DB in DEBUG mode')
}

type App = {
  test: object
}

async function init() {
  catchExceptions(true)

  try {
    const app: any = {}

    app.subProcesses = subProcesses

    app.flags = {}

    app.admins = {
      '0xa987f487639920A3c2eFe58C8FBDedB96253ed9B': {
        permissions: {
          distribute: {}
        }
      }
    }

    app.games = {
      raid: {
        currentSeason: 0,
        realms: {}
      },
      evolution: {
        currentSeason: 2,
        realms: {}
      },
      infinite: {
        currentSeason: 0,
        realms: {}
      },
      guardians: {
        currentSeason: 0,
        realms: {}
      },
      sanctuary: {
        currentSeason: 0,
        realms: {}
      }
    }

    if (process.env.RUNE_ENV === 'airtable') {
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
        {
          name: 'monitorAirtable',
          instance: monitorAirtable,
          async: false,
          timeout: 5 * 1000
        },
      ]
    }

    if (process.env.RUNE_ENV === 'skinner') {
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
        {
          name: 'monitorSaves',
          instance: monitorSaves,
          async: false,
          timeout: 0
        },
        {
          name: 'initLive',
          instance: initLive,
          async: false,
          timeout: 0
        },
        {
          name: 'initSkinner',
          instance: initSkinner,
          async: false,
          timeout: 5 * 1000
        },
      ]
    }

      // LOCAL
      // {
      //   name: 'generateAccounts',
      //   instance: generateAccounts,
      //   async: false,
      //   timeout: 5 * 1000
      // },
      // {
      //   name: 'monitorAirtable',
      //   instance: monitorAirtable,
      //   async: false,
      //   timeout: 30 * 1000
      // },
      // {
      //   name: 'userLoadAndSave',
      //   instance: tests.userLoadAndSave,
      //   async: false,
      //   timeout: 10 * 1000
      // },
      // {
      //   name: 'runTest',
      //   instance: runTest,
      //   async: false,
      //   timeout: 1 * 1000
      // },
      // {
      //   name: 'convertRewards',
      //   instance: tests.convertRewards,
      //   async: true,
      //   timeout: 0
      // },
      // {
      //   name: 'migrateTokens',
      //   instance: migrateTokens,
      //   async: true,
      //   timeout: 0
      // },

    if (process.env.RUNE_ENV === 'production') {
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
        {
          name: 'initNotices',
          instance: initNotices,
          async: false,
          timeout: 0
        },
        {
          name: 'initLive',
          instance: initLive,
          async: false,
          timeout: 0
        },

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
          timeout: 3 * 60 * 1000
        },
        {
          name: 'monitorOracle',
          instance: monitorOracle,
          async: false,
          timeout: 0 * 1000
        },
        {
          name: 'monitorItemEvents',
          instance: monitorItemEvents,
          async: false,
          timeout: 1 * 1000
        },
        {
          name: 'monitorBarracksEvents',
          instance: monitorBarracksEvents,
          async: false,
          timeout: 1 * 1000
        },
        {
          name: 'monitorMarketEvents',
          instance: monitorMarketEvents,
          async: false,
          timeout: 1 * 1000
        },
        {
          name: 'monitorCharacterEvents',
          instance: monitorCharacterEvents,
          async: false,
          timeout: 1 * 1000
        },
        {
          name: 'monitorGeneralStats',
          instance: monitorGeneralStats,
          async: false,
          timeout: 1 * 1000
        },
        {
          name: 'monitorCraftingStats',
          instance: monitorCraftingStats,
          async: false,
          timeout: 1 * 1000
        },
        {
          name: 'monitorMeta',
          instance: monitorMeta,
          async: false,
          timeout: 1 * 1000
        },
        {
          name: 'monitorCoordinator',
          instance: monitorCoordinator,
          async: false,
          timeout: 1 * 1000
        },
        {
          name: 'engageDelaran',
          instance: engageDelaran,
          async: false,
          timeout: 30 * 1000
        },
      ]
    }

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
    log('Error', e)
  }
}

init()

// Force restart after an hour
// setTimeout(() => {
//   process.exit(1)
// }, 1 * 60 * 60 * 1000)