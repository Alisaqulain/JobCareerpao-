"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { api } from "@/hooks/useApi";
import { toast } from "sonner";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  bio?: string;
  location?: string;
  skills: string[];
  education: Array<{ degree: string; institution: string; year: number; grade?: string }>;
  experience: Array<{ title: string; company: string; startDate: string; endDate?: string; current?: boolean }>;
  resumeUrl?: string;
  profilePicture?: string;
  profileComplete: boolean;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [applications, setApplications] = useState<Array<Record<string, unknown>>>([]);
  const [payments, setPayments] = useState<Array<Record<string, unknown>>>([]);
  const [tab, setTab] = useState<"profile" | "applications" | "payments">("profile");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login?redirect=/profile");
      return;
    }
    if (status === "authenticated") {
      api<ProfileData>("/api/user/profile").then((res) => {
        if (res.data) setProfile(res.data);
      });
      api<Array<Record<string, unknown>>>("/api/user/applications").then((res) => {
        if (res.data) setApplications(res.data);
      });
      api<Array<Record<string, unknown>>>("/api/user/applications?type=payments").then((res) => {
        if (res.data) setPayments(res.data);
      });
    }
  }, [status, router]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "resume" | "profile") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success(type === "resume" ? "Resume uploaded" : "Profile picture uploaded");
      setProfile((p) =>
        p
          ? {
              ...p,
              [type === "resume" ? "resumeUrl" : "profilePicture"]: data.data.url,
            }
          : p
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await api("/api/user/profile", {
        method: "PATCH",
        json: {
          name: profile.name,
          phone: profile.phone,
          bio: profile.bio,
          location: profile.location,
          skills: profile.skills,
          education: profile.education,
          experience: profile.experience,
          resumeUrl: profile.resumeUrl,
          profilePicture: profile.profilePicture,
        },
      });
      if (!res.success) throw new Error(res.message);
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-brand-gray">
        <p className="text-brand-slate">Loading profile...</p>
      </div>
    );
  }

  const inputClass = "h-11 w-full rounded-xl border border-slate-200 px-3 text-sm";

  return (
    <div className="min-h-screen bg-brand-gray py-10">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-brand-dark">My Profile</h1>
            <p className="text-sm text-brand-slate">Welcome, {session?.user?.name}</p>
          </div>
          {!profile.profileComplete && (
            <span className="rounded-xl bg-brand-orange/10 px-3 py-1 text-xs font-semibold text-brand-orange">
              Complete your profile to apply faster
            </span>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          {(["profile", "applications", "payments"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-xl px-4 py-2 text-sm font-medium capitalize ${
                tab === t ? "bg-brand-blue text-white" : "bg-white text-brand-slate"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "profile" && (
          <div className="mt-6 space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Full Name</label>
                <input className={inputClass} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input className={inputClass} value={profile.email} disabled />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Phone</label>
                <input className={inputClass} value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Location</label>
                <input className={inputClass} value={profile.location || ""} onChange={(e) => setProfile({ ...profile, location: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Bio</label>
                <textarea className={`${inputClass} min-h-[80px] py-2`} value={profile.bio || ""} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Skills (comma separated)</label>
                <input
                  className={inputClass}
                  value={profile.skills.join(", ")}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Resume (PDF/DOC/DOCX, max 5MB)</label>
                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleUpload(e, "resume")} />
                {profile.resumeUrl && (
                  <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-brand-cyan">
                    View current resume
                  </a>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Profile Picture</label>
                <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "profile")} />
              </div>
            </div>

            <Button onClick={saveProfile} disabled={saving}>
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        )}

        {tab === "applications" && (
          <div className="mt-6 space-y-4">
            {applications.map((app) => {
              const job = app.jobId as { title?: string; company?: string };
              return (
                <div key={String(app._id)} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-brand-dark">{job?.title}</p>
                      <p className="text-sm text-brand-slate">{job?.company}</p>
                    </div>
                    <span className="rounded-lg bg-brand-cyan/10 px-2 py-1 text-xs font-semibold capitalize text-brand-cyan">
                      {String(app.status)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-brand-slate">
                    Applied {new Date(String(app.appliedDate)).toLocaleDateString("en-IN")}
                  </p>
                </div>
              );
            })}
            {applications.length === 0 && (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center text-brand-slate">
                No applications yet. Browse jobs to get started.
              </p>
            )}
          </div>
        )}

        {tab === "payments" && (
          <div className="mt-6">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-brand-gray text-left text-xs uppercase text-brand-slate">
                <tr>
                  <th className="px-4 py-3">Job</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const job = p.jobId as { title?: string };
                  return (
                    <tr key={String(p._id)} className="border-t border-slate-100">
                      <td className="px-4 py-3">{job?.title}</td>
                      <td className="px-4 py-3">₹{String(p.amount)}</td>
                      <td className="px-4 py-3">{String(p.status)}</td>
                      <td className="px-4 py-3">{new Date(String(p.createdAt)).toLocaleDateString("en-IN")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Button href="/profile/payments" variant="outline" className="mt-4">
            View full payment history →
          </Button>
          </div>
        )}
      </div>
    </div>
  );
}
