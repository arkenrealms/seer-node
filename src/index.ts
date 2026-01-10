// arken/packages/seer/packages/node/src/index.ts

console.time('Startup timer');

import dotEnv from 'dotenv';
dotEnv.config();

import * as ethers from 'ethers';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
import { createSocketTrpcHandler } from '@arken/node/trpc/socketServer';
import { attachTrpcResponseHandler, bindSocketClientEmit, createSocketProxyClient } from '@arken/node/trpc/socketLink';
import type { ExpressAuthConfig } from '@auth/express';
import { io as ioClient } from 'socket.io-client';
import { observable } from '@trpc/server/observable';
import { getSignedRequest } from '@arken/node/util/web3';
import { createTRPCProxyClient, TRPCClientError, httpBatchLink, createWSClient, wsLink } from '@trpc/client';
import { generateShortId } from '@arken/node/util/db';
import { randomName } from '@arken/node/util/string';
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
import * as Forge from '@arken/forge-protocol';
import { isDebug, log } from '@arken/node/util';
import { catchExceptions, subProcesses } from '@arken/node/util/process';
import * as dotenv from 'dotenv';
import fetch from 'axios';
import util from '@arken/node/util';
import { initTRPC } from '@trpc/server';
import { serialize, deserialize } from '@arken/node/util/rpc';
import { z } from 'zod';
import { createHash } from 'crypto';
import secrets from '../secrets.json';

// import { runTest } from './modules/tests/test-a'
import * as tests from './tests';
import { generateProof as generateLeafProof } from '@arken/node/util/zk'; // leaf-update zk proof

export const t = initTRPC.context<{}>().create();
export const router = t.router;
export const procedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

mongoose.set('debug', true);
// console.log('env', process.env)

process.env.REACT_APP_PUBLIC_URL = 'https://arken.gg/';

if (isDebug) {
  log('Running Seer in DEBUG mode');
}

function walletForIndex(index: number, provider: ethers.providers.Provider) {
  const hdNode = ethers.utils.HDNode.fromMnemonic(secrets.find((signer) => signer.id === 'default-signer').mnemonic);

  const child = hdNode.derivePath(`m/44'/60'/0'/0/${index}`);

  return new ethers.Wallet(child.privateKey, provider);
}

// let lastRemotePayloadTs = new Date(0).toISOString(); // or load from DB

function userIdToInt(userId: string) {
  const hex = createHash('sha256').update(userId).digest('hex');
  // take 8 hex chars => 32-bit
  return parseInt(hex.slice(0, 8), 16) >>> 0;
}

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
      console.log('Could not fetch the Seer Council. Exiting.');
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

