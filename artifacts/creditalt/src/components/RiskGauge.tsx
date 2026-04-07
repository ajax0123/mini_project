interface Props {
  riskNorm: number;
  riskLabel?: "Low" | "Medium" | "High";
}

export default function RiskGauge({ riskNorm, riskLabel }: Props) {
  const clampedRisk = Math.min(1, Math.max(0, riskNorm));

  const color =
    clampedRisk < 0.3 ? "#10B981" : clampedRisk < 0.6 ? "#F59E0B" : "#EF4444";
  const textColor =
    clampedRisk < 0.3 ? "text-[#10B981]" : clampedRisk < 0.6 ? "text-[#F59E0B]" : "text-[#EF4444]";
  const label = riskLabel ?? (clampedRisk < 0.3 ? "Low" : clampedRisk < 0.6 ? "Medium" : "High");

  const radius = 70;
  const cx = 90;
  const cy = 90;
  const circumference = Math.PI * radius;
  const startAngle = 180;
  const endAngle = 360;
  const angle = startAngle + clampedRisk * 180;

  const startX = cx + radius * Math.cos((startAngle * Math.PI) / 180);
  const startY = cy + radius * Math.sin((startAngle * Math.PI) / 180);
  const endX = cx + radius * Math.cos((angle * Math.PI) / 180);
  const endY = cy + radius * Math.sin((angle * Math.PI) / 180);
  const largeArc = clampedRisk > 0.5 ? 1 : 0;

  const bgEndX = cx + radius * Math.cos((endAngle * Math.PI) / 180);
  const bgEndY = cy + radius * Math.sin((endAngle * Math.PI) / 180);

  return (
    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col items-center">
      <svg width="180" height="100" viewBox="0 0 180 100">
        <path
          d={`M ${startX} ${startY} A ${radius} ${radius} 0 1 1 ${bgEndX} ${bgEndY}`}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {clampedRisk > 0 && (
          <path
            d={`M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
          />
        )}
        <text x={cx} y={85} textAnchor="middle" fontSize="22" fontWeight="900" fill={color}>
          {Math.round(clampedRisk * 100)}
        </text>
      </svg>
      <p className={`text-sm font-semibold uppercase tracking-widest mt-1 ${textColor}`}>
        {label} Risk
      </p>
      <p className="text-xs text-slate-400 mt-2 animate-pulse">Updating in real-time...</p>
    </div>
  );
}
