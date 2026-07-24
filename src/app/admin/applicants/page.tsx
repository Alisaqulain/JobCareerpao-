"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { api } from "@/hooks/useApi";
import { toast } from "sonner";

interface ApplicationRow {
  _id: string;
  status: string;
  paymentStatus: string;
  appliedDate: string;
  resumeUrl: string;
  userId?: { name?: string; email?: string; phone?: string };
  jobId?: { title?: string };
}

export default function AdminApplicantsPage() {
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const load = () => {
    const params = new URLSearchParams({ limit: "100" });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    api<ApplicationRow[]>(`/api/admin/applications?${params}`).then((res) => {
      if (res.data) setApplications(res.data);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (applicationId: string, newStatus: string) => {
    const res = await api("/api/admin/applications", {
      method: "PATCH",
      json: { applicationId, status: newStatus },
    });
    if (res.success) {
      toast.success("Status updated");
      load();
    } else {
      toast.error(res.message);
    }
  };

  const bulkUpdate = async (newStatus: string) => {
    if (!selected.length) return;
    const res = await api("/api/admin/applications", {
      method: "PATCH",
      json: { applicationIds: selected, status: newStatus },
    });
    if (res.success) {
      toast.success("Bulk update complete");
      setSelected([]);
      load();
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-brand-dark">Applicants</h1>
              <p className="text-sm text-brand-slate">Search, filter, export, and manage applications</p>
            </div>
            <div className="flex gap-2">
              <Button href="/api/admin/applications?export=csv" variant="outline" size="sm">Export CSV</Button>
              <Button href="/api/admin/applications?export=excel" variant="outline" size="sm">Export Excel</Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <input
              className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
              placeholder="Search name, email, phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="h-10 rounded-xl border border-slate-200 px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="selected">Selected</option>
              <option value="rejected">Rejected</option>
            </select>
            <Button size="sm" onClick={load}>Search</Button>
            {selected.length > 0 && (
              <>
                <Button size="sm" variant="secondary" onClick={() => bulkUpdate("selected")}>Mark Selected</Button>
                <Button size="sm" variant="outline" onClick={() => bulkUpdate("rejected")}>Mark Rejected</Button>
              </>
            )}
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-brand-gray text-left text-xs uppercase text-brand-slate">
                <tr>
                  <th className="px-4 py-3"><input type="checkbox" onChange={(e) => setSelected(e.target.checked ? applications.map((a) => a._id) : [])} /></th>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Job</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Applied</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Resume</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(app._id)}
                        onChange={(e) =>
                          setSelected(
                            e.target.checked
                              ? [...selected, app._id]
                              : selected.filter((id) => id !== app._id)
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{app.userId?.name}</p>
                      <p className="text-xs text-brand-slate">{app.userId?.email}</p>
                    </td>
                    <td className="px-4 py-3">{app.jobId?.title}</td>
                    <td className="px-4 py-3">{app.paymentStatus}</td>
                    <td className="px-4 py-3">{new Date(app.appliedDate).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <select
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                        value={app.status}
                        onChange={(e) => updateStatus(app._id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="selected">Selected</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="text-brand-cyan hover:underline">View</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
    </>
  );
}
