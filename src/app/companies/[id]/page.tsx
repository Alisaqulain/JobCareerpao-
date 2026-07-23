import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, MapPin, Briefcase, ArrowLeft } from "lucide-react";
import { companies, jobs } from "@/lib/data";
import { formatSalary } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { CompanyLogo } from "@/components/ui/CompanyLogo";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const company = companies.find((c) => c.id === id);
  return {
    title: company ? company.name : "Company",
    description: company?.description,
  };
}

export default async function CompanyDetailPage({ params }: Props) {
  const { id } = await params;
  const company = companies.find((c) => c.id === id);
  if (!company) notFound();

  const companyJobs = jobs.filter((j) => j.companyId === company.id);

  return (
    <div className="bg-brand-gray min-h-screen">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/companies"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-cyan hover:text-brand-blue"
          >
            <ArrowLeft className="h-4 w-4" />
            All companies
          </Link>
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <CompanyLogo
                name={company.name}
                logoUrl={company.logoUrl}
                fallback={company.logo}
                color={company.color}
                size="xl"
              />
              <div>
                <h1 className="font-display text-3xl font-bold text-brand-dark">
                  {company.name}
                </h1>
                <p className="mt-1 text-brand-slate">{company.industry}</p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-brand-slate">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-brand-cyan" />
                    {company.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-4 w-4 fill-brand-orange text-brand-orange" />
                    {company.rating} rating
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="h-4 w-4 text-brand-blue" />
                    {company.openJobs} open jobs
                  </span>
                </div>
              </div>
            </div>
            <Button href="/jobs">Browse Jobs</Button>
          </div>
          <p className="mt-6 max-w-3xl text-brand-slate">{company.description}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="font-display text-xl font-bold text-brand-dark">Open Positions</h2>
        <div className="mt-6 space-y-4">
          {companyJobs.length > 0 ? (
            companyJobs.map((job) => (
              <div
                key={job.id}
                className="glass-strong flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="font-display font-semibold text-brand-dark">{job.title}</h3>
                  <p className="mt-1 text-sm text-brand-slate">
                    {job.location} · {formatSalary(job.salary.min, job.salary.max)} ·{" "}
                    {job.experience}
                  </p>
                </div>
                <Button href={`/jobs/${job.id}`} size="sm" variant="orange">
                  Apply
                </Button>
              </div>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-brand-slate">
              No featured listings for this company right now. Check back soon or browse all jobs.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}