"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import ThreadPanel from "./ThreadPanel";
import { useChannelHeader } from "@/lib/hooks/useChannelHeader";
import { useMessages } from "@/lib/hooks/useMessages";
import { useMarkAsRead } from "@/lib/hooks/useMarkAsRead";
import { useTyping } from "@/lib/hooks/useTyping";
import { getSocket } from "@/lib/socket";

export default function ChatWindow({ channelId, onBack, highlightMessageId, onHighlighted }) {
  const { channel, displayName, avatar } = useChannelHeader(channelId);
  const { data: messages } = useMessages(channelId);
  const markAsRead = useMarkAsRead();
  const { typingUsers } = useTyping(channelId);
  const [activeThreadMessage, setActiveThreadMessage] = useState(null);
  const [replyingToMessage, setReplyingToMessage] = useState(null);

  useEffect(() => {
    if (!channelId || !messages?.length) return;
    const lastMessage = messages[messages.length - 1];
    markAsRead.mutate({ channelId, lastReadMessageId: lastMessage._id });
  }, [channelId, messages?.length]);

  useEffect(() => {
    setActiveThreadMessage(null);
    setReplyingToMessage(null);
  }, [channelId]);

  if (!channel) return null;

  return (
    <div className="flex h-full flex-1 overflow-hidden">
      <div className={clsx("flex h-full flex-1 flex-col", activeThreadMessage && "hidden md:flex")}>
        <ChatHeader
          displayName={displayName}
          avatar={avatar}
          channelType={channel.type}
          onBack={onBack}
        />
        <MessageList
          channelId={channelId}
          onOpenThread={setActiveThreadMessage}
          onReply={setReplyingToMessage}
          highlightMessageId={highlightMessageId}
          onHighlighted={onHighlighted}
        />
        <TypingIndicator typingUsers={typingUsers} channel={channel} />
        <MessageInput
          channelId={channelId}
          replyingToMessage={replyingToMessage}
          onCancelReply={() => setReplyingToMessage(null)}
        />
      </div>

      {activeThreadMessage && (
        <div className="flex h-full w-full flex-col border-l border-gray-200 md:w-96">
          <ThreadPanel
            channelId={channelId}
            parentMessage={activeThreadMessage}
            onClose={() => setActiveThreadMessage(null)}
          />
        </div>
      )}
    </div>
  );
}