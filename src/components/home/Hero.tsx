"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Search,
  Building2,
  Users,
  FileText,
  TrendingUp,
  Briefcase,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { companies } from "@/lib/data";
import { CompanyLogo } from "@/components/ui/CompanyLogo";

const floatItems = [
  { icon: Building2, label: "Companies", color: "bg-brand-blue", delay: 0, x: "8%", y: "18%" },
  { icon: Users, label: "Candidates", color: "bg-brand-cyan", delay: 0.5, x: "72%", y: "12%" },
  { icon: FileText, label: "Resumes", color: "bg-brand-orange", delay: 1, x: "78%", y: "58%" },
  { icon: Briefcase, label: "Jobs", color: "bg-brand-blue", delay: 1.5, x: "12%", y: "62%" },
  { icon: MessageSquare, label: "Interviews", color: "bg-brand-cyan", delay: 0.8, x: "55%", y: "78%" },
  { icon: TrendingUp, label: "Growth", color: "bg-brand-orange", delay: 1.2, x: "40%", y: "8%" },
];

function Particles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${(i * 5.5) % 100}%`,
    size: 2 + (i % 4),
    delay: (i % 8) * 0.8,
    duration: 12 + (i % 6) * 2,
    color: i % 3 === 0 ? "#2DB6D6" : i % 3 === 1 ? "#F7941D" : "#0B4F8A",
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            bottom: "-10px",
            width: p.size,
            height: p.size,
            background: p.color,
            opacity: 0.35,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export function Hero() {
  return (
    <section className="hero-gradient relative overflow-hidden">
      <Particles />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-20 h-72 w-72 animate-pulse-soft rounded-full bg-brand-cyan/20 blur-3xl" />
        <div className="absolute -right-16 top-40 h-80 w-80 animate-pulse-soft rounded-full bg-brand-orange/15 blur-3xl" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-10 left-1/3 h-64 w-64 animate-pulse-soft rounded-full bg-brand-blue/10 blur-3xl" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-24">
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl font-extrabold leading-[1.15] tracking-tight text-brand-dark sm:text-5xl lg:text-[3.25rem]">
              Find Your Dream Job.{" "}
              <span className="gradient-text">Build Your Future.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-brand-slate sm:text-lg">
              Connect with India&apos;s fastest-growing companies and discover thousands of
              verified job opportunities across every industry.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/auth/signup" size="lg">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/jobs" variant="outline" size="lg">
                <Search className="h-4 w-4" />
                Browse Jobs
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-4 text-sm text-brand-slate">
              <div className="flex -space-x-2">
                {["PS", "RM", "AP", "VS"].map((a) => (
                  <span
                    key={a}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-brand-blue to-brand-cyan text-[10px] font-bold text-white"
                  >
                    {a}
                  </span>
                ))}
              </div>
              <p>
                <span className="font-semibold text-brand-blue">2L+</span> professionals hired
              </p>
            </div>
            <div className="mt-8 border-t border-slate-200/80 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-slate">
                Trusted by top employers
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {companies.slice(0, 8).map((company) => (
                  <CompanyLogo
                    key={company.id}
                    name={company.name}
                    logoUrl={company.logoUrl}
                    fallback={company.logo}
                    color={company.color}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mx-auto h-[380px] w-full max-w-lg sm:h-[440px]"
        >
          <div className="absolute inset-8 rounded-[2rem] bg-gradient-to-br from-brand-blue/10 via-brand-cyan/10 to-brand-orange/10 blur-xl" />

          <div className="glass-strong absolute inset-x-8 top-1/2 z-10 -translate-y-1/2 rounded-3xl p-6 sm:inset-x-12 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-blue to-brand-cyan text-white shadow-glow">
                <Briefcase className="h-7 w-7" />
              </div>
              <div>
                <p className="font-display text-lg font-bold text-brand-dark">Career Hub</p>
                <p className="text-sm text-brand-slate">Jobs · Resumes · Interviews</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {[
                { label: "New matches today", value: "128", tone: "text-brand-cyan" },
                { label: "Interview invites", value: "14", tone: "text-brand-orange" },
                { label: "Profile strength", value: "92%", tone: "text-brand-blue" },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-xl bg-brand-gray/80 px-4 py-3"
                >
                  <span className="text-sm text-brand-slate">{row.label}</span>
                  <span className={`font-display text-sm font-bold ${row.tone}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {floatItems.map((item) => (
            <motion.div
              key={item.label}
              className="absolute z-20"
              style={{ left: item.x, top: item.y }}
              animate={{ y: [0, -12, 0] }}
              transition={{
                duration: 4 + item.delay,
                repeat: Infinity,
                ease: "easeInOut",
                delay: item.delay,
              }}
            >
              <div className="glass flex items-center gap-2 rounded-2xl px-3 py-2 shadow-card">
                <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${item.color} text-white`}>
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="hidden text-xs font-semibold text-brand-dark sm:inline">
                  {item.label}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}