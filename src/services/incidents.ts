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

import { backendConfig, isApiMode, requireEndpoint } from '../config/backend';
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

function isIncidentList(value: unknown): value is Incident[] {
  return Array.isArray(value) && value.every((item: unknown) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
    const incident = item as Partial<Incident>;
    return typeof incident.id === 'string' && incident.id.length > 0 &&
      typeof incident.titulo === 'string' && typeof incident.descricao === 'string' &&
      typeof incident.regiao === 'string' && typeof incident.previsao === 'string' &&
      typeof incident.abertoPor === 'string' &&
      Array.isArray(incident.servicos) && incident.servicos.every((s) =>
        ['internet', 'tv', 'telefonia', 'movel'].includes(s)) &&
      ['critico', 'alto', 'moderado', 'informativo'].includes(incident.severidade ?? '') &&
      (incident.status === 'ativo' || incident.status === 'resolvido') &&
      Number.isSafeInteger(incident.criadoEm) && incident.criadoEm! >= 0 &&
      (incident.resolvidoEm === undefined || (Number.isSafeInteger(incident.resolvidoEm) && incident.resolvidoEm >= 0));
  });
}

function parseIncidents(value: unknown): Incident[] {
  if (!isIncidentList(value)) throw new Error('incidents retornou uma lista inválida');
  return value;
}

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
    const list: unknown = raw ? JSON.parse(raw) : null;
    return isIncidentList(list) ? list : null;
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
  if (isApiMode) {
    const endpoint = requireEndpoint(backendConfig.incidents.endpoint, 'incidents');
    const res = await fetch(`${endpoint}/incidents`);
    if (!res.ok) throw new Error(`incidents GET ${res.status}`);
    return parseIncidents(await res.json());
  }
  return readLocal() ?? mockIncidents.map((incident) => ({ ...incident, servicos: [...incident.servicos] }));
}

/** Persiste a lista completa (upsert em lote). */
export async function saveIncidents(list: Incident[]): Promise<Incident[]> {
  parseIncidents(list);
  if (isApiMode) {
    const endpoint = requireEndpoint(backendConfig.incidents.endpoint, 'incidents');
    const res = await fetch(`${endpoint}/incidents`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(list),
    });
    if (!res.ok) throw new Error(`incidents PUT ${res.status}`);
    return res.status === 204 ? list : parseIncidents(await res.json());
  }
  writeLocal(list);
  return list;
}

/** Um serviço do cliente é afetado por algum incidente ativo? */
export function incidentAffects(list: Incident[], servico: IncidentServico): Incident | undefined {
  return list.find((i) => i.status === 'ativo' && i.servicos.includes(servico));
}
