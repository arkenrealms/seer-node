import { t } from '@trpc/server';
import { z } from 'zod';
import { isDebug, log } from '@arken/node/util';
import { catchExceptions, subProcesses } from '@arken/node/util/process';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
import { monitorAirtable } from './modules/airtable';
import { initApi } from './modules/api';
import { getAllBarracksEvents, monitorBarracksEvents } from './modules/barracks';
import { getAllCharacterEvents, monitorCharacterEvents } from './modules/characters';
import { initConfig } from './modules/config';
import { monitorCoordinator } from './modules/coordinator';
import { monitorCraftingStats } from './modules/crafting';
import { initCubeBridge } from './modules/cube';
import { monitorDao } from './modules/dao';
import { initDb } from './modules/db';
import { engageDelaran } from './modules/delaran';
import { monitorEvolutionRealms } from './modules/evolution';
import { monitorGuildMemberDetails } from './modules/guild';
import { getAllItemEvents, monitorItemEvents } from './modules/items';
import { initLive } from './modules/live';
import { monitorMarketEvents } from './modules/market';
import { monitorMeta } from './modules/meta';
import { initNotices } from './modules/notices';
import { monitorOracle } from './modules/oracle';
import { initPaymentRequests } from './modules/payment-requests';
import { initPolls } from './modules/polls';
import { initReferrals } from './modules/referrals';
import { monitorSaves } from './modules/save';
import { monitorSenderEvents } from './modules/sender';
import { initSkinner } from './modules/skinner';
import { monitorGeneralStats } from './modules/stats';
import { convertPaymentRequests } from './modules/payment-request-converter';
import { initWeb3 } from './modules/web3';
// import { runTest } from './modules/tests/test-a'
import * as tests from './tests';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { AppDatabase, Application, Character } from '../types';
import { log } from '@arken/node/util';
import { emitAll, emitDirect } from '@arken/node/util/websocket';
import { getCharacter } from './character-utils';

dotenv.config();

// console.log('env', process.env)

process.env.REACT_APP_PUBLIC_URL = 'https://arken.gg/';

if (isDebug) {
  log('Running Databaser in DEBUG mode');
}

async function init() {
  catchExceptions(true);

  try {
    const app: any = {};

    app.subProcesses = subProcesses;

    app.flags = {};

    try {
      app.admins = await (
        await fetch('https://raw.githubusercontent.com/arken-engineering/council/main/admins.json')
      ).json();
    } catch (e) {
      app.admins = {
        '0xa987f487639920A3c2eFe58C8FBDedB96253ed9B': {
          name: 'ArkenRealms',
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
          name: 'ArkenGiveaways',
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
      };
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
    };

    if (process.env.ARKEN_ENV === 'airtable') {
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
      ];
    } else if (process.env.ARKEN_ENV === 'payments') {
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
      ];
    } else if (process.env.ARKEN_ENV === 'skinner') {
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
      ];
    } else if (process.env.ARKEN_ENV === 'dao') {
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
      ];
    } else if (process.env.ARKEN_ENV === 'local') {
      app.moduleConfig = [
        // {
        //   name: 'initConfig',
        //   instance: initConfig,
        //   async: false,
        //   timeout: 0,
        // },
        // {
        //   name: 'initDb',
        //   instance: initDb,
        //   async: false,
        //   timeout: 0,
        // },
        // {
        //   name: 'initApi',
        //   instance: initApi,
        //   async: false,
        //   timeout: 0,
        // },
        // {
        //   name: 'initWeb3',
        //   instance: initWeb3,
        //   async: false,
        //   timeout: 0,
        // },
        // {
        //   name: 'initLive',
        //   instance: initLive,
        //   async: false,
        //   timeout: 1 * 1000,
        // },
        // {
        //   name: 'initPaymentRequests',
        //   instance: initPaymentRequests,
        //   async: false,
        //   timeout: 1 * 1000,
        // },
        // {
        //   name: 'initPolls',
        //   instance: initPolls,
        //   async: false,
        //   timeout: 1 * 1000,
        // },
        // {
        //   name: 'initReferrals',
        //   instance: initReferrals,
        //   async: false,
        //   timeout: 1 * 1000,
        // },
        // // {
        // //   name: 'convertPaymentRequests',
        // //   instance: convertPaymentRequests,
        // //   async: false,
        // //   timeout: 5 * 1000
        // // },
        // // {
        // //   name: 'generateAccounts',
        // //   instance: generateAccounts,
        // //   async: false,
        // //   timeout: 5 * 1000
        // // },
        // // {
        // //   name: 'monitorAirtable',
        // //   instance: monitorAirtable,
        // //   async: false,
        // //   timeout: 30 * 1000
        // // },
        // // {
        // //   name: 'userLoadAndSave',
        // //   instance: tests.userLoadAndSave,
        // //   async: false,
        // //   timeout: 10 * 1000
        // // },
        // // {
        // //   name: 'runTest',
        // //   instance: runTest,
        // //   async: false,
        // //   timeout: 1 * 1000
        // // },
        // // {
        // //   name: 'convertRewards',
        // //   instance: tests.convertRewards,
        // //   async: true,
        // //   timeout: 0
        // // },
        // // {
        // //   name: 'migrateTokens',
        // //   instance: migrateTokens,
        // //   async: true,
        // //   timeout: 0
        // // },
      ];
    } else if (process.env.ARKEN_ENV === 'production') {
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
        // {
        //   name: 'monitorGuildMemberDetails',
        //   instance: monitorGuildMemberDetails,
        //   async: false,
        //   timeout: 1 * 60 * 1000,
        // },
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
      ];
    }

    app.modules = {};

    for (const module of app.moduleConfig) {
      app.modules[module.name] = module.instance;

      if (module.timeout) {
        setTimeout(async () => {
          if (module.async) {
            await module.instance(app);
          } else {
            module.instance(app);
          }
        }, module.timeout);
      } else {
        if (module.async) {
          await module.instance(app);
        } else {
          module.instance(app);
        }
      }
    }

    if (app.flags.testMigrateTrades) tests.migrateTrades(app);

    if (app.flags.testUpdateUserAchievements) tests.updateUserAchievements(app);

    if (app.flags.testSaveToken) tests.saveToken(app);

    if (app.flags.testMonitorMarketEvents) tests.monitorMarketEvents(app);
  } catch (e) {
    log('Error', e);
  }
}

