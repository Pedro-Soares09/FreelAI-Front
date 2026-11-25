"use client";

import { useCallback, useEffect, useState } from "react";
import { ConversationItem } from "@/components/chat/conversation-item";
import { getConversations } from "@/services/api";
import type { Conversation } from "@/types";

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    getConversations()
      .then(setConversations)
      .catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="page">
      <h1>Conversas</h1>

      {error && (
        <div role="alert" className="state-box">
          <p>Não foi possível carregar suas conversas. {error}</p>
          <button type="button" onClick={load}>
            Tentar de novo
          </button>
        </div>
      )}

      {!error && conversations === null && (
        <p className="state-box" aria-live="polite">
          Carregando conversas...
        </p>
      )}

      {!error && conversations?.length === 0 && (
        <div className="state-box">
          <p>Suas conversas aparecerão aqui quando você se candidatar a uma vaga.</p>
        </div>
      )}

      {conversations && conversations.length > 0 && (
        <ul className="conversation-list tema-chat rounded-card bg-bg p-3">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <ConversationItem conversation={conversation} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
