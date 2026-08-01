"use client";

import { useState } from "react";
import { X, Search, Check } from "lucide-react";
import { useUserSearch } from "@/lib/hooks/useUserSearch";
import { useCreateGroup } from "@/lib/hooks/useCreateGroup";
import Avatar from "@/components/ui/Avatar";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function NewGroupModal({ isOpen, onClose, onCreated }) {
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]); // array of user objects

  const { data: userResults, isFetching } = useUserSearch(searchTerm);
  const createGroup = useCreateGroup();

  if (!isOpen) return null;

  const toggleMember = (user) => {
    setSelectedMembers((prev) =>
      prev.some((m) => m._id === user._id)
        ? prev.filter((m) => m._id !== user._id)
        : [...prev, user]
    );
  };

  const handleClose = () => {
    setGroupName("");
    setSearchTerm("");
    setSelectedMembers([]);
    onClose();
  };

  const handleCreate = () => {
    if (!groupName.trim() || selectedMembers.length === 0) return;
    createGroup.mutate(
      {
        name: groupName.trim(),
        memberIds: selectedMembers.map((m) => m._id),
      },
      {
        onSuccess: (channel) => {
          onCreated(channel);
          handleClose();
        },
      }
    );
  };

  const serverError = createGroup.error?.response?.data?.message;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="flex max-h-[85vh] w-full max-w-md flex-col rounded-xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-semibold text-gray-900">New Group</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <Input
            label="Group Name"
            placeholder="e.g. Design Team"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />

          {selectedMembers.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedMembers.map((m) => (
                <span
                  key={m._id}
                  className="flex items-center gap-1 rounded-full bg-blue-50 py-1 pl-1 pr-2 text-xs text-blue-700"
                >
                  <Avatar src={m.avatarUrl} name={m.username} size="sm" className="h-5 w-5" />
                  {m.username}
                  <button onClick={() => toggleMember(m)} className="ml-0.5 hover:text-blue-900">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Add Members
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users"
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="max-h-48 space-y-1 overflow-y-auto">
            {isFetching ? (
              <p className="py-4 text-center text-sm text-gray-400">Searching…</p>
            ) : (
              userResults?.map((u) => {
                const isSelected = selectedMembers.some((m) => m._id === u._id);
                return (
                  <button
                    key={u._id}
                    onClick={() => toggleMember(u)}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-gray-50"
                  >
                    <span className="flex items-center gap-2.5">
                      <Avatar src={u.avatarUrl} name={u.username} size="sm" />
                      <span className="text-sm text-gray-800">{u.username}</span>
                    </span>
                    {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                  </button>
                );
              })
            )}
          </div>

          {serverError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{serverError}</p>
          )}
        </div>

        <div className="border-t border-gray-100 px-5 py-4">
          <Button
            onClick={handleCreate}
            isLoading={createGroup.isPending}
            disabled={!groupName.trim() || selectedMembers.length === 0}
          >
            Create Group
          </Button>
        </div>
      </div>
    </div>
  );
}