"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Archive,
  LogOut,
  Menu,
  X,
  CreditCard,
  Building2,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/companies", label: "Companies", icon: Building2 },
  { href: "/admin/blogs", label: "Blogs", icon: BookOpen },
  { href: "/admin/applicants", label: "Applicants", icon: FileText },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/archives", label: "Archives", icon: Archive },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-50 rounded-lg bg-brand-blue p-2 text-white lg:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col p-6">
          <div className="mb-8">
            <p className="font-display text-lg font-bold text-brand-blue">JobCareerPao</p>
            <p className="text-xs text-brand-slate">Admin Panel</p>
          </div>

          <nav className="flex-1 space-y-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === href || (href !== "/admin" && pathname.startsWith(href))
                    ? "bg-brand-blue text-white"
                    : "text-brand-slate hover:bg-brand-gray hover:text-brand-dark"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-slate-200 pt-4">
            <p className="truncate text-xs text-brand-slate">{session?.user?.email}</p>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
