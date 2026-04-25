'use client';

import { useState, useEffect, useLayoutEffect } from 'react';
import { ArrowRight } from 'lucide-react';

const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(' ');

// SSR-safe layout effect — falls back to useEffect on the server
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface Props {
  open: boolean;
  onClose: () => void;
}

type Box = { top: number; left: number; width: number; height: number } | null;

const steps = [
  { sel: '[data-tour="bill"]',     title: 'Sua fatura, em destaque',   body: 'O cartão escuro mostra o valor em aberto e quanto falta para vencer. Pague em 1 toque por Pix.' },
  { sel: '[data-tour="quick"]',    title: 'Atalhos de 1 clique',        body: 'Recarga, fatura, novo serviço, suporte. As 4 ações mais usadas, sempre acessíveis.' },
  { sel: '[data-tour="services"]', title: 'Todos os seus serviços',     body: 'Cada cartão mostra plano, consumo e valor mensal. Toque para abrir os detalhes do serviço.' },
  { sel: '[data-tour="usage"]',    title: 'Insights de consumo',        body: 'Acompanhe celular e internet em tempo real. Alterne com os botões no topo do gráfico.' },
  { sel: '[data-tour="clube"]',    title: 'Claro Clube integrado',      body: 'Veja seu saldo de pontos e resgate prêmios sem sair do hub.' },
  { sel: '[data-tour="switcher"]', title: 'Multiconta',                 body: 'Gerencie a conta da família, dos pais ou da empresa pelo mesmo login.' },
  { sel: '[data-tour="search"]',   title: 'Busca global',               body: 'Procure faturas, serviços, contatos do suporte ou recompensas. Use ⌘K para abrir.' },
];

export function TourOverlay({ open, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [box, setBox] = useState<Box>(null);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  useIsomorphicLayoutEffect(() => {
    if (!open) return;

    let rafId: number;

    const measure = () => {
      const el = document.querySelector(steps[step].sel);
      if (!el) { setBox(null); return; }

      // Sticky topbar elements are always visible — measure immediately.
      // Main-content elements need a scroll first so their final position is known.
      const isTopbarEl = steps[step].sel.includes('switcher') || steps[step].sel.includes('search');

      if (!isTopbarEl) {
        (el as HTMLElement).scrollIntoView?.({ block: 'center', behavior: 'instant' });
      }

      // Measure after the browser has applied the scroll (next paint).
      rafId = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const pad = 10;
        setBox({
          top:    r.top    - pad,
          left:   r.left   - pad,
          width:  r.width  + pad * 2,
          height: r.height + pad * 2,
        });
      });
    };

    measure();
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      cancelAnimationFrame(rafId);
    };
  }, [open, step]);

  if (!open) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let tipStyle: React.CSSProperties = {};
  if (box) {
    const tipW = 320, tipH = 200, gap = 14;
    let top = box.top + box.height + gap;
    let left = box.left + box.width / 2 - tipW / 2;
    if (top + tipH > vh - 20) top = box.top - tipH - gap;
    left = Math.max(16, Math.min(left, vw - tipW - 16));
    tipStyle = { top, left, width: tipW };
  }

  return (
    <div className="fixed inset-0 z-[80]">
      <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {box && (
              <rect
                x={box.left} y={box.top}
                width={box.width} height={box.height}
                rx="20" fill="black"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(20,18,15,0.7)" mask="url(#tour-mask)" />
        {box && (
          <rect
            x={box.left} y={box.top}
            width={box.width} height={box.height}
            rx="20" fill="none"
            stroke="#D52B1E" strokeWidth="2" strokeDasharray="6 6"
          />
        )}
      </svg>

      <div
        className="absolute bg-white dark:bg-warm-800 rounded-2xl shadow-2xl p-5 anim-in"
        style={tipStyle}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-claro mb-2">
          Passo {step + 1} de {steps.length}
        </p>
        <p className="text-lg font-black mb-2 leading-tight">{steps[step].title}</p>
        <p className="text-xs text-warm-600 dark:text-warm-300 leading-relaxed mb-5">{steps[step].body}</p>
        <div className="flex items-center gap-1.5 mb-4">
          {steps.map((_, i) => (
            <span
              key={i}
              className={cx(
                'h-1 rounded-full transition-all',
                i === step ? 'w-6 bg-claro' : 'w-1.5 bg-warm-200 dark:bg-warm-600'
              )}
            />
          ))}
        </div>
        <div className="flex justify-between gap-2">
          <button
            onClick={onClose}
            className="text-xs font-bold text-warm-500 hover:text-warm-900 dark:hover:text-warm-50 px-3 py-2"
          >
            Pular tour
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="text-xs font-bold rounded-full bg-warm-100 dark:bg-warm-700 px-4 py-2"
              >
                Voltar
              </button>
            )}
            <button
              onClick={() => step === steps.length - 1 ? onClose() : setStep(step + 1)}
              className="text-xs font-bold rounded-full bg-warm-900 text-white dark:bg-warm-50 dark:text-warm-900 px-4 py-2 flex items-center gap-1"
            >
              {step === steps.length - 1 ? 'Concluir' : 'Próximo'} <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
