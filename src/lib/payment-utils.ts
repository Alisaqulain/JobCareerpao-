import { APPLY_GST, GST_RATE } from "@/lib/constants";

export interface FeeBreakdown {
  applicationFee: number;
  gst: number;
  gstRate: number;
  total: number;
  applyGst: boolean;
}

export function calculateFeeBreakdown(applicationFee: number): FeeBreakdown {
  if (!APPLY_GST) {
    return {
      applicationFee,
      gst: 0,
      gstRate: 0,
      total: applicationFee,
      applyGst: false,
    };
  }
  const gst = Math.round(applicationFee * GST_RATE * 100) / 100;
  return {
    applicationFee,
    gst,
    gstRate: GST_RATE,
    total: Math.round((applicationFee + gst) * 100) / 100,
    applyGst: true,
  };
}

export function generateReceiptNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RCP-${ts}-${rand}`;
}

export function generateApplicationNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  return `APP-${ts}`;
}

export const APPLICATION_STORAGE_KEY = "jcp_application_draft";

export interface ApplicationDraft {
  jobId: string;
  formAnswers: Record<string, unknown>;
  resumeUrl: string;
  savedAt: string;
}

export function saveApplicationDraft(draft: ApplicationDraft) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(APPLICATION_STORAGE_KEY, JSON.stringify(draft));
}

export function getApplicationDraft(jobId?: string): ApplicationDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(APPLICATION_STORAGE_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as ApplicationDraft;
    if (jobId && draft.jobId !== jobId) return null;
    return draft;
  } catch {
    return null;
  }
}

export function clearApplicationDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(APPLICATION_STORAGE_KEY);
}
