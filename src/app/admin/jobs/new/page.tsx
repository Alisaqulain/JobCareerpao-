"use client";

import { JobForm } from "@/components/admin/JobForm";

export default function NewJobPage() {
  return (
    <>
      <h1 className="font-display text-2xl font-bold text-brand-dark">Create Job</h1>
      <div className="mt-6 max-w-4xl rounded-2xl border border-slate-200 bg-white p-6">
        <JobForm />
      </div>
    </>
  );
}
