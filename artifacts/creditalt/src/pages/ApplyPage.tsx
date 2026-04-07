import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import StepIndicator from "@/components/StepIndicator";
import DocumentUploader from "@/components/DocumentUploader";
import RiskGauge from "@/components/RiskGauge";
import { useApplicationStore } from "@/hooks/useApplicationStore";
import type { ScanResult } from "@/lib/types";
import { formatINR } from "@/lib/utils";

const STEPS = [
  { label: "Upload Docs" },
  { label: "Financial Profile" },
  { label: "Behavioral Signals" },
  { label: "Review & Submit" },
];

function ScoreSelector({
  value,
  onChange,
  label,
  description,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        {description && <span className="text-xs text-slate-400">{description}</span>}
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`w-10 h-10 rounded-full font-bold text-sm border-2 transition-all duration-200 ${
              value >= n
                ? "bg-[#0A1628] border-[#0A1628] text-white"
                : "border-slate-200 text-slate-400 hover:border-[#0A1628]/50"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleSwitch({
  value,
  onChange,
  label,
  description,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <p className="text-sm font-medium text-slate-600">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
          value ? "bg-[#10B981]" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${
            value ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  prefix = "₹",
  fromDocument,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  prefix?: string;
  fromDocument?: boolean;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        {fromDocument && (
          <span className="text-xs bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 rounded-full px-2 py-0.5">
            From Document
          </span>
        )}
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#10B981] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>{prefix}{formatINR(min)}</span>
          <span className="font-semibold text-[#0A1628]">{prefix}{formatINR(value)}</span>
          <span>{prefix}{formatINR(max)}</span>
        </div>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("left");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [, navigate] = useLocation();
  const { state, update, addScanResult } = useApplicationStore();
  const stepKey = useRef(0);

  const goNext = () => {
    setDirection("left");
    stepKey.current += 1;
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goPrev = () => {
    setDirection("right");
    stepKey.current += 1;
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  const handleScanComplete = (result: ScanResult) => {
    addScanResult(result);
  };

  const handleSubmit = async () => {
    if (!consent) {
      setError("Please accept the consent to continue.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Client-side score calculation (same algorithm as backend)
      const d = {
        surplus: state.surplus,
        txnScore: state.txnScore,
        utilityScore: state.utilityScore,
        rentScore: state.rentScore,
        insuranceScore: state.insuranceScore,
        employmentStability: state.employmentStability,
        avgBalance: state.avgBalance,
        balanceMultiplier: state.balanceMultiplier,
        missed30DaysFlag: state.missed30DaysFlag,
        shockFlag: state.shockFlag,
        emiFlag: state.emiFlag,
      };

      const balanceFactor = ([0.7, 1.0, 1.3][d.balanceMultiplier] as number) ?? 1.0;

      const riskNorm = Math.min(
        1,
        d.missed30DaysFlag * 0.30 +
        d.shockFlag * 0.25 +
        ((5 - d.txnScore) / 5) * 0.15 +
        ((5 - d.utilityScore) / 5) * 0.15 +
        ((5 - d.employmentStability) / 5) * 0.10 +
        d.emiFlag * 0.05
      );

      const base =
        (d.surplus * 0.30 +
          d.txnScore * 8000 +
          d.rentScore * 5000 +
          d.utilityScore * 5000 +
          d.insuranceScore * 4000 +
          d.employmentStability * 10000 +
          d.avgBalance * 0.05) * balanceFactor - riskNorm * 60000;

      const eligible = Math.max(0, Math.min(base * 0.9, 500000));

      const result = {
        riskLabel: riskNorm < 0.3 ? "Low" : riskNorm < 0.6 ? "Medium" : "High",
        riskNorm,
        eligibleAmount: eligible,
        lowerBound: eligible * 0.9,
        upperBound: Math.min(eligible * 1.1, 500000),
        featureContributions: [
          { feature: "Surplus Income", value: d.surplus * 0.30 },
          { feature: "Transaction Habit", value: d.txnScore * 8000 },
          { feature: "Utility Payments", value: d.utilityScore * 5000 },
          { feature: "Rent Regularity", value: d.rentScore * 5000 },
          { feature: "Job Stability", value: d.employmentStability * 10000 },
          { feature: "Insurance", value: d.insuranceScore * 4000 },
          { feature: "Risk Penalty", value: -(riskNorm * 60000) },
        ],
      };

      // Simulate brief processing delay for UX
      await new Promise((resolve) => setTimeout(resolve, 1200));

      sessionStorage.setItem("creditalt_result", JSON.stringify(result));
      navigate("/results");
    } catch {
      setError("Failed to calculate score. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const computedRiskNorm = Math.min(
    1,
    state.missed30DaysFlag * 0.30 +
    state.shockFlag * 0.25 +
    ((5 - state.txnScore) / 5) * 0.15 +
    ((5 - state.utilityScore) / 5) * 0.15 +
    ((5 - state.employmentStability) / 5) * 0.10 +
    state.emiFlag * 0.05
  );

  const animClass =
    direction === "left" ? "animate-slide-left" : "animate-slide-right";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-[#0A1628] to-[#142238] py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </div>
      </div>

      <div className={`mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-16 ${currentStep === 1 || currentStep === 2 ? "max-w-4xl" : "max-w-2xl"}`}>
        <div
          key={stepKey.current}
          className={`bg-white rounded-3xl shadow-xl p-6 sm:p-10 ${animClass}`}
        >
          {currentStep === 0 && (
            <div>
              <DocumentUploader onScanComplete={handleScanComplete} />
              {state.scanResults.length > 0 && (
                <div className="mt-4 text-sm text-[#10B981] font-medium">
                  {state.scanResults.length} document(s) scanned. Fields auto-populated below.
                </div>
              )}
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-[#0A1628] mb-1">Financial Profile</h2>
              <p className="text-slate-400 text-sm mb-6">Tell us about your monthly income and expenses.</p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Form Fields */}
                <div className="lg:col-span-2 border border-slate-200 rounded-2xl p-6 space-y-6">
                  {/* Monthly Surplus Income */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-[#0A1628]">Monthly Surplus Income</p>
                      <p className="text-sm font-bold text-[#0A1628]">₹{formatINR(state.surplus)}</p>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100000}
                      value={state.surplus}
                      onChange={(e) => update({ surplus: Number(e.target.value) })}
                      className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0A1628] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                      style={{
                        background: `linear-gradient(to right, #0A1628 ${(state.surplus / 100000) * 100}%, #e2e8f0 ${(state.surplus / 100000) * 100}%)`
                      }}
                    />
                    <p className="text-xs text-slate-400 mt-1">What's left after paying regular expenses?</p>
                  </div>

                  {/* Average Monthly Bank Balance */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-[#0A1628]">Average Monthly Bank Balance</p>
                      <p className="text-sm font-bold text-[#0A1628]">₹{formatINR(state.avgBalance)}</p>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={500000}
                      value={state.avgBalance}
                      onChange={(e) => update({ avgBalance: Number(e.target.value) })}
                      className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0A1628] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
                      style={{
                        background: `linear-gradient(to right, #0A1628 ${(state.avgBalance / 500000) * 100}%, #e2e8f0 ${(state.avgBalance / 500000) * 100}%)`
                      }}
                    />
                  </div>

                  {/* Balance Multiplier + Employment Stability Row */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Balance Multiplier - Radio Style */}
                    <div>
                      <p className="text-sm font-semibold text-[#0A1628] mb-3">Balance Multiplier</p>
                      <div className="flex flex-col gap-2">
                        {["Low", "Medium", "High"].map((opt, i) => (
                          <label
                            key={opt}
                            className="flex items-center gap-2 cursor-pointer group"
                            onClick={() => update({ balanceMultiplier: i })}
                          >
                            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              state.balanceMultiplier === i
                                ? "border-[#0A1628]"
                                : "border-slate-300 group-hover:border-slate-400"
                            }`}>
                              {state.balanceMultiplier === i && (
                                <span className="w-2.5 h-2.5 rounded-full bg-[#0A1628]" />
                              )}
                            </span>
                            <span className={`text-sm ${state.balanceMultiplier === i ? "font-semibold text-[#0A1628]" : "text-slate-500"}`}>
                              {opt}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Employment Stability - Dropdown */}
                    <div>
                      <p className="text-sm font-semibold text-[#0A1628] mb-3">Employment Stability</p>
                      <select
                        value={state.employmentStability}
                        onChange={(e) => update({ employmentStability: Number(e.target.value) })}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 bg-white appearance-none cursor-pointer focus:outline-none focus:border-[#0A1628] transition-colors"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 12px center',
                        }}
                      >
                        <option value={1}>Freelancer</option>
                        <option value={2}>Self Employed</option>
                        <option value={3}>Salaried Private</option>
                        <option value={4}>Salaried Government</option>
                        <option value={5}>Senior Professional</option>
                      </select>

                      {/* Currently paying EMIs toggle */}
                      <div className="flex items-center justify-between mt-5 border border-slate-200 rounded-xl px-4 py-3">
                        <span className="text-sm text-slate-600">Currently paying EMIs?</span>
                        <button
                          onClick={() => {
                            const v = !state.hasEMIs;
                            update({ hasEMIs: v, emiFlag: v ? 1 : 0 });
                          }}
                          className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
                            state.hasEMIs ? "bg-[#10B981]" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${
                              state.hasEMIs ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Profile Snapshot */}
                <div className="bg-[#0A1628] rounded-2xl p-6 text-white h-fit">
                  <h3 className="text-base font-bold mb-5">Profile Snapshot</h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-400">Surplus</p>
                      <p className="text-xl font-black text-[#10B981]">₹{formatINR(state.surplus)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Avg Balance</p>
                      <p className="text-xl font-black text-white">₹{formatINR(state.avgBalance)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Stability</p>
                      <p className="text-lg font-bold text-white">
                        {["Low", "Medium", "High"][state.balanceMultiplier]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
                <div>
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-[#0A1628] mb-3">Alternative Behavior</h2>
                    <p className="text-sm text-slate-500">
                      How you manage everyday payments matters to us.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
                    <ScoreSelector
                      label="Digital Transactions"
                      description="1 = Rarely use digital, 5 = Daily UPI/Wallet user"
                      value={state.txnScore}
                      onChange={(v) => update({ txnScore: v })}
                    />
                    <ScoreSelector
                      label="Rent Payment Consistency"
                      description="1 = No fixed rent, 5 = Always pay on time"
                      value={state.rentScore}
                      onChange={(v) => update({ rentScore: v })}
                    />
                    <ScoreSelector
                      label="Utility Bill Payments"
                      description="1 = Often miss bills, 5 = Never missed a bill"
                      value={state.utilityScore}
                      onChange={(v) => update({ utilityScore: v })}
                    />
                    <ScoreSelector
                      label="Insurance Premiums"
                      description="1 = No insurance, 5 = All premiums paid on time"
                      value={state.insuranceScore}
                      onChange={(v) => update({ insuranceScore: v })}
                    />
                  </div>

                  <div className="mt-6 bg-amber-50 border border-amber-100 rounded-3xl p-6">
                    <ToggleSwitch
                      label="Missed 30-Day Payment"
                      description="Missed any payment by 30+ days in last 6 months?"
                      value={state.missed30DaysFlag === 1}
                      onChange={(v) => update({ missed30DaysFlag: v ? 1 : 0 })}
                    />
                    <ToggleSwitch
                      label="Financial Shock"
                      description="Had a major medical or financial emergency recently?"
                      value={state.shockFlag === 1}
                      onChange={(v) => update({ shockFlag: v ? 1 : 0 })}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.2em]">
                      Live AI Risk Preview
                    </p>
                  </div>

                  <RiskGauge riskNorm={computedRiskNorm} />

                  <p className="mt-6 text-sm text-slate-500 text-center">
                    Based on your behavioral signals. Lower risk increases approval chance.
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-bold text-[#0A1628] mb-6">Review & Submit</h2>

              <div className="space-y-4">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-[#0A1628]">Financial Profile</h3>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-xs text-[#10B981] hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <dt className="text-slate-500">Monthly Income</dt>
                    <dd className="font-semibold text-[#0A1628] text-right">₹{formatINR(state.monthlyIncome)}</dd>
                    <dt className="text-slate-500">Surplus Income</dt>
                    <dd className="font-semibold text-[#0A1628] text-right">₹{formatINR(state.surplus)}</dd>
                    <dt className="text-slate-500">Avg Balance</dt>
                    <dd className="font-semibold text-[#0A1628] text-right">₹{formatINR(state.avgBalance)}</dd>
                    <dt className="text-slate-500">Balance Stability</dt>
                    <dd className="font-semibold text-[#0A1628] text-right">
                      {["Low", "Medium", "High"][state.balanceMultiplier]}
                    </dd>
                  </dl>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-[#0A1628]">Behavioral Scores</h3>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-xs text-[#10B981] hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <dt className="text-slate-500">Transaction Score</dt>
                    <dd className="font-semibold text-[#0A1628] text-right">{state.txnScore}/5</dd>
                    <dt className="text-slate-500">Utility Score</dt>
                    <dd className="font-semibold text-[#0A1628] text-right">{state.utilityScore}/5</dd>
                    <dt className="text-slate-500">Rent Score</dt>
                    <dd className="font-semibold text-[#0A1628] text-right">{state.rentScore}/5</dd>
                    <dt className="text-slate-500">Job Stability</dt>
                    <dd className="font-semibold text-[#0A1628] text-right">{state.employmentStability}/5</dd>
                  </dl>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                  <RiskGauge riskNorm={computedRiskNorm} />
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group mt-6">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#10B981] rounded"
                />
                <span className="text-sm text-slate-600">
                  I consent to the processing of my financial data for credit assessment purposes as per India's DPDP Act 2023. I understand this data will not be shared with third parties without my consent.
                </span>
              </label>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-sm mt-4">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          {currentStep > 0 && (
            <button
              onClick={goPrev}
              className="flex items-center gap-2 border-2 border-slate-200 text-slate-600 font-semibold px-6 py-3 rounded-2xl hover:border-slate-300 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}

          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={goNext}
              className="flex-1 bg-[#0A1628] hover:bg-[#142238] text-white font-bold py-3 rounded-2xl text-base shadow-lg transition-all duration-300 flex items-center justify-center gap-3"
            >
              {currentStep === 0 ? "Continue to Profile" : currentStep === 1 ? "Continue to Signals" : "Review & Submit"}
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white font-bold py-4 rounded-2xl text-lg shadow-lg hover:shadow-[#10B981]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
              {loading ? "Calculating Score..." : "Get My Credit Score"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
