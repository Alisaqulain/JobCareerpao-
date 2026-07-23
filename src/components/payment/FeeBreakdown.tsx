"use client";

import { calculateFeeBreakdown } from "@/lib/payment-utils";

interface FeeBreakdownProps {
  applicationFee: number;
  className?: string;
}

export function FeeBreakdown({ applicationFee, className = "" }: FeeBreakdownProps) {
  const fees = calculateFeeBreakdown(applicationFee);

  return (
    <div className={`rounded-xl border border-slate-200 dark:border-slate-700 bg-brand-gray/50 dark:bg-slate-800/50 p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-brand-dark dark:text-white">Fee Breakdown</h3>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-brand-slate">Application Fee</dt>
          <dd className="font-medium dark:text-white">₹{fees.applicationFee.toFixed(2)}</dd>
        </div>
        {fees.applyGst && (
          <div className="flex justify-between">
            <dt className="text-brand-slate">GST ({(fees.gstRate * 100).toFixed(0)}%)</dt>
            <dd className="font-medium dark:text-white">₹{fees.gst.toFixed(2)}</dd>
          </div>
        )}
        <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2">
          <dt className="font-semibold text-brand-dark dark:text-white">Total Amount</dt>
          <dd className="font-bold text-brand-orange">₹{fees.total.toFixed(2)}</dd>
        </div>
      </dl>
    </div>
  );
}
