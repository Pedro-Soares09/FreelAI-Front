import Link from "next/link";
import { AvatarVerified } from "@/components/shared/avatar-verified";
import { formatChatDate } from "@/lib/format";
import type { Conversation } from "@/types";

export function ConversationItem({ conversation }: { conversation: Conversation }) {
  const { id, contact, job, lastMessage, lastMessageAt, unreadCount, jobClosed } =
    conversation;

  return (
    <Link href={`/chat/${id}`} className="conversation-item">
      <AvatarVerified
        name={contact.name}
        imageUrl={contact.avatarUrl}
        verified={contact.verified}
      />
      <div className="conversation-body">
        <strong>{job.title}</strong>
        <span>{lastMessage ?? "Sem mensagens ainda"}</span>
        {jobClosed && <small>Vaga encerrada</small>}
      </div>
      <div className="conversation-meta">
        <time dateTime={lastMessageAt}>{formatChatDate(lastMessageAt)}</time>
        {unreadCount > 0 && (
          <span className="unread-badge" aria-label={`${unreadCount} mensagens não lidas`}>
            {unreadCount}
          </span>
        )}
      </div>
    </Link>
  );
}
