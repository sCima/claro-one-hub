'use client';

import { useState } from 'react';
import { Check, Download, Eye } from 'lucide-react';
import type { Invoice } from '../../../data/mockData';

const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');
const fmtBRL = (n: number) => n.toFixed(2).replace('.', ',');
const fmtFullDate = (iso: string) => {
  const [y, m, d] = iso.split('-');
  const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  return `${d} ${months[+m - 1]} ${y}`;
};

interface Props {
  invoices: Invoice[];
  onPay: (invoice: Invoice) => void;
  onShowDetails?: (invoice: Invoice) => void;
}

export function InvoicesPage({ invoices, onPay, onShowDetails }: Props) {
  const [filter, setFilter] = useState('Todas');

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);

  const filtered =
    filter === 'Pagas'     ? invoices.filter(i => i.status === 'paid')
    : filter === 'Em aberto' ? invoices.filter(i => i.status === 'pending')
    : invoices;

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-[10px] font-bold text-claro uppercase tracking-[0.22em] mb-2">Financeiro</p>
          <h1 className="text-4xl font-black tracking-tight">Faturas</h1>
          <p className="text-sm text-warm-500 mt-2">Histórico completo dos últimos 12 meses · todas as contas no combo.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 font-bold rounded-full transition-colors text-sm px-5 py-2.5 bg-warm-100 text-warm-800 hover:bg-warm-200 dark:bg-warm-700 dark:text-warm-100 dark:hover:bg-warm-600">
          <Download size={14} /> Exportar tudo
        </button>
      </header>

      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { label: 'Em aberto',    value: invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0) },
          { label: 'Pago em 2026', value: totalPaid },
          { label: 'Média mensal', value: invoices.reduce((s, i) => s + i.amount, 0) / invoices.length },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 rounded-2xl p-5">
            <p className="text-[10px] font-bold text-warm-400 uppercase tracking-[0.22em] mb-2">{s.label}</p>
            <p className="text-3xl font-black tabular-nums">R$ {fmtBRL(s.value)}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-warm-800 border border-warm-200/70 dark:border-warm-700 rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-warm-100 dark:border-warm-700 flex items-center justify-between">
          <p className="text-sm font-bold">Histórico</p>
          <div className="flex gap-1 bg-warm-100 dark:bg-warm-700 rounded-full p-1 text-xs">
            {['Todas', 'Pagas', 'Em aberto'].map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={cx(
                  'px-3 py-1 rounded-full font-bold transition-colors',
                  filter === t
                    ? 'bg-warm-900 dark:bg-warm-50 dark:text-warm-900 text-white'
                    : 'text-warm-500'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="text-[10px] font-bold text-warm-400 uppercase tracking-[0.22em]">
            <tr className="text-left">
              <th className="px-6 py-3 font-bold">Mês</th>
              <th className="px-6 py-3 font-bold">Vencimento</th>
              <th className="px-6 py-3 font-bold">Status</th>
              <th className="px-6 py-3 font-bold text-right">Valor</th>
              <th className="px-6 py-3 font-bold w-[1%]"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => (
              <tr
                key={inv.id}
                className="border-t border-warm-100 dark:border-warm-700 hover:bg-warm-50 dark:hover:bg-warm-700/50 transition-colors"
              >
                <td className="px-6 py-4 font-bold">{inv.month}</td>
                <td className="px-6 py-4 text-warm-500">{fmtFullDate(inv.dueDate)}</td>
                <td className="px-6 py-4">
                  {inv.status === 'paid' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase rounded-full px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <Check size={10} strokeWidth={3} /> Paga
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase rounded-full px-2.5 py-1 bg-claro-soft text-claro dark:bg-claro/20 dark:text-claro">
                      Aguardando pagamento
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right font-black tabular-nums">R$ {fmtBRL(inv.amount)}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1">
                    {inv.status === 'pending' && (
                      <button
                        onClick={() => onPay(inv)}
                        className="inline-flex items-center justify-center gap-2 font-bold rounded-full transition-colors text-xs px-4 py-2 bg-claro text-white hover:bg-claro-dark"
                      >
                        Pagar
                      </button>
                    )}
                    {onShowDetails && (
                      <button
                        onClick={() => onShowDetails(inv)}
                        className="w-8 h-8 rounded-full hover:bg-warm-100 dark:hover:bg-warm-700 flex items-center justify-center"
                        aria-label="Ver detalhes"
                        title="Ver detalhes"
                      >
                        <Eye size={14} />
                      </button>
                    )}
                    <button
                      className="w-8 h-8 rounded-full hover:bg-warm-100 dark:hover:bg-warm-700 flex items-center justify-center"
                      aria-label="Baixar PDF"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
