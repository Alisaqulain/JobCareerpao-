"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { api } from "@/hooks/useApi";
import { downloadReceiptHtml, printReceipt } from "@/lib/receipt-utils";

interface ReceiptData {
  receiptNumber: string;
  paymentId: string;
  orderId: string;
  applicationNumber: string;
  candidateName: string;
  candidateEmail: string;
  company: string;
  jobTitle: string;
  baseAmount: number;
  gstAmount: number;
  amount: number;
  currency: string;
  status: string;
  paidAt: string;
  method?: string;
}

export default function ReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const { status } = useSession();
  const receiptRef = useRef<HTMLElement>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/auth/login?redirect=/payment/receipt/${params.id}`);
      return;
    }
    if (status !== "authenticated") return;

    api<ReceiptData>(`/api/payments/receipt/${params.id}`).then((res) => {
      if (res.data) {
        setReceipt(res.data);
      } else {
        setError(res.message || "Receipt not found");
      }
    });
  }, [params.id, router, status]);

  if (status === "loading" || (status === "authenticated" && !receipt && !error)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-brand-slate">Loading receipt...</p>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-brand-slate">{error || "Receipt not found"}</p>
        <Button href="/profile/payments" variant="outline">Back to Payments</Button>
      </div>
    );
  }

  const paidDate = receipt.paidAt
    ? new Date(receipt.paidAt).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })
    : "—";

  const handleDownload = () => {
    if (!receiptRef.current) return;
    downloadReceiptHtml(receiptRef.current, receipt.receiptNumber);
  };

  return (
    <div className="min-h-screen bg-brand-gray py-10 print:bg-white print:py-0">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-6 flex flex-wrap justify-end gap-2 print:hidden">
          <Button variant="outline" onClick={printReceipt}>
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4" /> Download
          </Button>
          <Button href="/profile/payments" variant="ghost">Back to Payments</Button>
        </div>

        <article
          ref={receiptRef}
          id="receipt"
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card print:shadow-none print:border-0"
        >
          <header className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-brand-blue">JobCareerPao</h1>
              <p className="text-sm text-brand-slate">Payment Receipt</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold text-brand-dark">{receipt.receiptNumber}</p>
              <p className="text-brand-slate">{paidDate}</p>
            </div>
          </header>

          <section className="mt-6 grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-brand-slate">Candidate</p>
              <p className="font-semibold">{receipt.candidateName}</p>
              <p className="text-brand-slate">{receipt.candidateEmail}</p>
            </div>
            <div>
              <p className="text-brand-slate">Application No.</p>
              <p className="font-semibold">{receipt.applicationNumber}</p>
            </div>
            <div>
              <p className="text-brand-slate">Company</p>
              <p className="font-semibold">{receipt.company}</p>
            </div>
            <div>
              <p className="text-brand-slate">Job Title</p>
              <p className="font-semibold">{receipt.jobTitle}</p>
            </div>
          </section>

          <table className="mt-8 w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-brand-slate">
                <th className="py-2">Description</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-3">Application Fee</td>
                <td className="py-3 text-right">₹{receipt.baseAmount.toFixed(2)}</td>
              </tr>
              {receipt.gstAmount > 0 && (
                <tr className="border-b border-slate-100">
                  <td className="py-3">GST</td>
                  <td className="py-3 text-right">₹{receipt.gstAmount.toFixed(2)}</td>
                </tr>
              )}
              <tr>
                <td className="py-3 font-bold">Total Paid</td>
                <td className="py-3 text-right font-bold text-brand-orange">₹{receipt.amount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <footer className="mt-8 border-t border-slate-200 pt-6 text-xs text-brand-slate">
            <div className="grid gap-2 sm:grid-cols-2">
              <p><span className="font-medium">Payment ID:</span> {receipt.paymentId}</p>
              <p><span className="font-medium">Order ID:</span> {receipt.orderId}</p>
              <p><span className="font-medium">Status:</span> <span className="text-green-600 font-semibold uppercase">{receipt.status}</span></p>
              {receipt.method && <p><span className="font-medium">Method:</span> {receipt.method}</p>}
            </div>
            <p className="mt-4">This is a computer-generated receipt. For support: support@jobcareerpao.com</p>
          </footer>
        </article>
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #receipt, #receipt * { visibility: visible; }
          #receipt { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
