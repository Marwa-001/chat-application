"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/lib/validation/auth.schema";
import { useSignup } from "@/lib/hooks/useAuthMutation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const signupMutation = useSignup();

  const onSubmit = (data) => {
    signupMutation.mutate(data);
  };

  const serverError = signupMutation.error?.response?.data?.message;

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900">Create an account</h1>
      <p className="mt-1 text-sm text-gray-500">Start chatting in seconds</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Input
          label="Username"
          type="text"
          placeholder="johndoe"
          error={errors.username?.message}
          {...register("username")}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        {serverError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {serverError}
          </p>
        )}

        <Button type="submit" isLoading={signupMutation.isPending}>
          Sign Up
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-blue-600">
          Log in
        </Link>
      </p>
    </div>
  );
}