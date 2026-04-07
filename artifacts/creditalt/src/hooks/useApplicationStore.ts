import { useState } from "react";
import type { ApplicationState, ScanResult } from "@/lib/types";

const defaultState: ApplicationState = {
  surplus: 30000,
  txnScore: 3,
  utilityScore: 3,
  rentScore: 3,
  insuranceScore: 3,
  employmentStability: 3,
  avgBalance: 50000,
  balanceMultiplier: 1,
  missed30DaysFlag: 0,
  shockFlag: 0,
  emiFlag: 0,
  monthlyIncome: 45000,
  hasRegularSalary: true,
  hasEMIs: false,
  scanResults: [],
};

export function useApplicationStore() {
  const [state, setState] = useState<ApplicationState>(defaultState);

  const update = (partial: Partial<ApplicationState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  };

  const addScanResult = (result: ScanResult) => {
    setState((prev) => {
      const scanResults = [...prev.scanResults, result];
      const updates: Partial<ApplicationState> = { scanResults };

      const d = result.extractedData;
      const s = result.derivedScores;

      if (d.monthlyIncome) updates.monthlyIncome = d.monthlyIncome;
      if (d.avgBalance) updates.avgBalance = d.avgBalance;
      if (d.monthlyIncome && d.totalDebits) {
        updates.surplus = Math.max(0, d.monthlyIncome - (d.totalDebits || 0));
      }
      if (s.txnScore) updates.txnScore = Math.round(s.txnScore);
      if (s.utilityScore) updates.utilityScore = Math.round(s.utilityScore);
      if (s.rentScore) updates.rentScore = Math.round(s.rentScore);
      if (s.insuranceScore) updates.insuranceScore = Math.round(s.insuranceScore);
      if (s.employmentStability) updates.employmentStability = Math.round(s.employmentStability);
      if (d.missedPayments && d.missedPayments > 0) updates.missed30DaysFlag = 1;

      return { ...prev, ...updates };
    });
  };

  const reset = () => setState(defaultState);

  return { state, update, addScanResult, reset };
}
