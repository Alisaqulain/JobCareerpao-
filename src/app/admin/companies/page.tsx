"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { CompanyLogo } from "@/components/ui/CompanyLogo";
import { api } from "@/hooks/useApi";
import { toast } from "sonner";
import { Building2, Trash2 } from "lucide-react";

interface CompanyRow {
  _id: string;
  name: string;
  industry: string;
  headquarters: string;
  logoUrl?: string;
  color: string;
  openJobs?: number;
  isActive: boolean;
}

export default function AdminCompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyRow[]>([]);

  const load = () => {
    api<CompanyRow[]>("/api/admin/companies?limit=100").then((res) => {
      if (res.data) setCompanies(res.data);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this company?")) return;
    const res = await api(`/api/admin/companies?companyId=${id}`, { method: "DELETE" });
    if (res.success) {
      toast.success("Company deleted");
      load();
    } else {
      toast.error(res.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-brand-gray">
      <AdminSidebar />
      <main className="lg:pl-64">
        <div className="p-6 pt-16 lg:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-brand-dark">Companies</h1>
              <p className="text-sm text-brand-slate">Manage employer profiles and logos</p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/admin/jobs/new")}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold text-white"
            >
              <Building2 className="h-4 w-4" /> Add via Job Form
            </button>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-brand-gray text-left text-xs uppercase text-brand-slate">
                <tr>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Industry</th>
                  <th className="px-4 py-3">HQ</th>
                  <th className="px-4 py-3">Open Jobs</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c._id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CompanyLogo name={c.name} logoUrl={c.logoUrl} fallback={c.name.charAt(0)} color={c.color} size="sm" />
                        <span className="font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{c.industry}</td>
                    <td className="px-4 py-3">{c.headquarters}</td>
                    <td className="px-4 py-3">{c.openJobs ?? 0}</td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => remove(c._id)} className="rounded-lg p-1 text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
