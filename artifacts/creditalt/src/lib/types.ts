export interface ExtractedData {
  monthlyIncome?: number | null;
  avgBalance?: number | null;
  totalDebits?: number | null;
  totalCredits?: number | null;
  upiTransactionCount?: number | null;
  billAmount?: number | null;
  billPaidOnTime?: boolean | null;
  subscriptionActive?: boolean | null;
  subscriptionPlatform?: string | null;
  subscriptionAmount?: number | null;
  rentAmount?: number | null;
  rentPaidOnTime?: boolean | null;
  employerName?: string | null;
  employmentType?: string | null;
  insurancePremium?: number | null;
  insurancePaidOnTime?: boolean | null;
  missedPayments?: number | null;
  anomalyFlags?: string[];
}

export interface DerivedScores {
  txnScore: number;
  utilityScore: number;
  rentScore: number;
  insuranceScore: number;
  employmentStability: number;
}

export interface ScanResult {
  documentType: string;
  detectedType: string;
  confidence: number;
  extractedData: ExtractedData;
  derivedScores: DerivedScores;
  warnings: string[];
}

export interface FeatureContribution {
  feature: string;
  value: number;
}

export interface ScoreResult {
  riskLabel: "Low" | "Medium" | "High";
  riskNorm: number;
  eligibleAmount: number;
  lowerBound: number;
  upperBound: number;
  featureContributions: FeatureContribution[];
}

export interface ApplicationState {
  surplus: number;
  txnScore: number;
  utilityScore: number;
  rentScore: number;
  insuranceScore: number;
  employmentStability: number;
  avgBalance: number;
  balanceMultiplier: number;
  missed30DaysFlag: number;
  shockFlag: number;
  emiFlag: number;
  monthlyIncome: number;
  hasRegularSalary: boolean;
  hasEMIs: boolean;
  scanResults: ScanResult[];
}