init();

// Force restart after an hour
// setTimeout(() => {
//   process.exit(1)
// }, 1 * 60 * 60 * 1000)

export class OracleSeer {
  constructor(private app: Application) {}

  pingRequest(msg: any) {
    log('PingRequest', msg);
    this.app.io.emit('PingResponse');
  }

  pongRequest(msg: any) {
    log('PongRequest', msg);
    this.app.io.emit('PongResponse');
  }

  async unbanClient(req: { data: { target: string }; id: string }) {
    log('unbanClient', req);

    const user = await this.app.db.loadUser(req.data.target);
    delete user.isBanned;
    delete user.bannedReason;
    await this.app.db.saveUser(user);

    this.app.db.removeBanList('evolution', req.data.target);
    this.app.db.saveBanList();

    emitAll('UnbanUserRequest', {
      data: { target: req.data.target },
    });

    return { status: 1 };
  }

  async mod(req: { data: { body: { signature: { address: string } }; params: { method: string } } }) {
    log('mod', req);

    const user = await this.app.db.loadUser(req.data.body.signature.address);
    emitAll('playerAction', {
      key: 'moderator-action',
      createdAt: new Date().getTime() / 1000,
      address: user.address,
      username: user.username,
      method: req.data.params.method,
      message: `${user.username} called ${req.data.params.method}`,
    });

    return { status: 1 };
  }

  async banClient(req: { data: { target: string; reason: string; until?: number }; id: string }) {
    log('banClient', req);

    const user = await this.app.db.loadUser(req.data.target);
    user.isBanned = true;
    user.bannedReason = req.data.reason;
    user.bannedUntil = req.data.until || new Date().getTime() + 100 * 365 * 24 * 60 * 60; // 100 years by default

    await this.app.db.saveUser(user);
    this.app.db.addBanList('evolution', {
      address: req.data.target,
      reason: req.data.reason,
      until: req.data.until,
    });
    this.app.db.saveBanList();

    emitAll('BanUserRequest', {
      data: {
        target: req.data.target,
        createdAt: new Date().getTime(),
        bannedUntil: user.bannedUntil,
        bannedReason: user.bannedReason,
      },
    });

    return { status: 1 };
  }

