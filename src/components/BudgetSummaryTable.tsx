import React, { useState } from 'react';
import { CategorySummary } from '../types';
import { formatCurrency, formatPercent } from '../utils/calculations';
import { AlertCircle, CheckCircle2, TrendingUp, Info, LayoutGrid, TableProperties, Edit3 } from 'lucide-react';

interface BudgetSummaryTableProps {
  summaries: CategorySummary[];
  totalAllotment: number;
  totalUtilized: number;
  totalUnutilized: number;
  totalPercentUtilized: number;
  totalPercentUnutilized: number;
  selectedCode: string;
  onSelectCode: (code: string) => void;
  onEditAllotment: (code: string) => void;
}

export const BudgetSummaryTable: React.FC<BudgetSummaryTableProps> = ({
  summaries,
  totalAllotment,
  totalUtilized,
  totalUnutilized,
  totalPercentUtilized,
  totalPercentUnutilized,
  selectedCode,
  onSelectCode,
  onEditAllotment
}) => {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'auto' | 'cards' | 'table'>('auto');

  const getStatusBadge = (percent: number, unutilized: number) => {
    if (unutilized < 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200 shrink-0">
          <AlertCircle className="w-3 h-3 mr-1 text-rose-600" /> Over Budget
        </span>
      );
    }
    if (percent >= 99.99) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800 border border-purple-200 shrink-0">
          <CheckCircle2 className="w-3 h-3 mr-1 text-purple-600" /> 100% Utilized
        </span>
      );
    }
    if (percent === 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
          <Info className="w-3 h-3 mr-1 text-slate-500" /> Unutilized (0%)
        </span>
      );
    }
    if (percent > 60) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
          <TrendingUp className="w-3 h-3 mr-1 text-amber-600" /> Active Burn
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span> Under Control
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header Bar */}
      <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
            Administrative Costs of RAMS per Approved Consolidated WFP
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time allotment vs amount utilized calculation & unutilized balance monitoring
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
          {/* View mode toggle */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 print:hidden">
            <button
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Card View (Optimized for Mobile)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Spreadsheet Table View"
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          {selectedCode && (
            <button
              onClick={() => onSelectCode('')}
              className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded transition-colors text-xs cursor-pointer"
            >
              Clear Filter ({selectedCode})
            </button>
          )}
        </div>
      </div>

      {/* MOBILE CARD VIEW: Visible when viewMode is 'cards' OR on small screens when viewMode is 'auto' */}
      <div
        className={`${
          viewMode === 'table'
            ? 'hidden'
            : viewMode === 'cards'
            ? 'block'
            : 'block md:hidden'
        } p-3.5 sm:p-4 space-y-3`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {summaries.map((item) => {
            const isSelected = selectedCode === item.code;
            return (
              <div
                key={item.code}
                onClick={() => onSelectCode(selectedCode === item.code ? '' : item.code)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50 shadow-sm ring-1 ring-blue-500/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {/* Card Top: Code & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className="px-2 py-0.5 rounded font-mono font-bold text-xs"
                      style={{
                        backgroundColor: `${item.color}15`,
                        color: item.color,
                        border: `1px solid ${item.color}40`
                      }}
                    >
                      {item.code}
                    </span>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                        {item.name}
                      </h3>
                      <span className="text-[10px] text-slate-400">
                        {item.transactionCount} vouchers
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    {getStatusBadge(item.percentUtilized, item.unutilizedAmount)}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditAllotment(item.code);
                      }}
                      className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit Allotment"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-500 font-medium">Burn Rate:</span>
                    <span className="font-bold font-mono" style={{ color: item.color }}>
                      {formatPercent(item.percentUtilized)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, item.percentUtilized)}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>

                {/* Metrics 2x2 Grid */}
                <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <span className="text-[10px] text-slate-500 block">Allotment (WFP)</span>
                    <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                      {formatCurrency(item.allotment)}
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-2">
                    <span className="text-[10px] text-slate-500 block">Utilized</span>
                    <span className="font-mono font-bold text-blue-700 text-xs sm:text-sm">
                      {formatCurrency(item.amountUtilized)}
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-2">
                    <span className="text-[10px] text-slate-500 block">Unutilized Balance</span>
                    <span
                      className={`font-mono font-bold text-xs sm:text-sm ${
                        item.unutilizedAmount < 0
                          ? 'text-rose-600'
                          : item.unutilizedAmount === 0
                          ? 'text-slate-400'
                          : 'text-emerald-700'
                      }`}
                    >
                      {formatCurrency(item.unutilizedAmount)}
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-2">
                    <span className="text-[10px] text-slate-500 block">% Un-utilized</span>
                    <span className="font-mono font-bold text-slate-700 text-xs sm:text-sm">
                      {formatPercent(item.percentUnutilized)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Total Summary Card */}
        <div className="p-3.5 rounded-xl bg-slate-900 text-white shadow-sm mt-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-blue-300 uppercase tracking-wider font-semibold block">
                Consolidated WFP Total
              </span>
              <span className="text-lg font-bold text-white tracking-tight">
                {formatCurrency(totalAllotment)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-300 block">Disbursed ({formatPercent(totalPercentUtilized)})</span>
              <span className="text-lg font-bold text-blue-400">
                {formatCurrency(totalUtilized)}
              </span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-300">Net Unutilized Balance:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {formatCurrency(totalUnutilized)}
            </span>
          </div>
        </div>
      </div>

      {/* DESKTOP TABLE VIEW: Visible when viewMode is 'table' OR on desktop when viewMode is 'auto' */}
      <div
        className={`${
          viewMode === 'cards'
            ? 'hidden'
            : viewMode === 'table'
            ? 'block'
            : 'hidden md:block'
        } overflow-x-auto`}
      >
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100/90 text-slate-700 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
              <th className="py-3 px-4 w-20">Code</th>
              <th className="py-3 px-4">Type of Expense</th>
              <th className="py-3 px-4 text-right">Allotment (per WFP) (₱)</th>
              <th className="py-3 px-4 text-right">Amount Utilized (₱)</th>
              <th className="py-3 px-4 text-center">% of Utilization</th>
              <th className="py-3 px-4 text-right">Unutilized Amount (₱)</th>
              <th className="py-3 px-4 text-center">% of Un-utilized</th>
              <th className="py-3 px-4 text-center w-36">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {summaries.map((item) => {
              const isSelected = selectedCode === item.code;
              const isHovered = hoveredCode === item.code;

              return (
                <tr
                  key={item.code}
                  onMouseEnter={() => setHoveredCode(item.code)}
                  onMouseLeave={() => setHoveredCode(null)}
                  onClick={() => onSelectCode(selectedCode === item.code ? '' : item.code)}
                  className={`transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 font-medium'
                      : isHovered
                      ? 'bg-slate-50'
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-xs"
                      style={{
                        backgroundColor: `${item.color}15`,
                        color: item.color,
                        borderColor: `${item.color}40`,
                        borderWidth: 1
                      }}
                    >
                      {item.code}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-900 font-medium">
                    <div className="flex items-center space-x-1.5">
                      <span>{item.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditAllotment(item.code);
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:opacity-100 text-xs text-slate-400 hover:text-blue-600 px-1 py-0.5 rounded ml-1"
                        title="Adjust Allotment"
                      >
                        ✎
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-400 block font-normal">
                      {item.transactionCount} recorded disbursements
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-medium text-slate-900">
                    {formatCurrency(item.allotment)}
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">
                    {formatCurrency(item.amountUtilized)}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          item.percentUtilized >= 100
                            ? 'bg-purple-100 text-purple-800'
                            : item.percentUtilized > 40
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {formatPercent(item.percentUtilized)}
                      </span>
                      <div className="w-16 bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${Math.min(100, item.percentUtilized)}%`,
                            backgroundColor: item.color
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-medium text-slate-700">
                    <span
                      className={
                        item.unutilizedAmount < 0
                          ? 'text-rose-600 font-bold'
                          : item.unutilizedAmount === 0
                          ? 'text-slate-400'
                          : 'text-emerald-700'
                      }
                    >
                      {formatCurrency(item.unutilizedAmount)}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center text-xs font-medium text-slate-600">
                    {formatPercent(item.percentUnutilized)}
                  </td>

                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(item.percentUtilized, item.unutilizedAmount)}
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Consolidated Totals Row */}
          <tfoot>
            <tr className="bg-slate-800 text-white font-semibold border-t-2 border-slate-700 text-sm">
              <td className="py-3.5 px-4 font-mono text-blue-300">TOTAL:</td>
              <td className="py-3.5 px-4 text-white">Consolidated Administrative WFP</td>
              <td className="py-3.5 px-4 text-right font-mono text-white text-base">
                {formatCurrency(totalAllotment)}
              </td>
              <td className="py-3.5 px-4 text-right font-mono text-blue-300 text-base">
                {formatCurrency(totalUtilized)}
              </td>
              <td className="py-3.5 px-4 text-center">
                <span className="inline-block px-2.5 py-1 rounded bg-blue-900/90 text-blue-200 text-xs font-bold border border-blue-600/50">
                  {formatPercent(totalPercentUtilized)}
                </span>
              </td>
              <td className="py-3.5 px-4 text-right font-mono text-emerald-300 text-base">
                {formatCurrency(totalUnutilized)}
              </td>
              <td className="py-3.5 px-4 text-center text-xs text-slate-300">
                {formatPercent(totalPercentUnutilized)}
              </td>
              <td className="py-3.5 px-4 text-center text-xs text-slate-300">
                <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-200 border border-slate-600">
                  Active (FY 2026)
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

