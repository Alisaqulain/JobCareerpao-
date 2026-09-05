"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CreditCard, Shield, Loader2 } from "lucide-react";
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

  const openPaymentLink = async () => {
    if (!order || !jobId) return;
    setPaying(true);
    try {
      const res = await api<{ url: string }>("/api/payments/payment-link", {
        method: "POST",
        json: { orderId: order.orderId, jobId },
      });
      if (!res.data?.url) throw new Error(res.message || "Could not open Razorpay page");
      window.location.href = res.data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not open payment page");
      setPaying(false);
    }
  };

  const openCheckout = useCallback(async () => {
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
      if (!loaded) throw new Error("Failed to load Razorpay checkout");

      const Razorpay = (window as unknown as {
        Razorpay: new (options: Record<string, unknown>) => {
          open: () => void;
          on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void;
        };
      }).Razorpay;

      if (!order.key?.startsWith("rzp_")) {
        throw new Error("Razorpay key is missing. Restart the server after updating .env.local.");
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
            router.push(`/payment/failed?orderId=${order.orderId}&reason=${encodeURIComponent(verifyRes.message || "Verification failed")}`);
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
        const description = response.error?.description || "Payment failed. Try another method.";
        if (description.toLowerCase().includes("no appropriate payment method")) {
          toast.error("Checkout popup failed. Use the Razorpay hosted page button below.");
        } else {
          toast.error(description);
        }
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  const logoProps = getJobLogoProps({
    company: order.company,
    companyLogo: order.companyLogo,
    companyColor: order.companyColor,
  });

  const isLiveKey = order.key.startsWith("rzp_live_");
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  return (
    <div className="min-h-screen bg-brand-gray dark:bg-slate-950 py-10">
      <div className="mx-auto max-w-lg px-4">
        {isLiveKey && isLocalhost && (
          <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Razorpay live keys on localhost</p>
            <p className="mt-1">
              Live checkout often fails on localhost. Use <strong>Test mode</strong> keys in{" "}
              <code className="text-xs">.env.local</code> and restart the server.
            </p>
          </div>
        )}
        {!isLiveKey && isLocalhost && (
          <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            <p className="font-semibold">Test mode active</p>
            <p className="mt-1">
              If the popup fails, use <strong>Pay on Razorpay Page</strong> below (recommended).
              Test UPI: <code className="text-xs">success@razorpay</code> · Test card:{" "}
              <code className="text-xs">4111 1111 1111 1111</code>
            </p>
          </div>
        )}
        <div className="glass-strong rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-2 text-brand-cyan">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-semibold">Secure Payment via Razorpay</span>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <CompanyLogo {...logoProps} size="lg" />
            <div>
              <h1 className="font-display text-xl font-bold dark:text-white">{order.jobTitle}</h1>
              <p className="text-sm text-brand-slate">{order.company}</p>
            </div>
          </div>

          <div className="mt-6">
            <FeeBreakdown applicationFee={order.baseAmount} />
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Button
              onClick={openPaymentLink}
              variant="orange"
              className="w-full"
              size="lg"
              disabled={paying || !scriptReady}
            >
              <CreditCard className="h-5 w-5" />
              {paying ? "Opening Razorpay..." : `Pay ₹${order.amount.toFixed(2)} on Razorpay Page`}
            </Button>
            <Button
              onClick={openCheckout}
              variant="outline"
              className="w-full"
              size="lg"
              disabled={paying || !scriptReady}
            >
              Pay in popup (alternative)
            </Button>
            <p className="text-center text-xs text-brand-slate">
              UPI · Cards · Net Banking · Wallets accepted
            </p>
            {order.amount < 10 && (
              <p className="mt-2 text-center text-xs text-amber-700">
                For reliable checkout, set the job application fee to at least ₹10 in admin.
              </p>
            )}
          </div>

          <Button href={`/jobs/${jobId}/review`} variant="ghost" className="mt-4 w-full">
            Back to Review
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-brand-blue" /></div>}>
      <PaymentContent />
    </Suspense>
  );
}
