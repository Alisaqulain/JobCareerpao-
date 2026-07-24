"use client";

import { useEffect, useState } from "react";
import { api } from "@/hooks/useApi";
import { Download, Search } from "lucide-react";

interface PaymentRow {
  _id: string;
  razorpayPaymentId?: string;
  razorpayOrderId: string;
  amount: number;
  gstAmount: number;
  status: string;
  gateway: string;
  refundStatus: string;
  paidAt?: string;
  createdAt: string;
  userId: { name?: string; email?: string };
  jobId: { title?: string; company?: string };
  applicationId?: { applicationNumber?: string; appliedDate?: string; status?: string };
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const load = () => {
    const params = new URLSearchParams({ limit: "100" });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    api<PaymentRow[]>(`/api/admin/payments?${params}`).then((res) => {
      if (res.data) setPayments(res.data);
    });
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-brand-dark">Payments</h1>
              <p className="text-sm text-brand-slate">All Razorpay transactions</p>
            </div>
            <div className="flex gap-2">
              <a href="/api/admin/payments?export=csv" className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-brand-gray">
                <Download className="h-4 w-4" /> CSV
              </a>
              <a href="/api/admin/payments?export=excel" className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-brand-gray">
                <Download className="h-4 w-4" /> Excel
              </a>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-slate" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search payment ID, user, email..."
                className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-11 rounded-xl border border-slate-200 px-3 text-sm"
            >
              <option value="">All statuses</option>
              <option value="paid">Paid</option>
              <option value="created">Created</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
            <button type="button" onClick={load} className="rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold text-white">
              Filter
            </button>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-brand-gray text-left text-xs uppercase text-brand-slate">
                <tr>
                  <th className="px-4 py-3">Payment ID</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Job / Company</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Gateway</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Refund</th>
                  <th className="px-4 py-3">Paid Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-mono text-xs">{p.razorpayPaymentId || p.razorpayOrderId}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{p.userId?.name}</p>
                      <p className="text-xs text-brand-slate">{p.userId?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{p.jobId?.title}</p>
                      <p className="text-xs text-brand-slate">{p.jobId?.company}</p>
                    </td>
                    <td className="px-4 py-3">₹{p.amount}</td>
                    <td className="px-4 py-3 capitalize">{p.gateway}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-lg px-2 py-1 text-xs font-semibold capitalize ${
                        p.status === "paid" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 capitalize text-xs">{p.refundStatus || "none"}</td>
                    <td className="px-4 py-3 text-xs">
                      {p.paidAt ? new Date(p.paidAt).toLocaleString("en-IN") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
    </>
  );
}
