"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";

type Props = {
  defaultValue?: string;
  placeholder?: string;
};

export function SearchBar({
  defaultValue = "",
  placeholder = "Buscar artículos…",
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = inputRef.current?.value.trim() ?? "";
    if (!q) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", q);
    router.push(`/buscar?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="flex w-full items-center gap-2"
    >
      <div className="relative flex-1">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-[#E86C2C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E86C2C]/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:bg-gray-900"
        />
      </div>
      <button
        type="submit"
        className="rounded-xl bg-[#E86C2C] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#E86C2C]/40"
      >
        Buscar
      </button>
    </form>
  );
}
