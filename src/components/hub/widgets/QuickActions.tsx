'use client';

import { Zap, CreditCard, Plus, Headphones, type LucideIcon } from 'lucide-react';
import type { SectionId } from '../HubSidebar';

interface Action {
  id: string;
  icon: LucideIcon;
  label: string;
}

const ACTIONS: Action[] = [
  { id: 'recharge', icon: Zap,        label: 'Recarregar'   },
  { id: 'pay',      icon: CreditCard, label: 'Pagar fatura' },
  { id: 'add',      icon: Plus,       label: 'Novo serviço' },
  { id: 'support',  icon: Headphones, label: 'Suporte'      },
];

interface Props {
  onNav: (page: SectionId) => void;
  onPay: () => void;
}

export function QuickActions({ onNav, onPay }: Props) {
  return (
    <section
      className="h-full bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 rounded-3xl p-5 flex flex-col"
      data-tour="quick"
    >
      <p className="text-[10px] font-bold text-warm-400 uppercase tracking-[0.22em] mb-3">Ações rápidas</p>
      <div className="flex-1 grid grid-cols-2 gap-2.5 content-center">
        {ACTIONS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => {
              if (id === 'pay') onPay?.();
              else if (id === 'support') onNav?.('support');
            }}
            className="group flex items-center gap-2.5 bg-warm-50 dark:bg-warm-700/40 border border-warm-200/70 dark:border-warm-700 hover:border-warm-900 dark:hover:border-warm-50 rounded-2xl px-3 py-3 text-left transition-colors"
          >
            <span className="w-8 h-8 rounded-lg bg-claro-soft group-hover:bg-claro flex items-center justify-center shrink-0 transition-colors">
              <Icon size={15} className="text-claro group-hover:text-white transition-colors" strokeWidth={1.8} />
            </span>
            <p className="text-[13px] font-black leading-tight">{label}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
