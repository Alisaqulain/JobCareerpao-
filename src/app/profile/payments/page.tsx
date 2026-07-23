"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download, Receipt } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { api } from "@/hooks/useApi";

interface PaymentRow {
  _id: string;
  razorpayPaymentId?: string;
  razorpayOrderId: string;
  amount: number;
  gstAmount: number;
  status: string;
  refundStatus: string;
  paidAt?: string;
  createdAt: string;
  receiptNumber?: string;
  jobId: { title?: string; company?: string };
  applicationId?: { applicationNumber?: string; status?: string };
}

export default function PaymentHistoryPage() {
  const { status } = useSession();
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentRow[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login?redirect=/profile/payments");
      return;
    }
    if (status === "authenticated") {
      api<PaymentRow[]>("/api/user/payments").then((res) => {
        if (res.data) setPayments(res.data);
      });
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-brand-gray dark:bg-slate-950 py-10">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-brand-dark dark:text-white">Payment History</h1>
            <p className="text-sm text-brand-slate">All your job application payments</p>
          </div>
          <Button href="/profile" variant="outline">Back to Dashboard</Button>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="min-w-full text-sm">
            <thead className="bg-brand-gray dark:bg-slate-800 text-left text-xs uppercase text-brand-slate">
              <tr>
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3">
                    <p className="font-medium dark:text-white">{p.jobId?.title}</p>
                    <p className="text-xs text-brand-slate">{p.jobId?.company}</p>
                  </td>
                  <td className="px-4 py-3 font-medium">₹{p.amount}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-lg px-2 py-1 text-xs font-semibold capitalize ${
                      p.status === "paid" ? "bg-green-100 text-green-700" :
                      p.status === "failed" ? "bg-red-100 text-red-700" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{p.razorpayPaymentId || "—"}</td>
                  <td className="px-4 py-3 text-xs">
                    {p.paidAt
                      ? new Date(p.paidAt).toLocaleDateString("en-IN")
                      : new Date(p.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    {p.status === "paid" ? (
                      <Link href={`/payment/receipt/${p._id}`} className="inline-flex items-center gap-1 text-brand-blue hover:underline">
                        <Download className="h-3.5 w-3.5" /> Receipt
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && (
            <div className="py-16 text-center text-brand-slate">
              <Receipt className="mx-auto h-10 w-10 opacity-40" />
              <p className="mt-2">No payments yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
