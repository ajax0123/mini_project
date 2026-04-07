import { Link } from "wouter";
import {
  ArrowRight,
  Smartphone,
  Zap,
  Shield,
  TrendingUp,
  CreditCard,
  Home,
  Wifi,
  ShoppingBag,
  Briefcase,
  Lock,
  CheckCircle,
} from "lucide-react";

const SIGNALS = [
  { icon: Smartphone, label: "UPI Transactions", status: "✅", desc: "Monthly spend patterns" },
  { icon: Wifi, label: "Netflix/OTT", status: "✅", desc: "Subscription regularity" },
  { icon: Zap, label: "Electricity Bill", status: "✅", desc: "Utility payment history" },
];

const ALT_DATA = [
  { icon: Smartphone, label: "UPI & Digital Payments", desc: "Analyzes 12+ months of transaction history" },
  { icon: Zap, label: "Utility Bills", desc: "Electricity, gas, and water payment consistency" },
  { icon: Home, label: "Rent Payments", desc: "Monthly rent regularity as credit signal" },
  { icon: ShoppingBag, label: "OTT Subscriptions", desc: "Netflix, Hotstar, Prime subscription history" },
  { icon: Briefcase, label: "Employment Stability", desc: "Pay slips and employer verification" },
  { icon: Shield, label: "Insurance Payments", desc: "Health and life insurance premium tracking" },
];

const TRUST = [
  { icon: Lock, label: "256-bit Encryption" },
  { icon: Shield, label: "DPDP Act 2023 Compliant" },
  { icon: CheckCircle, label: "RBI Framework Aligned" },
  { icon: TrendingUp, label: "AI-Powered Analysis" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <section className="min-h-screen flex items-center bg-gradient-to-br from-[#0A1628] via-[#142238] to-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 bg-[#10B981]/20 text-[#34D399] text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-[#10B981]/30">
                <TrendingUp className="w-4 h-4" />
                AI-Powered Alternative Credit Scoring
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                No CIBIL Score?{" "}
                <span className="text-[#10B981]">No Problem.</span>
              </h1>
              <p className="text-lg text-slate-300 mt-4 max-w-xl">
                CreditAlt uses AI to analyze your UPI transactions, utility bills, rent history, and subscriptions to determine your real creditworthiness — no traditional credit score needed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link href="/apply">
                  <button className="bg-[#10B981] hover:bg-[#059669] text-white font-bold px-8 py-4 rounded-full text-lg shadow-xl hover:shadow-[#10B981]/30 transition-all duration-300 flex items-center gap-3 animate-pulse-green">
                    Check My Eligibility
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
                <Link href="/how-it-works">
                  <button className="border-2 border-white/30 hover:border-white text-white px-8 py-4 rounded-full text-lg transition-all duration-300">
                    How It Works
                  </button>
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {SIGNALS.map((signal, i) => (
                <div
                  key={i}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 animate-fade-up flex items-center gap-4"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div className="w-12 h-12 bg-[#10B981]/20 rounded-xl flex items-center justify-center">
                    <signal.icon className="w-6 h-6 text-[#10B981]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold">{signal.label}</p>
                      <span className="text-sm">{signal.status}</span>
                    </div>
                    <p className="text-slate-400 text-sm">{signal.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#060E1A] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { num: "2.3L+", label: "Loans Assessed", desc: "Since our launch" },
              { num: "94%", label: "Accuracy Rate", desc: "AI document scan precision" },
              { num: "₹50K", label: "Max Loan Amount", desc: "Eligible in first batch" },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 rounded-2xl p-6 text-center">
                <p className="text-3xl font-bold text-[#10B981]">{stat.num}</p>
                <p className="text-white font-semibold mt-1">{stat.label}</p>
                <p className="text-slate-400 text-sm mt-1">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0A1628]">What We Analyze</h2>
            <p className="text-slate-500 mt-2">Beyond traditional credit — your real financial life matters</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {ALT_DATA.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-slate-100"
              >
                <div className="w-12 h-12 bg-[#10B981]/10 rounded-xl flex items-center justify-center mb-3">
                  <item.icon className="w-6 h-6 text-[#10B981]" />
                </div>
                <h3 className="font-bold text-[#0A1628] text-sm mb-1">{item.label}</h3>
                <p className="text-slate-500 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0A1628] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {TRUST.map((badge, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm text-white">
                <badge.icon className="w-4 h-4 text-[#10B981]" />
                {badge.label}
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/apply">
              <button className="bg-[#10B981] hover:bg-[#059669] text-white font-bold px-10 py-4 rounded-full text-lg shadow-xl transition-all duration-300 flex items-center gap-3 mx-auto">
                Get Started — It's Free
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <p className="text-slate-400 text-sm mt-3">No credit score required. Results in 2 minutes.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
