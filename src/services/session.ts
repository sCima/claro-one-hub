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

import { backendConfig, isApiMode, requireEndpoint } from '../config/backend';

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
  return { ...session, historico: [...session.historico, message], updatedAt: Date.now() };
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
let remoteSession: Session | null = null;
let sessionGeneration = 0;
let pendingMutation: Promise<unknown> = Promise.resolve();

function enqueueMutation<T>(operation: () => Promise<T>): Promise<T> {
  const next = pendingMutation.then(operation);
  // Falhas são devolvidas ao chamador, mas não bloqueiam as próximas operações.
  pendingMutation = next.catch(() => {});
  return next;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isTimestamp(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isCanal(value: unknown): value is Canal {
  return value === 'web' || value === 'app' || value === 'whatsapp';
}

function isSession(value: unknown): value is Session {
  if (!isRecord(value) || typeof value.sessionId !== 'string' || !value.sessionId.trim() ||
    typeof value.usuarioId !== 'string' || !value.usuarioId.trim() || !isCanal(value.canalOrigem) ||
    (value.status !== 'ativa' && value.status !== 'handover' && value.status !== 'encerrada') ||
    (value.telefone !== null && typeof value.telefone !== 'string') ||
    !isTimestamp(value.createdAt) || !isTimestamp(value.updatedAt) ||
    !Array.isArray(value.historico) || !isRecord(value.contextoAtual)) return false;
  const context = value.contextoAtual;
  return (context.lastIntent === null || typeof context.lastIntent === 'string') &&
    (context.summary === null || typeof context.summary === 'string') &&
    isTimestamp(context.updatedAt) && isRecord(context.entities) &&
    Object.values(context.entities).every((entry) => typeof entry === 'string') &&
    value.historico.every((message: unknown) => isRecord(message) &&
      typeof message.id === 'string' && typeof message.text === 'string' &&
      (message.role === 'user' || message.role === 'clara' || message.role === 'agent') &&
      isCanal(message.canal) && isTimestamp(message.ts));
}

function isActive(session: Session): boolean {
  return session.status !== 'encerrada' &&
    Date.now() - session.updatedAt < backendConfig.session.ttlSeconds * 1000;
}

function parseRemote(value: unknown): Session {
  if (!isSession(value)) throw new Error('sessions retornou uma sessão inválida');
  return value;
}

function rememberRemote(session: Session, generation: number): void {
  // Respostas anteriores ao logout ou a uma nova gravação não substituem o cache.
  if (generation !== sessionGeneration) return;
  remoteSession = session;
  writeLocal(session);
}

function readLocal(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    const session: unknown = raw ? JSON.parse(raw) : null;
    return isSession(session) ? session : null;
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
  if (isApiMode) {
    const endpoint = requireEndpoint(backendConfig.session.endpoint, 'sessions');
    const generation = sessionGeneration;
    const res = await fetch(
      `${endpoint}/sessions?usuario=${encodeURIComponent(usuarioId)}`,
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`sessions GET ${res.status}`);
    const session = parseRemote(await res.json());
    if (session.usuarioId !== usuarioId) throw new Error('sessions retornou outro usuário');
    if (!isActive(session) || generation !== sessionGeneration) return null;
    rememberRemote(session, generation);
    return session;
  }
  const local = readLocal();
  return local && local.usuarioId === usuarioId && isActive(local) ? local : null;
}

/**
 * Recupera a sessão ativa a partir do telefone cadastrado — usado quando o
 * cliente aparece num canal externo (WhatsApp) sem passar pelo login do portal.
 */
export async function recoverSessionByPhone(telefone: string): Promise<Session | null> {
  const normalized = telefone.replace(/\D/g, '');
  if (!normalized) return null;
  if (isApiMode) {
    const endpoint = requireEndpoint(backendConfig.session.endpoint, 'sessions');
    const generation = sessionGeneration;
    const res = await fetch(
      `${endpoint}/sessions/by-phone/${encodeURIComponent(normalized)}`,
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`sessions by-phone ${res.status}`);
    const session = parseRemote(await res.json());
    if (session.telefone?.replace(/\D/g, '') !== normalized) throw new Error('sessions retornou outro telefone');
    if (!isActive(session) || generation !== sessionGeneration) return null;
    rememberRemote(session, generation);
    return session;
  }
  const local = readLocal();
  if (!local || !isActive(local) || !local.telefone) return null;
  return local.telefone.replace(/\D/g, '') === normalized ? local : null;
}

/** Persiste a sessão (upsert). */
export async function saveSession(session: Session): Promise<Session> {
  if (!isSession(session)) throw new Error('Não é possível salvar uma sessão inválida');
  if (isApiMode) {
    const endpoint = requireEndpoint(backendConfig.session.endpoint, 'sessions');
    const generation = ++sessionGeneration;
    // Mantém o identificador inclusive enquanto o primeiro PUT ainda está em voo.
    remoteSession = session;
    const body = JSON.stringify(session);
    return enqueueMutation(async () => {
      const res = await fetch(
        `${endpoint}/sessions/${encodeURIComponent(session.sessionId)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body,
        },
      );
      if (!res.ok) throw new Error(`sessions PUT ${res.status}`);
      const saved = res.status === 204 ? parseRemote(JSON.parse(body)) : parseRemote(await res.json());
      if (saved.sessionId !== session.sessionId || saved.usuarioId !== session.usuarioId) {
        throw new Error('sessions PUT retornou outra sessão');
      }
      rememberRemote(saved, generation);
      return saved;
    });
  }
  writeLocal(session);
  return session;
}

export async function clearSession(): Promise<void> {
  const local = remoteSession ?? readLocal();
  sessionGeneration += 1;
  remoteSession = null;
  writeLocal(null);
  if (isApiMode) {
    const endpoint = requireEndpoint(backendConfig.session.endpoint, 'sessions');
    if (local) {
      await enqueueMutation(async () => {
        const res = await fetch(
          `${endpoint}/sessions/${encodeURIComponent(local.sessionId)}`,
          { method: 'DELETE' },
        );
        if (!res.ok && res.status !== 404) throw new Error(`sessions DELETE ${res.status}`);
      });
    }
  }
}
