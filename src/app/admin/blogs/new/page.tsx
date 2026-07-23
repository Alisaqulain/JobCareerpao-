"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/Button";
import { api } from "@/hooks/useApi";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import type { BlogBlock } from "@/lib/blog";

const inputClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm";

export default function NewBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "Career Tips",
    author: "JobCareerPao Team",
    excerpt: "",
    status: "draft" as "draft" | "published",
    featured: false,
    seoTitle: "",
    seoDescription: "",
    coverImage: "",
    coverImagePublicId: "",
    tags: "",
    contentText: "",
  });

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "blog");
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.success) {
      setForm((f) => ({ ...f, coverImage: data.data.url, coverImagePublicId: data.data.publicId }));
      toast.success("Cover uploaded");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const paragraphs = form.contentText.split("\n\n").filter(Boolean);
      const content: BlogBlock[] = paragraphs.map((p) =>
        p.startsWith("## ") ? { type: "h2", text: p.replace("## ", "") } : { type: "p", text: p }
      );

      const res = await api("/api/admin/blogs", {
        method: "POST",
        json: {
          title: form.title,
          slug: form.slug || undefined,
          category: form.category,
          author: form.author,
          excerpt: form.excerpt,
          status: form.status,
          featured: form.featured,
          seoTitle: form.seoTitle || form.title,
          seoDescription: form.seoDescription || form.excerpt,
          coverImage: form.coverImage || undefined,
          coverImagePublicId: form.coverImagePublicId || undefined,
          ogImage: form.coverImage || undefined,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          content,
        },
      });
      if (!res.success) throw new Error(res.message);
      toast.success("Blog created");
      router.push("/admin/blogs");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-gray">
      <AdminSidebar />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-3xl p-6 pt-16 lg:p-8">
          <h1 className="font-display text-2xl font-bold text-brand-dark">Create Blog Post</h1>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input className={inputClass} placeholder="Title *" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className={inputClass} placeholder="Slug (optional)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <div className="grid gap-4 md:grid-cols-2">
              <input className={inputClass} placeholder="Category *" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <input className={inputClass} placeholder="Author *" required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            </div>
            <textarea className={`${inputClass} min-h-[80px] py-2`} placeholder="Excerpt *" required value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
            <textarea className={`${inputClass} min-h-[200px] py-2 font-mono text-xs`} placeholder="Content (paragraphs separated by blank lines, use ## for headings)" required value={form.contentText} onChange={(e) => setForm({ ...form, contentText: e.target.value })} />
            <input className={inputClass} placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            <div className="grid gap-4 md:grid-cols-2">
              <input className={inputClass} placeholder="SEO Title" value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
              <input className={inputClass} placeholder="SEO Description" value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
            </div>
            <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 text-sm">
              <Upload className="h-4 w-4" /> Upload Cover Image
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
            </label>
            {form.coverImage && <img src={form.coverImage} alt="Cover" className="h-32 rounded-xl object-cover" />}
            <div className="flex flex-wrap gap-4">
              <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "draft" | "published" })}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                Featured
              </label>
            </div>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Create Blog"}</Button>
          </form>
        </div>
      </main>
    </div>
  );
}
