"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, MessageCircle, Users, AtSign, Moon, LogOut } from "lucide-react";
import { clearAuth } from "@/store/authStore";
import { useAuth } from "@/lib/hooks/useAuth";
import Avatar from "@/components/ui/Avatar";
import { useUnreadMentionsCount } from "@/lib/hooks/useUnreadMentionsCount";

export default function AppMenu({ onNewDM, onNewGroup, onMentions }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();
  const unreadMentions = useUnreadMentionsCount();
  const { user } = useAuth();

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    setIsOpen(false);
    clearAuth();
    router.push("/login");
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
      >
        <Menu className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-lg border border-gray-200 bg-white py-1 shadow-md">

          {user && (
            <>
              <div className="flex items-center gap-3 px-3 py-3">
                <Avatar src={user.avatarUrl} name={user.username} size="md" />
                <p className="truncate text-sm font-semibold text-gray-900">
                  {user.username}
                </p>
              </div>
              <div className="my-1 border-t border-gray-100" />
            </>
          )}

          <MenuItem
            icon={AtSign}
            label="Mentions"
            badge={unreadMentions > 0 ? unreadMentions : null}
            onClick={() => { setIsOpen(false); onMentions(); }}
          />
          <MenuItem
            icon={MessageCircle}
            label="New Direct Message"
            onClick={() => { setIsOpen(false); onNewDM(); }}
          />
          <MenuItem
            icon={Users}
            label="New Group"
            onClick={() => { setIsOpen(false); onNewGroup(); }}
          />
          <div className="flex items-center justify-between px-3 py-2 text-sm text-gray-700">
            <span className="flex items-center gap-2.5">
              <Moon className="h-4 w-4" />
              Dark Mode
            </span>
            <div className="h-5 w-9 rounded-full bg-gray-200 p-0.5">
              <div className="h-4 w-4 rounded-full bg-white shadow" />
            </div>
          </div>
          <div className="my-1 border-t border-gray-100" />
          <MenuItem icon={LogOut} label="Sign Out" onClick={handleSignOut} danger />
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger, badge }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-2.5 px-3 py-2 text-left text-sm hover:bg-gray-50 ${danger ? "text-red-600" : "text-gray-700"
        }`}
    >
      <span className="flex items-center gap-2.5">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      {badge != null && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-400 px-1.5 text-[11px] font-semibold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}