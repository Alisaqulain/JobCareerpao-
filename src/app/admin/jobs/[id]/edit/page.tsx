"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { JobForm } from "@/components/admin/JobForm";
import { api } from "@/hooks/useApi";

export default function EditJobPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [job, setJob] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    api<Record<string, unknown>>(`/api/jobs/${jobId}`).then((res) => {
      if (res.data) setJob(res.data);
    });
  }, [jobId]);

  if (!job) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-gray">
        <p className="text-brand-slate">Loading job...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-gray">
      <AdminSidebar />
      <main className="lg:pl-64">
        <div className="p-6 pt-16 lg:p-8">
          <h1 className="font-display text-2xl font-bold text-brand-dark">Edit Job</h1>
          <div className="mt-6 max-w-4xl rounded-2xl border border-slate-200 bg-white p-6">
            <JobForm initial={job} jobId={jobId} />
          </div>
        </div>
      </main>
    </div>
  );
}
