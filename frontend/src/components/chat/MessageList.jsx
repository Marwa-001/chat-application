"use client";

import { useEffect, useRef, useState } from "react";
// import { Loader2 } from "lucide-react";
import { useMessages } from "@/lib/hooks/useMessages";
import { useAuth } from "@/lib/hooks/useAuth";
import MessageBubble from "./MessageBubble";
import clsx from "clsx";
import { Loader2, ChevronDown } from "lucide-react";

export default function MessageList({ channelId, onReply, onOpenThread, highlightMessageId, onHighlighted }) {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useMessages(channelId);
const messages = data?.pages.slice().reverse().flat() ?? [];
  const { user } = useAuth();
  const bottomRef = useRef(null);
  const messageRefs = useRef({});
  const [flashId, setFlashId] = useState(null);

  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const scrollContainerRef = useRef(null);
const prevScrollHeightRef = useRef(0);

const handleScroll = () => {
  const el = scrollContainerRef.current;
  if (!el) return;

  if (!isFetchingNextPage && hasNextPage && el.scrollTop < 100) {
    prevScrollHeightRef.current = el.scrollHeight;
    fetchNextPage();
  }

  const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
  setShowScrollToBottom(distanceFromBottom > 200);
};

const scrollToBottom = () => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
};

useEffect(() => {
  const el = scrollContainerRef.current;
  if (!el || !prevScrollHeightRef.current) return;
  // restore position: keep the same messages in view after prepend
  const diff = el.scrollHeight - prevScrollHeightRef.current;
  el.scrollTop += diff;
  prevScrollHeightRef.current = 0;
}, [data?.pages.length]);

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

  // useEffect(() => {
  //   if (!highlightMessageId) {
  //     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [messages]);

  const prevLastIdRef = useRef(null);

useEffect(() => {
  if (!messages.length || highlightMessageId) return;
  const lastId = messages[messages.length - 1]._id;
  if (lastId !== prevLastIdRef.current) {
    // only autoscroll if this is a genuinely new last message
    // (i.e. not just an older page prepended)
    const isInitialLoad = prevLastIdRef.current === null;
    const isNewMessage = prevLastIdRef.current !== null && lastId !== prevLastIdRef.current;
    if (isInitialLoad || isNewMessage) {
      bottomRef.current?.scrollIntoView({ behavior: isInitialLoad ? "auto" : "smooth" });
    }
    prevLastIdRef.current = lastId;
  }
}, [messages, highlightMessageId]);

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

  const GROUP_THRESHOLD_MS = 1 * 60 * 1000;


  console.log({ pagesLoaded: data?.pages.length, hasNextPage, isFetchingNextPage, totalMessages: messages.length });

  return (
   <div className="relative flex-1 overflow-hidden">
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto px-3 py-3 sm:px-4 sm:py-4"
    >
      {isFetchingNextPage && (
        <div className="flex justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-gray-300" />
        </div>
      )}
      {messages.map((message, i) => {
        const isOwn = message.senderId?._id === user?.id;
        const prev = messages[i - 1];
        const next = messages[i + 1];

        const isFirstInStack =
          !prev ||
          prev.senderId?._id !== message.senderId?._id ||
          new Date(message.createdAt) - new Date(prev.createdAt) > GROUP_THRESHOLD_MS;

        const isLastInStack =
          !next ||
          next.senderId?._id !== message.senderId?._id ||
          new Date(next.createdAt) - new Date(message.createdAt) > GROUP_THRESHOLD_MS;

        return (
          <div
            key={message._id}
            ref={(el) => { messageRefs.current[message._id] = el; }}
            className={clsx(
              isFirstInStack ? "mt-3" : "mt-0.5",
              flashId === message._id && "rounded-lg bg-[#FFF9E5] transition-colors duration-1000"
            )}
          >
            <MessageBubble
              message={message}
              isOwn={isOwn}
              isLastInStack={isLastInStack}
              channelId={channelId}
              onReply={onReply}
              onOpenThread={onOpenThread}
            />
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
    {showScrollToBottom && (
      <button
        type="button"
        onClick={scrollToBottom}
        className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600 shadow-md ring-1 ring-gray-200 hover:bg-gray-50"
      >
        <ChevronDown className="h-5 w-5" />
      </button>
    )}
    </div>
  );
}