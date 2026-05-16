"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

export default function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
        scrolled ? "shadow-md shadow-slate-200/60" : "border-b border-slate-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              Society<span className="text-blue-600">Pro</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold px-5 py-2 rounded-xl border-2 border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 hover:-translate-y-0.5"
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white border-t border-slate-100 px-4 pb-5 pt-2 space-y-1">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.href)}
              className="w-full text-left block py-2.5 px-3 text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="text-center text-sm font-semibold py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 hover:border-blue-300"
            >
              Login
            </Link>
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="text-center text-sm font-semibold py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/25"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
