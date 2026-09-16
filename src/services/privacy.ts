/* ─────────────────────────────────────────────────────────────────────────────
 * One Hub · LGPD — consentimento e direito de exclusão (§7)
 *
 * - Consentimento explícito no 1º acesso ao chat da Clara (registro da conversa).
 * - Portabilidade: o titular pode exportar seus dados de conversa.
 * - Exclusão: endpoint dedicado para apagar o histórico a pedido do titular.
 *
 * Modo mock → consentimento e exclusão operam sobre o localStorage.
 * Modo api  → /privacy/consent e /privacy/erasure no backend.
 * ───────────────────────────────────────────────────────────────────────────── */

import { backendConfig, isApiMode, requireEndpoint } from '../config/backend';
import type { Session } from './session';

const CONSENT_KEY = backendConfig.privacy.consentStorageKey;

export interface ConsentRecord {
  granted: boolean;
  scope: 'clara-chat';
  ts: number;
  baseLegal: string;
}

export function readConsent(): ConsentRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    const record = raw ? JSON.parse(raw) as Partial<ConsentRecord> | null : null;
    if (!record || typeof record.granted !== 'boolean' || record.scope !== 'clara-chat' ||
      !Number.isSafeInteger(record.ts) || record.ts! < 0 || typeof record.baseLegal !== 'string') return null;
    return record as ConsentRecord;
  } catch {
    return null;
  }
}

export async function grantConsent(): Promise<ConsentRecord> {
  const record: ConsentRecord = {
    granted: true,
    scope: 'clara-chat',
    ts: Date.now(),
    baseLegal: backendConfig.privacy.baseLegal,
  };
  if (isApiMode) {
    const endpoint = requireEndpoint(backendConfig.privacy.endpoint, 'privacy');
    const res = await fetch(`${endpoint}/privacy/consent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    if (!res.ok) throw new Error(`privacy/consent POST ${res.status}`);
  }
  try { window.localStorage.setItem(CONSENT_KEY, JSON.stringify(record)); } catch {}
  return record;
}

export async function revokeConsent(): Promise<void> {
  if (isApiMode) {
    const endpoint = requireEndpoint(backendConfig.privacy.endpoint, 'privacy');
    const res = await fetch(`${endpoint}/privacy/consent`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`privacy/consent DELETE ${res.status}`);
  }
  try { window.localStorage.removeItem(CONSENT_KEY); } catch {}
}

/** Portabilidade — pacote com os dados de conversa do titular. */
export function buildDataExport(session: Session | null): string {
  const payload = {
    geradoEm: new Date().toISOString(),
    baseLegal: backendConfig.privacy.baseLegal,
    consentimento: readConsent(),
    sessao: session,
  };
  return JSON.stringify(payload, null, 2);
}

/** Direito de exclusão — apaga o histórico de conversas do titular. */
export async function requestErasure(sessionId?: string): Promise<void> {
  if (isApiMode) {
    const endpoint = requireEndpoint(backendConfig.privacy.endpoint, 'privacy');
    const res = await fetch(`${endpoint}/privacy/erasure`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    if (!res.ok) throw new Error(`privacy/erasure POST ${res.status}`);
  }
  try {
    window.localStorage.removeItem(backendConfig.session.localStorageKey);
  } catch {}
}
