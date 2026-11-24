"use client";

import { useEffect, useState } from "react";
import { getAiSuggestion, improveText } from "@/services/api";

type AiSuggestionProps = {
  conversationId: string;
  draft: string;
  onUse: (text: string) => void;
};

export function AiSuggestion({ conversationId, draft, onUse }: AiSuggestionProps) {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [improving, setImproving] = useState(false);

  useEffect(() => {
    let active = true;
    getAiSuggestion(conversationId)
      .then((text) => {
        if (active) setSuggestion(text);
      })
      .catch(() => {
        if (active) setError("A IA não respondeu agora.");
      });
    return () => {
      active = false;
    };
  }, [conversationId]);

  async function improve() {
    setImproving(true);
    try {
      onUse(await improveText(draft));
    } finally {
      setImproving(false);
    }
  }

  return (
    <aside className="ai-box" aria-label="Ajuda da IA">
      <strong>Ajuda da IA FREELAÍ</strong>
      {error && <p>{error}</p>}
      {!error && suggestion === null && <p>Gerando sugestão...</p>}
      {suggestion && <p>Sugestão: {suggestion}</p>}
      <div className="ai-actions">
        <button
          type="button"
          className="chip"
          disabled={!suggestion}
          onClick={() => {
            if (suggestion) onUse(suggestion);
          }}
        >
          Usar sugestão
        </button>
        <button
          type="button"
          className="chip"
          disabled={!draft.trim() || improving}
          onClick={() => void improve()}
        >
          {improving ? "Melhorando..." : "Melhorar texto"}
        </button>
      </div>
    </aside>
  );
}
