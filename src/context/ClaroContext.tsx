'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { claroApi } from '../services/claroApi';
import {
  mockAccounts,
  type Service, type Invoice, type DataPoint, type SupportChannel,
  type Activity, type Notification, type Recommendation, type Account,
  type ClubeData, type ClubeReward,
} from '../data/mockData';
import type { mockUser } from '../data/mockData';

type User = typeof mockUser;

interface ClaroState {
  user: User | null;
  services: Service[];
  invoices: Invoice[];
  dataHistory: DataPoint[];
  supportChannels: SupportChannel[];
  clube: ClubeData | null;
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
}

const ClaroContext = createContext<ClaroState | null>(null);

export function ClaroProvider({ children }: { children: ReactNode }) {
  const [user, setUser]                   = useState<User | null>(null);
  const [services, setServices]           = useState<Service[]>([]);
  const [invoices, setInvoices]           = useState<Invoice[]>([]);
  const [dataHistory, setDataHistory]     = useState<DataPoint[]>([]);
  const [supportChannels, setSupport]     = useState<SupportChannel[]>([]);
  const [clube, setClube]                 = useState<ClubeData | null>(null);
  const [activity, setActivity]           = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recommendations, setRecs]        = useState<Recommendation[]>([]);
  const [accounts, setAccounts]           = useState<Account[]>(mockAccounts);
  const [dark, setDarkState]              = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [loading, setLoading]             = useState(false);
  const [isLoggedIn, setIsLoggedIn]       = useState(false);

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
      setUser(u); setServices(s); setInvoices(inv); setDataHistory(hist);
      setSupport(sup); setClube(cl as ClubeData); setActivity(act);
      setNotifications(notif); setRecs(rec);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null); setServices([]); setInvoices([]); setDataHistory([]);
    setSupport([]); setClube(null); setActivity([]);
    setNotifications([]); setRecs([]);
  }, []);

  const switchAccount = useCallback((id: string) => {
    setAccounts((prev) => prev.map((a) => ({ ...a, active: a.id === id })));
  }, []);

  const confirmPayment = useCallback((invoice: Invoice) => {
    setInvoices((prev) =>
      prev.map((i) => i.id === invoice.id ? { ...i, status: 'paid' as const } : i)
    );
    setClube((c) => c ? { ...c, points: c.points + Math.floor(invoice.amount) } : c);
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
    setClube((c) => c ? { ...c, points: c.points - reward.cost } : c);
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

  return (
    <ClaroContext.Provider value={{
      user, services, invoices, dataHistory, supportChannels,
      clube, activity, notifications, recommendations,
      accounts, dark, searchQuery,
      loading, isLoggedIn,
      login, logout, switchAccount, toggleDark, setSearchQuery,
      confirmPayment, confirmRedeem,
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
