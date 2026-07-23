import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, User } from "lucide-react";
import { blogPosts, getBlogPost } from "@/lib/blog";
import { BlogArticle } from "@/components/blog/BlogArticle";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  return {
    title: post?.title || "Blog",
    description: post?.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const related = blogPosts.filter((p) => p.slug !== slug && p.category === post.category).slice(0, 3);

  return (
    <article className="bg-white">
      <div className="border-b border-slate-100 bg-gradient-to-br from-brand-blue via-[#0c5a9e] to-brand-cyan">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-100 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to blog
          </Link>
          <span className="mt-6 inline-block rounded-lg bg-white/15 px-2.5 py-1 text-xs font-semibold text-white">
            {post.category}
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-blue-100">
            <span className="inline-flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {post.author}
            </span>
            <span>{post.date}</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime} read
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="text-lg leading-relaxed text-brand-slate">{post.excerpt}</p>
        <BlogArticle blocks={post.blocks} />
        <div className="mt-10 rounded-2xl bg-brand-gray p-6">
          <p className="font-display font-semibold text-brand-dark">Ready to apply?</p>
          <p className="mt-2 text-sm text-brand-slate">
            Browse verified jobs, fill the application form, and pay the listed fee — all from one
            platform.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/jobs"
              className="inline-flex items-center rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue/90"
            >
              Browse Jobs
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center rounded-xl border border-brand-blue/20 px-5 py-2.5 text-sm font-semibold text-brand-blue hover:bg-brand-blue/5"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="border-t border-slate-100 bg-brand-gray py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="font-display text-lg font-bold text-brand-dark">Related articles</h2>
            <ul className="mt-4 space-y-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/blog/${r.slug}`}
                    className="text-sm font-medium text-brand-cyan hover:text-brand-blue"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </article>
  );
}
