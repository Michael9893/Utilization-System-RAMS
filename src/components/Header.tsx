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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Top bar: Agency Branding & Status */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 bg-blue-600/30 border border-blue-500/40 rounded-lg text-blue-400 mt-1">
              <Landmark className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                  Fiscal Year 2026 Approved WFP
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-mono">
                  ₱ Philippine Peso
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  RAMS Financial Management
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                Administrative Costs of RAMS
              </h1>
              <p className="text-sm text-slate-300">
                Work and Financial Plan (WFP) Allotment, Utilization & Disbursement Monitoring
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button
              id="btn-add-disbursement"
              onClick={onOpenAddModal}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>

            <button
              id="btn-manage-allotments"
              onClick={onOpenAllotmentModal}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Manage Categories & Approved Allotment Limits"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Allotments</span>
            </button>

            <button
              id="btn-whatif-simulator"
              onClick={onOpenWhatIfModal}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Budget Reallocation & Year-End Burn Forecast"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Budget Simulator</span>
            </button>

            {onOpenBills && (
              <button
                id="btn-header-bills"
                onClick={onOpenBills}
                className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer"
                title="View Next Bills Estimator & Upcoming Obligations Pipeline"
              >
                <CalendarClock className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Next Bills</span>
              </button>
            )}

            {onOpenForecast && (
              <button
                id="btn-header-forecast"
                onClick={onOpenForecast}
                className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer"
                title="View Multi-Year Utilization Needs & Budget Forecast (FY 2026-2028)"
              >
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="hidden sm:inline">Forecast & Projections</span>
              </button>
            )}

            <button
              id="btn-export-csv"
              onClick={onExportCSV}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Download CSV Spreadsheet"
            >
              <FileDown className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Export</span>
            </button>

            <button
              id="btn-print-report"
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Print Formal Report"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span className="hidden md:inline">Print</span>
            </button>

            <button
              id="btn-reset-data"
              onClick={onResetData}
              className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-700 transition-colors cursor-pointer"
              title="Reset to Initial WFP Baseline"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Summary KPI Ribbon */}
        <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
            <span className="text-xs text-slate-400 block font-medium">Approved Total Allotment (WFP)</span>
            <span className="text-xl font-bold text-white tracking-tight">{formatCurrency(totalAllotment)}</span>
            <span className="text-xs text-slate-400 block mt-0.5">6 Core Administrative Accounts</span>
          </div>

          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Total Amount Utilized</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                {formatPercent(totalPercentUtilized)}
              </span>
            </div>
            <span className="text-xl font-bold text-blue-400 tracking-tight">{formatCurrency(totalUtilized)}</span>
            <span className="text-xs text-slate-400 block mt-0.5">{transactionCount} Vouchers / Line Items</span>
          </div>

          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Unutilized Available Balance</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                {formatPercent(100 - totalPercentUtilized)}
              </span>
            </div>
            <span className="text-xl font-bold text-emerald-400 tracking-tight">{formatCurrency(totalUnutilized)}</span>
            <span className="text-xs text-slate-400 block mt-0.5">Remaining unencumbered budget</span>
          </div>

          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
            <span className="text-xs text-slate-400 block font-medium">Burn Rate Progress</span>
            <div className="mt-2 w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  totalPercentUtilized > 100
                    ? 'bg-rose-500'
                    : totalPercentUtilized > 75
                    ? 'bg-amber-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, totalPercentUtilized)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>Disbursed: {formatPercent(totalPercentUtilized)}</span>
              <span>Target Year-End: 100%</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
