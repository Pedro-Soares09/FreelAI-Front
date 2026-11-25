# S2 · US43 e US45 — pós-serviço e chat (front)

Branch: `feat/s2-pos-servico-chat-tempo-real`, criada a partir de `origin/develop`.
Responsável: Hugo (front). A `main` não foi alterada. Esta branch ainda não foi enviada ao remoto.

## 1. Status dos critérios de aceite

### US43 · Pós-serviço

| Critério | Status | Onde | Observação |
|---|---|---|---|
| Confirmar leva o contratante à validação facial (US42) | Feito (mock) | `post-service-panel.tsx` | Após a conclusão pelas duas partes, o contratante vai para `/pagamento/[id]?validar=1`. Se o profissional ainda não confirmou, nada muda. |
| Contestar bloqueia a liberação e mostra "em análise" | Feito (mock) | `pagamento/[id]/page.tsx`, `services/chat.ts` (`getAgreementStatus`) | A validação facial fica bloqueada com aviso quando o acordo está `contested`. |
| Linha do tempo mostra o prazo atual vindo da API | Parcial | `post-service-panel.tsx` | Exibe `contestDeadline`, `reviewDeadline` e `autoDecisionDeadline`. Hoje o mock preenche esses campos na conclusão. Falta a API devolver os valores. |

Itens da tarefa e do contexto do card:

| Item | Status | Detalhe |
|---|---|---|
| Texto e anexos na confirmação | Feito no front | Campo de observação e seletor de arquivos (imagem ou PDF). No mock ficam guardados no acordo. A API não recebe: o `POST /api/v1/vagas/{id}/conclusao` do contrato não tem corpo. |
| Prazos 24 h, 48 h e 72 h na linha do tempo | Feito no front | 24 h: `CONTEST_WINDOW_HOURS`. 48 h e 72 h: regra da tela de pagamento ("Prazo de revisão: 48h. Após 72h, a plataforma aplica a decisão automática."). Confirmar com o card. |
| Opção "aguardar as 24 h" | Só texto | O painel informa que a conclusão é automática sem contestação em 24 h. A confirmação automática real não existe; hoje é o mock `MOCK_OTHER_PARTY_AUTO_CONFIRM`. |
| Aviso de pagamento para o profissional | Feito | Texto no painel do profissional após a conclusão. |
| Contestação com anexos | Não feito | A contestação continua só com motivo e detalhes. |

### US45 · Lista de conversas e chat em tempo real

| Critério | Status | Observação |
|---|---|---|
| Mensagem aparece nos dois navegadores sem recarregar | Não feito | Depende do WebSocket do back (US44). Hoje é polling de 3 s em memória (`POLL_INTERVAL_MS`), que não atravessa navegadores. |
| Queda de conexão reconecta e recupera o histórico | Já existia | `chat/[id]/page.tsx`: estado `reconnecting` e recarga do histórico com `getMessages` ao voltar. Não alterado. |
| Conversa de vaga encerrada fica somente leitura com aviso | Já existia | `readOnly` com `jobClosed` e aviso na própria página. Não alterado. |

Tarefas do card:
- Lista de conversas (avatar com selo, última mensagem, não lidas): já existia em `conversation-item.tsx`.
- Tela do chat com WebSocket e reconexão: parcial. Reconexão simulada existe; WebSocket não.
- Cabeçalho com estado da vaga e ações: feito. O estado é derivado do acordo (`rotuloEstadoVaga` em `chat-header.tsx`), porque `ChatJob` não traz estado. Quando a API trouxer o estado, o rótulo deve vir de lá.
- Anexos de imagem e PDF no composer: já existiam. Não alterados.

## 2. Commits

Na ordem:

1. mostra prazo para contestar após a conclusão (US43)
2. prazo da contestação vem do acordo (US43)
3. confirmar conclusão leva o contratante à validação facial (US43)
4. contestação bloqueia a liberação e mostra em análise (US43)
5. observação e anexos na confirmação de conclusão (US43)
6. prazos de 48 h e 72 h na linha do tempo pós-serviço (US43)
7. aviso de pagamento para o profissional após a conclusão (US43)
8. estado da vaga no cabeçalho da conversa (US45)
9. documentação desta branch

Cada commit foi revisado com `tsc` filtrado nos arquivos tocados. Nenhum erro novo.

## 3. O que depende do back

Os valores abaixo estão no mock e precisam vir da API:

- `contestDeadline`, `reviewDeadline`, `autoDecisionDeadline` do acordo.
- Confirmação de conclusão com observação e anexos. O contrato atual não tem corpo para o endpoint de conclusão.
- Conclusão automática após 24 h sem contestação.
- Estado da vaga (hoje derivado do acordo).
- Liberação bloqueada por contestação. Hoje a tela de pagamento lê `getAgreementStatus`, que assume que o id do acordo é o id da vaga. Isso precisa ser confirmado.
- WebSocket de mensagens (US44).

Mocks que precisam ser removidos quando o back existir:
- `MOCK_OTHER_PARTY_AUTO_CONFIRM` em `services/chat.ts`.
- Lógica de `CHAT_USA_MOCKS` nas funções de pós-serviço.

## 4. Onde está o back

O repositório do back não foi localizado nesta sessão.
- O README do front cita "o repositório do back" sem link.
- `JonasGsilva1/api-venue` foi checado em modo leitura e é outro projeto (Venue Intelligence, com módulos de IA e WebSocket). Não tem nenhum endpoint de vagas, conclusão ou pagamento. Não deve ser usado como referência para este trabalho.
- O contrato `contracts/openapi.json` da `develop` tem os endpoints usados aqui, mas sua origem não está confirmada.

Pendente: informar a URL do repositório do back para validar os endpoints e os campos de prazo.

## 5. Verificação

- `npx tsc --noEmit`: 15 erros, iguais aos da `develop`. Estão em `session.tsx` e `mapa-vagas.tsx`, fora do escopo desta entrega. Nenhum erro novo nos arquivos alterados.
- Teste manual sugerido (mock ligado):
  1. Abrir uma conversa com acordo aceito pelas duas partes.
  2. Como contratante, escrever uma observação, anexar um PDF e confirmar. Ver se a tela leva para `/pagamento/[id]?validar=1`.
  3. Como profissional, confirmar e ver o aviso de pagamento e os três prazos.
  4. Contestar e abrir a tela de pagamento: deve aparecer "Em análise" e o botão de selfie deve ficar bloqueado.

## 6. Pendências

- Definir com o back o corpo do endpoint de conclusão (observação e anexos).
- Upload real de anexos (hoje só o nome do arquivo é guardado).
- Implementar o WebSocket (US44) e só então validar a entrega em dois navegadores.
- Confirmar com o card os prazos de 48 h e 72 h.
- Limpar os 15 erros de typecheck da `develop`, fora desta entrega.
