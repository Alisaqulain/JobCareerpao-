"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/Button";
import { api } from "@/hooks/useApi";
import { toast } from "sonner";
import { Plus, Copy, Power, Trash2, Archive } from "lucide-react";
import Link from "next/link";
import type { DynamicField } from "@/types";
import { CompanyPicker } from "@/components/admin/CompanyPicker";

interface JobItem {
  _id: string;
  title: string;
  company: string;
  status: string;
  applicationCount: number;
  applicationFee: number;
  lastDate: string;
}

const FIELD_TYPES = [
  "text",
  "textarea",
  "email",
  "phone",
  "select",
  "radio",
  "checkbox",
  "date",
  "number",
  "file",
] as const;

export function JobForm({
  initial,
  jobId,
}: {
  initial?: Record<string, unknown>;
  jobId?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: String(initial?.title || ""),
    companyId: String((initial?.companyId as { _id?: string })?._id || initial?.companyId || ""),
    description: String(initial?.description || ""),
    salaryMin: Number((initial?.salary as { min?: number })?.min || 0),
    salaryMax: Number((initial?.salary as { max?: number })?.max || 0),
    experience: String(initial?.experience || ""),
    qualification: String(initial?.qualification || ""),
    skills: ((initial?.skills as string[]) || []).join(", "),
    location: String(initial?.location || ""),
    jobType: String(initial?.jobType || "Full-time"),
    mode: String(initial?.mode || "Hybrid"),
    applicationFee: Number(initial?.applicationFee || 0),
    lastDate: initial?.lastDate
      ? new Date(String(initial.lastDate)).toISOString().slice(0, 10)
      : "",
    status: String(initial?.status || "active"),
    requiredDocuments: ((initial?.requiredDocuments as string[]) || []).join(", "),
  });
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>(
    (initial?.dynamicFields as DynamicField[]) || []
  );

  const addField = () => {
    setDynamicFields([
      ...dynamicFields,
      { id: crypto.randomUUID(), label: "New Field", type: "text", required: false },
    ]);
  };

  const updateField = (index: number, patch: Partial<DynamicField>) => {
    const next = [...dynamicFields];
    next[index] = { ...next[index], ...patch };
    setDynamicFields(next);
  };

  const removeField = (index: number) => {
    setDynamicFields(dynamicFields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        companyId: form.companyId,
        description: form.description,
        salary: { min: form.salaryMin, max: form.salaryMax, currency: "INR" },
        experience: form.experience,
        qualification: form.qualification,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        location: form.location,
        jobType: form.jobType,
        mode: form.mode,
        applicationFee: form.applicationFee,
        lastDate: form.lastDate,
        status: form.status,
        requiredDocuments: form.requiredDocuments
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        dynamicFields,
      };

      const res = jobId
        ? await api("/api/admin/jobs", {
            method: "PATCH",
            json: { jobId, ...payload },
          })
        : await api("/api/admin/jobs", { method: "POST", json: payload });

      if (!res.success) throw new Error(res.message);
      toast.success(jobId ? "Job updated" : "Job created");
      router.push("/admin/jobs");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Title</label>
          <input className={inputClass} required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <CompanyPicker
            companyId={form.companyId}
            onCompanyIdChange={(id) => setForm({ ...form, companyId: id })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea className={`${inputClass} min-h-[120px] py-2`} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Salary Min (₹)</label>
          <input type="number" className={inputClass} required value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: Number(e.target.value) })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Salary Max (₹)</label>
          <input type="number" className={inputClass} required value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: Number(e.target.value) })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Experience</label>
          <input className={inputClass} required value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Qualification</label>
          <input className={inputClass} required value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Skills (comma separated)</label>
          <input className={inputClass} required value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Location</label>
          <input className={inputClass} required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Job Type</label>
          <select className={inputClass} value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })}>
            {["Full-time", "Part-time", "Contract", "Internship", "Remote"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Work Mode</label>
          <select className={inputClass} value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
            {["Remote", "Hybrid", "On-site"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Application Fee (₹)</label>
          <input type="number" className={inputClass} required value={form.applicationFee} onChange={(e) => setForm({ ...form, applicationFee: Number(e.target.value) })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Last Date</label>
          <input type="date" className={inputClass} required value={form.lastDate} onChange={(e) => setForm({ ...form, lastDate: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Status</label>
          <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Required Documents (comma separated)</label>
          <input className={inputClass} value={form.requiredDocuments} onChange={(e) => setForm({ ...form, requiredDocuments: e.target.value })} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display font-semibold text-brand-dark">Dynamic Application Fields</h3>
          <Button type="button" size="sm" variant="outline" onClick={addField}>
            Add Field
          </Button>
        </div>
        <div className="space-y-3">
          {dynamicFields.map((field, index) => (
            <div key={field.id} className="grid gap-2 rounded-xl bg-brand-gray p-3 md:grid-cols-4">
              <input className={inputClass} value={field.label} onChange={(e) => updateField(index, { label: e.target.value })} placeholder="Label" />
              <select className={inputClass} value={field.type} onChange={(e) => updateField(index, { type: e.target.value as DynamicField["type"] })}>
                {FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <input className={inputClass} value={field.options?.join(", ") || ""} onChange={(e) => updateField(index, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} placeholder="Options (select/radio/checkbox)" />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" checked={field.required} onChange={(e) => updateField(index, { required: e.target.checked })} />
                  Required
                </label>
                <button type="button" className="text-xs text-red-600" onClick={() => removeField(index)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : jobId ? "Update Job" : "Create Job"}
      </Button>
    </form>
  );
}

export function AdminJobsPageContent() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobItem[]>([]);

  const loadJobs = () => {
    api<JobItem[]>("/api/admin/jobs?limit=100").then((res) => {
      if (res.data) setJobs(res.data);
    });
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const jobAction = async (jobId: string, action: string) => {
    try {
      const res = await api("/api/admin/jobs", {
        method: "PATCH",
        json: { jobId, action },
      });
      if (!res.success) throw new Error(res.message);
      toast.success("Job updated");
      loadJobs();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm("Delete this job?")) return;
    try {
      const res = await api(`/api/admin/jobs?jobId=${jobId}`, { method: "DELETE" });
      if (!res.success) throw new Error(res.message);
      toast.success("Job deleted");
      loadJobs();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const downloadArchive = async (jobId: string) => {
    window.open(`/api/admin/archive?jobId=${jobId}`, "_blank");
    if (confirm("Archive downloaded. Archive and delete all applications?")) {
      const res = await api("/api/admin/archive", {
        method: "POST",
        json: { jobId, confirm: true },
      });
      if (res.success) {
        toast.success("Applications archived and deleted");
        loadJobs();
      } else {
        toast.error(res.message || "Archive failed");
      }
    }
  };

  return (
    <div className="min-h-screen bg-brand-gray">
      <AdminSidebar />
      <main className="lg:pl-64">
        <div className="p-6 pt-16 lg:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-brand-dark">Job Management</h1>
              <p className="text-sm text-brand-slate">Create, edit, and manage job postings</p>
            </div>
            <Button href="/admin/jobs/new">
              <Plus className="h-4 w-4" /> New Job
            </Button>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-brand-gray text-left text-xs uppercase text-brand-slate">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Applications</th>
                  <th className="px-4 py-3">Fee</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">{job.title}</td>
                    <td className="px-4 py-3">{job.company}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-lg bg-brand-cyan/10 px-2 py-1 text-xs font-semibold text-brand-cyan">
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {job.applicationCount}
                      {job.applicationCount >= 200 && (
                        <span className="ml-2 text-xs text-brand-orange">Archive Ready</span>
                      )}
                    </td>
                    <td className="px-4 py-3">₹{job.applicationFee}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <Link href={`/admin/jobs/${job._id}/edit`} className="rounded-lg px-2 py-1 text-xs text-brand-blue hover:bg-brand-blue/5">Edit</Link>
                        <button type="button" onClick={() => jobAction(job._id, "duplicate")} className="rounded-lg p-1 hover:bg-slate-100" title="Duplicate"><Copy className="h-3.5 w-3.5" /></button>
                        <button type="button" onClick={() => jobAction(job._id, job.status === "active" ? "disable" : "enable")} className="rounded-lg p-1 hover:bg-slate-100" title="Toggle"><Power className="h-3.5 w-3.5" /></button>
                        {job.applicationCount >= 200 && (
                          <button type="button" onClick={() => downloadArchive(job._id)} className="rounded-lg p-1 hover:bg-slate-100" title="Archive"><Archive className="h-3.5 w-3.5" /></button>
                        )}
                        <button type="button" onClick={() => deleteJob(job._id)} className="rounded-lg p-1 text-red-600 hover:bg-red-50" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
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
