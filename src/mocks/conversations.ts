import type {
  Agreement,
  Conversation,
  Message,
  Report,
  Review,
} from "@/types";

/**
 * Usuário logado nos mocks do chat (profissional).
 * Trocar pelo usuário da sessão (lib/session.ts) quando o login estiver pronto.
 */
export const CURRENT_USER_ID = "u-lucas";

// Datas relativas ao momento atual, para os cenários continuarem válidos
// em qualquer dia de teste (ex.: regra de cancelamento de 12h).
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const minutesAgo = (m: number) => new Date(Date.now() - m * MINUTE).toISOString();
const hoursFromNow = (h: number) => new Date(Date.now() + h * HOUR).toISOString();

function tomorrowAt(hour: number): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

export const conversations: Conversation[] = [
  // Cenário 1: conversa em andamento, ainda sem acordo → testar "Fechar acordo"
  {
    id: "c-1",
    participantIds: [CURRENT_USER_ID, "u-maria"],
    contact: {
      id: "u-maria",
      name: "Maria",
      verified: true,
      online: true,
      role: "contratante",
    },
    job: { id: "j-garcom", title: "Precisa de Garçom", amount: 120 },
    lastMessage: "📎 curriculo-garcom.pdf",
    lastMessageAt: minutesAgo(2),
    unreadCount: 0,
  },
  // Cenário 2: acordo proposto pelo contratante, aguardando o profissional;
  // serviço começa em menos de 12h → cancelamento com taxa
  {
    id: "c-2",
    participantIds: [CURRENT_USER_ID, "u-carlos"],
    contact: {
      id: "u-carlos",
      name: "Carlos",
      verified: true,
      online: false,
      role: "contratante",
    },
    job: { id: "j-mudanca", title: "Auxiliar em mudança", amount: 150 },
    lastMessage: "Mandei o acordo, confere aí os detalhes.",
    lastMessageAt: minutesAgo(35),
    unreadCount: 2,
    agreementId: "a-2",
  },
  // Cenário 3: serviço concluído → testar avaliação
  {
    id: "c-3",
    participantIds: [CURRENT_USER_ID, "u-ana"],
    contact: {
      id: "u-ana",
      name: "Ana",
      verified: false,
      online: false,
      role: "contratante",
    },
    job: { id: "j-moveis", title: "Montagem de móveis", amount: 100 },
    lastMessage: "Obrigada, ficou ótimo!",
    lastMessageAt: minutesAgo(26 * 60),
    unreadCount: 0,
    agreementId: "a-3",
    jobClosed: true,
  },
];

export const messages: Message[] = [
  // c-1 (texto da tela de referência do chat)
  {
    id: "m-1",
    conversationId: "c-1",
    senderId: CURRENT_USER_ID,
    text: "Olá, Maria! Vi seu anúncio para garçom. Tenho disponibilidade imediata e experiência em eventos corporativos.",
    createdAt: minutesAgo(10),
    status: "seen",
  },
  {
    id: "m-2",
    conversationId: "c-1",
    senderId: "u-maria",
    text: "Oi! Ótimo, qual sua experiência? Precisa ser amanhã às 18h, evento para 50 pessoas.",
    createdAt: minutesAgo(9),
    status: "seen",
  },
  {
    id: "m-3",
    conversationId: "c-1",
    senderId: CURRENT_USER_ID,
    attachment: {
      id: "f-1",
      kind: "pdf",
      name: "curriculo-garcom.pdf",
      sizeBytes: 48_128,
      status: "sent",
    },
    createdAt: minutesAgo(2),
    status: "delivered",
  },

  // c-2
  {
    id: "m-4",
    conversationId: "c-2",
    senderId: CURRENT_USER_ID,
    text: "Boa tarde, Carlos! Posso ajudar na mudança, tenho experiência com carga e descarga.",
    createdAt: minutesAgo(90),
    status: "seen",
  },
  {
    id: "m-5",
    conversationId: "c-2",
    senderId: "u-carlos",
    text: "Fechado! Começa hoje à noite, é no 3º andar sem elevador.",
    createdAt: minutesAgo(40),
    status: "delivered",
  },
  {
    id: "m-6",
    conversationId: "c-2",
    senderId: "u-carlos",
    text: "Mandei o acordo, confere aí os detalhes.",
    createdAt: minutesAgo(35),
    status: "delivered",
  },

  // c-3
  {
    id: "m-7",
    conversationId: "c-3",
    senderId: CURRENT_USER_ID,
    text: "Montagem finalizada! O guarda-roupa e a cômoda estão prontos.",
    createdAt: minutesAgo(27 * 60),
    status: "seen",
  },
  {
    id: "m-8",
    conversationId: "c-3",
    senderId: "u-ana",
    text: "Obrigada, ficou ótimo!",
    createdAt: minutesAgo(26 * 60),
    status: "seen",
  },
];

export const agreements: Agreement[] = [
  {
    id: "a-2",
    conversationId: "c-2",
    jobId: "j-mudanca",
    jobTitle: "Auxiliar em mudança",
    hirerId: "u-carlos",
    workerId: CURRENT_USER_ID,
    startsAt: hoursFromNow(6),
    duration: "5 horas",
    dressCode: "Roupa confortável e tênis fechado",
    paymentDate: tomorrowAt(12),
    duties: "Carregar caixas e móveis até o caminhão e organizar no destino.",
    amount: 150,
    acceptedByHirer: true,
    acceptedByWorker: false,
    status: "pending",
    createdAt: minutesAgo(35),
  },
  {
    id: "a-3",
    conversationId: "c-3",
    jobId: "j-moveis",
    jobTitle: "Montagem de móveis",
    hirerId: "u-ana",
    workerId: CURRENT_USER_ID,
    startsAt: minutesAgo(30 * 60),
    duration: "3 horas",
    dressCode: "Livre",
    paymentDate: minutesAgo(26 * 60),
    duties: "Montar guarda-roupa de 6 portas e cômoda.",
    amount: 100,
    acceptedByHirer: true,
    acceptedByWorker: true,
    status: "completed",
    createdAt: minutesAgo(48 * 60),
  },
];

export const reviews: Review[] = [];

export const reports: Report[] = [];
