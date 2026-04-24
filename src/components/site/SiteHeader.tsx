'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import { servicesCatalog } from '../../data/servicesCatalog';
import { TopBar } from './TopBar';

const NAV = [
  { label: 'Para Você',  group: ['Móvel', 'Internet', 'TV', 'Voz'] as const },
  { label: 'Conteúdo',   group: ['Conteúdo'] as const },
  { label: 'Benefícios', group: ['Benefícios'] as const },
];

export function SiteHeader({ onAccessHub }: { onAccessHub: () => void }) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <TopBar />
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Claro" width={80} height={32} className="h-8 w-auto" priority />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 flex-1">
          {NAV.map((n) => (
            <div
              key={n.label}
              className="relative"
              onMouseEnter={() => setOpenMenu(n.label)}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#D52B1E] transition-colors">
                {n.label}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <AnimatePresence>
                {openMenu === n.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 pt-2 w-[480px]"
                  >
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-4 grid grid-cols-2 gap-1">
                      {servicesCatalog
                        .filter((s) => (n.group as readonly string[]).includes(s.category))
                        .map((s) => (
                          <Link
                            key={s.slug}
                            href={`/servicos/${s.slug}`}
                            className="group flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <div className="w-2 h-2 rounded-full bg-[#D52B1E] mt-2 shrink-0" />
                            <div>
                              <p className="text-sm font-bold text-gray-900 group-hover:text-[#D52B1E] transition-colors">
                                {s.brand}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5 leading-snug">{s.tagline}</p>
                            </div>
                          </Link>
                        ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          <Link href="#combos" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#D52B1E] transition-colors">
            Combos
          </Link>
          <Link href="#lojas" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#D52B1E] transition-colors">
            Lojas
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onAccessHub}
            className="group flex items-center gap-2 bg-[#D52B1E] text-white text-sm font-bold rounded-full pl-5 pr-2 py-2 hover:bg-red-700 transition-colors"
          >
            Acessar One Hub
            <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>

        <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <Image src="/logo.png" alt="Claro" width={70} height={28} className="h-7 w-auto" />
                <button onClick={() => setMobileOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <nav className="flex flex-col gap-1">
                {servicesCatalog.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/servicos/${s.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between py-3 border-b border-gray-100 text-sm font-medium text-gray-700"
                  >
                    {s.brand}
                    <ChevronDown className="w-4 h-4 -rotate-90 text-gray-400" />
                  </Link>
                ))}
                <button
                  onClick={() => { setMobileOpen(false); onAccessHub(); }}
                  className="mt-6 bg-[#D52B1E] text-white font-bold text-sm rounded-full px-5 py-3"
                >
                  Acessar One Hub
                </button>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
