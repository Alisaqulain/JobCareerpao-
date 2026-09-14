"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CheckCircle2,
  Download,
  FileText,
  Briefcase,
  Mail,
  Printer,
  Shield,
  Clock,
  Building2,
  User,
  Phone,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { api } from "@/hooks/useApi";

interface ConfirmationData {
  receiptNumber?: string;
  paymentId?: string;
  orderId?: string;
  applicationNumber?: string;
  candidateName?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  company?: string;
  jobTitle?: string;
  amount?: number;
  paidAt?: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const paymentId = searchParams.get("paymentId");
  const razorpayPaymentId = searchParams.get("razorpayPaymentId");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  const [data, setData] = useState<ConfirmationData | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login?redirect=/payment/success");
      return;
    }
    if (status !== "authenticated" || !paymentId) return;

    api<ConfirmationData>(`/api/payments/receipt/${paymentId}`).then((res) => {
      if (res.data) setData(res.data);
    });
  }, [status, paymentId, router]);

  const name = data?.candidateName || "Candidate";
  const jobTitle = data?.jobTitle || "your selected role";
  const company = data?.company || "the company";
  const appNo = data?.applicationNumber;
  const paidAmount = data?.amount ?? (amount ? Number(amount) : undefined);
  const paidDate = data?.paidAt
    ? new Date(data.paidAt).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-brand-gray py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-2xl px-4">
        {/* Congrats banner */}
        <div className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-white shadow-card dark:border-emerald-900/40 dark:bg-slate-900">
          <div className="bg-gradient-to-r from-emerald-600 to-brand-cyan px-6 py-8 text-center text-white sm:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
              Congratulations, {name}!
            </h1>
            <p className="mt-2 text-sm text-emerald-50 sm:text-base">
              Your application has been successfully submitted.
            </p>
          </div>

          {/* Formal letter */}
          <div className="px-6 py-8 sm:px-10">
            <article className="rounded-xl border border-slate-100 bg-slate-50/70 p-5 text-left dark:border-slate-700 dark:bg-slate-800/40 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-cyan">
                Official confirmation letter
              </p>
              <p className="mt-4 text-sm leading-relaxed text-brand-dark dark:text-slate-200">
                Dear <strong>{name}</strong>,
              </p>
              <p className="mt-3 text-sm leading-relaxed text-brand-slate dark:text-slate-300">
                On behalf of <strong>JobCareerPao</strong>, we thank you for trusting our platform.
                We confirm that your job application for{" "}
                <strong className="text-brand-dark dark:text-white">{jobTitle}</strong> at{" "}
                <strong className="text-brand-dark dark:text-white">{company}</strong> has been
                received, payment verified, and securely recorded in our system.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-brand-slate dark:text-slate-300">
                Your details have been registered for this application. The hiring team will review
                your profile as per their process. You can track status anytime from your JobCareerPao
                account.
              </p>

              <div className="mt-5 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-600 dark:bg-slate-900/60 sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <User className="mt-0.5 h-4 w-4 text-brand-cyan" />
                  <div>
                    <p className="text-xs text-brand-slate dark:text-slate-400">Candidate</p>
                    <p className="font-medium text-brand-dark dark:text-white">{name}</p>
                  </div>
                </div>
                {data?.candidateEmail && (
                  <div className="flex items-start gap-2">
                    <Mail className="mt-0.5 h-4 w-4 text-brand-cyan" />
                    <div>
                      <p className="text-xs text-brand-slate dark:text-slate-400">Email</p>
                      <p className="break-all font-medium text-brand-dark dark:text-white">
                        {data.candidateEmail}
                      </p>
                    </div>
                  </div>
                )}
                {data?.candidatePhone && (
                  <div className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-4 w-4 text-brand-cyan" />
                    <div>
                      <p className="text-xs text-brand-slate dark:text-slate-400">Phone</p>
                      <p className="font-medium text-brand-dark dark:text-white">{data.candidatePhone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <Building2 className="mt-0.5 h-4 w-4 text-brand-cyan" />
                  <div>
                    <p className="text-xs text-brand-slate dark:text-slate-400">Company</p>
                    <p className="font-medium text-brand-dark dark:text-white">{company}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:col-span-2">
                  <Briefcase className="mt-0.5 h-4 w-4 text-brand-cyan" />
                  <div>
                    <p className="text-xs text-brand-slate dark:text-slate-400">Position applied</p>
                    <p className="font-medium text-brand-dark dark:text-white">{jobTitle}</p>
                  </div>
                </div>
                {appNo && (
                  <div className="flex items-start gap-2">
                    <BadgeCheck className="mt-0.5 h-4 w-4 text-brand-cyan" />
                    <div>
                      <p className="text-xs text-brand-slate dark:text-slate-400">Application No.</p>
                      <p className="font-mono text-sm font-semibold text-brand-dark dark:text-white">
                        {appNo}
                      </p>
                    </div>
                  </div>
                )}
                {typeof paidAmount === "number" && !Number.isNaN(paidAmount) && (
                  <div className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-4 w-4 text-brand-orange" />
                    <div>
                      <p className="text-xs text-brand-slate dark:text-slate-400">Fee paid</p>
                      <p className="font-bold text-brand-orange">₹{paidAmount}</p>
                    </div>
                  </div>
                )}
              </div>

              <p className="mt-5 text-sm leading-relaxed text-brand-slate dark:text-slate-300">
                A confirmation email with your application details has also been sent to your inbox.
                Please keep your Application Number safe for future reference.
              </p>
              <p className="mt-4 text-sm text-brand-dark dark:text-slate-200">
                Warm regards,<br />
                <strong>Team JobCareerPao</strong>
              </p>
            </article>

            {/* What next / trust */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: Shield,
                  title: "Secure platform",
                  text: "Payment via Razorpay. Your data is protected.",
                },
                {
                  icon: Clock,
                  title: "Tracked status",
                  text: "Follow updates from your profile dashboard.",
                },
                {
                  icon: BadgeCheck,
                  title: "Verified process",
                  text: "Application recorded for this company only.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50"
                >
                  <item.icon className="h-5 w-5 text-brand-cyan" />
                  <p className="mt-2 text-sm font-semibold text-brand-dark dark:text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-brand-slate dark:text-slate-400">{item.text}</p>
                </div>
              ))}
            </div>

            {/* Payment refs */}
            <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-left text-sm dark:border-slate-700 dark:bg-slate-800/50">
              {(razorpayPaymentId || data?.paymentId) && (
                <div className="flex justify-between gap-3 border-b border-slate-200 py-2 dark:border-slate-700">
                  <span className="shrink-0 text-brand-slate dark:text-slate-400">Payment ID</span>
                  <span className="truncate font-mono text-xs font-medium text-brand-dark dark:text-white">
                    {data?.paymentId || razorpayPaymentId}
                  </span>
                </div>
              )}
              {(orderId || data?.orderId) && (
                <div className="flex justify-between gap-3 border-b border-slate-200 py-2 dark:border-slate-700">
                  <span className="shrink-0 text-brand-slate dark:text-slate-400">Order ID</span>
                  <span className="truncate font-mono text-xs font-medium text-brand-dark dark:text-white">
                    {data?.orderId || orderId}
                  </span>
                </div>
              )}
              {data?.receiptNumber && (
                <div className="flex justify-between gap-3 border-b border-slate-200 py-2 dark:border-slate-700">
                  <span className="shrink-0 text-brand-slate dark:text-slate-400">Receipt No.</span>
                  <span className="font-mono text-xs font-medium text-brand-dark dark:text-white">
                    {data.receiptNumber}
                  </span>
                </div>
              )}
              {paidDate && (
                <div className="flex justify-between gap-3 py-2">
                  <span className="text-brand-slate dark:text-slate-400">Paid at</span>
                  <span className="text-xs font-medium text-brand-dark dark:text-white">{paidDate}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-brand-slate dark:text-slate-400">
              <Mail className="h-4 w-4 text-brand-cyan" />
              Confirmation email sent to your registered inbox
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {paymentId && (
                <>
                  <Button href={`/payment/receipt/${paymentId}`} className="flex-1">
                    <Download className="h-4 w-4" /> View Receipt
                  </Button>
                  <Button
                    href={`/payment/receipt/${paymentId}`}
                    variant="outline"
                    className="flex-1 dark:border-slate-600 dark:text-slate-300"
                  >
                    <Printer className="h-4 w-4" /> Print / Download
                  </Button>
                </>
              )}
              <Button href="/profile" variant="outline" className="flex-1 dark:border-slate-600 dark:text-slate-300">
                View Applications
              </Button>
              <Button href="/jobs" variant="ghost" className="flex-1 text-brand-slate dark:text-slate-400">
                <Briefcase className="h-4 w-4" /> Browse More Jobs
              </Button>
            </div>
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
