import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { FeatureContribution } from "@/lib/types";
import { formatINR } from "@/lib/utils";

interface Props {
  data: FeatureContribution[];
}

export default function FeatureImportanceChart({ data }: Props) {
  return (
    <div className="bg-white rounded-3xl shadow-md p-6 border border-slate-100 animate-fade-up">
      <h3 className="text-lg font-bold text-[#0A1628] mb-4">Score Breakdown</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart layout="vertical" data={data} margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
          <XAxis
            type="number"
            tickFormatter={(v) => `₹${formatINR(Math.abs(v))}`}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
          />
          <YAxis
            type="category"
            dataKey="feature"
            width={130}
            tick={{ fontSize: 12, fill: "#475569" }}
          />
          <Tooltip
            formatter={(value: number) => [`₹${formatINR(Math.abs(value))}`, value >= 0 ? "Positive" : "Negative"]}
            contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.value >= 0 ? "#10B981" : "#EF4444"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
