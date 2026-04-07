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
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div className="mb-5">
      <p className="text-sm font-medium text-slate-600 mb-2">{label}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`w-10 h-10 rounded-full font-bold text-sm border-2 transition-all duration-200 ${
              value >= n
                ? "bg-[#10B981] border-[#10B981] text-white"
                : "border-slate-200 text-slate-400 hover:border-[#10B981]/50"
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
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-medium text-slate-600">{label}</span>
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
      const res = await fetch("/api/creditalt/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        }),
      });

      if (!res.ok) throw new Error("Score calculation failed");

      const result = await res.json();
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
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Check Your Credit Eligibility</h1>
          <StepIndicator steps={STEPS} currentStep={currentStep} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-16">
        <div
          key={stepKey.current}
          className={`bg-white rounded-3xl shadow-xl p-6 sm:p-10 ${animClass}`}
        >
          {currentStep === 0 && (
            <div>
              <h2 className="text-xl font-bold text-[#0A1628] mb-2">Upload Your Documents</h2>
              <p className="text-slate-500 text-sm mb-6">
                Our AI will scan and extract key financial data automatically.
              </p>
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
              <h2 className="text-xl font-bold text-[#0A1628] mb-6">Financial Profile</h2>

              <SliderField
                label="Monthly Income"
                value={state.monthlyIncome}
                onChange={(v) => update({ monthlyIncome: v })}
                min={0}
                max={200000}
                fromDocument={state.scanResults.some((r) => r.extractedData.monthlyIncome)}
              />
              <SliderField
                label="Surplus Income (Income - Expenses)"
                value={state.surplus}
                onChange={(v) => update({ surplus: v })}
                min={0}
                max={100000}
              />
              <SliderField
                label="Average Bank Balance"
                value={state.avgBalance}
                onChange={(v) => update({ avgBalance: v })}
                min={0}
                max={500000}
                fromDocument={state.scanResults.some((r) => r.extractedData.avgBalance)}
              />

              <div className="mb-5">
                <p className="text-sm font-medium text-slate-600 mb-2">Balance Multiplier (Stability)</p>
                <div className="grid grid-cols-3 gap-3">
                  {["Low", "Medium", "High"].map((opt, i) => (
                    <button
                      key={opt}
                      onClick={() => update({ balanceMultiplier: i })}
                      className={`rounded-xl py-3 text-sm font-semibold border-2 transition-all duration-200 ${
                        state.balanceMultiplier === i
                          ? "border-[#10B981] bg-[#10B981]/10 text-[#10B981]"
                          : "border-slate-200 text-slate-500 hover:border-[#10B981]/40"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <ToggleSwitch
                label="Regular Salary Income"
                value={state.hasRegularSalary}
                onChange={(v) => update({ hasRegularSalary: v })}
              />
              <ToggleSwitch
                label="Active EMIs"
                value={state.hasEMIs}
                onChange={(v) => {
                  update({ hasEMIs: v, emiFlag: v ? 1 : 0 });
                }}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-xl font-bold text-[#0A1628] mb-6">Behavioral Signals</h2>

                  <ScoreSelector
                    label="UPI / Transaction Score"
                    value={state.txnScore}
                    onChange={(v) => update({ txnScore: v })}
                  />
                  <ScoreSelector
                    label="Utility Bill Consistency"
                    value={state.utilityScore}
                    onChange={(v) => update({ utilityScore: v })}
                  />
                  <ScoreSelector
                    label="Rent Payment Regularity"
                    value={state.rentScore}
                    onChange={(v) => update({ rentScore: v })}
                  />
                  <ScoreSelector
                    label="Insurance Premium Payments"
                    value={state.insuranceScore}
                    onChange={(v) => update({ insuranceScore: v })}
                  />
                  <ScoreSelector
                    label="Employment Stability"
                    value={state.employmentStability}
                    onChange={(v) => update({ employmentStability: v })}
                  />

                  <div className="border-t border-slate-100 pt-4 mt-2">
                    <ToggleSwitch
                      label="Missed payment in last 30 days"
                      value={state.missed30DaysFlag === 1}
                      onChange={(v) => update({ missed30DaysFlag: v ? 1 : 0 })}
                    />
                    <ToggleSwitch
                      label="Income shock / job change recently"
                      value={state.shockFlag === 1}
                      onChange={(v) => update({ shockFlag: v ? 1 : 0 })}
                    />
                  </div>
                </div>

                <div>
                  <RiskGauge riskNorm={computedRiskNorm} />
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
              className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white font-bold py-3 rounded-2xl text-base shadow-lg hover:shadow-[#10B981]/30 transition-all duration-300 flex items-center justify-center gap-3"
            >
              Continue
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
