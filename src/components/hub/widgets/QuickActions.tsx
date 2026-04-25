'use client';

import { Zap, CreditCard, Plus, Headphones, type LucideIcon } from 'lucide-react';
import type { SectionId } from '../HubSidebar';

interface Action {
  id: string;
  icon: LucideIcon;
  label: string;
  sub: string;
}

const ACTIONS: Action[] = [
  { id: 'recharge', icon: Zap,        label: 'Recarregar',   sub: 'Celular pré-pago'   },
  { id: 'pay',      icon: CreditCard, label: 'Pagar fatura', sub: 'Via Pix em 1 toque' },
  { id: 'add',      icon: Plus,       label: 'Novo serviço', sub: 'Adicionar ao combo'  },
  { id: 'support',  icon: Headphones, label: 'Suporte',      sub: 'Chat ou voz · 24h'  },
];

interface Props {
  onNav: (page: SectionId) => void;
  onPay: () => void;
}

export function QuickActions({ onNav, onPay }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5" data-tour="quick">
      {ACTIONS.map(({ id, icon: Icon, label, sub }) => (
        <button
          key={id}
          onClick={() => {
            if (id === 'pay') onPay?.();
            else if (id === 'support') onNav?.('support');
          }}
          className="group bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 hover:border-warm-900 dark:hover:border-warm-50 rounded-2xl p-4 text-left transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-claro-soft group-hover:bg-claro flex items-center justify-center mb-3 transition-colors">
            <Icon size={16} className="text-claro group-hover:text-white transition-colors" strokeWidth={1.8} />
          </div>
          <p className="text-sm font-black">{label}</p>
          <p className="text-[11px] text-warm-500 mt-0.5">{sub}</p>
        </button>
      ))}
    </div>
  );
}
