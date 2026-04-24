'use client';

import { motion } from 'framer-motion';
import { Zap, CreditCard, Plus, Headphones, type LucideIcon } from 'lucide-react';

interface Action { id: string; icon: LucideIcon; label: string; sub: string }

const ACTIONS: Action[] = [
  { id: 'recharge', icon: Zap,         label: 'Recarregar',  sub: 'Celular pré-pago' },
  { id: 'pay',      icon: CreditCard,  label: 'Pagar fatura',sub: 'Via Pix em 1 toque' },
  { id: 'add',      icon: Plus,        label: 'Novo serviço',sub: 'Adicionar ao combo'  },
  { id: 'support',  icon: Headphones,  label: 'Suporte',     sub: 'Chat ou voz · 24h'   },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fade    = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export function QuickActions() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-4 gap-2.5"
    >
      {ACTIONS.map(({ id, icon: Icon, label, sub }) => (
        <motion.button
          key={id}
          variants={fade}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="group bg-white border border-gray-100 hover:border-black rounded-2xl p-4 text-left transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-[#D52B1E]/10 group-hover:bg-[#D52B1E] flex items-center justify-center mb-3 transition-colors">
            <Icon className="w-4 h-4 text-[#D52B1E] group-hover:text-white transition-colors" strokeWidth={1.8} />
          </div>
          <p className="text-sm font-black text-black">{label}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">{sub}</p>
        </motion.button>
      ))}
    </motion.div>
  );
}
