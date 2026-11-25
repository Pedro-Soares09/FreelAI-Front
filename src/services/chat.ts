import {
  CANCEL_FREE_HOURS,
  CONTEST_REASONS,
  CONTEST_WINDOW_HOURS,
  MAX_ATTACHMENT_MB,
} from "@/lib/constants";
import {
  CURRENT_USER_ID,
  agreements as mockAgreements,
  conversations as mockConversations,
  messages as mockMessages,
  reports as mockReports,
  reviews as mockReviews,
} from "@/mocks/conversations";
import { fetchAutenticado } from "@/api/client";
import { ApiError, erroDeResposta } from "@/api/erro";
import type { components } from "@/api/schema";
import type {
  Agreement,
  AgreementTerms,
  CancellationResult,
  ChatRole,
  ContestReason,
  Conversation,
  Message,
  NewMessage,
  Report,
  ReportReason,
  Review,
  ReviewRating,
} from "@/types";
import { USE_MOCKS } from "@/lib/modo";

// ===== Chat, acordo e pós-serviço (Pessoa 5) =====
// Funções mockadas com atraso simulado. Quando o back estiver pronto,
// trocar o corpo de cada função por apiRequest(...) mantendo a mesma assinatura,
// assim as telas não precisam mudar.

export const CHAT_USA_MOCKS = USE_MOCKS;

