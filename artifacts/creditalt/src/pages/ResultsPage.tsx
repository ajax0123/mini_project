import { useEffect, useState } from "react";
import { Link } from "wouter";
import { CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import type { ScoreResult } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import RiskGauge from "@/components/RiskGauge";
import FeatureImportanceChart from "@/components/FeatureImportanceChart";
import LoanProductCard from "@/components/LoanProductCard";
import CountUp from "@/components/CountUp";

export default function ResultsPage() {
  const [result, setResult] = useState<ScoreResult | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("creditalt_result");
    if (raw) {
      try {
        setResult(JSON.parse(raw));
      } catch {
        // ignore
      }
    }
  }, []);

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">No results found. Please complete the application first.</p>
          <Link href="/apply">
            <button className="bg-[#10B981] text-white font-bold px-6 py-3 rounded-full">
              Go to Application
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const { riskLabel, riskNorm, eligibleAmount, lowerBound, upperBound, featureContributions } = result;

  const riskBadgeClass =
    riskLabel === "Low"
      ? "bg-[#10B981]/20 text-[#10B981] border-[#10B981]"
      : riskLabel === "Medium"
      ? "bg-amber-100 text-amber-600 border-amber-400"
      : "bg-red-100 text-red-500 border-red-400";

  const positives = featureContributions
    .filter((f) => f.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 4)
    .map((f) => f.feature);

  const negatives = featureContributions
    .filter((f) => f.value < 0)
    .sort((a, b) => a.value - b.value)
    .slice(0, 3)
    .map((f) => f.feature);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-[#0A1628] to-[#142238] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/apply">
            <button className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-6 text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Application
            </button>
          </Link>
          <div className="text-center">
            <div
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold animate-fade-up border-2 ${riskBadgeClass}`}
            >
              {riskLabel === "Low" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              {riskLabel} Risk Profile
            </div>

            <div className="text-center my-8 animate-fade-up">
              <p className="text-sm text-slate-400 uppercase tracking-widest mb-2">Eligible Loan Amount</p>
              <p className="text-6xl font-black text-white">
                ₹<CountUp to={Math.round(eligibleAmount)} />
              </p>
              <p className="text-sm text-slate-400 mt-2">
                Range: ₹{formatINR(lowerBound)} – ₹{formatINR(upperBound)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RiskGauge riskNorm={riskNorm} riskLabel={riskLabel} />
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <p className="text-xs text-slate-400 uppercase tracking-widest">Risk Score</p>
              <p className="text-2xl font-black text-[#0A1628]">{Math.round(riskNorm * 100)}/100</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <p className="text-xs text-slate-400 uppercase tracking-widest">Risk Level</p>
              <p className={`text-2xl font-black ${riskLabel === "Low" ? "text-[#10B981]" : riskLabel === "Medium" ? "text-amber-500" : "text-red-500"}`}>
                {riskLabel}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm col-span-2">
              <p className="text-xs text-slate-400 uppercase tracking-widest">Eligible Range</p>
              <p className="text-lg font-black text-[#0A1628]">
                ₹{formatINR(lowerBound)} – ₹{formatINR(upperBound)}
              </p>
            </div>
          </div>
        </div>

        <FeatureImportanceChart data={featureContributions} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#10B981]/5 border border-[#10B981]/20 rounded-2xl p-5">
            <h3 className="font-bold text-[#10B981] mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> What Helped
            </h3>
            {positives.length > 0 ? (
              positives.map((p, i) => (
                <p key={i} className="text-sm text-slate-600 py-1.5 border-b border-[#10B981]/10 last:border-0">
                  {p}
                </p>
              ))
            ) : (
              <p className="text-sm text-slate-400">No positive factors found</p>
            )}
          </div>
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
            <h3 className="font-bold text-red-500 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> What Hurt
            </h3>
            {negatives.length > 0 ? (
              negatives.map((n, i) => (
                <p key={i} className="text-sm text-slate-600 py-1.5 border-b border-red-100 last:border-0">
                  {n}
                </p>
              ))
            ) : (
              <p className="text-sm text-slate-400">No negative factors found</p>
            )}
          </div>
        </div>

        {eligibleAmount > 0 && (
          <div>
            <h2 className="text-xl font-bold text-[#0A1628] mb-4">Your Loan Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <LoanProductCard
                name="Personal Loan"
                rate={11}
                tenure={36}
                eligible={Math.round(eligibleAmount)}
                tag="Most Popular"
              />
              <LoanProductCard
                name="Quick Cash"
                rate={13.5}
                tenure={12}
                eligible={Math.round(Math.min(eligibleAmount * 0.5, 100000))}
                tag="Instant Approval"
              />
              <LoanProductCard
                name="Flexi Credit"
                rate={14}
                tenure={24}
                eligible={Math.round(eligibleAmount * 0.75)}
              />
            </div>
          </div>
        )}

        {eligibleAmount === 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="font-bold text-red-600 mb-2">Not Eligible At This Time</h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto">
              Based on the information provided, you may not qualify for a loan right now. Improving your payment history and transaction regularity can help.
            </p>
            <Link href="/apply">
              <button className="mt-4 bg-[#0A1628] text-white font-bold px-6 py-3 rounded-full hover:bg-[#142238] transition-colors">
                Try Again
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
