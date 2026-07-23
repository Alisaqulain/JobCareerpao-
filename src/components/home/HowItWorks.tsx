"use client";

import { motion } from "framer-motion";
import {
  UserPlus,
  ClipboardList,
  Search,
  FileText,
  CreditCard,
  ArrowDown,
} from "lucide-react";
import { howItWorks } from "@/lib/data";
import { SectionHeading } from "@/components/ui/SectionHeading";

const icons = [UserPlus, ClipboardList, Search, FileText, CreditCard];

export function HowItWorks() {
  return (
    <section className="relative bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Simple Process"
          title="How It Works"
          description="Choose a company, fill the form, pay the fee — that's the complete flow."
        />

        <div className="relative mx-auto mt-14 max-w-3xl">
          <div className="absolute left-6 top-4 bottom-4 w-px bg-gradient-to-b from-brand-blue via-brand-cyan to-brand-orange sm:left-1/2 sm:-translate-x-px" />

          <div className="space-y-8">
            {howItWorks.map((item, i) => {
              const Icon = icons[i];
              const isLeft = i % 2 === 0;

              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: isLeft ? -24 : 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`relative flex items-start gap-4 sm:gap-0 ${
                    isLeft ? "sm:flex-row" : "sm:flex-row-reverse"
                  }`}
                >
                  <div className={`flex-1 ${isLeft ? "sm:pr-12 sm:text-right" : "sm:pl-12"}`}>
                    <div
                      className={`glass-strong inline-block rounded-2xl p-5 text-left ${
                        isLeft ? "sm:ml-auto" : ""
                      } max-w-sm`}
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">
                        Step {item.step}
                      </span>
                      <h3 className="mt-1 font-display text-lg font-semibold text-brand-dark">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-sm text-brand-slate">{item.description}</p>
                    </div>
                  </div>

                  <div className="absolute left-0 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-brand-cyan text-white shadow-glow sm:left-1/2 sm:-translate-x-1/2">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="hidden flex-1 sm:block" />
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-center sm:hidden">
            <ArrowDown className="h-5 w-5 animate-bounce text-brand-cyan" />
          </div>
        </div>
      </div>
    </section>
  );
}
