"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Code2,
  BarChart3,
  Megaphone,
  Palette,
  HeartPulse,
  GraduationCap,
  Building2,
  Wallet,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";

const categories = [
  { label: "Technology", icon: Code2, href: "/jobs?category=Technology", color: "from-blue-500 to-cyan-500" },
  { label: "Data & Analytics", icon: BarChart3, href: "/jobs?category=Data", color: "from-violet-500 to-purple-500" },
  { label: "Marketing", icon: Megaphone, href: "/jobs?category=Marketing", color: "from-orange-500 to-amber-500" },
  { label: "Design", icon: Palette, href: "/jobs?category=Design", color: "from-pink-500 to-rose-500" },
  { label: "Healthcare", icon: HeartPulse, href: "/jobs?category=Healthcare", color: "from-emerald-500 to-teal-500" },
  { label: "Education", icon: GraduationCap, href: "/jobs?category=Education", color: "from-indigo-500 to-blue-500" },
  { label: "Finance", icon: Wallet, href: "/jobs?category=Finance", color: "from-green-500 to-lime-500" },
  { label: "Consulting", icon: Building2, href: "/jobs?category=Consulting", color: "from-slate-500 to-zinc-500" },
];

export function PopularCategories() {
  return (
    <section className="bg-white dark:bg-slate-950 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Explore by Field"
          title="Popular Categories"
          description="Find roles across India's fastest-growing industries."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={cat.href}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition hover:border-brand-cyan hover:shadow-card"
              >
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} text-white shadow-soft`}>
                  <cat.icon className="h-5 w-5" />
                </span>
                <span className="font-display font-semibold text-brand-dark dark:text-white group-hover:text-brand-blue">
                  {cat.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
