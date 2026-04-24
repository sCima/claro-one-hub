'use client';

import { motion } from 'framer-motion';
import { Smartphone, Wifi, Tv, Phone, ChevronRight, type LucideIcon } from 'lucide-react';
import type { Service } from '../../../data/mockData';

const ICONS: Record<Service['type'], LucideIcon> = {
  mobile:    Smartphone,
  broadband: Wifi,
  tv:        Tv,
  fixo:      Phone,
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export function ServicesPanel({ services }: { services: Service[] }) {
  return (
    <section>
      <header className="flex items-end justify-between mb-5">
        <div>
          <p className="text-[10px] font-bold text-[#D52B1E] uppercase tracking-widest mb-1">
            Meus serviços
          </p>
          <h2 className="text-2xl font-black text-black tracking-tight">
            {services.length} ativos no combo
          </h2>
        </div>
        <button className="text-xs font-bold text-gray-500 hover:text-black transition-colors flex items-center gap-1">
          Gerenciar todos <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </header>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid sm:grid-cols-2 gap-3"
      >
        {services.map((s) => {
          const Icon = ICONS[s.type];
          const usage = s.dataUsed != null && s.dataLimit != null
            ? Math.round((s.dataUsed / s.dataLimit) * 100)
            : null;

          return (
            <motion.article
              key={s.id}
              variants={fadeUp}
              className="group bg-white border border-gray-100 rounded-2xl p-5 hover:border-black/20 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-[#D52B1E] group-hover:text-white flex items-center justify-center transition-colors">
                    <Icon className="w-4 h-4 text-[#D52B1E] group-hover:text-white transition-colors" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {s.label}
                    </p>
                    <p className="text-sm font-black text-black leading-tight">{s.plan}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-green-700 bg-green-50 rounded-full px-2 py-0.5">
                  Ativo
                </span>
              </div>

              <p className="text-[11px] text-gray-500 mb-4 truncate">{s.identifier}</p>

              {usage != null ? (
                <div className="mb-4">
                  <div className="flex justify-between text-[10px] text-gray-500 mb-1.5">
                    <span><b className="text-black">{s.dataUsed} {s.unit}</b> usados</span>
                    <span>{s.dataLimit} {s.unit}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${usage}%` }}
                      transition={{ duration: 0.9, ease: 'easeOut' }}
                      className={`h-full rounded-full ${usage > 80 ? 'bg-yellow-500' : 'bg-[#D52B1E]'}`}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">{usage}% do plano consumido</p>
                </div>
              ) : s.streaming ? (
                <div className="flex flex-wrap gap-1 mb-4">
                  {s.streaming.map((st) => (
                    <span key={st} className="text-[10px] font-medium bg-gray-50 text-gray-600 px-2 py-0.5 rounded">
                      {st}
                    </span>
                  ))}
                  {s.channels && (
                    <span className="text-[10px] font-medium bg-gray-50 text-gray-600 px-2 py-0.5 rounded">
                      +{s.channels} canais
                    </span>
                  )}
                </div>
              ) : (
                <div className="mb-4 flex items-center gap-1 text-[11px] text-gray-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Linha disponível 24h
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <span className="text-[11px] text-gray-500">
                  <b className="text-black">R$ {s.amount.toFixed(2).replace('.', ',')}</b> /mês
                </span>
                <button className="text-[11px] font-bold text-black hover:text-[#D52B1E] transition-colors flex items-center gap-1">
                  Detalhes <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </motion.article>
          );
        })}
      </motion.div>
    </section>
  );
}
