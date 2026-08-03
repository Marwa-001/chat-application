"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

const EMOJI_GROUPS = {
  Smileys: ["😀", "😂", "🥹", "😉", "😍", "🤔", "😎", "🙃", "😴", "🤯", "🥳", "😅"],
  Gestures: ["👍", "👎", "👏", "🙏", "🙌", "👌", "✌️", "🤝", "💪", "🤞"],
  Hearts: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💔", "💯"],
  Objects: ["🔥", "🎉", "✨", "🚀", "📌", "📎", "⏰", "✅", "❌", "⚡"],
};

export default function EmojiPicker({ onSelect, className }) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={pickerRef} className={clsx("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="text-gray-400 hover:text-gray-600"
      >
        <SmileIcon />
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 z-20 mb-2 w-64 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2 shadow-md">
          {Object.entries(EMOJI_GROUPS).map(([group, emojis]) => (
            <div key={group} className="mb-1.5">
              <p className="mb-1 px-1 text-[11px] font-medium uppercase text-gray-400">
                {group}
              </p>
              <div className="grid grid-cols-6 gap-1">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onSelect(emoji);
                    //   setIsOpen(false);
                    }}
                    className="rounded-md p-1 text-lg hover:bg-gray-100"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// inline so we don't add another lucide import dependency surface here
function SmileIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}