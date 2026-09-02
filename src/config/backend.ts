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

const env = process.env;

function flag(v: string | undefined, fallback = false): boolean {
  if (v == null) return fallback;
  return v === 'true' || v === '1';
}

export const backendConfig = {
  /** 'mock' → tudo simulado no browser · 'api' → chama o backend real */
  mode: (env.NEXT_PUBLIC_BACKEND_MODE as BackendMode) || 'mock',

  /** Base da API de orquestração (Node.js + Express) */
  apiBaseUrl: env.NEXT_PUBLIC_API_BASE_URL || '',

  /** Camada de sessão/contexto (Redis) — §3.1 e §4 */
  session: {
    /** Endpoint REST do serviço de gestão de contexto (fallback: apiBaseUrl) */
    endpoint: env.NEXT_PUBLIC_SESSION_API_URL || env.NEXT_PUBLIC_API_BASE_URL || '',
    /** TTL do session_id no Redis — RNF005 (expiração 30 min) */
    ttlSeconds: Number(env.NEXT_PUBLIC_SESSION_TTL_SECONDS || 1800),
    /** Chave usada para persistir a sessão localmente no modo mock */
    localStorageKey: 'onehub.session',
  },

  /** Autenticação — token JWT (RNF005) */
  auth: {
    endpoint: env.NEXT_PUBLIC_AUTH_API_URL || env.NEXT_PUBLIC_API_BASE_URL || '',
    /** Expiração do token em segundos (documento: 30 min) */
    tokenTtlSeconds: Number(env.NEXT_PUBLIC_AUTH_TOKEN_TTL_SECONDS || 1800),
    localStorageKey: 'onehub.token',
    /** Segredo usado APENAS para a assinatura simulada em modo mock */
    mockSecret: 'onehub-mock-secret-nao-usar-em-producao',
  },

  /** Notificação proativa de incidentes técnicos (RF006) */
  incidents: {
    endpoint: env.NEXT_PUBLIC_INCIDENTS_API_URL || env.NEXT_PUBLIC_API_BASE_URL || '',
    localStorageKey: 'onehub.incidents',
  },

  /** LGPD — consentimento + direito de exclusão (§7) */
  privacy: {
    endpoint: env.NEXT_PUBLIC_PRIVACY_API_URL || env.NEXT_PUBLIC_API_BASE_URL || '',
    consentStorageKey: 'onehub.lgpd.consent',
    /** base legal exibida ao titular */
    baseLegal: 'LGPD · Lei 13.709/2018',
  },

  /** NLU da Clara — Dialogflow (§8) */
  dialogflow: {
    enabled: flag(env.NEXT_PUBLIC_DIALOGFLOW_ENABLED),
    /** Proxy no backend que fala com o Dialogflow (evita expor credenciais) */
    detectIntentUrl:
      env.NEXT_PUBLIC_DIALOGFLOW_DETECT_INTENT_URL ||
      (env.NEXT_PUBLIC_API_BASE_URL
        ? `${env.NEXT_PUBLIC_API_BASE_URL}/clara/detect-intent`
        : ''),
    projectId: env.NEXT_PUBLIC_DIALOGFLOW_PROJECT_ID || '',
    location: env.NEXT_PUBLIC_DIALOGFLOW_LOCATION || 'global',
    languageCode: 'pt-BR',
  },
} as const;

/** true quando o app deve conversar com o backend real */
export const isApiMode = backendConfig.mode === 'api';
