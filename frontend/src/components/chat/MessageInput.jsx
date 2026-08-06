"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Plus, X, Reply } from "lucide-react";
import { useSendMessage } from "@/lib/hooks/useSendMessage";
import { useUploadFiles } from "@/lib/hooks/useUploadFiles";
import { useTyping } from "@/lib/hooks/useTyping";
import MentionableInput from "./MentionableInput";
import EmojiPicker from "./EmojiPicker";
import PendingAttachments from "./PendingAttachments";

export default function MessageInput({ channelId, replyingToMessage, onCancelReply }) {
  const [content, setContent] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]); // [{file, previewUrl}]
  const fileInputRef = useRef(null);
  const sendMessage = useSendMessage(channelId);
  const uploadFiles = useUploadFiles();
  const { emitTyping, emitStopTyping } = useTyping(channelId);

  useEffect(() => {
    if (replyingToMessage) emitTyping();
  }, [replyingToMessage]);

  // clean up object URLs on unmount / change
  useEffect(() => {
    return () => pendingFiles.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
  }, [pendingFiles]);

  const handleChange = (value) => {
    setContent(value);
    if (value.trim()) emitTyping();
    else emitStopTyping();
  };

  const handleEmojiSelect = (emoji) => {
    setContent((prev) => prev + emoji);
    emitTyping();
  };

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const withPreviews = files.map((file) => ({
      file,
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));
    setPendingFiles((prev) => [...prev, ...withPreviews]);
    e.target.value = ""; // allow re-selecting the same file
  };

  const handleRemoveFile = (index) => {
    setPendingFiles((prev) => {
      const removed = prev[index];
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const isBusy = sendMessage.isPending || uploadFiles.isPending;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if ((!trimmed && !pendingFiles.length) || isBusy) return;

    emitStopTyping();

    try {
      let attachments = [];
      if (pendingFiles.length) {
        attachments = await uploadFiles.mutateAsync(pendingFiles.map((f) => f.file));
      }

      await sendMessage.mutateAsync({
        channelId,
        content: trimmed,
        attachments,
        replyTo: replyingToMessage?._id || null,
      });

      setContent("");
      setPendingFiles([]);
      onCancelReply?.();
    } catch (err) {
      console.error("Failed to send message:", err);
    }
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

      <PendingAttachments files={pendingFiles} onRemove={handleRemoveFile} />

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-1.5 px-2 py-2 sm:gap-2 sm:px-4 sm:py-3"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={handleFilesSelected}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 text-gray-400 hover:text-gray-600 xs:block"
        >
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
          disabled={(!content.trim() && !pendingFiles.length) || isBusy}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white disabled:opacity-40"
        >
          {/* <Send className="h-4 w-4" /> */}
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="20" fill="#B4B7BB" />
            <path d="M12.0095 30L32 20L12.0095 10L12 17.7778L26.2857 20L12 22.2222L12.0095 30Z" fill="white" />
          </svg>

        </button>
      </form>
    </div>
  );
}