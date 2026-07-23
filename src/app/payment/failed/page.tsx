"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

function FailedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const jobId = searchParams.get("jobId");
  const reason = searchParams.get("reason") || "Your payment could not be processed.";

  return (
    <div className="min-h-[70vh] bg-brand-gray dark:bg-slate-950 py-16">
      <div className="mx-auto max-w-lg px-4 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-brand-dark dark:text-white">
          Payment Failed
        </h1>
        <p className="mt-4 rounded-xl bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {decodeURIComponent(reason)}
        </p>
        {orderId && (
          <p className="mt-2 text-xs text-brand-slate">Order ID: {orderId}</p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {jobId && (
            <Button href={`/jobs/${jobId}/review`} variant="orange">
              <RefreshCw className="h-4 w-4" /> Retry Payment
            </Button>
          )}
          {jobId && (
            <Button href={`/jobs/${jobId}`} variant="outline">
              <ArrowLeft className="h-4 w-4" /> Back to Job
            </Button>
          )}
          <Button href="/jobs" variant="ghost">Browse Jobs</Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-brand-slate">Loading...</div>}>
      <FailedContent />
    </Suspense>
  );
}
