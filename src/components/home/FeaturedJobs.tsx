"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import { formatSalary } from "@/lib/utils";
import { getJobLogoProps } from "@/lib/job-utils";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { CompanyLogo } from "@/components/ui/CompanyLogo";
import { JobCardSkeleton } from "@/components/ui/Skeleton";
import { api } from "@/hooks/useApi";
import { jobs as fallbackJobs } from "@/lib/data";
import { getCompanyLogoProps } from "@/lib/companies";

export interface ApiJob {
  _id: string;
  title: string;
  company: string;
  companyLogo?: string;
  companyColor?: string;
  companyId?: { name?: string; logoUrl?: string; color?: string };
  location: string;
  salary: { min: number; max: number };
  experience: string;
  mode: string;
  posted?: string;
}

export function FeaturedJobs({ initialJobs }: { initialJobs?: ApiJob[] }) {
  const [jobs, setJobs] = useState<ApiJob[]>(initialJobs || []);
  const [loading, setLoading] = useState(!initialJobs?.length);

  useEffect(() => {
    if (initialJobs?.length) return;

    api<ApiJob[]>("/api/jobs?limit=6")
      .then((res) => {
        if (res.data?.length) {
          setJobs(res.data);
        } else {
          setJobs(
            fallbackJobs.slice(0, 6).map((j) => ({
              _id: j.id,
              title: j.title,
              company: j.company,
              location: j.location,
              salary: j.salary,
              experience: j.experience,
              mode: j.mode,
              posted: j.posted,
            }))
          );
        }
      })
      .finally(() => setLoading(false));
  }, [initialJobs]);

  return (
    <section className="relative overflow-hidden bg-white dark:bg-slate-950 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Hot Opportunities"
          title="Featured Jobs"
          description="Hand-picked roles from India's top companies — apply in minutes."
        />

        {loading ? (
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {jobs.map((job, i) => {
              const logoProps =
                job.companyLogo || job.companyId
                  ? getJobLogoProps(job)
                  : getCompanyLogoProps(undefined, job.company);
              return (
                <motion.article
                  key={job._id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-strong group rounded-2xl p-6 transition-shadow hover:shadow-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <CompanyLogo {...logoProps} size="md" />
                      <div>
                        <h3 className="font-display text-lg font-semibold text-brand-dark dark:text-white group-hover:text-brand-blue">
                          {job.title}
                        </h3>
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
                    <span>{formatSalary(job.salary.min, job.salary.max)}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {job.posted || "Recently posted"}
                    </span>
                  </div>
                  <Link
                    href={`/jobs/${job._id}`}
                    className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:text-brand-orange"
                  >
                    View & Apply
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </Link>
                </motion.article>
              );
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <Button href="/jobs" variant="outline">
            View All Jobs
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
