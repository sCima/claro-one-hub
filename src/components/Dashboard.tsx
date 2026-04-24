'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HubSidebar, type SectionId } from './hub/HubSidebar';
import { HubTopBar } from './hub/HubTopBar';
import { HeroBill } from './hub/widgets/HeroBill';
import { ServicesPanel } from './hub/widgets/ServicesPanel';
import { UsageInsights } from './hub/widgets/UsageInsights';
import { ClubeWidget } from './hub/widgets/ClubeWidget';
import { ActivityFeed } from './hub/widgets/ActivityFeed';
import { Recommendations } from './hub/widgets/Recommendations';
import { QuickActions } from './hub/widgets/QuickActions';
import { InvoicesTable } from './hub/widgets/InvoicesTable';
import { SkeletonCard } from './ui/SkeletonCard';
import { SupportHub } from './ui/SupportHub';
import { useClaroData } from '../hooks/useClaroData';
import { ArrowRight } from 'lucide-react';

const pageVar = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [active, setActive] = useState<SectionId>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const {
    user, services, invoices, dataHistory, supportChannels,
    clube, activity, recommendations,
    loading, pendingInvoice, totalMonthlyAmount,
  } = useClaroData();

  return (
    <div className="min-h-screen bg-[#FAFAFA]" style={{ fontFamily: 'Arial, sans-serif' }}>
      <HubSidebar active={active} onChange={setActive} />

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileNavOpen(false)}
            className="fixed inset-0 bg-black/40 z-50 lg:hidden"
          >
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute left-0 top-0 bottom-0 w-72"
            >
              <HubSidebar active={active} onChange={(id) => { setActive(id); setMobileNavOpen(false); }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <HubTopBar onLogout={onLogout} onOpenMobileNav={() => setMobileNavOpen(true)} />

        <main className="px-6 lg:px-10 py-8 lg:py-10 max-w-[1400px]">
          <AnimatePresence mode="wait">
            {active === 'overview' && (
              <motion.div key="overview" variants={pageVar} initial="initial" animate="animate" exit="exit">
                {/* Welcome */}
                <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-[#D52B1E] uppercase tracking-widest mb-2">
                      {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <h1 className="text-4xl lg:text-5xl font-black text-black tracking-tight leading-none">
                      {loading ? 'Carregando...' : <>Olá, <span className="text-[#D52B1E]">{user?.name.split(' ')[0]}</span>.</>}
                    </h1>
                    <p className="text-gray-500 text-sm mt-3 max-w-md">
                      Você economiza <b className="text-black">R$ 269,80/mês</b> no seu combo Multi.
                      Veja tudo o que está acontecendo na sua conta.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-3">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mensalidade total</p>
                      <p className="text-lg font-black text-black tabular-nums">
                        R$ {loading ? '—' : totalMonthlyAmount.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    <div className="w-px h-9 bg-gray-100 mx-2" />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Serviços</p>
                      <p className="text-lg font-black text-black tabular-nums">{services.length || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="mb-8">
                  <QuickActions />
                </div>

                {/* Hero bill */}
                <div className="mb-8">
                  {loading ? <SkeletonCard className="h-44" /> : <HeroBill invoice={pendingInvoice} totalServices={services.length} />}
                </div>

                {/* Main grid */}
                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                  <div className="lg:col-span-2 space-y-6">
                    {loading ? <SkeletonCard className="h-72" /> : <ServicesPanel services={services} />}
                    {loading ? <SkeletonCard className="h-72" /> : <UsageInsights data={dataHistory} />}
                  </div>
                  <div className="space-y-6">
                    {loading || !clube ? <SkeletonCard className="h-96" /> : <ClubeWidget clube={clube} />}
                    {loading ? <SkeletonCard className="h-72" /> : <ActivityFeed items={activity} />}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="mb-8">
                  {loading ? <SkeletonCard className="h-44" /> : <Recommendations items={recommendations} />}
                </div>

                {/* Support */}
                {!loading && (
                  <div className="bg-white border border-gray-100 rounded-3xl p-7">
                    <header className="flex items-end justify-between mb-5">
                      <div>
                        <p className="text-[10px] font-bold text-[#D52B1E] uppercase tracking-widest mb-1">Atendimento 24h</p>
                        <h2 className="text-2xl font-black text-black tracking-tight">Como podemos ajudar?</h2>
                      </div>
                      <button className="text-xs font-bold text-gray-500 hover:text-black flex items-center gap-1">
                        Central de ajuda <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </header>
                    <SupportHub channels={supportChannels} />
                  </div>
                )}
              </motion.div>
            )}

            {active === 'invoices' && (
              <motion.div key="invoices" variants={pageVar} initial="initial" animate="animate" exit="exit">
                <h1 className="text-4xl font-black text-black tracking-tight mb-2">Faturas</h1>
                <p className="text-gray-500 text-sm mb-8">Acompanhe pagamentos, baixe segundas vias e veja o detalhamento completo.</p>
                {loading ? <SkeletonCard className="h-96" /> : <InvoicesTable invoices={invoices} />}
              </motion.div>
            )}

            {active === 'clube' && clube && (
              <motion.div key="clube" variants={pageVar} initial="initial" animate="animate" exit="exit" className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <ClubeWidget clube={clube} />
                </div>
                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-7">
                  <h2 className="text-2xl font-black text-black mb-1">Catálogo de recompensas</h2>
                  <p className="text-sm text-gray-500 mb-6">Use seus pontos em parceiros, viagens e aparelhos.</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {clube.rewards.map((r) => {
                      const reachable = clube.points >= r.cost;
                      return (
                        <div key={r.id} className={`border border-gray-100 rounded-2xl p-5 ${reachable ? 'hover:border-black' : 'opacity-50'} transition-colors`}>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{r.category}</p>
                          <p className="text-base font-black text-black mt-1 mb-4">{r.label}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-black text-yellow-700">{r.cost.toLocaleString('pt-BR')} pts</span>
                            <button disabled={!reachable} className="text-xs font-bold bg-black text-white rounded-full px-4 py-2 hover:bg-[#D52B1E] disabled:bg-gray-200 disabled:text-gray-400 transition-colors">
                              Resgatar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {!['overview', 'invoices', 'clube'].includes(active) && (
              <motion.div key={active} variants={pageVar} initial="initial" animate="animate" exit="exit"
                className="flex flex-col items-center justify-center py-32 text-center bg-white border border-gray-100 rounded-3xl">
                <div className="w-14 h-14 rounded-2xl bg-[#D52B1E]/10 flex items-center justify-center mb-4">
                  <span className="text-2xl">⚙️</span>
                </div>
                <h2 className="text-2xl font-black text-black mb-2">Seção em construção</h2>
                <p className="text-sm text-gray-500 max-w-sm">
                  Esta área está sendo desenvolvida e estará disponível em breve com gestão dedicada do serviço.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
