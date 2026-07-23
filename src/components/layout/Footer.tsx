"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Send } from "lucide-react";
import { Logo } from "./Logo";
import { footerLinks } from "@/lib/data";
import { useState } from "react";
import { toast } from "sonner";

const socials = [
  {
    href: "https://linkedin.com/company/jobcareerpao",
    label: "LinkedIn",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
        <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V23h-4V8.5zM8.5 8.5h3.8v2h.05c.53-1 1.82-2.05 3.75-2.05 4.01 0 4.75 2.64 4.75 6.07V23h-4v-6.6c0-1.57-.03-3.59-2.19-3.59-2.19 0-2.53 1.71-2.53 3.48V23h-4V8.5z" />
      </svg>
    ),
  },
  {
    href: "https://twitter.com/jobcareerpao",
    label: "Twitter",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
        <path d="M18.244 2H21.5l-7.5 8.57L22.5 22h-6.59l-5.16-6.74L5.1 22H1.84l8.03-9.17L1.5 2h6.75l4.66 6.17L18.244 2zm-1.16 18h1.82L7.02 3.94H5.07L17.084 20z" />
      </svg>
    ),
  },
  {
    href: "https://instagram.com/jobcareerpao",
    label: "Instagram",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
        <path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 3.2-1.6 4.8-4.9 4.9-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9C2.4 3.9 3.9 2.4 7.1 2.3 8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.7.1-2.2.1-3.2 1.1-3.3 3.3-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 2.2 1.1 3.2 3.3 3.3 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c2.2-.1 3.2-1.1 3.3-3.3.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-2.2-1.1-3.2-3.3-3.3-1.2-.1-1.6-.1-4.7-.1zm0 3.1a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4zm6.4-2.1a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
      </svg>
    ),
  },
  {
    href: "https://youtube.com/@jobcareerpao",
    label: "YouTube",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.8 15.5v-7L16 12l-6.2 3.5z" />
      </svg>
    ),
  },
];

export function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success("Subscribed successfully!");
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Subscription failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="relative overflow-hidden bg-brand-blue text-white">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-cyan/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-brand-orange/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo variant="light" size="md" showTagline href="/" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-blue-100/80">
              India&apos;s premium job portal connecting ambitious professionals with
              verified companies. Unlock Your Potential.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-brand-orange hover:scale-105"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            <div>
              <h4 className="font-display text-sm font-semibold text-white">Quick Links</h4>
              <ul className="mt-4 space-y-2.5">
                {footerLinks.quick.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-blue-100/70 hover:text-white transition">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-display text-sm font-semibold text-white">Company</h4>
              <ul className="mt-4 space-y-2.5">
                {footerLinks.company.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-blue-100/70 hover:text-white transition">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-display text-sm font-semibold text-white">Legal</h4>
              <ul className="mt-4 space-y-2.5">
                {footerLinks.legal.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-blue-100/70 hover:text-white transition">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-display text-sm font-semibold text-white">Newsletter</h4>
            <p className="mt-2 text-sm text-blue-100/70">
              Get career tips and job alerts delivered weekly.
            </p>
            <form onSubmit={handleSubscribe} className="mt-4 flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-blue-100/50 focus:border-brand-cyan focus:shadow-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-orange text-white transition hover:bg-orange-500 disabled:opacity-50"
                aria-label="Subscribe"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-4 text-xs text-blue-100/60">
              support@jobcareerpao.com · +91 98765 43210
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-blue-100/60">
            © {new Date().getFullYear()} JobCareerPao. All rights reserved.
          </p>
          <p className="text-sm text-blue-100/60">Made with care for Indian job seekers</p>
        </div>
      </div>
    </footer>
  );
}
