"use client";

import Link from "next/link";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { CompanyLogo } from "@/components/ui/CompanyLogo";
import type { CompanyRecord } from "@/lib/companies/form";

interface CompanyAdminTableProps {
  companies: CompanyRecord[];
  loading?: boolean;
  onEdit: (company: CompanyRecord) => void;
  onDelete: (id: string) => void;
}

function StatusBadge({ label, tone }: { label: string; tone: "green" | "amber" | "slate" | "red" }) {
  const tones = {
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    slate: "bg-slate-100 text-slate-600",
    red: "bg-red-100 text-red-700",
  };
  return (
    <span className={`rounded-lg px-2 py-1 text-[10px] font-semibold capitalize ${tones[tone]}`}>
      {label}
    </span>
  );
}

export function CompanyAdminTable({ companies, loading, onEdit, onDelete }: CompanyAdminTableProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-brand-slate">
        Loading companies...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-gray text-left text-xs uppercase tracking-wide text-brand-slate">
            <tr>
              <th className="px-4 py-3">Logo</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Jobs</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-brand-slate">
                  No companies found. Add your first company to start posting jobs.
                </td>
              </tr>
            ) : (
              companies.map((c) => (
                <tr key={c._id} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <CompanyLogo
                      name={c.name}
                      logoUrl={c.logoUrl}
                      fallback={c.name.charAt(0)}
                      color={c.color}
                      size="sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-brand-dark">{c.name}</p>
                    <p className="text-xs text-brand-slate">{c.industry}</p>
                  </td>
                  <td className="px-4 py-3">{c.category || "—"}</td>
                  <td className="px-4 py-3">
                    {c.city || "—"}
                    {c.state ? `, ${c.state}` : ""}
                  </td>
                  <td className="px-4 py-3 font-medium">{c.openJobs ?? c.totalJobs ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <StatusBadge
                        label={c.hiringStatus || "active"}
                        tone={c.hiringStatus === "active" ? "green" : "slate"}
                      />
                      <StatusBadge
                        label={c.verificationStatus || "pending"}
                        tone={
                          c.verificationStatus === "verified"
                            ? "green"
                            : c.verificationStatus === "rejected"
                              ? "red"
                              : "amber"
                        }
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/companies/${c.slug || c._id}`}
                        target="_blank"
                        className="rounded-lg p-2 text-brand-blue hover:bg-brand-blue/10"
                        title="View public page"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onEdit(c)}
                        className="rounded-lg p-2 text-brand-blue hover:bg-brand-blue/10"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(c._id)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
