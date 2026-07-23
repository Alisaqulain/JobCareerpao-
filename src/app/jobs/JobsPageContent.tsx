"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Clock, Briefcase, IndianRupee, Search, Filter } from "lucide-react";
import { formatSalary } from "@/lib/utils";
import { getJobLogoProps } from "@/lib/job-utils";
import { Button } from "@/components/ui/Button";
import { CompanyLogo } from "@/components/ui/CompanyLogo";
import { JobCardSkeleton } from "@/components/ui/Skeleton";
import { api } from "@/hooks/useApi";

interface ApiJob {
  _id: string;
  title: string;
  company: string;
  companyLogo?: string;
  companyColor?: string;
  companyId?: { name?: string; logoUrl?: string; color?: string };
  location: string;
  salary: { min: number; max: number };
  experience: string;
  jobType: string;
  mode: string;
  skills: string[];
  createdAt: string;
}

export default function JobsPageContent() {
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("search") || searchParams.get("category") || "");
  const [location, setLocation] = useState("");
  const [mode, setMode] = useState("");
  const [jobType, setJobType] = useState("");
  const [experience, setExperience] = useState("");
  const [company, setCompany] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [jobs, setJobs] = useState<ApiJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "20", page: String(page) });
    if (q) params.set("search", q);
    if (location) params.set("location", location);
    if (mode) params.set("mode", mode);
    if (jobType) params.set("jobType", jobType);
    if (experience) params.set("experience", experience);
    if (company) params.set("company", company);
    if (salaryMin) params.set("salaryMin", salaryMin);
    if (salaryMax) params.set("salaryMax", salaryMax);
    if (searchParams.get("category")) params.set("category", searchParams.get("category")!);

    api<ApiJob[]>(`/api/jobs?${params}`)
      .then((res) => {
        setJobs(res.data || []);
        setHasMore((res.pagination as { hasMore?: boolean })?.hasMore || false);
      })
      .finally(() => setLoading(false));
  }, [q, location, mode, jobType, experience, company, salaryMin, salaryMax, page, searchParams]);

  const filtered = useMemo(() => jobs, [jobs]);

  return (
    <div className="bg-brand-gray dark:bg-slate-950 min-h-screen">
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold text-brand-dark dark:text-white sm:text-4xl">
            Browse Jobs
          </h1>
          <p className="mt-2 text-brand-slate">
            Discover verified openings from India&apos;s top companies.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-slate" />
              <input
                value={q}
                onChange={(e) => { setPage(1); setQ(e.target.value); }}
                placeholder="Search by title, company, or skill"
                className="h-12 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3 text-sm dark:text-white"
              />
            </div>
            <input
              value={location}
              onChange={(e) => { setPage(1); setLocation(e.target.value); }}
              placeholder="Location"
              className="h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm dark:text-white"
            />
            <select
              value={mode}
              onChange={(e) => { setPage(1); setMode(e.target.value); }}
              className="h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm dark:text-white"
            >
              <option value="">Work mode</option>
              <option>Remote</option>
              <option>Hybrid</option>
              <option>On-site</option>
            </select>
            <select
              value={jobType}
              onChange={(e) => { setPage(1); setJobType(e.target.value); }}
              className="h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm dark:text-white"
            >
              <option value="">Job type</option>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
            <input
              value={experience}
              onChange={(e) => { setPage(1); setExperience(e.target.value); }}
              placeholder="Experience (e.g. 2-4 years)"
              className="h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm dark:text-white"
            />
            <input
              value={company}
              onChange={(e) => { setPage(1); setCompany(e.target.value); }}
              placeholder="Company name"
              className="h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm dark:text-white"
            />
            <input
              type="number"
              value={salaryMin}
              onChange={(e) => { setPage(1); setSalaryMin(e.target.value); }}
              placeholder="Min salary (₹)"
              className="h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm dark:text-white"
            />
            <input
              type="number"
              value={salaryMax}
              onChange={(e) => { setPage(1); setSalaryMax(e.target.value); }}
              placeholder="Max salary (₹)"
              className="h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-brand-slate">
            <span className="font-semibold text-brand-blue">{filtered.length}</span> jobs found
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs text-brand-slate">
            <Filter className="h-3.5 w-3.5" />
            Sorted by relevance
          </span>
        </div>

        {loading ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {filtered.map((job, i) => {
              const logoProps = getJobLogoProps(job);
              return (
                <motion.article
                  key={job._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-strong rounded-2xl p-6 hover:shadow-card transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <CompanyLogo {...logoProps} size="md" />
                      <div>
                        <h2 className="font-display text-lg font-semibold text-brand-dark dark:text-white">
                          {job.title}
                        </h2>
                        <p className="text-sm text-brand-slate">{job.company}</p>
                      </div>
                    </div>
                    <span className="rounded-lg bg-brand-cyan/10 px-2 py-1 text-[10px] font-semibold text-brand-cyan">
                      {job.mode}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-brand-slate">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-brand-cyan" />
                      {job.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <IndianRupee className="h-3.5 w-3.5 text-brand-orange" />
                      {formatSalary(job.salary.min, job.salary.max)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5 text-brand-blue" />
                      {job.experience}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(job.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {job.skills?.map((s) => (
                      <span key={s} className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs font-medium text-brand-slate">{job.jobType}</span>
                    <Button href={`/jobs/${job._id}`} size="sm" variant="orange">
                      View & Apply
                    </Button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-16 text-center">
            <p className="font-display text-lg font-semibold text-brand-dark dark:text-white">No jobs match your filters</p>
            <p className="mt-2 text-sm text-brand-slate">Try adjusting your search criteria.</p>
          </div>
        )}

        {hasMore && !loading && (
          <div className="mt-8 text-center">
            <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
              Load More Jobs
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
