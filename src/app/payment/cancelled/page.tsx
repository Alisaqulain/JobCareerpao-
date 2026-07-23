"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

function CancelledContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-[70vh] bg-brand-gray dark:bg-slate-950 py-16">
      <div className="mx-auto max-w-lg px-4 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <AlertCircle className="h-10 w-10 text-amber-600" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-brand-dark dark:text-white">
          Payment Cancelled
        </h1>
        <p className="mt-2 text-brand-slate">
          You closed the payment window. No amount was charged.
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
          <Button href="/" variant="outline">
            <Home className="h-4 w-4" /> Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelledPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-brand-slate">Loading...</div>}>
      <CancelledContent />
    </Suspense>
  );
}
