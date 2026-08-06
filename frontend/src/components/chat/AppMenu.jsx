"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, AtSign } from "lucide-react";
import { clearAuth } from "@/store/authStore";
import { useAuth } from "@/lib/hooks/useAuth";
import Avatar from "@/components/ui/Avatar";
import { useUnreadMentionsCount } from "@/lib/hooks/useUnreadMentionsCount";
import EditPencilIcon from "../icons/EditPencilIcon";
import NewGroup from "../icons/NewGroup";
import SignOut from "../icons/SignOut";

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
            icon={EditPencilIcon}
            label="New Direct Message"
            onClick={() => { setIsOpen(false); onNewDM(); }}
          />
          <MenuItem
            icon={NewGroup}
            label="New Group"
            onClick={() => { setIsOpen(false); onNewGroup(); }}
          />
          <div className="flex items-center justify-between px-3 py-2 text-sm text-gray-700">
            <span className="flex items-center gap-2.5">
              {/* <Moon className="h-4 w-4" /> */}
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.37 2.51C6.19 3.15 6.1 3.82 6.1 4.5C6.1 8.58 9.42 11.9 13.5 11.9C14.18 11.9 14.85 11.81 15.49 11.63C14.45 14.19 11.93 16 9 16C5.14 16 2 12.86 2 9C2 6.07 3.81 3.55 6.37 2.51ZM9 0C4.03 0 0 4.03 0 9C0 13.97 4.03 18 9 18C13.97 18 18 13.97 18 9C18 8.54 17.96 8.08 17.9 7.64C16.92 9.01 15.32 9.9 13.5 9.9C10.52 9.9 8.1 7.48 8.1 4.5C8.1 2.69 8.99 1.08 10.36 0.1C9.92 0.0400004 9.46 0 9 0Z" fill="#747881" />
              </svg>

              Dark Mode
            </span>
            <div className="h-5 w-9 rounded-full bg-gray-200 p-0.5">
              <div className="h-4 w-4 rounded-full bg-white shadow" />
            </div>
          </div>
          <div className="my-1 border-t border-gray-100" />
          <MenuItem icon={SignOut} label="Sign Out" onClick={handleSignOut} danger />
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