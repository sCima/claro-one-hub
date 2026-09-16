/* ─────────────────────────────────────────────────────────────────────────────
 * One Hub · Configuração das camadas de backend (Documento de Arquitetura §3.1)
 *
 * O protótipo funciona 100% em modo "mock" (dados no client). Este arquivo
 * concentra as chaves de ambiente necessárias para plugar o backend real
 * descrito no documento — Node.js/Express (orquestração), Redis (sessão/contexto)
 * e Dialogflow (NLU da Clara) — sem reescrever a camada de apresentação.
 *
 * Basta preencher .env.local e trocar NEXT_PUBLIC_BACKEND_MODE=api.
 * ───────────────────────────────────────────────────────────────────────────── */

export type BackendMode = 'mock' | 'api';

// Next.js só incorpora referências diretas a process.env.NEXT_PUBLIC_*.
// Não substituir por um alias de process.env ou por acesso dinâmico.
const apiBaseUrl = endpoint(process.env.NEXT_PUBLIC_API_BASE_URL);

function endpoint(value: string | undefined): string {
  return (value ?? '').trim().replace(/\/+$/, '');
}

function ttl(value: string | undefined): number {
  const seconds = Number(value);
  return Number.isSafeInteger(seconds) && seconds > 0 ? seconds : 1800;
}

/** Em modo API, configuração ausente é um erro, nunca autorização para usar mocks. */
export function requireEndpoint(value: string, service: string): string {
  if (!value) throw new Error(`Endpoint do serviço ${service} não configurado`);
  return value;
}

function flag(v: string | undefined, fallback = false): boolean {
  if (v == null) return fallback;
  return v === 'true' || v === '1';
}

export const backendConfig = {
  /** 'mock' → tudo simulado no browser · 'api' → chama o backend real */
  mode: (process.env.NEXT_PUBLIC_BACKEND_MODE as BackendMode) || 'mock',

  /** Base da API de orquestração (Node.js + Express) */
  apiBaseUrl,

  /** Camada de sessão/contexto (Redis) — §3.1 e §4 */
  session: {
    /** Endpoint REST do serviço de gestão de contexto (fallback: apiBaseUrl) */
    endpoint: endpoint(process.env.NEXT_PUBLIC_SESSION_API_URL) || apiBaseUrl,
    /** TTL do session_id no Redis — RNF005 (expiração 30 min) */
    ttlSeconds: ttl(process.env.NEXT_PUBLIC_SESSION_TTL_SECONDS),
    /** Chave usada para persistir a sessão localmente no modo mock */
    localStorageKey: 'onehub.session',
  },

  /** Autenticação — token JWT (RNF005) */
  auth: {
    endpoint: endpoint(process.env.NEXT_PUBLIC_AUTH_API_URL) || apiBaseUrl,
    /** Expiração do token em segundos (documento: 30 min) */
    tokenTtlSeconds: ttl(process.env.NEXT_PUBLIC_AUTH_TOKEN_TTL_SECONDS),
    localStorageKey: 'onehub.token',
    /** Segredo usado APENAS para a assinatura simulada em modo mock */
    mockSecret: 'onehub-mock-secret-nao-usar-em-producao',
  },

  /** Notificação proativa de incidentes técnicos (RF006) */
  incidents: {
    endpoint: endpoint(process.env.NEXT_PUBLIC_INCIDENTS_API_URL) || apiBaseUrl,
    localStorageKey: 'onehub.incidents',
  },

  /** LGPD — consentimento + direito de exclusão (§7) */
  privacy: {
    endpoint: endpoint(process.env.NEXT_PUBLIC_PRIVACY_API_URL) || apiBaseUrl,
    consentStorageKey: 'onehub.lgpd.consent',
    /** base legal exibida ao titular */
    baseLegal: 'LGPD · Lei 13.709/2018',
  },

  /** NLU da Clara — Dialogflow (§8) */
  dialogflow: {
    enabled: flag(process.env.NEXT_PUBLIC_DIALOGFLOW_ENABLED),
    /** Proxy no backend que fala com o Dialogflow (evita expor credenciais) */
    detectIntentUrl:
      endpoint(process.env.NEXT_PUBLIC_DIALOGFLOW_DETECT_INTENT_URL) ||
      (apiBaseUrl
        ? `${apiBaseUrl}/clara/detect-intent`
        : ''),
    projectId: process.env.NEXT_PUBLIC_DIALOGFLOW_PROJECT_ID || '',
    location: process.env.NEXT_PUBLIC_DIALOGFLOW_LOCATION || 'global',
    languageCode: 'pt-BR',
  },
} as const;

/** true quando o app deve conversar com o backend real */
export const isApiMode = backendConfig.mode === 'api';
