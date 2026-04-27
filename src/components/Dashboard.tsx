'use client';

import { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { HubSidebar, type SectionId } from './hub/HubSidebar';
import { HubTopBar } from './hub/HubTopBar';
import { NetworkStatusBanner } from './site/NetworkStatusBanner';
import { HeroBill } from './hub/widgets/HeroBill';
import { QuickActions } from './hub/widgets/QuickActions';
import { ServicesPanel } from './hub/widgets/ServicesPanel';
import { UsageInsights } from './hub/widgets/UsageInsights';
import { ClubeWidget } from './hub/widgets/ClubeWidget';
import { ActivityFeed } from './hub/widgets/ActivityFeed';
import { Recommendations } from './hub/widgets/Recommendations';
import { UpgradeCTA } from './hub/widgets/UpgradeCTA';
import { InvoicesPage } from './hub/pages/InvoicesPage';
import { ServiceDetailPage } from './hub/pages/ServiceDetailPage';
import { ClubePage } from './hub/pages/ClubePage';
import { SupportPage } from './hub/pages/SupportPage';
import { SettingsPage } from './hub/pages/SettingsPage';
import { PayModal } from './hub/overlays/PayModal';
import { RedeemAnimation } from './hub/overlays/RedeemAnimation';
import { TourOverlay } from './hub/overlays/TourOverlay';
import { BillDetailsModal } from './hub/overlays/BillDetailsModal';
import { AddPlanModal } from './hub/overlays/AddPlanModal';
import { ClaraChat, ClaraFAB } from './hub/overlays/ClaraChat';
import { useClaroContext } from '../context/ClaroContext';
import { useClaroData } from '../hooks/useClaroData';
import type { Invoice, ClubeReward, ServiceDetailKey, AvailablePlan } from '../data/mockData';

// ─── Toast system ────────────────────────────────────────────────────────────
type Toast = { id: string; msg: string; tone: 'success' | 'warn' | 'info' };

function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((msg: string, tone: Toast['tone'] = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((ts) => [...ts, { id, msg, tone }]);
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 3800);
  }, []);
  const dismiss = useCallback(
    (id: string) => setToasts((ts) => ts.filter((t) => t.id !== id)),
    []
  );
  return { toasts, push, dismiss };
}

