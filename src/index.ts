console.time('Startup timer');

import 'reflect-metadata';
import dotEnv from 'dotenv';
dotEnv.config();

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import fs from 'fs';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import _ from 'lodash';
import express from 'express';
import type { Application, ApplicationModelType, ApplicationServiceType } from '@arken/node/types';
import * as database from '@arken/node/db';
import * as Arken from '@arken/node/types';
import * as Seer from '@arken/seer-protocol';
import { getFilter } from '@arken/node/util/api';
import {
  Area,
  Asset,
  Chain,
  Character,
  Chat,
  Collection,
  Core,
  Game,
  Interface,
  Item,
  Job,
  Market,
  Product,
  Profile,
  Raffle,
  Skill,
  Video,
} from '@arken/node';
import { isDebug, log } from '@arken/node/util';
import { catchExceptions, subProcesses } from '@arken/node/util/process';
import * as dotenv from 'dotenv';
import fetch from 'axios';
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
import util from '@arken/node/util';
import { initTRPC } from '@trpc/server';
import { serialize, deserialize } from '@arken/node/util/rpc';
import { z } from 'zod';

// import { runTest } from './modules/tests/test-a'
import * as tests from './tests';

export const t = initTRPC.context<{}>().create();
export const router = t.router;
export const procedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

// console.log('env', process.env)

process.env.REACT_APP_PUBLIC_URL = 'https://arken.gg/';

if (isDebug) {
  log('Running Seer in DEBUG mode');
}

