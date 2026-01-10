// src/auth/mountAuth.ts
import express from 'express';
import mongoose from 'mongoose';
import type { ExpressAuthConfig } from '@auth/express';

export type App = ReturnType<typeof express>;

export type AuthDeps = {
  // @auth/express
  ExpressAuth: (config: ExpressAuthConfig) => any;
  getSession: (req: any, config: ExpressAuthConfig) => Promise<any>;

  // Providers
  Google: any;
  Discord: any;
  GitHub: any;

  // Adapter instance (e.g. MongoDBAdapter(client))
  adapter: any;
};

/**
 * Pure / testable version: no dynamic import, no mongoose coupling.
 * Uses only injected deps.
 */
export async function mountAuthWithDeps(app: App, deps: AuthDeps) {
  const { ExpressAuth, getSession, Google, Discord, GitHub, adapter } = deps;

  const cookies =
    process.env.ARKEN_ENV !== 'local'
      ? ({
          sessionToken: {
            name: '__Secure-arken.session-token',
            options: {
              domain: process.env.COOKIE_DOMAIN ?? '.arken.gg',
              path: '/',
              httpOnly: true,
              sameSite: 'lax' as const,
              secure: true,
            },
          },
        } as const)
      : undefined;

  // Simple debug echo route
  app.get('/__echo/*', (req, res) => {
    res.json({
      baseUrl: req.baseUrl,
      path: req.path,
      originalUrl: req.originalUrl,
      method: req.method,
    });
  });

  const authConfig: ExpressAuthConfig = {
    trustHost: true,
    secret: process.env.AUTH_SECRET!,
    adapter,
    session: { strategy: 'database' },

    // Set AUTH_DEBUG=true to get useful logs
    debug: process.env.AUTH_DEBUG === 'true',

    // ✅ Providers enabled
    providers: [Discord, GitHub, Google],

    callbacks: {
      async session({ session, user }) {
        // With database sessions, Auth.js passes `user` here.
        if (session.user && user?.id) {
          (session.user as any).id = user.id;
        }
        return session;
      },

      async redirect({ url, baseUrl }) {
        if (url.startsWith('/')) return new URL(url, baseUrl).toString();
        try {
          const u = new URL(url);
          if (u.hostname === 'alpha.arken.gg') return url;
          if (u.hostname === 'arken.gg' || u.hostname.endsWith('.arken.gg')) return url;
        } catch {}
        return baseUrl;
      },
    },

    ...(cookies ? { cookies } : {}),
  };

  // ✅ Auth.js Express recommends wildcard mount
  app.use('/auth', ExpressAuth(authConfig));

  app.get('/api/session', async (req, res) => {
    const session = await getSession(req, authConfig);
    res.json(session ?? null);
  });

  return { getSession, authConfig };
}

/**
 * Runtime version: keeps your dynamic import behavior.
 * Not used in tests.
 */
export async function mountAuth(app: App, deps?: AuthDeps) {
  if (deps) {
    return mountAuthWithDeps(app, deps);
  }

  // Use real dynamic import without TS transform (prevents require() fallback)
  const din = new Function('s', 'return import(s)') as (s: string) => Promise<any>;

  const [authMod, googleMod, githubMod, discordMod, adapterMod] = await Promise.all([
    din('@auth/express'),
    din('@auth/core/providers/google'),
    din('@auth/core/providers/github'),
    din('@auth/core/providers/discord'),
    din('@auth/mongodb-adapter'),
  ]);

  const ExpressAuth = authMod.ExpressAuth;
  const getSession = authMod.getSession;

  const Google = googleMod.default;
  const GitHub = githubMod.default;
  const Discord = discordMod.default;

  const adapter = adapterMod.MongoDBAdapter(mongoose.connection.getClient());

  return mountAuthWithDeps(app, { ExpressAuth, getSession, Google, Discord, GitHub, adapter });
}
