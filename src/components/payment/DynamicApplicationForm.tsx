"use client";

import type { DynamicField } from "@/types";

interface DynamicFormProps {
  fields: DynamicField[];
  answers: Record<string, unknown>;
  onChange: (answers: Record<string, unknown>) => void;
  readOnly?: boolean;
}

export function DynamicApplicationForm({ fields, answers, onChange, readOnly }: DynamicFormProps) {
  const inputClass = "h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm dark:text-white";

  const set = (id: string, value: unknown) => onChange({ ...answers, [id]: value });

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.id}>
          <label className="mb-1 block text-sm font-medium dark:text-slate-200">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          {readOnly ? (
            <p className="rounded-xl bg-brand-gray dark:bg-slate-800 px-3 py-2.5 text-sm dark:text-white">
              {String(answers[field.id] ?? "—")}
            </p>
          ) : field.type === "textarea" ? (
            <textarea
              className={`${inputClass} min-h-[100px] py-2`}
              required={field.required}
              value={String(answers[field.id] ?? "")}
              placeholder={field.placeholder}
              onChange={(e) => set(field.id, e.target.value)}
            />
          ) : field.type === "select" ? (
            <select
              className={inputClass}
              required={field.required}
              value={String(answers[field.id] ?? "")}
              onChange={(e) => set(field.id, e.target.value)}
            >
              <option value="">Select</option>
              {field.options?.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
              className={inputClass}
              required={field.required}
              value={String(answers[field.id] ?? "")}
              placeholder={field.placeholder}
              onChange={(e) => set(field.id, e.target.value)}
            />
          )}
        </div>
      ))}
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
