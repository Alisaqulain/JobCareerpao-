"use client";

import { useEffect, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { api } from "@/hooks/useApi";
import { toast } from "sonner";

interface ApplicationRow {
  _id: string;
  appliedDate: string;
  userId?: { name?: string; email?: string; phone?: string };
  jobTitle?: string;
  companyName?: string;
  jobId?: { title?: string; company?: string };
}

export default function AdminArchiveManagerPage() {
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    api<{ applications: ApplicationRow[]; stats?: { totalPaidApplications?: number } }>(
      "/api/admin/archive-manager?limit=20"
    )
      .then((res) => {
        if (res.data?.applications) setApplications(res.data.applications);
        if (res.data?.stats?.totalPaidApplications != null) {
          setTotal(res.data.stats.totalPaidApplications);
        } else if (res.pagination && typeof res.pagination === "object" && "total" in res.pagination) {
          setTotal(Number((res.pagination as { total: number }).total));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const downloadAndMaybeDelete = async () => {
    if (total === 0) {
      toast.error("No application data to export");
      return;
    }

    setWorking(true);
    try {
      const res = await fetch("/api/admin/archive-manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ exportAll: true }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Download failed");
      }

      const blob = await res.blob();
      const exportedIds =
        res.headers.get("X-Application-Ids")?.split(",").filter(Boolean) || [];

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `jobcareerpao-all-applications-${Date.now()}.zip`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("Download started");

      if (
        exportedIds.length &&
        window.confirm(
          `Download complete.\n\nDelete ${exportedIds.length} application(s) and their resumes from the server?\n\nPayment records and analytics will be kept.`
        )
      ) {
        const deleteRes = await api("/api/admin/archive-manager", {
          method: "DELETE",
          json: { applicationIds: exportedIds, confirm: true },
        });
        if (deleteRes.success) {
          toast.success("Application data deleted");
          setApplications([]);
          setTotal(0);
        } else {
          toast.error(deleteRes.message || "Delete failed");
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-brand-dark">Export Application Data</h1>
      <p className="mt-2 text-sm text-brand-slate">
        Download all applicant data as a ZIP file. After saving it on your computer, you can delete
        the data from the server to free storage.
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-brand-slate">Total applications ready to export</p>
        <p className="mt-1 font-display text-4xl font-bold text-brand-dark">
          {loading ? "…" : total}
        </p>

        <p className="mt-4 text-sm text-brand-slate">
          ZIP includes CSV, applicant folders, resumes, profile JSON, and application details.
        </p>

        <Button
          className="mt-6 w-full sm:w-auto"
          disabled={working || loading || total === 0}
          onClick={downloadAndMaybeDelete}
        >
          <Download className="h-4 w-4" />
          {working ? "Preparing download..." : "Download All Data"}
        </Button>
      </div>

      {!loading && applications.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-4 py-3 text-sm font-medium text-brand-dark">
            Recent applications (preview)
          </div>
          <div className="divide-y divide-slate-100">
            {applications.slice(0, 10).map((app) => (
              <div key={app._id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">{app.userId?.name}</p>
                  <p className="text-xs text-brand-slate">{app.userId?.email}</p>
                </div>
                <div className="text-right text-xs text-brand-slate">
                  <p>{app.jobTitle || app.jobId?.title}</p>
                  <p>{new Date(app.appliedDate).toLocaleDateString("en-IN")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && total === 0 && (
        <p className="mt-6 rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-brand-slate">
          No application data on the server right now.
        </p>
      )}

      <p className="mt-6 flex items-start gap-2 text-xs text-brand-slate">
        <Trash2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        After download, you will be asked once if you want to delete the exported records. Payment
        history and revenue stats are not removed.
      </p>
    </div>
  );
}
