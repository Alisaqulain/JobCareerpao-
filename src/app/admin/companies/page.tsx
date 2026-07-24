"use client";

import { useEffect, useState } from "react";
import { Upload, Trash2, Plus } from "lucide-react";
import { CompanyLogo } from "@/components/ui/CompanyLogo";
import { Button } from "@/components/ui/Button";
import { api } from "@/hooks/useApi";
import { toast } from "sonner";

interface CompanyRow {
  _id: string;
  name: string;
  industry: string;
  headquarters: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  color: string;
  openJobs?: number;
  isActive: boolean;
}

const emptyForm = {
  name: "",
  industry: "Technology",
  description: "",
  headquarters: "",
  logoUrl: "",
  logoPublicId: "",
  color: "#0B4F8A",
};

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    api<CompanyRow[]>("/api/admin/companies?limit=100").then((res) => {
      if (res.data) setCompanies(res.data);
    });
  };

  useEffect(() => {
    load();
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
      setForm((f) => ({
        ...f,
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.name.trim().length < 2) {
      toast.error("Company name must be at least 2 characters");
      return;
    }
    if (form.description.trim().length < 10) {
      toast.error("Company description must be at least 10 characters");
      return;
    }
    if (form.headquarters.trim().length < 2) {
      toast.error("Headquarters is required");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, string> = {
        name: form.name.trim(),
        industry: form.industry.trim(),
        description: form.description.trim(),
        headquarters: form.headquarters.trim(),
        color: form.color,
      };
      if (form.logoUrl.trim()) {
        payload.logoUrl = form.logoUrl.trim();
        if (form.logoPublicId.trim()) payload.logoPublicId = form.logoPublicId.trim();
      }

      const res = await api("/api/admin/companies", {
        method: "POST",
        json: payload,
      });
      if (!res.success) throw new Error(res.message);
      toast.success("Company added");
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add company");
    } finally {
      setSaving(false);
    }
  };

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

  const inputClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm";

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-dark">Companies</h1>
          <p className="text-sm text-brand-slate">
            Step 1: Add companies here. Step 2: Create jobs and select a company from the dropdown.
          </p>
        </div>
        <Button type="button" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" />
          {showForm ? "Hide Form" : "Add Company"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-2"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">Company Name *</label>
            <input
              className={inputClass}
              required
              minLength={2}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Industry *</label>
            <input
              className={inputClass}
              required
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Headquarters *</label>
            <input
              className={inputClass}
              required
              value={form.headquarters}
              onChange={(e) => setForm({ ...form, headquarters: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">About Company * (min 10 characters)</label>
            <textarea
              className={`${inputClass} min-h-[90px] py-2`}
              required
              minLength={10}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Brand Color</label>
            <input
              type="color"
              className="h-11 w-full rounded-xl border border-slate-200"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Company Logo</label>
            <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white text-sm text-brand-slate hover:border-brand-blue">
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading..." : "Upload Logo"}
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
            {form.logoUrl && (
              <CompanyLogo
                name={form.name || "C"}
                logoUrl={form.logoUrl}
                fallback="C"
                color={form.color}
                size="sm"
                className="mt-2"
              />
            )}
          </div>
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Company"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

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
            {companies.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-brand-slate">
                  No companies yet. Click &quot;Add Company&quot; above.
                </td>
              </tr>
            ) : (
              companies.map((c) => (
                <tr key={c._id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CompanyLogo
                        name={c.name}
                        logoUrl={c.logoUrl}
                        fallback={c.name.charAt(0)}
                        color={c.color}
                        size="sm"
                      />
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{c.industry}</td>
                  <td className="px-4 py-3">{c.headquarters}</td>
                  <td className="px-4 py-3">{c.openJobs ?? 0}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => remove(c._id)}
                      className="rounded-lg p-1 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {companies.length > 0 && (
        <p className="mt-4 text-sm text-brand-slate">
          Ready to post a job?{" "}
          <a href="/admin/jobs/new" className="font-semibold text-brand-blue hover:underline">
            Go to Create Job →
          </a>
        </p>
      )}
    </>
  );
}
