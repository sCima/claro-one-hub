'use client';

/* ─────────────────────────────────────────────────────────────────────────────
 * One Hub · lógica compartilhada de um canal de conversa com a Clara.
 *
 * Reúne: montagem do contexto do cliente, abertura/recuperação da sessão
 * (§4 — mesma sessão em qualquer canal), saudação/retomada e o turno de
 * conversa (NLU → resposta → contexto → métrica → handover).
 * Usada pelo canal WhatsApp e pelo canal App.
 * ───────────────────────────────────────────────────────────────────────────── */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useClaroContext } from '../context/ClaroContext';
import { claroApi } from '../services/claroApi';
import { detectIntent, intentLabel } from '../services/claraNlu';
import { buildReply, resumeLine, type ClaraContext as Ctx } from '../services/claraReply';
import { type Canal } from '../services/session';
import { mockUser } from '../data/mockData';
import type { Service, Invoice, ClubeData } from '../data/mockData';

interface Options {
  enabled?: boolean;                 // só inicia a sessão quando true
  greeting?: (name: string) => string;
}

export function useClaraChannel(canal: Canal, opts: Options = {}) {
  const { enabled = true, greeting } = opts;
  const {
    session, activeUser, user, services, invoices, clube,
    startSession, appendSessionMessage, updateSessionContext,
    requestHandover, logClaraInteraction, activeIncidents,
  } = useClaroContext();

  const [typing, setTyping] = useState(false);
  const [ready, setReady] = useState(false);
  const [localData, setLocalData] = useState<{ services: Service[]; invoices: Invoice[]; clube: ClubeData | null }>({
    services: [], invoices: [], clube: null,
  });
  const startedRef = useRef(false);
  const greetedRef = useRef(false);

  /* dados do cliente — usa o contexto; se vazio (chegou direto pelo canal), busca */
  useEffect(() => {
    if (services.length) return;
    let alive = true;
    Promise.all([claroApi.getServices(), claroApi.getInvoices(), claroApi.getClube()])
      .then(([s, i, c]) => { if (alive) setLocalData({ services: s, invoices: i, clube: c as ClubeData }); })
      .catch(() => {});
    return () => { alive = false; };
  }, [services.length]);

  const name = (activeUser ?? user)?.name ?? mockUser.name;
  const incidentNote = useMemo(() => {
    const inc = activeIncidents.find((i) => i.servicos.includes('internet'));
    return inc
      ? `Detectei um incidente técnico ativo na sua região (${inc.regiao}): ${inc.titulo}. ${inc.previsao}. Protocolo ${inc.id} — a equipe já está atuando.`
      : null;
  }, [activeIncidents]);

  const ctx = useMemo<Ctx>(() => {
    const d = services.length ? { services, invoices, clube } : localData;
    return { name: name.split(' ')[0], services: d.services, invoices: d.invoices, clube: d.clube, incidentNote };
  }, [name, services, invoices, clube, localData, incidentNote]);

  /* abre/recupera a sessão para este canal */
  useEffect(() => {
    if (!enabled || startedRef.current) return;
    startedRef.current = true;
    startSession(canal).catch(() => {}).finally(() => setReady(true));
  }, [enabled, canal, startSession]);

  /* saudação / retomada de contexto */
  useEffect(() => {
    if (!ready || greetedRef.current || !session) return;
    greetedRef.current = true;
    const hasHistory = session.historico.length > 0;
    const text = hasHistory
      ? resumeLine(ctx.name, session.contextoAtual.lastIntent, session.canalOrigem)
      : (incidentNote
        ? `Oi, ${ctx.name}! Antes de mais nada: ${incidentNote} Posso ajudar em mais alguma coisa?`
        : (greeting?.(ctx.name) ?? `Oi, ${ctx.name}! Aqui é a Clara. Como posso te ajudar?`));
    appendSessionMessage({ role: 'clara', text, canal });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, session, ctx.name]);

  const send = async (raw: string) => {
    const content = raw.trim();
    if (!content || !session) return;
    appendSessionMessage({ role: 'user', text: content, canal });
    setTyping(true);

    const { intent, entities, resolvedAuto } = await detectIntent(content, session.sessionId);
    const delay = 500 + Math.min(content.length * 20, 1000);
    setTimeout(() => {
      const reply = buildReply(intent, ctx);
      appendSessionMessage({ role: 'clara', text: reply, canal });
      updateSessionContext({ lastIntent: intent, entities, summary: `${intentLabel(intent)} (via ${canal})` });
      logClaraInteraction(intent, resolvedAuto);
      setTyping(false);

      if (intent === 'solicitar_atendente' || intent === 'fora_de_escopo') {
        const hist = (session.historico ?? [])
          .filter((m) => m.role === 'user' || m.role === 'clara')
          .map((m) => ({ role: m.role as 'user' | 'clara', text: m.text }));
        hist.push({ role: 'clara', text: reply });
        requestHandover({
          reason: intent === 'solicitar_atendente'
            ? `Cliente solicitou atendente humano (${canal})`
            : `Intent fora de escopo no canal ${canal}: "${content}"`,
          canal,
          history: hist,
        });
        setTimeout(() => {
          appendSessionMessage({
            role: 'clara', canal,
            text: 'Encaminhei você para um atendente humano com todo o histórico — inclusive o que você já falou nos outros canais. É só aguardar aqui. 🤝',
          });
        }, 700);
      }
    }, delay);
  };

  return {
    session,
    ctx,
    history: session?.historico ?? [],
    typing,
    ready,
    send,
  };
}
