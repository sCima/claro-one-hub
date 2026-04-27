'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, Check, Smartphone, Wifi, Tv, Phone,
  Gift, PlayCircle, Antenna, Tv2, MonitorPlay, Radio,
  Sparkles, Plus,
} from 'lucide-react';
import { servicesCatalog } from '../data/servicesCatalog';
import { SiteHeader } from './site/SiteHeader';
import { SiteFooter } from './site/SiteFooter';
import { OfferStrip } from './site/OfferStrip';

const ICON_MAP = {
  Smartphone, Wifi, Tv, Phone, PlayCircle, Radio, Antenna, Gift, Tv2, MonitorPlay,
};

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export function LandingPage({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
      <SiteHeader onAccessHub={onLogin} />
      <OfferStrip />

      {/* ============ HERO · combo multi ============ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 lg:pt-24 lg:pb-32 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-[44px] sm:text-6xl lg:text-7xl font-bold text-black leading-[1.02] tracking-tight mb-6"
            >
              Internet, TV e Celular
              <span className="block text-[#D52B1E]">num plano só.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="text-gray-600 text-lg leading-relaxed max-w-lg mb-8"
            >
              1 Giga de fibra óptica, 180 canais com Globoplay e linha móvel de 50 GB.
              Uma fatura, três serviços, tudo Claro.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-end gap-4 mb-8"
            >
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">De R$ 349,70 por</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-gray-700 mt-2">R$</span>
                  <span className="text-6xl lg:text-7xl font-black text-black leading-none">199</span>
                  <span className="text-2xl font-black text-black">,90</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">/mês · nos 12 primeiros meses</p>
              </div>
              <div className="w-px h-20 bg-gray-200" />
              <ul className="text-xs text-gray-600 space-y-1.5 pb-2">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#D52B1E]" strokeWidth={3} /> Instalação grátis</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#D52B1E]" strokeWidth={3} /> Wi-Fi 6 incluso</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#D52B1E]" strokeWidth={3} /> Fidelidade 12 meses</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <button className="group flex items-center justify-center gap-2 bg-[#D52B1E] text-white font-bold rounded-full pl-7 pr-3 py-4 hover:bg-red-700 transition-colors">
                Contratar agora
                <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>
              <button
                onClick={onLogin}
                className="flex items-center justify-center gap-2 text-black border-2 border-black font-bold rounded-full px-7 py-4 hover:bg-black hover:text-white transition-colors"
              >
                Já sou cliente · Acessar Hub
              </button>
            </motion.div>

            <div className="flex items-center gap-6 mt-10 text-xs text-gray-500">
              <div><span className="text-black font-bold text-base">4.8/5</span> · avaliação em App Stores</div>
              <div className="w-px h-8 bg-gray-200" />
              <div><span className="text-black font-bold text-base">720</span> cidades com 5G+</div>
              <div className="w-px h-8 bg-gray-200" />
              <div><span className="text-black font-bold text-base">64M</span> clientes</div>
            </div>
          </div>

          {/* Visual lateral — card stack */}
          <div className="lg:col-span-6 relative h-[460px] lg:h-[560px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: -4 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="absolute top-8 left-8 w-64 h-72 lg:w-80 lg:h-96 bg-gradient-to-br from-[#D52B1E] to-[#9A1F16] rounded-3xl shadow-2xl p-7 text-white flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <Image src="/logo-texto-branco.png" alt="" width={60} height={24} className="h-6 w-auto" />
                <Wifi className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Claro Internet</p>
                <p className="text-4xl lg:text-5xl font-black leading-none">1 Giga</p>
                <p className="text-sm mt-2 opacity-90">Fibra óptica · Wi-Fi 6</p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-xs opacity-70">Download até</span>
                <span className="text-2xl font-black">1.000 Mbps</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92, rotate: 6 }}
              animate={{ opacity: 1, scale: 1, rotate: 6 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="absolute top-0 right-4 w-56 h-64 lg:w-72 lg:h-80 bg-black rounded-3xl shadow-2xl p-6 text-white flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-[#D52B1E]/30 blur-3xl" />
              <div className="relative flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest opacity-60">Claro TV+</span>
                <Tv2 className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="relative">
                <div className="flex gap-1.5 mb-3">
                  {['NFLX', 'HBO', 'P+', 'GPL'].map((s) => (
                    <span key={s} className="text-[9px] font-black bg-white/15 px-2 py-1 rounded">{s}</span>
                  ))}
                </div>
                <p className="text-3xl font-black leading-tight">180 canais<br />+ streamings</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:bottom-6 lg:right-24 w-60 lg:w-64 bg-white border border-gray-100 rounded-3xl shadow-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#D52B1E]/10 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-[#D52B1E]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Plano Controle</p>
                    <p className="text-xs font-bold">Claro Celular · 50GB</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-green-100 text-green-700 rounded-full px-2 py-0.5">5G+</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full mb-1">
                <div className="h-full w-[34%] bg-[#D52B1E] rounded-full" />
              </div>
              <p className="text-[10px] text-gray-500">17 GB usados de 50 GB</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ SERVIÇOS · grid editorial ============ */}
      <section id="servicos" className="py-24 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-16 mb-16">
            <div className="lg:col-span-2">
              <p className="text-xs font-bold text-[#D52B1E] uppercase tracking-widest mb-4">Nossos Serviços</p>
              <h2 className="text-4xl lg:text-5xl font-black text-black leading-tight tracking-tight">
                12 produtos.<br />Uma marca. <span className="text-gray-400">Infinitas combinações.</span>
              </h2>
            </div>
            <p className="text-gray-600 text-base leading-relaxed self-end">
              Do pré-pago ao PABX em nuvem, da TV gratuita via parabólica ao streaming premium. Cada serviço foi pensado para funcionar sozinho — e melhor ainda quando combinado.
            </p>
          </div>

          <motion.div
            variants={staggerParent}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {servicesCatalog.map((s, i) => {
              const Icon = ICON_MAP[s.icon];
              const featured = i === 0 || i === 3 || i === 7;
              return (
                <motion.div key={s.slug} variants={fadeUp} className={featured ? 'lg:col-span-2' : ''}>
                  <Link
                    href={`/servicos/${s.slug}`}
                    className={`group relative block h-full overflow-hidden rounded-3xl border transition-all
                      ${featured
                        ? 'bg-black text-white border-black hover:border-[#D52B1E] min-h-[260px]'
                        : 'bg-gray-50 text-black border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-sm min-h-[220px]'
                      }`}
                  >
                    <div className="p-7 flex flex-col justify-between h-full">
                      <div className="flex items-start justify-between">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center
                          ${featured ? 'bg-white/10' : 'bg-white border border-gray-100'}`}
                        >
                          <Icon className={`w-5 h-5 ${featured ? 'text-white' : 'text-[#D52B1E]'}`} strokeWidth={1.5} />
                        </div>
                        <span className={`text-[10px] uppercase tracking-widest font-bold
                          ${featured ? 'text-white/50' : 'text-gray-400'}`}
                        >
                          {s.category}
                        </span>
                      </div>

                      <div>
                        <h3 className={`text-2xl font-black leading-tight mb-1 ${featured ? 'text-white' : 'text-black'}`}>
                          {s.brand}
                        </h3>
                        <p className={`text-sm leading-relaxed mb-4 ${featured ? 'text-white/70' : 'text-gray-500'}`}>
                          {s.tagline}
                        </p>
                        <div className={`flex items-center gap-2 text-xs font-bold
                          ${featured ? 'text-white' : 'text-[#D52B1E]'}`}
                        >
                          Conhecer {s.brand}
                          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                    {featured && (
                      <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-[#D52B1E]/30 blur-3xl pointer-events-none" />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ============ COMBOS · monte seu plano ============ */}
      <section id="combos" className="py-24 px-6 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-10 mb-14">
            <div className="lg:col-span-5">
              <p className="text-xs font-bold text-[#D52B1E] uppercase tracking-widest mb-4">Combos Multi</p>
              <h2 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight">
                Escolha 2, 3 ou 4. A conta cai.
              </h2>
            </div>
            <p className="lg:col-span-5 lg:col-start-8 text-white/70 text-base leading-relaxed self-end">
              Quanto mais serviços Claro você tem, mais desconto entra automaticamente na fatura. Sem burocracia, sem ligação.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            {[
              { n: '2 serviços', price: 139.9, from: 199.8, items: ['Internet 500 Mega', 'Celular Controle 50 GB'],                           d: '30%' },
              { n: '3 serviços', price: 199.9, from: 349.7, items: ['Internet 1 Giga', 'TV Família HD', 'Celular Controle 50 GB'],            d: '43%', featured: true },
              { n: '4 serviços', price: 249.9, from: 469.6, items: ['Internet 1 Giga', 'TV Mix HD', 'Celular Pós Max', 'Claro Fixo Ilimitado'], d: '47%' },
            ].map((c) => (
              <div
                key={c.n}
                className={`relative rounded-3xl p-8 border transition-colors
                  ${c.featured ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 hover:border-white/25'}`}
              >
                {c.featured && (
                  <span className="absolute -top-3 left-8 bg-[#D52B1E] text-white text-[10px] font-black tracking-widest uppercase rounded-full px-3 py-1">
                    Mais contratado
                  </span>
                )}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs uppercase tracking-widest font-bold opacity-60">{c.n}</span>
                  <span className="text-xs font-bold text-[#D52B1E]">-{c.d}</span>
                </div>
                <p className={`text-xs line-through mb-1 ${c.featured ? 'text-gray-400' : 'text-white/40'}`}>
                  R$ {c.from.toFixed(2).replace('.', ',')}
                </p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-sm font-bold">R$</span>
                  <span className="text-5xl font-black">{Math.floor(c.price)}</span>
                  <span className="text-xl font-black">,{(c.price % 1).toFixed(2).slice(2)}</span>
                  <span className={`text-xs ml-1 ${c.featured ? 'text-gray-500' : 'text-white/40'}`}>/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {c.items.map((it) => (
                    <li key={it} className="flex items-center gap-2 text-sm">
                      <Plus className={`w-4 h-4 ${c.featured ? 'text-[#D52B1E]' : 'text-white/50'}`} strokeWidth={2.5} />
                      {it}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full rounded-full font-bold py-3 text-sm transition-colors
                    ${c.featured ? 'bg-black text-white hover:bg-[#D52B1E]' : 'bg-white text-black hover:bg-[#D52B1E] hover:text-white'}`}
                >
                  Montar meu combo
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ APP + HUB ============ */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-bold text-[#D52B1E] uppercase tracking-widest mb-4">Claro One Hub</p>
            <h2 className="text-4xl lg:text-5xl font-black text-black leading-tight tracking-tight mb-6">
              Um painel. Todas as suas contas Claro.
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-lg">
              Acompanhe consumo em tempo real, pague faturas com 1 toque, contrate serviços avulsos e fale com o suporte — tudo sem sair do hub.
            </p>
            <ul className="space-y-4 mb-10">
              {[
                'Visão 360° do seu relacionamento com a Claro',
                'Gráfico animado de consumo semanal de dados',
                'Histórico de faturas com download em PDF',
                'Suporte em tempo real · chat, voz, WhatsApp',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#D52B1E] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </span>
                  <span className="text-sm text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={onLogin}
              className="group flex items-center gap-2 bg-black text-white font-bold rounded-full pl-7 pr-3 py-4 hover:bg-[#D52B1E] transition-colors"
            >
              Acessar meu Hub
              <span className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-gray-400">Bem-vindo</p>
                  <p className="text-sm font-bold text-black">Rodolfo Sanches</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#D52B1E]/10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#D52B1E]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Fatura</p>
                  <p className="text-xl font-black text-black mt-1">R$ 319,70</p>
                  <p className="text-[10px] text-[#D52B1E] font-bold">Vence em 5 dias</p>
                </div>
                <div className="bg-black text-white rounded-2xl p-4">
                  <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider">Dados</p>
                  <p className="text-xl font-black mt-1">17 GB</p>
                  <p className="text-[10px] text-white/60">de 50 GB</p>
                </div>
              </div>
              <div className="flex items-end gap-1.5 h-20 px-1">
                {[30, 55, 40, 70, 85, 55, 32].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.6 }}
                    className={`flex-1 rounded-t ${h > 70 ? 'bg-[#D52B1E]' : 'bg-gray-200'}`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-1">
                {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => <span key={i}>{d}</span>)}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ FAQ / Contato curto ============ */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-black text-black leading-tight tracking-tight mb-6">
            Pronto pra começar?
          </h2>
          <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto">
            Fale com um especialista, veja qual combo encaixa na sua casa, ou entre direto no One Hub se você já é cliente.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="bg-[#D52B1E] text-white font-bold rounded-full px-8 py-4 hover:bg-red-700 transition-colors">
              Falar com especialista
            </button>
            <button
              onClick={onLogin}
              className="border-2 border-black text-black font-bold rounded-full px-8 py-4 hover:bg-black hover:text-white transition-colors"
            >
              Entrar no One Hub
            </button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
