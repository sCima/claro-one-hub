'use client';

/* ─────────────────────────────────────────────────────────────────────────────
 * One Hub · Acessibilidade assistida — VLibras (Documento §9 · RF007)
 *
 * Integra o plugin oficial vlibras.gov.br para tradução de conteúdo textual em
 * Língua Brasileira de Sinais. A certificação completa da integração está
 * listada como próximo passo (§10); aqui fica a integração arquitetada e ativa.
 * ───────────────────────────────────────────────────────────────────────────── */

import Script from 'next/script';
import { useRef } from 'react';

const MARKUP =
  '<div vw class="enabled">' +
  '<div vw-access-button class="active"></div>' +
  '<div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>' +
  '</div>';

type VLibrasGlobal = { VLibras?: { Widget: new (url: string) => unknown } };

export function VLibrasWidget() {
  const started = useRef(false);

  const start = () => {
    if (started.current) return;
    const g = window as unknown as VLibrasGlobal;
    if (g.VLibras) {
      new g.VLibras.Widget('https://vlibras.gov.br/app');
      started.current = true;
    }
  };

  return (
    <>
      <div
        aria-hidden="true"
        ref={(el) => {
          if (el && el.childElementCount === 0) el.innerHTML = MARKUP;
        }}
      />
      <Script
        src="https://vlibras.gov.br/app/vlibras-plugin.js"
        strategy="afterInteractive"
        onLoad={start}
        onReady={start}
      />
    </>
  );
}
