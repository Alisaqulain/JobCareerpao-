"use client";

import { Search } from "lucide-react";
import {
  COMPANY_CATEGORIES,
  HIRING_STATUSES,
} from "@/lib/constants/companies";

export interface CompanyFilterValues {
  search: string;
  category: string;
  city: string;
  state: string;
  hiringStatus: string;
  isActive: string;
}

interface CompanyFiltersProps {
  values: CompanyFilterValues;
  onChange: (values: CompanyFilterValues) => void;
  variant?: "admin" | "public";
}

const inputClass =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-blue";

export function CompanyFilters({ values, onChange, variant = "admin" }: CompanyFiltersProps) {
  const set = (patch: Partial<CompanyFilterValues>) => onChange({ ...values, ...patch });
  const isPublic = variant === "public";

  return (
    <div
      className={`grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 ${
        isPublic ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2 xl:grid-cols-6"
      }`}
    >
      <div className="relative xl:col-span-2">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-slate" />
        <input
          className={`${inputClass} pl-9`}
          placeholder="Search company..."
          value={values.search}
          onChange={(e) => set({ search: e.target.value })}
        />
      </div>
      <select className={inputClass} value={values.category} onChange={(e) => set({ category: e.target.value })}>
        <option value="">All categories</option>
        {COMPANY_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <input
        className={inputClass}
        placeholder="City"
        value={values.city}
        onChange={(e) => set({ city: e.target.value })}
      />
      <input
        className={inputClass}
        placeholder="State"
        value={values.state}
        onChange={(e) => set({ state: e.target.value })}
      />
      {!isPublic && (
        <>
          <select
            className={inputClass}
            value={values.hiringStatus}
            onChange={(e) => set({ hiringStatus: e.target.value })}
          >
            <option value="">All hiring status</option>
            {HIRING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select className={inputClass} value={values.isActive} onChange={(e) => set({ isActive: e.target.value })}>
            <option value="">All visibility</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </>
      )}
    </div>
  );
}
