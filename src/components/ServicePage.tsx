'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, Check, ChevronRight, Smartphone, Wifi, Tv, Phone,
  Gift, PlayCircle, Antenna, Tv2, MonitorPlay, Radio,
} from 'lucide-react';
import type { ClaroService } from '../data/servicesCatalog';
import { servicesCatalog } from '../data/servicesCatalog';
import { SiteHeader } from './site/SiteHeader';
import { SiteFooter } from './site/SiteFooter';

const ICON_MAP = { Smartphone, Wifi, Tv, Phone, PlayCircle, Radio, Antenna, Gift, Tv2, MonitorPlay };

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export function ServicePage({ service, onAccessHub }: { service: ClaroService; onAccessHub: () => void }) {
  const Icon = ICON_MAP[service.icon];
  const related = servicesCatalog
    .filter((s) => s.slug !== service.slug && s.category === service.category)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
      <SiteHeader onAccessHub={onAccessHub} />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-black transition-colors">Início</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-400">Serviços</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-black font-medium">{service.brand}</span>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-8 pb-20 lg:pt-12 lg:pb-28 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-[#D52B1E] mb-4"
            >
              <span className="w-6 h-px bg-[#D52B1E]" />
              {service.hero.eyebrow}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-black leading-[1.05] tracking-tight mb-6"
            >
              {service.hero.headline}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              className="text-gray-600 text-lg leading-relaxed max-w-xl mb-8"
            >
              {service.hero.sub}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-2 mb-10"
            >
              {service.badges.map((b) => (
                <span key={b} className="text-xs font-bold bg-gray-100 text-gray-700 rounded-full px-3 py-1.5">
                  {b}
                </span>
              ))}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <button className="group flex items-center justify-center gap-2 bg-[#D52B1E] text-white font-bold rounded-full pl-7 pr-3 py-4 hover:bg-red-700 transition-colors">
                Ver planos
                <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>
              <button className="border-2 border-black text-black font-bold rounded-full px-7 py-4 hover:bg-black hover:text-white transition-colors">
                Falar com consultor
              </button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative bg-gradient-to-br from-[#D52B1E] to-[#9A1F16] rounded-[32px] p-10 aspect-square flex flex-col justify-between overflow-hidden shadow-2xl">
              <div
                aria-hidden
                className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
              />
              <div className="relative flex items-start justify-between text-white">
                <Icon className="w-12 h-12" strokeWidth={1.3} />
                <span className="text-[10px] font-bold tracking-widest uppercase opacity-70">{service.category}</span>
              </div>
              <div className="relative text-white">
                <p className="text-xs uppercase tracking-widest opacity-70 mb-2">{service.brand}</p>
                <p className="text-3xl lg:text-4xl font-black leading-tight">{service.tagline}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="py-20 px-6 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="mb-14 max-w-2xl">
            <p className="text-xs font-bold text-[#D52B1E] uppercase tracking-widest mb-3">Por que {service.brand}</p>
            <h2 className="text-3xl lg:text-4xl font-black text-black leading-tight tracking-tight">
              {service.pitch}
            </h2>
          </div>
          <motion.div
            variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {service.highlights.map((h, i) => (
              <motion.div
                key={h.title} variants={fadeUp}
                className="bg-white rounded-3xl p-8 border border-gray-100 hover:border-[#D52B1E]/30 transition-colors"
              >
                <span className="text-[11px] font-black text-[#D52B1E] tracking-widest uppercase">
                  0{i + 1}
                </span>
                <h3 className="text-xl font-black text-black mt-4 mb-2">{h.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{h.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PLANOS */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
            <div>
              <p className="text-xs font-bold text-[#D52B1E] uppercase tracking-widest mb-3">Planos</p>
              <h2 className="text-4xl lg:text-5xl font-black text-black leading-tight tracking-tight">
                Escolha o seu.
              </h2>
            </div>
            <p className="text-gray-500 text-sm max-w-md">
              Preços válidos para novos clientes, contratação online com fidelidade de 12 meses.
            </p>
          </div>

          <div className={`grid gap-4 ${service.plans.length === 1 ? 'max-w-md mx-auto' : service.plans.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
            {service.plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className={`relative rounded-3xl p-8 border flex flex-col
                  ${plan.popular
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-gray-100 hover:border-gray-200 transition-colors'
                  }`}
              >
                {plan.highlight && (
                  <span className={`absolute -top-3 left-8 text-[10px] font-black tracking-widest uppercase rounded-full px-3 py-1
                    ${plan.popular ? 'bg-[#D52B1E] text-white' : 'bg-black text-white'}`}>
                    {plan.highlight}
                  </span>
                )}
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-1 ${plan.popular ? 'text-white/60' : 'text-gray-400'}`}>
                  {service.brand}
                </h3>
                <p className="text-2xl font-black mb-6">{plan.name}</p>

                <div className="mb-8">
                  {plan.price > 0 ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold">R$</span>
                      <span className="text-5xl font-black leading-none">{Math.floor(plan.price)}</span>
                      <span className="text-xl font-black">,{plan.price.toFixed(2).split('.')[1]}</span>
                      <span className={`text-xs ml-1 ${plan.popular ? 'text-white/50' : 'text-gray-400'}`}>/mês</span>
                    </div>
                  ) : (
                    <span className="text-3xl font-black">Sem mensalidade</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.popular ? 'text-[#D52B1E]' : 'text-[#D52B1E]'}`} strokeWidth={3} />
                      <span className={plan.popular ? 'text-white/90' : 'text-gray-700'}>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full rounded-full font-bold py-3 text-sm transition-colors
                    ${plan.popular
                      ? 'bg-[#D52B1E] text-white hover:bg-red-700'
                      : 'bg-black text-white hover:bg-[#D52B1E]'}`}
                >
                  Contratar {plan.name}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold text-[#D52B1E] uppercase tracking-widest mb-3">Dúvidas frequentes</p>
          <h2 className="text-3xl lg:text-4xl font-black text-black leading-tight tracking-tight mb-10">
            Tudo o que você precisa saber.
          </h2>
          <div className="space-y-3">
            {service.faq.map((f) => (
              <details key={f.q} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-sm font-bold text-black list-none">
                  {f.q}
                  <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Relacionados */}
      {related.length > 0 && (
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-black text-black mb-8">Explore também</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {related.map((r) => {
                const RIcon = ICON_MAP[r.icon];
                return (
                  <Link
                    key={r.slug}
                    href={`/servicos/${r.slug}`}
                    className="group flex items-center gap-4 bg-gray-50 hover:bg-black hover:text-white rounded-2xl p-5 transition-colors"
                  >
                    <div className="w-11 h-11 rounded-xl bg-white border border-gray-100 group-hover:bg-white/10 group-hover:border-white/20 flex items-center justify-center transition-colors">
                      <RIcon className="w-5 h-5 text-[#D52B1E] group-hover:text-white transition-colors" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-black">{r.brand}</p>
                      <p className="text-xs text-gray-500 group-hover:text-white/60 transition-colors">{r.tagline}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
