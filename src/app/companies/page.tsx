"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CompanyLogo } from "@/components/ui/CompanyLogo";
import { CompanyCardSkeleton } from "@/components/ui/Skeleton";
import { CompanyFilters, type CompanyFilterValues } from "@/components/companies/CompanyFilters";
import { api } from "@/hooks/useApi";
import { companies as fallback } from "@/lib/data";

interface Company {
  _id: string;
  slug: string;
  name: string;
  category: string;
  industry: string;
  headOffice?: string;
  headquarters?: string;
  city: string;
  state: string;
  description: string;
  logoUrl?: string;
  color: string;
  openJobs?: number;
}

const defaultFilters: CompanyFilterValues = {
  search: "",
  category: "",
  city: "",
  state: "",
  hiringStatus: "",
  isActive: "",
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filters, setFilters] = useState<CompanyFilterValues>(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "12", page: String(page), order: "desc" });
    if (filters.search) params.set("search", filters.search);
    if (filters.category) params.set("category", filters.category);
    if (filters.city) params.set("city", filters.city);
    if (filters.state) params.set("state", filters.state);

    api<Company[]>(`/api/companies?${params}`)
      .then((res) => {
        if (res.data?.length) {
          setCompanies((prev) => (page === 1 ? res.data! : [...prev, ...res.data!]));
          const pagination = res.pagination as { hasMore?: boolean; total?: number } | undefined;
          setHasMore(pagination?.hasMore || false);
          setTotal(pagination?.total || res.data.length);
        } else if (page === 1 && !filters.search && !filters.category && !filters.city && !filters.state) {
          const mapped = fallback.map((c) => ({
            _id: c.id,
            slug: c.id,
            name: c.name,
            category: "IT Company",
            industry: c.industry,
            headquarters: c.location,
            city: c.location.split(",")[0]?.trim() || c.location,
            state: c.location.split(",")[1]?.trim() || "",
            description: c.description,
            logoUrl: c.logoUrl,
            color: c.color,
            openJobs: c.openJobs,
          }));
          setCompanies(mapped);
          setHasMore(false);
          setTotal(mapped.length);
        } else if (page === 1) {
          setCompanies([]);
          setHasMore(false);
          setTotal(0);
        } else {
          setHasMore(false);
        }
      })
      .finally(() => setLoading(false));
  }, [filters, page]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const handleFilters = (next: CompanyFilterValues) => {
    setPage(1);
    setFilters(next);
  };

  const companyHref = (company: Company) => `/companies/${company.slug || company._id}`;

  return (
    <div className="min-h-screen bg-brand-gray dark:bg-slate-950">
      <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold text-brand-dark dark:text-white sm:text-4xl">
            Featured Companies
          </h1>
          <p className="mt-2 max-w-2xl text-brand-slate">
            Browse verified employers across IT, healthcare, hospitality, manufacturing, and more.
          </p>
          {!loading && companies.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {companies.slice(0, 8).map((c) => (
                <Link
                  key={c._id}
                  href={companyHref(c)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium transition hover:border-brand-cyan hover:shadow-soft dark:border-slate-700 dark:bg-slate-800"
                >
                  <CompanyLogo
                    name={c.name}
                    logoUrl={c.logoUrl}
                    fallback={c.name.charAt(0)}
                    color={c.color}
                    size="sm"
                  />
                  {c.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <CompanyFilters values={filters} onChange={handleFilters} variant="public" />

        <div className="mt-4 text-sm text-brand-slate">
          {loading && page === 1 ? "Loading..." : `${total} companies found`}
        </div>

        {loading ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CompanyCardSkeleton key={i} />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
            <p className="text-brand-slate">No companies match your filters.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <article
                key={company._id}
                className="glass-strong flex flex-col rounded-2xl p-6 transition-shadow hover:shadow-card"
              >
                <div className="flex items-start gap-4">
                  <CompanyLogo
                    name={company.name}
                    logoUrl={company.logoUrl}
                    fallback={company.name.charAt(0)}
                    color={company.color}
                    size="lg"
                  />
                  <div>
                    <h2 className="font-display text-lg font-semibold text-brand-dark dark:text-white">
                      {company.name}
                    </h2>
                    <p className="text-sm text-brand-slate">{company.category || company.industry}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-brand-slate">
                      <MapPin className="h-3 w-3 text-brand-cyan" />
                      {[company.city, company.state].filter(Boolean).join(", ") ||
                        company.headquarters ||
                        company.headOffice ||
                        "India"}
                    </p>
                  </div>
                </div>
                <p className="mt-4 flex-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                  {company.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-brand-cyan">
                    {company.openJobs ?? 0} open jobs
                  </span>
                </div>
                <Link
                  href={companyHref(company)}
                  className="mt-5 inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-brand-blue transition hover:border-brand-blue hover:bg-brand-blue hover:text-white dark:border-slate-700"
                >
                  View Company
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        )}

        {hasMore && !loading && (
          <div className="mt-8 text-center">
            <Button type="button" variant="outline" onClick={() => setPage((p) => p + 1)}>
              Load more companies
            </Button>
          </div>
        )}

        <div className="mt-12 text-center">
          <Button href="/jobs" variant="outline">
            Browse all job openings
          </Button>
        </div>
      </div>
    </div>
  );
}
