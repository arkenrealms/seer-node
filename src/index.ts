import * as dotenv from 'dotenv'
import { log, logError, isDebug } from './util'
import { subProcesses, catchExceptions } from './util/process'
import { initConfig } from './modules/config'
import { initDb } from './modules/db'
import { initWeb3 } from './modules/web3'
import { monitorRealmServers } from './modules/monitorRealmServers'
import { migrateTrades } from './modules/migrateTrades'
import { getAllItemEvents } from './modules/getAllItemEvents'
import { getAllBarracksEvents } from './modules/getAllBarracksEvents'
import { getAllMarketEvents } from './modules/getAllMarketEvents'
import { getAllCharacterEvents } from './modules/getAllCharacterEvents'
import { monitorGuildMemberDetails } from './modules/monitorGuildMemberDetails'
import { monitorSaves } from './modules/monitorSaves'
import { monitorEvolutionStats2 } from './modules/monitorEvolutionStats2'
import { monitorItemEvents } from './modules/monitorItemEvents'
import { monitorBarracksEvents } from './modules/monitorBarracksEvents'
import { monitorMarketEvents } from './modules/monitorMarketEvents'
import { monitorCharacterEvents } from './modules/monitorCharacterEvents'
import { monitorGeneralStats } from './modules/monitorGeneralStats'
import { monitorCraftingStats } from './modules/monitorCraftingStats'
import { monitorEvolutionStats } from './modules/monitorEvolutionStats'
import { monitorMeta } from './modules/monitorMeta'
import { monitorCoordinator } from './modules/monitorCoordinator'
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
    app.provider = undefined
    app.web3 = undefined
    app.web3Provider  = undefined
    app.signer = undefined

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
      {
        name: 'monitorRealmServers',
        instance: monitorRealmServers,
        async: false,
        timeout: 0
      },
      // {
      //   name: 'getAllItemEvents',
      //   instance: getAllItemEvents,
      //   async: false,
      //   timeout: 1 * 60 * 1000
      // },
      // {
      //   name: 'getAllBarracksEvents',
      //   instance: getAllBarracksEvents,
      //   async: false,
      //   timeout: 1 * 60 * 1000
      // },
      // {
      //   name: 'getAllCharacterEvents',
      //   instance: getAllCharacterEvents,
      //   async: false,
      //   timeout: 1 * 60 * 1000
      // },
      // {
      //   name: 'monitorGuildMemberDetails',
      //   instance: monitorGuildMemberDetails,
      //   async: false,
      //   timeout: 1 * 60 * 1000
      // },
      // {
      //   name: 'monitorSaves',
      //   instance: monitorSaves,
      //   async: false,
      //   timeout: 5 * 60 * 1000
      // },
      // {
      //   name: 'monitorEvolutionStats2',
      //   instance: monitorEvolutionStats2,
      //   async: false,
      //   timeout: 1 * 10 * 1000
      // },
      // {
      //   name: 'getAllMarketEvents',
      //   instance: getAllMarketEvents,
      //   async: true,
      //   timeout: 0
      // },
      // {
      //   name: 'monitorItemEvents',
      //   instance: monitorItemEvents,
      //   async: true,
      //   timeout: 0
      // },
      // {
      //   name: 'monitorBarracksEvents',
      //   instance: monitorBarracksEvents,
      //   async: true,
      //   timeout: 0
      // },
      // {
      //   name: 'monitorMarketEvents',
      //   instance: monitorMarketEvents,
      //   async: true,
      //   timeout: 0
      // },
      // {
      //   name: 'monitorCharacterEvents',
      //   instance: monitorCharacterEvents,
      //   async: true,
      //   timeout: 0
      // },
      // {
      //   name: 'monitorGeneralStats',
      //   instance: monitorGeneralStats,
      //   async: true,
      //   timeout: 0
      // },
      // {
      //   name: 'monitorCraftingStats',
      //   instance: monitorCraftingStats,
      //   async: true,
      //   timeout: 0
      // },
      // {
      //   name: 'monitorEvolutionStats',
      //   instance: monitorEvolutionStats,
      //   async: true,
      //   timeout: 0
      // },
      // {
      //   name: 'monitorMeta',
      //   instance: monitorMeta,
      //   async: true,
      //   timeout: 0
      // },
      // {
      //   name: 'monitorCoordinator',
      //   instance: monitorCoordinator,
      //   async: true,
      //   timeout: 0
      // },
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
setTimeout(() => {
  process.exit(1)
}, 1 * 60 * 60 * 1000)