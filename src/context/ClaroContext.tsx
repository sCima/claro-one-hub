'use client';

import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef, ReactNode } from 'react';
import { claroApi } from '../services/claroApi';
import {
  createSession, appendMessage, setContext, saveSession, loadSession, clearSession,
  type Session, type Canal, type SessionMessage,
} from '../services/session';
import {
  issueToken, verifyToken, secondsUntilExpiry,
  type TokenPayload,
} from '../services/authToken';
import { backendConfig } from '../config/backend';
import {
  loadIncidents, saveIncidents, makeIncident, type NewIncidentInput,
} from '../services/incidents';
import {
  readConsent, grantConsent, revokeConsent, buildDataExport, requestErasure,
  type ConsentRecord,
} from '../services/privacy';
import {
  mockUser, mockAccounts, accountProfiles, mockAttendanceQueue, mockResolvedTickets,
  ADMIN_USERS, SLA_TARGET, INCIDENT_SEVERITY,
  type Service, type Invoice, type DataPoint, type SupportChannel,
  type Activity, type Notification, type Recommendation, type Account,
  type ClubeData, type ClubeReward, type AvailablePlan,
  type QueueItem, type ClaraIntentId, type TicketStatus,
  type AdminRole, type AdminPriority, type Incident,
} from '../data/mockData';

type User = typeof mockUser;

/* Sprint 2 §4.1 — métrica de autoatendimento */
export interface ClaraMetric {
  id: string;
  intent: ClaraIntentId;
  resolvedAuto: boolean;
  ts: number;
}

/* Sprint 2 §4.2 — item de handover gerado pela conversa do cliente logado */
export interface HandoverPayload {
  reason: string;
  history: { role: 'user' | 'clara'; text: string }[];
  /** canal de onde a conversa veio (Sprint 3 §4 — continuidade) */
  canal?: Canal;
}

/* ISO/IEC 27001 A.12.4 — trilha de auditoria (quem fez o quê, quando) */
export interface AuditEntry {
  id: string;
  ts: number;
  actor: string;        // papel/usuário do admin
  action: string;       // ex.: 'ticket.resolvido', 'sla.alterado', 'dados.anonimizados'
  detail: string;
}

interface ClaroState {
  user: User | null;                    // titular base
  activeUser: User | null;              // usuário derivado da conta ativa
  services: Service[];                  // já filtrados pela conta ativa
  invoices: Invoice[];                  // já ajustados pela conta ativa
  dataHistory: DataPoint[];
  supportChannels: SupportChannel[];
  clube: ClubeData | null;              // clube da conta ativa
  activity: Activity[];
  notifications: Notification[];
  recommendations: Recommendation[];
  accounts: Account[];
  dark: boolean;
  searchQuery: string;
  loading: boolean;
  isLoggedIn: boolean;
  login: () => Promise<void>;
  logout: () => void;
  switchAccount: (id: string) => void;
  toggleDark: () => void;
  setSearchQuery: (q: string) => void;
  confirmPayment: (invoice: Invoice) => void;
  confirmRedeem: (reward: ClubeReward) => void;
  addPlanToCombo: (plan: AvailablePlan) => void;
  /* ─── Sprint 3 §4 · Camada de sessão e contexto entre canais ─── */
  session: Session | null;
  sessionToken: string | null;
  sessionTokenPayload: TokenPayload | null;
  sessionSecondsLeft: number;
  /** cria uma sessão nova (ou recupera a ativa) para um canal e emite o token */
  startSession: (canal: Canal) => Promise<Session>;
  /** registra uma mensagem no histórico da sessão, com canal e timestamp */
  appendSessionMessage: (msg: { role: SessionMessage['role']; text: string; canal: Canal }) => void;
  /** atualiza o contexto_atual (última intenção + entidades + resumo) */
  updateSessionContext: (patch: { lastIntent?: string | null; entities?: Record<string, string>; summary?: string | null }) => void;
  /** marca a sessão como transferida para atendimento humano */
  markSessionHandover: () => void;
  /* ─── §7 · LGPD — consentimento + direito de exclusão ─── */
  claraConsent: ConsentRecord | null;
  acceptClaraConsent: () => void;
  revokeClaraConsent: () => void;
  exportMyData: () => string;
  deleteMyConversations: () => void;
  /* ─── RF006 · Incidentes técnicos + notificação proativa ─── */
  incidents: Incident[];
  activeIncidents: Incident[];
  registerIncident: (input: NewIncidentInput) => void;
  resolveIncident: (id: string) => void;
  /* ─── Sprint 2 · Clara / Admin ─── */
  claraMetrics: ClaraMetric[];
  logClaraInteraction: (intent: ClaraIntentId, resolvedAuto: boolean) => void;
  attendanceQueue: QueueItem[];
  requestHandover: (payload: HandoverPayload) => void;
  resolveQueueItem: (id: string) => void;
  updateTicketStatus: (id: string, status: TicketStatus) => void;
  /* ─── One Hub Admin · RBAC (acesso restrito por papel) ─── */
  adminRole: AdminRole | null;
  adminName: string | null;
  adminLogin: (email: string, password: string) => AdminRole | null;
  adminLogout: () => void;
  /* config gerencial editável (gerente) */
  slaConfig: Record<AdminPriority, number>;
  updateSlaConfig: (priority: AdminPriority, minutes: number) => void;
  /* ISO 27001 · trilha de auditoria + LGPD · anonimização */
  auditLog: AuditEntry[];
  anonymizeTicket: (id: string) => void;
}