/** Chamada autenticada à API real; converte falhas no erro padrão da aplicação. */
async function chamar<T>(caminho: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetchAutenticado(caminho, init);
  } catch {
    throw new ApiError(0, "rede", "Não foi possível conectar ao servidor.");
  }
  if (!res.ok) {
    let corpo: unknown;
    try {
      corpo = await res.json();
    } catch {
      corpo = undefined;
    }
    throw erroDeResposta(res.status, corpo);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

type ConversaApi = components["schemas"]["ConversaResumo"];
type MensagemApi = components["schemas"]["MensagemDetalhe"];

let perfilAtivoCache: string | null = null;

async function perfilAtivo(): Promise<ChatRole> {
  if (!perfilAtivoCache) {
    const eu = await chamar<{ perfil_ativo?: string | null }>("/api/v1/auth/me");
    perfilAtivoCache = eu.perfil_ativo ?? "contratante";
  }
  return perfilAtivoCache === "profissional" ? "profissional" : "contratante";
}

async function conversaDaApi(c: ConversaApi): Promise<Conversation> {
  memorizarVaga(String(c.id), String(c.vaga_id));
  const meuPerfil = await perfilAtivo();
  let titulo = `Vaga ${c.vaga_id}`;
  let valor = 0;
  try {
    const vaga = await chamar<{ titulo: string; valor: number }>(`/api/v1/vagas/${c.vaga_id}`);
    titulo = vaga.titulo;
    valor = vaga.valor;
  } catch {
    // A conversa continua utilizável sem os dados da vaga.
  }
  return {
    id: String(c.id),
    participantIds: [String(c.outra_parte.usuario_id)],
    lastMessage: c.ultima_mensagem?.texto ?? undefined,
    contact: {
      id: String(c.outra_parte.usuario_id),
      name: c.outra_parte.nome,
      avatarUrl: c.outra_parte.foto_url ?? undefined,
      verified: true,
      online: false,
      role: meuPerfil === "profissional" ? "contratante" : "profissional",
      destaque: c.outra_parte.destaque ?? false,
      corDestaque: c.outra_parte.cor_destaque ?? undefined,
    },
    job: { id: String(c.vaga_id), title: titulo, amount: valor },
    lastMessageAt: c.ultima_mensagem?.enviada_em ?? new Date(0).toISOString(),
    unreadCount: c.nao_lidas,
    jobClosed: !c.aberta,
    blocked: c.bloqueada ?? false,
  };
}

function mensagemDaApi(m: MensagemApi): Message {
  return {
    id: String(m.id),
    conversationId: String(m.conversa_id),
    senderId: String(m.autor_id),
    text: m.texto ?? undefined,
    createdAt: m.enviada_em,
    status: m.lida_em ? "seen" : "sent",
  };
}

// --- Acordo, conclusão, disputa, avaliação e denúncia na API real ---
// Na API o acordo é da vaga: o id do acordo no front passa a ser o id da vaga.

type DadosAcordoApi = components["schemas"]["DadosAcordo"];
type PagamentoApi = components["schemas"]["PagamentoDetalhe"];
type AvaliacaoApi = components["schemas"]["AvaliacaoDetalhe"];

const vagaDaConversa = new Map<string, string>();
const conversaDaVaga = new Map<string, string>();

function memorizarVaga(conversaId: string, vagaId: string) {
  vagaDaConversa.set(conversaId, vagaId);
  conversaDaVaga.set(vagaId, conversaId);
}

async function vagaIdDaConversa(conversaId: string): Promise<string> {
  const conhecida = vagaDaConversa.get(conversaId);
  if (conhecida) return conhecida;
  const c = await chamar<ConversaApi>(`/api/v1/conversas/${encodeURIComponent(conversaId)}`);
  memorizarVaga(String(c.id), String(c.vaga_id));
  return String(c.vaga_id);
}

function statusDoAcordo(ambosAceitaram: boolean, estadoVaga: string | null): Agreement["status"] {
  if (estadoVaga === "em_disputa") return "contested";
  if (estadoVaga && ["concluida", "liberada", "liberada_parcial"].includes(estadoVaga)) {
    return "completed";
  }
  if (estadoVaga && ["cancelada", "reembolsada", "falta", "expirada"].includes(estadoVaga)) {
    return "cancelled";
  }
  return ambosAceitaram ? "accepted" : "pending";
}

/** Monta o acordo do front a partir do acordo e do pagamento da vaga; nulo se ninguém aceitou. */
async function acordoDaVaga(vagaId: string): Promise<Agreement | null> {
  let dados: DadosAcordoApi;
  try {
    dados = await chamar<DadosAcordoApi>(`/api/v1/vagas/${encodeURIComponent(vagaId)}/acordo`);
  } catch (erro) {
    if (erro instanceof ApiError && [403, 404, 409].includes(erro.status)) return null;
    throw erro;
  }
  const { contratante, profissional } = dados.aceites;
  if (!contratante && !profissional) return null;

  const ambos = contratante && profissional;
  let pagamento: PagamentoApi | null = null;
  if (ambos) {
    try {
      pagamento = await chamar<PagamentoApi>(
        `/api/v1/vagas/${encodeURIComponent(vagaId)}/pagamento`,
      );
    } catch (erro) {
      if (!(erro instanceof ApiError && erro.status === 404)) throw erro;
    }
  }
  const status = statusDoAcordo(ambos, pagamento?.vaga_estado ?? null);
  const concluido = status === "completed";
  return {
    id: vagaId,
    conversationId: conversaDaVaga.get(vagaId) ?? "",
    jobId: vagaId,
    jobTitle: dados.servico,
    hirerId: String(dados.contratante.usuario_id),
    workerId: String(dados.profissional.usuario_id),
    acceptedByHirer: contratante,
    acceptedByWorker: profissional,
    status,
    createdAt: pagamento?.criado_em ?? dados.inicio_em,
    startsAt: dados.inicio_em,
    duration: `${dados.duracao_minutos / 60} h`,
    dressCode: dados.vestimenta ?? "",
    paymentDate: pagamento?.expira_em ?? "",
    duties: dados.escopo,
    amount: Number(dados.valor_total),
    completionByHirer: concluido,
    completionByWorker: concluido,
    completedAt: concluido ? (pagamento?.atualizado_em ?? undefined) : undefined,
    events: [],
  };
}

function avaliacaoDaApi(a: AvaliacaoApi, acordoId: string): Review {
  return {
    id: String(a.id),
    agreementId: acordoId,
    authorId: String(a.avaliador_id),
    targetId: String(a.avaliado_id),
    rating: a.nota as ReviewRating,
    comment: a.comentario ?? undefined,
    createdAt: a.criado_em,
  };
}

const simulateDelay = (ms = 400) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

// Cópia em memória: as alterações (mensagens enviadas, acordos) duram
// até recarregar a página.
const chatDb = {
  conversations: structuredClone(mockConversations),
  messages: structuredClone(mockMessages),
  agreements: structuredClone(mockAgreements),
  reviews: structuredClone(mockReviews),
  reports: structuredClone(mockReports),
};

function findConversation(conversationId: string): Conversation {
  const conversation = chatDb.conversations.find((c) => c.id === conversationId);
  if (!conversation) throw new Error("Conversa não encontrada.");
  return conversation;
}

function findAgreement(agreementId: string): Agreement {
  const agreement = chatDb.agreements.find((a) => a.id === agreementId);
  if (!agreement) throw new Error("Acordo não encontrado.");
  return agreement;
}

/** Papel do usuário logado na conversa (o oposto do contato). */
export function getMyRole(conversation: Conversation): ChatRole {
  return conversation.contact.role === "contratante" ? "profissional" : "contratante";
}

// --- Conversas e mensagens ---

export async function getConversations(): Promise<Conversation[]> {
  if (!CHAT_USA_MOCKS) {
    const lista = await chamar<ConversaApi[]>("/api/v1/conversas");
    return Promise.all(lista.map(conversaDaApi));
  }
  await simulateDelay();
  return structuredClone(chatDb.conversations).sort(
    (a, b) => Date.parse(b.lastMessageAt) - Date.parse(a.lastMessageAt),
  );
}

export async function getConversation(
  conversationId: string,
): Promise<Conversation | null> {
  if (!CHAT_USA_MOCKS) {
    try {
      return await conversaDaApi(
        await chamar<ConversaApi>(`/api/v1/conversas/${encodeURIComponent(conversationId)}`),
      );
    } catch (erro) {
      if (erro instanceof ApiError && erro.status === 404) return null;
      throw erro;
    }
  }
  await simulateDelay();
  const conversation = chatDb.conversations.find((c) => c.id === conversationId);
  return conversation ? structuredClone(conversation) : null;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  if (!CHAT_USA_MOCKS) {
    const lista = await chamar<MensagemApi[]>(
      `/api/v1/conversas/${encodeURIComponent(conversationId)}/mensagens`,
    );
    return lista.map(mensagemDaApi);
  }
  await simulateDelay();
  return structuredClone(
    chatDb.messages.filter((m) => m.conversationId === conversationId),
  ).sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
}

export async function markConversationAsRead(conversationId: string): Promise<void> {
  if (!CHAT_USA_MOCKS) {
    await chamar<void>(`/api/v1/conversas/${encodeURIComponent(conversationId)}/visto`, {
      method: "POST",
    });
    return;
  }
  await simulateDelay(150);
  findConversation(conversationId).unreadCount = 0;
}

export async function sendMessage(
  conversationId: string,
  input: NewMessage,
): Promise<Message> {
  const text = input.text?.trim();
  if (!text && !input.attachment) {
    throw new Error("Digite uma mensagem ou anexe um arquivo.");
  }
  if (input.attachment && input.attachment.sizeBytes > MAX_ATTACHMENT_MB * 1024 * 1024) {
    throw new Error(`O arquivo deve ter no máximo ${MAX_ATTACHMENT_MB} MB.`);
  }

  if (!CHAT_USA_MOCKS) {
    if (input.attachment) throw new Error("O envio de anexos ainda não está disponível.");
    return mensagemDaApi(
      await chamar<MensagemApi>(`/api/v1/conversas/${encodeURIComponent(conversationId)}/mensagens`, {
        method: "POST",
        body: JSON.stringify({ texto: text }),
      }),
    );
  }

  const conversation = findConversation(conversationId);
  await simulateDelay(input.attachment ? 900 : 300);

  const message: Message = {
    id: newId("m"),
    conversationId,
    senderId: CURRENT_USER_ID,
    text,
    attachment: input.attachment
      ? { ...input.attachment, id: newId("f"), status: "sent" }
      : undefined,
    createdAt: new Date().toISOString(),
    status: "sent",
  };

  chatDb.messages.push(message);
  conversation.lastMessage = text ?? `Anexo: ${input.attachment?.name}`;
  conversation.lastMessageAt = message.createdAt;

  return structuredClone(message);
}

// --- Ajuda da IA (mock) ---

export async function getAiSuggestion(conversationId: string): Promise<string> {
  const conversation = CHAT_USA_MOCKS
    ? findConversation(conversationId)
    : await getConversation(conversationId);
  if (!conversation) throw new Error("Conversa não encontrada.");
  const { contact, job } = conversation;
  await simulateDelay(700);
  return `Olá, ${contact.name}! Tenho disponibilidade e experiência para a vaga "${job.title}". Podemos alinhar horário e detalhes?`;
}

export async function improveText(text: string): Promise<string> {
  await simulateDelay(700);
  const clean = text.trim().replace(/\s+/g, " ");
  if (!clean) return clean;
  const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

// --- Acordo ---

export async function getAgreementByConversation(
  conversationId: string,
): Promise<Agreement | null> {
  if (!CHAT_USA_MOCKS) return acordoDaVaga(await vagaIdDaConversa(conversationId));
  await simulateDelay();
  const agreement = chatDb.agreements.find(
    (a) => a.conversationId === conversationId && a.status !== "cancelled",
  );
  return agreement ? structuredClone(agreement) : null;
}

/** Quem propõe já dá ciência dos termos; falta a outra parte aceitar. */
export async function proposeAgreement(
  conversationId: string,
  terms: AgreementTerms,
): Promise<Agreement> {
  const conversation = findConversation(conversationId);
  const active = chatDb.agreements.find(
    (a) => a.conversationId === conversationId && a.status !== "cancelled",
  );
  if (active) throw new Error("Já existe um acordo ativo nesta conversa.");

  await simulateDelay();
  const iAmHirer = getMyRole(conversation) === "contratante";

  const agreement: Agreement = {
    ...terms,
    id: newId("a"),
    conversationId,
    jobId: conversation.job.id,
    jobTitle: conversation.job.title,
    hirerId: iAmHirer ? CURRENT_USER_ID : conversation.contact.id,
    workerId: iAmHirer ? conversation.contact.id : CURRENT_USER_ID,
    acceptedByHirer: iAmHirer,
    acceptedByWorker: !iAmHirer,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  chatDb.agreements.push(agreement);
  conversation.agreementId = agreement.id;
  return structuredClone(agreement);
}

/** Ciência dos termos pelo usuário logado. Com as duas partes, vira "accepted". */
export async function acceptAgreement(agreementId: string): Promise<Agreement> {
  const agreement = findAgreement(agreementId);
  if (agreement.status !== "pending") {
    throw new Error("Este acordo não está aguardando aceite.");
  }

  await simulateDelay();
  if (agreement.hirerId === CURRENT_USER_ID) agreement.acceptedByHirer = true;
  if (agreement.workerId === CURRENT_USER_ID) agreement.acceptedByWorker = true;
  if (agreement.acceptedByHirer && agreement.acceptedByWorker) {
    agreement.status = "accepted";
  }
  return structuredClone(agreement);
}

/** Regra da Política do App: sem taxa até 12h antes do início. */
export function isFreeCancellation(startsAt: string, now = new Date()): boolean {
  const hoursUntilStart = (Date.parse(startsAt) - now.getTime()) / (60 * 60 * 1000);
  return hoursUntilStart >= CANCEL_FREE_HOURS;
}

export async function cancelAgreement(
  agreementId: string,
): Promise<CancellationResult> {
  const agreement = findAgreement(agreementId);
  if (agreement.status !== "pending" && agreement.status !== "accepted") {
    throw new Error("Este acordo não pode mais ser cancelado.");
  }

  await simulateDelay();
  const now = new Date();
  const freeOfCharge = isFreeCancellation(agreement.startsAt, now);
  agreement.status = "cancelled";
  agreement.cancelledAt = now.toISOString();

  const conversation = chatDb.conversations.find((c) => c.id === agreement.conversationId);
  if (conversation) conversation.agreementId = undefined;

  return { agreement: structuredClone(agreement), freeOfCharge };
}

/** Marca o serviço como concluído (libera a avaliação). */
export async function completeAgreement(agreementId: string): Promise<Agreement> {
  const agreement = findAgreement(agreementId);
  if (agreement.status !== "accepted") {
    throw new Error("Só é possível concluir um acordo aceito pelas duas partes.");
  }
  await simulateDelay();
  agreement.status = "completed";
  return structuredClone(agreement);
}

// --- Avaliação e denúncia ---

export async function getMyReview(agreementId: string): Promise<Review | null> {
  if (!CHAT_USA_MOCKS) {
    try {
      const dados = await chamar<{ minha_avaliacao?: AvaliacaoApi | null }>(
        `/api/v1/vagas/${encodeURIComponent(agreementId)}/avaliacoes`,
      );
      return dados.minha_avaliacao ? avaliacaoDaApi(dados.minha_avaliacao, agreementId) : null;
    } catch (erro) {
      if (erro instanceof ApiError && [403, 404, 409].includes(erro.status)) return null;
      throw erro;
    }
  }
  await simulateDelay(200);
  const review = chatDb.reviews.find(
    (r) => r.agreementId === agreementId && r.authorId === CURRENT_USER_ID,
  );
  return review ? structuredClone(review) : null;
}

export async function submitReview(
  agreementId: string,
  rating: ReviewRating,
  comment?: string,
): Promise<Review> {
  if (!CHAT_USA_MOCKS) {
    const criada = await chamar<AvaliacaoApi>(
      `/api/v1/vagas/${encodeURIComponent(agreementId)}/avaliacoes`,
      {
        method: "POST",
        body: JSON.stringify({ nota: rating, comentario: comment?.trim() || null }),
      },
    );
    return avaliacaoDaApi(criada, agreementId);
  }
  const agreement = findAgreement(agreementId);
  if (agreement.status !== "completed") {
    throw new Error("A avaliação fica disponível após o serviço ser concluído.");
  }
  if (chatDb.reviews.some((r) => r.agreementId === agreementId && r.authorId === CURRENT_USER_ID)) {
    throw new Error("Você já avaliou este serviço.");
  }

  await simulateDelay();
  const review: Review = {
    id: newId("r"),
    agreementId,
    authorId: CURRENT_USER_ID,
    targetId:
      agreement.hirerId === CURRENT_USER_ID ? agreement.workerId : agreement.hirerId,
    rating,
    comment: comment?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  chatDb.reviews.push(review);
  return structuredClone(review);
}

export async function reportConversation(
  conversationId: string,
  reason: ReportReason,
  details?: string,
): Promise<Report> {
  if (!CHAT_USA_MOCKS) {
    const criada = await chamar<{ id: number; criado_em: string }>("/api/v1/denuncias", {
      method: "POST",
      body: JSON.stringify({
        conversa_id: Number(conversationId),
        motivo: reason,
        descricao: details?.trim() || null,
      }),
    });
    return {
      id: String(criada.id),
      conversationId,
      reporterId: "",
      reason,
      details: details?.trim() || undefined,
      createdAt: criada.criado_em,
    };
  }
  findConversation(conversationId);
  await simulateDelay();
  const report: Report = {
    id: newId("d"),
    conversationId,
    reporterId: CURRENT_USER_ID,
    reason,
    details: details?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
  chatDb.reports.push(report);
  return structuredClone(report);
}

// --- Pós-serviço: conclusão, contestação e linha do tempo (US43) ---

/**
 * Mock: enquanto o back não existe, a outra parte confirma a conclusão
 * sozinha logo depois da nossa confirmação, para o fluxo ser testável.
 * Remover quando o back enviar a confirmação real.
 */
const MOCK_OTHER_PARTY_AUTO_CONFIRM = true;

function addEvent(agreement: Agreement, label: string) {
  agreement.events = [
    ...(agreement.events ?? []),
    { id: newId("e"), at: new Date().toISOString(), label },
  ];
}

export function getAgreementEvents(agreement: Agreement) {
  return [...(agreement.events ?? [])].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
}

export function canContest(agreement: Agreement, now = new Date()): boolean {
  if (agreement.status === "accepted") return true;
  if (agreement.status !== "completed" || !agreement.completedAt) return false;
  const hours = (now.getTime() - Date.parse(agreement.completedAt)) / (60 * 60 * 1000);
  return hours <= CONTEST_WINDOW_HOURS;
}

/**
 * Confirma a conclusão. `detalhes` (texto e nomes dos anexos) só é guardado no mock:
 * o endpoint POST /api/v1/vagas/{id}/conclusao do contrato não tem corpo, então a API
 * ignora esses campos até o back ganhar um corpo para a confirmação.
 */
export async function confirmCompletion(
  agreementId: string,
  detalhes?: { texto?: string; anexos?: string[] },
): Promise<Agreement> {
  if (!CHAT_USA_MOCKS) {
    await chamar<unknown>(`/api/v1/vagas/${encodeURIComponent(agreementId)}/conclusao`, {
      method: "POST",
    });
    const atual = await acordoDaVaga(agreementId);
    if (!atual) throw new Error("Acordo não encontrado.");
    return atual;
  }
  const agreement = findAgreement(agreementId);
  if (agreement.status !== "accepted") {
    throw new Error("Só é possível confirmar a conclusão de um acordo aceito pelas duas partes.");
  }
  const iAmHirer = agreement.hirerId === CURRENT_USER_ID;
  if (iAmHirer ? agreement.completionByHirer : agreement.completionByWorker) {
    throw new Error("Você já confirmou a conclusão.");
  }

  await simulateDelay();
  if (iAmHirer) agreement.completionByHirer = true;
  else agreement.completionByWorker = true;
  if (detalhes?.texto?.trim()) agreement.completionNote = detalhes.texto.trim();
  if (detalhes?.anexos?.length) agreement.completionAttachments = [...detalhes.anexos];
  addEvent(agreement, `Conclusão confirmada pelo ${iAmHirer ? "contratante" : "profissional"}`);

  if (MOCK_OTHER_PARTY_AUTO_CONFIRM) {
    if (iAmHirer) agreement.completionByWorker = true;
    else agreement.completionByHirer = true;
    addEvent(agreement, "Conclusão confirmada pela outra parte");
  }

  if (agreement.completionByHirer && agreement.completionByWorker) {
    agreement.status = "completed";
    agreement.completedAt = new Date().toISOString();
    const concluidoEm = Date.parse(agreement.completedAt);
    agreement.contestDeadline = new Date(concluidoEm + CONTEST_WINDOW_HOURS * 60 * 60 * 1000).toISOString();
    // Regra da tela de pagamento: revisão em 48 h; após 72 h, decisão automática.
    agreement.reviewDeadline = new Date(concluidoEm + 48 * 60 * 60 * 1000).toISOString();
    agreement.autoDecisionDeadline = new Date(concluidoEm + 72 * 60 * 60 * 1000).toISOString();
    addEvent(agreement, "Serviço concluído");
  }
  return structuredClone(agreement);
}

/** Estado atual do acordo de uma vaga (usado pela tela de pagamento). */
export async function getAgreementStatus(agreementId: string): Promise<Agreement | null> {
  if (!CHAT_USA_MOCKS) return acordoDaVaga(agreementId);
  try {
    return structuredClone(findAgreement(agreementId));
  } catch {
    return null;
  }
}

export async function contestAgreement(
  agreementId: string,
  reason: ContestReason,
  details?: string,
): Promise<Agreement> {
  if (!CHAT_USA_MOCKS) {
    const motivo = CONTEST_REASONS.find((r) => r.value === reason)?.label ?? reason;
    const descricao = details?.trim() ? `${motivo}: ${details.trim()}` : motivo;
    await chamar<unknown>(`/api/v1/vagas/${encodeURIComponent(agreementId)}/disputa`, {
      method: "POST",
      body: JSON.stringify({ descricao }),
    });
    const atual = await acordoDaVaga(agreementId);
    if (!atual) throw new Error("Acordo não encontrado.");
    return atual;
  }
  const agreement = findAgreement(agreementId);
  if (!canContest(agreement)) {
    throw new Error(
      agreement.status === "completed"
        ? `O prazo de ${CONTEST_WINDOW_HOURS}h para contestar terminou.`
        : "Só é possível contestar um serviço aceito ou concluído.",
    );
  }

  await simulateDelay();
  const label = CONTEST_REASONS.find((r) => r.value === reason)?.label ?? reason;
  agreement.status = "contested";
  agreement.contestedAt = new Date().toISOString();
  agreement.contestReason = reason;
  agreement.contestDetails = details?.trim() || undefined;
  addEvent(agreement, `Serviço contestado: ${label}`);
  return structuredClone(agreement);
}

// --- Avaliação e reputação exibidas no perfil (US56) ---

export type ReviewSummary = {
  /** Média das notas recebidas; null quando ainda não há avaliações. */
  average: number | null;
  total: number;
  reviews: Review[];
};

/** Avaliações recebidas por um usuário, com média para o perfil público. */
export async function getReviewsFor(userId: string): Promise<ReviewSummary> {
  if (!CHAT_USA_MOCKS) {
    const [lista, reputacao] = await Promise.all([
      chamar<AvaliacaoApi[]>(`/api/v1/usuarios/${encodeURIComponent(userId)}/avaliacoes`),
      chamar<{ nota_media?: number | null; total_avaliacoes: number }>(
        `/api/v1/usuarios/${encodeURIComponent(userId)}/reputacao`,
      ),
    ]);
    return {
      average: reputacao.nota_media ?? null,
      total: reputacao.total_avaliacoes,
      reviews: lista.map((a) => avaliacaoDaApi(a, String(a.vaga_id))),
    };
  }
  await simulateDelay(250);
  const reviews = chatDb.reviews
    .filter((r) => r.targetId === userId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const average = reviews.length
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : null;
  return { average, total: reviews.length, reviews: structuredClone(reviews) };
}
