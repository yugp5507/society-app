import Link from "next/link";
import { Building2, Share2, Rss, Globe, Heart } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer id="contact" className="bg-slate-900 text-slate-400">
      {/* CTA Banner */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Ready to modernize your society?</h2>
          <p className="text-blue-100 mb-8 text-lg">Join 500+ societies already using SocietyPro. Setup is free and takes less than 30 minutes.</p>
          <Link href="/login" className="inline-block bg-white text-blue-600 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 shadow-lg transition-all hover:-translate-y-0.5">
            Start For Free →
          </Link>
        </div>
      </div>

      {/* Footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">SocietyPro</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">Modern society management for apartments, townships and gated communities across India.</p>
            <div className="flex gap-3">
              {[Share2, Rss, Globe].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Icon className="w-4 h-4 text-slate-400 hover:text-white" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="text-white font-semibold mb-4">Product</p>
            <ul className="space-y-2 text-sm">
              {["Features", "Pricing", "Security", "Changelog"].map(l => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold mb-4">Company</p>
            <ul className="space-y-2 text-sm">
              {["About Us", "Blog", "Careers", "Press"].map(l => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-white font-semibold mb-4">Legal</p>
            <ul className="space-y-2 text-sm">
              {["Privacy Policy", "Terms of Service", "Refund Policy", "Contact Us"].map(l => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>© {new Date().getFullYear()} SocietyPro. All rights reserved.</p>
          <p className="flex items-center gap-1.5">Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> in India</p>
        </div>
      </div>
    </footer>
  );
}
