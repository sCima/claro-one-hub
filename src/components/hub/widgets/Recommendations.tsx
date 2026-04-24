'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Smartphone, Wifi, Tv, Phone, PlayCircle, Radio, Antenna, Gift, Tv2, MonitorPlay,
  ArrowUpRight, type LucideIcon,
} from 'lucide-react';
import type { Recommendation } from '../../../data/mockData';
import { servicesCatalog } from '../../../data/servicesCatalog';

const ICONS: Record<string, LucideIcon> = {
  Smartphone, Wifi, Tv, Phone, PlayCircle, Radio, Antenna, Gift, Tv2, MonitorPlay,
};

export function Recommendations({ items }: { items: Recommendation[] }) {
  const enriched = items
    .map((r) => ({ rec: r, svc: servicesCatalog.find((s) => s.slug === r.slug) }))
    .filter((x) => x.svc);

  return (
    <section>
      <header className="flex items-end justify-between mb-5">
        <div>
          <p className="text-[10px] font-bold text-[#D52B1E] uppercase tracking-widest mb-1">
            Personalizado para você
          </p>
          <h2 className="text-2xl font-black text-black tracking-tight">Pra somar ao seu combo</h2>
        </div>
      </header>

      <div className="grid sm:grid-cols-3 gap-3">
        {enriched.map(({ rec, svc }, i) => {
          const Icon = ICONS[svc!.icon] ?? Tv;
          return (
            <motion.div
              key={rec.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={`/servicos/${svc!.slug}`}
                className="group relative block bg-white border border-gray-100 hover:border-[#D52B1E] rounded-2xl p-5 transition-colors h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-[#D52B1E] transition-colors">
                    <Icon className="w-5 h-5 text-[#D52B1E] group-hover:text-white transition-colors" strokeWidth={1.6} />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-[#D52B1E] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>

                <p className="text-sm font-black text-black mb-1">{svc!.brand}</p>
                <p className="text-[11px] text-gray-500 leading-snug mb-4">{rec.reason}</p>

                <div className="flex items-baseline gap-1 pt-3 border-t border-gray-50">
                  <span className="text-[10px] text-gray-400">a partir de</span>
                  <span className="text-sm font-black text-black">
                    R$ {svc!.plans[0].price > 0 ? svc!.plans[0].price.toFixed(2).replace('.', ',') : '0,00'}
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
