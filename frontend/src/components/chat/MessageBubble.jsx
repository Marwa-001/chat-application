"use client";

import { useState } from "react";
import clsx from "clsx";
import Avatar from "@/components/ui/Avatar";
import MessageHoverMenu from "./MessageHoverMenu";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { Pin, Check, X, CheckCheck, MessageSquareText } from "lucide-react";
import {
  useEditMessage,
  useDeleteMessage,
  useTogglePin,
  useAddReaction,
  useRemoveReaction,
} from "@/lib/hooks/useMessageMutation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useReadReceipts } from "@/lib/hooks/useReadReceipts";
import { useChannelHeader } from "@/lib/hooks/useChannelHeader";
import LinkPreviewCard from "./LinkPreviewCard";
import { linkifyText } from "@/lib/utils/linkify";

import AttachmentGrid from "./AttachmentGrid";
import FileAttachmentCard from "./FileAttachmentCard";
import ImageLightbox from "./ImageLightbox";

export default function MessageBubble({ message, isOwn, showAvatar, channelId, onReply, onOpenThread, disableThread, isLastInStack = true }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { data: readReceipts } = useReadReceipts(channelId);
  const { channel } = useChannelHeader(channelId);

  const { user } = useAuth();
  const editMessage = useEditMessage(channelId);
  const deleteMessage = useDeleteMessage(channelId);
  const togglePin = useTogglePin(channelId);
  const addReaction = useAddReaction(channelId);
  const removeReaction = useRemoveReaction(channelId);
  const [lightbox, setLightbox] = useState(null); // { images, startIndex } | null

  const time = new Date(message.createdAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  // Only relevant for messages the current user sent
  const readStatus = (() => {
    if (!isOwn || !channel) return null;

    const otherMemberIds = channel.members
      ?.map((m) => m.userId?._id || m.userId)
      .filter((id) => id !== user?.id) || [];

    if (!otherMemberIds.length) return null;

    const readers = otherMemberIds.filter((id) => {
      const lastRead = readReceipts?.[id];
      if (!lastRead) return false;
      // ObjectIds sort chronologically as strings when same length
      return lastRead >= message._id;
    });

    if (channel.type === "dm") {
      return readers.length > 0 ? "read" : "sent";
    }

    // group: show a count
    return { seenCount: readers.length, total: otherMemberIds.length };
  })();

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
      className={clsx("group relative flex flex-col gap-0.5", isOwn && "items-end")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={clsx("flex items-end gap-2", isOwn && "flex-row-reverse")}>
        {!isOwn && (
          <div className="w-7 shrink-0 sm:w-8">
            {isLastInStack && (
              <Avatar src={message.senderId?.avatarUrl} name={message.senderId?.username} size="sm" />
            )}
          </div>
        )}

        <div className={clsx("relative flex max-w-[85% ] flex-col gap-0.5 sm:max-w-[70%]", isOwn && "items-end")}>


          {message.pinned && (
            <div className="flex items-center gap-1 text-[11px] text-amber-600">
              <Pin className="h-3 w-3" /> Pinned
            </div>
          )}

          {message.repliedToThreadId && (
            <button
              onClick={() => onOpenThread?.(message.repliedToThreadId)}
              className="mb-1 flex flex-col items-start gap-0.5 text-left"
            >
              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                <MessageSquareText className="h-3 w-3" />
                Replied to a thread
              </span>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                {message.repliedToThreadId.senderId?.username}
              </span>
            </button>
          )}

          {message.alsoSentToMainId && (
            <div className="mb-1 flex items-center gap-1 text-[11px] text-gray-400">
              <MessageSquareText className="h-3 w-3" />
              Also sent to the channel
            </div>
          )}

          {/* Reactions now render ABOVE the bubble */}
          {Object.keys(groupedReactions).length > 0 && (
            <div className="flex gap-1">
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
            <div className="relative">
              <div
                className={clsx(
                  "break-words rounded-2xl px-3.5 py-2 text-sm text-gray-900",
                  isOwn ? "rounded-br-sm bg-[#E0F0FF]" : "rounded-bl-sm bg-gray-100"
                )}
              >
                {message.replyTo && (
                  <div
                    className={clsx(
                      "mb-1.5 flex items-center gap-1.5",
                      isOwn ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div className={clsx("min-w-0 flex-1 truncate whitespace-nowrap rounded-full bg-white px-3 py-1.5 shadow-sm",
                      isOwn ? "rounded-bl-sm" : "rounded-br-sm"
                    )}>
                      <span
                        className={clsx(
                          "text-xs text-gray-700",
                          message.replyTo.deletedAt && "italic text-gray-400"
                        )}
                      >
                        {message.replyTo.deletedAt
                          ? "Original message deleted"
                          : message.replyTo.content}
                      </span>
                    </div>
                    {!message.replyTo.deletedAt && (
                      <Avatar
                        src={message.replyTo.senderId?.avatarUrl}
                        name={message.replyTo.senderId?.username}
                        size="sm"
                        className="shrink-0"
                      />
                    )}
                  </div>
                )}
                {message.linkPreview && (
                  <LinkPreviewCard preview={message.linkPreview} isOwn={isOwn} />
                )}

                {message.attachments?.some((a) => a.type === "image") && (
                  <div className="mb-1.5">
                    <AttachmentGrid
                      attachments={message.attachments.filter((a) => a.type === "image")}
                      onImageClick={(images, startIndex) => setLightbox({ images, startIndex })}
                    />
                  </div>
                )}

                {message.attachments?.filter((a) => a.type === "file").length > 0 && (
                  <div className="mb-1.5 space-y-1.5">
                    {message.attachments
                      .filter((a) => a.type === "file")
                      .map((att) => (
                        <FileAttachmentCard key={att.url} attachment={att} />
                      ))}
                  </div>
                )}

                {linkifyText(message.content)}
                {message.editedAt && (
                  <span className={clsx("ml-1.5 text-[10px]", isOwn ? "text-blue-100" : "text-gray-400")}>
                    (edited)
                  </span>
                )}

              </div>
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
            </div>
          )}

          {!disableThread && message.threadReplyCount > 0 && (
            <button
              onClick={() => onOpenThread?.(message)}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
            >
              {message.threadReplyCount} {message.threadReplyCount === 1 ? "reply" : "replies"}
            </button>
          )}

          {/* Timestamp only on the last message in the stack
        {isLastInStack && (
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-gray-400">{time}</span>
            {readStatus === "sent" && (
              <Check className="h-3 w-3 text-gray-400" />
            )}
            {readStatus === "read" && (
              <CheckCheck className="h-3 w-3 text-blue-500" />
            )}
            {readStatus && typeof readStatus === "object" && (
              <span className="text-[10px] text-gray-400">
                {readStatus.seenCount > 0
                  ? `Seen by ${readStatus.seenCount}/${readStatus.total}`
                  : ""}
              </span>
            )}
          </div>
        )} */}

          {/* <MessageHoverMenu
          isOwn={isOwn}
          isVisible={isHovered}
          onReply={() => onReply?.(message)}
          onThreadReply={() => onOpenThread?.(message)}
          onEdit={() => setIsEditing(true)}
          onPin={() => togglePin.mutate(message._id)}
          onDelete={() => setShowDeleteDialog(true)}
          onReact={handleReact}
          hideThreadReply={disableThread}
        /> */}
        </div>
      </div>

      {isLastInStack && (
        <div className={clsx("flex items-center gap-1", !isOwn && "pl-9 sm:pl-10")}>
          <span className="text-[11px] text-gray-400">{time}</span>
          {readStatus === "sent" && <Check className="h-3 w-3 text-gray-400" />}
          {readStatus === "read" && <CheckCheck className="h-3 w-3 text-blue-500" />}
          {readStatus && typeof readStatus === "object" && (
            <span className="text-[10px] text-gray-400">
              {readStatus.seenCount > 0 ? `Seen by ${readStatus.seenCount}/${readStatus.total}` : ""}
            </span>
          )}
        </div>
      )}

      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          startIndex={lightbox.startIndex}
          sender={message.senderId}
          subtitle={new Date(message.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          onClose={() => setLightbox(null)}
        />
      )}

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMessage.isPending}
      />
    </div>
  );
}