import { CategorySummary, CategoryForecast, MultiYearForecastSummary, ExpenseCategory, LedgerItem } from '../types';

export interface ForecastOptions {
  inflationRate: number; // e.g. 0.05 for 5%
  targetYearEndUtilPct: number; // e.g. 100 for 100%
  customAdjustments?: Record<string, number>; // custom multiplier per code if any
}

export const DEFAULT_FORECAST_OPTIONS: ForecastOptions = {
  inflationRate: 0.06, // 6% annual government inflation & expansion factor
  targetYearEndUtilPct: 100 // 100% target utilization for FY 2026
};

/**
 * Calculates Multi-Year Budget Forecast and Needed Utilization Targets
 * based on FY 2026 historical ledger (Jan-Jul) and approved WFP allotments.
 */
export function calculateMultiYearForecast(
  categories: ExpenseCategory[],
  ledgerItems: LedgerItem[],
  summaries: CategorySummary[],
  options: ForecastOptions = DEFAULT_FORECAST_OPTIONS
): MultiYearForecastSummary {
  const { inflationRate, targetYearEndUtilPct } = options;
  const elapsedMonths = 7; // January to July
  const remainingMonths = 5; // August to December

  const categoryForecasts: CategoryForecast[] = summaries.map((s) => {
    const fy2026Allotment = s.allotment;
    const fy2026Utilized = s.amountUtilized;
    const fy2026Unutilized = s.unutilizedAmount;
    const fy2026CurrentPct = s.percentUtilized;

    // Remaining Needed to reach target % utilization in FY 2026
    const targetAmount = (fy2026Allotment * targetYearEndUtilPct) / 100;
    const fy2026RemainingNeeded = Math.max(0, targetAmount - fy2026Utilized);
    const fy2026MonthlyNeededBurn = remainingMonths > 0 ? fy2026RemainingNeeded / remainingMonths : 0;

    // Annualized actual run-rate based on 7 months of disbursements
    let annualizedRunRate = 0;
    let baselineDemand2027 = 0;
    let recommendationReason = '';
    let burnRateStatus: 'surplus_risk' | 'deficit_risk' | 'on_track' | 'fully_utilized' = 'on_track';

    if (s.code === 'TEV') {
      // Traveling Expense: 100% exhausted in 7 months (₱4,585 in May)
      // Historical demand exceeds initial cap.
      annualizedRunRate = (fy2026Utilized / 5) * 12; // exhausted by month 5
      baselineDemand2027 = Math.max(fy2026Allotment * 1.5, annualizedRunRate * (1 + inflationRate));
      // Round to nearest thousands for realistic budget proposal
      baselineDemand2027 = Math.ceil(baselineDemand2027 / 1000) * 1000;
      recommendationReason = '100% utilized early. Increased travel demands necessitate higher allotment for full-year travel coverage.';
      burnRateStatus = 'deficit_risk';
    } else if (s.code === 'RE') {
      // Semestral RC Meeting: ₱60k unutilized in H1, intended for 2nd semester RC meeting
      annualizedRunRate = fy2026Allotment; // lump-sum expected in H2
      baselineDemand2027 = fy2026Allotment * (1 + inflationRate);
      baselineDemand2027 = Math.ceil(baselineDemand2027 / 1000) * 1000;
      recommendationReason = 'Lump-sum meeting expense scheduled for H2. Maintain baseline with inflation buffer for venue & catering.';
      burnRateStatus = 'surplus_risk';
    } else if (s.code === 'HE') {
      // Hauling Expenses: ₱3,329 utilized in 7 months
      annualizedRunRate = (fy2026Utilized / elapsedMonths) * 12;
      baselineDemand2027 = Math.max(fy2026Allotment * (1 + inflationRate), annualizedRunRate * 1.3);
      baselineDemand2027 = Math.ceil(baselineDemand2027 / 1000) * 1000;
      recommendationReason = 'Moderate utilization for hauling & logistical transfer. Retain allotment baseline with indexation.';
      burnRateStatus = 'on_track';
    } else if (s.code === 'PS') {
      // Postal Services: ₱20,639 utilized in 7 months vs ₱109,000 allotment (18.9% utilization)
      annualizedRunRate = (fy2026Utilized / elapsedMonths) * 12; // ~₱35.4k/year
      // Right-size to prevent perennial unutilized balances while retaining safety buffer
      baselineDemand2027 = Math.max(50000, annualizedRunRate * 1.35 * (1 + inflationRate));
      baselineDemand2027 = Math.ceil(baselineDemand2027 / 1000) * 1000;
      recommendationReason = 'Low utilization rate (18.9%). Recommend right-sizing budget to ₱50k-₱55k to release excess funds for other operational priorities.';
      burnRateStatus = 'surplus_risk';
    } else if (s.code === 'SC') {
      // Office Supplies Sacks: ₱42,000 100% utilized in bulk PR
      annualizedRunRate = fy2026Utilized;
      baselineDemand2027 = fy2026Allotment * (1 + inflationRate);
      baselineDemand2027 = Math.ceil(baselineDemand2027 / 1000) * 1000;
      recommendationReason = 'Single bulk PR procurement utilized 100%. Adjust for commodity supply price indexation.';
      burnRateStatus = 'fully_utilized';
    } else if (s.code === 'CS') {
      // Courier Services: ₱43,125 in 7 months (~₱6,160/mo) vs ₱134,000 allotment
      annualizedRunRate = (fy2026Utilized / elapsedMonths) * 12; // ~₱73.9k/year
      baselineDemand2027 = Math.max(85000, annualizedRunRate * 1.2 * (1 + inflationRate));
      baselineDemand2027 = Math.ceil(baselineDemand2027 / 1000) * 1000;
      recommendationReason = 'Steady monthly mailings (~₱6.1k/mo). Right-size allotment to ~₱90k with 20% operational expansion buffer.';
      burnRateStatus = 'on_track';
    } else {
      // Custom categories if any
      annualizedRunRate = fy2026Utilized > 0 ? (fy2026Utilized / elapsedMonths) * 12 : fy2026Allotment;
      baselineDemand2027 = Math.max(fy2026Allotment, annualizedRunRate) * (1 + inflationRate);
      baselineDemand2027 = Math.ceil(baselineDemand2027 / 1000) * 1000;
      recommendationReason = 'Adjusted based on annualized trend and inflation factor.';
      burnRateStatus = fy2026CurrentPct > 80 ? 'on_track' : 'surplus_risk';
    }

    const fy2027RecommendedAllotment = Math.round(baselineDemand2027);
    const fy2027MonthlyTarget = fy2027RecommendedAllotment / 12;
    const fy2027QuarterlyTarget = fy2027RecommendedAllotment / 4;
    const fy2027ChangeFrom2026Pct = fy2026Allotment > 0
      ? ((fy2027RecommendedAllotment - fy2026Allotment) / fy2026Allotment) * 100
      : 0;

    // FY 2028 Projection: FY 2027 * (1 + inflationRate)
    const fy2028RecommendedAllotment = Math.ceil((fy2027RecommendedAllotment * (1 + inflationRate)) / 1000) * 1000;
    const fy2028MonthlyTarget = fy2028RecommendedAllotment / 12;
    const fy2028QuarterlyTarget = fy2028RecommendedAllotment / 4;
    const fy2028ChangeFrom2027Pct = fy2027RecommendedAllotment > 0
      ? ((fy2028RecommendedAllotment - fy2027RecommendedAllotment) / fy2027RecommendedAllotment) * 100
      : 0;

    return {
      code: s.code,
      name: s.name,
      color: s.color,
      fy2026Allotment,
      fy2026Utilized,
      fy2026Unutilized,
      fy2026CurrentPct,
      fy2026RemainingNeeded,
      fy2026MonthlyNeededBurn,
      annualizedRunRate,
      fy2027RecommendedAllotment,
      fy2027MonthlyTarget,
      fy2027QuarterlyTarget,
      fy2027ChangeFrom2026Pct,
      fy2028RecommendedAllotment,
      fy2028MonthlyTarget,
      fy2028QuarterlyTarget,
      fy2028ChangeFrom2027Pct,
      recommendationReason,
      burnRateStatus
    };
  });

  // Calculate totals
  const totalAllotment2026 = categoryForecasts.reduce((sum, c) => sum + c.fy2026Allotment, 0);
  const totalUtilized2026 = categoryForecasts.reduce((sum, c) => sum + c.fy2026Utilized, 0);
  const totalUnutilized2026 = categoryForecasts.reduce((sum, c) => sum + c.fy2026Unutilized, 0);
  const percentUtilized2026 = totalAllotment2026 > 0 ? (totalUtilized2026 / totalAllotment2026) * 100 : 0;
  const totalNeededBurnMonthly2026 = categoryForecasts.reduce((sum, c) => sum + c.fy2026MonthlyNeededBurn, 0);
  const projectedYearEndTotal2026 = totalUtilized2026 + (totalNeededBurnMonthly2026 * remainingMonths);

  const totalRecommended2027 = categoryForecasts.reduce((sum, c) => sum + c.fy2027RecommendedAllotment, 0);
  const totalRecommended2028 = categoryForecasts.reduce((sum, c) => sum + c.fy2028RecommendedAllotment, 0);

  const changePct2027 = totalAllotment2026 > 0 ? ((totalRecommended2027 - totalAllotment2026) / totalAllotment2026) * 100 : 0;
  const changePct2028 = totalRecommended2027 > 0 ? ((totalRecommended2028 - totalRecommended2027) / totalRecommended2027) * 100 : 0;

  return {
    inflationRate,
    targetYearEndUtilPct,
    fy2026: {
      totalAllotment: totalAllotment2026,
      totalUtilized: totalUtilized2026,
      totalUnutilized: totalUnutilized2026,
      percentUtilized: percentUtilized2026,
      remainingMonths,
      totalNeededBurnMonthly: totalNeededBurnMonthly2026,
      projectedYearEndTotal: projectedYearEndTotal2026
    },
    fy2027: {
      totalRecommendedAllotment: totalRecommended2027,
      totalQuarterlyTarget: totalRecommended2027 / 4,
      totalMonthlyTarget: totalRecommended2027 / 12,
      changePct: changePct2027
    },
    fy2028: {
      totalRecommendedAllotment: totalRecommended2028,
      totalQuarterlyTarget: totalRecommended2028 / 4,
      totalMonthlyTarget: totalRecommended2028 / 12,
      changePct: changePct2028
    },
    categories: categoryForecasts
  };
}

