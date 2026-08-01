"use client";

import { useState } from "react";
import clsx from "clsx";
import Avatar from "@/components/ui/Avatar";
import MessageHoverMenu from "./MessageHoverMenu";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { Pin, Check, X } from "lucide-react";
import {
  useEditMessage,
  useDeleteMessage,
  useTogglePin,
  useAddReaction,
  useRemoveReaction,
} from "@/lib/hooks/useMessageMutation";
import { useAuth } from "@/lib/hooks/useAuth";

export default function MessageBubble({ message, isOwn, showAvatar, channelId, onReply, onOpenThread, disableThread, }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { user } = useAuth();
  const editMessage = useEditMessage(channelId);
  const deleteMessage = useDeleteMessage(channelId);
  const togglePin = useTogglePin(channelId);
  const addReaction = useAddReaction(channelId);
  const removeReaction = useRemoveReaction(channelId);

  const time = new Date(message.createdAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const handleReact = (emoji) => {
    const alreadyReacted = message.reactions?.some(
      (r) => r.emoji === emoji && r.userId === user?.id
    );
    if (alreadyReacted) {
      removeReaction.mutate({ messageId: message._id, emoji });
    } else {
      addReaction.mutate({ messageId: message._id, emoji });
    }
  };

  const handleSaveEdit = () => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === message.content) {
      setIsEditing(false);
      return;
    }
    editMessage.mutate(
      { messageId: message._id, content: trimmed },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const handleConfirmDelete = () => {
    deleteMessage.mutate(message._id, {
      onSuccess: () => setShowDeleteDialog(false),
    });
  };

  // group reactions by emoji -> count
  const groupedReactions = (message.reactions || []).reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  return (
    <div
      className={clsx("group relative flex items-end gap-2", isOwn && "flex-row-reverse")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isOwn && (
        <div className="w-7 shrink-0 sm:w-8">
          {showAvatar && (
            <Avatar src={message.senderId?.avatarUrl} name={message.senderId?.username} size="sm" />
          )}
        </div>
      )}

      <div className={clsx("relative flex max-w-[85%] flex-col sm:max-w-[70%]", isOwn && "items-end")}>
       <MessageHoverMenu
  isOwn={isOwn}
  isVisible={isHovered}
  onReply={() => onReply?.(message)}
  onThreadReply={() => onOpenThread?.(message)}
  onEdit={() => setIsEditing(true)}
  onPin={() => togglePin.mutate(message._id)}
  onDelete={() => setShowDeleteDialog(true)}
  onReact={handleReact}
  hideThreadReply={disableThread}
/>

        {message.pinned && (
          <div className="mb-1 flex items-center gap-1 text-[11px] text-amber-600">
            <Pin className="h-3 w-3" /> Pinned
          </div>
        )}

        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") setIsEditing(false);
              }}
              className="rounded-2xl border border-blue-300 bg-white px-3.5 py-2 text-sm focus:outline-none"
            />
            <button onClick={handleSaveEdit} className="text-green-600 hover:text-green-700">
              <Check className="h-4 w-4" />
            </button>
            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            className={clsx(
              "break-words rounded-2xl px-3.5 py-2 text-sm",
              isOwn ? "rounded-br-sm bg-blue-600 text-white" : "rounded-bl-sm bg-gray-100 text-gray-900"
            )}
          >
            {message.content}
            {message.editedAt && (
              <span className={clsx("ml-1.5 text-[10px]", isOwn ? "text-blue-100" : "text-gray-400")}>
                (edited)
              </span>
            )}
          </div>
        )}

        {Object.keys(groupedReactions).length > 0 && (
          <div className="mt-1 flex gap-1">
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className="flex items-center gap-1 rounded-full border border-gray-200 bg-white px-1.5 py-0.5 text-xs hover:bg-gray-50"
              >
                <span>{emoji}</span>
                <span className="text-gray-500">{count}</span>
              </button>
            ))}
          </div>
        )}

        {!disableThread && message.threadReplyCount > 0 && (
  <button
    onClick={() => onOpenThread?.(message)}
    className="mt-1 flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
  >
    {message.threadReplyCount} {message.threadReplyCount === 1 ? "reply" : "replies"}
  </button>
)}

        <span className="mt-1 text-[11px] text-gray-400">{time}</span>
      </div>

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMessage.isPending}
      />
    </div>
  );
}