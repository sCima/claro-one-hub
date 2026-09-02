/* ─────────────────────────────────────────────────────────────────────────────
 * One Hub · Incidentes técnicos e notificação proativa (RF006)
 *
 * A equipe técnica registra um incidente no One Hub Admin; o backend notifica
 * automaticamente os clientes afetados (banner na Visão Geral + notificação).
 *
 * Modo mock → incidentes em localStorage (visíveis para admin e cliente no
 *             mesmo navegador, o que já demonstra o fluxo ponta a ponta).
 * Modo api  → CRUD REST em /incidents.
 * ───────────────────────────────────────────────────────────────────────────── */

import { backendConfig, isApiMode } from '../config/backend';
import { mockIncidents, type Incident, type IncidentServico, type IncidentSeverity } from '../data/mockData';

export type { Incident, IncidentServico, IncidentSeverity };

export interface NewIncidentInput {
  titulo: string;
  descricao: string;
  regiao: string;
  servicos: IncidentServico[];
  severidade: IncidentSeverity;
  previsao: string;
  abertoPor: string;
}

const KEY = backendConfig.incidents.localStorageKey;

export function makeIncident(input: NewIncidentInput): Incident {
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return {
    id: `INC-${rnd}`,
    status: 'ativo',
    criadoEm: Date.now(),
    ...input,
  };
}

function readLocal(): Incident[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Incident[]) : null;
  } catch {
    return null;
  }
}

function writeLocal(list: Incident[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* quota / modo privado */
  }
}

/** Lista todos os incidentes (ativos + resolvidos). */
export async function loadIncidents(): Promise<Incident[]> {
  if (isApiMode && backendConfig.incidents.endpoint) {
    const res = await fetch(`${backendConfig.incidents.endpoint}/incidents`);
    if (!res.ok) throw new Error(`incidents GET ${res.status}`);
    return (await res.json()) as Incident[];
  }
  return readLocal() ?? mockIncidents;
}

/** Persiste a lista completa (upsert em lote). */
export async function saveIncidents(list: Incident[]): Promise<Incident[]> {
  if (isApiMode && backendConfig.incidents.endpoint) {
    const res = await fetch(`${backendConfig.incidents.endpoint}/incidents`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(list),
    });
    if (!res.ok) throw new Error(`incidents PUT ${res.status}`);
    return (await res.json()) as Incident[];
  }
  writeLocal(list);
  return list;
}

/** Um serviço do cliente é afetado por algum incidente ativo? */
export function incidentAffects(list: Incident[], servico: IncidentServico): Incident | undefined {
  return list.find((i) => i.status === 'ativo' && i.servicos.includes(servico));
}
