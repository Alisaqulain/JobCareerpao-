"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

const faqs = [
  {
    q: "How do I apply for a job?",
    a: "Create an account, complete your profile, open a job listing, fill the application form, and pay the listed fee via Razorpay.",
  },
  {
    q: "Are there membership plans?",
    a: "No. You only pay the one-time application fee for each job you apply to.",
  },
  {
    q: "How long does support take to respond?",
    a: "We aim to reply within 24 hours on business days.",
  },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General inquiry",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setSent(true);
      toast.success("Message sent!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-gray min-h-screen">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold text-brand-dark sm:text-4xl">Contact Us</h1>
          <p className="mt-2 max-w-2xl text-brand-slate">
            Questions about applications, payments, or your account? We&apos;re here to help.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-1">
            {[
              { icon: Mail, label: "Email", value: "support@jobcareerpao.com", href: "mailto:support@jobcareerpao.com" },
              { icon: Phone, label: "Phone", value: "+91 1800-123-4567", href: "tel:+9118001234567" },
              { icon: MapPin, label: "Office", value: "Indiranagar, Bengaluru, Karnataka 560038", href: undefined },
              { icon: Clock, label: "Hours", value: "Mon–Sat, 9:00 AM – 6:00 PM IST", href: undefined },
            ].map((item) => (
              <div key={item.label} className="glass-strong flex items-center gap-4 rounded-2xl p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-slate">
                    {item.label}
                  </p>
                  {item.href ? (
                    <a href={item.href} className="font-medium text-brand-dark hover:text-brand-blue">
                      {item.value}
                    </a>
                  ) : (
                    <p className="font-medium text-brand-dark">{item.value}</p>
                  )}
                </div>
              </div>
            ))}

            <div className="glass-strong rounded-2xl p-5">
              <div className="flex items-center gap-2 text-brand-blue">
                <MessageCircle className="h-5 w-5" />
                <h2 className="font-display font-semibold text-brand-dark">Quick answers</h2>
              </div>
              <ul className="mt-4 space-y-4">
                {faqs.map((f) => (
                  <li key={f.q}>
                    <p className="text-sm font-medium text-brand-dark">{f.q}</p>
                    <p className="mt-1 text-xs text-brand-slate">{f.a}</p>
                  </li>
                ))}
              </ul>
              <Link href="/faq" className="mt-4 inline-block text-sm font-semibold text-brand-cyan hover:text-brand-blue">
                View all FAQs →
              </Link>
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-6 sm:p-8 lg:col-span-2">
            <h2 className="font-display text-xl font-bold text-brand-dark">Send us a message</h2>
            <p className="mt-1 text-sm text-brand-slate">
              Fill out the form and our team will get back to you shortly.
            </p>

            {sent ? (
              <div className="py-12 text-center">
                <p className="text-lg font-medium text-brand-blue">Message sent successfully!</p>
                <p className="mt-2 text-sm text-brand-slate">
                  We&apos;ll reply to {form.email} within 24 hours.
                </p>
                <Button className="mt-6" variant="outline" onClick={() => setSent(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Full Name</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm"
                      placeholder="you@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Subject</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm"
                  >
                    <option value="general">General inquiry</option>
                    <option value="application">Application help</option>
                    <option value="payment">Payment issue</option>
                    <option value="account">Account & login</option>
                    <option value="refund">Refund request</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                    placeholder="How can we help you?"
                  />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          <div className="flex h-48 items-center justify-center bg-gradient-to-br from-brand-blue/10 to-brand-cyan/10 sm:h-64">
            <div className="text-center">
              <MapPin className="mx-auto h-8 w-8 text-brand-blue" />
              <p className="mt-2 font-medium text-brand-dark">Bengaluru, India</p>
              <p className="text-sm text-brand-slate">Serving candidates across India</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
