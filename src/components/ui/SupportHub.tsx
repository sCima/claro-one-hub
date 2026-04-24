'use client';

import { motion } from 'framer-motion';
import { MessageCircle, MessageSquare, Phone, ShoppingBag, Clock, LucideIcon } from 'lucide-react';
import type { SupportChannel } from '../../data/mockData';

const ICON_MAP: Record<string, LucideIcon> = {
  MessageCircle,
  MessageSquare,
  Phone,
  ShoppingBag,
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 },
};

export function SupportHub({ channels }: { channels: SupportChannel[] }) {
  return (
    <section>
      <h2 className="text-base font-bold text-gray-800 mb-4">Central de Suporte</h2>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {channels.map((ch) => {
          const Icon = ICON_MAP[ch.icon] ?? Phone;
          return (
            <motion.button
              key={ch.id}
              variants={item}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-2xl p-4 hover:border-[#D52B1E]/30 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#D52B1E]/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#D52B1E]" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-medium text-gray-700">{ch.label}</span>
              {ch.wait && (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <Clock className="w-3 h-3" />
                  {ch.wait}
                </span>
              )}
              {ch.number && <span className="text-xs text-gray-400">{ch.number}</span>}
            </motion.button>
          );
        })}
      </motion.div>
    </section>
  );
}
