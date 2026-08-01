"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useMessages } from "@/lib/hooks/useMessages";
import { useAuth } from "@/lib/hooks/useAuth";
import MessageBubble from "./MessageBubble";

export default function MessageList({ channelId, onReply, onOpenThread, highlightMessageId, onHighlighted }) {
  const { data: messages, isLoading, isError } = useMessages(channelId);
  const { user } = useAuth();
  const bottomRef = useRef(null);
  const messageRefs = useRef({});
  const [flashId, setFlashId] = useState(null);

  useEffect(() => {
    if (!highlightMessageId) return;
    const el = messageRefs.current[highlightMessageId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setFlashId(highlightMessageId);
      const timeout = setTimeout(() => {
        setFlashId(null);
        onHighlighted?.();
      }, 1800);
      return () => clearTimeout(timeout);
    }
    // not in the currently loaded batch (pagination isn't built yet — see note below)
    onHighlighted?.();
  }, [highlightMessageId]);

  useEffect(() => {
    if (!highlightMessageId) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-red-500">Couldn&apos;t load messages.</p>
      </div>
    );
  }

  if (!messages?.length) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-400">No messages yet. Say hi 👋</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
      {messages.map((message, i) => {
        const isOwn = message.senderId?._id === user?.id;
        const prev = messages[i - 1];
        const showAvatar = !prev || prev.senderId?._id !== message.senderId?._id;

        return (
          <div
            key={message._id}
            ref={(el) => { messageRefs.current[message._id] = el; }}
            className={flashId === message._id ? "rounded-lg bg-yellow-50 transition-colors duration-1000" : ""}
          >
            <MessageBubble
              message={message}
              isOwn={isOwn}
              showAvatar={showAvatar}
              channelId={channelId}
              onReply={onReply}
              onOpenThread={onOpenThread}
            />
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}