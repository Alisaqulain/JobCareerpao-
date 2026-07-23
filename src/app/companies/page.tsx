"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CompanyLogo } from "@/components/ui/CompanyLogo";
import { CompanyCardSkeleton } from "@/components/ui/Skeleton";
import { api } from "@/hooks/useApi";
import { companies as fallback } from "@/lib/data";

interface Company {
  _id: string;
  name: string;
  industry: string;
  headquarters: string;
  description: string;
  logoUrl?: string;
  color: string;
  openJobs?: number;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Company[]>("/api/companies?limit=50")
      .then((res) => {
        if (res.data?.length) setCompanies(res.data);
        else {
          setCompanies(
            fallback.map((c) => ({
              _id: c.id,
              name: c.name,
              industry: c.industry,
              headquarters: c.location,
              description: c.description,
              logoUrl: c.logoUrl,
              color: c.color,
              openJobs: c.openJobs,
            }))
          );
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-brand-gray dark:bg-slate-950 min-h-screen">
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold text-brand-dark dark:text-white sm:text-4xl">
            Featured Companies
          </h1>
          <p className="mt-2 max-w-2xl text-brand-slate">
            Browse verified employers across technology, consulting, and more.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {companies.slice(0, 8).map((c) => (
              <Link
                key={c._id}
                href={`/companies/${c._id}`}
                className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium transition hover:border-brand-cyan hover:shadow-soft"
              >
                <CompanyLogo name={c.name} logoUrl={c.logoUrl} fallback={c.name.charAt(0)} color={c.color} size="sm" />
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CompanyCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <article key={company._id} className="glass-strong flex flex-col rounded-2xl p-6 hover:shadow-card transition-shadow">
                <div className="flex items-start gap-4">
                  <CompanyLogo name={company.name} logoUrl={company.logoUrl} fallback={company.name.charAt(0)} color={company.color} size="lg" />
                  <div>
                    <h2 className="font-display text-lg font-semibold text-brand-dark dark:text-white">{company.name}</h2>
                    <p className="text-sm text-brand-slate">{company.industry}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-brand-slate">
                      <MapPin className="h-3 w-3 text-brand-cyan" />
                      {company.headquarters}
                    </p>
                  </div>
                </div>
                <p className="mt-4 flex-1 text-sm text-slate-600 dark:text-slate-400">{company.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-brand-cyan">{company.openJobs ?? 0} open jobs</span>
                </div>
                <Link href={`/companies/${company._id}`} className="mt-5 inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-sm font-semibold text-brand-blue transition hover:border-brand-blue hover:bg-brand-blue hover:text-white">
                  View Company
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Button href="/jobs" variant="outline">Browse all job openings</Button>
        </div>
      </div>
    </div>
  );
}
