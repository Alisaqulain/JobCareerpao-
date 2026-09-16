import type { DynamicField } from "@/types";

export const BOARD_OPTIONS = [
  "CBSE",
  "CISCE (ICSE/ISC)",
  "State Board",
  "NIOS",
  "IB",
  "Other",
] as const;

export const QUALIFICATION_OPTIONS = [
  "10th Pass",
  "12th Pass",
  "Diploma",
  "Graduate",
  "Post Graduate",
  "Other",
] as const;

/** Standard form shown on every job application */
export const STANDARD_APPLICATION_FIELDS: DynamicField[] = [
  {
    id: "fullName",
    label: "Full Name",
    type: "text",
    required: true,
    placeholder: "As per Aadhaar / ID proof",
  },
  {
    id: "fatherName",
    label: "Father Name",
    type: "text",
    required: true,
    placeholder: "Father's full name",
  },
  {
    id: "motherName",
    label: "Mother Name",
    type: "text",
    required: true,
    placeholder: "Mother's full name",
  },
  {
    id: "aadharNumber",
    label: "Aadhaar Number",
    type: "text",
    required: true,
    placeholder: "12-digit Aadhaar number",
    validation: { pattern: "^[0-9]{12}$", min: 12, max: 12 },
  },
  {
    id: "panCard",
    label: "PAN Card",
    type: "text",
    required: true,
    placeholder: "ABCDE1234F",
    validation: { pattern: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$" },
  },
  {
    id: "highestQualification",
    label: "Highest Qualification",
    type: "select",
    required: true,
    options: [...QUALIFICATION_OPTIONS],
  },
  {
    id: "board10",
    label: "10th Board Name",
    type: "select",
    required: false,
    options: [...BOARD_OPTIONS],
  },
  {
    id: "percentage10",
    label: "10th Percentage",
    type: "number",
    required: false,
    placeholder: "e.g. 78.5",
    validation: { min: 0, max: 100 },
  },
  {
    id: "board12",
    label: "12th Board Name",
    type: "select",
    required: false,
    options: [...BOARD_OPTIONS],
  },
  {
    id: "percentage12",
    label: "12th Percentage",
    type: "number",
    required: false,
    placeholder: "e.g. 82",
    validation: { min: 0, max: 100 },
  },
  {
    id: "mobileNumber",
    label: "Mobile Number",
    type: "phone",
    required: true,
    placeholder: "10-digit mobile number",
    validation: { pattern: "^[6-9][0-9]{9}$", min: 10, max: 10 },
  },
];

/** Select fields that support an "Other" text input */
export const SELECT_OTHER_FIELDS = new Set(["board10", "board12", "highestQualification"]);

export function resolveAnswerDisplay(fieldId: string, answers: Record<string, unknown>) {
  const value = String(answers[fieldId] ?? "").trim();
  if (value === "Other") {
    const other = String(answers[`${fieldId}_other`] ?? "").trim();
    return other || "Other";
  }
  return value || "—";
}

export function validateStandardApplicationForm(answers: Record<string, unknown>) {
  for (const field of STANDARD_APPLICATION_FIELDS) {
    const raw = answers[field.id];
    const value = String(raw ?? "").trim();

    if (field.required && !value) {
      return `${field.label} is required`;
    }

    if (!value) continue;

    if (field.id === "aadharNumber" && !/^\d{12}$/.test(value)) {
      return "Aadhaar number must be exactly 12 digits";
    }

    if (field.id === "panCard" && !/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(value)) {
      return "Enter a valid PAN (e.g. ABCDE1234F)";
    }

    if (field.id === "mobileNumber") {
      const phone = value.replace(/\D/g, "").slice(-10);
      if (!/^[6-9]\d{9}$/.test(phone)) {
        return "Enter a valid 10-digit mobile number";
      }
    }

    if (
      (field.id === "percentage10" || field.id === "percentage12") &&
      value !== ""
    ) {
      const num = Number(value);
      if (Number.isNaN(num) || num < 0 || num > 100) {
        return `${field.label} must be between 0 and 100`;
      }
    }

    if (SELECT_OTHER_FIELDS.has(field.id) && value === "Other") {
      const other = String(answers[`${field.id}_other`] ?? "").trim();
      if (!other) {
        return `Please specify ${field.label} (Other)`;
      }
    }
  }

  return null;
}

/** Normalize answers before save (PAN uppercase, phone digits, Other text) */
export function normalizeApplicationAnswers(answers: Record<string, unknown>) {
  const next = { ...answers };
  if (next.panCard) next.panCard = String(next.panCard).trim().toUpperCase();
  if (next.aadharNumber) next.aadharNumber = String(next.aadharNumber).replace(/\D/g, "").slice(0, 12);
  if (next.mobileNumber) {
    next.mobileNumber = String(next.mobileNumber).replace(/\D/g, "").slice(-10);
  }

  for (const id of SELECT_OTHER_FIELDS) {
    if (String(next[id] ?? "") === "Other") {
      const other = String(next[`${id}_other`] ?? "").trim();
      if (other) next[id] = other;
    }
  }

  return next;
}
