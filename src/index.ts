// seer/packages/node/src/index.ts

console.time('Startup timer');

import dotEnv from 'dotenv';
dotEnv.config();

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
import type { ExpressAuthConfig } from '@auth/express';
import { io as ioClient } from 'socket.io-client';
import { observable } from '@trpc/server/observable';
import { getSignedRequest } from '@arken/node/util/web3';
import { createTRPCProxyClient, TRPCClientError, httpBatchLink, createWSClient, wsLink } from '@trpc/client';
import { generateShortId } from '@arken/node/util/db';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import _ from 'lodash';
import express from 'express';
import type { Application } from 'express';
import * as database from '@arken/node/db';
import * as Arken from '@arken/node/types';
import { getFilter } from '@arken/node/util/api';
import { setZkVerifier } from '@arken/node/util/mongo';
import { hashEvents } from '@arken/node/util/mongo';
import { createSocketTrpcHandler } from '@arken/node/trpc/socketServer';
import { attachTrpcResponseHandler, createSocketProxyClient } from '@arken/node/trpc/socketLink';
import { initWeb3 } from './web3';
import { mountAuth } from './auth/mountAuth';
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
import { generateProof as generateLeafProof } from '@arken/node/util/zk'; // leaf-update zk proof

export const t = initTRPC.context<{}>().create();
export const router = t.router;
export const procedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

// console.log('env', process.env)

process.env.REACT_APP_PUBLIC_URL = 'https://arken.gg/';

if (isDebug) {
  log('Running Seer in DEBUG mode');
}

// let lastRemotePayloadTs = new Date(0).toISOString(); // or load from DB

