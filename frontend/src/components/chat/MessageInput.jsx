"use client";

import { useState } from "react";
import { Send, Plus, Smile } from "lucide-react";
import { useSendMessage } from "@/lib/hooks/useSendMessage";
import { useTyping } from "@/lib/hooks/useTyping";
import MentionableInput from "./MentionableInput";

export default function MessageInput({ channelId }) {
  const [content, setContent] = useState("");
  const sendMessage = useSendMessage(channelId);
  const { emitTyping, emitStopTyping } = useTyping(channelId);

  const handleChange = (value) => {
    setContent(value);
    if (value.trim()) emitTyping();
    else emitStopTyping();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || sendMessage.isPending) return;

    emitStopTyping();
    sendMessage.mutate(
      { channelId, content: trimmed },
      { onSuccess: () => setContent("") }
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-1.5 border-t border-gray-200 px-2 py-2 sm:gap-2 sm:px-4 sm:py-3"
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

      <button type="button" className="hidden shrink-0 text-gray-400 hover:text-gray-600 sm:block">
        <Smile className="h-5 w-5" />
      </button>
      <button
        type="submit"
        disabled={!content.trim() || sendMessage.isPending}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white disabled:opacity-40"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}