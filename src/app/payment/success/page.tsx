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
    <div className="min-h-[70vh] bg-brand-gray dark:bg-slate-950 py-16">
      <div className="mx-auto max-w-lg px-4 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold text-brand-dark dark:text-white">
          Payment Successful
        </h1>
        <p className="mt-2 text-brand-slate">Application submitted successfully!</p>

        <div className="mt-8 glass-strong rounded-2xl p-6 text-left text-sm">
          {razorpayPaymentId && (
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-brand-slate">Payment ID</span>
              <span className="font-mono font-medium dark:text-white">{razorpayPaymentId}</span>
            </div>
          )}
          {orderId && (
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-brand-slate">Order ID</span>
              <span className="font-mono font-medium dark:text-white">{orderId}</span>
            </div>
          )}
          {amount && (
            <div className="flex justify-between py-2">
              <span className="text-brand-slate">Amount Paid</span>
              <span className="font-bold text-brand-orange">₹{amount}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-brand-slate">
          <Mail className="h-4 w-4 text-brand-cyan" />
          Confirmation email sent to your inbox
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          {paymentId && (
            <>
              <Button href={`/payment/receipt/${paymentId}`}>
                <Download className="h-4 w-4" /> View Receipt
              </Button>
              <Button href={`/payment/receipt/${paymentId}`} variant="outline">
                <Printer className="h-4 w-4" /> Print / Download
              </Button>
            </>
          )}
          <Button href="/profile/payments" variant="outline">
            <FileText className="h-4 w-4" /> Payment History
          </Button>
          <Button href="/profile">
            View Applications
          </Button>
          <Button href="/jobs" variant="ghost">
            <Briefcase className="h-4 w-4" /> Back to Jobs
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-brand-slate">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
