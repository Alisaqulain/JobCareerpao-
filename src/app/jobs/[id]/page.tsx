"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Briefcase, IndianRupee, Clock, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatSalary } from "@/lib/utils";
import { getJobLogoProps } from "@/lib/job-utils";
import { api } from "@/hooks/useApi";
import { CompanyLogo } from "@/components/ui/CompanyLogo";
import { JobCardSkeleton } from "@/components/ui/Skeleton";
import { toast } from "sonner";

interface JobDetail {
  _id: string;
  title: string;
  company: string;
  companyLogo?: string;
  companyColor?: string;
  companyId?: { _id?: string; name?: string; logoUrl?: string; color?: string };
  description: string;
  salary: { min: number; max: number };
  experience: string;
  qualification: string;
  skills: string[];
  location: string;
  jobType: string;
  mode: string;
  applicationFee: number;
  lastDate: string;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [related, setRelated] = useState<JobDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ job: JobDetail; related: JobDetail[] }>(`/api/jobs/${params.id}`)
      .then((res) => {
        if (res.data?.job) {
          setJob(res.data.job);
          setRelated(res.data.related || []);
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: job?.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <JobCardSkeleton />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-brand-slate">Job not found.</p>
      </div>
    );
  }

  const logoProps = getJobLogoProps(job);

  return (
    <div className="min-h-screen bg-brand-gray dark:bg-slate-950 py-10">
      <div className="mx-auto max-w-4xl px-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <CompanyLogo {...logoProps} size="xl" />
              <div>
                <h1 className="font-display text-3xl font-bold text-brand-dark dark:text-white">{job.title}</h1>
                <p className="mt-1 text-lg text-brand-slate">{job.company}</p>
              </div>
            </div>
            <button type="button" onClick={share} className="rounded-lg p-2 text-brand-slate hover:bg-slate-100 dark:hover:bg-slate-800">
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-brand-slate">
            <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4 text-brand-cyan" />{job.location}</span>
            <span className="inline-flex items-center gap-1"><IndianRupee className="h-4 w-4 text-brand-orange" />{formatSalary(job.salary.min, job.salary.max)}</span>
            <span className="inline-flex items-center gap-1"><Briefcase className="h-4 w-4" />{job.experience}</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />Deadline: {new Date(job.lastDate).toLocaleDateString("en-IN")}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {job.skills.map((s) => (
              <span key={s} className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs">{s}</span>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold dark:text-white">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-brand-slate">{job.description}</p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-brand-gray dark:bg-slate-800 p-4">
              <p className="text-xs text-brand-slate">Qualification</p>
              <p className="font-medium dark:text-white">{job.qualification}</p>
            </div>
            <div className="rounded-xl bg-brand-gray dark:bg-slate-800 p-4">
              <p className="text-xs text-brand-slate">Application Fee</p>
              <p className="font-medium dark:text-white">₹{job.applicationFee}</p>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <Button onClick={() => router.push(`/jobs/${job._id}/apply`)} variant="orange">
              Apply Now — ₹{job.applicationFee}
            </Button>
            <Button href="/jobs" variant="outline">Back to Jobs</Button>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-xl font-bold text-brand-dark dark:text-white">Related Jobs</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {related.map((r) => {
                const rp = getJobLogoProps(r);
                return (
                  <Link key={r._id} href={`/jobs/${r._id}`} className="glass-strong flex items-center gap-3 rounded-2xl p-4 hover:shadow-card">
                    <CompanyLogo {...rp} size="md" />
                    <div>
                      <p className="font-semibold text-brand-dark dark:text-white">{r.title}</p>
                      <p className="text-sm text-brand-slate">{r.company}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
