"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { JobForm } from "@/components/admin/JobForm";
import { api } from "@/hooks/useApi";

export default function EditJobPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [job, setJob] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    api<{ job: Record<string, unknown> }>(`/api/jobs/${jobId}`).then((res) => {
      if (res.data?.job) setJob(res.data.job);
    });
  }, [jobId]);

  if (!job) {
    return <p className="text-brand-slate">Loading job...</p>;
  }

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-brand-dark">Edit Job</h1>
      <div className="mt-6 max-w-4xl rounded-2xl border border-slate-200 bg-white p-6">
        <JobForm initial={job} jobId={jobId} />
      </div>
    </>
  );
}
