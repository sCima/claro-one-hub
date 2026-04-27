'use client';

import { X, Download, Smartphone, Wifi, Tv, Phone, Receipt, Calendar, Tag } from 'lucide-react';
import type { Invoice, Service } from '../../../data/mockData';

const fmtBRL = (n: number) => n.toFixed(2).replace('.', ',');
const fmtFullDate = (iso: string) => {
  const [y, m, d] = iso.split('-');
  const months = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  return `${d} ${months[+m - 1]} ${y}`;
};

const SERVICE_ICONS = { mobile: Smartphone, broadband: Wifi, tv: Tv, fixo: Phone } as const;

interface Props {
  open: boolean;
  invoice: Invoice | null;
  services: Service[];
  onClose: () => void;
  onPay: (invoice: Invoice) => void;
}

export function BillDetailsModal({ open, invoice, services, onClose, onPay }: Props) {
  if (!open || !invoice) return null;

  /* Soma dos serviços e desconto-combo derivado */
  const sumServices = services.reduce((acc, s) => acc + s.amount, 0);
  const discount = +(sumServices - invoice.amount).toFixed(2);
  const taxes = +(invoice.amount * 0.04).toFixed(2);
  const subtotal = +(invoice.amount - taxes).toFixed(2);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-warm-900/50 backdrop-blur-sm anim-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-warm-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header escuro */}
        <div className="bg-warm-900 text-white px-7 py-6 flex items-start justify-between shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-60 mb-1 flex items-center gap-2">
              <Receipt size={12} /> Detalhes da fatura
            </p>
            <p className="text-sm font-bold opacity-80">{invoice.month}</p>
            <p className="text-3xl font-black tabular-nums mt-2">R$ {fmtBRL(invoice.amount)}</p>
            <p className="text-[11px] opacity-60 mt-1.5 flex items-center gap-1.5">
              <Calendar size={11} /> Vence em {fmtFullDate(invoice.dueDate)}
            </p>
          </div>
          <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">
            <X size={18} />
          </button>
        </div>

        {/* Lista de serviços */}
        <div className="p-7 overflow-y-auto flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-warm-400 mb-3">
            Serviços inclusos
          </p>
          <ul className="divide-y divide-warm-100 dark:divide-warm-700 mb-6">
            {services.map((s) => {
              const Icon = SERVICE_ICONS[s.type as keyof typeof SERVICE_ICONS] ?? Receipt;
              const pct = sumServices > 0 ? (s.amount / sumServices) * 100 : 0;
              return (
                <li key={s.id} className="py-3.5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-claro-soft dark:bg-claro/15 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-claro" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-bold truncate">{s.label}</p>
                      <p className="text-sm font-black tabular-nums">R$ {fmtBRL(s.amount)}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3 mt-0.5">
                      <p className="text-[11px] text-warm-500 truncate">{s.plan}</p>
                      <p className="text-[10px] text-warm-400 tabular-nums">{pct.toFixed(0)}% do total</p>
                    </div>
                    {/* Mini-bar */}
                    <div className="mt-2 h-1 rounded-full bg-warm-100 dark:bg-warm-700 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-claro to-claro-dark transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
            {services.length === 0 && (
              <li className="py-8 text-center text-sm text-warm-500">
                Nenhum serviço ativo nesta conta.
              </li>
            )}
          </ul>

          {/* Resumo financeiro */}
          <div className="bg-warm-50 dark:bg-warm-700/40 rounded-2xl p-5 space-y-2.5 text-sm">
            <div className="flex items-center justify-between text-warm-500">
              <span>Subtotal</span>
              <span className="tabular-nums">R$ {fmtBRL(sumServices)}</span>
            </div>
            {discount > 0.01 && (
              <div className="flex items-center justify-between text-green-700 dark:text-green-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Tag size={12} /> Desconto Combo Multi
                </span>
                <span className="tabular-nums">- R$ {fmtBRL(discount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-warm-500">
              <span>Tributos e taxas</span>
              <span className="tabular-nums">R$ {fmtBRL(taxes)}</span>
            </div>
            <div className="flex items-center justify-between text-warm-500">
              <span>Base sem tributos</span>
              <span className="tabular-nums">R$ {fmtBRL(subtotal)}</span>
            </div>
            <div className="border-t border-warm-200 dark:border-warm-600 pt-2.5 mt-2.5 flex items-center justify-between">
              <span className="font-black">Total a pagar</span>
              <span className="font-black text-lg tabular-nums">R$ {fmtBRL(invoice.amount)}</span>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="border-t border-warm-100 dark:border-warm-700 p-5 grid grid-cols-2 gap-2 shrink-0">
          <button className="inline-flex items-center justify-center gap-2 font-bold rounded-full transition-colors text-sm px-5 py-3 bg-warm-100 text-warm-800 hover:bg-warm-200 dark:bg-warm-700 dark:text-warm-100 dark:hover:bg-warm-600">
            <Download size={14} /> Baixar PDF
          </button>
          {invoice.status === 'pending' ? (
            <button
              onClick={() => { onPay(invoice); onClose(); }}
              className="inline-flex items-center justify-center gap-2 font-bold rounded-full transition-colors text-sm px-5 py-3 bg-claro text-white hover:bg-claro-dark"
            >
              Pagar R$ {fmtBRL(invoice.amount)}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center font-bold rounded-full transition-colors text-sm px-5 py-3 bg-warm-900 text-white hover:bg-claro dark:bg-warm-50 dark:text-warm-900 dark:hover:bg-claro dark:hover:text-white"
            >
              Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
