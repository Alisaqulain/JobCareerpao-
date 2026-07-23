"use client";

import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { api } from "@/hooks/useApi";
import { CompanyLogo } from "@/components/ui/CompanyLogo";
import { toast } from "sonner";

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
  const [mode, setMode] = useState<"select" | "create">("select");
  const [uploading, setUploading] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: "",
    industry: "Technology",
    description: "",
    headquarters: "",
    website: "",
    logoUrl: "",
    logoPublicId: "",
    color: "#0B4F8A",
  });

  useEffect(() => {
    api<CompanyOption[]>("/api/admin/companies?limit=100").then((res) => {
      if (res.data) setCompanies(res.data);
    });
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "company");
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setNewCompany((c) => ({
        ...c,
        logoUrl: data.data.url,
        logoPublicId: data.data.publicId,
      }));
      toast.success("Logo uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const createCompany = async () => {
    if (!newCompany.name.trim()) {
      toast.error("Company name is required");
      return;
    }
    try {
      const res = await api<{ _id: string }>("/api/admin/companies", {
        method: "POST",
        json: newCompany,
      });
      if (!res.data?._id) throw new Error(res.message);
      toast.success("Company created");
      setCompanies((prev) => [...prev, { ...newCompany, _id: res.data!._id } as CompanyOption]);
      onCompanyIdChange(res.data._id);
      setMode("select");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create company");
    }
  };

  const inputClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm";

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("select")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${mode === "select" ? "bg-brand-blue text-white" : "bg-slate-100 text-brand-slate"}`}
        >
          Select Existing
        </button>
        <button
          type="button"
          onClick={() => setMode("create")}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${mode === "create" ? "bg-brand-blue text-white" : "bg-slate-100 text-brand-slate"}`}
        >
          Create New
        </button>
      </div>

      {mode === "select" ? (
        <div>
          <label className="mb-1 block text-sm font-medium">Company *</label>
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
          {companyId && (
            <div className="mt-2 flex items-center gap-2">
              {(() => {
                const c = companies.find((x) => x._id === companyId);
                if (!c) return null;
                return (
                  <CompanyLogo
                    name={c.name}
                    logoUrl={c.logoUrl}
                    fallback={c.name.charAt(0)}
                    color={c.color}
                    size="sm"
                  />
                );
              })()}
              <span className="text-xs text-brand-slate">Selected company logo preview</span>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Company Name *</label>
            <input className={inputClass} value={newCompany.name} onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Industry *</label>
            <input className={inputClass} value={newCompany.industry} onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Headquarters *</label>
            <input className={inputClass} value={newCompany.headquarters} onChange={(e) => setNewCompany({ ...newCompany, headquarters: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Website</label>
            <input className={inputClass} value={newCompany.website} onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })} placeholder="https://..." />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Description *</label>
            <textarea className={`${inputClass} min-h-[80px] py-2`} value={newCompany.description} onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Brand Color</label>
            <input type="color" className="h-11 w-full rounded-xl border border-slate-200" value={newCompany.color} onChange={(e) => setNewCompany({ ...newCompany, color: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Company Logo</label>
            <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white text-sm text-brand-slate hover:border-brand-blue">
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading..." : "Upload Logo"}
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
            {newCompany.logoUrl && (
              <CompanyLogo name={newCompany.name || "C"} logoUrl={newCompany.logoUrl} fallback="C" color={newCompany.color} size="sm" className="mt-2" />
            )}
          </div>
          <div className="md:col-span-2">
            <button type="button" onClick={createCompany} className="rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90">
              Save Company & Select
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