const ClaroContext = createContext<ClaroState | null>(null);

export function ClaroProvider({ children }: { children: ReactNode }) {
  const [user, setUser]                   = useState<User | null>(null);
  const [rawServices, setRawServices]     = useState<Service[]>([]);
  const [rawInvoices, setRawInvoices]     = useState<Invoice[]>([]);
  const [dataHistory, setDataHistory]     = useState<DataPoint[]>([]);
  const [supportChannels, setSupport]     = useState<SupportChannel[]>([]);
  const [rawClube, setRawClube]           = useState<ClubeData | null>(null);
  const [activity, setActivity]           = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recommendations, setRecs]        = useState<Recommendation[]>([]);
  const [accounts, setAccounts]           = useState<Account[]>(mockAccounts);
  const [dark, setDarkState]              = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [loading, setLoading]             = useState(false);
  const [isLoggedIn, setIsLoggedIn]       = useState(false);
  /* Serviços adicionais por conta (criados via addPlanToCombo) */
  const [extraServiceIds, setExtraServiceIds] = useState<Record<string, string[]>>({});
  /* Sprint 2 — métricas da Clara + fila de atendimento omnichannel */
  const [claraMetrics, setClaraMetrics]   = useState<ClaraMetric[]>([]);
  const [attendanceQueue, setQueue]       = useState<QueueItem[]>(
    [...mockAttendanceQueue, ...mockResolvedTickets] as QueueItem[]
  );
  const [adminRole, setAdminRole]         = useState<AdminRole | null>(null);
  const [adminName, setAdminName]         = useState<string | null>(null);
  const [slaConfig, setSlaConfig]         = useState<Record<AdminPriority, number>>({ ...SLA_TARGET });
  const [auditLog, setAuditLog]           = useState<AuditEntry[]>([]);
  /* Sprint 3 §4 — sessão/contexto entre canais + token de autenticação */
  const [session, setSession]             = useState<Session | null>(null);
  const [sessionToken, setSessionToken]   = useState<string | null>(null);
  const [sessionTokenPayload, setTokenPayload] = useState<TokenPayload | null>(null);
  const [sessionSecondsLeft, setSecondsLeft]   = useState(0);
  const sessionRef = useRef<Session | null>(null);
  useEffect(() => { sessionRef.current = session; }, [session]);
  /* §7 · LGPD — consentimento do chat da Clara */
  const [claraConsent, setClaraConsent] = useState<ConsentRecord | null>(null);
  /* RF006 · incidentes técnicos */
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const activeIncidents = useMemo(() => incidents.filter((i) => i.status === 'ativo'), [incidents]);

  /* Persiste a sessão (cache Redis no backend real / localStorage no mock) */
  const persistSession = useCallback((next: Session) => {
    setSession(next);
    saveSession(next).catch(() => {});
  }, []);

  /* Hidrata sessão + token do armazenamento local — permite retomar a mesma
   * sessão num canal diferente (ex.: abrir /whatsapp numa aba nova). */
  useEffect(() => {
    let token: string | null = null;
    let payload: TokenPayload | null = null;
    let restored: Session | null = null;
    try {
      const rawTok = window.localStorage.getItem(backendConfig.auth.localStorageKey);
      if (rawTok) {
        payload = verifyToken(rawTok);
        if (payload) token = rawTok;
        else window.localStorage.removeItem(backendConfig.auth.localStorageKey);
      }
      const rawSess = window.localStorage.getItem(backendConfig.session.localStorageKey);
      if (rawSess) {
        const s = JSON.parse(rawSess) as Session;
        if (s?.status !== 'encerrada') restored = s;
      }
    } catch { /* modo privado / quota */ }
    if (token) setSessionToken(token);
    if (payload) setTokenPayload(payload);
    if (restored) setSession(restored);
  }, []);

  /* Hidrata consentimento LGPD + incidentes técnicos */
  useEffect(() => {
    const c = readConsent();
    if (c) setClaraConsent(c);
    loadIncidents().then(setIncidents).catch(() => setIncidents([]));
  }, []);

  /* Contador regressivo de expiração do token (RNF005 · 30 min) */
  useEffect(() => {
    const tick = () => setSecondsLeft(secondsUntilExpiry(sessionTokenPayload));
    tick();
    if (!sessionTokenPayload) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [sessionTokenPayload]);

  const pushAudit = useCallback((actor: string, action: string, detail: string) => {
    setAuditLog((prev) => [
      { id: 'a-' + Date.now() + Math.random().toString(36).slice(2, 5), ts: Date.now(), actor, action, detail },
      ...prev,
    ].slice(0, 100));
  }, []);

  /* Conta ativa + dados derivados (atualizam quando user troca conta) */
  const activeAccount = accounts.find((a) => a.active) ?? accounts[0];
  const profile = accountProfiles[activeAccount.id as keyof typeof accountProfiles] ?? accountProfiles.A1;

  const services = useMemo(() => {
    const baseIds: string[] = [...profile.serviceIds];
    const extras = extraServiceIds[activeAccount.id] ?? [];
    const allIds = new Set<string>([...baseIds, ...extras]);
    return rawServices.filter((s) => allIds.has(s.id));
  }, [rawServices, profile.serviceIds, extraServiceIds, activeAccount.id]);

  const invoices = useMemo(
    () => rawInvoices.map((i) => ({
      ...i,
      amount: +(i.amount * profile.invoiceMultiplier).toFixed(2),
    })),
    [rawInvoices, profile.invoiceMultiplier]
  );

  const clube = useMemo<ClubeData | null>(() => {
    if (!rawClube) return null;
    return { ...rawClube, points: profile.clubePoints, tier: profile.tier as ClubeData['tier'] };
  }, [rawClube, profile.clubePoints, profile.tier]);

  const activeUser = useMemo<User | null>(() => {
    if (!user) return null;
    return {
      ...user,
      name: activeAccount.name,
      initials: activeAccount.initials,
      email: profile.email,
      phone: (profile as { phone?: string }).phone ?? user.phone,
      tier: profile.tier as User['tier'],
      plan: activeAccount.plan,
    };
  }, [user, activeAccount, profile]);

  /* Sync dark class on <html> */
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  /* ⌘K global shortcut */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        (document.querySelector('input[placeholder^="Buscar"]') as HTMLInputElement | null)?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const toggleDark = useCallback(() => setDarkState((d) => !d), []);

  /* ─── Sprint 3 §4 · Sessão vinculada ao cliente (não ao canal) ─────────────
   * Recupera a sessão ativa (loadSession) ou cria uma nova, e (re)emite o token
   * de autenticação para o canal atual. */
  const startSession = useCallback(async (canal: Canal): Promise<Session> => {
    const uid = mockUser.id;
    const phone = accountProfiles.A1.phone;
    let sess = sessionRef.current;
    if (!sess || sess.usuarioId !== uid || sess.status === 'encerrada') {
      sess = (await loadSession(uid)) ?? createSession({ usuarioId: uid, canalOrigem: canal, telefone: phone });
    }
    const { token, payload } = await issueToken({
      usuarioId: uid, name: mockUser.name, canal, sessionId: sess.sessionId,
    });
    setSessionToken(token);
    setTokenPayload(payload);
    try { window.localStorage.setItem(backendConfig.auth.localStorageKey, token); } catch {}
    persistSession(sess);
    return sess;
  }, [persistSession]);

  const appendSessionMessage = useCallback(
    (msg: { role: SessionMessage['role']; text: string; canal: Canal }) => {
      setSession((prev) => {
        const base = prev ?? createSession({
          usuarioId: mockUser.id, canalOrigem: msg.canal,
          telefone: accountProfiles.A1.phone,
        });
        const next = appendMessage(base, msg);
        saveSession(next).catch(() => {});
        return next;
      });
    },
    [],
  );

  const updateSessionContext = useCallback(
    (patch: { lastIntent?: string | null; entities?: Record<string, string>; summary?: string | null }) => {
      setSession((prev) => {
        if (!prev) return prev;
        const next = setContext(prev, patch);
        saveSession(next).catch(() => {});
        return next;
      });
    },
    [],
  );

  const markSessionHandover = useCallback(() => {
    setSession((prev) => {
      if (!prev) return prev;
      const next: Session = { ...prev, status: 'handover', updatedAt: Date.now() };
      saveSession(next).catch(() => {});
      return next;
    });
  }, []);

  /* ─── §7 · LGPD ──────────────────────────────────────────────────────────── */
  const acceptClaraConsent = useCallback(() => {
    grantConsent().then(setClaraConsent).catch(() => {});
  }, []);

  const revokeClaraConsent = useCallback(() => {
    revokeConsent().then(() => setClaraConsent(null)).catch(() => {});
  }, []);

  const exportMyData = useCallback(() => buildDataExport(sessionRef.current), []);

  const deleteMyConversations = useCallback(() => {
    const sid = sessionRef.current?.sessionId;
    requestErasure(sid).catch(() => {});
    setSession(null);
    setSessionToken(null);
    setTokenPayload(null);
    try { window.localStorage.removeItem(backendConfig.auth.localStorageKey); } catch {}
  }, []);

  /* ─── RF006 · Incidentes técnicos + notificação proativa ─────────────────── */
  const registerIncident = useCallback((input: NewIncidentInput) => {
    const inc = makeIncident(input);
    setIncidents((prev) => {
      const next = [inc, ...prev];
      saveIncidents(next).catch(() => {});
      return next;
    });
    /* notificação automática ao cliente afetado */
    const sev = INCIDENT_SEVERITY[inc.severidade];
    setNotifications((prev) => [
      {
        id: 'ninc-' + inc.id,
        title: `Incidente técnico na sua região · ${inc.regiao}: ${inc.titulo}. ${inc.previsao}.`,
        time: 'agora',
        unread: true,
        level: sev.notif,
      },
      ...prev,
    ]);
    pushAudit(adminRole ?? 'equipe técnica', 'incidente.registrado', `${inc.id} · ${inc.titulo} (${sev.label})`);
  }, [adminRole, pushAudit]);

  const resolveIncident = useCallback((id: string) => {
    setIncidents((prev) => {
      const next = prev.map((i) =>
        i.id === id ? { ...i, status: 'resolvido' as const, resolvidoEm: Date.now() } : i,
      );
      saveIncidents(next).catch(() => {});
      return next;
    });
    setNotifications((prev) => [
      { id: 'nres-' + id, title: `Incidente ${id} normalizado. Serviço restabelecido. ✅`, time: 'agora', unread: true, level: 'info' as const },
      ...prev,
    ]);
    pushAudit(adminRole ?? 'equipe técnica', 'incidente.resolvido', `${id} marcado como normalizado`);
  }, [adminRole, pushAudit]);

  const login = useCallback(async () => {
    setIsLoggedIn(true);
    setLoading(true);
    try {
      const [u, s, inv, hist, sup, cl, act, notif, rec] = await Promise.all([
        claroApi.getUser(),
        claroApi.getServices(),
        claroApi.getInvoices(),
        claroApi.getDataHistory(),
        claroApi.getSupportChannels(),
        claroApi.getClube(),
        claroApi.getActivity(),
        claroApi.getNotifications(),
        claroApi.getRecommendations(),
      ]);
      setUser(u);
      setRawServices(s);
      setRawInvoices(inv);
      setDataHistory(hist);
      setSupport(sup);
      setRawClube(cl as ClubeData);
      setActivity(act);
      setNotifications(notif);
      setRecs(rec);
      /* autentica: emite token de sessão real e abre/recupera a sessão (canal web) */
      await startSession('web');
    } finally {
      setLoading(false);
    }
  }, [startSession]);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null); setRawServices([]); setRawInvoices([]); setDataHistory([]);
    setSupport([]); setRawClube(null); setActivity([]);
    setNotifications([]); setRecs([]);
    setSession(null); setSessionToken(null); setTokenPayload(null);
    clearSession().catch(() => {});
    try { window.localStorage.removeItem(backendConfig.auth.localStorageKey); } catch {}
  }, []);

  const switchAccount = useCallback((id: string) => {
    setAccounts((prev) => prev.map((a) => ({ ...a, active: a.id === id })));
  }, []);

  const confirmPayment = useCallback((invoice: Invoice) => {
    setRawInvoices((prev) =>
      prev.map((i) => i.id === invoice.id ? { ...i, status: 'paid' as const } : i)
    );
    setRawClube((c) => c ? { ...c, points: c.points + Math.floor(invoice.amount) } : c);
    const newAct: Activity = {
      id: 'pay-' + Date.now(),
      type: 'payment',
      label: `Pagamento Fatura ${invoice.month}`,
      amount: -invoice.amount,
      date: new Date().toISOString().slice(0, 10),
      icon: 'CreditCard',
      unit: undefined,
    };
    setActivity((prev) => [newAct, ...prev]);
  }, []);

  const confirmRedeem = useCallback((reward: ClubeReward) => {
    setRawClube((c) => c ? { ...c, points: c.points - reward.cost } : c);
    const newAct: Activity = {
      id: 'rdm-' + Date.now(),
      type: 'reward',
      label: `Resgate Clube · ${reward.label}`,
      amount: -reward.cost,
      date: new Date().toISOString().slice(0, 10),
      icon: 'Gift',
      unit: 'pts',
    };
    setActivity((prev) => [newAct, ...prev]);
  }, []);

  /* Adiciona um novo plano (avulso) ao combo do usuário ativo */
  const addPlanToCombo = useCallback((plan: AvailablePlan) => {
    const newId = `SVC-EXTRA-${Date.now()}`;
    const newService = {
      id: newId,
      type: 'tv',
      label: plan.brand,
      plan: 'Plano avulso',
      identifier: 'Adicionado ao combo',
      status: 'active',
      dataUsed: null,
      dataLimit: null,
      unit: null,
      dueDate: new Date().toISOString().slice(0, 10),
      amount: plan.price,
      streaming: ['Plano avulso'],
      channels: 0,
    } as unknown as Service;
    setRawServices((prev) => [...prev, newService]);

    /* Vincula esse novo serviço apenas à conta ativa (não mutamos os mocks) */
    setExtraServiceIds((prev) => ({
      ...prev,
      [activeAccount.id]: [...(prev[activeAccount.id] ?? []), newId],
    }));

    /* Registra na atividade */
    const newAct: Activity = {
      id: 'add-' + Date.now(),
      type: 'recharge',
      label: `Adicionou ${plan.brand} ao combo`,
      amount: -plan.price,
      date: new Date().toISOString().slice(0, 10),
      icon: 'Plus',
      unit: undefined,
    };
    setActivity((prev) => [newAct, ...prev]);
  }, [activeAccount.id]);

  /* ─── Sprint 2 §4.1 · registra cada interação da Clara p/ métricas ─── */
  const logClaraInteraction = useCallback((intent: ClaraIntentId, resolvedAuto: boolean) => {
    setClaraMetrics((prev) => [
      ...prev,
      { id: 'cm-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6), intent, resolvedAuto, ts: Date.now() },
    ]);
  }, []);

  /* ─── Sprint 2 §4.2 · handover suave: abre um ticket ITSM real ─── */
  const requestHandover = useCallback((payload: HandoverPayload) => {
    const channel = payload.canal === 'whatsapp' ? 'whatsapp' : payload.canal === 'app' ? 'app' : 'portal';
    setQueue((prev) => {
      if (prev.some((q) => q.id === 'Q-SELF')) return prev; // evita duplicar
      const acct = accounts.find((a) => a.active) ?? accounts[0];
      const seq = 482 + prev.filter((q) => q.id.startsWith('Q-')).length;
      const selfItem = {
        id: 'Q-SELF',
        ticketId: `INC-2026-${String(seq).padStart(4, '0')}`,
        name: acct.name,
        initials: acct.initials,
        cpf: user?.cpf ?? '***.***.***-**',
        contractSince: user?.since ?? '2020-01-01',
        channel,
        priority: 'alta' as const,
        status: 'novo' as const,
        category: 'Dúvida Geral',
        waitMins: 0,
        openedMinsAgo: 0,
        reason: payload.reason,
        serviceHealth: { internet: 'ok', tv: 'ok', telefonia: 'ok' } as Record<string, 'ok' | 'degradado' | 'offline'>,
        claraHistory: payload.history.map((h) => ({ role: h.role, text: h.text })),
      } as unknown as QueueItem;
      return [selfItem, ...prev];
    });
    markSessionHandover();
  }, [accounts, user, markSessionHandover]);

  /* Resolver = marca como resolvido + carimba métricas (resolução, CSAT,
   * 1ª resposta) e registra na trilha de auditoria (ISO 27001). */
  const resolveQueueItem = useCallback((id: string) => {
    let resolvedTicket = '';
    setQueue((prev) => prev.map((q) => {
      if (q.id !== id || q.status === 'resolvido') return q;
      resolvedTicket = q.ticketId;
      const took = Math.max(q.openedMinsAgo || 0, q.resolvedInMins ?? 0, 1);
      return {
        ...q,
        status: 'resolvido' as TicketStatus,
        resolvedInMins: took,
        firstResponseMins: q.firstResponseMins ?? Math.max(1, Math.round(took * 0.25)),
        resolvedDaysAgo: 0,
        csat: q.csat ?? 5,
      };
    }));
    if (resolvedTicket) {
      pushAudit(adminRole ?? 'sistema', 'ticket.resolvido', `Ticket ${resolvedTicket} marcado como resolvido`);
    }
  }, [adminRole, pushAudit]);

  const updateTicketStatus = useCallback((id: string, status: TicketStatus) => {
    setQueue((prev) => prev.map((q) => q.id === id ? { ...q, status } : q));
  }, []);

  /* LGPD · direito ao esquecimento — anonimiza dados pessoais do ticket */
  const anonymizeTicket = useCallback((id: string) => {
    let tk = '';
    setQueue((prev) => prev.map((q) => {
      if (q.id !== id) return q;
      tk = q.ticketId;
      return {
        ...q,
        name: 'Titular anonimizado',
        initials: '··',
        cpf: '•••.•••.•••-••',
        claraHistory: q.claraHistory.map((h) => ({ ...h, text: h.role === 'user' ? '[conteúdo removido — LGPD]' : h.text })),
      };
    }));
    if (tk) pushAudit(adminRole ?? 'sistema', 'dados.anonimizados', `LGPD: dados pessoais do ticket ${tk} anonimizados`);
  }, [adminRole, pushAudit]);

  /* ─── One Hub Admin · RBAC (login por papel) ─── */
  const adminLogin = useCallback((email: string, password: string): AdminRole | null => {
    const u = ADMIN_USERS.find(
      (x) => x.email === email.trim().toLowerCase() && x.password === password
    );
    if (u) { setAdminRole(u.role); setAdminName(u.name); return u.role; }
    return null;
  }, []);

  const adminLogout = useCallback(() => { setAdminRole(null); setAdminName(null); }, []);

  const updateSlaConfig = useCallback((priority: AdminPriority, minutes: number) => {
    const v = Math.max(1, Math.round(minutes));
    setSlaConfig((prev) => ({ ...prev, [priority]: v }));
    pushAudit(adminRole ?? 'gerente', 'sla.alterado', `SLA "${priority}" definido para ${v} min`);
  }, [adminRole, pushAudit]);

  return (
    <ClaroContext.Provider value={{
      user, activeUser, services, invoices, dataHistory, supportChannels,
      clube, activity, notifications, recommendations,
      accounts, dark, searchQuery,
      loading, isLoggedIn,
      login, logout, switchAccount, toggleDark, setSearchQuery,
      confirmPayment, confirmRedeem, addPlanToCombo,
      session, sessionToken, sessionTokenPayload, sessionSecondsLeft,
      startSession, appendSessionMessage, updateSessionContext, markSessionHandover,
      claraConsent, acceptClaraConsent, revokeClaraConsent, exportMyData, deleteMyConversations,
      incidents, activeIncidents, registerIncident, resolveIncident,
      claraMetrics, logClaraInteraction,
      attendanceQueue, requestHandover, resolveQueueItem, updateTicketStatus,
      adminRole, adminName, adminLogin, adminLogout,
      slaConfig, updateSlaConfig,
      auditLog, anonymizeTicket,
    }}>
      {children}
    </ClaroContext.Provider>
  );
}

export function useClaroContext() {
  const ctx = useContext(ClaroContext);
  if (!ctx) throw new Error('useClaroContext must be inside ClaroProvider');
  return ctx;
}
