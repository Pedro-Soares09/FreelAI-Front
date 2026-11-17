"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { AiSuggestion } from "@/components/chat/ai-suggestion";
import { ChatHeader } from "@/components/chat/chat-header";
import { Composer } from "@/components/chat/composer";
import { MessageList } from "@/components/chat/message-list";
import { CURRENT_USER_ID } from "@/mocks/conversations";
import { getConversation, getMessages, markConversationAsRead } from "@/services/api";
import type { Conversation, Message } from "@/types";

const POLL_INTERVAL_MS = 3000;

type ConversationPageProps = {
  params: Promise<{ id: string }>;
};

export default function ConversationPage({ params }: ConversationPageProps) {
  const { id } = use(params);
  // undefined = carregando, null = não encontrada
  const [conversation, setConversation] = useState<Conversation | null | undefined>(undefined);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [connection, setConnection] = useState<"online" | "reconnecting">("online");
  const [draft, setDraft] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

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
        const fresh = await getMessages(id);
        if (!active) return;
        setMessages(fresh);
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

  return (
    <section className="chat-screen">
      <ChatHeader conversation={conversation} connection={connection} />

      {readOnly && (
        <p role="status" className="state-box">
          Esta vaga foi encerrada. A conversa está somente leitura.
        </p>
      )}

      {messages === null ? (
        <p className="state-box" aria-live="polite">
          Carregando mensagens...
        </p>
      ) : (
        <MessageList messages={messages} currentUserId={CURRENT_USER_ID} />
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
