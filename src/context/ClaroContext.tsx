'use client';

import { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import { claroApi } from '../services/claroApi';
import {
  mockAccounts, accountProfiles,
  type Service, type Invoice, type DataPoint, type SupportChannel,
  type Activity, type Notification, type Recommendation, type Account,
  type ClubeData, type ClubeReward, type AvailablePlan,
} from '../data/mockData';
import type { mockUser } from '../data/mockData';

type User = typeof mockUser;

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

  return (
    <ClaroContext.Provider value={{
      user, activeUser, services, invoices, dataHistory, supportChannels,
      clube, activity, notifications, recommendations,
      accounts, dark, searchQuery,
      loading, isLoggedIn,
      login, logout, switchAccount, toggleDark, setSearchQuery,
      confirmPayment, confirmRedeem, addPlanToCombo,
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
