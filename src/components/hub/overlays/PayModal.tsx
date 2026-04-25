'use client';

import { useState, useEffect } from 'react';
import { X, Zap, CreditCard, FileText, ArrowRight, Lock, Check } from 'lucide-react';
import type { Invoice } from '../../../data/mockData';

const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');
const fmtBRL = (n: number) => n.toFixed(2).replace('.', ',');

interface Props {
  open: boolean;
  invoice: Invoice | null;
  onClose: () => void;
  onConfirm: (invoice: Invoice) => void;
}

export function PayModal({ open, invoice, onClose, onConfirm }: Props) {
  const [stage, setStage] = useState<'select' | 'processing' | 'done'>('select');
  const [method, setMethod] = useState('pix');

  useEffect(() => {
    if (open) {
      setStage('select');
      setMethod('pix');
    }
  }, [open]);

  if (!open || !invoice) return null;

  const proceed = () => {
    setStage('processing');
    setTimeout(() => setStage('done'), 1700);
  };

  const finish = () => {
    onConfirm(invoice);
    onClose();
  };

  const paymentMethods = [
    { id: 'pix',    icon: Zap,        label: 'Pix',                 desc: 'Aprovação imediata · sem taxa' },
    { id: 'card',   icon: CreditCard, label: 'Cartão · final 4231', desc: 'Mastercard · 1 parcela' },
    { id: 'boleto', icon: FileText,   label: 'Boleto bancário',     desc: 'Compensa em 1-3 dias úteis' },
  ];

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-warm-900/50 backdrop-blur-sm anim-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-warm-800 rounded-3xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-warm-900 text-white px-7 py-6 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-60 mb-1">
              Fatura {invoice.month}
            </p>
            <p className="text-3xl font-black tabular-nums">R$ {fmtBRL(invoice.amount)}</p>
          </div>
          <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity">
            <X size={18} />
          </button>
        </div>

        {stage === 'select' && (
          <div className="p-7 anim-in">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-warm-400 mb-3">
              Forma de pagamento
            </p>
            <div className="space-y-2 mb-6">
              {paymentMethods.map(m => {
                const selected = method === m.id;
                const Icon = m.icon;
                return (
                  <label
                    key={m.id}
                    className={cx(
                      'flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all',
                      selected
                        ? 'border-claro bg-claro-soft dark:bg-claro/10'
                        : 'border-warm-200 dark:border-warm-700 hover:border-warm-400'
                    )}
                  >
                    <input
                      type="radio"
                      name="m"
                      checked={selected}
                      onChange={() => setMethod(m.id)}
                      className="sr-only"
                    />
                    <div className={cx(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      selected
                        ? 'bg-claro text-white'
                        : 'bg-warm-100 dark:bg-warm-700 text-warm-600 dark:text-warm-200'
                    )}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{m.label}</p>
                      <p className="text-[11px] text-warm-500">{m.desc}</p>
                    </div>
                    <span className={cx(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                      selected ? 'border-claro bg-claro' : 'border-warm-300'
                    )}>
                      {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </label>
                );
              })}
            </div>
            <button
              onClick={proceed}
              className="w-full inline-flex items-center justify-center gap-2 font-bold rounded-full transition-colors text-sm px-7 py-3.5 bg-claro text-white hover:bg-claro-dark"
            >
              Confirmar pagamento <ArrowRight size={16} />
            </button>
            <p className="text-[10px] text-warm-400 text-center mt-3 flex items-center justify-center gap-1">
              <Lock size={10} /> Transação criptografada · Claro Pay
            </p>
          </div>
        )}

        {stage === 'processing' && (
          <div className="p-10 text-center anim-in">
            <div className="w-16 h-16 mx-auto rounded-full border-4 border-warm-200 border-t-claro animate-spin mb-5" />
            <p className="text-lg font-bold mb-1">Processando pagamento</p>
            <p className="text-sm text-warm-500">Conectando ao banco emissor...</p>
          </div>
        )}

        {stage === 'done' && (
          <div className="p-10 text-center anim-in">
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="absolute inset-0 bg-green-500/20 rounded-full ping-dot" />
              <div className="relative w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
                <Check size={40} strokeWidth={3.5} className="text-white" />
              </div>
            </div>
            <p className="text-xl font-black mb-1">Pagamento aprovado!</p>
            <p className="text-sm text-warm-500 mb-1">Comprovante enviado para seu e-mail.</p>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-bold mb-6">
              + {Math.floor(invoice.amount)} pts no Claro Clube
            </p>
            <button
              onClick={finish}
              className="w-full inline-flex items-center justify-center gap-2 font-bold rounded-full transition-colors text-sm px-7 py-3.5 bg-warm-900 text-white hover:bg-claro dark:bg-warm-50 dark:text-warm-900 dark:hover:bg-claro dark:hover:text-white"
            >
              Voltar ao Hub
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
