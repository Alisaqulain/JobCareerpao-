import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { stats } from "@/lib/data";
import { Users, Target, Shield, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about JobCareerPao — India's premium job portal for candidates.",
};

const values = [
  {
    icon: Shield,
    title: "Trust & Transparency",
    desc: "Every job is verified and posted by our admin team. Application fees are shown upfront before you pay.",
  },
  {
    icon: Target,
    title: "Candidate First",
    desc: "We built JobCareerPao for job seekers — browse, apply, pay, and track without confusion.",
  },
  {
    icon: Zap,
    title: "Simple Flow",
    desc: "No memberships. Choose a job, fill the form, pay the fee, and monitor your application status.",
  },
  {
    icon: Users,
    title: "Verified Companies",
    desc: "Partner with India's leading employers across tech, consulting, BFSI, and product.",
  },
];

const timeline = [
  { year: "2022", event: "JobCareerPao founded in Bengaluru with a mission to simplify hiring for Indian professionals." },
  { year: "2023", event: "Crossed 10,000 registered candidates and 100+ verified company partnerships." },
  { year: "2024", event: "Launched secure Razorpay payments and dynamic application forms per job." },
  { year: "2025", event: "Expanded to Hyderabad, Pune, Mumbai, and remote-first roles nationwide." },
  { year: "2026", event: "200,000+ candidates, streamlined apply-and-track experience, and growing career blog." },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-100 bg-brand-gray">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 text-center">
          <h1 className="font-display text-4xl font-bold text-brand-dark sm:text-5xl">
            About JobCareerPao
          </h1>
          <p className="mt-4 text-lg text-brand-slate">
            India&apos;s trusted job portal — helping professionals find meaningful work.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-brand-gray p-5 text-center">
              <p className="font-display text-2xl font-bold text-brand-blue">
                {s.display || `${s.value}${s.suffix}`}
              </p>
              <p className="mt-1 text-xs text-brand-slate">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 space-y-6 text-slate-700 leading-relaxed">
          <p>
            JobCareerPao is a modern job portal built for Indian professionals who expect a
            premium, trustworthy career platform. We connect ambitious candidates with verified
            companies across technology, consulting, product, BFSI, and more.
          </p>
          <p>
            Our platform combines clean design, powerful job search, and a simple apply flow —
            choose a job, fill the form, pay the application fee, and track your status from your
            profile dashboard.
          </p>
        </div>

        <div className="mt-14">
          <h2 className="font-display text-2xl font-bold text-brand-dark">Our values</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {values.map((v) => (
              <div key={v.title} className="glass-strong rounded-2xl p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display font-semibold text-brand-dark">{v.title}</h3>
                <p className="mt-2 text-sm text-brand-slate">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 rounded-2xl bg-brand-gray p-8">
          <h2 className="font-display text-2xl font-bold text-brand-dark">Our mission</h2>
          <p className="mt-3 text-brand-slate leading-relaxed">
            To help every professional find meaningful work with transparency, speed, and care.
            Jobs are published and managed by our admin team on behalf of partner companies —
            companies never need to log in. You browse, apply, and we handle the rest.
          </p>
        </div>

        <div className="mt-14">
          <h2 className="font-display text-2xl font-bold text-brand-dark">Our journey</h2>
          <div className="mt-6 space-y-4">
            {timeline.map((t) => (
              <div key={t.year} className="flex gap-4 border-l-2 border-brand-cyan pl-5">
                <span className="shrink-0 font-display font-bold text-brand-orange">{t.year}</span>
                <p className="text-sm text-brand-slate">{t.event}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-wrap gap-3">
          <Button href="/auth/signup">Join JobCareerPao</Button>
          <Button href="/jobs" variant="outline">
            Browse Jobs
          </Button>
          <Button href="/contact" variant="ghost">
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  );
}
