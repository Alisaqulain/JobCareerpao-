"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/hooks/useApi";
import { CompanyLogo } from "@/components/ui/CompanyLogo";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";

interface CompanyOption {
  _id: string;
  name: string;
  logoUrl?: string;
  color: string;
  industry: string;
}

interface CompanyPickerProps {
  companyId: string;
  onCompanyIdChange: (id: string) => void;
}

export function CompanyPicker({ companyId, onCompanyIdChange }: CompanyPickerProps) {
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCompanies = useCallback(async () => {
    setLoading(true);
    const res = await api<CompanyOption[]>("/api/admin/companies?limit=100");
    if (res.data) setCompanies(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const selected = companies.find((c) => c._id === companyId);
  const inputClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm";

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-brand-gray/30 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <label className="block text-sm font-medium">Company *</label>
          <p className="mt-0.5 text-xs text-brand-slate">
            Add companies first on the Companies page, then pick one here for the job.
          </p>
        </div>
        <Link
          href="/admin/companies"
          className="inline-flex items-center gap-1 rounded-lg border border-brand-blue/20 bg-white px-3 py-1.5 text-xs font-semibold text-brand-blue hover:bg-brand-blue/5"
        >
          Manage Companies
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-brand-slate">Loading companies...</p>
      ) : companies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-sm text-brand-slate">
          No companies yet.{" "}
          <Link href="/admin/companies" className="font-semibold text-brand-blue hover:underline">
            Add a company first
          </Link>
          , then return here to create the job.
        </div>
      ) : (
        <>
          <select
            className={inputClass}
            required
            value={companyId}
            onChange={(e) => onCompanyIdChange(e.target.value)}
          >
            <option value="">Select company...</option>
            {companies.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} — {c.industry}
              </option>
            ))}
          </select>

          {selected && (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <CompanyLogo
                name={selected.name}
                logoUrl={selected.logoUrl}
                fallback={selected.name.charAt(0)}
                color={selected.color}
                size="sm"
              />
              <div>
                <p className="text-sm font-medium text-brand-dark">{selected.name}</p>
                <p className="text-xs text-brand-slate">{selected.industry}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
