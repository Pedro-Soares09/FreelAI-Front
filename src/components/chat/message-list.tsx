import { MessageBubble } from "@/components/chat/message-bubble";
import type { Message } from "@/types";

type MessageListProps = {
  messages: Message[];
  currentUserId: string;
};

export function MessageList({ messages, currentUserId }: MessageListProps) {
  if (messages.length === 0) {
    return <p className="state-box">Nenhuma mensagem ainda. Apresente-se para começar a conversa.</p>;
  }

  return (
    <div className="message-list" aria-live="polite">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          mine={message.senderId === currentUserId}
        />
      ))}
    </div>
  );
}
