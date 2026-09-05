"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CreditCard, Shield, Loader2, Lock, Smartphone, Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CompanyLogo } from "@/components/ui/CompanyLogo";
import { FeeBreakdown } from "@/components/payment/FeeBreakdown";
import { api, loadRazorpay } from "@/hooks/useApi";
import { getJobLogoProps } from "@/lib/job-utils";
import { getApplicationDraft, clearApplicationDraft } from "@/lib/payment-utils";
import { toast } from "sonner";

interface OrderDetails {
  orderId: string;
  paymentId: string;
  amount: number;
  baseAmount: number;
  gstAmount: number;
  key: string;
  jobTitle: string;
  company: string;
  jobId: string;
  status: string;
  companyLogo?: string;
  companyColor?: string;
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const orderId = searchParams.get("orderId");
  const jobId = searchParams.get("jobId");
  const paymentId = searchParams.get("paymentId");
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [userPhone, setUserPhone] = useState("");
  const [paying, setPaying] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/auth/login?redirect=/payment?orderId=${orderId}&jobId=${jobId}`);
      return;
    }
    if (status !== "authenticated") return;
    if (!orderId) {
      router.replace("/jobs");
      return;
    }
    loadRazorpay().then(setScriptReady);

    const params = new URLSearchParams();
    if (paymentId) params.set("paymentId", paymentId);
    const query = params.toString();

    api<OrderDetails>(`/api/payments/order/${encodeURIComponent(orderId)}${query ? `?${query}` : ""}`)
      .then((res) => {
        if (res.data) {
          if (res.data.status === "paid") {
            router.replace(`/payment/success?paymentId=${res.data.paymentId}`);
            return;
          }
          setOrder(res.data);
        } else {
          toast.error(res.message || "Order not found");
          router.replace("/jobs");
        }
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Could not load payment order");
        router.replace("/jobs");
      });

    api<{ phone?: string }>("/api/user/profile").then((res) => {
      if (res.data?.phone) setUserPhone(res.data.phone);
    });
  }, [status, orderId, jobId, paymentId, router]);

  const handlePay = useCallback(async () => {
    if (!order || !jobId) return;
    const draft = getApplicationDraft(jobId);
    if (!draft) {
      toast.error("Application data expired. Please apply again.");
      router.push(`/jobs/${jobId}/apply`);
      return;
    }

    setPaying(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Failed to load payment gateway");

      const Razorpay = (window as unknown as {
        Razorpay: new (options: Record<string, unknown>) => {
          open: () => void;
          on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void;
        };
      }).Razorpay;

      if (!order.key?.startsWith("rzp_")) {
        throw new Error("Payment gateway is not configured. Please contact support.");
      }

      const rzp = new Razorpay({
        key: order.key,
        order_id: order.orderId,
        name: "JobCareerPao",
        description: `${order.jobTitle} — ${order.company}`,
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
          contact: userPhone.replace(/\D/g, "").slice(-10) || undefined,
        },
        notes: {
          job_id: jobId,
          payment_id: order.paymentId,
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await api<{
            payment: { _id: string };
            application: { applicationNumber: string };
          }>("/api/payments/verify", {
            method: "POST",
            json: {
              jobId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              formAnswers: draft.formAnswers,
              resumeType: draft.resumeType,
              resumeUrl: draft.resumeUrl,
              resumePublicId: draft.resumePublicId,
              coverLetter: draft.coverLetter,
            },
          });

          if (verifyRes.success) {
            clearApplicationDraft();
            const pid = verifyRes.data?.payment?._id || order.paymentId;
            router.push(
              `/payment/success?paymentId=${pid}&razorpayPaymentId=${response.razorpay_payment_id}&orderId=${response.razorpay_order_id}&amount=${order.amount}`
            );
          } else {
            router.push(
              `/payment/failed?orderId=${order.orderId}&jobId=${jobId}&reason=${encodeURIComponent(verifyRes.message || "Verification failed")}`
            );
          }
        },
        modal: {
          ondismiss: async () => {
            await api("/api/payments/cancelled", {
              method: "POST",
              json: { orderId: order.orderId },
            });
            router.push(`/payment/cancelled?orderId=${order.orderId}&jobId=${jobId}`);
          },
        },
        theme: { color: "#0B4F8A" },
      });

      rzp.on("payment.failed", (response) => {
        toast.error(response.error?.description || "Payment failed. Please try again.");
      });

      rzp.open();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setPaying(false);
    }
  }, [order, jobId, session, userPhone, router]);

  if (!order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-brand-gray dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-blue" />
          <p className="mt-3 text-sm text-brand-slate dark:text-slate-400">Preparing secure checkout...</p>
        </div>
      </div>
    );
  }

  const logoProps = getJobLogoProps({
    company: order.company,
    companyLogo: order.companyLogo,
    companyColor: order.companyColor,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-gray via-white to-brand-gray py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-md px-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card dark:border-slate-700/80 dark:bg-slate-900">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-blue to-brand-cyan px-6 py-5 text-white">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-semibold tracking-wide">Secure Checkout</span>
            </div>
            <p className="mt-1 text-xs text-blue-100">256-bit encrypted · Powered by Razorpay</p>
          </div>

          <div className="p-6 sm:p-8">
            {/* Job summary */}
            <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <CompanyLogo {...logoProps} size="lg" />
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-lg font-bold leading-snug text-brand-dark dark:text-white">
                  {order.jobTitle}
                </h1>
                <p className="mt-0.5 truncate text-sm text-brand-slate dark:text-slate-400">{order.company}</p>
              </div>
            </div>

            {/* Fee breakdown */}
            <div className="mt-5">
              <FeeBreakdown applicationFee={order.baseAmount} />
            </div>

            {/* Total highlight */}
            <div className="mt-5 flex items-center justify-between rounded-xl bg-brand-blue/5 px-4 py-3 dark:bg-brand-blue/10">
              <span className="text-sm font-medium text-brand-dark dark:text-slate-200">Amount to pay</span>
              <span className="font-display text-2xl font-bold text-brand-orange">₹{order.amount.toFixed(2)}</span>
            </div>

            {/* Payment methods */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                { icon: Smartphone, label: "UPI" },
                { icon: CreditCard, label: "Cards" },
                { icon: Building2, label: "Net Banking" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1 rounded-lg border border-slate-100 bg-white py-2.5 dark:border-slate-700 dark:bg-slate-800/60"
                >
                  <Icon className="h-4 w-4 text-brand-cyan" />
                  <span className="text-[11px] font-medium text-brand-slate dark:text-slate-400">{label}</span>
                </div>
              ))}
            </div>

            {/* Pay button */}
            <Button
              onClick={handlePay}
              variant="orange"
              className="mt-6 w-full"
              size="lg"
              disabled={paying || !scriptReady}
            >
              <Lock className="h-4 w-4" />
              {paying ? "Opening payment..." : `Pay ₹${order.amount.toFixed(2)} Securely`}
            </Button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-brand-slate dark:text-slate-500">
              <Lock className="h-3 w-3" />
              Your payment is secured by Razorpay
            </p>

            <Button href={`/jobs/${jobId}/review`} variant="ghost" className="mt-4 w-full text-brand-slate dark:text-slate-400">
              ← Back to Review
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center bg-brand-gray dark:bg-slate-950">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
