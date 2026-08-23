import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { getJobByIdOrSlug, getRelatedJobs } from "@/lib/services/job.service";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildPageMetadata,
  jobPostingJsonLd,
} from "@/lib/seo";
import JobDetailContent, { type JobDetail } from "./JobDetailContent";

interface Props {
  params: Promise<{ id: string }>;
}

function mapJob(job: Record<string, unknown>): JobDetail {
  return {
    _id: String(job._id),
    title: String(job.title),
    company: String(job.company),
    companyLogo: job.companyLogo as string | undefined,
    companyColor: job.companyColor as string | undefined,
    companyId: job.companyId as JobDetail["companyId"],
    description: String(job.description),
    salary: job.salary as JobDetail["salary"],
    experience: String(job.experience),
    qualification: String(job.qualification),
    skills: (job.skills as string[]) || [],
    location: String(job.location),
    jobType: String(job.jobType),
    mode: String(job.mode),
    applicationFee: Number(job.applicationFee),
    lastDate: String(job.lastDate),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const job = await getJobByIdOrSlug(id);
    const title = `${job.title} at ${job.company} — ${job.location}`;
    const description = `${job.title} job opening at ${job.company} in ${job.location}. ${job.experience} experience. Salary ${(job.salary as { min: number; max: number }).min}-${(job.salary as { min: number; max: number }).max} LPA. Apply online on JobCareerPao.`;
    const keywords = [
      job.title as string,
      `${job.company} jobs`,
      `jobs in ${job.location}`,
      ...(job.skills as string[]),
      "apply online",
      "JobCareerPao",
    ];
    return buildPageMetadata({
      title,
      description: description.slice(0, 160),
      path: `/jobs/${id}`,
      keywords,
    });
  } catch {
    return { title: "Job Not Found" };
  }
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;

  let job: Record<string, unknown>;
  let related: Record<string, unknown>[];

  try {
    job = (await getJobByIdOrSlug(id)) as Record<string, unknown>;
    const companyId = job.companyId as { _id?: string } | string | undefined;
    const cid =
      typeof companyId === "object" && companyId?._id
        ? String(companyId._id)
        : typeof companyId === "string"
          ? companyId
          : undefined;
    related = (await getRelatedJobs(String(job._id), cid)) as Record<string, unknown>[];
  } catch {
    notFound();
  }

  const jobUrl = absoluteUrl(`/jobs/${id}`);
  const salary = job.salary as { min: number; max: number; currency?: string };

  const schemas = [
    jobPostingJsonLd({
      title: String(job.title),
      description: String(job.description).slice(0, 5000),
      company: String(job.company),
      location: String(job.location),
      employmentType: String(job.jobType).toUpperCase().includes("PART") ? "PART_TIME" : "FULL_TIME",
      datePosted: job.createdAt ? new Date(String(job.createdAt)).toISOString() : undefined,
      validThrough: new Date(String(job.lastDate)).toISOString(),
      url: jobUrl,
      baseSalary: { min: salary.min, max: salary.max, currency: salary.currency || "INR" },
    }),
    breadcrumbJsonLd([
      { name: "Home", url: absoluteUrl("/") },
      { name: "Jobs", url: absoluteUrl("/jobs") },
      { name: String(job.title), url: jobUrl },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <JobDetailContent
        initialJob={mapJob(job)}
        initialRelated={related.map(mapJob)}
      />
    </>
  );
}
