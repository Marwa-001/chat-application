"use client";

import { useEffect, useState } from "react";
import { Send, Plus, X, Reply } from "lucide-react";
import { useSendMessage } from "@/lib/hooks/useSendMessage";
import { useTyping } from "@/lib/hooks/useTyping";
import MentionableInput from "./MentionableInput";
import EmojiPicker from "./EmojiPicker";

export default function MessageInput({ channelId, replyingToMessage, onCancelReply }) {
  const [content, setContent] = useState("");
  const sendMessage = useSendMessage(channelId);
  const { emitTyping, emitStopTyping } = useTyping(channelId);

  useEffect(() => {
    if (replyingToMessage) emitTyping();
  }, [replyingToMessage]);

  const handleChange = (value) => {
    setContent(value);
    if (value.trim()) emitTyping();
    else emitStopTyping();
  };

  const handleEmojiSelect = (emoji) => {
    setContent((prev) => prev + emoji);
    emitTyping();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || sendMessage.isPending) return;

    emitStopTyping();
    sendMessage.mutate(
      { channelId, content: trimmed, replyTo: replyingToMessage?._id || null },
      {
        onSuccess: () => {
          setContent("");
          onCancelReply?.();
        },
      }
    );
  };

  return (
    <div className="border-t border-gray-200">
      {replyingToMessage && (
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-3 py-2 sm:px-4">
          <Reply className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-600">
              Replying to {replyingToMessage.senderId?.username}
            </p>
            <p className="truncate text-xs text-gray-400">{replyingToMessage.content}</p>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-1.5 px-2 py-2 sm:gap-2 sm:px-4 sm:py-3"
      >
        <button type="button" className="hidden shrink-0 text-gray-400 hover:text-gray-600 xs:block">
          <Plus className="h-5 w-5" />
        </button>

        <MentionableInput
          value={content}
          onChange={handleChange}
          placeholder="Type your message"
          className="min-w-0 w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 sm:py-2"
        />

        <EmojiPicker onSelect={handleEmojiSelect} className="hidden shrink-0 sm:block" />

        <button
          type="submit"
          disabled={!content.trim() || sendMessage.isPending}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}