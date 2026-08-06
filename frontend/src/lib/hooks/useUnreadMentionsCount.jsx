"use client";

import { useMentions } from "./useMentions";

export function useUnreadMentionsCount() {
  const { data: mentions } = useMentions();
  return mentions?.filter((m) => !m.isRead).length ?? 0;
}