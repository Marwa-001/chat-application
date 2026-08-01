"use client";

import { forwardRef } from "react";
import clsx from "clsx";

const Input = forwardRef(function Input(
  { label, error, className, ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={clsx(
          "w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900",
          "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0",
          error
            ? "border-red-400 focus:ring-red-200"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-100",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});

export default Input;