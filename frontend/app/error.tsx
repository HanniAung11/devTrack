"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold text-zinc-900">Something went wrong</h1>
      <p className="text-zinc-600">{error.message}</p>
      <button
        type="button"
        className="rounded-lg bg-indigo-600 px-4 py-2 text-white"
        onClick={reset}
      >
        Try again
      </button>
    </div>
  );
}
