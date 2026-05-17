'use client';

import { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import { claroApi } from '../services/claroApi';
import {
  mockAccounts, accountProfiles, mockAttendanceQueue, mockResolvedTickets,
  ADMIN_USERS, SLA_TARGET,
  type Service, type Invoice, type DataPoint, type SupportChannel,
  type Activity, type Notification, type Recommendation, type Account,
  type ClubeData, type ClubeReward, type AvailablePlan,
  type QueueItem, type ClaraIntentId, type TicketStatus,
  type AdminRole, type AdminPriority,
} from '../data/mockData';
import type { mockUser } from '../data/mockData';

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
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null); setRawServices([]); setRawInvoices([]); setDataHistory([]);
    setSupport([]); setRawClube(null); setActivity([]);
    setNotifications([]); setRecs([]);
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
        channel: 'portal' as const,
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
  }, [accounts, user]);

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
