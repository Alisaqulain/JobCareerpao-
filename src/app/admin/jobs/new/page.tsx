"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { JobForm } from "@/components/admin/JobForm";

export default function NewJobPage() {
  return (
    <div className="min-h-screen bg-brand-gray">
      <AdminSidebar />
      <main className="lg:pl-64">
        <div className="p-6 pt-16 lg:p-8">
          <h1 className="font-display text-2xl font-bold text-brand-dark">Create Job</h1>
          <div className="mt-6 max-w-4xl rounded-2xl border border-slate-200 bg-white p-6">
            <JobForm />
          </div>
        </div>
      </main>
    </div>
  );
}
