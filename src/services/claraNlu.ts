/* ─────────────────────────────────────────────────────────────────────────────
 * One Hub · NLU da Clara (Documento de Arquitetura §8 — Dialogflow)
 *
 * Modo mock  → classificação por regex local (claraIntents em mockData).
 * Modo api   → chama o proxy do backend que fala com o Dialogflow (pt-BR).
 *
 * A camada de apresentação só depende de detectIntent(); trocar de motor de NLU
 * não exige mudança na Clara.
 * ───────────────────────────────────────────────────────────────────────────── */

import { backendConfig } from '../config/backend';
import { claraIntents, type ClaraIntentId } from '../data/mockData';

export interface NluResult {
  intent: ClaraIntentId;
  /** confiança 0–1 (mock usa 1 / 0.4) */
  confidence: number;
  /** entidades extraídas (ex.: { mes: 'abril' }) */
  entities: Record<string, string>;
  /** de onde veio a classificação */
  source: 'regex' | 'dialogflow';
  /** a Clara resolve sozinha esse intent? (senão → handover) */
  resolvedAuto: boolean;
}

function resolvedAutoFor(intent: ClaraIntentId): boolean {
  const it = claraIntents.find((i) => i.id === intent);
  return it?.resolvedAuto ?? false;
}

const MESES = [
  'janeiro', 'fevereiro', 'março', 'marco', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

function extractEntities(q: string): Record<string, string> {
  const entities: Record<string, string> = {};
  const mes = MESES.find((m) => q.includes(m));
  if (mes) entities.mes = mes;
  const servico = ['internet', 'fibra', 'tv', 'celular', 'telefone', 'fixo'].find((s) => q.includes(s));
  if (servico) entities.servico = servico;
  return entities;
}

/* ─── motor local (regex) ──────────────────────────────────────────────────── */
function detectIntentLocal(input: string): NluResult {
  const q = input.toLowerCase().trim();
  for (const it of claraIntents) {
    if (it.patterns.test(q)) {
      return { intent: it.id, confidence: 1, entities: extractEntities(q), source: 'regex', resolvedAuto: it.resolvedAuto };
    }
  }
  return { intent: 'fora_de_escopo', confidence: 0.4, entities: extractEntities(q), source: 'regex', resolvedAuto: false };
}

/* ─── motor remoto (Dialogflow via proxy) ──────────────────────────────────── */
async function detectIntentRemote(input: string, sessionId: string): Promise<NluResult> {
  const res = await fetch(backendConfig.dialogflow.detectIntentUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: input,
      sessionId,
      languageCode: backendConfig.dialogflow.languageCode,
    }),
  });
  if (!res.ok) throw new Error(`detect-intent ${res.status}`);
  const data = (await res.json()) as {
    intent: string;
    confidence?: number;
    parameters?: Record<string, string>;
  };
  const intent = (data.intent as ClaraIntentId) || 'fora_de_escopo';
  return {
    intent,
    confidence: data.confidence ?? 0.5,
    entities: data.parameters ?? {},
    source: 'dialogflow',
    resolvedAuto: resolvedAutoFor(intent),
  };
}

/**
 * Classifica a intenção da mensagem do cliente.
 * Usa Dialogflow quando habilitado; cai para o regex local em qualquer falha.
 */
export async function detectIntent(input: string, sessionId: string): Promise<NluResult> {
  if (backendConfig.dialogflow.enabled && backendConfig.dialogflow.detectIntentUrl) {
    try {
      return await detectIntentRemote(input, sessionId);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[claraNlu] Dialogflow indisponível, usando regex local:', err);
      }
    }
  }
  return detectIntentLocal(input);
}

/** Rótulo humano de um intent — usado no resumo de contexto entre canais. */
export function intentLabel(intent: string): string {
  const map: Record<string, string> = {
    saudacao: 'saudação',
    consultar_fatura: 'consulta de fatura',
    segunda_via_fatura: '2ª via de fatura',
    consultar_plano: 'consulta de plano',
    alterar_plano: 'alteração de plano',
    status_servico: 'status de serviço',
    solicitar_atendente: 'transferência para atendente',
    despedida: 'despedida',
    fora_de_escopo: 'assunto fora de escopo',
  };
  return map[intent] || intent;
}
