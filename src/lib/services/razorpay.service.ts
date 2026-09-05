import Razorpay from "razorpay";
import crypto from "crypto";
import { logger } from "@/lib/utils/logger";
import { getErrorMessage } from "@/lib/utils/errors";

let razorpay: Razorpay | null = null;
let cachedCredentials: string | null = null;

const PLACEHOLDER_MARKERS = ["xxxxx", "YOUR_", "your_razorpay", "replace_me", "changeme"];
export const RAZORPAY_MIN_AMOUNT_INR = 10;

function trimEnv(value: string | undefined) {
  return (value || "").trim();
}

function currentCredentials() {
  return `${trimEnv(process.env.RAZORPAY_KEY_ID)}:${trimEnv(process.env.RAZORPAY_KEY_SECRET)}`;
}

export function assertRazorpayKeyPair() {
  const serverKey = trimEnv(process.env.RAZORPAY_KEY_ID);
  const publicKey = trimEnv(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) || serverKey;
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
      key_id: trimEnv(process.env.RAZORPAY_KEY_ID)!,
      key_secret: trimEnv(process.env.RAZORPAY_KEY_SECRET)!,
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

export function verifyPaymentLinkSignature(
  paymentLinkId: string,
  paymentId: string,
  referenceId: string,
  signature: string
): boolean {
  const secret = trimEnv(process.env.RAZORPAY_KEY_SECRET);
  if (!secret) return false;
  const body = `${paymentLinkId}|${paymentId}|${referenceId}|paid`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected === signature;
}

export async function createRazorpayPaymentLink(params: {
  amount: number;
  description: string;
  referenceId: string;
  callbackUrl: string;
  customer: { name: string; email: string; contact: string };
}) {
  const client = getRazorpay();
  return client.paymentLink.create({
    amount: Math.round(params.amount * 100),
    currency: "INR",
    description: params.description.slice(0, 255),
    reference_id: params.referenceId.slice(0, 40),
    customer: {
      name: params.customer.name || "Candidate",
      email: params.customer.email,
      contact: params.customer.contact,
    },
    notify: { sms: false, email: false },
    reminder_enable: false,
    callback_url: params.callbackUrl,
    callback_method: "get",
  });
}

export async function fetchRazorpayOrder(orderId: string) {
  const client = getRazorpay();
  return client.orders.fetch(orderId);
}

export async function validateRazorpayOrder(orderId: string, expectedAmountInr: number) {
  const order = await fetchRazorpayOrder(orderId);
  const expectedPaise = Math.round(expectedAmountInr * 100);
  if (Number(order.amount) !== expectedPaise) {
    throw new Error("Payment order amount mismatch. Please create a new order from the review page.");
  }
  if (order.status === "paid") {
    throw new Error("This order is already paid.");
  }
  return order;
}

export function getRazorpayKeyId() {
  return trimEnv(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) || trimEnv(process.env.RAZORPAY_KEY_ID);
}
