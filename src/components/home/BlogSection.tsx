"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { blogPosts as fallbackPosts } from "@/lib/blog";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { api } from "@/hooks/useApi";

interface ApiBlog {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  readingTime: string;
  publishedDate?: string;
  coverImage?: string;
}

export function BlogSection() {
  const [posts, setPosts] = useState<ApiBlog[]>([]);

  useEffect(() => {
    api<ApiBlog[]>("/api/blogs?limit=3&featured=true")
      .then((res) => {
        if (res.data?.length) {
          setPosts(res.data);
        } else {
          api<ApiBlog[]>("/api/blogs?limit=3").then((r2) => {
            if (r2.data?.length) setPosts(r2.data);
            else {
              setPosts(
                fallbackPosts.slice(0, 3).map((p) => ({
                  _id: p.slug,
                  slug: p.slug,
                  title: p.title,
                  excerpt: p.excerpt,
                  category: p.category,
                  author: p.author,
                  readingTime: p.readTime,
                }))
              );
            }
          });
        }
      });
  }, []);

  if (!posts.length) return null;

  return (
    <section className="bg-brand-gray dark:bg-slate-900 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Career Insights"
          title="Latest Blogs"
          description="Expert advice on resumes, interviews, and career growth."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {posts.map((post, i) => (
            <motion.article
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-strong group overflow-hidden rounded-2xl transition-shadow hover:shadow-card"
            >
              <div className="aspect-video bg-gradient-to-br from-brand-blue/10 to-brand-cyan/10">
                {post.coverImage ? (
                  <img src={post.coverImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center font-display text-4xl font-bold text-brand-blue/20">
                    {post.category.charAt(0)}
                  </div>
                )}
              </div>
              <div className="p-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-cyan">
                  {post.category}
                </span>
                <h3 className="mt-2 font-display text-lg font-semibold text-brand-dark dark:text-white group-hover:text-brand-blue">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-brand-slate">{post.excerpt}</p>
                <div className="mt-4 flex items-center gap-3 text-xs text-brand-slate">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {post.readingTime}
                  </span>
                  {post.publishedDate && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.publishedDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button href="/blog" variant="outline">
            Read All Articles
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
