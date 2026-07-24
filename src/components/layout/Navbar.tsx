"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Home,
  Briefcase,
  BookOpen,
  Info,
  Mail,
  LayoutDashboard,
  User,
} from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Mail },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const isLoggedIn = status === "authenticated" && !!session?.user;
  const isAdmin = isLoggedIn && session?.user?.role === "admin";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const authButtons = (
    <>
      <span className="max-w-[120px] truncate text-sm text-brand-slate">
        Hi, {session?.user?.name?.split(" ")[0]}
      </span>
      {isAdmin ? (
        <Button href="/admin" size="sm" variant="outline">
          <LayoutDashboard className="h-3.5 w-3.5" />
          Admin Panel
        </Button>
      ) : (
        <Button href="/profile" size="sm" variant="outline">
          <User className="h-3.5 w-3.5" />
          Profile
        </Button>
      )}
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        Logout
      </button>
    </>
  );

  const guestButtons = (
    <>
      <Button href="/auth/login" size="sm" variant="outline">
        Login
      </Button>
      <Button href="/auth/signup" size="sm">
        Signup
      </Button>
    </>
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-soft"
          : "bg-white/70 backdrop-blur-md border-b border-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 lg:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo size="md" showTagline />

        <div className="hidden items-center gap-0.5 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(link.href, link.exact)
                  ? "bg-brand-blue/10 text-brand-blue"
                  : "text-slate-600 hover:bg-slate-50 hover:text-brand-blue"
              )}
            >
              <link.icon className="h-4 w-4 shrink-0 opacity-70" />
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {status === "loading" ? (
            <span className="text-sm text-brand-slate">Loading...</span>
          ) : isLoggedIn ? (
            authButtons
          ) : (
            guestButtons
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-50"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-100 bg-white lg:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium",
                    isActive(link.href, link.exact)
                      ? "bg-brand-blue/10 text-brand-blue"
                      : "text-slate-700 hover:bg-brand-gray"
                  )}
                >
                  <link.icon className="h-4 w-4 text-brand-cyan" />
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 mt-2">
                {isLoggedIn ? (
                  <>
                    {isAdmin ? (
                      <Button href="/admin" variant="outline" className="w-full">
                        Admin Panel
                      </Button>
                    ) : (
                      <Button href="/profile" variant="outline" className="w-full">
                        Profile
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button href="/auth/login" variant="outline" className="w-full">
                      Login
                    </Button>
                    <Button href="/auth/signup" className="w-full">
                      Signup
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