async function initModules() {
  catchExceptions(true);

  try {
    const app: any = {};

    app.subProcesses = subProcesses;

    app.flags = {};

    try {
      app.admins = (await fetch('https://raw.githubusercontent.com/arken-engineering/council/main/admins.json')).data;
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

class SeerNode extends Seer.SeerBase {
  util = util;
  db: any = null;
  filters: Record<string, any> = { applicationId: null };
  // TODO: improve
  service: ApplicationServiceType = {};
  model: ApplicationModelType = {};
  applications: any[] = [];
  declare application: any;
  declare cache: any;
  declare router: any; // TODO: fix
  declare server: any;
  declare isHttps: boolean;
  declare https: any;
  declare http: any;

  async init() {
    try {
      await initModules();

      this.router = Seer.createRouter();

      this.cache = {};

      this.db = await database.init({ app: this });

      // this.services = [
      //   { name: 'Job', isEnabled: true, service: services.Job },
      //   { name: 'Core', isEnabled: true, service: services.Core },
      // ];

      this.service = {
        Area: new Area.Service(),
        Asset: new Asset.Service(),
        Chain: new Chain.Service(),
        Character: new Character.Service(),
        Chat: new Chat.Service(),
        Collection: new Collection.Service(),
        Core: new Core.Service(),
        Game: new Game.Service(),
        Interface: new Interface.Service(),
        Item: new Item.Service(),
        Job: new Job.Service(),
        Market: new Market.Service(),
        Product: new Product.Service(),
        Profile: new Profile.Service(),
        Raffle: new Raffle.Service(),
        Skill: new Skill.Service(),
        Video: new Video.Service(),
      };

      for (const service of [
        Area,
        Asset,
        Chain,
        Character,
        Chat,
        Collection,
        Core,
        Game,
        Interface,
        Item,
        Job,
        Market,
        Product,
        Profile,
        Raffle,
        Skill,
        Video,
      ]) {
        for (const modelName of Object.keys(service.Models)) {
          const model = service.Models[modelName];

          this.cache[model.collection.name] = {};
          this.model[model.collection.name] = model;
        }
      }

      this.applications = await this.model.Application.find().populate('agents').exec();

      this.application = this.applications.find((application) => application.name === 'Arken');

      this.filters.applicationId = this.application.id;

      for (const modelName of Object.keys(this.model)) {
        const model = this.model[modelName];
        model.filters.applicationId = this.filters.applicationId;
      }

      this.server = express();
      this.server.set('trust proxy', 1);
      this.server.use(helmet());
      this.server.use(
        cors({
          allowedHeaders: [
            'Accept',
            'Authorization',
            'Cache-Control',
            'X-Requested-With',
            'Content-Type',
            'applicationId',
          ],
        })
      );

      this.isHttps = false; // process.env.ARKEN_ENV !== 'local';

      if (this.isHttps) {
        this.https = require('https').createServer(
          {
            key: fs.readFileSync(path.resolve('./privkey.pem')),
            cert: fs.readFileSync(path.resolve('./fullchain.pem')),
          },
          this.server
        );
      } else {
        this.http = require('http').Server(this.server);
      }

      const io = new SocketIOServer(this.isHttps ? this.https : this.http, {
        serveClient: false,
        // pingInterval: 30 * 1000,
        // pingTimeout: 90 * 1000,
        // upgradeTimeout: 20 * 1000,
        // allowUpgrades: true,
        // cookie: false,
        // serveClient: false,
        // allowEIO3: true,
        // cors: {
        //   origin: '*',
        // },
      });

      // io.use((socket, next) => {
      //   const origin = socket.handshake.headers.origin;

      //   // Example CORS logic
      //   if (origin && origin === 'http://your-allowed-origin.com') {
      //     // Allow the request to proceed
      //     next();
      //   } else {
      //     // Disallow the request with an error
      //     next(new Error('CORS policy error: Origin not allowed'));
      //   }
      // });

      io.on('connection', async (socket) => {
        try {
          console.log('Connection', socket.id);

          const client = { socket, roles: ['admin', 'user', 'guest'], ioCallbacks: {} };

          socket.on('trpc', async (message) => {
            console.log('Seer.Server trpc message', message);
            const { id, method, params } = message;

            try {
              const ctx = { app: this, client, profile: undefined };
              const createCaller = createCallerFactory(
                this.router
                // forgeServer.router({
                //   // connected: procedure
                //   //   .use(hasRole("admin", t))
                //   //   .use(customErrorFormatter(t))
                //   //   .input(schema.connected)
                //   //   .mutation(({ input, ctx }) =>
                //   //     service.connected(input as Schema.ConnectedInput, ctx)
                //   //   ),

                //   job: this.service.Job.router,
                //   core: this.service.Core.router,
                // })
              );

              const caller = createCaller(ctx);

              // @ts-ignore
              const result = params ? await caller[method](deserialize(params)) : await caller[method]();

              console.log('Seer sending trpc response', result);
              socket.emit('trpcResponse', { id, result: serialize(result) });
            } catch (error) {
              console.log('Server error', error);
              socket.emit('trpcResponse', { id, result: {}, error: error?.message || 'Unknown error occurred' });
            }
          });

          socket.on('trpcResponse', async (message) => {
            log('Seer client trpcResponse message', message);
            const pack = message;
            console.log('Seer client trpcResponse pack', pack);
            const { id } = pack;

            if (pack.error) {
              console.log(
                'Seer client callback - error occurred',
                pack,
                client.ioCallbacks[id] ? client.ioCallbacks[id].request : ''
              );
              return;
            }

            try {
              log(`Seer client callback ${client.ioCallbacks[id] ? 'Exists' : 'Doesnt Exist'}`);

              if (client.ioCallbacks[id]) {
                clearTimeout(client.ioCallbacks[id].timeout);

                client.ioCallbacks[id].resolve(pack.result);

                delete client.ioCallbacks[id];
              }
            } catch (e) {
              console.log('Seer client trpcResponse error', id, e);
            }
          });
        } catch (e) {
          console.log('Seer.Server error', e);
        }
      });

      const port = this.isHttps ? process.env.SSL_PORT || 443 : process.env.PORT || 80;
      const res = await (this.isHttps ? this.https : this.http).listen({ port: Number(port) });

      console.log(`Server ready and listening on ${JSON.stringify(res.address())} (http${this.isHttps ? 's' : ''})`);

      console.timeEnd('Startup timer');
    } catch (err) {
      console.info(err);
      console.error('Seer.Server error', err);
    }
  }

  // async updateRealm(
  //   input: Seer.Types.RouterInput['updateRealm'],
  //   ctx: Seer.Types.ServiceContext
  // ): Promise<Seer.Types.RouterOutput['updateRealm']> {
  //   if (!input) throw new Error('Input should not be void');

  //   const data = {};

  //   if (!this.realms[input.data.realmId]) this.realms[input.data.realmId] = {};

  //   const realm: Arken.Core.Types.Realm = this.realms[input.data.realmId];

  //   realm.status = input.data.status;
  //   realm.clientCount = input.data.clientCount;
  //   realm.regionCode = input.data.regionCode;
  //   realm.realmShards = input.data.realmShards;

  //   return {
  //     status: 1,
  //     data,
  //   };
  // }

  // async getRealms(
  //   input: Seer.Types.RouterInput['getRealms'],
  //   ctx: Seer.Types.ServiceContext
  // ): Promise<Seer.Types.RouterOutput['getRealms']> {
  //   console.log('getRealms');

  //   this.realms = [
  //     {
  //       status: 'Online',
  //       clientCount: 11,
  //       regionCode: 'EU',
  //       endpoint: 'localhost:7020',
  //       gameId: '673996aec43266df5f966da6',
  //       realmShards: [
  //         {
  //           status: 'Online',
  //           clientCount: 11,
  //           endpoint: 'localhost:7020',
  //         },
  //       ],
  //     },
  //   ];

  //   const data = this.realms;

  //   return {
  //     status: 1,
  //     data,
  //   };
  // }

  // async getTrades(
  //   input: Seer.Types.RouterInput['getTrades'],
  //   ctx: Seer.Types.ServiceContext
  // ): Promise<Seer.Types.RouterOutput['getTrades']> {
  //   console.log('Core.Service.getRealms', input);

  //   const filter = getFilter(input);

  //   const data = await this.model.Trade.find(filter).exec();

  //   console.log('vvvv', data);

  //   return { status: 1, data: data as Arken.Core.Types.Trade[] };
  // }
}

const seer = new SeerNode();

seer.init();

// Force restart after an hour
// setTimeout(() => {
//   process.exit(1)
// }, 1 * 60 * 60 * 1000)