/**
 * Generates and downloads a dedicated Multi-Year Budget Proposal & Utilization Report CSV
 */
export function exportMultiYearForecastCSV(forecast: MultiYearForecastSummary) {
  const lines: string[] = [];

  lines.push('"RAMS ADMINISTRATIVE COSTS - MULTI-YEAR BUDGET FORECAST & UTILIZATION REQUIREMENTS REPORT"');
  lines.push(`"Generated: ${new Date().toLocaleString()}"`);
  lines.push(`"Planning Parameters: Target FY 2026 Utilization = ${forecast.targetYearEndUtilPct}% | Annual Inflation/Growth Buffer = ${(forecast.inflationRate * 100).toFixed(1)}%"`);
  lines.push('');

  // 1. FY 2026 REMAINING NEEDED UTILIZATION (AUG - DEC)
  lines.push('"SECTION 1: FY 2026 REMAINING NEEDED UTILIZATION (AUGUST - DECEMBER 2026)"');
  lines.push('"Code","Expense Account","Approved Allotment (₱)","Utilized (Jan-Jul) (₱)","% Utilized","Remaining Unutilized (₱)","Needed Burn Aug-Dec (₱)","Monthly Required Burn (₱)","Burn Status"');

  forecast.categories.forEach((c) => {
    lines.push(
      `"${c.code}","${c.name}",${c.fy2026Allotment.toFixed(2)},${c.fy2026Utilized.toFixed(2)},"${c.fy2026CurrentPct.toFixed(2)}%",${c.fy2026Unutilized.toFixed(2)},${c.fy2026RemainingNeeded.toFixed(2)},${c.fy2026MonthlyNeededBurn.toFixed(2)},"${c.burnRateStatus}"`
    );
  });

  lines.push(
    `"TOTAL:","All Administrative Accounts",${forecast.fy2026.totalAllotment.toFixed(2)},${forecast.fy2026.totalUtilized.toFixed(2)},"${forecast.fy2026.percentUtilized.toFixed(2)}%",${forecast.fy2026.totalUnutilized.toFixed(2)},${(forecast.fy2026.totalNeededBurnMonthly * forecast.fy2026.remainingMonths).toFixed(2)},${forecast.fy2026.totalNeededBurnMonthly.toFixed(2)},"Consolidated"`
  );
  lines.push('');

  // 2. NEXT 2 YEARS BUDGET PROPOSALS (FY 2027 & FY 2028)
  lines.push('"SECTION 2: MULTI-YEAR BUDGET REQUIREMENTS (FY 2026 BASELINE vs FY 2027 & FY 2028 PROPOSALS)"');
  lines.push('"Code","Expense Account","FY 2026 Allotment (₱)","Annualized Run Rate (₱)","FY 2027 Proposed Allotment (₱)","FY 2027 vs 2026 (%)","FY 2027 Quarterly Target (₱)","FY 2028 Proposed Allotment (₱)","FY 2028 vs 2027 (%)","FY 2028 Quarterly Target (₱)","Justification & Planning Rationale"');

  forecast.categories.forEach((c) => {
    lines.push(
      `"${c.code}","${c.name}",${c.fy2026Allotment.toFixed(2)},${c.annualizedRunRate.toFixed(2)},${c.fy2027RecommendedAllotment.toFixed(2)},"${c.fy2027ChangeFrom2026Pct.toFixed(2)}%",${c.fy2027QuarterlyTarget.toFixed(2)},${c.fy2028RecommendedAllotment.toFixed(2)},"${c.fy2028ChangeFrom2027Pct.toFixed(2)}%",${c.fy2028QuarterlyTarget.toFixed(2)},"${c.recommendationReason.replace(/"/g, '""')}"`
    );
  });

  lines.push(
    `"TOTAL:","Consolidated Administrative Budget",${forecast.fy2026.totalAllotment.toFixed(2)},"-",${forecast.fy2027.totalRecommendedAllotment.toFixed(2)},"${forecast.fy2027.changePct.toFixed(2)}%",${forecast.fy2027.totalQuarterlyTarget.toFixed(2)},${forecast.fy2028.totalRecommendedAllotment.toFixed(2)},"${forecast.fy2028.changePct.toFixed(2)}%",${forecast.fy2028.totalQuarterlyTarget.toFixed(2)},"Right-sized multi-year budget plan"`
  );
  lines.push('');

  // 3. QUARTERLY EXECUTION ROADMAP
  lines.push('"SECTION 3: QUARTERLY DISBURSEMENT ABSORPTION TARGETS (FY 2027 & FY 2028)"');
  lines.push('"Fiscal Year","Q1 Target (Jan-Mar) (₱)","Q2 Target (Apr-Jun) (₱)","Q3 Target (Jul-Sep) (₱)","Q4 Target (Oct-Dec) (₱)","Annual Total (₱)"');
  lines.push(`"FY 2027 Proposed",${forecast.fy2027.totalQuarterlyTarget.toFixed(2)},${forecast.fy2027.totalQuarterlyTarget.toFixed(2)},${forecast.fy2027.totalQuarterlyTarget.toFixed(2)},${forecast.fy2027.totalQuarterlyTarget.toFixed(2)},${forecast.fy2027.totalRecommendedAllotment.toFixed(2)}`);
  lines.push(`"FY 2028 Proposed",${forecast.fy2028.totalQuarterlyTarget.toFixed(2)},${forecast.fy2028.totalQuarterlyTarget.toFixed(2)},${forecast.fy2028.totalQuarterlyTarget.toFixed(2)},${forecast.fy2028.totalQuarterlyTarget.toFixed(2)},${forecast.fy2028.totalRecommendedAllotment.toFixed(2)}`);

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `RAMS_MultiYear_Budget_Forecast_FY2026_2028_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
