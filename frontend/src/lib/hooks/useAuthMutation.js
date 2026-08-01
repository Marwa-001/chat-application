"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { signupRequest, loginRequest } from "@/lib/api/auth";
import { setAuth } from "@/store/authStore";

export function useSignup() {
  const router = useRouter();
  return useMutation({
    mutationFn: signupRequest,
    onSuccess: (data) => {
      setAuth({ user: data.user, token: data.token });
      router.push("/");
    },
  });
}

export function useLogin() {
  const router = useRouter();
  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      setAuth({ user: data.user, token: data.token });
      router.push("/");
    },
  });
}