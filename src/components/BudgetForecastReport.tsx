import React, { useState, useMemo } from 'react';
import { ExpenseCategory, LedgerItem, CategorySummary } from '../types';
import {
  calculateMultiYearForecast,
  exportMultiYearForecastCSV,
  DEFAULT_FORECAST_OPTIONS,
  ForecastOptions
} from '../utils/forecastCalculations';
import { formatCurrency, formatPercent } from '../utils/calculations';
import {
  TrendingUp,
  Calendar,
  Layers,
  ArrowRight,
  FileDown,
  Printer,
  Info,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Clock,
  Sparkles,
  Sliders,
  DollarSign
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface BudgetForecastReportProps {
  categories: ExpenseCategory[];
  ledgerItems: LedgerItem[];
  summaries: CategorySummary[];
}

export const BudgetForecastReport: React.FC<BudgetForecastReportProps> = ({
  categories,
  ledgerItems,
  summaries
}) => {
  const [options, setOptions] = useState<ForecastOptions>(DEFAULT_FORECAST_OPTIONS);
  const [reportSubTab, setReportSubTab] = useState<'all' | 'fy2026' | 'multiyear' | 'quarterly'>('all');
  const [selectedForecastCode, setSelectedForecastCode] = useState<string>('');

  const forecast = useMemo(() => {
    return calculateMultiYearForecast(categories, ledgerItems, summaries, options);
  }, [categories, ledgerItems, summaries, options]);

  // Chart data for Multi-Year Budget Comparison
  const chartData = useMemo(() => {
    return forecast.categories.map((c) => ({
      code: c.code,
      name: c.name,
      'FY 2026 Allotment': c.fy2026Allotment,
      'FY 2026 Utilized (7m)': c.fy2026Utilized,
      'FY 2027 Proposed': c.fy2027RecommendedAllotment,
      'FY 2028 Proposed': c.fy2028RecommendedAllotment
    }));
  }, [forecast]);

  // Chart data for Monthly Burn vs Needed Burn (Aug-Dec)
  const burnComparisonData = useMemo(() => {
    return forecast.categories.map((c) => {
      const pastMonthlyAvg = c.fy2026Utilized / 7;
      return {
        code: c.code,
        'Actual Monthly Burn (Jan-Jul)': Math.round(pastMonthlyAvg),
        'Needed Monthly Burn (Aug-Dec)': Math.round(c.fy2026MonthlyNeededBurn)
      };
    });
  }, [forecast]);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    exportMultiYearForecastCSV(forecast);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'deficit_risk':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <Flame className="w-3 h-3 mr-1 text-rose-600" /> Exhausted / Needs Increase
          </span>
        );
      case 'surplus_risk':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" /> High Surplus / Right-size
          </span>
        );
      case 'fully_utilized':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <CheckCircle2 className="w-3 h-3 mr-1 text-purple-600" /> 100% Bulk Procurement
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Normal Steady Burn
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Header Card */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
                Multi-Year Budget Intelligence
              </span>
              <span className="text-xs text-slate-400">
                Strategic WFP Forecasting & Utilization Plan
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mt-1 text-white tracking-tight">
              RAMS Needed Utilization & Multi-Year Budget Forecast
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Calculates remaining 5-month burn targets for FY 2026 and projects required budget allotments for the next two fiscal years (FY 2027 & FY 2028) based on actual disbursement run-rates and historical absorption patterns.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 print:hidden">
            <button
              id="btn-forecast-export-csv"
              onClick={handleExport}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              title="Download Budget Forecast CSV"
            >
              <FileDown className="w-4 h-4" />
              <span>Export Forecast CSV</span>
            </button>

            <button
              id="btn-forecast-print"
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Print Multi-Year Forecast Report"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        {/* Interactive Parameter Control Ribbon */}
        <div className="mt-6 pt-5 border-t border-slate-800/90 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5 flex items-center space-x-1">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>FY 2026 Target Utilization Rate</span>
            </label>
            <select
              value={options.targetYearEndUtilPct}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  targetYearEndUtilPct: parseFloat(e.target.value) || 100
                }))
              }
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={100}>100% Full Budget Absorption (Standard WFP Target)</option>
              <option value={95}>95% High Utilization Threshold</option>
              <option value={90}>90% Moderate Utilization Baseline</option>
              <option value={85}>85% Conservative Target</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5 flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Annual Inflation & Growth Buffer</span>
            </label>
            <select
              value={options.inflationRate}
              onChange={(e) =>
                setOptions((prev) => ({
                  ...prev,
                  inflationRate: parseFloat(e.target.value) || 0.06
                }))
              }
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={0.03}>+3.0% (Low Inflation Indexation)</option>
              <option value={0.06}>+6.0% (Standard Government Baseline)</option>
              <option value={0.08}>+8.0% (Moderate Cost Escalation)</option>
              <option value={0.10}>+10.0% (High Expansion / Fuel & Tariff)</option>
              <option value={0.15}>+15.0% (Aggressive Activity Growth)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5 flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Filter Account Rationale</span>
            </label>
            <select
              value={selectedForecastCode}
              onChange={(e) => setSelectedForecastCode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All 6 Expense Codes</option>
              {forecast.categories.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Timeframe Mode</span>
            </label>
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
              <button
                onClick={() => setReportSubTab('all')}
                className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                  reportSubTab === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Comprehensive
              </button>
              <button
                onClick={() => setReportSubTab('fy2026')}
                className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                  reportSubTab === 'fy2026'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                FY2026
              </button>
              <button
                onClick={() => setReportSubTab('multiyear')}
                className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                  reportSubTab === 'multiyear'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                FY27-28
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Top Level Multi-Year Summary Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: FY 2026 Remaining Needed Utilization */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              FY 2026 Needed Burn
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px] font-bold">
              5 Mos Remaining
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
            {formatCurrency(forecast.fy2026.totalNeededBurnMonthly * forecast.fy2026.remainingMonths)}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Required Monthly:</span>
            <span className="font-mono font-bold text-blue-700">
              {formatCurrency(forecast.fy2026.totalNeededBurnMonthly)}/mo
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Needed between Aug 1 - Dec 31, 2026 to reach {forecast.targetYearEndUtilPct}% WFP utilization.
          </p>
        </div>

        {/* Card 2: FY 2027 Proposed Budget */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              FY 2027 Recommended
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                forecast.fy2027.changePct <= 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-indigo-100 text-indigo-800'
              }`}
            >
              {forecast.fy2027.changePct >= 0 ? '+' : ''}
              {forecast.fy2027.changePct.toFixed(1)}% vs FY26
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-indigo-900">
            {formatCurrency(forecast.fy2027.totalRecommendedAllotment)}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Quarterly Absorption:</span>
            <span className="font-mono font-bold text-indigo-700">
              {formatCurrency(forecast.fy2027.totalQuarterlyTarget)}/Qtr
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Right-sized proposal based on actual burn run-rate + {(forecast.inflationRate * 100).toFixed(0)}% buffer.
          </p>
        </div>

        {/* Card 3: FY 2028 Proposed Budget */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              FY 2028 Projected
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[11px] font-bold">
              +{forecast.fy2028.changePct.toFixed(1)}% vs FY27
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-purple-900">
            {formatCurrency(forecast.fy2028.totalRecommendedAllotment)}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Quarterly Absorption:</span>
            <span className="font-mono font-bold text-purple-700">
              {formatCurrency(forecast.fy2028.totalQuarterlyTarget)}/Qtr
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Compounded multi-year projection for medium-term expenditure framework (MTEF).
          </p>
        </div>

        {/* Card 4: Strategic Reallocation & Efficiency Gain */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Surplus Reallocation
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
              Efficiency Gain
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-800">
            {formatCurrency(Math.max(0, forecast.fy2026.totalAllotment - forecast.fy2027.totalRecommendedAllotment))}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Augmented Accounts:</span>
            <span className="font-semibold text-slate-800">TEV (+118%), CS (+20%)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Funds saved from over-budgeted accounts (PS) redirected to critical operational lines.
          </p>
        </div>
      </div>

      {/* Visual Forecasting Charts Section */}
      {(reportSubTab === 'all' || reportSubTab === 'multiyear') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Chart 1: Multi-Year Allotment Comparison */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Multi-Year Budget Comparison (FY 2026 vs FY 2027 vs FY 2028)
                  </h3>
                  <span className="text-xs text-slate-500">Allotment in Philippine Peso (₱)</span>
                </div>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="code"
                    tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      formatCurrency(Number(value)),
                      name
                    ]}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontSize: '12px',
                      border: 'none'
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                    iconType="circle"
                  />
                  <Bar dataKey="FY 2026 Allotment" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="FY 2027 Proposed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="FY 2028 Proposed" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Monthly Burn Run-Rate vs Needed Monthly Burn */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Past Burn vs Needed Burn (Aug-Dec 2026)
                  </h3>
                  <span className="text-xs text-slate-500">Monthly Burn Requirement in Philippine Peso (₱/mo)</span>
                </div>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={burnComparisonData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="code"
                    tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      formatCurrency(Number(value)) + '/month',
                      name
                    ]}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontSize: '12px',
                      border: 'none'
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                    iconType="circle"
                  />
                  <Bar
                    dataKey="Actual Monthly Burn (Jan-Jul)"
                    fill="#0284c7"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Needed Monthly Burn (Aug-Dec)"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: Current Year (FY 2026) Needed Utilization Plan (Aug - Dec) */}
      {(reportSubTab === 'all' || reportSubTab === 'fy2026') && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                  FY 2026 Target Plan
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Required Remaining Utilization Plan (August – December 2026)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Target utilization: {forecast.targetYearEndUtilPct}% of WFP Allotment across 5 remaining months
              </p>
            </div>

            <div className="text-xs text-slate-600 font-medium">
              Total Remaining Burn Needed:{' '}
              <span className="font-bold text-blue-700 font-mono">
                {formatCurrency(forecast.fy2026.totalNeededBurnMonthly * forecast.fy2026.remainingMonths)}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-3 w-16">Code</th>
                  <th className="py-3 px-4">Expense Account</th>
                  <th className="py-3 px-4 text-right">FY26 Allotment (₱)</th>
                  <th className="py-3 px-4 text-right">Utilized (Jan-Jul) (₱)</th>
                  <th className="py-3 px-4 text-center">% Utilized</th>
                  <th className="py-3 px-4 text-right">Unutilized (₱)</th>
                  <th className="py-3 px-4 text-right font-bold text-blue-900 bg-blue-50/70">
                    Needed Burn (Aug-Dec) (₱)
                  </th>
                  <th className="py-3 px-4 text-right font-bold text-blue-900 bg-blue-50/70">
                    Monthly Target (₱/mo)
                  </th>
                  <th className="py-3 px-4 text-center">Status & Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {forecast.categories.map((c) => {
                  const isFiltered = selectedForecastCode && selectedForecastCode !== c.code;
                  if (isFiltered) return null;

                  return (
                    <tr key={c.code} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold">
                        <span
                          className="inline-block px-2 py-0.5 rounded text-xs"
                          style={{
                            backgroundColor: `${c.color}15`,
                            color: c.color,
                            border: `1px solid ${c.color}40`
                          }}
                        >
                          {c.code}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-900">
                        {c.name}
                        <span className="block text-[11px] text-slate-400 font-normal">
                          {c.recommendationReason}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-800">
                        {formatCurrency(c.fy2026Allotment)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">
                        {formatCurrency(c.fy2026Utilized)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                            c.fy2026CurrentPct >= 100
                              ? 'bg-purple-100 text-purple-800'
                              : c.fy2026CurrentPct > 40
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {formatPercent(c.fy2026CurrentPct)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-700">
                        {formatCurrency(c.fy2026Unutilized)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-blue-700 bg-blue-50/40">
                        {formatCurrency(c.fy2026RemainingNeeded)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-indigo-700 bg-blue-50/40">
                        {formatCurrency(c.fy2026MonthlyNeededBurn)}
                        <span className="text-[10px] text-slate-400 block font-normal">/mo (5 mos)</span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(c.burnRateStatus)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Totals */}
              <tfoot>
                <tr className="bg-slate-900 text-white font-bold text-xs sm:text-sm">
                  <td className="py-3.5 px-3 font-mono text-blue-300">TOTAL:</td>
                  <td className="py-3.5 px-4 text-white">Consolidated FY 2026 Requirements</td>
                  <td className="py-3.5 px-4 text-right font-mono text-white">
                    {formatCurrency(forecast.fy2026.totalAllotment)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-blue-300">
                    {formatCurrency(forecast.fy2026.totalUtilized)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-200 text-xs font-bold border border-blue-800">
                      {formatPercent(forecast.fy2026.percentUtilized)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-300">
                    {formatCurrency(forecast.fy2026.totalUnutilized)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-400 bg-slate-800 text-base">
                    {formatCurrency(forecast.fy2026.totalNeededBurnMonthly * forecast.fy2026.remainingMonths)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-amber-300 bg-slate-800 text-base">
                    {formatCurrency(forecast.fy2026.totalNeededBurnMonthly)}
                  </td>
                  <td className="py-3.5 px-4 text-center text-xs text-slate-300">
                    Target: {forecast.targetYearEndUtilPct}% WFP
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: Next 2 Years Budget Proposals (FY 2027 & FY 2028) */}
      {(reportSubTab === 'all' || reportSubTab === 'multiyear') && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-bold rounded">
                  Next 2 Years Budget Plan
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Recommended Budget Allocations & Allotments (FY 2027 & FY 2028)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Right-sized proposed allotments calculated from actual 7-month run rates, demand trends, and {(forecast.inflationRate * 100).toFixed(0)}% annual buffer
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <span className="text-slate-500">FY 2027: <strong className="text-indigo-700 font-mono">{formatCurrency(forecast.fy2027.totalRecommendedAllotment)}</strong></span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500">FY 2028: <strong className="text-purple-700 font-mono">{formatCurrency(forecast.fy2028.totalRecommendedAllotment)}</strong></span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-3 w-16">Code</th>
                  <th className="py-3 px-4">Expense Account</th>
                  <th className="py-3 px-4 text-right">FY26 Baseline (₱)</th>
                  <th className="py-3 px-4 text-right">Annualized Run-Rate (₱)</th>
                  <th className="py-3 px-4 text-right font-bold text-indigo-900 bg-indigo-50/60">
                    FY 2027 Proposed (₱)
                  </th>
                  <th className="py-3 px-4 text-center font-bold text-indigo-900 bg-indigo-50/60">
                    FY27 vs FY26
                  </th>
                  <th className="py-3 px-4 text-right font-bold text-indigo-900 bg-indigo-50/60">
                    FY27 Quarterly (₱)
                  </th>
                  <th className="py-3 px-4 text-right font-bold text-purple-900 bg-purple-50/60">
                    FY 2028 Projected (₱)
                  </th>
                  <th className="py-3 px-4 text-center font-bold text-purple-900 bg-purple-50/60">
                    FY28 vs FY27
                  </th>
                  <th className="py-3 px-4 text-right font-bold text-purple-900 bg-purple-50/60">
                    FY28 Quarterly (₱)
                  </th>
                  <th className="py-3 px-4 min-w-[220px]">Budget Justification Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {forecast.categories.map((c) => {
                  const isFiltered = selectedForecastCode && selectedForecastCode !== c.code;
                  if (isFiltered) return null;

                  return (
                    <tr key={c.code} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold">
                        <span
                          className="inline-block px-2 py-0.5 rounded text-xs"
                          style={{
                            backgroundColor: `${c.color}15`,
                            color: c.color,
                            border: `1px solid ${c.color}40`
                          }}
                        >
                          {c.code}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {c.name}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        {formatCurrency(c.fy2026Allotment)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-800">
                        {formatCurrency(c.annualizedRunRate)}
                      </td>

                      {/* FY 2027 Columns */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-indigo-700 bg-indigo-50/30">
                        {formatCurrency(c.fy2027RecommendedAllotment)}
                      </td>

                      <td className="py-3 px-4 text-center bg-indigo-50/30">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                            c.fy2027ChangeFrom2026Pct > 0
                              ? 'bg-rose-100 text-rose-800'
                              : c.fy2027ChangeFrom2026Pct < 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {c.fy2027ChangeFrom2026Pct > 0 ? '+' : ''}
                          {c.fy2027ChangeFrom2026Pct.toFixed(1)}%
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-xs font-semibold text-slate-700 bg-indigo-50/30">
                        {formatCurrency(c.fy2027QuarterlyTarget)}
                      </td>

                      {/* FY 2028 Columns */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-purple-700 bg-purple-50/30">
                        {formatCurrency(c.fy2028RecommendedAllotment)}
                      </td>

                      <td className="py-3 px-4 text-center bg-purple-50/30">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800">
                          +{c.fy2028ChangeFrom2027Pct.toFixed(1)}%
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-xs font-semibold text-slate-700 bg-purple-50/30">
                        {formatCurrency(c.fy2028QuarterlyTarget)}
                      </td>

                      <td className="py-3 px-4 text-xs text-slate-600 leading-relaxed">
                        {c.recommendationReason}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Totals */}
              <tfoot>
                <tr className="bg-slate-900 text-white font-bold text-xs sm:text-sm">
                  <td className="py-3.5 px-3 font-mono text-indigo-300">TOTAL:</td>
                  <td className="py-3.5 px-4 text-white">Consolidated Proposed Budget</td>
                  <td className="py-3.5 px-4 text-right font-mono text-white">
                    {formatCurrency(forecast.fy2026.totalAllotment)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-300">—</td>

                  {/* FY 2027 Totals */}
                  <td className="py-3.5 px-4 text-right font-mono text-indigo-300 bg-slate-800 text-base">
                    {formatCurrency(forecast.fy2027.totalRecommendedAllotment)}
                  </td>
                  <td className="py-3.5 px-4 text-center bg-slate-800">
                    <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-200 text-xs font-bold border border-indigo-700">
                      {forecast.fy2027.changePct >= 0 ? '+' : ''}
                      {forecast.fy2027.changePct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-indigo-200 bg-slate-800 text-xs">
                    {formatCurrency(forecast.fy2027.totalQuarterlyTarget)}/Q
                  </td>

                  {/* FY 2028 Totals */}
                  <td className="py-3.5 px-4 text-right font-mono text-purple-300 bg-slate-800 text-base">
                    {formatCurrency(forecast.fy2028.totalRecommendedAllotment)}
                  </td>
                  <td className="py-3.5 px-4 text-center bg-slate-800">
                    <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-200 text-xs font-bold border border-purple-700">
                      +{forecast.fy2028.changePct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-purple-200 bg-slate-800 text-xs">
                    {formatCurrency(forecast.fy2028.totalQuarterlyTarget)}/Q
                  </td>

                  <td className="py-3.5 px-4 text-xs text-slate-300">
                    Aligned with Medium-Term Expenditure Framework (MTEF)
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: Quarterly Execution & Absorption Roadmap */}
      {(reportSubTab === 'all' || reportSubTab === 'quarterly') && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Quarterly Disbursement & Utilization Absorption Roadmap (FY 2027 – FY 2028)
              </h3>
              <p className="text-xs text-slate-500">
                Milestone targets per quarter to ensure a uniform ~25% quarterly burn rate and prevent year-end rush or procurement backlogs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* FY 2027 Milestones Card */}
            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                  Fiscal Year 2027 Quarterly Schedule
                </span>
                <span className="text-xs font-mono font-bold text-indigo-700">
                  Annual: {formatCurrency(forecast.fy2027.totalRecommendedAllotment)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-indigo-100 text-center">
                  <span className="text-slate-500 block text-[11px] font-medium">Q1 (Jan-Mar)</span>
                  <span className="font-mono font-bold text-indigo-800 text-sm block mt-0.5">
                    {formatCurrency(forecast.fy2027.totalQuarterlyTarget)}
                  </span>
                  <span className="text-[10px] text-slate-400">25.0% target</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-indigo-100 text-center">
                  <span className="text-slate-500 block text-[11px] font-medium">Q2 (Apr-Jun)</span>
                  <span className="font-mono font-bold text-indigo-800 text-sm block mt-0.5">
                    {formatCurrency(forecast.fy2027.totalQuarterlyTarget)}
                  </span>
                  <span className="text-[10px] text-slate-400">50.0% cumulative</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-indigo-100 text-center">
                  <span className="text-slate-500 block text-[11px] font-medium">Q3 (Jul-Sep)</span>
                  <span className="font-mono font-bold text-indigo-800 text-sm block mt-0.5">
                    {formatCurrency(forecast.fy2027.totalQuarterlyTarget)}
                  </span>
                  <span className="text-[10px] text-slate-400">75.0% cumulative</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-indigo-100 text-center">
                  <span className="text-slate-500 block text-[11px] font-medium">Q4 (Oct-Dec)</span>
                  <span className="font-mono font-bold text-indigo-800 text-sm block mt-0.5">
                    {formatCurrency(forecast.fy2027.totalQuarterlyTarget)}
                  </span>
                  <span className="text-[10px] text-slate-400">100.0% closed</span>
                </div>
              </div>

              <div className="p-2.5 bg-white/80 rounded-lg text-xs text-slate-600 border border-indigo-100">
                <span className="font-semibold text-indigo-900 block mb-0.5">Recommended Execution Plan:</span>
                • Q1: Execute upfront bulk supplies procurement (SC) & establish courier framework.<br />
                • Q2 & Q3: Implement regular field travel (TEV) & conduct Semestral RC Meeting (RE).<br />
                • Q4: Final reconciliation of courier billing and hauling requirements.
              </div>
            </div>

            {/* FY 2028 Milestones Card */}
            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-900">
                  Fiscal Year 2028 Quarterly Schedule
                </span>
                <span className="text-xs font-mono font-bold text-purple-700">
                  Annual: {formatCurrency(forecast.fy2028.totalRecommendedAllotment)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-purple-100 text-center">
                  <span className="text-slate-500 block text-[11px] font-medium">Q1 (Jan-Mar)</span>
                  <span className="font-mono font-bold text-purple-800 text-sm block mt-0.5">
                    {formatCurrency(forecast.fy2028.totalQuarterlyTarget)}
                  </span>
                  <span className="text-[10px] text-slate-400">25.0% target</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-purple-100 text-center">
                  <span className="text-slate-500 block text-[11px] font-medium">Q2 (Apr-Jun)</span>
                  <span className="font-mono font-bold text-purple-800 text-sm block mt-0.5">
                    {formatCurrency(forecast.fy2028.totalQuarterlyTarget)}
                  </span>
                  <span className="text-[10px] text-slate-400">50.0% cumulative</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-purple-100 text-center">
                  <span className="text-slate-500 block text-[11px] font-medium">Q3 (Jul-Sep)</span>
                  <span className="font-mono font-bold text-purple-800 text-sm block mt-0.5">
                    {formatCurrency(forecast.fy2028.totalQuarterlyTarget)}
                  </span>
                  <span className="text-[10px] text-slate-400">75.0% cumulative</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-purple-100 text-center">
                  <span className="text-slate-500 block text-[11px] font-medium">Q4 (Oct-Dec)</span>
                  <span className="font-mono font-bold text-purple-800 text-sm block mt-0.5">
                    {formatCurrency(forecast.fy2028.totalQuarterlyTarget)}
                  </span>
                  <span className="text-[10px] text-slate-400">100.0% closed</span>
                </div>
              </div>

              <div className="p-2.5 bg-white/80 rounded-lg text-xs text-slate-600 border border-purple-100">
                <span className="font-semibold text-purple-900 block mb-0.5">Strategic Alignment:</span>
                • Retains {(forecast.inflationRate * 100).toFixed(0)}% indexed buffers across logistics and operational materials.<br />
                • Maintains balanced disbursement pacing to prevent year-end unutilized balances.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: Strategic Recommendations & Executive Briefing */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-600/30 border border-blue-500/40 rounded-lg text-blue-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Strategic Executive Findings & Budget Planning Directives for RAMS
            </h3>
            <p className="text-xs text-slate-300">
              Evidence-based insights derived from the approved consolidated WFP and disbursement ledger
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700 space-y-2">
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
              <Flame className="w-4 h-4" />
              <span>1. Travel Budget Augmentation (TEV)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Observation:</strong> The ₱4,585.00 allotment was completely exhausted by May 2026 (100% utilized in 5 months).<br />
              <strong>Directive:</strong> Increase TEV allotment to <strong>₱10,000.00</strong> in FY 2027 and <strong>₱12,000.00</strong> in FY 2028 to prevent operational field travel stoppages.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700 space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <DollarSign className="w-4 h-4" />
              <span>2. Postal Services Right-Sizing (PS)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Observation:</strong> Only ₱20,639.00 utilized out of ₱109,000.00 (18.9% utilization), leaving ₱88,361.00 idle.<br />
              <strong>Directive:</strong> Right-size PS allotment to <strong>₱50,000.00</strong> in FY 2027. This frees <strong>₱59,000.00</strong> for other high-demand administrative accounts.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700 space-y-2">
            <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>3. Semestral Meeting Timing (RE)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Observation:</strong> ₱60,000.00 is currently 0% utilized as the meeting is scheduled in the 2nd semester.<br />
              <strong>Directive:</strong> Ensure timely procurement of meeting venue and meals in Q3/Q4 2026. Propose <strong>₱65,000.00</strong> in FY 2027 and <strong>₱70,000.00</strong> in FY 2028.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>4. Courier Services Run-Rate (CS)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Observation:</strong> Regular monthly mailings average ~₱6,160.00/mo (₱43,125.00 in 7 months).<br />
              <strong>Directive:</strong> Recommend an allotment of <strong>₱90,000.00</strong> in FY 2027 and <strong>₱100,000.00</strong> in FY 2028, providing a safe 20% expansion headroom over actual annual demand.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700 space-y-2">
            <div className="flex items-center space-x-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>5. Office Supplies Scheduling (SC)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Observation:</strong> ₱42,000.00 utilized 100% via upfront single Purchase Request (PR).<br />
              <strong>Directive:</strong> Program procurement in Q1 of FY 2027 (<strong>₱46,000.00</strong>) and FY 2028 (<strong>₱50,000.00</strong>) to support uninterrupted packaging and inventory operations.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-700 space-y-2">
            <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>6. Consolidated WFP Optimization</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Summary:</strong> By right-sizing surplus accounts and augmenting under-funded accounts, the overall RAMS budget is optimized at <strong>₱325,000.00</strong> for FY 2027 and <strong>₱344,000.00</strong> for FY 2028.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