  reportClient(msg: any) {
    log('reportClient', msg);

    const { currentGamePlayers, currentPlayer, reportedPlayer } = msg;

    if (currentPlayer.name.includes('Guest') || currentPlayer.name.includes('Unknown')) return; // No guest reports

    if (!this.app.db.evolution.reportList[reportedPlayer.address]) {
      this.app.db.evolution.reportList[reportedPlayer.address] = [];
    }

    if (!this.app.db.evolution.reportList[reportedPlayer.address].includes(currentPlayer.address)) {
      this.app.db.evolution.reportList[reportedPlayer.address].push(currentPlayer.address);
    }

    // Additional logic for handling reports and disconnects can be added here

    // Relay the report to connected realm servers
  }

  async getCharacter(req: { data: { address: string }; id: string }) {
    log('GetCharacterRequest', req);

    let character = CharacterCache[req.data.address];
    if (!character) {
      character = await getCharacter(this.app, req.data.address);
      CharacterCache[req.data.address] = character;
    }

    return { status: 1, character };
  }

  async saveRound(client, req) {
    log('SaveRoundRequest', this.app.realm.key, req);

    if (!(await this.isValidRequest(req)) && this.app.db.evolution.modList.includes(req.signature.address)) {
      log('Round invalid');

      client.socket.emit('SaveRoundResponse', {
        id: req.id,
        data: { status: 0, message: 'Invalid signature' },
      });
      return;
    }

    if (!req.data.lastClients) {
      log('Round no clients');

      client.socket.emit('SaveRoundResponse', {
        id: req.id,
        data: { status: 0, message: 'Error processing' },
      });
      return;
    }

    if (req.data.round.winners.length === 0) {
      this.app.realm.roundId += 1;

      log('Round skipped');

      client.socket.emit('SaveRoundResponse', {
        id: req.id,
        data: { status: 1 },
      });
      return;
    }

    if (req.data.rewardWinnerAmount > this.app.db.evolution.config.rewardWinnerAmountMax) {
      log(req.data.rewardWinnerAmount, this.app.db.evolution.config.rewardWinnerAmountMax);
      throw new Error('Big problem with reward amount');
    }

    let totalLegitPlayers = 0;

    for (const client of req.data.lastClients) {
      if (client.name.includes('Guest') || client.name.includes('Unknown')) continue;

      if (
        (client.powerups > 100 && client.kills > 1) ||
        (client.evolves > 20 && client.powerups > 200) ||
        (client.rewards > 3 && client.powerups > 200) ||
        client.evolves > 100 ||
        client.points > 1000
      ) {
        totalLegitPlayers += 1;
      }
    }

    if (totalLegitPlayers === 0) {
      totalLegitPlayers = 1;
    }

    if (
      req.data.rewardWinnerAmount >
      this.app.db.evolution.config.rewardWinnerAmountPerLegitPlayer * totalLegitPlayers
    ) {
      log(
        req.data.rewardWinnerAmount,
        this.app.db.evolution.config.rewardWinnerAmountPerLegitPlayer,
        totalLegitPlayers,
        req.data.lastClients.length,
        JSON.stringify(req.data.lastClients)
      );
      throw new Error('Big problem with reward amount 2');
    }

    if (req.data.roundId > this.app.realm.roundId) {
      this.app.realm.roundId = req.data.roundId;
    } else if (req.data.roundId < this.app.realm.roundId) {
      const err = `Round id too low (realm.roundId = ${this.app.realm.roundId})`;

      log(err);

      client.socket.emit('SaveRoundResponse', {
        id: req.id,
        data: { status: 0, message: err },
      });

      await this.setRealmConfig();

      return;
    } else {
      this.app.realm.roundId += 1;
    }

    const rewardWinnerMap = {
      0: Math.round(req.data.rewardWinnerAmount * 1 * 1000) / 1000,
      1: Math.round(req.data.rewardWinnerAmount * 0.25 * 1000) / 1000,
      2: Math.round(req.data.rewardWinnerAmount * 0.15 * 1000) / 1000,
      3: Math.round(req.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
      4: Math.round(req.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
      5: Math.round(req.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
      6: Math.round(req.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
      7: Math.round(req.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
      8: Math.round(req.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
      9: Math.round(req.data.rewardWinnerAmount * 0.05 * 1000) / 1000,
    };

    const removeDupes2 = (list) => {
      const seen = {};
      return list.filter((item) => {
        const k1 = item.address;
        if (seen[k1]) {
          return false;
        } else {
          seen[k1] = true;
          return true;
        }
      });
    };

    req.data.round.players = removeDupes2(req.data.round.players);

    const winners = req.data.round.winners.slice(0, 10);

    for (const winner of winners) {
      let character = this.CharacterCache[winner.address];

      if (!character) {
        character = await this.getCharacter(winner.address);
        this.CharacterCache[winner.address] = character;
      }

      // Additional reward logic based on character's meta data
    }

    for (const player of req.data.round.players) {
      const user = await this.app.db.loadUser(player.address);
      const now = new Date().getTime() / 1000;

      if (user.lastGamePlayed > now - 4 * 60) continue;

      if (!user.username) user.username = await this.getUsername(user.address);
      if (!user.username) continue;

      this.app.db.setUserActive(user);

      if (player.killStreak >= 10) {
        this.app.api.emitAll('PlayerAction', {
          key: 'evolution1-killstreak',
          createdAt: new Date().getTime() / 1000,
          address: user.address,
          username: user.username,
          message: `${user.username} got a ${player.killStreak} killstreak in Evolution`,
        });
        this.app.notices.add('evolution1-killstreak', {
          key: 'evolution1-killstreak',
          address: user.address,
          username: user.username,
          message: `${user.username} got a ${player.killStreak} killstreak in Evolution`,
        });
      }

      for (const pickup of player.pickups) {
        if (pickup.type === 'rune') {
          if (
            pickup.quantity >
            req.data.round.players.length * this.app.db.evolution.config.rewardItemAmountPerLegitPlayer * 2
          ) {
            log(
              pickup.quantity,
              this.app.db.evolution.config.rewardItemAmountPerLegitPlayer,
              req.data.round.players.length,
              JSON.stringify(req.data.round.players)
            );
            throw new Error('Big problem with item reward amount');
          }

          if (pickup.quantity > req.data.round.players.length * this.app.db.evolution.config.rewardItemAmountMax) {
            log(pickup.quantity, req.data.round.players.length, this.app.db.evolution.config.rewardItemAmountMax);
            throw new Error('Big problem with item reward amount 2');
          }

          const runeSymbol = pickup.rewardItemName.toLowerCase();
          if (!runes.includes(runeSymbol)) continue;

          user.rewards.runes[runeSymbol] = (user.rewards.runes[runeSymbol] || 0) + pickup.quantity;
          user.lifetimeRewards.runes[runeSymbol] = (user.lifetimeRewards.runes[runeSymbol] || 0) + pickup.quantity;

          this.app.db.evolution.config.itemRewards.runes[runeSymbol.toLowerCase()] -= pickup.quantity;
          this.app.db.oracle.outflow.evolutionRewards.tokens.week[runeSymbol.toLowerCase()] += pickup.quantity;
        } else {
          user.rewards.items[pickup.id] = {
            name: pickup.name,
            rarity: pickup.rarity,
            quantity: pickup.quantity,
          };

          user.lifetimeRewards.items[pickup.id] = {
            name: pickup.name,
            rarity: pickup.rarity,
            quantity: pickup.quantity,
          };
        }
      }

      user.lastGamePlayed = now;

      if (!user.evolution.hashes) user.evolution.hashes = [];
      if (!user.evolution.hashes.includes(player.hash)) user.evolution.hashes.push(player.hash);

      user.evolution.hashes = user.evolution.hashes.filter((item, pos) => user.evolution.hashes.indexOf(item) === pos);

      if (!this.app.games.evolution.realms[this.app.realm.key].leaderboard.names)
        this.app.games.evolution.realms[this.app.realm.key].leaderboard.names = {};

      this.app.games.evolution.realms[this.app.realm.key].leaderboard.names[user.address] = user.username;

      if (!this.app.games.evolution.realms[this.app.realm.key].leaderboard.raw.points[user.address]) {
        this.app.games.evolution.realms[this.app.realm.key].leaderboard.raw.monetary[user.address] = 0;
        this.app.games.evolution.realms[this.app.realm.key].leaderboard.raw.wins[user.address] = 0;
        this.app.games.evolution.realms[this.app.realm.key].leaderboard.raw.rounds[user.address] = 0;
        this.app.games.evolution.realms[this.app.realm.key].leaderboard.raw.kills[user.address] = 0;
        this.app.games.evolution.realms[this.app.realm.key].leaderboard.raw.points[user.address] = 0;
        this.app.games.evolution.realms[this.app.realm.key].leaderboard.raw.deaths[user.address] = 0;
        this.app.games.evolution.realms[this.app.realm.key].leaderboard.raw.powerups[user.address] = 0;
        this.app.games.evolution.realms[this.app.realm.key].leaderboard.raw.evolves[user.address] = 0;
        this.app.games.evolution.realms[this.app.realm.key].leaderboard.raw.rewards[user.address] = 0;
        this.app.games.evolution.realms[this.app.realm.key].leaderboard.raw.pickups[user.address] = 0;
      }

      this.app.games.evolution.realms[this.app.realm.key].leaderboard.raw.rounds[user.address] += 1;
      this.app.games.evolution.realms[this.app.realm.key].leaderboard.raw.kills[user.address] += player.kills;
      this.app.games.evolution.realms[this.app.realm.key].leaderboard.raw.points[user.address] += player.points;
      this.app.games.evolution.realms[this.app.realm.key].leaderboard.raw.deaths[user.address] += player.deaths;
      this.app.games.evolution.realms[this.app.realm.key].leaderboard.raw.powerups[user.address] += player.powerups;
      this.app.games.evolution.realms[this.app.realm.key].leaderboard.raw.evolves[user.address] += player.evolves;
      this.app.games.evolution.realms[this.app.realm.key].leaderboard.raw.rewards[user.address] += player.rewards;
      this.app.games.evolution.realms[this.app.realm.key].leaderboard.raw.pickups[user.address] +=
        player.pickups.length;

      if (!this.app.games.evolution.global.leaderboard.names) this.app.games.evolution.global.leaderboard.names = {};

      this.app.games.evolution.global.leaderboard.names[user.address] = user.username;

      if (!this.app.games.evolution.global.leaderboard.raw.points[user.address]) {
        this.app.games.evolution.global.leaderboard.raw.monetary[user.address] = 0;
        this.app.games.evolution.global.leaderboard.raw.wins[user.address] = 0;
        this.app.games.evolution.global.leaderboard.raw.rounds[user.address] = 0;
        this.app.games.evolution.global.leaderboard.raw.kills[user.address] = 0;
        this.app.games.evolution.global.leaderboard.raw.points[user.address] = 0;
        this.app.games.evolution.global.leaderboard.raw.deaths[user.address] = 0;
        this.app.games.evolution.global.leaderboard.raw.powerups[user.address] = 0;
        this.app.games.evolution.global.leaderboard.raw.evolves[user.address] = 0;
        this.app.games.evolution.global.leaderboard.raw.rewards[user.address] = 0;
        this.app.games.evolution.global.leaderboard.raw.pickups[user.address] = 0;
      }

      this.app.games.evolution.global.leaderboard.raw.rounds[user.address] += 1;
      this.app.games.evolution.global.leaderboard.raw.kills[user.address] += player.kills;
      this.app.games.evolution.global.leaderboard.raw.points[user.address] += player.points;
      this.app.games.evolution.global.leaderboard.raw.deaths[user.address] += player.deaths;
      this.app.games.evolution.global.leaderboard.raw.powerups[user.address] += player.powerups;
      this.app.games.evolution.global.leaderboard.raw.evolves[user.address] += player.evolves;
      this.app.games.evolution.global.leaderboard.raw.rewards[user.address] += player.rewards;
      this.app.games.evolution.global.leaderboard.raw.pickups[user.address] += player.pickups.length;

      if (winners.find((winner) => winner.address === player.address)) {
        const index = winners.findIndex((winner) => winner.address === player.address);
        if (user.username) {
          let character = this.CharacterCache[player.address];

          if (!character) {
            character = await this.getCharacter(player.address);
            this.CharacterCache[player.address] = character;
          }

          const WinRewardsIncrease = character?.meta?.[1150] || 0;
          const WinRewardsDecrease = character?.meta?.[1160] || 0;

          const rewardMultiplier = 1 + (WinRewardsIncrease - WinRewardsDecrease) / 100;

          if (rewardMultiplier > 2 || rewardMultiplier < 0) {
            log(
              'Error with reward multiplier.. bad things happened: ',
              rewardMultiplier,
              rewardMultiplier,
              WinRewardsDecrease
            );
            process.exit(5);
          }

          rewardWinnerMap[index] *= rewardMultiplier;

          if (!user.rewards.runes['zod']) {
            user.rewards.runes['zod'] = 0;
          }

          if (user.rewards.runes['zod'] < 0) {
            user.rewards.runes['zod'] = 0;
          }

          user.rewards.runes['zod'] += rewardWinnerMap[index];

          if (!user.lifetimeRewards.runes['zod']) {
            user.lifetimeRewards.runes['zod'] = 0;
          }

          user.lifetimeRewards.runes['zod'] += rewardWinnerMap[index];

          this.app.db.oracle.outflow.evolutionRewards.tokens.week['zod'] += rewardWinnerMap[index];

          this.app.games.evolution.global.leaderboard.raw.monetary[user.address] += rewardWinnerMap[index];
          this.app.games.evolution.realms[this.app.realm.key].leaderboard.raw.monetary[user.address] +=
            rewardWinnerMap[index];

          this.app.api.emitAll('PlayerAction', {
            key: 'evolution1-winner',
            createdAt: new Date().getTime() / 1000,
            address: user.address,
            username: user.username,
            realmKey: this.app.realm.key,
            placement: index + 1,
            message: `${user.username} placed #${index + 1} for ${rewardWinnerMap[index].toFixed(4)} ZOD in Evolution`,
          });

          if (rewardWinnerMap[index] > 0.1) {
            this.app.notices.add('evolution1-winner', {
              key: 'evolution1-winner',
              address: user.address,
              username: user.username,
              realmKey: this.app.realm.key,
              placement: index + 1,
              message: `${user.username} won ${rewardWinnerMap[index].toFixed(4)} ZOD in Evolution`,
            });
          }

          if (req.data.round.winners[0].address === player.address) {
            if (!this.app.games.evolution.realms[this.app.realm.key].leaderboard.raw)
              this.app.games.evolution.realms[this.app.realm.key].leaderboard.raw = {};
            if (!this.app.games.evolution.realms[this.app.realm.key].leaderboard.raw.wins)
              this.app.games.evolution.realms[this.app.realm.key].leaderboard.raw.wins = 0;

            this.app.games.evolution.realms[this.app.realm.key].leaderboard.raw.wins[user.address] += 1;

            if (!this.app.games.evolution.global.leaderboard.raw) this.app.games.evolution.global.leaderboard.raw = {};
            if (!this.app.games.evolution.global.leaderboard.raw.wins)
              this.app.games.evolution.global.leaderboard.raw.wins = 0;

            this.app.games.evolution.global.leaderboard.raw.wins[user.address] += 1;
          }
        }
      }

      await this.app.db.saveUser(user);
    }

    log('Round saved');

    return { status: 1 };
  }
}

const oracleSeer = new OracleSeer(context.app);

export const oracleSeerRouter = t.router({
  pingRequest: t.procedure.input(z.any()).mutation(({ input }) => oracleSeer.pingRequest(input)),
  pongRequest: t.procedure.input(z.any()).mutation(({ input }) => oracleSeer.pongRequest(input)),
  unbanClient: t.procedure
    .input(z.object({ data: z.object({ target: z.string() }), id: z.string() }))
    .mutation(({ input }) => oracleSeer.unbanClient(input)),
  mod: t.procedure
    .input(z.object({ data: z.object({ body: z.object({ signature: z.object({ address: z.string() }) }) }) }))
    .mutation(({ input }) => oracleSeer.mod(input)),
  banClient: t.procedure
    .input(
      z.object({
        data: z.object({ target: z.string(), reason: z.string(), until: z.number().optional() }),
        id: z.string(),
      })
    )
    .mutation(({ input }) => oracleSeer.banClient(input)),
  reportClient: t.procedure.input(z.any()).mutation(({ input }) => oracleSeer.reportClient(input)),
  getCharacter: t.procedure
    .input(z.object({ data: z.object({ address: z.string() }), id: z.string() }))
    .mutation(({ input }) => oracleSeer.getCharacter(input)),
  saveRound: t.procedure
    .input(
      z.object({
        data: z.object({
          signature: z.object({ address: z.string() }),
          lastClients: z.array(z.any()),
          rewardWinnerAmount: z.number(),
          round: z.object({ winners: z.array(z.any()), players: z.array(z.any()) }),
          roundId: z.number(),
        }),
        id: z.string(),
      })
    )
    .mutation(({ input }) => oracleSeer.saveRound(input)),
});
