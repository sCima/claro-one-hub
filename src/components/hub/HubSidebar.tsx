'use client';

import Image from 'next/image';
import {
  LayoutDashboard, FileText, Smartphone, Wifi, Tv, Phone,
  Gift, Headphones, Settings, X, ArrowUpRight, LifeBuoy,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useClaroContext } from '../../context/ClaroContext';

const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');

export type SectionId =
  | 'overview' | 'atendimento' | 'mobile' | 'internet' | 'tv' | 'voice'
  | 'invoices' | 'clube' | 'support' | 'settings';

interface NavItem { id: SectionId; icon: LucideIcon; label: string; badge?: string }

const sections: { group: string; items: NavItem[] }[] = [
  {
    group: 'Geral',
    items: [
      { id: 'overview',     icon: LayoutDashboard, label: 'Visão geral' },
      { id: 'atendimento',  icon: LifeBuoy,        label: 'Meu Atendimento' },
      { id: 'invoices',     icon: FileText,        label: 'Faturas',     badge: '1' },
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
      { id: 'clube',    icon: Gift,       label: 'Claro Clube'   },
      { id: 'support',  icon: Headphones, label: 'Suporte'       },
      { id: 'settings', icon: Settings,   label: 'Configurações' },
    ],
  },
];

interface Props {
  active: SectionId;
  onChange: (id: SectionId) => void;
  onOpenTour: () => void;
  mobile?: boolean;
  onClose?: () => void;
}

export function HubSidebar({ active, onChange, onOpenTour, mobile = false, onClose }: Props) {
  const { myTicket, session } = useClaroContext();
  const atendimentoBadge =
    myTicket && myTicket.status !== 'resolvido' ? '!'
    : (session?.historico.length ?? 0) > 0 && session?.status !== 'encerrada' ? '•'
    : undefined;
  return (
    <aside
      className={cx(
        'bg-white dark:bg-warm-800 border-r border-warm-200/70 dark:border-warm-700 flex flex-col',
        mobile
          ? 'fixed inset-y-0 left-0 w-72 z-50 anim-in'
          : 'hidden lg:flex fixed left-0 top-0 bottom-0 w-64 z-40',
      )}
    >
      {/* Header */}
      <div className="px-5 h-20 flex items-center gap-3 border-b border-warm-200/70 dark:border-warm-700">
        <div className="flex-1 min-w-0">
          <Image
            src="/logo-onehub.png"
            alt="Claro One Hub"
            width={140}
            height={36}
            className="h-9 w-auto object-contain object-left dark:brightness-0 dark:invert"
          />
        </div>
        {mobile && (
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-warm-100 dark:hover:bg-warm-700 cursor-pointer">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-5 px-3" data-tour="sidebar">
        {sections.map((section) => (
          <div key={section.group} className="mb-6">
            <p className="text-[10px] font-bold text-warm-400 uppercase tracking-[0.22em] px-3 mb-2">
              {section.group}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map(({ id, icon: Icon, label, badge: staticBadge }) => {
                const isActive = active === id;
                const badge = id === 'atendimento' ? atendimentoBadge : staticBadge;
                return (
                  <button
                    key={id}
                    onClick={() => onChange(id)}
                    className={cx(
                      'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                      isActive
                        ? 'bg-warm-900 text-white dark:bg-warm-50 dark:text-warm-900'
                        : 'text-warm-600 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-700 hover:text-warm-900 dark:hover:text-warm-50',
                    )}
                  >
                    <Icon size={16} strokeWidth={1.8} className="shrink-0" />
                    <span className="flex-1 text-left">{label}</span>
                    {badge && (
                      <span className="text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center bg-claro text-white">
                        {badge}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute -left-[3px] top-1/2 -translate-y-1/2 w-1 h-6 bg-claro rounded-r" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Tour CTA */}
      <div className="p-3 border-t border-warm-200/70 dark:border-warm-700">
        <button
          onClick={onOpenTour}
          className="w-full flex items-center justify-between bg-gradient-to-br from-claro to-claro-dark text-white rounded-2xl p-4 hover:brightness-110 transition"
        >
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-70 mb-1">Novidade</p>
            <p className="text-sm font-bold">Tour guiado do Hub</p>
          </div>
          <ArrowUpRight size={18} />
        </button>
      </div>
    </aside>
  );
}
