"use client";
import { useState } from "react";
import Link from "next/link";
import { Building2, Menu, X } from "lucide-react";

const links = ["Features", "Pricing", "About", "Contact"];

export default function LandingNavbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-600/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">SocietyPro</span>
          </Link>
          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">{l}</a>
            ))}
          </div>
          {/* Desktop buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">Login</Link>
            <Link href="/login" className="text-sm font-semibold px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/30">Get Started</Link>
          </div>
          {/* Mobile toggle */}
          <button className="md:hidden p-2 text-slate-600" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 pb-4 space-y-1">
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-slate-700 hover:text-blue-600">{l}</a>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Link href="/login" className="text-center text-sm font-semibold py-2 rounded-lg border border-slate-200 text-slate-700">Login</Link>
            <Link href="/login" className="text-center text-sm font-semibold py-2 rounded-lg bg-blue-600 text-white">Get Started</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
