"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/Button";
import { api } from "@/hooks/useApi";
import { toast } from "sonner";
import { Plus, Trash2, Star } from "lucide-react";

interface BlogRow {
  _id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  featured: boolean;
  publishedDate?: string;
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogRow[]>([]);

  const load = () => {
    api<BlogRow[]>("/api/admin/blogs?limit=100").then((res) => {
      if (res.data) setBlogs(res.data);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this blog?")) return;
    const res = await api(`/api/admin/blogs?blogId=${id}`, { method: "DELETE" });
    if (res.success) {
      toast.success("Blog deleted");
      load();
    } else {
      toast.error(res.message || "Delete failed");
    }
  };

  const toggleFeatured = async (blog: BlogRow) => {
    const res = await api("/api/admin/blogs", {
      method: "PATCH",
      json: { blogId: blog._id, featured: !blog.featured },
    });
    if (res.success) load();
  };

  return (
    <div className="min-h-screen bg-brand-gray">
      <AdminSidebar />
      <main className="lg:pl-64">
        <div className="p-6 pt-16 lg:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-brand-dark">Blog Management</h1>
              <p className="text-sm text-brand-slate">Create, edit, publish and feature blog posts</p>
            </div>
            <Button href="/admin/blogs/new">
              <Plus className="h-4 w-4" /> New Blog
            </Button>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-brand-gray text-left text-xs uppercase text-brand-slate">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Featured</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((b) => (
                  <tr key={b._id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">{b.title}</td>
                    <td className="px-4 py-3">{b.category}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-lg px-2 py-1 text-xs font-semibold ${b.status === "published" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => toggleFeatured(b)} className={b.featured ? "text-brand-orange" : "text-slate-300"}>
                        <Star className="h-4 w-4" fill={b.featured ? "currentColor" : "none"} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/admin/blogs/${b._id}/edit`} className="text-xs text-brand-blue hover:underline">Edit</Link>
                        <button type="button" onClick={() => remove(b._id)} className="text-red-600"><Trash2 className="h-4 w-4" /></button>
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
