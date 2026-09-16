# Revisão dos serviços — 16/09/2026

Base: `main`, commit `5b5db01`. Branch: `codex/backend-bugfixes`.

## Escopo e limite da revisão

O repositório não contém o backend Node/Express, Redis ou proxy Dialogflow
descrito na arquitetura. Contém uma aplicação Next.js com serviços simulados
no navegador e adaptadores HTTP para uma futura API externa. Não há rotas
`app/api`, banco de dados nem endpoints de autenticação implementados aqui.

As correções desta revisão se limitam a `src/services`, `src/config/backend.ts`
e à infraestrutura de testes. Nenhuma página, componente, hook, contexto React,
folha de estilo, imagem ou dado de apresentação foi modificado.

## Correções verificadas

1. **Configuração da API no navegador:** referências indiretas através de
   `const env = process.env` não são incorporadas pelo Next.js. Agora as variáveis
   públicas são acessadas diretamente, conforme o guia distribuído com a versão
   instalada em `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`.
2. **TTL inválido:** valores não numéricos, negativos, zero e fracionários deixam
   de produzir expiração inválida. O padrão é 1.800 segundos.
3. **URLs:** barras finais dos endpoints são removidas antes de acrescentar as rotas.
4. **Modo API incompleto:** autenticação, sessões, incidentes e privacidade
   rejeitam operações sem endpoint configurado, em vez de usar mocks silenciosamente.
5. **Tokens:** conteúdo malformado não lança exceções durante a retomada da sessão;
   os campos obrigatórios e timestamps são validados, e a expiração inclui o
   instante exato do vencimento. Contadores inválidos não retornam `NaN`.
6. **Emissão remota de token:** respostas inválidas ou vinculadas a outro usuário,
   sessão ou canal são rejeitadas.
7. **Recuperação de sessões:** registros incompletos e sessões vencidas são
   rejeitados. Respostas da API precisam corresponder ao usuário/telefone solicitado.
8. **Logout remoto:** o identificador da sessão carregada/salva é mantido para que
   a exclusão remota efetivamente aconteça. Falhas HTTP são propagadas, mantendo
   a limpeza local. Um DELETE que retorna 404 é considerado idempotente.
9. **Concorrência:** gravações de sessão são serializadas; o logout aguarda os PUTs
   anteriores antes do DELETE. Respostas iniciadas antes do logout não repovoam
   o cache local. Uma falha não bloqueia as operações seguintes.
10. **Histórico importado:** o timestamp de uma mensagem antiga não reduz o
    timestamp de atividade da sessão atual.
11. **Privacidade:** consentimento, revogação e exclusão deixam de esconder erros
    HTTP/de rede. O armazenamento local só reflete operações remotas bem-sucedidas.
    Registros de consentimento corrompidos são rejeitados.
12. **Incidentes:** caches e respostas HTTP são validados antes de serem usados
    como listas; uma lista vazia é preservada. O retorno inicial não compartilha
    referências mutáveis com os dados de demonstração.
13. **Clara:** pedidos de atendente, segunda via e alteração de plano têm
    precedência sobre consultas genéricas que contêm as mesmas palavras.
    Intents remotos desconhecidos são convertidos para `fora_de_escopo`.

PUTs de sessão e incidentes também aceitam confirmação HTTP 204 sem tentar
interpretar um corpo JSON inexistente.

## Bug relatado de atendente → gerente: pendente no frontend

A autenticação administrativa está inteiramente em
`src/context/ClaroContext.tsx`: `adminLogin` consulta `ADMIN_USERS`, altera estado
React e escreve em `localStorage`. Ela não chama nenhum serviço/backend.

Na análise estática de `src/components/admin/AdminPanel.tsx`, o estado `tab`
recebe o papel administrativo somente na inicialização do `useState`. O mesmo
componente continua montado após `adminLogout` e retorna `AdminGate`. Assim,
autenticar outro perfil mantém a aba do perfil anterior. No sentido inverso,
uma aba `dashboard` preservada para um atendente pode deixar o conteúdo vazio,
pois a renderização desse painel exige o papel gerente. Recarregar a página
também inicializa a aba antes da reidratação do papel.

Isso identifica uma falha de estado compatível com o relato, mas não comprova
que as credenciais do gerente sejam recusadas. O fluxo não foi validado em um
navegador nesta revisão. A correção exige alterar a lógica React do painel;
ela foi deixada intacta para cumprir a proibição de editar o frontend.

## Outros limites e achados não corrigidos

- `ClaroContext` reidrata alguns registros diretamente do `localStorage`,
  ignorando os validadores dos serviços, e mantém estado de sessão em memória.
  A validação/expiração dos serviços não corrige todos esses caminhos da interface.
- O contexto ignora erros de algumas operações assíncronas. Em particular,
  `deleteMyConversations` altera o estado e registra exclusão antes de aguardar a
  API. O serviço agora rejeita falhas, mas a confirmação visual pode continuar
  incorreta até uma correção no consumidor React.
- A autenticação administrativa e as permissões são demonstrativas, armazenadas
  no cliente. A assinatura mock não é segura. A leitura de JWT no modo API não
  verifica criptograficamente a assinatura; essa responsabilidade pertence ao
  backend ausente. Não há validação de segurança ponta a ponta nesta entrega.
- A fila de serialização evita disputas nesta instância do serviço; o backend
  real ainda precisa controlar concorrência entre abas, dispositivos e usuários.
- `claroApi` continua sendo uma fonte de dados de demonstração. Sem contrato e
  implementação do backend, não foram inventados endpoints de conta/faturamento.
- `npm audit --omit=dev`, na instalação original, reportou 5 dependências
  vulneráveis: 1 crítica, 3 altas e 1 moderada. Inclui Next.js 16.2.4 e dependências
  transitivas. Nenhuma dependência de runtime foi atualizada nesta revisão para
  preservar o escopo da aplicação existente. Avisos críticos reportados:
  [servidor Windows](https://github.com/advisories/GHSA-p293-qw3h-jr36) e
  [otimização AVIF](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4).
  Atualização do framework deve ser tratada em revisão própria, com regressão da aplicação.

## Validação

- `npm run test:services`: 28 testes aprovados. Foram observadas falhas antes das
  correções e sucesso depois; a suíte cobre mock, API com `fetch` controlado,
  falhas HTTP, expiração, dados corrompidos e operações concorrentes.
- `npx eslint src/config/backend.ts src/services tests/services.test.cjs`: passou.
- `npx tsc --noEmit`: passou.
- `npm run build`: passou.
- `git diff --check`: passou.
- O lint completo já falhava antes das alterações: 9 erros e 1 aviso em
  `AdminPanel`, `AddPlanModal`, `PayModal`, `TourOverlay`, `HeroBill`,
  `ClaroContext`, `mockData` e `LandingPage`. Esses arquivos ficaram intactos.

Os testes usam o TypeScript e o executor nativo do Node já disponíveis, sem
instalar bibliotecas novas. Os arquivos compilados ficam em `build/services-test`,
que já está ignorado pelo Git. A execução foi validada com Node 24.13.0.
