"use client";

import { calculateFeeBreakdown } from "@/lib/payment-utils";

interface FeeBreakdownProps {
  applicationFee: number;
  className?: string;
}

export function FeeBreakdown({ applicationFee, className = "" }: FeeBreakdownProps) {
  const fees = calculateFeeBreakdown(applicationFee);

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/40 ${className}`}>
      <h3 className="text-sm font-semibold text-brand-dark dark:text-white">Fee Breakdown</h3>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-brand-slate dark:text-slate-400">Application Fee</dt>
          <dd className="font-medium text-brand-dark dark:text-slate-200">₹{fees.applicationFee.toFixed(2)}</dd>
        </div>
        {fees.applyGst && (
          <div className="flex justify-between">
            <dt className="text-brand-slate dark:text-slate-400">GST ({(fees.gstRate * 100).toFixed(0)}%)</dt>
            <dd className="font-medium text-brand-dark dark:text-slate-200">₹{fees.gst.toFixed(2)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-slate-200 pt-2 dark:border-slate-600">
          <dt className="font-semibold text-brand-dark dark:text-white">Total</dt>
          <dd className="font-bold text-brand-orange">₹{fees.total.toFixed(2)}</dd>
        </div>
      </dl>
    </div>
  );
}
