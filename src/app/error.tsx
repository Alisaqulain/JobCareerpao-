"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function Error({
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
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-brand-gray dark:bg-slate-950 px-4 text-center">
      <p className="font-display text-8xl font-extrabold text-brand-orange/30">500</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-brand-dark dark:text-white">Something went wrong</h1>
      <p className="mt-2 max-w-md text-brand-slate">
        We encountered an unexpected error. Please try again.
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Try Again</Button>
        <Button href="/" variant="outline">Go Home</Button>
      </div>
    </div>
  );
}
