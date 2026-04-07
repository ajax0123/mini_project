import { Link } from "wouter";
import { Upload, Brain, BarChart2, CheckCircle, ArrowRight } from "lucide-react";

const STEPS = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Your Documents",
    desc: "Upload bank statements, pay slips, utility bills, or any financial documents. Our AI scans them securely using Claude, extracting key financial signals.",
  },
  {
    icon: Brain,
    step: "02",
    title: "AI Analyzes Your Profile",
    desc: "Our proprietary algorithm analyzes over 50 alternative data points — transaction patterns, bill payments, rent history, subscriptions, and employment stability.",
  },
  {
    icon: BarChart2,
    step: "03",
    title: "Real-Time Risk Assessment",
    desc: "Get a live risk score updated as you fill in your financial profile. See exactly what factors help and hurt your eligibility.",
  },
  {
    icon: CheckCircle,
    step: "04",
    title: "Instant Loan Offers",
    desc: "Receive personalized loan product recommendations with competitive rates, based on your unique alternative credit profile.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-[#0A1628] to-[#142238] py-20 px-4">
        <div className="max-w-3xl mx-auto text-center animate-fade-up">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
            How <span className="text-[#10B981]">CreditAlt</span> Works
          </h1>
          <p className="text-slate-300 mt-4 text-lg">
            Our AI-powered platform evaluates your real financial behavior — not just a 3-digit credit score.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 flex gap-6 items-start animate-fade-up hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-16 h-16 bg-[#10B981]/10 rounded-2xl flex items-center justify-center shrink-0">
                <step.icon className="w-8 h-8 text-[#10B981]" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#10B981] uppercase tracking-widest mb-1">Step {step.step}</div>
                <h2 className="text-xl font-bold text-[#0A1628] mb-2">{step.title}</h2>
                <p className="text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#0A1628] rounded-3xl p-8 mt-12 text-center animate-fade-up">
          <h2 className="text-2xl font-bold text-white mb-2">Ready to Get Started?</h2>
          <p className="text-slate-300 mb-6">Takes less than 3 minutes. No CIBIL score required.</p>
          <Link href="/apply">
            <button className="bg-[#10B981] hover:bg-[#059669] text-white font-bold px-8 py-4 rounded-full text-lg shadow-xl transition-all duration-300 flex items-center gap-3 mx-auto">
              Check My Eligibility
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
