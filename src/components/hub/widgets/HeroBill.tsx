'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Download, BarChart3 } from 'lucide-react';
import type { Invoice } from '../../../data/mockData';

const fmtBR = (n: number) => n.toFixed(2).replace('.', ',');
const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split('-');
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${d} ${months[+m - 1]} ${y}`;
};

interface Props {
  invoice: Invoice | null;
  totalServices: number;
}

export function HeroBill({ invoice, totalServices }: Props) {
  if (!invoice) {
    return (
      <div className="bg-white border border-gray-100 rounded-3xl p-8 text-center">
        <p className="text-sm text-gray-500">Nenhuma fatura em aberto.</p>
      </div>
    );
  }

  const daysToDue = Math.ceil(
    (new Date(invoice.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-black text-white rounded-3xl p-8 lg:p-10"
    >
      <div
        aria-hidden
        className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#D52B1E]/30 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      />

      <div className="relative grid lg:grid-cols-3 gap-8 items-end">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-[10px] font-bold tracking-widest uppercase bg-[#D52B1E] text-white rounded-full px-2.5 py-1">
              Fatura aberta
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-white/50">
              {invoice.month}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-base font-bold">R$</span>
            <span className="text-6xl lg:text-7xl font-black leading-none tracking-tight">
              {Math.floor(invoice.amount)}
            </span>
            <span className="text-3xl font-black">,{fmtBR(invoice.amount).split(',')[1]}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-white/70">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" strokeWidth={1.8} />
              Vence em {fmtDate(invoice.dueDate)}
            </span>
            <span>·</span>
            <span className={daysToDue <= 5 ? 'text-yellow-300 font-bold' : ''}>
              {daysToDue > 0 ? `Faltam ${daysToDue} dias` : 'Vencida'}
            </span>
            <span>·</span>
            <span>{totalServices} serviços inclusos</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button className="group flex items-center justify-between bg-[#D52B1E] hover:bg-red-700 transition-colors rounded-full pl-5 pr-2 py-3 font-bold text-sm">
            Pagar agora
            <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-1.5 border border-white/15 hover:bg-white/10 transition-colors rounded-full py-2.5 text-xs font-medium">
              <Download className="w-3.5 h-3.5" strokeWidth={1.8} /> PDF
            </button>
            <button className="flex items-center justify-center gap-1.5 border border-white/15 hover:bg-white/10 transition-colors rounded-full py-2.5 text-xs font-medium">
              <BarChart3 className="w-3.5 h-3.5" strokeWidth={1.8} /> Detalhes
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
