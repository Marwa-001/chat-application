"use client";

import { ArrowLeft, X, Loader2 } from "lucide-react";
import { useThreadMessages } from "@/lib/hooks/useThreadMessages";
import { useAuth } from "@/lib/hooks/useAuth";
import MessageBubble from "./MessageBubble";
import ThreadReplyInput from "./ThreadReplyInput";

export default function ThreadPanel({ channelId, parentMessage, onClose }) {
  const { data: replies, isLoading } = useThreadMessages(channelId, parentMessage._id);
  const { user } = useAuth();

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-3 sm:px-4">
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 md:hidden">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <p className="flex-1 text-sm font-semibold text-gray-900">Thread</p>
        <button onClick={onClose} className="hidden text-gray-400 hover:text-gray-600 md:block">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
        <div className="mb-4 border-b border-gray-100 pb-4">
          <MessageBubble
            message={parentMessage}
            isOwn={parentMessage.senderId?._id === user?.id}
            showAvatar
            channelId={channelId}
            disableThread
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
          </div>
        ) : replies?.length ? (
          <div className="space-y-3">
            {replies.map((reply, i) => {
              const next = replies[i + 1];
              const isLastInStack = !next || next.senderId?._id !== reply.senderId?._id;
              return (
                <MessageBubble
                  key={reply._id}
                  message={reply}
                  isOwn={reply.senderId?._id === user?.id}
                  isLastInStack={isLastInStack}
                  channelId={channelId}
                  disableThread
                />
              );
            })}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-gray-400">No replies yet</p>
        )}
      </div>

      <ThreadReplyInput channelId={channelId} parentMessageId={parentMessage._id} />
    </div>
  );
}