"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { api } from "@/hooks/useApi";

interface ArchiveRow {
  _id: string;
  jobTitle: string;
  archiveDate: string;
  adminEmail: string;
  applicationsDeleted: number;
  resumesDeleted: number;
}

export default function AdminArchivesPage() {
  const [archives, setArchives] = useState<ArchiveRow[]>([]);

  useEffect(() => {
    api<ArchiveRow[]>("/api/admin/archives").then((res) => {
      if (res.data) setArchives(res.data);
    });
  }, []);

  return (
    <div className="min-h-screen bg-brand-gray">
      <AdminSidebar />
      <main className="lg:pl-64">
        <div className="p-6 pt-16 lg:p-8">
          <h1 className="font-display text-2xl font-bold text-brand-dark">Archive Logs</h1>
          <p className="text-sm text-brand-slate">History of archived job applications</p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-brand-gray text-left text-xs uppercase text-brand-slate">
                <tr>
                  <th className="px-4 py-3">Job</th>
                  <th className="px-4 py-3">Archive Date</th>
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3">Applications Deleted</th>
                  <th className="px-4 py-3">Resumes Deleted</th>
                </tr>
              </thead>
              <tbody>
                {archives.map((row) => (
                  <tr key={row._id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">{row.jobTitle}</td>
                    <td className="px-4 py-3">{new Date(row.archiveDate).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">{row.adminEmail}</td>
                    <td className="px-4 py-3">{row.applicationsDeleted}</td>
                    <td className="px-4 py-3">{row.resumesDeleted}</td>
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
