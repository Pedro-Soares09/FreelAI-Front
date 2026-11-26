# S2 · pós-serviço e chat (front)

Responsável: Hugo (front). Documento atualizado em 25/11/2026 para refletir a `develop` atual, que já usa a API real do back em vez dos stubs. A versão anterior descrevia o back como stubs; essa descrição está superada.

## 1. Resumo

- Os trechos novos deste PR (estado da vaga no cabeçalho do chat, prazos na linha do tempo, observação e anexos na confirmação, bloqueio da liberação em análise) funcionam no modo mock e não quebram o modo real.
- No modo real, a conclusão confirmada pelo contratante leva direto à tela de pagamento (`/pagamento/[id]`). O Pix é cobrado depois da conclusão; a validação facial do fluxo antigo só aparece com o valor retido.
- Observação e nomes de anexos da confirmação só são guardados no mock: `POST /api/v1/vagas/{id}/conclusao` não recebe corpo.

## 2. O que o back já tem hoje

| Necessidade | Situação na `develop` |
|---|---|
| Contestação do serviço | `POST /vagas/{id}/disputa` e `GET /vagas/{id}/disputa` existem; o admin decide pela fila de disputas |
| Acordo | `GET /vagas/{id}/acordo` e `POST /vagas/{id}/acordo/aceite` reais |
| Conversas e mensagens | `GET /conversas`, `GET /conversas/{id}`, `GET /vagas/{id}/conversa` e mensagens reais, com autenticação |
| Anexos do chat | `POST /conversas/{id}/anexos` e leitura de anexos existem |
| Tempo real | `WebSocket /conversas/{id}/ws` existe no back; o front ainda usa polling de 3 s (`POLL_INTERVAL_MS`) |
| Estado da vaga na conversa | A conversa traz `bloqueada` (denúncia procedente); o estado da vaga continua derivado do acordo no front |
| Conclusão | `POST /vagas/{id}/conclusao` sem corpo; a conclusão automática acontece pela varredura agendada |

## 3. Prazos

| Prazo | Produção | Perfil demo | Chave em `configuracao.py` |
|---|---|---|---|
| Confirmar a conclusão | 24 h | 3 min | `confirmacao_conclusao_min` |
| Avaliar | 48 h | 3 min | `avaliacao_prazo_min` |
| Liberação parcial de 50% | 72 h | 6 min | `liberacao_parcial_min` |

A contestação de 24 h (`CONTEST_WINDOW_HOURS`) é uma regra do front no mock e não tem chave própria no back. No back os prazos contam do fim previsto do serviço; no mock contam da conclusão.

## 4. Status por critério

| Critério | Status | Onde |
|---|---|---|
| Confirmar leva o contratante ao pagamento do serviço | Feito | `post-service-panel.tsx` |
| Contestar bloqueia a liberação e mostra "em análise" | Feito (mock) | `pagamento/[id]/page.tsx`, `services/chat.ts` |
| Linha do tempo com prazos | Feito, valores no mock e no formato do back | `post-service-panel.tsx` |
| Texto e anexos na confirmação | Só mock | o endpoint de conclusão não recebe corpo |
| Aviso de pagamento ao profissional | Feito | `post-service-panel.tsx` |
| Mensagem aparece nos dois navegadores sem recarregar | Parcial | polling de 3 s; o WebSocket do back ainda não foi ligado no front |
| Reconexão e recarga do histórico | Já existia | `chat/[id]/page.tsx` |
| Conversa de vaga encerrada somente leitura | Já existia | `readOnly` com `jobClosed` |

## 5. Pendências reais

- Ligar o chat ao WebSocket do back (hoje é polling).
- Decidir se a observação e os anexos da confirmação devem ir ao servidor; exige um corpo no endpoint de conclusão.
- Contestação com anexos (hoje só motivo e detalhes).
- Alinhar a referência dos prazos entre o mock (conclusão) e o back (fim previsto).
- Remover do mock, quando não houver mais modo mock, `MOCK_OTHER_PARTY_AUTO_CONFIRM` em `services/chat.ts` e os ramos `CHAT_USA_MOCKS` das funções de pós-serviço.

## 6. Verificação

- `npx tsc --noEmit` e `npm run lint` sem erros novos; o lint mantém os 4 avisos antigos da `develop`.
- Teste manual com a API real: contratante confirma a conclusão no chat e cai em `/pagamento/[id]` com o Pix aguardando; o card de validação facial não aparece antes do pagamento.
- Teste manual com mock: confirmar com observação e anexo, ver os três prazos na linha do tempo e, ao contestar, ver "Em análise" e a liberação bloqueada.
