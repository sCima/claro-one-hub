/* eslint-disable @typescript-eslint/no-require-imports */
const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const output = path.resolve(__dirname, '../build/services-test/src');
const originalFetch = global.fetch;
const originalWindow = global.window;
const originalEnv = { ...process.env };
const sessionKey = 'onehub.session';
const consentKey = 'onehub.lgpd.consent';
let storage;

beforeEach(() => {
  storage = new Map();
  global.window = {
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: (key) => storage.delete(key),
    },
    btoa, atob,
  };
  for (const key of Object.keys(process.env)) {
    if (key.startsWith('NEXT_PUBLIC_')) delete process.env[key];
  }
  for (const key of Object.keys(require.cache)) {
    if (key.startsWith(output + path.sep)) delete require.cache[key];
  }
  global.fetch = async () => { throw new Error('Unexpected network request'); };
});

afterEach(() => {
  global.fetch = originalFetch;
  if (originalWindow === undefined) delete global.window;
  else global.window = originalWindow;
  for (const key of Object.keys(process.env)) {
    if (key.startsWith('NEXT_PUBLIC_')) delete process.env[key];
  }
  Object.assign(process.env, originalEnv);
});

const service = (name) => require(path.join(output, 'services', name + '.js'));
const apiMode = () => {
  process.env.NEXT_PUBLIC_BACKEND_MODE = 'api';
  process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.test';
};
const input = { usuarioId: 'U-001', name: 'João Ação', canal: 'web', sessionId: 'S-1' };
const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const remoteToken = (patch = {}) => `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({
  sub: input.usuarioId, name: input.name, canal: input.canal, sid: input.sessionId,
  iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 1800, ...patch,
})}.signature`;

test('mock token round-trips Unicode and rejects tampering', async () => {
  const auth = service('authToken');
  const { token, payload } = await auth.issueToken(input);
  assert.deepEqual(auth.verifyToken(token), payload);
  assert.equal(auth.verifyToken(token + 'x'), null);
});

test('malformed API tokens return null instead of throwing', () => {
  apiMode();
  const auth = service('authToken');
  for (const token of ['a.!.b', 'a.b.c', '', 'a.b', 'a.b.c.d', 'a.bnVsbA.b']) {
    assert.equal(auth.verifyToken(token), null);
  }
});

test('tokens require complete finite claims and expire at the exact deadline', (t) => {
  t.mock.method(Date, 'now', () => 1_800_000_000_000);
  apiMode();
  const auth = service('authToken');
  const now = Math.floor(Date.now() / 1000);
  for (const patch of [
    { exp: undefined }, { exp: '9999999999' }, { exp: null }, { exp: now },
    { sid: '' }, { sub: '' }, { canal: 'invalid' }, { iat: 'yesterday' },
  ]) assert.equal(auth.verifyToken(remoteToken(patch)), null);
  assert.equal(auth.isExpired({ exp: NaN }), true);
  assert.equal(auth.secondsUntilExpiry({ exp: NaN }), 0);
});

test('API token issuance rejects invalid tokens and mismatched identities', async () => {
  apiMode();
  const auth = service('authToken');
  for (const token of ['garbage', remoteToken({ sub: 'someone-else' }), remoteToken({ sid: 'other-session' })]) {
    global.fetch = async () => Response.json({ token });
    await assert.rejects(auth.issueToken(input));
  }
});

test('invalid TTL configuration cannot create immortal or immediately expired sessions', () => {
  process.env.NEXT_PUBLIC_AUTH_TOKEN_TTL_SECONDS = 'NaN';
  process.env.NEXT_PUBLIC_SESSION_TTL_SECONDS = '-1';
  const { backendConfig } = require(path.join(output, 'config/backend.js'));
  assert.equal(backendConfig.auth.tokenTtlSeconds, 1800);
  assert.equal(backendConfig.session.ttlSeconds, 1800);
});

