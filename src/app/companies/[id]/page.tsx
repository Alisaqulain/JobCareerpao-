import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Briefcase,
  Globe,
  Mail,
  MapPin,
  Phone,
  Building2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CompanyLogo } from "@/components/ui/CompanyLogo";
import { formatSalary } from "@/lib/utils";
import { getCompanyByIdOrSlug, getCompanyJobs } from "@/lib/services/company.service";
import { DEFAULT_SITE_URL } from "@/lib/site";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const company = await getCompanyByIdOrSlug(id, false);
    return {
      title: company.metaTitle || company.name,
      description: company.metaDescription || company.description,
      openGraph: {
        title: company.metaTitle || company.name,
        description: company.metaDescription || company.description,
        images: company.bannerUrl || company.logoUrl ? [company.bannerUrl || company.logoUrl!] : undefined,
      },
    };
  } catch {
    return { title: "Company" };
  }
}

export default async function CompanyDetailPage({ params }: Props) {
  const { id } = await params;

  let company: Awaited<ReturnType<typeof getCompanyByIdOrSlug>>;
  let jobs: Awaited<ReturnType<typeof getCompanyJobs>>;

  try {
    company = await getCompanyByIdOrSlug(id, false);
    jobs = await getCompanyJobs(String(company._id));
  } catch {
    notFound();
  }

  const address = [
    company.headOffice || company.headquarters,
    company.city,
    company.state,
    company.pincode,
    company.country,
  ]
    .filter(Boolean)
    .join(", ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: company.website || `${DEFAULT_SITE_URL}/companies/${company.slug}`,
    logo: company.logoUrl,
    description: company.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: company.city,
      addressRegion: company.state,
      postalCode: company.pincode,
      addressCountry: company.country,
    },
  };

  return (
    <div className="min-h-screen bg-brand-gray">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="relative border-b border-slate-200 bg-white">
        <div className="relative h-40 w-full overflow-hidden bg-gradient-to-r from-brand-blue to-brand-cyan sm:h-52">
          {company.bannerUrl ? (
            <Image src={company.bannerUrl} alt="" fill className="object-cover" priority />
          ) : null}
          <div className="absolute inset-0 bg-brand-blue/20" />
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <Link
            href="/companies"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-cyan hover:text-brand-blue"
          >
            <ArrowLeft className="h-4 w-4" />
            All companies
          </Link>

          <div className="-mt-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="rounded-2xl border-4 border-white bg-white shadow-card">
                <CompanyLogo
                  name={company.name}
                  logoUrl={company.logoUrl}
                  fallback={company.name.charAt(0)}
                  color={company.color}
                  size="xl"
                />
              </div>
              <div className="pb-1">
                <h1 className="font-display text-3xl font-bold text-brand-dark">{company.name}</h1>
                <p className="mt-1 text-brand-slate">
                  {company.category} · {company.industry}
                </p>
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-brand-slate">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-brand-cyan" />
                    {company.city}, {company.state}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="h-4 w-4 text-brand-blue" />
                    {company.openJobs} open jobs
                  </span>
                </div>
              </div>
            </div>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border-2 border-brand-blue/20 bg-white px-6 text-sm font-semibold text-brand-blue transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-blue hover:bg-brand-blue/5"
              >
                <Globe className="h-4 w-4" />
                Visit Website
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-display text-xl font-bold text-brand-dark">About {company.name}</h2>
            <p className="mt-4 whitespace-pre-line text-brand-slate">{company.description}</p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-display text-xl font-bold text-brand-dark">Open Positions</h2>
            <div className="mt-4 space-y-3">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <div
                    key={String(job._id)}
                    className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-brand-dark">{job.title}</h3>
                      <p className="mt-1 text-sm text-brand-slate">
                        {job.location} · {formatSalary(job.salary.min, job.salary.max)} · {job.experience}
                      </p>
                    </div>
                    <Button href={`/jobs/${job._id}`} size="sm" variant="orange">
                      View & Apply
                    </Button>
                  </div>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-brand-slate">
                  No open positions right now. Check back soon or browse all jobs.
                </p>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-display text-lg font-bold text-brand-dark">Company Information</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {company.foundedYear && (
                <div className="flex items-start gap-2">
                  <Building2 className="mt-0.5 h-4 w-4 text-brand-cyan" />
                  <div>
                    <dt className="text-brand-slate">Founded</dt>
                    <dd className="font-medium">{company.foundedYear}</dd>
                  </div>
                </div>
              )}
              {company.companySize && (
                <div className="flex items-start gap-2">
                  <Building2 className="mt-0.5 h-4 w-4 text-brand-cyan" />
                  <div>
                    <dt className="text-brand-slate">Company Size</dt>
                    <dd className="font-medium">{company.companySize} employees</dd>
                  </div>
                </div>
              )}
              {company.email && (
                <div className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 text-brand-cyan" />
                  <div>
                    <dt className="text-brand-slate">Email</dt>
                    <dd className="font-medium break-all">{company.email}</dd>
                  </div>
                </div>
              )}
              {company.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 text-brand-cyan" />
                  <div>
                    <dt className="text-brand-slate">Phone</dt>
                    <dd className="font-medium">{company.phone}</dd>
                  </div>
                </div>
              )}
              {company.hrContactPerson && (
                <div className="flex items-start gap-2">
                  <User className="mt-0.5 h-4 w-4 text-brand-cyan" />
                  <div>
                    <dt className="text-brand-slate">HR Contact</dt>
                    <dd className="font-medium">{company.hrContactPerson}</dd>
                  </div>
                </div>
              )}
              {address && (
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-brand-cyan" />
                  <div>
                    <dt className="text-brand-slate">Address</dt>
                    <dd className="font-medium">{address}</dd>
                  </div>
                </div>
              )}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
