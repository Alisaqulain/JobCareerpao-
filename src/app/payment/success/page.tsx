"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Download, FileText, Briefcase, Mail, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");
  const razorpayPaymentId = searchParams.get("razorpayPaymentId");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-brand-gray via-white to-brand-gray py-16 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-md px-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-card dark:border-slate-700/80 dark:bg-slate-900">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold text-brand-dark dark:text-white">
            Payment Successful
          </h1>
          <p className="mt-2 text-sm text-brand-slate dark:text-slate-400">
            Your application has been submitted successfully.
          </p>

          <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-left text-sm dark:border-slate-700 dark:bg-slate-800/50">
            {razorpayPaymentId && (
              <div className="flex justify-between gap-3 py-2 border-b border-slate-200 dark:border-slate-700">
                <span className="shrink-0 text-brand-slate dark:text-slate-400">Payment ID</span>
                <span className="truncate font-mono text-xs font-medium text-brand-dark dark:text-white">
                  {razorpayPaymentId}
                </span>
              </div>
            )}
            {orderId && (
              <div className="flex justify-between gap-3 py-2 border-b border-slate-200 dark:border-slate-700">
                <span className="shrink-0 text-brand-slate dark:text-slate-400">Order ID</span>
                <span className="truncate font-mono text-xs font-medium text-brand-dark dark:text-white">
                  {orderId}
                </span>
              </div>
            )}
            {amount && (
              <div className="flex justify-between py-2">
                <span className="text-brand-slate dark:text-slate-400">Amount Paid</span>
                <span className="font-bold text-brand-orange">₹{amount}</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-brand-slate dark:text-slate-400">
            <Mail className="h-4 w-4 text-brand-cyan" />
            Confirmation email sent to your inbox
          </div>

          <div className="mt-8 flex flex-col gap-3">
            {paymentId && (
              <>
                <Button href={`/payment/receipt/${paymentId}`} className="w-full">
                  <Download className="h-4 w-4" /> View Receipt
                </Button>
                <Button href={`/payment/receipt/${paymentId}`} variant="outline" className="w-full dark:border-slate-600 dark:text-slate-300">
                  <Printer className="h-4 w-4" /> Print / Download
                </Button>
              </>
            )}
            <Button href="/profile" variant="outline" className="w-full dark:border-slate-600 dark:text-slate-300">
              View Applications
            </Button>
            <Button href="/profile/payments" variant="ghost" className="w-full text-brand-slate dark:text-slate-400">
              <FileText className="h-4 w-4" /> Payment History
            </Button>
            <Button href="/jobs" variant="ghost" className="w-full text-brand-slate dark:text-slate-400">
              <Briefcase className="h-4 w-4" /> Browse More Jobs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-brand-slate dark:text-slate-400">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
