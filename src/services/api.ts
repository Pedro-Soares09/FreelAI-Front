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

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  if (!API_URL) {
    throw new Error("A variável NEXT_PUBLIC_API_URL não foi configurada.");
  }

  const response = await fetch(new URL(path, API_URL), init);

  if (!response.ok) {
    throw new Error(`A requisição falhou com status ${response.status}.`);
  }

  return (await response.json()) as T;
}

// ===== Chat, acordo e pós-serviço (Pessoa 5) =====
// Funções mockadas com atraso simulado. Quando o back estiver pronto,
// trocar o corpo de cada função por apiRequest(...) mantendo a mesma assinatura,
// assim as telas não precisam mudar.

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
  await simulateDelay();
  return structuredClone(chatDb.conversations).sort(
    (a, b) => Date.parse(b.lastMessageAt) - Date.parse(a.lastMessageAt),
  );
}

export async function getConversation(
  conversationId: string,
): Promise<Conversation | null> {
  await simulateDelay();
  const conversation = chatDb.conversations.find((c) => c.id === conversationId);
  return conversation ? structuredClone(conversation) : null;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  await simulateDelay();
  return structuredClone(
    chatDb.messages.filter((m) => m.conversationId === conversationId),
  ).sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
}

export async function markConversationAsRead(conversationId: string): Promise<void> {
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
  conversation.lastMessage = text ?? `📎 ${input.attachment?.name}`;
  conversation.lastMessageAt = message.createdAt;

  return structuredClone(message);
}

// --- Ajuda da IA (mock) ---

export async function getAiSuggestion(conversationId: string): Promise<string> {
  const { contact, job } = findConversation(conversationId);
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

export async function confirmCompletion(agreementId: string): Promise<Agreement> {
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
  addEvent(agreement, `Conclusão confirmada pelo ${iAmHirer ? "contratante" : "profissional"}`);

  if (MOCK_OTHER_PARTY_AUTO_CONFIRM) {
    if (iAmHirer) agreement.completionByWorker = true;
    else agreement.completionByHirer = true;
    addEvent(agreement, "Conclusão confirmada pela outra parte");
  }

  if (agreement.completionByHirer && agreement.completionByWorker) {
    agreement.status = "completed";
    agreement.completedAt = new Date().toISOString();
    addEvent(agreement, "Serviço concluído");
  }
  return structuredClone(agreement);
}

export async function contestAgreement(
  agreementId: string,
  reason: ContestReason,
  details?: string,
): Promise<Agreement> {
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
