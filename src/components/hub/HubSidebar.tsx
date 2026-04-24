'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Smartphone, Wifi, Tv, Phone, FileText,
  Gift, Headphones, Settings, ArrowUpRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type SectionId =
  | 'overview' | 'mobile' | 'internet' | 'tv' | 'voice'
  | 'invoices' | 'clube' | 'support' | 'settings';

interface NavItem { id: SectionId; icon: LucideIcon; label: string; badge?: string }

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: 'Geral',
    items: [
      { id: 'overview', icon: LayoutDashboard, label: 'Visão geral' },
      { id: 'invoices', icon: FileText,        label: 'Faturas',     badge: '1' },
    ],
  },
  {
    group: 'Meus serviços',
    items: [
      { id: 'mobile',   icon: Smartphone, label: 'Celular'  },
      { id: 'internet', icon: Wifi,       label: 'Internet' },
      { id: 'tv',       icon: Tv,         label: 'TV+'      },
      { id: 'voice',    icon: Phone,      label: 'Fixo'     },
    ],
  },
  {
    group: 'Benefícios',
    items: [
      { id: 'clube',    icon: Gift,       label: 'Claro Clube' },
      { id: 'support',  icon: Headphones, label: 'Suporte'      },
      { id: 'settings', icon: Settings,   label: 'Configurações'},
    ],
  },
];

interface Props {
  active: SectionId;
  onChange: (id: SectionId) => void;
}

export function HubSidebar({ active, onChange }: Props) {
  return (
    <motion.aside
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 flex-col z-40"
    >
      <Link href="/" className="px-7 h-20 flex items-center gap-3 border-b border-gray-100">
        <Image src="/logo.png" alt="Claro" width={70} height={28} className="h-7 w-auto" priority />
        <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-gray-400">One Hub</span>
      </Link>

      <nav className="flex-1 overflow-y-auto py-6 px-4">
        {NAV.map((section) => (
          <div key={section.group} className="mb-7">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">
              {section.group}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map(({ id, icon: Icon, label, badge }) => {
                const isActive = active === id;
                return (
                  <button
                    key={id}
                    onClick={() => onChange(id)}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative
                      ${isActive
                        ? 'bg-black text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                      }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                    <span className="flex-1 text-left">{label}</span>
                    {badge && (
                      <span className={`text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center
                        ${isActive ? 'bg-[#D52B1E] text-white' : 'bg-[#D52B1E] text-white'}`}>
                        {badge}
                      </span>
                    )}
                    {isActive && (
                      <motion.span
                        layoutId="active-pill-dot"
                        className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#D52B1E] rounded-r"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <Link
          href="/"
          className="group flex items-center justify-between bg-gradient-to-br from-[#D52B1E] to-[#9A1F16] text-white rounded-2xl p-4"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Site Claro</p>
            <p className="text-sm font-bold">Explorar planos</p>
          </div>
          <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </motion.aside>
  );
}
