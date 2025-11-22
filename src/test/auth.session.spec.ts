// src/test/auth.session.spec.ts

import express from 'express';
import request, { Response } from 'supertest';
import { mountAuth, type AuthDeps } from '../auth/mountAuth';

describe('mountAuth / ExpressAuth integration', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv };
    process.env.AUTH_SECRET = process.env.AUTH_SECRET ?? 'test-secret';
    process.env.ARKEN_ENV = 'local'; // default; override per-test as needed
    delete process.env.COOKIE_DOMAIN;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  /**
   * Helper to build mocked AuthDeps and give us access
   * to the underlying jest mocks.
   */
  function makeDeps(overrides: Partial<AuthDeps> = {}) {
    // ExpressAuth(cfg) → middleware fn (req, res, next)
    const ExpressAuthMock = jest.fn((_config: any) => {
      return (_req: any, _res: any, next: any) => next();
    });

    const getSessionMock = (overrides.getSession ?? jest.fn().mockResolvedValue(null)) as jest.Mock;

    const GoogleMock = overrides.Google ?? { id: 'google', name: 'Google' };

    const adapterMock = overrides.adapter ?? { type: 'adapter', client: 'fakeClient' };

    const deps: AuthDeps = {
      ExpressAuth: ExpressAuthMock,
      getSession: getSessionMock,
      Google: GoogleMock,
      adapter: adapterMock,
    };

    return { deps, ExpressAuthMock, getSessionMock };
  }

  it('wires /__echo and /api/session and calls ExpressAuth with expected config (local env, no cookies)', async () => {
    const app = express();
    const fakeSession = { user: { name: 'Alice', email: 'alice@example.com' } };

    const { deps, ExpressAuthMock, getSessionMock } = makeDeps({
      getSession: jest.fn().mockResolvedValue(fakeSession),
    });

    await mountAuth(app as any, deps);

    // /__echo route
    const echoRes: Response = await request(app).get('/__echo/some/path');
    expect(echoRes.status).toBe(200);
    expect(echoRes.body).toMatchObject({
      path: '/__echo/some/path',
      method: 'GET',
    });

    // ExpressAuth should have been called exactly once, with config
    expect(ExpressAuthMock).toHaveBeenCalledTimes(1);
    const passedConfig = ExpressAuthMock.mock.calls[0][0];

    expect(passedConfig).toMatchObject({
      trustHost: true,
      secret: 'test-secret',
      session: { strategy: 'database' },
    });

    // In local env, no cookies field should be present
    expect((passedConfig as any).cookies).toBeUndefined();

    // /api/session uses getSession and returns its value
    const sessRes: Response = await request(app).get('/api/session');
    expect(getSessionMock).toHaveBeenCalledTimes(1);
    // second arg to getSession is the config
    expect(getSessionMock.mock.calls[0][1]).toMatchObject({
      secret: 'test-secret',
      session: { strategy: 'database' },
    });

    expect(sessRes.status).toBe(200);
    expect(sessRes.body).toEqual(fakeSession);
  });

  it('configures secure cookies when ARKEN_ENV is not local', async () => {
    process.env.ARKEN_ENV = 'production';
    process.env.COOKIE_DOMAIN = '.arken.gg';
    process.env.AUTH_SECRET = 'prod-secret';

    const app = express();
    const { deps, ExpressAuthMock } = makeDeps();

    await mountAuth(app as any, deps);

    expect(ExpressAuthMock).toHaveBeenCalledTimes(1);
    const passedConfig = ExpressAuthMock.mock.calls[0][0];

    expect(passedConfig).toMatchObject({
      secret: 'prod-secret',
      cookies: {
        sessionToken: {
          name: '__Secure-arken.session-token',
          options: {
            domain: '.arken.gg',
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            secure: true,
          },
        },
      },
    });

    // Sanity check that routes still respond
    const res: Response = await request(app).get('/__echo/test');
    expect(res.status).toBe(200);
  });

  it('returns null from /api/session when getSession returns null', async () => {
    const app = express();

    const { deps, getSessionMock } = makeDeps({
      getSession: jest.fn().mockResolvedValue(null),
    });

    await mountAuth(app as any, deps);

    const res: Response = await request(app).get('/api/session');

    expect(getSessionMock).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    expect(res.body).toBeNull();
  });
});