async function initModules() {
  catchExceptions(true);

  setZkVerifier(async (payload, ctx) => {
    // 1. Recompute operation hash H from ctx.doc / ctx.update
    // 2. Call your zkSNARK verifier (snarkjs, etc.)
    // 3. Optionally check payload.walletAddress is allowed for this app/op
    return true; // or false
  });

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

interface Peer {
  client: any;
  emit: ReturnType<typeof createTRPCProxyClient<Seer.Router>>;
}

class SeerNode extends Seer.Application {
  util = util;
  data: any = null;
  db: any = null;
  web3: any;
  secrets: any; // Secrets for signing
  filters: Record<string, any> = { applicationId: null };
  // TODO: improve
  service: Seer.Types.ApplicationServiceType = {};
  model: Seer.Types.ApplicationModelType = {};
  applications: any[] = [];
  peer: Peer;

  declare router: Seer.Router;
  declare application: any;
  declare cache: any;
  declare server: any;
  declare isHttps: boolean;
  declare https: any;
  declare http: any;

  lastSnapshotSeq: number = 0;
  lastRemotePayloadTs: string = new Date(0).toISOString();

  // Simple placeholder snapshot proof generator.
  // Later you can switch this to a real Groth16/Plonk circuit for
  // { eventsHash, merkleRoot } -> proof / publicSignals.
  private async generateSnapshotProof(events: any[], merkleRoot: string) {
    if (process.env.ZK_SNAPSHOT_ENABLED === 'true') {
      // ⚠️ This is *not* semantically correct, just a placeholder
      const { proof, publicSignals } = await generateLeafProof({
        oldRoot: '0',
        newRoot: '0',
        oldLeaf: '0',
        newLeaf: '0',
        leafIndex: 0,
        siblings: [],
      });

      return { proof, publicSignals: publicSignals as string[] };
    }

    // Default: stub
    return {
      proof: null,
      publicSignals: [merkleRoot],
    };
  }

  async buildSeerSnapshot() {
    const SNAPSHOT_INTERVAL = 100;
    const LOCAL_SEER_ID = process.env.SEER_NODE_WALLET ?? 'seer-node-1';

    // 1. Load new events since last snapshot
    const events = await this.model.SeerEvent.find({ seq: { $gt: this.lastSnapshotSeq } })
      .sort({ seq: 1 })
      .limit(SNAPSHOT_INTERVAL)
      .lean()
      .exec();

    if (!events.length) return;

    const eventsHash = hashEvents(events);

    // TODO: replace with real Merkle tree over events
    const merkleRoot = eventsHash;

    // 🔧 For now, use the snapshot stub, not the leaf-update circuit.
    const { proof, publicSignals } = await this.generateSnapshotProof(events, merkleRoot);

    // 3. Store SeerPayload
    const payloadDoc = await this.model.SeerPayload.create({
      fromSeer: LOCAL_SEER_ID,
      applicationId: null, // or per-app if you split events by app
      events,
      eventsHash,
      merkleRoot,
      proof,
      publicSignals,
    });

    const maxSeq = events[events.length - 1].seq;
    this.lastSnapshotSeq = maxSeq;

    console.log(`Seer snapshot created: payloadId=${(payloadDoc as any).id}, events=${events.length}`);
  }

  async syncFromRemoteSeer() {
    if (!this.peer) {
      console.log('Peer has not been initialized');
      return;
    }

    // You'll need a trpcRemote client configured somewhere
    const { payloads } = await this.peer.emit.core.syncGetPayloadsSince.query({
      since: this.lastRemotePayloadTs,
    });

    if (!payloads || !payloads.length) return;

    // Insert them locally (or upsert + apply events)
    await this.model.SeerPayload.create(payloads);

    const last = payloads[payloads.length - 1];
    this.lastRemotePayloadTs = new Date(last.createdAt).toISOString();

    console.log(`Synced ${payloads.length} payloads from remote seer, lastTs=${this.lastRemotePayloadTs}`);

    // Optionally: apply payload.events to local Mongo
    // for (const p of payloads) {
    //   await this.applySeerPayloadEvents(p);
    // }
  }

  async connectPeer() {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      const client: Seer.Client = {};

      client.ioCallbacks = {};

      const isLocal = process.env.ARKEN_ENV === 'local';

      client.endpoint = process.env['PEER_ENDPOINT' + (isLocal ? '_LOCAL' : '')];

      log('Connecting to Peer', client.endpoint);

      client.socket = ioClient(client.endpoint, {
        transports: ['websocket'],
        upgrade: false,
        autoConnect: false,
        // pingInterval: 5000,
        // pingTimeout: 20000
        // extraHeaders: {
        //   "my-custom-header": "1234"
        // }
      } as any);

      attachTrpcResponseHandler({
        client: client as any,
        backendName: 'peer',
        logging: isDebug,
        onServerPush: ({ method, params }) => {
          // If the peer ever pushes server-initiated messages (no id),
          // you can route them here.
          log('Peer server push', method, params);
        },
      });

      this.peer = {
        client,
        emit: createSocketProxyClient<Seer.Router>({
          client,
          logPrefix: 'Seer -> Peer',
          roles: ['seer', 'admin', 'mod', 'user', 'guest'],
          requestTimeoutMs: 15_000,
        }),
      };

      const connect = async () => {
        // Initialize the realm server with status 1
        const signature = await getSignedRequest(this.web3, this.secrets, 'evolution');

        const res: Seer.RouterOutput['auth'] = await this.peer.emit.core.authorize.mutate({
          address: signature.address,
          token: signature.hash,
          data: signature.data,
        });

        log('Peer auth res', res);

        if (!res?.profile) {
          console.error('Could not connect to Peer. Retrying in 10 seconds.');

          setTimeout(connect, 10 * 1000);

          return;
        }

        log('Peer connected', res);
        resolve(null);
      };

      client.socket.on('connect', connect);
      client.socket.connect();
    });
  }

  async init() {
    // Kick off periodic snapshots
    setInterval(() => {
      this.buildSeerSnapshot().catch((err) => {
        console.error('buildSeerSnapshot error', err);
      });
    }, 60_000);

    setInterval(() => {
      this.syncFromRemoteSeer().catch((err) => {
        console.error('syncFromRemoteSeer error', err);
      });
    }, 5_00_000);

    try {
      await initModules();

      this.router = Seer.createRouter();

      const handleSocketTrpc = createSocketTrpcHandler({
        router: this.router,
        createCallerFactory,
        log: console.log, // or your "log" util
      });

      this.cache = {};

      this.data = {};

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

      this.cache.Profile.admin = await this.model.Profile.findOne({ name: 'Hashwarp' });

      this.server = express();
      this.server.set('trust proxy', 1);

      this.server.use(helmet());

      // Allow your SPA origins + cookies
      this.server.use(
        cors({
          origin: [
            'https://arken.gg',
            'https://beta.arken.gg',
            'https://dev.arken.gg',
            'http://localhost:8021',
            'http://arken.gg.local:8021',
          ],
          credentials: true,
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

      const { getSession, authConfig } = await mountAuth(this.server);

      // If you want sessions inside Socket.IO:
      io.use(async (socket, next) => {
        try {
          const sess = await getSession(socket.request as any, authConfig);
          (socket as any).authSession = sess;
          next();
        } catch (e) {
          next(e as any);
        }
      });

      io.on('connection', async (socket: any) => {
        try {
          console.log('Connection', socket.id);

          socket.ctx = {
            app: this,
            client: { profile: null, roles: ['guest'], ioCallbacks: {} },
            session: socket.authSession, // <-- here
          };

          // Example: lift to 'user' role if logged-in
          if (socket.ctx.session?.user) socket.ctx.client.roles.push('user');

          // socket.ctx.client = { profile: null, roles: ['guest'], ioCallbacks: {} };

          // if (process.env.ARKEN_ENV === 'local') {
          //   // socket.ctx.client.profile = await socket.ctx.app.model.Profile.findOne({ name: 'returnportal' }).exec();
          //   socket.ctx.client.roles.push('user');
          //   socket.ctx.client.roles.push('admin');
          // }

          socket.on('trpc', async (message) => {
            await handleSocketTrpc(socket, socket.ctx, message);
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

      // this.connectPeer();

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
