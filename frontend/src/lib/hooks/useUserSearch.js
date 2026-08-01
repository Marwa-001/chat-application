"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchUsers } from "@/lib/api/users";

export function useUserSearch(searchTerm) {
  const [debounced, setDebounced] = useState(searchTerm);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(searchTerm), 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  return useQuery({
    queryKey: ["users", "search", debounced],
    queryFn: () => searchUsers(debounced),
    enabled: debounced.trim().length > 0,
  });
}