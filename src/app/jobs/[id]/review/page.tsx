"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Pencil, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CompanyLogo } from "@/components/ui/CompanyLogo";
import { FeeBreakdown } from "@/components/payment/FeeBreakdown";
import { DynamicApplicationForm } from "@/components/payment/DynamicApplicationForm";
import { api } from "@/hooks/useApi";
import { getJobLogoProps } from "@/lib/job-utils";
import { getApplicationDraft } from "@/lib/payment-utils";
import { STANDARD_APPLICATION_FIELDS } from "@/lib/application-form";
import { toast } from "sonner";

interface JobDetail {
  _id: string;
  title: string;
  company: string;
  companyLogo?: string;
  companyColor?: string;
  companyId?: { logoUrl?: string; color?: string; name?: string };
  applicationFee: number;
}

export default function ApplicationReviewPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = String(params.id);
  const { status } = useSession();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [draft, setDraft] = useState<ReturnType<typeof getApplicationDraft>>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/auth/login?redirect=/jobs/${jobId}/review`);
      return;
    }
    const saved = getApplicationDraft(jobId);
    if (!saved) {
      router.replace(`/jobs/${jobId}/apply`);
      return;
    }
    setDraft(saved);
    api<{ job: JobDetail }>(`/api/jobs/${jobId}`).then((res) => {
      if (res.data?.job) setJob(res.data.job);
    });
  }, [status, jobId, router]);

  const handleProceed = async () => {
    if (!job || !draft) return;
    setLoading(true);
    try {
      const orderRes = await api<{
        orderId: string;
        paymentId: string;
        amount: number;
      }>("/api/payments/create-order", {
        method: "POST",
        json: {
          jobId: job._id,
          formAnswers: draft.formAnswers,
          resumeType: "none",
          coverLetter: draft.coverLetter,
        },
      });

      if (!orderRes.data?.orderId) throw new Error(orderRes.message || "Failed to create order");

      router.push(
        `/payment?orderId=${orderRes.data.orderId}&jobId=${jobId}&paymentId=${orderRes.data.paymentId}`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not proceed to payment");
    } finally {
      setLoading(false);
    }
  };

  if (!job || !draft) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-brand-gray dark:bg-slate-950">
        <p className="text-brand-slate">Loading review...</p>
      </div>
    );
  }

  const logoProps = getJobLogoProps(job);

  return (
    <div className="min-h-screen bg-brand-gray py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl px-4">
        <div className="glass-strong rounded-2xl p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold text-brand-dark dark:text-white">
            Review Application
          </h1>
          <p className="mt-1 text-sm text-brand-slate dark:text-slate-400">
            Verify your details before proceeding to payment.
          </p>

          <div className="mt-6 flex items-center gap-4 rounded-xl bg-brand-gray p-4 dark:bg-slate-800">
            <CompanyLogo {...logoProps} size="md" />
            <div>
              <p className="font-semibold text-brand-dark dark:text-white">{job.title}</p>
              <p className="text-sm text-brand-slate dark:text-slate-400">{job.company}</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-brand-dark dark:text-white">Your Details</h2>
              <Button href={`/jobs/${jobId}/apply`} size="sm" variant="outline">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            </div>
            <div className="mt-4">
              <DynamicApplicationForm
                fields={STANDARD_APPLICATION_FIELDS}
                answers={draft.formAnswers}
                onChange={() => {}}
                readOnly
              />
            </div>
          </div>

          <div className="mt-6">
            <FeeBreakdown applicationFee={job.applicationFee} />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={handleProceed} variant="orange" disabled={loading}>
              <CreditCard className="h-4 w-4" />
              {loading ? "Creating order..." : "Proceed to Payment"}
            </Button>
            <Button href={`/jobs/${jobId}/apply`} variant="outline">
              Back to Edit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
