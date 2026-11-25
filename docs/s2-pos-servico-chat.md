# S2 · US43 e US45 — pós-serviço e chat (front)

Branch: `feat/s2-pos-servico-chat-tempo-real`, criada a partir de `origin/develop`.
Responsável: Hugo (front). A `main` não foi alterada. Esta branch ainda não foi enviada ao remoto.

## 0. Leitura rápida

- O back é `Pedro-Soares09/FreelAI-Back`. Foi lido em modo leitura, sem alterações.
- Três coisas do front não têm correspondente real no back hoje:
  1. **Contestação:** o front chama `POST /api/v1/vagas/{id}/disputa`, caminho definido no contrato `contracts/openapi.json`. No back, essa rota ainda não existe: há só o modelo `disputas` e a checagem `_em_disputa`, que suspende a liberação. Dono: Jonas, card da Sprint 3, épico E8 (Pós-serviço), dependências US40 e US28. O card prevê decisão do admin em até 48 h úteis (reembolso total, parcial ou pagamento integral) e trava de vaga em disputa, que a varredura de 72 h respeita. O card marca "corte possível": se cair, contestar vira apenas denúncia. Não há branch nem PR com a rota no repositório (a clonagem é rasa e só traz a `main`). O front não precisa mudar se a rota seguir o contrato.

