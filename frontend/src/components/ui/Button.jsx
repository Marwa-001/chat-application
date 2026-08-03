"use client";

import clsx from "clsx";
import { Loader2 } from "lucide-react";

export default function Button({
  children,
  isLoading,
  variant = "primary",
  className,
  disabled,
  ...props
}) {
  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(
        "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5",
        "text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-[#E0F0FF] text-gray-900 hover:bg-blue-700",
        variant === "secondary" &&
          "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}