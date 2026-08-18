export interface ExpenseCategory {
  code: string;
  name: string;
  allotment: number;
  description?: string;
  color?: string;
}

export interface LedgerItem {
  id: string;
  code: string;
  drnNumber?: string;
  purchaseRequestNo?: string;
  particulars: string;
  additionalRemarks?: string;
  amount: number;
  month?: string; // e.g. "January 2026", "February 2026", etc.
  date?: string;
  notes?: string;
}

export interface CategorySummary {
  code: string;
  name: string;
  allotment: number;
  amountUtilized: number;
  percentUtilized: number;
  unutilizedAmount: number;
  percentUnutilized: number;
  color: string;
  transactionCount: number;
}

export interface BenchmarkTarget {
  name: string;
  allotment: number;
  utilized: number;
  percentUtilized: number;
  unutilized: number;
  percentUnutilized: number;
  description?: string;
}

export interface FilterOptions {
  searchQuery: string;
  selectedCode: string;
  selectedMonth: string;
  minAmount: string;
  maxAmount: string;
  sortBy: 'date' | 'amount' | 'code' | 'particulars';
  sortOrder: 'asc' | 'desc';
}

export interface CategoryForecast {
  code: string;
  name: string;
  color: string;
  fy2026Allotment: number;
  fy2026Utilized: number;
  fy2026Unutilized: number;
  fy2026CurrentPct: number;
  
  // Year 2026 Remaining needed burn (Aug - Dec, 5 mos)
  fy2026RemainingNeeded: number;
  fy2026MonthlyNeededBurn: number;
  
  // Annualized Actual Run-rate (based on 7 months)
  annualizedRunRate: number;
  
  // Year 1 (FY 2027) Projection
  fy2027RecommendedAllotment: number;
  fy2027MonthlyTarget: number;
  fy2027QuarterlyTarget: number;
  fy2027ChangeFrom2026Pct: number;

  // Year 2 (FY 2028) Projection
  fy2028RecommendedAllotment: number;
  fy2028MonthlyTarget: number;
  fy2028QuarterlyTarget: number;
  fy2028ChangeFrom2027Pct: number;

  recommendationReason: string;
  burnRateStatus: 'surplus_risk' | 'deficit_risk' | 'on_track' | 'fully_utilized';
}

export interface MultiYearForecastSummary {
  inflationRate: number;
  targetYearEndUtilPct: number;
  
  fy2026: {
    totalAllotment: number;
    totalUtilized: number;
    totalUnutilized: number;
    percentUtilized: number;
    remainingMonths: number;
    totalNeededBurnMonthly: number;
    projectedYearEndTotal: number;
  };
  
  fy2027: {
    totalRecommendedAllotment: number;
    totalQuarterlyTarget: number;
    totalMonthlyTarget: number;
    changePct: number;
  };
  
  fy2028: {
    totalRecommendedAllotment: number;
    totalQuarterlyTarget: number;
    totalMonthlyTarget: number;
    changePct: number;
  };
  
  categories: CategoryForecast[];
}

export type BillStatus = 'estimated' | 'obligated' | 'invoiced' | 'paid';
export type BillConfidence = 'high' | 'medium' | 'recurring_scheduled' | 'tentative';

export interface EstimatedBill {
  id: string;
  code: string; // e.g. "CS", "PS", "TEV", "RE", "HE", "SC"
  particulars: string;
  vendor?: string; // e.g. "JRS Express", "Philippine Postal Corp", "Yana / Field Staff", "Hotel & Catering", "Logistics Provider"
  estimatedAmount: number;
  expectedMonth: string; // e.g. "August 2026", "September 2026", etc.
  expectedDueDate?: string; // e.g. "2026-08-31"
  status: BillStatus;
  confidence: BillConfidence;
  drnNumber?: string;
  purchaseRequestNo?: string;
  remarks?: string;
  isRecurring?: boolean;
}

export interface BillCategorySolvency {
  code: string;
  name: string;
  color: string;
  allotment: number;
  utilizedToDate: number;
  unutilizedBalance: number;
  totalEstimatedBills: number;
  obligatedBillsAmount: number;
  pendingEstimatedBillsAmount: number;
  projectedNetVariance: number; // unutilizedBalance - totalEstimatedBills
  solvencyStatus: 'solvent' | 'deficit_warning' | 'critical_overdraft' | 'surplus_excess';
  solvencyMessage: string;
  billCount: number;
}

export interface BillEstimationOverview {
  totalEstimatedUpcomingBills: number;
  totalObligatedBills: number;
  totalPendingBills: number;
  projectedYearEndSpend: number; // current utilized + total estimated bills
  projectedYearEndNetSavings: number; // total allotment - projectedYearEndSpend
  projectedYearEndAbsorptionPct: number;
  solvencyBreakdown: BillCategorySolvency[];
  upcomingBills: EstimatedBill[];
}

