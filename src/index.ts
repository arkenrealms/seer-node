console.time('Startup timer');

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
import * as database from '@arken/node/db';
import * as Arken from '@arken/node/types';
import { getFilter } from '@arken/node/util/api';
import { initWeb3 } from './web3';
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
import * as Seer from '@arken/seer-protocol';
import { isDebug, log } from '@arken/node/util';
import { catchExceptions, subProcesses } from '@arken/node/util/process';
import * as dotenv from 'dotenv';
import fetch from 'axios';
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
      app.admins = (await fetch('https://raw.githubusercontent.com/arkenrealms/council/main/admins.json')).data;
    } catch (e) {
      console.log('Could not fetch council. Exiting.');
      process.exit(0);
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

    // app.games = {
    //   raid: {
    //     currentSeason: 0,
    //     isSeasonActive: true,
    //     realms: {},
    //   },
    //   evolution: {
    //     currentSeason: 6,
    //     isSeasonActive: true,
    //     realms: {},
    //   },
    //   infinite: {
    //     currentSeason: 0,
    //     isSeasonActive: false,
    //     realms: {},
    //   },
    //   guardians: {
    //     currentSeason: 0,
    //     isSeasonActive: false,
    //     realms: {},
    //   },
    //   sanctuary: {
    //     currentSeason: 0,
    //     isSeasonActive: false,
    //     realms: {},
    //   },
    // };

    // app.modules = {};

    // for (const module of app.moduleConfig) {
    //   app.modules[module.name] = module.instance;

    //   if (module.timeout) {
    //     setTimeout(async () => {
    //       if (module.async) {
    //         await module.instance(app);
    //       } else {
    //         module.instance(app);
    //       }
    //     }, module.timeout);
    //   } else {
    //     if (module.async) {
    //       await module.instance(app);
    //     } else {
    //       module.instance(app);
    //     }
    //   }
    // }

    // if (app.flags.testMigrateTrades) tests.migrateTrades(app);

    // if (app.flags.testUpdateUserAchievements) tests.updateUserAchievements(app);

    // if (app.flags.testSaveToken) tests.saveToken(app);

    // if (app.flags.testMonitorMarketEvents) tests.monitorMarketEvents(app);
  } catch (e) {
    log('Error', e);
  }
}

class SeerNode extends Seer.Application {
  util = util;
  db: any = null;
  web3: any;
  filters: Record<string, any> = { applicationId: null };
  // TODO: improve
  service: Seer.Types.ApplicationServiceType = {};
  model: Seer.Types.ApplicationModelType = {};
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

        Evolution: new Seer.Evolution.Service(),
        Infinite: new Seer.Infinite.Service(),
        Oasis: new Seer.Oasis.Service(),
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

      if (!this.application) throw new Error('Cannot get Arken application');

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

      this.isHttps = process.env.ARKEN_ENV !== 'local';

      if (this.isHttps) {
        this.https = require('https').createServer(
          {
            key: fs.readFileSync('/etc/letsencrypt/live/hoff.arken.gg/privkey.pem'), //fs.readFileSync(path.resolve('./privkey.pem')),
            cert: fs.readFileSync('/etc/letsencrypt/live/hoff.arken.gg/fullchain.pem'), // fs.readFileSync(path.resolve('./fullchain.pem')),
          },
          this.server
        );
      } else {
        this.http = require('http').Server(this.server);
      }

      initWeb3(this);

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

      io.on('connection', async (socket: any) => {
        try {
          console.log('Connection', socket.id);

          socket.ctx = { app: this, client: { profile: null, roles: ['guest'], ioCallbacks: {} } };

          // socket.ctx.client = { profile: null, roles: ['guest'], ioCallbacks: {} };

          // if (process.env.ARKEN_ENV === 'local') {
          //   // socket.ctx.client.profile = await socket.ctx.app.model.Profile.findOne({ name: 'returnportal' }).exec();
          //   socket.ctx.client.roles.push('user');
          //   socket.ctx.client.roles.push('admin');
          // }

          socket.on('trpc', async (message) => {
            // console.log('Seer.Server trpc message', message);
            const { id, method, params } = message;

            try {
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

              const caller = createCaller(socket.ctx);

              console.log('Seer calling trpc route', method, params);
              // @ts-ignore
              const result = params ? await caller[method](deserialize(params)) : await caller[method]();

              console.log('Seer sending trpc response', method, params, JSON.stringify(result));
              socket.emit('trpcResponse', { id, result: serialize({ status: 1, data: result }) });
            } catch (error) {
              console.log('Server error', error);
              socket.emit('trpcResponse', {
                id,
                result: serialize({ status: 0 }),
                error: error?.stack + '' || 'Unknown error occurred',
              });
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
                socket.ctx.client.ioCallbacks[id] ? socket.ctx.client.ioCallbacks[id].request : ''
              );
              return;
            }

            try {
              log(`Seer client callback ${socket.ctx.client.ioCallbacks[id] ? 'Exists' : 'Doesnt Exist'}`);

              if (socket.ctx.client.ioCallbacks[id]) {
                clearTimeout(socket.ctx.client.ioCallbacks[id].timeout);

                socket.ctx.client.ioCallbacks[id].resolve(pack.result);

                delete socket.ctx.client.ioCallbacks[id];
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
