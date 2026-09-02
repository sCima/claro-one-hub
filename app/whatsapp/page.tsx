'use client';

import { WhatsAppChannel } from '@/src/components/whatsapp/WhatsAppChannel';

/* Canal WhatsApp (simulação) — Documento §2 · continuidade de contexto §4.
 * Rota independente do portal: o cliente é reconhecido pelo número cadastrado
 * e a mesma sessão é recuperada de qualquer canal. */
export default function WhatsAppPage() {
  return <WhatsAppChannel />;
}
