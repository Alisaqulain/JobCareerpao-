"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

function FailedContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const reason = searchParams.get("reason") || "Your payment could not be processed.";

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-brand-gray via-white to-brand-gray py-16 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-md px-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-card dark:border-slate-700/80 dark:bg-slate-900">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold text-brand-dark dark:text-white">
            Payment Failed
          </h1>
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
            {decodeURIComponent(reason)}
          </p>

          <div className="mt-8 flex flex-col gap-3">
            {jobId && (
              <Button href={`/jobs/${jobId}/review`} variant="orange" className="w-full">
                <RefreshCw className="h-4 w-4" /> Try Again
              </Button>
            )}
            {jobId && (
              <Button href={`/jobs/${jobId}`} variant="outline" className="w-full dark:border-slate-600 dark:text-slate-300">
                <ArrowLeft className="h-4 w-4" /> Back to Job
              </Button>
            )}
            <Button href="/jobs" variant="ghost" className="w-full text-brand-slate dark:text-slate-400">
              Browse Jobs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-brand-slate dark:text-slate-400">Loading...</div>}>
      <FailedContent />
    </Suspense>
  );
}