function ToastHost({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="anim-in pointer-events-auto bg-warm-900 text-warm-50 dark:bg-warm-50 dark:text-warm-900 rounded-2xl shadow-2xl px-5 py-3.5 text-sm flex items-center gap-3 min-w-[260px] max-w-[380px]"
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              t.tone === 'success'
                ? 'bg-green-400'
                : t.tone === 'warn'
                ? 'bg-amber-400'
                : 'bg-claro'
            }`}
          />
          <span className="flex-1">{t.msg}</span>
          <button
            onClick={() => onDismiss(t.id)}
            aria-label="Fechar"
            className="opacity-60 hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

const SERVICE_DETAIL_KEYS: SectionId[] = ['mobile', 'internet', 'tv', 'voice'];

export function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [active, setActive]         = useState<SectionId>('overview');
  const [mobileNav, setMobileNav]   = useState(false);
  const [bannerOpen, setBannerOpen] = useState(true);
  const [payInv, setPayInv]         = useState<Invoice | null>(null);
  const [redeem, setRedeem]         = useState<ClubeReward | null>(null);
  const [tourOpen, setTourOpen]     = useState(false);
  const [detailsInv, setDetailsInv] = useState<Invoice | null>(null);
  const [addPlanOpen, setAddPlanOpen] = useState<{ preselect?: string | null } | null>(null);
  const [claraOpen, setClaraOpen]   = useState(false);
  const [claraPrefill, setClaraPrefill] = useState<string | null>(null);

  const { toasts, push, dismiss } = useToasts();

  const { addPlanToCombo, activeUser } = useClaroContext();

  const {
    user, services, invoices, dataHistory, clube, activity, recommendations, loading,
    confirmPayment, confirmRedeem,
  } = useClaroData();

  const displayUser = activeUser ?? user;
  const pendingInvoice = invoices.find((i) => i.status === 'pending') ?? invoices[0] ?? null;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleLogout = () => {
    onLogout(); // parent (HubPage) handles logout() + navigation
  };

  const handleOpenTour = () => {
    setActive('overview');  // always start tour on the overview page
    setMobileNav(false);
    // give React one tick to render the overview widgets before measuring DOM
    setTimeout(() => setTourOpen(true), 160);
  };

  const handlePay = (inv?: Invoice) => {
    setPayInv(inv ?? pendingInvoice);
  };

  const handlePayConfirm = (inv: Invoice) => {
    confirmPayment(inv);
    push('Pagamento confirmado · pontos creditados', 'success');
  };

  const handleRedeem = (reward: ClubeReward) => {
    if (!clube || clube.points < reward.cost) return;
    confirmRedeem(reward);
    setRedeem(reward);
  };

  const handleNav = (page: SectionId) => {
    setActive(page);
    setMobileNav(false);
  };

  const handleShowBillDetails = (inv?: Invoice) => {
    setDetailsInv(inv ?? pendingInvoice);
  };

  const handleAddPlan = (preselect?: string | null) => {
    setAddPlanOpen({ preselect });
  };

  const handleAddPlanConfirm = (plan: AvailablePlan) => {
    addPlanToCombo(plan);
    push(`${plan.brand} adicionado ao combo`, 'success');
  };

  const handleAskClara = (q: string) => {
    setClaraPrefill(q);
    setClaraOpen(true);
  };
  // ──────────────────────────────────────────────────────────────────────────

  // ── Page content ──────────────────────────────────────────────────────────
  let mainContent: React.ReactNode;

  if (active === 'overview') {
    mainContent = (
      <div className="space-y-6">
        {pendingInvoice && (
          <HeroBill
            invoice={pendingInvoice}
            totalServices={services.length}
            onPay={() => handlePay()}
            onShowDetails={() => handleShowBillDetails(pendingInvoice)}
          />
        )}
        <QuickActions onNav={handleNav} onPay={() => handlePay()} />
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <ServicesPanel services={services} onOpen={handleNav} onAddPlan={() => handleAddPlan()} />
            <UsageInsights data={dataHistory} />
          </div>
          <div className="lg:col-span-5 space-y-6">
            {clube && <ClubeWidget clube={clube} onRedeem={handleRedeem} />}
            <ActivityFeed items={activity.slice(0, 5)} />
          </div>
        </div>
        <UpgradeCTA />
        <Recommendations items={recommendations} onAdd={(slug) => handleAddPlan(slug)} />
      </div>
    );
  } else if (active === 'invoices') {
    mainContent = <InvoicesPage invoices={invoices} onPay={handlePay} onShowDetails={handleShowBillDetails} />;
  } else if (active === 'clube' && clube) {
    mainContent = <ClubePage clube={clube} onRedeem={handleRedeem} />;
  } else if (active === 'support') {
    mainContent = <SupportPage />;
  } else if (active === 'settings') {
    mainContent = <SettingsPage />;
  } else if (SERVICE_DETAIL_KEYS.includes(active)) {
    mainContent = (
      <ServiceDetailPage
        slug={active as ServiceDetailKey}
        onBack={() => setActive('overview')}
      />
    );
  } else {
    mainContent = (
      <div className="py-24 text-center">
        <p className="text-warm-500">Página em construção.</p>
      </div>
    );
  }
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-warm-900 text-warm-900 dark:text-warm-50">
      {/* ── Desktop sidebar ── */}
      <HubSidebar active={active} onChange={handleNav} onOpenTour={handleOpenTour} />

      {/* ── Mobile drawer ── */}
      {mobileNav && (
        <>
          <div
            className="fixed inset-0 z-40 bg-warm-900/60"
            onClick={() => setMobileNav(false)}
          />
          <HubSidebar
            active={active}
            onChange={handleNav}
            onOpenTour={handleOpenTour}
            mobile
            onClose={() => setMobileNav(false)}
          />
        </>
      )}

      {/* ── Main area ── */}
      <div className="lg:pl-64">
        <HubTopBar
          onLogout={handleLogout}
          onOpenMobileNav={() => setMobileNav(true)}
          onNavigate={handleNav}
          onAskClara={handleAskClara}
        />

        {bannerOpen && (
          <NetworkStatusBanner onDismiss={() => setBannerOpen(false)} />
        )}

        <main className="px-6 lg:px-10 py-8 lg:py-10 max-w-[1400px] mx-auto">
          {/* Page greeting */}
          <div className="mb-6">
            <p className="text-[10px] font-bold text-warm-400 uppercase tracking-[0.22em] mb-1">
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
            {active === 'overview' && !loading && displayUser && (
              <h1 className="text-3xl lg:text-4xl font-black tracking-tight">
                Olá, {displayUser.name.split(' ')[0]}
              </h1>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-warm-200 border-t-claro animate-spin" />
              <p className="text-sm text-warm-400">Carregando sua conta...</p>
            </div>
          ) : (
            mainContent
          )}
        </main>
      </div>

      {/* ── Overlays ── */}
      <PayModal
        open={!!payInv}
        invoice={payInv}
        onClose={() => setPayInv(null)}
        onConfirm={handlePayConfirm}
      />
      <BillDetailsModal
        open={!!detailsInv}
        invoice={detailsInv}
        services={services}
        onClose={() => setDetailsInv(null)}
        onPay={handlePay}
      />
      <AddPlanModal
        open={!!addPlanOpen}
        preselectId={addPlanOpen?.preselect ?? null}
        onClose={() => setAddPlanOpen(null)}
        onConfirm={handleAddPlanConfirm}
      />
      {redeem && (
        <RedeemAnimation reward={redeem} onDone={() => setRedeem(null)} />
      )}
      <TourOverlay open={tourOpen} onClose={() => setTourOpen(false)} />

      {/* ── Clara IA ── */}
      <ClaraFAB hidden={claraOpen || tourOpen} onClick={() => setClaraOpen(true)} />
      <ClaraChat
        open={claraOpen}
        onClose={() => setClaraOpen(false)}
        userName={displayUser?.name}
        services={services}
        invoices={invoices}
        clube={clube}
        prefill={claraPrefill}
        onPrefillConsumed={() => setClaraPrefill(null)}
      />

      {/* ── Toasts ── */}
      <ToastHost toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
