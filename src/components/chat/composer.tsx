"use client";

import { useRef, useState } from "react";
import { ApiError } from "@/api/erro";
import { MAX_ATTACHMENT_MB } from "@/lib/constants";
import { sendMessage } from "@/services/api";
import type { Message } from "@/types";

type ComposerProps = {
  conversationId: string;
  text: string;
  onTextChange: (text: string) => void;
  onSent: (message: Message) => void;
  /** Chamado quando o back recusa o envio porque o chat foi bloqueado. */
  onBlocked?: () => void;
};

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

export function Composer({ conversationId, text, onTextChange, onSent, onBlocked }: ComposerProps) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function submitText() {
    setSending(true);
    setError(null);
    try {
      const message = await sendMessage(conversationId, { text });
      onTextChange("");
      onSent(message);
    } catch (err) {
      if (err instanceof ApiError && err.codigo === "conversa_bloqueada") onBlocked?.();
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  async function submitFile(file: File) {
    setSending(true);
    setError(null);
    try {
      const message = await sendMessage(conversationId, {
        attachment: {
          kind: file.type === "application/pdf" ? "pdf" : "image",
          name: file.name,
          sizeBytes: file.size,
        },
      });
      onSent(message);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Envie um PDF ou uma imagem (JPG, PNG ou WEBP).");
      return;
    }
    if (file.size > MAX_ATTACHMENT_MB * 1024 * 1024) {
      setError(`O arquivo deve ter no máximo ${MAX_ATTACHMENT_MB} MB.`);
      return;
    }
    void submitFile(file);
  }

  return (
    <form
      className="composer"
      onSubmit={(event) => {
        event.preventDefault();
        if (text.trim()) void submitText();
      }}
    >
      {error && (
        <p role="alert" className="connection-warning">
          {error}
        </p>
      )}
      <div className="composer-row">
        <button
          type="button"
          className="chip"
          onClick={() => fileInput.current?.click()}
          disabled={sending}
        >
          Anexar
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/pdf,image/*"
          hidden
          onChange={(event) => {
            handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <label className="sr-only" htmlFor="message-input">
          Digite sua mensagem
        </label>
        <input
          id="message-input"
          type="text"
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={sending}
        />
        <button type="submit" disabled={sending || !text.trim()}>
          {sending ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </form>
  );
}
