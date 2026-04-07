import { Check } from "lucide-react";

interface Step {
  label: string;
}

interface Props {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: Props) {
  return (
    <div className="flex items-start justify-between w-full">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <div key={index} className="flex-1 flex flex-col items-center relative">
            {index < steps.length - 1 && (
              <div
                className={`absolute top-5 left-1/2 w-full h-0.5 transition-colors duration-300 ${
                  isCompleted ? "bg-[#10B981]" : "bg-slate-200"
                }`}
              />
            )}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-all duration-300 ${
                isCompleted
                  ? "bg-[#10B981] text-white"
                  : isActive
                  ? "bg-[#0A1628] border-2 border-[#10B981] text-[#10B981]"
                  : "bg-slate-200 text-slate-400"
              }`}
            >
              {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
            </div>
            <span
              className={`text-xs mt-2 font-medium text-center ${
                isActive ? "text-[#10B981]" : isCompleted ? "text-[#10B981]" : "text-slate-400"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
