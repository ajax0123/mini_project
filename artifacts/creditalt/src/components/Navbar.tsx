import { Link } from "wouter";
import { TrendingUp, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-[#0A1628] sticky top-0 z-50 shadow-lg">
      <div className="w-full px-6 sm:px-10 lg:px-16 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-[#10B981]" />
          <span className="text-2xl font-bold text-[#10B981]">CreditAlt</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium">
            Home
          </Link>
          <Link href="/how-it-works" className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium">
            How It Works
          </Link>
          <Link href="/apply" className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold px-5 py-2 rounded-full transition-colors duration-200 text-sm">
            Apply Now
          </Link>
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[#142238] border-t border-white/10 px-4 py-4 flex flex-col gap-4">
          <Link href="/" onClick={() => setMenuOpen(false)} className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium">
            Home
          </Link>
          <Link href="/how-it-works" onClick={() => setMenuOpen(false)} className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium">
            How It Works
          </Link>
          <Link href="/apply" onClick={() => setMenuOpen(false)} className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold px-5 py-2 rounded-full transition-colors duration-200 text-sm text-center">
            Check Eligibility
          </Link>
        </div>
      )}
    </nav>
  );
}
