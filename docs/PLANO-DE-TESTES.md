# One Hub · Plano de Testes Funcionais (E2E)

Protótipo Sprint 3 · roteiro para validar todas as funcionalidades ponta a ponta.
Rodar com `npm run dev` (http://localhost:3000). Nenhum backend é necessário —
o modo padrão é `mock` (sessão/token/incidentes em `localStorage`).

> Dica: para repetir os cenários do zero, abra o DevTools › Application ›
> Local Storage e limpe as chaves `onehub.*`, ou use uma aba anônima.

---

## 0. Pré-condições

| Item | Valor |
|---|---|
| Cliente sugerido | `rodolfo.sanches@claro.com.br` · qualquer senha |
| Admin atendente | `atendente@claro.com.br` / `admin` |
| Admin gerente | `gerente@claro.com.br` / `gerente` |
| Telefone do titular (WhatsApp) | `(11) 98765-4321` |

---

## 1. Autenticação e sessão (RNF005 · §7 controle de acesso)

| # | Passo | Resultado esperado |
|---|---|---|
| 1.1 | Abrir `/` → "Acessar One Hub" | Vai para `/login` com abas **Cliente / Administrador** |
| 1.2 | Aba **Cliente** → preencher e "Entrar" | Loading → `/hub`; saudação "Olá, Rodolfo" |
| 1.3 | `Configurações › Sessão e segurança` | Mostra `session_id`, canal de origem = **Web Chat**, contexto atual = "—", token expira em ~29:5x (regressivo), canais = Web Chat |
| 1.4 | Aguardar/observar o contador do token | Decrementa a cada segundo; fica vermelho abaixo de 5 min |
| 1.5 | `Sair da conta` e voltar | `/login`; ao entrar de novo o `session_id` é **outro** (sessão anterior encerrada) |
| 1.5b | Logado no `/hub`, apertar **F5** | Continua no portal (não volta para `/login`); breve spinner de checagem; `session_id`, faturas pagas, pontos e conta ativa **preservados** |
| 1.5c | `/login` com sessão válida ativa | Redireciona sozinho para `/hub` |
| 1.5d | Admin logado, F5 em `/admin` | Continua no console (papel RBAC preservado em `onehub.admin`) |
| 1.6 | Aba **Administrador** → clicar no card "Atendente" → Entrar | Vai para `/admin`, console ITSM (sem passar pelo hub do cliente) |
| 1.7 | Aba **Administrador** com senha errada | "Credenciais inválidas ou sem permissão" |

---

## 2. Consentimento LGPD (§7)

| # | Passo | Resultado esperado |
|---|---|---|
| 2.1 | Logado como cliente, 1º clique em **Falar com Clara** | Tela de **aceite** antes do chat ("sua conversa é registrada… LGPD") |
| 2.2 | "Aceito e quero continuar" | Chat abre, Clara cumprimenta |
| 2.3 | `Configurações › Privacidade e dados` | "Consentido em <data/hora>" + botão **Revogar** |
| 2.4 | **Baixar meus dados (JSON)** | Baixa `onehub-meus-dados-AAAA-MM-DD.json` com sessão + consentimento |
| 2.5 | **Excluir histórico de conversas** → Confirmar | Mensagem "Histórico excluído (art. 18 LGPD)"; sessão zerada; **o chamado do titular some da fila do Admin**; auditoria registra `dados.excluidos` |
| 2.6 | **Revogar** consentimento e reabrir a Clara | A tela de aceite aparece de novo |

---

## 3. Clara — intents e autoatendimento (§2 · Dialogflow arquitetado)

Abrir a Clara e testar cada frase; a resposta deve usar os **dados reais** da conta.

| Frase | Intent | Esperado |
|---|---|---|
| "qual o valor da minha fatura?" | consultar_fatura | Cita Abril 2026, R$ 519,70, vencimento 10/05 |
| "preciso da 2ª via do boleto" | segunda_via_fatura | Gera 2ª via, oferece e-mail/WhatsApp |
| "qual o meu plano?" | consultar_plano | Lista os 4 serviços + total mensal |
| "quero trocar de plano" | alterar_plano | Sugere "+ Adicionar plano" |
| "minha internet caiu" | status_servico | Cita o **incidente ativo** da região (ver §5) |
| "quero falar com um atendente" | solicitar_atendente | Abre o card de **handover** (Chat / WhatsApp / 106) |
| "asdf qualquer coisa" | fora_de_escopo | Oferece transferência para humano |

3.8 — `Configurações › Sessão e segurança`: `contexto atual` reflete o último intent; contador de mensagens sobe.

---

## 3b. Central de Atendimento / Meu Atendimento (comunicação em destaque)

| # | Passo | Resultado esperado |
|---|---|---|
| 3b.1 | Visão Geral | Card escuro **"Central de Atendimento"** ao lado das ações rápidas, com os 4 canais |
| 3b.2 | Após conversar com a Clara, voltar à Visão Geral | O card mostra "Conversa em andamento · <assunto>"; **banner** no topo "Conversa em andamento sobre <assunto> — Retomar" |
| 3b.3 | Sidebar → **Meu Atendimento** (badge •) | Canais em destaque + a conversa contínua com a linha do tempo dos canais |
| 3b.4 | Clara responde "qual o valor da minha fatura?" | Abaixo da resposta aparecem botões **"Ver faturas"** e **"Pagar agora"** que navegam/abrem o modal (RNF002) |
| 3b.5 | Pedir atendente → após handover, ir em Meu Atendimento | **Status do chamado** em etapas (Clara → Fila → Atendente → Resolvido); badge da sidebar vira **!** |
| 3b.6 | Admin resolve o ticket → cliente volta em Meu Atendimento | Aparece **"Como foi seu atendimento?"** com estrelas; ao avaliar, o painel do Admin (aside do ticket) mostra o CSAT |
| 3b.7 | Handover a partir de "minha internet caiu" | Ticket abre como categoria **Incidente de Rede**, prioridade **alta**, protocolo `INC-…` |

## 4. Continuidade de contexto entre canais (RF001 · RF005 · §4)

| # | Passo | Resultado esperado |
|---|---|---|
| 4.1 | Na Clara (web), conversar 2–3 mensagens | Histórico gravado na sessão |
| 4.2 | Menu do perfil → **Canal WhatsApp** (ou Config › "Continuar no WhatsApp") | Vai para `/whatsapp` |
| 4.3 | Tela de identificação: telefone `(11) 98765-4321`, marcar consentimento, "Iniciar conversa" | Faixa verde "Sessão SESS-… recuperada · continuada de Web Chat" |
| 4.4 | Observar as mensagens | Todo o histórico do portal aparece, com etiqueta "· Web Chat"; Clara retoma: "Estávamos falando sobre… não precisa repetir nada" |
| 4.5 | Enviar mensagem nova no WhatsApp | Entra no mesmo `historico` com canal WhatsApp; rodapé mostra "canais: Web Chat → WhatsApp" |
| 4.6 | Voltar a `/hub` → abrir a Clara | O histórico agora inclui as mensagens do WhatsApp |
| 4.7 | Telefone não cadastrado (ex.: `11 90000-0000`) | "Número não encontrado no cadastro Claro" |
| 4.8 | Recarregar `/whatsapp` (F5) e reidentificar | Sessão reidratada do `localStorage` (simula Redis) |

---

## 5. Handover suave para atendente humano (§4.2)

| # | Passo | Resultado esperado |
|---|---|---|
| 5.1 | Na Clara: "quero falar com atendente" → card handover → **Chat Online** | "Você entrou na fila… não vai precisar repetir nada"; sessão vira `status: handover` |
| 5.2 | Handover → **WhatsApp** | Chat fecha e abre `/whatsapp` com o histórico |
| 5.3 | Handover → **Ligar 106** | Dispara `tel:106` |
| 5.4 | Entrar no `/admin` (atendente) | Ticket novo `Q-SELF` no topo da fila, canal = origem correta, com **todo o histórico da Clara** (portal + WhatsApp) |
| 5.5 | No console: responder o ticket | Status vira "em atendimento"; mensagens do atendente aparecem abaixo do diagnóstico da Clara |
| 5.6 | "Resolver" o ticket | KPIs (Resolvidos, SLA, Tempo médio) atualizam; trilha de auditoria registra `ticket.resolvido` |
| 5.7 | Aba lateral do ticket → **Anonimizar dados (LGPD)** | Nome/CPF/mensagens do cliente mascarados; auditoria registra `dados.anonimizados` |
| 5.8 | No mesmo ticket → **Reverter anonimização (demonstração)** | Dados originais restaurados; auditoria registra `dados.restaurados` |

---

## 6. Incidentes técnicos e notificação proativa (RF006)

| # | Passo | Resultado esperado |
|---|---|---|
| 6.1 | `/hub` recém-aberto | Banner âmbar no topo: "Instabilidade na fibra — São Paulo, Zona Sul" (incidente `INC-4471` que já vem ativo) |
| 6.2 | Banner → **Detalhes** | Expande com descrição + protocolo + "aberto por" |
| 6.3 | Login como **gerente** → aba **Incidentes** | Formulário + lista "Incidentes ativos · 1" |
| 6.4 | Registrar incidente: título, região, serviços (ex.: TV), severidade **Crítico**, previsão → "Publicar e notificar clientes" | "Incidente publicado · clientes notificados · auditado" |
| 6.5 | Badge da aba "Incidentes" no topo | Contador sobe para 2 |
| 6.6 | Voltar ao `/hub` como cliente (sair, login cliente) | Banner agora mostra o incidente **mais severo** (Crítico, em vermelho) + "+1 incidente(s)" |
| 6.7 | Sino de notificações | Notificação "Incidente técnico na sua região…" não lida — **só se o cliente tiver o serviço afetado** |
| 6.7b | Abrir a Clara com incidente ativo no serviço do cliente | A saudação já **avisa do incidente** ("Antes de mais nada: …") |
| 6.8 | Perguntar à Clara "minha internet caiu" (ou "a tv não pega") | Resposta cita o incidente ativo do serviço, com protocolo |
| 6.9 | Admin › Incidentes → "Marcar como normalizado" | Incidente sai dos ativos; nova notificação "Incidente … normalizado ✅"; se não houver mais ativos o banner some |

---

## 6b. Canal App (3º canal · §4.1)

| # | Passo | Resultado esperado |
|---|---|---|
| 6b.1 | Menu do perfil → **Canal App** (ou Meu Atendimento → "App Claro") | Abre `/app` com visual de app (status bar, header vermelho) — **sem pedir telefone** |
| 6b.2 | Se já houve conversa no Web/WhatsApp | Histórico aparece com etiqueta do canal de origem; Clara retoma o contexto |
| 6b.3 | Enviar mensagem no App | Entra na mesma sessão com `canal: app`; rodapé mostra "canais: Web Chat → App" |
| 6b.4 | Voltar ao `/hub` → abrir a Clara | Histórico inclui as mensagens do App |

## 6c. Admin — operação (§10)

| # | Passo | Resultado esperado |
|---|---|---|
| 6c.1 | Console → selecionar um ticket não resolvido | Acima do campo de resposta: chips de **respostas rápidas**; clicar preenche o rascunho |
| 6c.2 | Responder um ticket → filtro **"Meus tickets"** | Lista passa a mostrar só os tickets que você tocou / em atendimento |
| 6c.3 | Observar um ticket novo por alguns segundos | "Aberto há" e o badge de SLA **atualizam ao vivo** (contador de espera) |

## 7. Acessibilidade — VLibras (RF007 · §9) + WCAG

| # | Passo | Resultado esperado |
|---|---|---|
| 7.1 | Qualquer página | Ícone de acessibilidade (bonequinho VLibras) no canto inferior direito, **acima** do botão da Clara |
| 7.2 | Clicar no ícone | Abre o player de Libras do VLibras (carrega de `vlibras.gov.br`) |
| 7.3 | Selecionar um texto da página | O avatar traduz para Libras |
| 7.4 | Focar a página e apertar **Tab** logo no início | Aparece o link "Pular para o conteúdo" (skip-link) |
| 7.5 | Navegar por Tab pelos botões | Contorno de foco visível (`:focus-visible`) |
| 7.6 | SO com "reduzir movimento" ativado | Animações praticamente desativadas |

> Se a rede bloquear `vlibras.gov.br`, o widget simplesmente não carrega — a
> integração está no layout raiz e não quebra a aplicação.

---

## 8. Configurações — opções funcionais

| # | Passo | Resultado esperado |
|---|---|---|
| 8.1 | `Configurações` → "Editar perfil" | Expande formulário (nome/e-mail/telefone) → "Salvar alterações" mostra "Perfil atualizado" |
| 8.2 | **Aparência** | Alterna claro/escuro em toda a aplicação |
| 8.3 | **Senha e biometria** | Expande: campos de senha + toggle Face ID + "Salvar" → "Alterações salvas" |
| 8.4 | **Autenticação em 2 fatores** | Expande: toggles SMS / e-mail / app; o subtítulo da linha reflete o estado |
| 8.5 | **Notificações** | Expande: 4 toggles (faturas, consumo, promoções, incidentes) |
| 8.6 | **Métodos de pagamento** | Expande: lista de cartões + Pix + "Adicionar cartão" |
| 8.7 | **Dependentes e PJ** | Expande: as 4 contas reais; "Alternar" troca a conta ativa (reflete no topo e nos dados) |

---

## 9. Navegação e redirecionamentos

| # | Passo | Resultado esperado |
|---|---|---|
| 9.1 | Sidebar: Visão geral / Faturas / Celular / Internet / TV+ / Fixo / Clube / Suporte / Configurações | Cada item troca o conteúdo principal |
| 9.2 | Top bar: busca ocupa toda a largura entre a conta e os ícones | Sem "vão morto" |
| 9.3 | `Suporte` → card **Chat Online** → Iniciar | Abre a Clara |
| 9.4 | `Suporte` → card **WhatsApp** → Iniciar | Vai para `/whatsapp` |
| 9.5 | `Suporte` → card **Ligar 106** → Iniciar | Dispara `tel:106` |
| 9.6 | `Suporte` → card **Loja Virtual** → Iniciar | Abre a **loja interna** (modal "Adicionar plano" / novo serviço) |
| 9.7 | Quick action **Novo serviço** / Recomendações / "+ Adicionar plano" | Abre o modal da loja; confirmar adiciona o serviço ao combo + registra na atividade |
| 9.8 | `/hub` sem estar logado (abrir direto) | Redireciona para `/login` |
| 9.9 | `/admin` sem login de admin | Mostra o gate RBAC |
| 9.10 | Sino de notificações → **"Marcar todas como lidas"** | Bolinha vermelha some; cabeçalho vira "Tudo em dia" |
| 9.11 | Sino → "marcar lida" numa notificação | Só aquela deixa de estar destacada |

---

## 10. Funcionalidades de conta (herdadas, revalidar)

| # | Passo | Resultado esperado |
|---|---|---|
| 10.1 | Card escuro da fatura → **Pagar agora** → confirmar Pix | "Pagamento confirmado · pontos creditados"; fatura vira "paga"; pontos do Clube sobem |
| 10.2 | Fatura → **Detalhes** | Modal com composição da fatura por serviço |
| 10.3 | `Clube` → resgatar recompensa (com pontos suficientes) | Animação de resgate; **pontos debitados do total** (widget e página do Clube atualizam); entra na atividade; sobrevive ao F5 |
| 10.4 | Trocar de conta no topo (titular → dependente) | Serviços, faturas, e-mail, tier e pontos mudam conforme o perfil |
| 10.5 | Busca (⌘K) por "fatura", "netflix", "clube" | Resultados agrupados + opção "perguntar à Clara" |
| 10.6 | Tour guiado ("Novidade · tour guiado do Hub") | Passa pelos pontos da interface |

---

## Critério de aceite da sprint

Todos os cenários de **§1 a §9** passam sem erro no console do navegador e sem
quebrar a navegação. Os itens de §10 são regressão das sprints anteriores.
