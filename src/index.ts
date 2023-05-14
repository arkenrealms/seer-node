import { isDebug, log } from '@runemetaverse/backend-sdk/build/util'
import { catchExceptions, subProcesses } from '@runemetaverse/backend-sdk/build/util/process'
import * as dotenv from 'dotenv'
import fetch from 'node-fetch'
import { monitorAirtable } from './modules/airtable'
import { initApi } from './modules/api'
import { getAllBarracksEvents, monitorBarracksEvents } from './modules/barracks'
import { getAllCharacterEvents, monitorCharacterEvents } from './modules/characters'
import { initConfig } from './modules/config'
import { monitorCoordinator } from './modules/coordinator'
import { monitorCraftingStats } from './modules/crafting'
import { initCubeBridge } from './modules/cube'
import { monitorDao } from './modules/dao'
import { initDb } from './modules/db'
import { engageDelaran } from './modules/delaran'
import { monitorEvolutionRealms } from './modules/evolution'
import { monitorGuildMemberDetails } from './modules/guild'
import { getAllItemEvents, monitorItemEvents } from './modules/items'
import { initLive } from './modules/live'
import { monitorMarketEvents } from './modules/market'
import { monitorMeta } from './modules/meta'
import { initNotices } from './modules/notices'
import { monitorOracle } from './modules/oracle'
import { initPaymentRequests } from './modules/payment-requests'
import { initPolls } from './modules/polls'
import { initReferrals } from './modules/referrals'
import { monitorSaves } from './modules/save'
import { monitorSenderEvents } from './modules/sender'
import { initSkinner } from './modules/skinner'
import { monitorGeneralStats } from './modules/stats'
import { convertPaymentRequests } from './modules/payment-request-converter'
import { initWeb3 } from './modules/web3'
// import { runTest } from './modules/tests/test-a'
import * as tests from './tests'

dotenv.config()

// console.log('env', process.env)

process.env.REACT_APP_PUBLIC_URL = 'https://rune.game/'

if (isDebug) {
  log('Running Databaser in DEBUG mode')
}

