"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FileText, Upload, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CompanyLogo } from "@/components/ui/CompanyLogo";
import { FeeBreakdown } from "@/components/payment/FeeBreakdown";
import { DynamicApplicationForm, validateDynamicForm } from "@/components/payment/DynamicApplicationForm";
import { api } from "@/hooks/useApi";
import { getJobLogoProps } from "@/lib/job-utils";
import { saveApplicationDraft, getApplicationDraft } from "@/lib/payment-utils";
import { toast } from "sonner";
import type { DynamicField } from "@/types";

interface JobDetail {
  _id: string;
  title: string;
  company: string;
  companyLogo?: string;
  companyColor?: string;
  companyId?: { logoUrl?: string; color?: string; name?: string };
  applicationFee: number;
  location: string;
  dynamicFields: DynamicField[];
}

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  resumeUrl?: string;
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
  const [uploading, setUploading] = useState(false);

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
        if (res.data) setProfile(res.data);
      });
      const draft = getApplicationDraft(jobId);
      if (draft) setAnswers(draft.formAnswers);
    }
  }, [status, jobId, router]);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "resume");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setProfile((p) => (p ? { ...p, resumeUrl: data.data.url } : p));
      toast.success("Resume uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = () => {
    if (!job || !profile) return;

    if (!profile.profileComplete && (!profile.name || !profile.phone)) {
      toast.error("Please complete your profile first");
      router.push(`/profile?redirect=/jobs/${jobId}/apply`);
      return;
    }

    if (!profile.resumeUrl) {
      toast.error("Please upload your resume before applying");
      return;
    }

    const validationError = validateDynamicForm(job.dynamicFields, answers);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    saveApplicationDraft({
      jobId,
      formAnswers: answers,
      resumeUrl: profile.resumeUrl,
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
    <div className="min-h-screen bg-brand-gray dark:bg-slate-950 py-10">
      <div className="mx-auto max-w-3xl px-4">
        <div className="glass-strong rounded-2xl p-6 sm:p-8">
          <div className="flex items-start gap-4 border-b border-slate-200 dark:border-slate-700 pb-6">
            <CompanyLogo {...logoProps} size="lg" />
            <div>
              <h1 className="font-display text-2xl font-bold text-brand-dark dark:text-white">{job.title}</h1>
              <p className="text-brand-slate">{job.company} · {job.location}</p>
            </div>
          </div>

          {!profile.profileComplete && (
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-brand-orange/10 p-4 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 text-brand-orange" />
              <div>
                <p className="font-medium text-brand-dark dark:text-white">Complete your profile</p>
                <p className="text-brand-slate">Add your name, phone, and other details before applying.</p>
                <Link href={`/profile?redirect=/jobs/${jobId}/apply`} className="mt-1 inline-block text-brand-blue font-semibold">
                  Go to Profile →
                </Link>
              </div>
            </div>
          )}

          <div className="mt-6">
            <h2 className="font-display text-lg font-semibold dark:text-white">Resume</h2>
            {profile.resumeUrl ? (
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <FileText className="h-8 w-8 text-brand-cyan" />
                <div className="flex-1">
                  <p className="text-sm font-medium dark:text-white">Resume uploaded</p>
                  <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-cyan hover:underline">
                    Preview resume
                  </a>
                </div>
                <label className="cursor-pointer text-xs font-semibold text-brand-blue">
                  Replace
                  <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} disabled={uploading} />
                </label>
              </div>
            ) : (
              <label className="mt-3 flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-8 hover:border-brand-cyan">
                <Upload className="h-8 w-8 text-brand-slate" />
                <span className="text-sm font-medium text-brand-slate">{uploading ? "Uploading..." : "Upload Resume (PDF/DOC)"}</span>
                <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} disabled={uploading} />
              </label>
            )}
          </div>

          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold dark:text-white">Application Form</h2>
            <div className="mt-4">
              <DynamicApplicationForm
                fields={job.dynamicFields}
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
            <Button href={`/jobs/${jobId}`} variant="outline">Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
