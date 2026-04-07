import type { Request, Response } from "express";
import { CalculateScoreBody } from "@workspace/api-zod";

export async function scoreRoute(req: Request, res: Response) {
  const parsed = CalculateScoreBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Bad request", message: parsed.error.message });
    return;
  }

  const d = parsed.data;
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

  res.json(result);
}
