interface Props {
  riskNorm: number;
  riskLabel?: "Low" | "Medium" | "High";
}

export default function RiskGauge({ riskNorm, riskLabel }: Props) {
  const clampedRisk = Math.min(1, Math.max(0, riskNorm));
  const mappedRiskLabel = riskLabel === "Medium" ? "Moderate" : riskLabel;
  const label = mappedRiskLabel ?? (clampedRisk < 0.3 ? "Low" : clampedRisk < 0.6 ? "Moderate" : "High");

  const labelColor =
    clampedRisk < 0.3 ? "text-[#10B981]" : clampedRisk < 0.6 ? "text-amber-500" : "text-red-500";
  const gradientId = "riskGaugeGradient";

  const cx = 110;
  const cy = 110;
  const radius = 72;
  const angle = 180 + clampedRisk * 180;
  const angleRad = (angle * Math.PI) / 180;
  const startAngle = 180;
  const endAngle = 360;

  const startX = cx + radius * Math.cos((startAngle * Math.PI) / 180);
  const startY = cy + radius * Math.sin((startAngle * Math.PI) / 180);
  const bgEndX = cx + radius * Math.cos((endAngle * Math.PI) / 180);
  const bgEndY = cy + radius * Math.sin((endAngle * Math.PI) / 180);
  const needleLength = radius - 16;
  const needleX = cx + Math.cos(angleRad) * needleLength;
  const needleY = cy + Math.sin(angleRad) * needleLength;
  const arcPath = `M ${startX} ${startY} A ${radius} ${radius} 0 1 1 ${bgEndX} ${bgEndY}`;

  return (
    <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col items-center">
      <svg width="220" height="140" viewBox="0 0 220 140">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="65%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        <path
          d={arcPath}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="18"
          strokeLinecap="round"
        />
        {clampedRisk > 0 && (
          <path
            d={arcPath}
            pathLength="100"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="18"
            strokeLinecap="round"
            strokeDasharray={`${clampedRisk * 100} 100`}
            strokeDashoffset="0"
          />
        )}

        <circle cx={cx} cy={cy} r="9" fill="#0A1628" stroke="#0F172A" strokeWidth="2" />
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke="#0A1628"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <circle cx={needleX} cy={needleY} r="8" fill="#0A1628" />
      </svg>

      <p className={`text-xl font-extrabold mt-4 ${labelColor}`}>
        {label} Risk
      </p>
    </div>
  );
}
