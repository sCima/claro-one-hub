'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Bell, LogOut, ChevronDown, Menu } from 'lucide-react';
import { useClaroContext } from '../../context/ClaroContext';

interface Props {
  onLogout: () => void;
  onOpenMobileNav: () => void;
}

export function HubTopBar({ onLogout, onOpenMobileNav }: Props) {
  const { user, notifications } = useClaroContext();
  const [openNotif, setOpenNotif] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="sticky top-0 z-30 h-20 bg-white/85 backdrop-blur border-b border-gray-100 flex items-center px-6 lg:px-10 gap-6"
    >
      <button onClick={onOpenMobileNav} className="lg:hidden p-2 -ml-2">
        <Menu className="w-5 h-5" />
      </button>

      <Link href="/" className="lg:hidden">
        <Image src="/logo.png" alt="Claro" width={64} height={26} className="h-6 w-auto" />
      </Link>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 flex-1 max-w-md bg-gray-50 hover:bg-gray-100 transition-colors rounded-full pl-4 pr-3 py-2.5 group focus-within:bg-white focus-within:ring-2 focus-within:ring-black/10">
        <Search className="w-4 h-4 text-gray-400" strokeWidth={1.8} />
        <input
          placeholder="Buscar serviços, faturas, recompensas..."
          className="bg-transparent flex-1 text-sm placeholder:text-gray-400 outline-none"
        />
        <kbd className="hidden sm:inline-block text-[10px] font-mono bg-white border border-gray-200 text-gray-400 rounded px-1.5 py-0.5">⌘ K</kbd>
      </div>

      <div className="flex-1 md:flex-none" />

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => { setOpenNotif((v) => !v); setOpenProfile(false); }}
          className="relative w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <Bell className="w-5 h-5 text-gray-600" strokeWidth={1.6} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#D52B1E] rounded-full ring-2 ring-white" />
          )}
        </button>

        <AnimatePresence>
          {openNotif && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm font-bold text-black">Notificações</p>
                <span className="text-[10px] font-bold bg-[#D52B1E] text-white px-2 py-0.5 rounded-full">
                  {unreadCount} novas
                </span>
              </div>
              <ul className="max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <li key={n.id} className={`px-5 py-3.5 border-b border-gray-50 last:border-0 flex items-start gap-3 ${n.unread ? 'bg-red-50/30' : ''}`}>
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                      n.level === 'warn' ? 'bg-yellow-500' : n.level === 'promo' ? 'bg-green-500' : 'bg-[#D52B1E]'
                    }`} />
                    <div className="flex-1">
                      <p className="text-xs text-gray-800 leading-snug">{n.title}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile */}
      <div className="relative">
        <button
          onClick={() => { setOpenProfile((v) => !v); setOpenNotif(false); }}
          className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D52B1E] to-[#9A1F16] text-white flex items-center justify-center text-xs font-black">
            {user?.initials ?? 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-black leading-tight">{user?.name.split(' ')[0]}</p>
            <p className="text-[10px] text-gray-400">Cliente {user?.tier}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
        </button>

        <AnimatePresence>
          {openProfile && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="text-sm font-bold text-black">{user?.name}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{user?.email}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold bg-yellow-50 text-yellow-700 rounded-full px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                  Plano {user?.plan}
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-5 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#D52B1E] transition-colors"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.8} /> Sair da conta
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
