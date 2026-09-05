"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

function CancelledContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-brand-gray via-white to-brand-gray py-16 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-md px-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-card dark:border-slate-700/80 dark:bg-slate-900">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <AlertCircle className="h-10 w-10 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold text-brand-dark dark:text-white">
            Payment Cancelled
          </h1>
          <p className="mt-2 text-sm text-brand-slate dark:text-slate-400">
            No amount was charged. You can retry payment whenever you&apos;re ready.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            {jobId && (
              <Button href={`/jobs/${jobId}/review`} variant="orange" className="w-full">
                <RefreshCw className="h-4 w-4" /> Retry Payment
              </Button>
            )}
            <Button href="/" variant="outline" className="w-full dark:border-slate-600 dark:text-slate-300">
              <Home className="h-4 w-4" /> Go Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelledPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-brand-slate dark:text-slate-400">Loading...</div>}>
      <CancelledContent />
    </Suspense>
  );
}
