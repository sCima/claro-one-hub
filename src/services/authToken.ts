/* ─────────────────────────────────────────────────────────────────────────────
 * One Hub · Autenticação com token de sessão (RNF005)
 *
 * Modo mock  → emite/valida um JWT localmente (assinatura HMAC simulada).
 * Modo api   → delega para o endpoint de autenticação do backend real.
 *
 * O formato do token é um JWT de verdade (header.payload.signature em base64url),
 * então o mesmo código de leitura serve para os dois modos.
 * ───────────────────────────────────────────────────────────────────────────── */

import { backendConfig, isApiMode, requireEndpoint } from '../config/backend';
import type { Canal } from './session';

export interface TokenPayload {
  sub: string;        // usuario_id
  name: string;
  canal: Canal;       // canal onde a sessão foi autenticada
  sid: string;        // session_id vinculado
  iat: number;        // emitido em (epoch s)
  exp: number;        // expira em (epoch s)
}

export interface AuthResult {
  token: string;
  payload: TokenPayload;
}

/* ─── base64url helpers (browser-safe) ──────────────────────────────────────── */
function b64urlEncode(obj: unknown): string {
  const json = JSON.stringify(obj);
  const b64 = typeof window === 'undefined'
    ? Buffer.from(json).toString('base64')
    : window.btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode<T = unknown>(seg: string): T {
  const b64 = seg.replace(/-/g, '+').replace(/_/g, '/');
  const json = typeof window === 'undefined'
    ? Buffer.from(b64, 'base64').toString('utf8')
    : decodeURIComponent(escape(window.atob(b64)));
  return JSON.parse(json) as T;
}

/* Assinatura simulada — determinística, só para o modo mock.
 * NÃO é criptograficamente segura; o backend real usa HMAC-SHA256 de verdade. */
function mockSignature(header: string, payload: string): string {
  const data = `${header}.${payload}.${backendConfig.auth.mockSecret}`;
  let h = 0;
  for (let i = 0; i < data.length; i++) {
    h = (Math.imul(31, h) + data.charCodeAt(i)) | 0;
  }
  return b64urlEncode({ s: h >>> 0 });
}

/* ─── API pública ──────────────────────────────────────────────────────────── */

export interface IssueTokenInput {
  usuarioId: string;
  name: string;
  canal: Canal;
  sessionId: string;
}

/** Emite um token de sessão para o cliente autenticado. */
export async function issueToken(input: IssueTokenInput): Promise<AuthResult> {
  if (isApiMode) {
    const endpoint = requireEndpoint(backendConfig.auth.endpoint, 'auth');
    const res = await fetch(`${endpoint}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`auth/token ${res.status}`);
    const { token } = (await res.json()) as { token: string };
    const payload = verifyToken(token);
    if (!payload || payload.sub !== input.usuarioId || payload.sid !== input.sessionId || payload.canal !== input.canal) {
      throw new Error('auth/token retornou um token inválido ou de outra sessão');
    }
    return { token, payload };
  }

  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    sub: input.usuarioId,
    name: input.name,
    canal: input.canal,
    sid: input.sessionId,
    iat: now,
    exp: now + backendConfig.auth.tokenTtlSeconds,
  };
  const h = b64urlEncode({ alg: 'HS256', typ: 'JWT' });
  const p = b64urlEncode(payload);
  const token = `${h}.${p}.${mockSignature(h, p)}`;
  return { token, payload };
}

/** Lê o payload do token sem validar assinatura (uso de exibição). */
export function decodeToken(token: string): TokenPayload | null {
  try {
    if (typeof token !== 'string' || !/^[\w-]+\.[\w-]+\.[\w-]+$/.test(token)) return null;
    const [, p] = token.split('.');
    const payload = b64urlDecode<Partial<TokenPayload> | null>(p);
    if (!payload || typeof payload !== 'object' ||
      typeof payload.sub !== 'string' || !payload.sub.trim() ||
      typeof payload.sid !== 'string' || !payload.sid.trim() ||
      typeof payload.name !== 'string' ||
      !['web', 'app', 'whatsapp'].includes(payload.canal ?? '') ||
      !Number.isSafeInteger(payload.iat) || !Number.isSafeInteger(payload.exp) ||
      payload.iat! < 0 || payload.exp! <= payload.iat!) return null;
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Valida estrutura/expiração e, no mock, a assinatura simulada.
 * Em modo API isto é apenas uma leitura local: a assinatura e a autorização
 * devem ser verificadas pelo servidor em toda operação protegida.
 */
export function verifyToken(token: string): TokenPayload | null {
  const payload = decodeToken(token);
  if (!payload || isExpired(payload)) return null;
  const [h, p, sig] = token.split('.');
  if (!isApiMode && mockSignature(h, p) !== sig) return null;
  return payload;
}

export function isExpired(payload: TokenPayload | null): boolean {
  if (!payload || !Number.isSafeInteger(payload.exp)) return true;
  return payload.exp <= Math.floor(Date.now() / 1000);
}

/** Segundos restantes até expirar (>= 0). */
export function secondsUntilExpiry(payload: TokenPayload | null): number {
  if (isExpired(payload)) return 0;
  return Math.max(0, payload!.exp - Math.floor(Date.now() / 1000));
}