test('expired local sessions cannot be recovered by user or phone', async () => {
  const sessions = service('session');
  const session = sessions.createSession({ usuarioId: 'U-1', canalOrigem: 'web', telefone: '11999999999' });
  session.updatedAt = Date.now() - 1800_000;
  session.createdAt = session.updatedAt;
  storage.set(sessionKey, JSON.stringify(session));
  assert.equal(await sessions.loadSession('U-1'), null);
  assert.equal(await sessions.recoverSessionByPhone('11 99999-9999'), null);
});

test('session recovery rejects corrupt cached records', async () => {
  const sessions = service('session');
  storage.set(sessionKey, JSON.stringify({ usuarioId: 'U-1', status: 'ativa' }));
  assert.equal(await sessions.loadSession('U-1'), null);
});

test('active sessions survive round-trip and remain bound to the correct user and phone', async () => {
  const sessions = service('session');
  const session = sessions.createSession({ usuarioId: 'U-1', canalOrigem: 'web', telefone: '(11) 99999-9999' });
  await sessions.saveSession(session);
  assert.deepEqual(await sessions.loadSession('U-1'), session);
  assert.equal(await sessions.loadSession('U-2'), null);
  assert.deepEqual(await sessions.recoverSessionByPhone('11999999999'), session);
  assert.equal(await sessions.recoverSessionByPhone(''), null);
});

test('saving then clearing an API session deletes the same remote session', async () => {
  apiMode();
  const sessions = service('session');
  const session = sessions.createSession({ usuarioId: 'U-1', canalOrigem: 'web' });
  const calls = [];
  global.fetch = async (url, options) => {
    calls.push({ url, method: options?.method ?? 'GET' });
    return options?.method === 'DELETE' ? new Response(null, { status: 204 }) : Response.json(session);
  };
  await sessions.saveSession(session);
  await sessions.clearSession();
  assert.deepEqual(calls.map((call) => call.method), ['PUT', 'DELETE']);
  assert.ok(calls[1].url.endsWith('/' + session.sessionId));
  assert.equal(storage.get(sessionKey), undefined);
});

test('API session recovery rejects a response belonging to another user', async () => {
  apiMode();
  const sessions = service('session');
  const session = sessions.createSession({ usuarioId: 'U-other', canalOrigem: 'web' });
  global.fetch = async () => Response.json(session);
  await assert.rejects(sessions.loadSession('U-1'));
});

test('API session deletion reports remote failures and still clears local state', async () => {
  apiMode();
  const sessions = service('session');
  storage.set(sessionKey, JSON.stringify(sessions.createSession({ usuarioId: 'U-1', canalOrigem: 'web' })));
  global.fetch = async () => new Response(null, { status: 500 });
  await assert.rejects(sessions.clearSession());
  assert.equal(storage.get(sessionKey), undefined);
});

test('API mode never silently falls back to mock persistence without an endpoint', async () => {
  process.env.NEXT_PUBLIC_BACKEND_MODE = 'api';
  await assert.rejects(service('authToken').issueToken(input));
  await assert.rejects(service('session').loadSession('U-1'));
  await assert.rejects(service('incidents').loadIncidents());
  await assert.rejects(service('privacy').grantConsent());
});

test('consent is not recorded locally if the backend rejects it', async () => {
  apiMode();
  global.fetch = async () => new Response(null, { status: 403 });
  await assert.rejects(service('privacy').grantConsent());
  assert.equal(storage.get(consentKey), undefined);
});

test('consent revocation and erasure do not claim success on a server failure', async () => {
  apiMode();
  storage.set(consentKey, 'existing');
  storage.set(sessionKey, 'existing');
  global.fetch = async () => new Response(null, { status: 500 });
  const privacy = service('privacy');
  await assert.rejects(privacy.revokeConsent());
  await assert.rejects(privacy.requestErasure('S-1'));
  assert.equal(storage.get(consentKey), 'existing');
  assert.equal(storage.get(sessionKey), 'existing');
});

test('consent records with string booleans or wrong scope are rejected', () => {
  const privacy = service('privacy');
  for (const record of [{ granted: 'false' }, { granted: true, scope: 'other', ts: Date.now() }]) {
    storage.set(consentKey, JSON.stringify(record));
    assert.equal(privacy.readConsent(), null);
  }
});

