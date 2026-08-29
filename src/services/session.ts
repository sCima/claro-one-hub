/* ─────────────────────────────────────────────────────────────────────────────
 * One Hub · Camada de sessão e contexto (Documento de Arquitetura §4 / RF005)
 *
 * O mecanismo central da proposta: ao iniciar uma conversa em QUALQUER canal,
 * o backend gera um session_id vinculado ao usuário autenticado — não ao canal.
 * Todo o histórico é associado a esse identificador. Ao trocar de canal
 * (ex.: sai do app, manda mensagem no WhatsApp), o backend reconhece o cliente,
 * recupera a sessão ativa e resume o contexto para a Clara antes da 1ª resposta.
 *
 * Modo mock  → sessão persistida em localStorage (simula o cache Redis).
 * Modo api   → GET/PUT no serviço de gestão de contexto do backend.
 * ───────────────────────────────────────────────────────────────────────────── */

import { backendConfig, isApiMode } from '../config/backend';

export type Canal = 'web' | 'app' | 'whatsapp';

export const CANAL_LABEL: Record<Canal, string> = {
  web: 'Web Chat',
  app: 'Aplicativo',
  whatsapp: 'WhatsApp',
};

/** Uma mensagem trocada — com timestamp e canal de origem (§4.1 · historico[]) */
export interface SessionMessage {
  id: string;
  role: 'user' | 'clara' | 'agent';
  text: string;
  ts: number;
  canal: Canal;
}

/** Última intenção reconhecida e entidades extraídas pela Clara (§4.1 · contexto_atual) */
export interface SessionContext {
  lastIntent: string | null;
  entities: Record<string, string>;
  /** resumo curto que a Clara usa para "retomar" a conversa em outro canal */
  summary: string | null;
  updatedAt: number;
}

/** Estrutura do objeto de sessão — espelha a tabela §4.1 do documento */
export interface Session {
  sessionId: string;    // session_id
  usuarioId: string;    // usuario_id (cliente autenticado)
  canalOrigem: Canal;   // canal_origem (onde a sessão começou)
  historico: SessionMessage[];
  contextoAtual: SessionContext;
  /** contato usado para reconhecer o cliente em canais externos (WhatsApp) */
  telefone: string | null;
  status: 'ativa' | 'handover' | 'encerrada';
  createdAt: number;
  updatedAt: number;
}

/* ─── helpers ──────────────────────────────────────────────────────────────── */

export function newSessionId(): string {
  const rnd = Math.random().toString(36).slice(2, 10);
  return `SESS-${Date.now().toString(36)}-${rnd}`.toUpperCase();
}

export function createSession(input: {
  usuarioId: string;
  canalOrigem: Canal;
  telefone?: string | null;
}): Session {
  const now = Date.now();
  return {
    sessionId: newSessionId(),
    usuarioId: input.usuarioId,
    canalOrigem: input.canalOrigem,
    historico: [],
    contextoAtual: { lastIntent: null, entities: {}, summary: null, updatedAt: now },
    telefone: input.telefone ?? null,
    status: 'ativa',
    createdAt: now,
    updatedAt: now,
  };
}

export function appendMessage(
  session: Session,
  msg: Omit<SessionMessage, 'id' | 'ts'> & { ts?: number },
): Session {
  const message: SessionMessage = {
    id: `MSG-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    ts: msg.ts ?? Date.now(),
    role: msg.role,
    text: msg.text,
    canal: msg.canal,
  };
  return { ...session, historico: [...session.historico, message], updatedAt: message.ts };
}

export function setContext(session: Session, patch: Partial<Omit<SessionContext, 'updatedAt'>>): Session {
  return {
    ...session,
    contextoAtual: { ...session.contextoAtual, ...patch, updatedAt: Date.now() },
    updatedAt: Date.now(),
  };
}

/** Canais distintos já usados nesta sessão (evidência de continuidade) */
export function channelsUsed(session: Session): Canal[] {
  const set = new Set<Canal>([session.canalOrigem]);
  session.historico.forEach((m) => set.add(m.canal));
  return [...set];
}

/* ─── persistência ─────────────────────────────────────────────────────────── */

const KEY = backendConfig.session.localStorageKey;

function readLocal(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function writeLocal(session: Session | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (session) window.localStorage.setItem(KEY, JSON.stringify(session));
    else window.localStorage.removeItem(KEY);
  } catch {
    /* quota / modo privado — ignora */
  }
}

/** Recupera a sessão ativa de um cliente (por id). */
export async function loadSession(usuarioId: string): Promise<Session | null> {
  if (isApiMode && backendConfig.session.endpoint) {
    const res = await fetch(
      `${backendConfig.session.endpoint}/sessions?usuario=${encodeURIComponent(usuarioId)}`,
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`sessions GET ${res.status}`);
    return (await res.json()) as Session;
  }
  const local = readLocal();
  return local && local.usuarioId === usuarioId && local.status !== 'encerrada' ? local : null;
}

/**
 * Recupera a sessão ativa a partir do telefone cadastrado — usado quando o
 * cliente aparece num canal externo (WhatsApp) sem passar pelo login do portal.
 */
export async function recoverSessionByPhone(telefone: string): Promise<Session | null> {
  const normalized = telefone.replace(/\D/g, '');
  if (isApiMode && backendConfig.session.endpoint) {
    const res = await fetch(
      `${backendConfig.session.endpoint}/sessions/by-phone/${encodeURIComponent(normalized)}`,
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`sessions by-phone ${res.status}`);
    return (await res.json()) as Session;
  }
  const local = readLocal();
  if (!local || local.status === 'encerrada' || !local.telefone) return null;
  return local.telefone.replace(/\D/g, '') === normalized ? local : null;
}

/** Persiste a sessão (upsert). */
export async function saveSession(session: Session): Promise<Session> {
  if (isApiMode && backendConfig.session.endpoint) {
    const res = await fetch(
      `${backendConfig.session.endpoint}/sessions/${encodeURIComponent(session.sessionId)}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      },
    );
    if (!res.ok) throw new Error(`sessions PUT ${res.status}`);
    return (await res.json()) as Session;
  }
  writeLocal(session);
  return session;
}

export async function clearSession(): Promise<void> {
  if (isApiMode && backendConfig.session.endpoint) {
    const local = readLocal();
    if (local) {
      await fetch(
        `${backendConfig.session.endpoint}/sessions/${encodeURIComponent(local.sessionId)}`,
        { method: 'DELETE' },
      ).catch(() => {});
    }
  }
  writeLocal(null);
}
