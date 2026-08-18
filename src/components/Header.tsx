import React from 'react';
import { FileDown, Printer, Plus, SlidersHorizontal, RefreshCcw, Landmark, Layers, TrendingUp, CalendarClock } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/calculations';

interface HeaderProps {
  totalAllotment: number;
  totalUtilized: number;
  totalUnutilized: number;
  totalPercentUtilized: number;
  onOpenAddModal: () => void;
  onOpenAllotmentModal: () => void;
  onOpenWhatIfModal: () => void;
  onOpenBills?: () => void;
  onOpenForecast?: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
  transactionCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  totalAllotment,
  totalUtilized,
  totalUnutilized,
  totalPercentUtilized,
  onOpenAddModal,
  onOpenAllotmentModal,
  onOpenWhatIfModal,
  onOpenBills,
  onOpenForecast,
  onExportCSV,
  onResetData,
  transactionCount
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-5">
        {/* Top bar: Agency Branding & Status */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5 sm:gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 sm:p-2.5 bg-blue-600/30 border border-blue-500/40 rounded-lg text-blue-400 mt-0.5 shrink-0">
              <Landmark className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-blue-400 uppercase bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                  FY 2026 WFP
                </span>
                <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-mono">
                  ₱ Philippine Peso
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 hidden xs:inline">
                  RAMS Financial Management
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white mt-1 leading-tight">
                Administrative Costs of RAMS
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 line-clamp-1 sm:line-clamp-none">
                Work and Financial Plan (WFP) Allotment, Utilization & Disbursement Monitoring
              </p>
            </div>
          </div>

          {/* Action buttons with responsive horizontal touch scroll on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5 print:hidden -mx-1 px-1">
            <button
              id="btn-add-disbursement"
              onClick={onOpenAddModal}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 min-h-[40px] bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer shrink-0 touch-manipulation"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>

            <button
              id="btn-manage-allotments"
              onClick={onOpenAllotmentModal}
              className="inline-flex items-center space-x-1.5 px-3 py-2 min-h-[40px] bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 text-xs sm:text-sm font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer shrink-0 touch-manipulation"
              title="Manage Categories & Approved Allotment Limits"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Allotments</span>
            </button>

            <button
              id="btn-whatif-simulator"
              onClick={onOpenWhatIfModal}
              className="inline-flex items-center space-x-1.5 px-3 py-2 min-h-[40px] bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 text-xs sm:text-sm font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer shrink-0 touch-manipulation"
              title="Budget Reallocation & Year-End Burn Forecast"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <span className="hidden xs:inline">Simulator</span>
            </button>

            {onOpenBills && (
              <button
                id="btn-header-bills"
                onClick={onOpenBills}
                className="inline-flex items-center space-x-1.5 px-3 py-2 min-h-[40px] bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 text-xs sm:text-sm font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer shrink-0 touch-manipulation"
                title="View Next Bills Estimator & Upcoming Obligations Pipeline"
              >
                <CalendarClock className="w-4 h-4 text-emerald-400" />
                <span>Next Bills</span>
              </button>
            )}

            {onOpenForecast && (
              <button
                id="btn-header-forecast"
                onClick={onOpenForecast}
                className="inline-flex items-center space-x-1.5 px-3 py-2 min-h-[40px] bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 text-xs sm:text-sm font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer shrink-0 touch-manipulation"
                title="View Multi-Year Utilization Needs & Budget Forecast (FY 2026-2028)"
              >
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="hidden xs:inline">Forecast</span>
              </button>
            )}

            <button
              id="btn-export-csv"
              onClick={onExportCSV}
              className="inline-flex items-center space-x-1.5 px-3 py-2 min-h-[40px] bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 text-xs sm:text-sm font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer shrink-0 touch-manipulation"
              title="Download CSV Spreadsheet"
            >
              <FileDown className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              id="btn-print-report"
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-2 min-h-[40px] bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 text-xs sm:text-sm font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer shrink-0 touch-manipulation"
              title="Print Formal Report"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              id="btn-reset-data"
              onClick={onResetData}
              className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-amber-400 hover:bg-slate-800 active:bg-slate-700 rounded-lg border border-transparent hover:border-slate-700 transition-colors cursor-pointer shrink-0 touch-manipulation"
              title="Reset to Initial WFP Baseline"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Summary KPI Ribbon */}
        <div className="mt-4 sm:mt-5 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="bg-slate-800/90 rounded-lg p-2.5 sm:p-3 border border-slate-700 flex flex-col justify-between">
            <span className="text-[11px] sm:text-xs text-slate-400 block font-medium">Approved Allotment</span>
            <span className="text-base sm:text-xl font-bold text-white tracking-tight break-all">{formatCurrency(totalAllotment)}</span>
            <span className="text-[10px] sm:text-xs text-slate-400 block mt-0.5">6 Core Accounts</span>
          </div>

          <div className="bg-slate-800/90 rounded-lg p-2.5 sm:p-3 border border-slate-700 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">Utilized</span>
              <span className="text-[10px] sm:text-xs font-semibold px-1.5 py-0.2 rounded bg-blue-900/70 text-blue-300 border border-blue-700/50 shrink-0">
                {formatPercent(totalPercentUtilized)}
              </span>
            </div>
            <span className="text-base sm:text-xl font-bold text-blue-400 tracking-tight break-all">{formatCurrency(totalUtilized)}</span>
            <span className="text-[10px] sm:text-xs text-slate-400 block mt-0.5">{transactionCount} Vouchers</span>
          </div>

          <div className="bg-slate-800/90 rounded-lg p-2.5 sm:p-3 border border-slate-700 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">Balance</span>
              <span className="text-[10px] sm:text-xs font-semibold px-1.5 py-0.2 rounded bg-emerald-900/70 text-emerald-300 border border-emerald-700/50 shrink-0">
                {formatPercent(100 - totalPercentUtilized)}
              </span>
            </div>
            <span className="text-base sm:text-xl font-bold text-emerald-400 tracking-tight break-all">{formatCurrency(totalUnutilized)}</span>
            <span className="text-[10px] sm:text-xs text-slate-400 block mt-0.5">Unencumbered</span>
          </div>

          <div className="bg-slate-800/90 rounded-lg p-2.5 sm:p-3 border border-slate-700 col-span-2 lg:col-span-1 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium">Burn Rate Progress</span>
              <span className="text-[11px] sm:text-xs font-bold text-slate-300">{formatPercent(totalPercentUtilized)}</span>
            </div>
            <div className="mt-1.5 w-full bg-slate-700 rounded-full h-2 sm:h-2.5 overflow-hidden">
              <div
                className={`h-2 sm:h-2.5 rounded-full transition-all duration-500 ${
                  totalPercentUtilized > 100
                    ? 'bg-rose-500'
                    : totalPercentUtilized > 75
                    ? 'bg-amber-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, totalPercentUtilized)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] sm:text-[11px] text-slate-400 mt-1">
              <span>Disbursed: {formatPercent(totalPercentUtilized)}</span>
              <span>Target: 100%</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