async function init() {
  catchExceptions(true)

  try {
    const app: any = {}

    app.subProcesses = subProcesses

    app.flags = {}

    try {
      app.admins = await (await fetch('https://raw.githubusercontent.com/RuneMetaverse/data/main/admins.json')).json()
    } catch (e) {
      app.admins = {
        '0xa987f487639920A3c2eFe58C8FBDedB96253ed9B': {
          name: 'RuneMetaverse',
          permissions: {
            distributeReward: {},
            distributeAchievement: {},
            evolution: {},
            infinite: {},
          },
        },
        '0xb1b1c99b365d39040334641a008e61e6e43968d3': {
          name: 'Riccardo',
          permissions: {
            distributeReward: {},
            distributeAchievement: {},
            evolution: {},
            infinite: {},
          },
        },
        '0x150F24A67d5541ee1F8aBce2b69046e25d64619c': {
          name: 'Maiev',
          permissions: {
            distributeReward: {},
            distributeAchievement: {},
            evolution: {},
            infinite: {},
          },
        },
        '0x1a367CA7bD311F279F1dfAfF1e60c4d797Faa6eb': {
          name: 'Testman',
          permissions: {
            evolution: {},
            infinite: {},
          },
        },
        '0x545612032BeaDED7E9f5F5Ab611aF6428026E53E': {
          name: 'Kevin',
          permissions: {
            evolution: {},
            infinite: {},
          },
        },
        '0x37470038C615Def104e1bee33c710bD16a09FdEf': {
          name: 'Maiev2',
          permissions: {
            evolution: {},
            infinite: {},
          },
        },
        '0xfE27380E57e5336eB8FFc017371F2147A3268fbE': {
          name: 'Lazy',
          permissions: {
            evolution: {},
            infinite: {},
          },
        },
        '0x3551691499D740790C4511CDBD1D64b2f146f6Bd': {
          name: 'Panda',
          permissions: {
            evolution: {},
            infinite: {},
          },
        },
        '0xe563983d6f46266Ad939c16bD59E5535Ab6E774D': {
          name: 'Discomonk',
          permissions: {
            evolution: {},
            infinite: {},
          },
        },
        '0x62c79c01c33a3761fe2d2aD6f8df324225b8073b': {
          name: 'Binzy',
          permissions: {
            evolution: {},
            infinite: {},
          },
        },
        '0x82b644E1B2164F5B81B3e7F7518DdE8E515A419d': {
          name: 'RuneGiveaways',
          permissions: {
            evolution: {},
            infinite: {},
          },
        },
        '0xeb3fCb993dDe8a2Cd081FbE36238E4d64C286AC0': {
          name: 'Ekkeharta',
          permissions: {
            evolution: {},
            infinite: {},
          },
        },
      }
    }

    // {
    //   '0xa987f487639920A3c2eFe58C8FBDedB96253ed9B': {
    //     permissions: {
    //       distribute: {},
    //       achievement: {}
    //     }
    //   },
    //   '0xb1b1c99b365d39040334641a008e61e6e43968d3': {
    //     permissions: {
    //       distribute: {},
    //       achievement: {}
    //     }
    //   },
    //   '0x150F24A67d5541ee1F8aBce2b69046e25d64619c': {
    //     permissions: {
    //       distribute: {},
    //       achievement: {}
    //     }
    //   }
    // }

    app.games = {
      raid: {
        currentSeason: 0,
        isSeasonActive: true,
        realms: {},
      },
      evolution: {
        currentSeason: 6,
        isSeasonActive: true,
        realms: {},
      },
      infinite: {
        currentSeason: 0,
        isSeasonActive: false,
        realms: {},
      },
      guardians: {
        currentSeason: 0,
        isSeasonActive: false,
        realms: {},
      },
      sanctuary: {
        currentSeason: 0,
        isSeasonActive: false,
        realms: {},
      },
    }

    if (process.env.RUNE_ENV === 'airtable') {
      app.moduleConfig = [
        {
          name: 'initConfig',
          instance: initConfig,
          async: false,
          timeout: 0,
        },
        {
          name: 'initDb',
          instance: initDb,
          async: false,
          timeout: 0,
        },
        // {
        //   name: 'initWeb3',
        //   instance: initWeb3,
        //   async: false,
        //   timeout: 0,
        // },
        {
          name: 'monitorAirtable',
          instance: monitorAirtable,
          async: false,
          timeout: 5 * 1000,
        },
      ]
    } else if (process.env.RUNE_ENV === 'payments') {
      app.moduleConfig = [
        {
          name: 'initConfig',
          instance: initConfig,
          async: false,
          timeout: 0,
        },
        {
          name: 'initDb',
          instance: initDb,
          async: false,
          timeout: 0,
        },
        {
          name: 'convertPaymentRequests',
          instance: convertPaymentRequests,
          async: false,
          timeout: 10,
        },
      ]
    } else if (process.env.RUNE_ENV === 'skinner') {
      app.moduleConfig = [
        {
          name: 'initConfig',
          instance: initConfig,
          async: false,
          timeout: 0,
        },
        {
          name: 'initDb',
          instance: initDb,
          async: false,
          timeout: 0,
        },
        {
          name: 'initWeb3',
          instance: initWeb3,
          async: false,
          timeout: 0,
        },
        {
          name: 'monitorSaves',
          instance: monitorSaves,
          async: false,
          timeout: 0,
        },
        {
          name: 'initLive',
          instance: initLive,
          async: false,
          timeout: 0,
        },
        {
          name: 'initSkinner',
          instance: initSkinner,
          async: false,
          timeout: 5 * 1000,
        },
      ]
    } else if (process.env.RUNE_ENV === 'dao') {
      app.moduleConfig = [
        {
          name: 'initConfig',
          instance: initConfig,
          async: false,
          timeout: 0,
        },
        {
          name: 'initDb',
          instance: initDb,
          async: false,
          timeout: 0,
        },
        {
          name: 'initWeb3',
          instance: initWeb3,
          async: false,
          timeout: 0,
        },
        {
          name: 'monitorSaves',
          instance: monitorSaves,
          async: false,
          timeout: 0,
        },
        {
          name: 'monitorDao',
          instance: monitorDao,
          async: false,
          timeout: 2 * 1000,
        },
      ]
    } else if (process.env.RUNE_ENV === 'local') {
      app.moduleConfig = [
        {
          name: 'initConfig',
          instance: initConfig,
          async: false,
          timeout: 0,
        },
        {
          name: 'initDb',
          instance: initDb,
          async: false,
          timeout: 0,
        },
        {
          name: 'initApi',
          instance: initApi,
          async: false,
          timeout: 0,
        },
        {
          name: 'initWeb3',
          instance: initWeb3,
          async: false,
          timeout: 0,
        },
        {
          name: 'initLive',
          instance: initLive,
          async: false,
          timeout: 1 * 1000,
        },
        {
          name: 'initPaymentRequests',
          instance: initPaymentRequests,
          async: false,
          timeout: 1 * 1000,
        },
        {
          name: 'initPolls',
          instance: initPolls,
          async: false,
          timeout: 1 * 1000,
        },
        {
          name: 'initReferrals',
          instance: initReferrals,
          async: false,
          timeout: 1 * 1000,
        },
        // {
        //   name: 'convertPaymentRequests',
        //   instance: convertPaymentRequests,
        //   async: false,
        //   timeout: 5 * 1000
        // },
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
      ]
    } else if (process.env.RUNE_ENV === 'production') {
      app.moduleConfig = [
        {
          name: 'initConfig',
          instance: initConfig,
          async: false,
          timeout: 0,
        },
        {
          name: 'initDb',
          instance: initDb,
          async: false,
          timeout: 0,
        },
        {
          name: 'initApi',
          instance: initApi,
          async: false,
          timeout: 0,
        },
        {
          name: 'initWeb3',
          instance: initWeb3,
          async: false,
          timeout: 0,
        },
        {
          name: 'initNotices',
          instance: initNotices,
          async: false,
          timeout: 0,
        },
        {
          name: 'initLive',
          instance: initLive,
          async: false,
          timeout: 1 * 1000,
        },
        {
          name: 'initPaymentRequests',
          instance: initPaymentRequests,
          async: false,
          timeout: 1 * 1000,
        },
        {
          name: 'initPolls',
          instance: initPolls,
          async: false,
          timeout: 1 * 1000,
        },
        {
          name: 'initReferrals',
          instance: initReferrals,
          async: false,
          timeout: 1 * 1000,
        },
        {
          name: 'monitorSenderEvents',
          instance: monitorSenderEvents,
          async: false,
          timeout: 5 * 1000,
        },
        {
          name: 'initCubeBridge',
          instance: initCubeBridge,
          async: false,
          timeout: 0,
        },
        {
          name: 'monitorEvolutionRealms',
          instance: monitorEvolutionRealms,
          async: false,
          timeout: 0,
        },
        {
          name: 'getAllItemEvents',
          instance: getAllItemEvents,
          async: false,
          timeout: 1 * 60 * 1000,
        },
        {
          name: 'getAllBarracksEvents',
          instance: getAllBarracksEvents,
          async: false,
          timeout: 1 * 60 * 1000,
        },
        {
          name: 'getAllCharacterEvents',
          instance: getAllCharacterEvents,
          async: false,
          timeout: 1 * 60 * 1000,
        },
        {
          name: 'monitorGuildMemberDetails',
          instance: monitorGuildMemberDetails,
          async: false,
          timeout: 1 * 60 * 1000,
        },
        {
          name: 'monitorSaves',
          instance: monitorSaves,
          async: false,
          timeout: 3 * 60 * 1000,
        },
        {
          name: 'monitorOracle',
          instance: monitorOracle,
          async: false,
          timeout: 0 * 1000,
        },
        {
          name: 'monitorDao',
          instance: monitorDao,
          async: false,
          timeout: 2 * 1000,
        },
        {
          name: 'monitorItemEvents',
          instance: monitorItemEvents,
          async: false,
          timeout: 1 * 1000,
        },
        {
          name: 'monitorBarracksEvents',
          instance: monitorBarracksEvents,
          async: false,
          timeout: 1 * 1000,
        },
        {
          name: 'monitorMarketEvents',
          instance: monitorMarketEvents,
          async: false,
          timeout: 1 * 1000,
        },
        {
          name: 'monitorCharacterEvents',
          instance: monitorCharacterEvents,
          async: false,
          timeout: 1 * 1000,
        },
        {
          name: 'monitorGeneralStats',
          instance: monitorGeneralStats,
          async: false,
          timeout: 1 * 1000,
        },
        {
          name: 'monitorCraftingStats',
          instance: monitorCraftingStats,
          async: false,
          timeout: 1 * 1000,
        },
        {
          name: 'monitorMeta',
          instance: monitorMeta,
          async: false,
          timeout: 1 * 1000,
        },
        {
          name: 'monitorCoordinator',
          instance: monitorCoordinator,
          async: false,
          timeout: 1 * 1000,
        },
        {
          name: 'engageDelaran',
          instance: engageDelaran,
          async: false,
          timeout: 30 * 1000,
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

    if (app.flags.testMigrateTrades) tests.migrateTrades(app)

    if (app.flags.testUpdateUserAchievements) tests.updateUserAchievements(app)

    if (app.flags.testSaveToken) tests.saveToken(app)

    if (app.flags.testMonitorMarketEvents) tests.monitorMarketEvents(app)
  } catch (e) {
    log('Error', e)
  }
}

init()

// Force restart after an hour
// setTimeout(() => {
//   process.exit(1)
// }, 1 * 60 * 60 * 1000)
