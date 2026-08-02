import Razorpay from "razorpay";
import crypto from "crypto";
import { logger } from "@/lib/utils/logger";
import { getErrorMessage } from "@/lib/utils/errors";

let razorpay: Razorpay | null = null;
let cachedCredentials: string | null = null;

const PLACEHOLDER_MARKERS = ["xxxxx", "YOUR_", "your_razorpay", "replace_me", "changeme"];
export const RAZORPAY_MIN_AMOUNT_INR = 10;

function currentCredentials() {
  return `${process.env.RAZORPAY_KEY_ID || ""}:${process.env.RAZORPAY_KEY_SECRET || ""}`;
}

export function assertRazorpayKeyPair() {
  const serverKey = process.env.RAZORPAY_KEY_ID || "";
  const publicKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || serverKey;
  if (serverKey && publicKey && serverKey !== publicKey) {
    throw new Error(
      "RAZORPAY_KEY_ID and NEXT_PUBLIC_RAZORPAY_KEY_ID must be the same key pair."
    );
  }
}

export function isRazorpayLiveMode() {
  return (process.env.RAZORPAY_KEY_ID || "").startsWith("rzp_live_");
}

function isPlaceholder(value: string) {
  const normalized = value.trim().toLowerCase();
  return !normalized || PLACEHOLDER_MARKERS.some((marker) => normalized.includes(marker.toLowerCase()));
}

export function assertRazorpayConfigured() {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const secret = process.env.RAZORPAY_KEY_SECRET || "";

  if (isPlaceholder(keyId) || isPlaceholder(secret)) {
    throw new Error(
      "Razorpay keys are missing or still placeholders. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local from Razorpay Dashboard → Settings → API Keys."
    );
  }

  assertRazorpayKeyPair();
}

function getRazorpay() {
  assertRazorpayConfigured();
  const credentials = currentCredentials();
  if (!razorpay || cachedCredentials !== credentials) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
    cachedCredentials = credentials;
  }
  return razorpay;
}

export async function createRazorpayOrder(params: {
  amount: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  if (params.amount < RAZORPAY_MIN_AMOUNT_INR) {
    throw new Error(
      `Payment amount must be at least ₹${RAZORPAY_MIN_AMOUNT_INR}. Update the job application fee in admin.`
    );
  }

  try {
    const client = getRazorpay();
    const order = await client.orders.create({
      amount: Math.round(params.amount * 100),
      currency: "INR",
      receipt: params.receipt.slice(0, 40),
      notes: params.notes,
    });
    logger.info("Razorpay order created", { orderId: order.id, receipt: params.receipt });
    return order;
  } catch (err) {
    const message = getErrorMessage(err, "Razorpay order creation failed");
    logger.error("Razorpay order creation failed", { message, err: String(err) });
    throw new Error(message);
  }
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
