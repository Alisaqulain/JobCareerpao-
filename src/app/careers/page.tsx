import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Heart, Coffee, Laptop, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Careers at JobCareerPao",
  description: "Join the team building India's most trusted job portal for candidates.",
};

const openings = [
  { title: "Senior Frontend Engineer", loc: "Bengaluru · Hybrid", dept: "Engineering", type: "Full-time" },
  { title: "Product Designer", loc: "Remote · India", dept: "Design", type: "Full-time" },
  { title: "Growth Marketing Lead", loc: "Mumbai · Hybrid", dept: "Marketing", type: "Full-time" },
  { title: "Customer Support Executive", loc: "Bengaluru · On-site", dept: "Operations", type: "Full-time" },
  { title: "Content Writer (Career Blog)", loc: "Remote · India", dept: "Content", type: "Part-time" },
];

const perks = [
  { icon: Heart, title: "Health & wellness", desc: "Medical insurance for you and dependents." },
  { icon: Laptop, title: "Remote-friendly", desc: "Hybrid and remote options for most roles." },
  { icon: Coffee, title: "Learning budget", desc: "Annual allowance for courses and conferences." },
  { icon: Globe, title: "Impact at scale", desc: "Help lakhs of Indians find meaningful work." },
];

export default function CareersPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-100 bg-brand-gray">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 text-center">
          <h1 className="font-display text-4xl font-bold text-brand-dark">Careers at JobCareerPao</h1>
          <p className="mt-4 text-lg text-brand-slate">
            Help us build India&apos;s most trusted job portal. We&apos;re a small, ambitious team
            obsessed with better hiring experiences for candidates.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <h2 className="font-display text-2xl font-bold text-brand-dark">Why join us?</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {perks.map((p) => (
            <div key={p.title} className="rounded-2xl border border-slate-100 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-cyan/10 text-brand-cyan">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-display font-semibold text-brand-dark">{p.title}</h3>
              <p className="mt-1 text-sm text-brand-slate">{p.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-14 font-display text-2xl font-bold text-brand-dark">Open positions</h2>
        <p className="mt-2 text-sm text-brand-slate">
          Don&apos;t see a fit? Email careers@jobcareerpao.com with your resume.
        </p>
        <div className="mt-6 space-y-4">
          {openings.map((o) => (
            <div
              key={o.title}
              className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between hover:border-brand-cyan/30 hover:shadow-soft transition"
            >
              <div>
                <h3 className="font-display font-semibold text-brand-dark">{o.title}</h3>
                <p className="mt-1 text-sm text-brand-slate">
                  {o.loc} · {o.dept} · {o.type}
                </p>
              </div>
              <Button href="mailto:careers@jobcareerpao.com" size="sm" variant="outline">
                Apply via Email
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl bg-brand-gray p-8 text-center">
          <h2 className="font-display text-xl font-bold text-brand-dark">Life at JobCareerPao</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-brand-slate leading-relaxed">
            We move fast, stay user-obsessed, and celebrate every candidate who lands their dream
            role through our platform. Join us in Bengaluru or work remotely from anywhere in India.
          </p>
          <Button href="/contact" className="mt-6" variant="primary">
            Get in Touch
          </Button>
        </div>
      </div>
    </div>
  );
}
