'use client';

import { motion } from 'framer-motion';
import {
  CreditCard, Smartphone, Gift, TrendingUp, ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import type { Activity } from '../../../data/mockData';

const ICONS: Record<string, LucideIcon> = {
  CreditCard, Smartphone, Gift, TrendingUp,
};

const fmtDate = (iso: string) => {
  const [, m, d] = iso.split('-');
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${d} ${months[+m - 1]}`;
};

export function ActivityFeed({ items }: { items: Activity[] }) {
  return (
    <section className="bg-white border border-gray-100 rounded-3xl p-7">
      <header className="flex items-end justify-between mb-5">
        <div>
          <p className="text-[10px] font-bold text-[#D52B1E] uppercase tracking-widest mb-1">
            Últimas movimentações
          </p>
          <h3 className="text-2xl font-black text-black tracking-tight">Atividade</h3>
        </div>
        <button className="text-xs font-bold text-gray-500 hover:text-black transition-colors flex items-center gap-1">
          Histórico <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </header>

      <ul className="space-y-1">
        {items.map((a, i) => {
          const Icon = ICONS[a.icon] ?? CreditCard;
          const positive = a.amount > 0;
          const isPoints = a.unit === 'pts';
          const fmt = isPoints
            ? `${positive ? '+' : ''}${Math.abs(a.amount).toLocaleString('pt-BR')} pts`
            : `${positive ? '+' : '−'} R$ ${Math.abs(a.amount).toFixed(2).replace('.', ',')}`;

          return (
            <motion.li
              key={a.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0"
            >
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-gray-700" strokeWidth={1.7} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-black truncate">{a.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{fmtDate(a.date)} · {a.type}</p>
              </div>
              <span className={`text-sm font-black tabular-nums shrink-0
                ${positive ? 'text-green-600' : isPoints ? 'text-yellow-700' : 'text-black'}`}>
                {fmt}
              </span>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
