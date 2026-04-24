'use client';

import { motion } from 'framer-motion';
import { Download, ChevronRight } from 'lucide-react';
import type { Invoice } from '../../../data/mockData';

const fmtDate = (iso: string) => {
  const [, m, d] = iso.split('-');
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${d} ${months[+m - 1]}`;
};

const STATUS = {
  paid:    { label: 'Pago',     dot: 'bg-green-500',  text: 'text-green-700'   },
  pending: { label: 'Em aberto',dot: 'bg-[#D52B1E]',  text: 'text-[#D52B1E]'   },
};

export function InvoicesTable({ invoices }: { invoices: Invoice[] }) {
  return (
    <section className="bg-white border border-gray-100 rounded-3xl overflow-hidden">
      <header className="flex items-end justify-between p-7 pb-5">
        <div>
          <p className="text-[10px] font-bold text-[#D52B1E] uppercase tracking-widest mb-1">
            Faturas
          </p>
          <h3 className="text-2xl font-black text-black tracking-tight">Histórico</h3>
        </div>
        <button className="text-xs font-bold text-gray-500 hover:text-black transition-colors flex items-center gap-1">
          Ver todas <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-gray-400 font-bold border-y border-gray-100 bg-gray-50/50">
              <th className="text-left px-7 py-3 font-bold">Mês de referência</th>
              <th className="text-left px-3 py-3 font-bold">Vencimento</th>
              <th className="text-right px-3 py-3 font-bold">Valor</th>
              <th className="text-left px-3 py-3 font-bold">Status</th>
              <th className="px-7 py-3" />
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, i) => {
              const s = STATUS[inv.status];
              return (
                <motion.tr
                  key={inv.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors group"
                >
                  <td className="px-7 py-4 font-bold text-black">{inv.month}</td>
                  <td className="px-3 py-4 text-gray-500 text-xs">{fmtDate(inv.dueDate)}</td>
                  <td className="px-3 py-4 text-right font-black text-black tabular-nums">
                    R$ {inv.amount.toFixed(2).replace('.', ',')}
                  </td>
                  <td className="px-3 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${s.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                  </td>
                  <td className="px-7 py-4 text-right">
                    <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-black transition-all">
                      <Download className="w-4 h-4" strokeWidth={1.8} />
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