async function nextCustodyIndex(Counter: any): Promise<number> {
  const doc = await Counter.findOneAndUpdate(
    { _id: 'custodyIndex' },
    { $inc: { seq: 1 } },
    {
      new: true,
      upsert: true,
    }
  ).exec();

  return doc.seq;
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
    try {
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
    } catch (e) {
      console.log('Seer snapshot creation failed: ' + e.message);
    }
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

        Trek: new Seer.Trek.Service(),
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
            'https://alpha.arken.gg',
            'http://localhost:8021',
            'http://arken.gg.local:8021',
          ],
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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

      // ✅ Handle preflight quickly
      this.server.options('*', cors());

      // ✅ Helmet with CSP that won't block Auth.js provider icons (remote svg/png)
      this.server.use(
        helmet({
          contentSecurityPolicy: {
            useDefaults: true,
            directives: {
              // allow Auth.js provider icons, and any https images
              'img-src': ["'self'", 'data:', 'https:'],

              // allow inline styles used by Auth.js pages (your auth page renders CSS)
              // if you want stricter later, we can tighten this.
              'style-src': ["'self'", "'unsafe-inline'", 'https:'],

              // allow inline SVGs if any (usually safe)
              'base-uri': ["'self'"],

              // if you later see CSP errors for fonts/scripts, we can adjust minimal directives
            },
          },
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
        // cors: {
        //   origin: [
        //     'https://arken.gg',
        //     'https://beta.arken.gg',
        //     'https://dev.arken.gg',
        //     'https://alpha.arken.gg',
        //     'http://localhost:8021',
        //     'http://arken.gg.local:8021',
        //   ],
        //   credentials: true,
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
            client: {
              profile: null,
              roles: ['guest'],
              // 👇 reusable helper replaces the inline emit/onAny plumbing
              emit: bindSocketClientEmit<Forge.Router>({
                client: { ioCallbacks: {}, socket } as any,
                socket,
                backendName: 'seer-client',
                logPrefix: 'Seer -> Client',
                roles: ['guest'],
                requestTimeoutMs: 15_000,
                logging: isDebug,
              }),
            },
            session: socket.authSession, // <-- here
          };

          console.log('socket.authSession', socket.authSession);

          // Example: lift to 'user' role if logged-in
          if (socket.ctx.session?.user?.id) {
            const sessionUserId = socket.ctx.session?.user?.id;

            let account = await this.model.Account.findOne({ sessionUserId }).exec();

            let addressIndex = account?.addressIndex;
            if (addressIndex == null) {
              addressIndex = await nextCustodyIndex(this.model.Counter);
            }

            let address = account?.address;

            if (!address) {
              // allocate an integer index for the user ONCE and store it
              // simplest hack: store custodyIndex = userIdToInt(sessionUserId) (not perfect, but deterministic)
              // better: allocate from a counter to avoid collisions
              // const addressIndex = account?.addressIndex ?? userIdToInt(sessionUserId);

              const wallet = walletForIndex(addressIndex, this.ethersProvider.bsc);
              address = wallet.address;
            }

            if (!account) {
              account = await this.model.Account.create({
                username: randomName(),
                meta: {},
                status: 'Active',
                email: address + '@arken.gg',
                address,
                addressIndex,
                sessionUserId,
              });
            }

            if (account.addressIndex == null || !account.address) {
              account.addressIndex = addressIndex;
              account.address = address;
              await account.save();
            }

            let profile;
            if (account.activeProfileId) {
              profile = await this.model.Profile.findOne({
                _id: account.activeProfileId,
                accountId: account._id, // strongly recommended
                applicationId: this.application.id, // strongly recommended
              }).exec();
            }

            if (!profile) {
              profile = await this.model.Profile.findOne({
                accountId: account._id, // strongly recommended
                applicationId: this.application.id, // strongly recommended
              }).exec();
            }

            if (!profile) {
              profile = await this.model.Profile.create({
                applicationId: this.application.id,
                accountId: account.id,
                name: 'Adventurer',
                key: account.key,
                meta: {},
                status: 'Active',
                address: account.address,
              });

              account.activeProfileId = profile._id;
              await account.save();
            }

            socket.ctx.client.profile = profile;

            const roles = ['guest'];

            if (
              profile.address.toLowerCase() === '0xDfA8f768d82D719DC68E12B199090bDc3691fFc7'.toLowerCase() || // realm
              profile.address.toLowerCase() === '0x81F8C054667046171C0EAdC73063Da557a828d6f'.toLowerCase() || // seer
              profile.address.toLowerCase() === '0x954246b18fee13712C48E5a7Da5b78D88e8891d5'.toLowerCase() // admin
            ) {
              roles.push('mod');
              roles.push('admin');
            }

            roles.push('user');

            socket.ctx.client.roles = roles;

            const permissions = {
              'character.create': roles.includes('mod'),
              'character.view': roles.includes('mod'),
              'character.remove': roles.includes('mod'),
              'character.update': roles.includes('mod'),
              'rewards.distribute': roles.includes('admin'),
              'character.data.write': roles.includes('mod'),
              'character.inventory.write': roles.includes('mod'),
              'profile.meta.write': roles.includes('mod'),
              // optionally narrower scopes:
              'character.data.write:evolution.quest.*': roles.includes('mod'),
            };

            socket.ctx.client.permissions = permissions;
          }

          // IMPORTANT: keep the ctx client's roles in sync for emit-context usage
          // (createSocketProxyClient sets op.context.client.roles, but we also want our real ctx client roles)
          // If you want emit() to reflect dynamic roles, rebind when roles change; for now, minimal parity:
          (socket.ctx.client as any).socket = socket;

          // Handle inbound "trpc" requests (client -> server)
          const handleSocketTrpc = createSocketTrpcHandler({
            router: this.router,
            createCallerFactory,
            log: console.log, // or your "log" util
          });

          socket.on('trpc', async (message) => {
            await handleSocketTrpc(socket, socket.ctx, message);
          });

          // NOTE:
          // We no longer need a custom socket.on('trpcResponse', ...) block here,
          // because bindSocketClientEmit(...) already attached the shared trpcResponse resolver.
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
      process.exit(0);
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
