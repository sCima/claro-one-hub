'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { claroApi } from '../services/claroApi';
import {
  mockUser, mockClube,
  type Service, type Invoice, type DataPoint, type SupportChannel,
  type Activity, type Notification, type Recommendation,
} from '../data/mockData';

type User  = typeof mockUser;
type Clube = typeof mockClube;

interface ClaroState {
  user: User | null;
  services: Service[];
  invoices: Invoice[];
  dataHistory: DataPoint[];
  supportChannels: SupportChannel[];
  clube: Clube | null;
  activity: Activity[];
  notifications: Notification[];
  recommendations: Recommendation[];
  loading: boolean;
  isLoggedIn: boolean;
  login: () => Promise<void>;
  logout: () => void;
}

const ClaroContext = createContext<ClaroState | null>(null);

export function ClaroProvider({ children }: { children: ReactNode }) {
  const [user, setUser]                   = useState<User | null>(null);
  const [services, setServices]           = useState<Service[]>([]);
  const [invoices, setInvoices]           = useState<Invoice[]>([]);
  const [dataHistory, setDataHistory]     = useState<DataPoint[]>([]);
  const [supportChannels, setSupport]     = useState<SupportChannel[]>([]);
  const [clube, setClube]                 = useState<Clube | null>(null);
  const [activity, setActivity]           = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recommendations, setRecs]        = useState<Recommendation[]>([]);
  const [loading, setLoading]             = useState(false);
  const [isLoggedIn, setIsLoggedIn]       = useState(false);

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
      setSupport(sup); setClube(cl); setActivity(act);
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

  return (
    <ClaroContext.Provider value={{
      user, services, invoices, dataHistory, supportChannels,
      clube, activity, notifications, recommendations,
      loading, isLoggedIn, login, logout,
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
