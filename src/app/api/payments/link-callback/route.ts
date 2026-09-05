import { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { handlePaymentLinkCallback } from "@/lib/services/payment.service";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login?redirect=/jobs");
  }

  const params = request.nextUrl.searchParams;
  const jobId = params.get("jobId") || "";
  const paymentId = params.get("paymentId") || "";
  const razorpayPaymentId = params.get("razorpay_payment_id") || "";
  const razorpayPaymentLinkId = params.get("razorpay_payment_link_id") || "";
  const razorpayPaymentLinkReferenceId = params.get("razorpay_payment_link_reference_id") || "";
  const razorpaySignature = params.get("razorpay_signature") || "";

  if (
    !jobId ||
    !paymentId ||
    !razorpayPaymentId ||
    !razorpayPaymentLinkId ||
    !razorpayPaymentLinkReferenceId ||
    !razorpaySignature
  ) {
    redirect(`/payment/failed?reason=${encodeURIComponent("Missing payment callback parameters")}`);
  }

  try {
    const result = await handlePaymentLinkCallback({
      userId: session.user.id,
      jobId,
      paymentId,
      razorpayPaymentId,
      razorpayPaymentLinkId,
      razorpayPaymentLinkReferenceId,
      razorpaySignature,
    });

    redirect(
      `/payment/success?paymentId=${String(result.payment._id)}&razorpayPaymentId=${razorpayPaymentId}&orderId=${result.payment.razorpayOrderId}&amount=${result.payment.amount}`
    );
  } catch (err) {
    redirect(
      `/payment/failed?reason=${encodeURIComponent(err instanceof Error ? err.message : "Payment verification failed")}`
    );
  }
}