test('successful privacy requests persist consent and remove erased session data', async () => {
  apiMode();
  global.fetch = async () => new Response(null, { status: 204 });
  const privacy = service('privacy');
  const record = await privacy.grantConsent();
  assert.deepEqual(privacy.readConsent(), record);
  await privacy.revokeConsent();
  assert.equal(privacy.readConsent(), null);
  storage.set(sessionKey, 'existing');
  await privacy.requestErasure('S-1');
  assert.equal(storage.get(sessionKey), undefined);
});

test('backend URLs do not produce double slashes', async () => {
  apiMode();
  process.env.NEXT_PUBLIC_API_BASE_URL += '/';
  global.fetch = async (url) => {
    assert.equal(url, 'https://api.example.test/incidents');
    return Response.json([]);
  };
  await service('incidents').loadIncidents();
});

test('logout waits for a pending save, then deletes it without restoring the local session', async () => {
  apiMode();
  const sessions = service('session');
  const session = sessions.createSession({ usuarioId: 'U-1', canalOrigem: 'web' });
  const calls = [];
  let releaseSave;
  const saveStarted = new Promise((started) => {
    global.fetch = async (_url, options) => {
      calls.push(options.method);
      if (options.method === 'PUT') {
        started();
        await new Promise((resolve) => { releaseSave = resolve; });
        return Response.json(session);
      }
      return new Response(null, { status: 204 });
    };
  });
  const saving = sessions.saveSession(session);
  await saveStarted;
  const clearing = sessions.clearSession();
  assert.equal(storage.get(sessionKey), undefined);
  releaseSave();
  await Promise.all([saving, clearing]);
  assert.deepEqual(calls, ['PUT', 'DELETE']);
  assert.equal(storage.get(sessionKey), undefined);
});

test('concurrent session writes reach the backend in call order', async () => {
  apiMode();
  const sessions = service('session');
  const first = sessions.createSession({ usuarioId: 'U-1', canalOrigem: 'web' });
  const second = sessions.appendMessage(first, { role: 'user', text: 'Olá', canal: 'web' });
  let requests = 0;
  let finishFirst;
  let notifyStarted;
  const started = new Promise((resolve) => { notifyStarted = resolve; });
  global.fetch = async (_url, options) => {
    requests += 1;
    if (requests === 1) {
      notifyStarted();
      await new Promise((resolve) => { finishFirst = resolve; });
    }
    return Response.json(JSON.parse(options.body));
  };
  const savingFirst = sessions.saveSession(first);
  await started;
  const savingSecond = sessions.saveSession(second);
  await Promise.resolve();
  const outstanding = requests;
  finishFirst();
  await Promise.all([savingFirst, savingSecond]);
  assert.equal(outstanding, 1, 'second write must wait for the first');
  assert.deepEqual(JSON.parse(storage.get(sessionKey)).historico, second.historico);
});

test('a historical message timestamp does not expire the current session', async () => {
  const sessions = service('session');
  const session = sessions.createSession({ usuarioId: 'U-1', canalOrigem: 'web' });
  const updated = sessions.appendMessage(session, { role: 'user', text: 'Histórico', canal: 'web', ts: 1 });
  await sessions.saveSession(updated);
  assert.ok(await sessions.loadSession('U-1'));
  assert.equal(updated.historico[0].ts, 1);
});

test('a load that finishes after logout cannot restore a session', async () => {
  apiMode();
  const sessions = service('session');
  const session = sessions.createSession({ usuarioId: 'U-1', canalOrigem: 'web' });
  let resolveLoad;
  global.fetch = () => new Promise((resolve) => { resolveLoad = resolve; });
  const loading = sessions.loadSession('U-1');
  await sessions.clearSession();
  resolveLoad(Response.json(session));
  assert.equal(await loading, null);
  assert.equal(storage.get(sessionKey), undefined);
});

