"use client";

import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { DynamicField } from "@/types";
import {
  SELECT_OTHER_FIELDS,
  resolveAnswerDisplay,
  applicationFileUrlKey,
  applicationFilePublicIdKey,
} from "@/lib/application-form";

interface DynamicFormProps {
  fields: DynamicField[];
  answers: Record<string, unknown>;
  onChange: (answers: Record<string, unknown>) => void;
  readOnly?: boolean;
}

export function DynamicApplicationForm({ fields, answers, onChange, readOnly }: DynamicFormProps) {
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const inputClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-brand-dark dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  const set = (id: string, value: unknown) => onChange({ ...answers, [id]: value });

  const handleFileUpload = async (field: DynamicField, file: File) => {
    setUploadingField(field.id);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "application-photo");
      const res = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
      const body = await res.json();
      if (!res.ok || !body.success || !body.data?.url) {
        throw new Error(body.message || "Upload failed");
      }
      onChange({
        ...answers,
        [applicationFileUrlKey(field.id)]: body.data.url,
        [applicationFilePublicIdKey(field.id)]: body.data.publicId,
      });
      toast.success(`${field.label} uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingField(null);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => {
        const isWide =
          field.type === "textarea" || field.id === "fullName" || field.type === "file";
        const photoUrl = String(answers[applicationFileUrlKey(field.id)] ?? "");
        const supportsOther = SELECT_OTHER_FIELDS.has(field.id) && field.type === "select";
        const current = String(answers[field.id] ?? "");
        const showOtherInput = supportsOther && (current === "Other" || (!!answers[`${field.id}_other`] && !field.options?.includes(current) && current !== ""));

        // In edit mode, if stored value is custom (not in options), treat as Other
        const selectValue =
          supportsOther && current && field.options && !field.options.includes(current) && current !== "Other"
            ? "Other"
            : current;

        return (
          <div key={field.id} className={isWide ? "sm:col-span-2" : undefined}>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-slate-200">
              {field.label}{" "}
              {field.required ? (
                <span className="text-red-500">*</span>
              ) : (
                <span className="text-xs font-normal text-brand-slate">(optional)</span>
              )}
            </label>

            {readOnly ? (
              field.type === "file" && photoUrl ? (
                <img
                  src={photoUrl}
                  alt={field.label}
                  className="h-32 w-32 rounded-xl border border-slate-200 object-cover dark:border-slate-700"
                />
              ) : field.type === "file" ? (
                <p className="rounded-xl bg-brand-gray px-3 py-2.5 text-sm text-brand-slate dark:bg-slate-800">
                  Not uploaded
                </p>
              ) : (
                <p className="rounded-xl bg-brand-gray px-3 py-2.5 text-sm text-brand-dark dark:bg-slate-800 dark:text-white">
                  {resolveAnswerDisplay(field.id, answers)}
                </p>
              )
            ) : field.type === "file" ? (
              <div className="space-y-3">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={field.label}
                    className="h-32 w-32 rounded-xl border border-slate-200 object-cover dark:border-slate-700"
                  />
                ) : null}
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-brand-slate transition hover:border-brand-cyan hover:bg-brand-cyan/5 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-brand-cyan">
                  {uploadingField === field.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      {photoUrl ? "Change photo" : "Upload photo"}
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={uploadingField === field.id}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleFileUpload(field, file);
                      e.target.value = "";
                    }}
                  />
                </label>
                {field.placeholder && (
                  <p className="text-xs text-brand-slate dark:text-slate-400">{field.placeholder}</p>
                )}
              </div>
            ) : field.type === "textarea" ? (
              <textarea
                className={`${inputClass} min-h-[100px] py-2`}
                required={field.required}
                value={String(answers[field.id] ?? "")}
                placeholder={field.placeholder}
                onChange={(e) => set(field.id, e.target.value)}
              />
            ) : field.type === "select" ? (
              <div className="space-y-2">
                <select
                  className={inputClass}
                  required={field.required}
                  value={selectValue}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "Other") {
                      onChange({ ...answers, [field.id]: "Other" });
                    } else {
                      const next = { ...answers, [field.id]: v };
                      delete next[`${field.id}_other`];
                      onChange(next);
                    }
                  }}
                >
                  <option value="">Select</option>
                  {field.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                {(selectValue === "Other" || showOtherInput) && (
                  <input
                    type="text"
                    className={inputClass}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    value={
                      selectValue === "Other"
                        ? String(answers[`${field.id}_other`] ?? "")
                        : current
                    }
                    onChange={(e) => {
                      onChange({
                        ...answers,
                        [field.id]: "Other",
                        [`${field.id}_other`]: e.target.value,
                      });
                    }}
                  />
                )}
              </div>
            ) : (
              <input
                type={
                  field.type === "number"
                    ? "number"
                    : field.type === "date"
                      ? "date"
                      : field.type === "email"
                        ? "email"
                        : field.type === "phone"
                          ? "tel"
                          : "text"
                }
                className={inputClass}
                required={field.required}
                value={String(answers[field.id] ?? "")}
                placeholder={field.placeholder}
                maxLength={field.validation?.max}
                min={field.validation?.min}
                max={field.type === "number" ? field.validation?.max : undefined}
                onChange={(e) => {
                  let v = e.target.value;
                  if (field.id === "panCard") v = v.toUpperCase();
                  if (field.id === "aadharNumber") v = v.replace(/\D/g, "").slice(0, 12);
                  if (field.id === "mobileNumber") v = v.replace(/\D/g, "").slice(0, 10);
                  set(field.id, v);
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function validateDynamicForm(fields: DynamicField[], answers: Record<string, unknown>) {
  for (const field of fields) {
    if (field.required) {
      const val = answers[field.id];
      if (val === undefined || val === null || String(val).trim() === "") {
        return `${field.label} is required`;
      }
    }
  }
  return null;
}
