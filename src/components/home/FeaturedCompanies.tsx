"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ArrowRight } from "lucide-react";
import { companies as fallbackCompanies } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { CompanyLogo } from "@/components/ui/CompanyLogo";
import { CompanyCardSkeleton } from "@/components/ui/Skeleton";
import { api } from "@/hooks/useApi";

interface ApiCompany {
  _id: string;
  name: string;
  industry: string;
  logoUrl?: string;
  color: string;
  openJobs?: number;
  slug?: string;
}

export function FeaturedCompanies() {
  const [companies, setCompanies] = useState<ApiCompany[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<ApiCompany[]>("/api/companies?limit=10")
      .then((res) => {
        if (res.data?.length) {
          setCompanies(res.data);
        } else {
          setCompanies(
            fallbackCompanies.map((c) => ({
              _id: c.id,
              name: c.name,
              industry: c.industry,
              logoUrl: c.logoUrl,
              color: c.color,
              openJobs: c.openJobs,
              slug: c.id,
            }))
          );
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section-glow-cyan relative overflow-hidden bg-brand-gray dark:bg-slate-900 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Trusted Employers"
          title="Top Companies"
          description="Explore openings at India's most sought-after employers hiring right now."
        />

        {loading ? (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <CompanyCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {companies.map((company, i) => (
              <motion.div
                key={company._id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -6 }}
                className="group glass-strong rounded-2xl p-5 transition-shadow hover:shadow-card"
              >
                <CompanyLogo
                  name={company.name}
                  logoUrl={company.logoUrl}
                  fallback={company.name.charAt(0)}
                  color={company.color}
                  size="md"
                />
                <h3 className="mt-4 font-display text-base font-semibold text-brand-dark dark:text-white">
                  {company.name}
                </h3>
                <p className="mt-1 text-xs text-brand-slate">{company.industry}</p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="font-medium text-brand-cyan">{company.openJobs ?? 0} open jobs</span>
                </div>
                <Link
                  href={`/companies/${company._id}`}
                  className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 py-2 text-xs font-semibold text-brand-blue transition group-hover:border-brand-blue group-hover:bg-brand-blue group-hover:text-white"
                >
                  View Company
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Button href="/companies" variant="outline">
            View All Companies
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