test('a failed queued save does not prevent a later session from being saved', async () => {
  apiMode();
  const sessions = service('session');
  const session = sessions.createSession({ usuarioId: 'U-1', canalOrigem: 'web' });
  let calls = 0;
  global.fetch = async () => ++calls === 1
    ? new Response(null, { status: 500 }) : new Response(null, { status: 204 });
  const failed = sessions.saveSession(session);
  const succeeded = sessions.saveSession(session);
  await assert.rejects(failed);
  assert.deepEqual(await succeeded, session);
});

test('corrupt incident caches cannot crash consumers expecting a list', async () => {
  storage.set('onehub.incidents', JSON.stringify({ invalid: true }));
  assert.ok(Array.isArray(await service('incidents').loadIncidents()));
});

test('invalid incident responses are rejected at the API boundary', async () => {
  apiMode();
  const incidents = service('incidents');
  for (const value of [{}, [{ id: 'INC-1', status: 'ativo' }]]) {
    global.fetch = async () => Response.json(value);
    await assert.rejects(incidents.loadIncidents());
  }
});

test('empty incident lists stay empty and fixtures are not shared mutable state', async () => {
  const incidents = service('incidents');
  const first = await incidents.loadIncidents();
  first[0].servicos.length = 0;
  assert.ok((await incidents.loadIncidents())[0].servicos.length > 0);
  await incidents.saveIncidents([]);
  assert.deepEqual(await incidents.loadIncidents(), []);
});

test('specific Clara requests take precedence over broad billing and plan keywords', async () => {
  const nlu = service('claraNlu');
  for (const [question, expected] of [
    ['Preciso da segunda via da minha fatura', 'segunda_via_fatura'],
    ['Quero trocar meu plano', 'alterar_plano'],
    ['Quero falar com um atendente sobre minha fatura', 'solicitar_atendente'],
    ['Qual o valor da minha fatura?', 'consultar_fatura'],
    ['Qual meu plano?', 'consultar_plano'],
  ]) assert.equal((await nlu.detectIntent(question, 'S-1')).intent, expected, question);
});

test('unknown remote intent names cannot enter the supported intent domain', async () => {
  process.env.NEXT_PUBLIC_DIALOGFLOW_ENABLED = 'true';
  process.env.NEXT_PUBLIC_DIALOGFLOW_DETECT_INTENT_URL = 'https://api.example.test/clara';
  global.fetch = async () => Response.json({ intent: 'unknown_intent', confidence: 0.9 });
  const result = await service('claraNlu').detectIntent('ajuda', 'S-1');
  assert.equal(result.intent, 'fora_de_escopo');
  assert.equal(result.resolvedAuto, false);
});

test('logout targets the latest queued session even when an older save completes first', async () => {
  apiMode();
  const sessions = service('session');
  const first = sessions.createSession({ usuarioId: 'U-1', canalOrigem: 'web' });
  const second = sessions.createSession({ usuarioId: 'U-2', canalOrigem: 'app' });
  const deleted = [];
  let completeFirst;
  let completeSecond;
  let notifySecond;
  const secondStarted = new Promise((resolve) => { notifySecond = resolve; });
  let notifyFirst;
  const firstStarted = new Promise((resolve) => { notifyFirst = resolve; });
  global.fetch = async (url, options) => {
    if (options.method === 'DELETE') {
      deleted.push(url);
      return new Response(null, { status: 204 });
    }
    const saved = JSON.parse(options.body);
    if (saved.sessionId === first.sessionId) {
      notifyFirst();
      await new Promise((resolve) => { completeFirst = resolve; });
    } else {
      notifySecond();
      await new Promise((resolve) => { completeSecond = resolve; });
    }
    return Response.json(saved);
  };
  const savingFirst = sessions.saveSession(first);
  await firstStarted;
  const savingSecond = sessions.saveSession(second);
  completeFirst();
  await secondStarted;
  const clearing = sessions.clearSession();
  completeSecond();
  await Promise.all([savingFirst, savingSecond, clearing]);
  assert.deepEqual(deleted, ['https://api.example.test/sessions/' + second.sessionId]);
  assert.equal(storage.get(sessionKey), undefined);
});
