"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { useSendMessage } from "@/lib/hooks/useSendMessage";
import MentionableInput from "./MentionableInput";

export default function ThreadReplyInput({ channelId, parentMessageId }) {
  const [content, setContent] = useState("");
  const [alsoSendToMain, setAlsoSendToMain] = useState(false);
  const sendMessage = useSendMessage(channelId);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || sendMessage.isPending) return;

    sendMessage.mutate(
      { channelId, content: trimmed, parentMessageId },
      { onSuccess: () => setContent("") }
    );

    if (alsoSendToMain) {
      sendMessage.mutate({ channelId, content: trimmed });
    }
  };

  return (
    <div className="border-t border-gray-200 px-3 py-2 sm:px-4 sm:py-3">
      <label className="mb-2 flex items-center gap-2 text-xs text-gray-500">
        <input
          type="checkbox"
          checked={alsoSendToMain}
          onChange={(e) => setAlsoSendToMain(e.target.checked)}
          className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-400"
        />
        Send also a copy to the main channel
      </label>
      <form onSubmit={handleSubmit} className="flex items-center gap-1.5 sm:gap-2">
        <MentionableInput
          value={content}
          onChange={setContent}
          placeholder="Reply in thread"
          className="min-w-0 w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 sm:py-2"
        />
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