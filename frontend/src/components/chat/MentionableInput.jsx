"use client";

import { useRef } from "react";
import { useUserSearch } from "@/lib/hooks/useUserSearch";
import Avatar from "@/components/ui/Avatar";
import { useState } from "react";

export default function MentionableInput({ value, onChange, placeholder, className }) {
  const [mentionQuery, setMentionQuery] = useState(null); // null = inactive
  const inputRef = useRef(null);

  const { data: results } = useUserSearch(mentionQuery ?? "");

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);

    const cursor = e.target.selectionStart;
    const beforeCursor = newValue.slice(0, cursor);
    const match = beforeCursor.match(/@(\w*)$/);
    setMentionQuery(match ? match[1] : null);
  };

  const handleSelectUser = (username) => {
    const cursor = inputRef.current.selectionStart;
    const beforeCursor = value.slice(0, cursor);
    const afterCursor = value.slice(cursor);
    const newBefore = beforeCursor.replace(/@(\w*)$/, `@${username} `);
    onChange(newBefore + afterCursor);
    setMentionQuery(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const isOpen = mentionQuery !== null && mentionQuery.length > 0 && results?.length > 0;

  return (
    <div className="relative flex-1">
      {isOpen && (
        <div className="absolute bottom-full left-0 z-20 mb-1 max-h-48 w-56 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-md">
          {results.map((u) => (
            <button
              key={u._id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault(); // keeps input focused, fires before blur
                handleSelectUser(u.username);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-gray-50"
            >
              <Avatar src={u.avatarUrl} name={u.username} size="sm" />
              <span className="text-sm text-gray-800">{u.username}</span>
            </button>
          ))}
        </div>
      )}
      <input
        ref={inputRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
      />
    </div>
  );
}