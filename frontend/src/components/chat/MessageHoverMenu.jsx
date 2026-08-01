"use client";

import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { MoreHorizontal, Smile, Reply, MessageSquareText, Pencil, Pin, Trash2 } from "lucide-react";

const QUICK_REACTIONS = ["❤️", "😂", "👍", "😮", "😢"];

export default function MessageHoverMenu({
  isOwn,
  isVisible,
  onReply,
  onThreadReply,
  onEdit,
  onPin,
  onDelete,
  onReact,
  hideThreadReply
}) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
        setShowReactionPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isVisible && !showMenu && !showReactionPicker) return null;

  return (
    <div
      ref={menuRef}
      className={clsx(
        "absolute top-0 z-10 flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm",
        isOwn ? "-left-2 -translate-x-full" : "-right-2 translate-x-full"
      )}
    >
      <div className="relative">
        <button
          onClick={() => setShowReactionPicker((v) => !v)}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
          title="React"
        >
          <Smile className="h-4 w-4" />
        </button>
        {showReactionPicker && (
          <div className="absolute top-full z-20 mt-1 flex gap-1 rounded-full border border-gray-200 bg-white p-1.5 shadow-md">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReact(emoji);
                  setShowReactionPicker(false);
                }}
                className="text-base hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onReply}
        className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
        title="Reply"
      >
        <Reply className="h-4 w-4" />
      </button>

      <div className="relative">
        <button
          onClick={() => setShowMenu((v) => !v)}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
          title="More"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {showMenu && (
          <div
            className={clsx(
              "absolute top-full z-20 mt-1 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-md",
              isOwn ? "right-0" : "left-0"
            )}
          >
            <MenuItem icon={Reply} label="Reply" onClick={() => { onReply(); setShowMenu(false); }} />
            {!hideThreadReply && (
  <MenuItem
    icon={MessageSquareText}
    label="Thread Reply"
    onClick={() => { onThreadReply(); setShowMenu(false); }}
  />
)}
            {isOwn && (
              <MenuItem
                icon={Pencil}
                label="Edit Message"
                onClick={() => { onEdit(); setShowMenu(false); }}
              />
            )}
            <MenuItem
              icon={Pin}
              label="Pin to Conversation"
              onClick={() => { onPin(); setShowMenu(false); }}
            />
            {isOwn && (
              <MenuItem
                icon={Trash2}
                label="Delete Message"
                danger
                onClick={() => { onDelete(); setShowMenu(false); }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-gray-50",
        danger ? "text-red-600" : "text-gray-700"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}