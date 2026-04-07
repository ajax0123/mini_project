import { calcEMI, formatINR } from "@/lib/utils";

interface Props {
  name: string;
  rate: number;
  tenure: number;
  eligible: number;
  tag?: string;
}

export default function LoanProductCard({ name, rate, tenure, eligible, tag }: Props) {
  return (
    <div className="bg-white rounded-3xl border-2 border-[#10B981]/30 shadow-lg p-6 hover:border-[#10B981] hover:shadow-[#10B981]/10 transition-all duration-300 animate-fade-up">
      {tag && (
        <span className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
          {tag}
        </span>
      )}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#0A1628]">{name}</h3>
        <span className="bg-[#10B981]/10 text-[#10B981] text-sm font-semibold px-3 py-1 rounded-full">
          {rate}% p.a.
        </span>
      </div>
      <p className="text-3xl font-black text-[#0A1628] mb-1">₹{formatINR(eligible)}</p>
      <p className="text-sm text-slate-400 mb-4">
        Est. EMI: ₹{calcEMI(eligible, rate, tenure)}/mo for {tenure} months
      </p>
      <button className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold py-3 rounded-xl transition-colors duration-200">
        Apply Now
      </button>
    </div>
  );
}