Atenção: a "contestação" do card do João Victor (US58, admin) é outra coisa. Trata de suspensão e banimento de conta, com 5 dias, e não de contestação de serviço.
  2. **Acordo e conversas:** `GET /vagas/{id}/acordo` e `GET /conversas/{id}` são stubs com dados de exemplo (`X-Stub: true`, sem autenticação).
  3. **Chat em tempo real e anexos:** não há WebSocket. O campo `anexo_url` existe no modelo de mensagens, mas o upload foi revertido (PR #10) e não há rota de envio.
- Os prazos do back vêm de `app/services/configuracao.py` (perfil `producao`). O front foi ajustado para eles no commit `f770ce2`.

## 1. Prazos: o que o back define

| Prazo | Valor (back) | Chave em `configuracao.py` | Referência do prazo | Uso no front |
|---|---|---|---|---|
| Confirmação de conclusão pelo contratante | 24 h (1440 min) | `confirmacao_conclusao_min` | Fim previsto do serviço | Conclusão automática se o contratante não responder (varredura `conclusao_automatica`) |
| Prazo para avaliar | 48 h (2880 min) | `avaliacao_prazo_min` | Conclusão | Rótulo "Prazo para avaliar (48 h)" |
| Liberação parcial de 50% sem validação facial | 72 h (4320 min) | `liberacao_parcial_min` | Fim previsto do serviço | Rótulo "Liberação parcial de 50% sem validação facial (72 h)" |
| Contestação | 24 h | Não existe no back | — | `CONTEST_WINDOW_HOURS` no front, sem fonte no back |

Pontos de atenção:
- No back, os prazos contam do **fim previsto do serviço**. No front, o mock conta da **conclusão**. Isso precisa ser alinhado quando a API existir.
- Não existe "revisão de 48 h" nem "decisão automática de 72 h" no back. Os rótulos anteriores eram do texto de copy da tela de pagamento e não têm origem no back. Foram removidos no commit `f770ce2`.
- A contestação de 24 h não está no back. Hoje ela só existe no front.

## 2. Status dos critérios de aceite

### US43 · Pós-serviço

| Critério | Status | Onde | Observação |
|---|---|---|---|
| Confirmar leva o contratante à validação facial (US42) | Feito (mock) | `post-service-panel.tsx` | Após a conclusão pelas duas partes, o contratante vai para `/pagamento/[id]?validar=1`. |
| Contestar bloqueia a liberação e mostra "em análise" | Feito (mock) | `pagamento/[id]/page.tsx`, `services/chat.ts` (`getAgreementStatus`) | Com o acordo `contested`, a validação fica bloqueada. No back, a liberação já é suspensa por `_em_disputa`. Mas a rota de disputa não existe. |
| Linha do tempo mostra o prazo atual vindo da API | Parcial | `post-service-panel.tsx` | Exibe `contestDeadline`, `avaliacaoDeadline` e `liberacaoParcialDeadline`. Hoje são preenchidos pelo mock. |

Itens da tarefa e do contexto do card:

| Item | Status | Detalhe |
|---|---|---|
| Texto e anexos na confirmação | Feito no front | Campo de observação e seletor de arquivos (imagem ou PDF). No mock ficam no acordo. O `POST /vagas/{id}/conclusao` do back não tem corpo e não recebe texto nem anexos. |
| Prazos na linha do tempo | Feito no front, com valores do back | 24 h (contestação do app), 48 h (avaliar) e 72 h (liberação parcial). Ver seção 1. |
| Opção "aguardar as 24 h" | Só texto, alinhado ao back | O painel informa que, sem resposta do contratante em 24 h, a conclusão é automática. No back isso já existe pela varredura `conclusao_automatica`. |
| Aviso de pagamento para o profissional | Feito | Texto no painel do profissional após a conclusão. |
| Contestação com anexos | Não feito | A contestação continua só com motivo e detalhes. |

### US45 · Lista de conversas e chat em tempo real

| Critério | Status | Observação |
|---|---|---|
| Mensagem aparece nos dois navegadores sem recarregar | Não feito | Não existe WebSocket no back. Hoje é polling de 3 s em memória (`POLL_INTERVAL_MS`). |
| Queda de conexão reconecta e recupera o histórico | Já existia | `chat/[id]/page.tsx`: estado `reconnecting` e recarga com `getMessages`. Não alterado. |
| Conversa de vaga encerrada fica somente leitura com aviso | Já existia | `readOnly` com `jobClosed`. Não alterado. |

Tarefas do card:
- Lista de conversas (avatar com selo, última mensagem, não lidas): já existia em `conversation-item.tsx`.
- Tela do chat com WebSocket e reconexão: parcial. Reconexão simulada existe; WebSocket não.
- Cabeçalho com estado da vaga e ações: feito. O estado é derivado do acordo (`rotuloEstadoVaga` em `chat-header.tsx`). O back não expõe estado da vaga na conversa.
- Anexos de imagem e PDF no composer: o composer já tem o seletor. O envio não funciona sem rota no back.

## 3. Commits

1. mostra prazo para contestar após a conclusão (US43)
2. prazo da contestação vem do acordo (US43)
3. confirmar conclusão leva o contratante à validação facial (US43)
4. contestação bloqueia a liberação e mostra em análise (US43)
5. observação e anexos na confirmação de conclusão (US43)
6. prazos de 48 h e 72 h na linha do tempo pós-serviço (US43)
7. aviso de pagamento para o profissional após a conclusão (US43)
8. estado da vaga no cabeçalho da conversa (US45)
9. prazos pós-serviço alinhados aos valores do back (US43) — `f770ce2`
10. documentação desta branch

## 4. O que depende do back

Para o front funcionar em modo API, o back precisa de:

- Rota de contestação (`POST /vagas/{id}/disputa`, conforme o contrato) e leitura do estado da disputa. Dono: Jonas, Sprint 3, com corte possível (ver seção 0).
- Acordo real em `GET /vagas/{id}/acordo` (hoje é stub) com `status`, `completedAt`, `contestDeadline`, `avaliacaoDeadline` e `liberacaoParcialDeadline`.
- Conversas reais em `GET /conversas/{id}` e mensagens com autenticação (hoje são stubs).
- Corpo na confirmação de conclusão (observação e nomes ou ids dos anexos), se o time quiser que isso chegue ao servidor.
- Upload de anexos (rota e armazenamento), reativando a linha revertida na PR #10.
- WebSocket para o chat (US44). Hoje não existe.
- Estado da vaga na conversa.
- Alinhamento de referência dos prazos: o back conta do fim previsto; o front conta da conclusão.

Mocks a remover quando o back existir:
- `MOCK_OTHER_PARTY_AUTO_CONFIRM` em `services/chat.ts`.
- Ramos `CHAT_USA_MOCKS` das funções de pós-serviço e de `getAgreementStatus`.

Premissa a confirmar: `getAgreementStatus(vagaId)` assume que o id do acordo é o id da vaga. No back, o acordo é consultado por `/vagas/{vaga_id}/acordo`, então a premissa parece válida, mas o stub não confirma.

## 5. Verificação

- `npx tsc --noEmit`: 15 erros, iguais aos da `develop`. Estão em `session.tsx` e `mapa-vagas.tsx`, fora do escopo desta entrega. Nenhum erro novo nos arquivos alterados.
- Teste manual sugerido (mock ligado):
  1. Abrir uma conversa com acordo aceito pelas duas partes.
  2. Como contratante, escrever uma observação, anexar um PDF e confirmar. Ver se a tela leva para `/pagamento/[id]?validar=1`.
  3. Como profissional, confirmar e ver o aviso de pagamento e os três prazos.
  4. Contestar e abrir a tela de pagamento: deve aparecer "Em análise" e o botão de selfie deve ficar bloqueado.

## 6. Pendências

- Confirmar com o Jonas a data da rota de contestação, se o corpo e a resposta seguem o contrato e se o corte foi decidido. Sem ela, o botão "Contestar serviço" falha em modo API. Está planejada para a Sprint 3, ou seja, pode não estar pronta para a nossa entrega da Sprint 2.
- Definir se a confirmação deve levar texto e anexos ao servidor.
- Upload real de anexos.
- WebSocket (US44) e só então validar a entrega em dois navegadores.
- Alinhar a referência dos prazos (fim previsto ou conclusão).
- Limpar os 15 erros de typecheck da `develop`, fora desta entrega.
