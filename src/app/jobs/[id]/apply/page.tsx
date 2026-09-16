"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CompanyLogo } from "@/components/ui/CompanyLogo";
import { FeeBreakdown } from "@/components/payment/FeeBreakdown";
import { DynamicApplicationForm } from "@/components/payment/DynamicApplicationForm";
import { api } from "@/hooks/useApi";
import { getJobLogoProps } from "@/lib/job-utils";
import { saveApplicationDraft, getApplicationDraft } from "@/lib/payment-utils";
import {
  STANDARD_APPLICATION_FIELDS,
  normalizeApplicationAnswers,
  validateStandardApplicationForm,
} from "@/lib/application-form";
import { toast } from "sonner";

interface JobDetail {
  _id: string;
  title: string;
  company: string;
  companyLogo?: string;
  companyColor?: string;
  companyId?: { logoUrl?: string; color?: string; name?: string };
  applicationFee: number;
  location: string;
}

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  profileComplete: boolean;
}

export default function ApplyJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = String(params.id);
  const { status } = useSession();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/auth/login?redirect=/jobs/${jobId}/apply`);
      return;
    }
    if (status === "authenticated") {
      api<{ job: JobDetail }>(`/api/jobs/${jobId}`).then((res) => {
        if (res.data?.job) setJob(res.data.job);
      });
      api<ProfileData>("/api/user/profile").then((res) => {
        if (res.data) {
          setProfile(res.data);
          const draft = getApplicationDraft(jobId);
          if (draft?.formAnswers) {
            setAnswers(draft.formAnswers);
          } else {
            setAnswers({
              fullName: res.data.name || "",
              mobileNumber: (res.data.phone || "").replace(/\D/g, "").slice(-10),
            });
          }
        }
      });
    }
  }, [status, jobId, router]);

  const handleContinue = () => {
    if (!job || !profile) return;

    if (!profile.profileComplete) {
      toast.error("Please add your name and phone in your profile before applying");
      router.push(`/profile?redirect=/jobs/${jobId}/apply`);
      return;
    }

    const validationError = validateStandardApplicationForm(answers);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const normalized = normalizeApplicationAnswers(answers);

    saveApplicationDraft({
      jobId,
      formAnswers: normalized,
      resumeType: "none",
      savedAt: new Date().toISOString(),
    });

    router.push(`/jobs/${jobId}/review`);
  };

  if (status === "loading" || !job || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-brand-gray dark:bg-slate-950">
        <p className="text-brand-slate">Loading application form...</p>
      </div>
    );
  }

  const logoProps = getJobLogoProps(job);

  return (
    <div className="min-h-screen bg-brand-gray py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl px-4">
        <div className="glass-strong rounded-2xl p-6 sm:p-8">
          <div className="flex items-start gap-4 border-b border-slate-200 pb-6 dark:border-slate-700">
            <CompanyLogo {...logoProps} size="lg" />
            <div>
              <h1 className="font-display text-2xl font-bold text-brand-dark dark:text-white">{job.title}</h1>
              <p className="text-brand-slate dark:text-slate-400">
                {job.company} · {job.location}
              </p>
            </div>
          </div>

          {!profile.profileComplete && (
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-brand-orange/10 p-4 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 text-brand-orange" />
              <div>
                <p className="font-medium text-brand-dark dark:text-white">Add name and phone</p>
                <p className="text-brand-slate dark:text-slate-400">
                  We need your name and phone number to submit any application.
                </p>
                <Link
                  href={`/profile?redirect=/jobs/${jobId}/apply`}
                  className="mt-1 inline-block font-semibold text-brand-blue"
                >
                  Go to Profile →
                </Link>
              </div>
            </div>
          )}

          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold text-brand-dark dark:text-white">
              Application Form
            </h2>
            <p className="mt-1 text-sm text-brand-slate dark:text-slate-400">
              Fill your details carefully. Fields marked * are required. Board names include an Other option.
            </p>
            <div className="mt-4">
              <DynamicApplicationForm
                fields={STANDARD_APPLICATION_FIELDS}
                answers={answers}
                onChange={setAnswers}
              />
            </div>
          </div>

          <div className="mt-8">
            <FeeBreakdown applicationFee={job.applicationFee} />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={handleContinue} variant="orange">
              Continue to Review
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href={`/jobs/${jobId}`} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
