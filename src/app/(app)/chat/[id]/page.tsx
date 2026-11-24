"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { AgreementModal } from "@/components/chat/agreement-modal";
import { AiSuggestion } from "@/components/chat/ai-suggestion";
import { ChatHeader } from "@/components/chat/chat-header";
import { Composer } from "@/components/chat/composer";
import { MessageList } from "@/components/chat/message-list";
import { PostServicePanel } from "@/components/chat/post-service-panel";
import { ReportModal } from "@/components/chat/report-modal";
import { useSessao } from "@/lib/session";
import { CURRENT_USER_ID } from "@/mocks/conversations";
import {
  getAgreementByConversation,
  getConversation,
  getMessages,
  getMyRole,
  markConversationAsRead,
  CHAT_USA_MOCKS,
} from "@/services/api";
import type { Agreement, Conversation, Message } from "@/types";

const POLL_INTERVAL_MS = 3000;

type ConversationPageProps = {
  params: Promise<{ id: string }>;
};

export default function ConversationPage({ params }: ConversationPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { usuario } = useSessao();
  const idDoUsuario = CHAT_USA_MOCKS ? CURRENT_USER_ID : String(usuario?.id ?? "");
  // undefined = carregando, null = não encontrada
  const [conversation, setConversation] = useState<Conversation | null | undefined>(undefined);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [connection, setConnection] = useState<"online" | "reconnecting">("online");
  const [draft, setDraft] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [agreementOpen, setAgreementOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  // Carrega a conversa e marca como lida.
  useEffect(() => {
    let active = true;
    getConversation(id)
      .then(async (found) => {
        if (!active) return;
        setConversation(found);
        if (found) await markConversationAsRead(id);
      })
      .catch((err: Error) => {
        if (active) setLoadError(err.message);
      });
    return () => {
      active = false;
    };
  }, [id]);

  // "Tempo real" simulado: busca o histórico a cada 3s. Se falhar, mostra
  // "Reconectando..." e tenta de novo; ao voltar, o histórico é recuperado.
  useEffect(() => {
    if (!conversation) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function poll() {
      try {
        const [fresh, currentAgreement] = await Promise.all([
          getMessages(id),
          getAgreementByConversation(id),
        ]);
        if (!active) return;
        setMessages(fresh);
        setAgreement(currentAgreement);
        setConnection("online");
      } catch {
        if (active) setConnection("reconnecting");
      } finally {
        if (active) timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }

    void poll();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [id, conversation]);

  if (loadError) {
    return (
      <section className="page">
        <div role="alert" className="state-box">
          <p>Não foi possível abrir a conversa. {loadError}</p>
        </div>
      </section>
    );
  }

  if (conversation === undefined) {
    return (
      <section className="page">
        <p className="state-box" aria-live="polite">
          Carregando conversa...
        </p>
      </section>
    );
  }

  if (conversation === null) {
    return (
      <section className="page">
        <div className="state-box">
          <p>Esta conversa não existe ou foi removida.</p>
          <Link href="/chat">Voltar para as conversas</Link>
        </div>
      </section>
    );
  }

  const readOnly = Boolean(conversation.jobClosed);
  const iAmWorker = getMyRole(conversation) === "profissional";
  // Acordo cancelado não bloqueia uma nova proposta.
  const activeAgreement = agreement && agreement.status !== "cancelled" ? agreement : null;
  const canOpenAgreement = !readOnly && (!activeAgreement || activeAgreement.status === "pending");
  const waitingPayment = activeAgreement?.status === "accepted" && iAmWorker;

  return (
    <section className="chat-screen">
      <ChatHeader
        conversation={conversation}
        connection={connection}
        onAgreementClick={
          canOpenAgreement
            ? () =>
                CHAT_USA_MOCKS
                  ? setAgreementOpen(true)
                  : router.push(`/acordo/${conversation.job.id}`)
            : undefined
        }
        onReportClick={() => setReportOpen(true)}
      />

      {reportOpen && (
        <ReportModal conversationId={id} onClose={() => setReportOpen(false)} />
      )}

      {waitingPayment && (
        <p role="status" className="state-box">
          Acordo aceito pelas duas partes. Aguardando pagamento do contratante.
        </p>
      )}

      {readOnly && (
        <p role="status" className="state-box">
          Esta vaga foi encerrada. A conversa está somente leitura.
        </p>
      )}

      {activeAgreement && activeAgreement.status !== "pending" && (
        <PostServicePanel
          conversation={conversation}
          agreement={activeAgreement}
          iAmHirer={!iAmWorker}
          onChanged={setAgreement}
        />
      )}

      {messages === null ? (
        <p className="state-box" aria-live="polite">
          Carregando mensagens...
        </p>
      ) : (
        <MessageList messages={messages} currentUserId={idDoUsuario} />
      )}

      {agreementOpen && (
        <AgreementModal
          conversation={conversation}
          agreement={activeAgreement}
          onClose={() => setAgreementOpen(false)}
          onChanged={setAgreement}
        />
      )}

      {!readOnly && (
        <>
          <AiSuggestion conversationId={id} draft={draft} onUse={setDraft} />
          <Composer
            conversationId={id}
            text={draft}
            onTextChange={setDraft}
            onSent={(message) => setMessages((current) => [...(current ?? []), message])}
          />
        </>
      )}
    </section>
  );
}
