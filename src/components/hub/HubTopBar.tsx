'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu, Search, Sun, Moon, Bell, ChevronDown, Plus, LogOut, X, ShieldCheck, MessageSquare, Smartphone,
} from 'lucide-react';
import { useClaroContext } from '../../context/ClaroContext';
import { SearchResults } from './widgets/SearchResults';
import type { SectionId } from './HubSidebar';

const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');

interface Props {
  onLogout: () => void;
  onOpenMobileNav: () => void;
  onNavigate: (page: SectionId) => void;
  onAskClara: (q: string) => void;
}

export function HubTopBar({ onLogout, onOpenMobileNav, onNavigate, onAskClara }: Props) {
  const {
    activeUser, user, accounts, notifications, dark,
    services, invoices, clube,
    searchQuery, switchAccount, toggleDark, setSearchQuery,
    markNotificationRead, markAllNotificationsRead,
  } = useClaroContext();
  const profile = activeUser ?? user;
  const [searchFocus, setSearchFocus] = useState(false);
  const router = useRouter();

  const [notifOpen,   setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [acctOpen,    setAcctOpen]    = useState(false);

  const wrapRef = useRef<HTMLElement>(null);
  const unread  = notifications.filter((n) => n.unread).length;
  const active  = accounts.find((a) => a.active) ?? accounts[0];

  /* Close all dropdowns on outside click */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setNotifOpen(false);
        setProfileOpen(false);
        setAcctOpen(false);
        setSearchFocus(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = () => {
    onLogout(); // parent (HubPage) handles context logout + navigation
  };

  return (
    <header
      ref={wrapRef}
      className="sticky top-0 z-30 h-20 bg-white/85 dark:bg-warm-800/85 backdrop-blur border-b border-warm-200/70 dark:border-warm-700 flex items-center px-6 lg:px-10 gap-4 lg:gap-6"
    >
      {/* Mobile nav trigger */}
      <button onClick={onOpenMobileNav} className="lg:hidden p-2 -ml-2">
        <Menu size={20} />
      </button>

      {/* Account switcher */}
      <div className="relative shrink-0" data-tour="switcher">
        <button
          onClick={() => { setAcctOpen((v) => !v); setNotifOpen(false); setProfileOpen(false); }}
          className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full hover:bg-warm-100 dark:hover:bg-warm-700 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-claro to-claro-dark text-white flex items-center justify-center text-xs font-black">
            {active?.initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-[10px] font-bold text-warm-400 uppercase tracking-wider leading-none mb-0.5">
              {active?.kind}
            </p>
            <p className="text-xs font-bold text-warm-900 dark:text-warm-50 leading-none">
              {active?.name.split(' ')[0]}
            </p>
          </div>
          <ChevronDown size={14} className="text-warm-400 hidden sm:block" />
        </button>

        {acctOpen && (
          <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 rounded-2xl shadow-2xl overflow-hidden anim-in">
            <div className="px-5 py-3 border-b border-warm-100 dark:border-warm-700">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-warm-400">Trocar conta</p>
            </div>
            <ul className="max-h-80 overflow-y-auto py-1">
              {accounts.map((a) => (
                <li key={a.id}>
                  <button
                    onClick={() => { switchAccount(a.id); setAcctOpen(false); }}
                    className={cx(
                      'w-full flex items-center gap-3 px-5 py-3 hover:bg-warm-50 dark:hover:bg-warm-700 text-left',
                      a.active && 'bg-warm-50 dark:bg-warm-700',
                    )}
                  >
                    <div className="w-9 h-9 rounded-full bg-warm-200 dark:bg-warm-600 text-warm-700 dark:text-warm-100 flex items-center justify-center text-xs font-black">
                      {a.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-warm-900 dark:text-warm-50 truncate">{a.name}</p>
                      <p className="text-[11px] text-warm-500 truncate">{a.plan}</p>
                    </div>
                    {a.active && <span className="w-2 h-2 rounded-full bg-claro" />}
                  </button>
                </li>
              ))}
            </ul>
            <button className="w-full flex items-center gap-2 px-5 py-3 text-xs font-bold text-claro border-t border-warm-100 dark:border-warm-700 hover:bg-claro-soft dark:hover:bg-claro/10">
              <Plus size={14} /> Adicionar conta
            </button>
          </div>
        )}
      </div>

      {/* Search — ocupa toda a largura disponível entre a conta e os ícones */}
      <div className="relative hidden md:flex flex-1 min-w-0" data-tour="search">
        <div
          className={cx(
            'flex items-center gap-2 w-full transition-colors rounded-full pl-4 pr-3 py-2.5',
            searchFocus
              ? 'bg-white dark:bg-warm-700 ring-2 ring-claro/40'
              : 'bg-warm-100 dark:bg-warm-700 hover:bg-warm-200/70'
          )}
        >
          <Search size={14} className="text-warm-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            placeholder="Buscar serviços, faturas, recompensas..."
            className="bg-transparent flex-1 text-sm placeholder:text-warm-400 outline-none"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="text-warm-400 hover:text-warm-700 dark:hover:text-warm-100"
              aria-label="Limpar busca"
            >
              <X size={14} />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block text-[10px] font-mono bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-600 text-warm-400 rounded px-1.5 py-0.5">
              ⌘ K
            </kbd>
          )}
        </div>
        {searchFocus && (
          <SearchResults
            query={searchQuery}
            services={services}
            invoices={invoices}
            clube={clube}
            onNavigate={(p) => { onNavigate(p); setSearchQuery(''); setSearchFocus(false); }}
            onClose={() => { setSearchFocus(false); }}
            onAskClara={(q) => { onAskClara(q); setSearchQuery(''); setSearchFocus(false); }}
          />
        )}
      </div>

      {/* Empurra os ícones para a direita quando a busca está oculta (mobile) */}
      <div className="flex-1 md:hidden" />

      {/* Cluster de ações — agrupado à direita */}
      <div className="flex items-center gap-2 shrink-0">

      {/* Dark mode toggle */}
      <button
        onClick={toggleDark}
        className={cx(
          'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
          dark
            ? 'bg-warm-700 hover:bg-warm-600 text-amber-300'
            : 'bg-warm-100 hover:bg-warm-200 text-warm-600',
        )}
        aria-label="Alternar tema"
        title={dark ? 'Modo claro' : 'Modo escuro'}
      >
        {dark
          ? <Sun size={18} />
          : <Moon size={18} />
        }
      </button>

      {/* Notifications */}
      <div className="relative" data-tour="notifications">
        <button
          onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); setAcctOpen(false); }}
          className="relative w-10 h-10 rounded-full hover:bg-warm-100 dark:hover:bg-warm-700 flex items-center justify-center"
        >
          <Bell size={18} className="text-warm-600 dark:text-warm-200" />
          {unread > 0 && (
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-claro rounded-full ring-2 ring-white dark:ring-warm-800" />
          )}
        </button>

        {notifOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 rounded-2xl shadow-2xl overflow-hidden anim-in">
            <div className="px-5 py-4 border-b border-warm-100 dark:border-warm-700 flex items-center justify-between gap-2">
              <p className="text-sm font-bold">Notificações</p>
              {unread > 0 ? (
                <button onClick={markAllNotificationsRead} className="text-[10px] font-bold text-claro hover:underline">
                  Marcar todas como lidas
                </button>
              ) : (
                <span className="text-[10px] font-bold text-warm-400">Tudo em dia</span>
              )}
            </div>
            <ul className="max-h-72 overflow-y-auto">
              {notifications.length === 0 && (
                <li className="px-5 py-8 text-center text-[12px] text-warm-400">Nenhuma notificação.</li>
              )}
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={cx(
                    'px-5 py-3.5 border-b border-warm-100 dark:border-warm-700 last:border-0 flex items-start gap-3',
                    n.unread && 'bg-claro-soft/40 dark:bg-claro/10',
                  )}
                >
                  <span
                    className={cx(
                      'mt-1.5 w-1.5 h-1.5 rounded-full shrink-0',
                      n.level === 'warn'  ? 'bg-amber-500'  :
                      n.level === 'promo' ? 'bg-green-500'  : 'bg-claro',
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-warm-800 dark:text-warm-100 leading-snug">{n.title}</p>
                    <p className="text-[10px] text-warm-400 mt-1">{n.time}</p>
                  </div>
                  {n.unread && (
                    <button
                      onClick={() => markNotificationRead(n.id)}
                      className="text-[9px] font-bold text-warm-400 hover:text-claro shrink-0 mt-0.5"
                    >
                      marcar lida
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="relative">
        <button
          onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); setAcctOpen(false); }}
          className="flex items-center gap-2 p-1.5 rounded-full hover:bg-warm-100 dark:hover:bg-warm-700"
        >
          <div className="w-8 h-8 rounded-full bg-warm-200 dark:bg-warm-600 text-warm-700 dark:text-warm-100 flex items-center justify-center text-[10px] font-black">
            {profile?.initials ?? 'U'}
          </div>
          <ChevronDown size={14} className="text-warm-400 hidden sm:block" />
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 rounded-2xl shadow-2xl overflow-hidden anim-in">
            <div className="px-5 py-4 border-b border-warm-100 dark:border-warm-700">
              <p className="text-sm font-bold">{profile?.name}</p>
              <p className="text-[11px] text-warm-500 mt-0.5">{profile?.email}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded-full px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Cliente {profile?.tier}
              </div>
            </div>
            <button
              onClick={() => { setProfileOpen(false); router.push('/whatsapp'); }}
              className="w-full flex items-center gap-2.5 px-5 py-3 text-sm text-warm-600 dark:text-warm-200 hover:bg-warm-50 dark:hover:bg-warm-700 hover:text-claro border-b border-warm-100 dark:border-warm-700"
            >
              <MessageSquare size={16} /> Canal WhatsApp
              <span className="ml-auto text-[9px] font-bold uppercase tracking-wider bg-warm-100 dark:bg-warm-700 text-warm-500 rounded-full px-2 py-0.5">
                Simulação
              </span>
            </button>
            <button
              onClick={() => { setProfileOpen(false); router.push('/app'); }}
              className="w-full flex items-center gap-2.5 px-5 py-3 text-sm text-warm-600 dark:text-warm-200 hover:bg-warm-50 dark:hover:bg-warm-700 hover:text-claro border-b border-warm-100 dark:border-warm-700"
            >
              <Smartphone size={16} /> Canal App
              <span className="ml-auto text-[9px] font-bold uppercase tracking-wider bg-warm-100 dark:bg-warm-700 text-warm-500 rounded-full px-2 py-0.5">
                Simulação
              </span>
            </button>
            <button
              onClick={() => { setProfileOpen(false); router.push('/admin'); }}
              className="w-full flex items-center gap-2.5 px-5 py-3 text-sm text-warm-600 dark:text-warm-200 hover:bg-warm-50 dark:hover:bg-warm-700 hover:text-claro border-b border-warm-100 dark:border-warm-700"
            >
              <ShieldCheck size={16} /> One Hub Admin
              <span className="ml-auto text-[9px] font-bold uppercase tracking-wider bg-warm-100 dark:bg-warm-700 text-warm-500 rounded-full px-2 py-0.5">
                Atendente
              </span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-5 py-3 text-sm text-warm-600 dark:text-warm-200 hover:bg-warm-50 dark:hover:bg-warm-700 hover:text-claro"
            >
              <LogOut size={16} /> Sair da conta
            </button>
          </div>
        )}
      </div>

      </div>
    </header>
  );
}
