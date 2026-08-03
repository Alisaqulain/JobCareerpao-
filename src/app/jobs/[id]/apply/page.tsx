"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FileText, Upload, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CompanyLogo } from "@/components/ui/CompanyLogo";
import { FeeBreakdown } from "@/components/payment/FeeBreakdown";
import { DynamicApplicationForm, validateDynamicForm } from "@/components/payment/DynamicApplicationForm";
import { api } from "@/hooks/useApi";
import { getJobLogoProps } from "@/lib/job-utils";
import { saveApplicationDraft, getApplicationDraft } from "@/lib/payment-utils";
import { toast } from "sonner";
import type { DynamicField, ResumeType } from "@/types";

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
  skills: string[];
  education: unknown[];
  experience: unknown[];
  profileComplete: boolean;
  canGenerateResume?: boolean;
}

export default function ApplyJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = String(params.id);
  const { status } = useSession();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [resumeType, setResumeType] = useState<ResumeType>("uploaded");
  const [resumeUrl, setResumeUrl] = useState<string>();
  const [resumePublicId, setResumePublicId] = useState<string>();
  const [coverLetter, setCoverLetter] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (draft) {
        setAnswers(draft.formAnswers);
        setResumeType(draft.resumeType);
        setResumeUrl(draft.resumeUrl);
        setResumePublicId(draft.resumePublicId);
        setCoverLetter(draft.coverLetter || "");
      }
    }
  }, [status, jobId, router]);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jobId", jobId);
      const res = await fetch("/api/applications/resume", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setResumeType("uploaded");
      setResumeUrl(data.data.url);
      setResumePublicId(data.data.publicId);
      toast.success("Resume uploaded for this application");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const selectUploadedResume = () => {
    setResumeType("uploaded");
    if (!resumeUrl) {
      setTimeout(() => fileInputRef.current?.click(), 0);
    }
  };

  const handleContinue = () => {
    if (!job || !profile) return;

    if (!profile.profileComplete) {
      toast.error("Please add your name and phone in your profile before applying");
      router.push(`/profile?redirect=/jobs/${jobId}/apply`);
      return;
    }

    if (resumeType === "generated" && !profile.canGenerateResume) {
      toast.error("For auto-generated PDF, add skills, education, and experience in your profile — or upload your own resume instead");
      return;
    }

    if (resumeType === "uploaded" && (!resumeUrl || !resumePublicId)) {
      toast.error("Please upload a resume for this application");
      fileInputRef.current?.click();
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
      resumeType,
      resumeUrl,
      resumePublicId,
      coverLetter: coverLetter.trim() || undefined,
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
                <p className="font-medium text-brand-dark dark:text-white">Add name and phone</p>
                <p className="text-brand-slate">
                  We need your name and phone number to submit any application.
                </p>
                <Link href={`/profile?redirect=/jobs/${jobId}/apply`} className="mt-1 inline-block text-brand-blue font-semibold">
                  Go to Profile →
                </Link>
              </div>
            </div>
          )}

          {profile.profileComplete && resumeType === "generated" && !profile.canGenerateResume && (
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-brand-orange/10 p-4 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 text-brand-orange" />
              <div>
                <p className="font-medium text-brand-dark dark:text-white">Profile needed for auto PDF</p>
                <p className="text-brand-slate">
                  Option A needs skills, education, and experience in your profile. Or choose Option B to upload your own resume.
                </p>
                <Link href={`/profile?redirect=/jobs/${jobId}/apply`} className="mt-1 inline-block text-brand-blue font-semibold">
                  Complete profile →
                </Link>
              </div>
            </div>
          )}

          <div className="mt-6">
            <h2 className="font-display text-lg font-semibold dark:text-white">Resume for this application</h2>
            <p className="mt-1 text-sm text-brand-slate">
              Choose one option. The resume is stored only with this job application.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setResumeType("generated")}
                className={`rounded-xl border p-4 text-left transition ${
                  resumeType === "generated"
                    ? "border-brand-blue bg-brand-blue/5"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <Sparkles className="h-5 w-5 text-brand-cyan" />
                <p className="mt-2 font-semibold dark:text-white">Option A — Auto-generate PDF</p>
                <p className="mt-1 text-xs text-brand-slate">
                  Creates a PDF from your profile when payment completes.
                </p>
              </button>

              <button
                type="button"
                onClick={selectUploadedResume}
                className={`rounded-xl border p-4 text-left transition ${
                  resumeType === "uploaded"
                    ? "border-brand-blue bg-brand-blue/5"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <Upload className="h-5 w-5 text-brand-cyan" />
                <p className="mt-2 font-semibold dark:text-white">Option B — Upload custom resume</p>
                <p className="mt-1 text-xs text-brand-slate">PDF/DOC/DOCX up to 5MB for this application only.</p>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleResumeUpload}
              disabled={uploading}
            />

            {resumeType === "uploaded" && (
              <div className="mt-4">
                {resumeUrl ? (
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <FileText className="h-8 w-8 text-brand-cyan" />
                    <div className="flex-1">
                      <p className="text-sm font-medium dark:text-white">Resume ready</p>
                      <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-cyan hover:underline">
                        Preview uploaded file
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-semibold text-brand-blue"
                      disabled={uploading}
                    >
                      Replace
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-8 hover:border-brand-cyan disabled:opacity-60"
                  >
                    <Upload className="h-8 w-8 text-brand-slate" />
                    <span className="text-sm font-medium text-brand-slate">
                      {uploading ? "Uploading..." : "Click to upload resume (PDF/DOC/DOCX)"}
                    </span>
                  </button>
                )}
              </div>
            )}

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium dark:text-white">Cover letter (optional)</label>
              <textarea
                className="min-h-[90px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Brief note to the employer..."
              />
            </div>
          </div>

          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold dark:text-white">Application Form</h2>
            <div className="mt-4">
              <DynamicApplicationForm fields={job.dynamicFields} answers={answers} onChange={setAnswers} />
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
