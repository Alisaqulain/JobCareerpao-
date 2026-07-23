import Razorpay from "razorpay";
import crypto from "crypto";
import { logger } from "@/lib/utils/logger";

let razorpay: Razorpay | null = null;

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials are not configured");
  }
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
}

export async function createRazorpayOrder(params: {
  amount: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const client = getRazorpay();
  const order = await client.orders.create({
    amount: Math.round(params.amount * 100),
    currency: "INR",
    receipt: params.receipt.slice(0, 40),
    notes: params.notes,
  });
  logger.info("Razorpay order created", { orderId: order.id, receipt: params.receipt });
  return order;
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected === signature;
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    logger.error("RAZORPAY_WEBHOOK_SECRET not configured");
    return false;
  }
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected === signature;
}

export async function fetchRazorpayPayment(paymentId: string) {
  const client = getRazorpay();
  return client.payments.fetch(paymentId);
}

export function getRazorpayKeyId() {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "";
}
