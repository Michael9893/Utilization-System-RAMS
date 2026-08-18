import React, { useState } from 'react';
import { ExpenseCategory, CategorySummary } from '../types';
import { formatCurrency, formatPercent } from '../utils/calculations';
import { X, ArrowRight, TrendingUp, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface WhatIfScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ExpenseCategory[];
  summaries: CategorySummary[];
  totalAllotment: number;
  totalUtilized: number;
}

export const WhatIfScenarioModal: React.FC<WhatIfScenarioModalProps> = ({
  isOpen,
  onClose,
  categories,
  summaries,
  totalAllotment,
  totalUtilized
}) => {
  // Reallocation simulator
  const [sourceCode, setSourceCode] = useState(categories[1]?.code || 'RE');
  const [targetCode, setTargetCode] = useState(categories[5]?.code || 'CS');
  const [transferAmount, setTransferAmount] = useState('20000');

  if (!isOpen) return null;

  const numTransfer = Math.max(0, parseFloat(transferAmount) || 0);

  // 7 months recorded (Jan-Jul)
  const elapsedMonths = 7;
  const remainingMonths = 5;
  const monthlyAverageBurn = totalUtilized / elapsedMonths;
  const projectedYearEndDisbursements = totalUtilized + monthlyAverageBurn * remainingMonths;
  const projectedSurplus = totalAllotment - projectedYearEndDisbursements;

  const sourceSummary = summaries.find((s) => s.code === sourceCode);
  const targetSummary = summaries.find((s) => s.code === targetCode);

  const sourceRemaining = (sourceSummary?.unutilizedAmount || 0) - numTransfer;
  const targetNewAllotment = (targetSummary?.allotment || 0) + numTransfer;
  const targetNewRemaining = targetNewAllotment - (targetSummary?.amountUtilized || 0);
  const targetNewPercentUtilized =
    targetNewAllotment > 0
      ? ((targetSummary?.amountUtilized || 0) / targetNewAllotment) * 100
      : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-600/40 text-blue-400 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">WFP Budget Forecasting & Reallocation Simulator</h3>
              <p className="text-xs text-slate-300">
                Strategic recalculation, fund realignment, and year-end burn rate forecasting
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Year-End Run-Rate Projections */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Annual Run-Rate & Year-End Forecast (Based on Jan–Jul 2026 Actuals)
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-500 block font-medium">Monthly Avg Burn</span>
                <span className="text-sm sm:text-base font-mono font-bold text-slate-900">
                  {formatCurrency(monthlyAverageBurn)}
                </span>
                <span className="text-[10px] text-slate-400 block">Jan-Jul average</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-500 block font-medium">Aug-Dec Projected</span>
                <span className="text-sm sm:text-base font-mono font-semibold text-blue-600">
                  {formatCurrency(monthlyAverageBurn * remainingMonths)}
                </span>
                <span className="text-[10px] text-slate-400 block">5 remaining months</span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-500 block font-medium">Projected Year-End Total</span>
                <span className="text-sm sm:text-base font-mono font-bold text-indigo-700">
                  {formatCurrency(projectedYearEndDisbursements)}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {formatPercent((projectedYearEndDisbursements / totalAllotment) * 100)} of WFP
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[11px] text-slate-500 block font-medium">Forecasted Surplus</span>
                <span
                  className={`text-sm sm:text-base font-mono font-bold ${
                    projectedSurplus >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {formatCurrency(projectedSurplus)}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  {projectedSurplus >= 0 ? 'Savings anticipated' : 'Deficit alert'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Account Reallocation Sandbox */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">
              Simulate Account-to-Account Allotment Transfer
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Model realigning unutilized allotments from under-spent accounts (e.g., Semestral RC Meeting or Postal) to high-utilization accounts.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              {/* Source Account */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Source Account (From)
                </label>
                <select
                  value={sourceCode}
                  onChange={(e) => setSourceCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((c) => {
                    const s = summaries.find((x) => x.code === c.code);
                    return (
                      <option key={c.code} value={c.code}>
                        {c.code} (Available: {formatCurrency(s?.unutilizedAmount || 0)})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Transfer Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Transfer Amount (₱)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Destination Account */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Target Account (To)
                </label>
                <select
                  value={targetCode}
                  onChange={(e) => setTargetCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Simulation Results Preview */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase block mb-3">
                Projected Post-Transfer Balance Check:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Source Account Impact */}
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-slate-900">{sourceCode}</span>
                    <span className="text-xs text-slate-500">Source Account</span>
                  </div>
                  <div className="text-xs space-y-1 mt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Original Allotment:</span>
                      <span className="font-mono font-medium">
                        {formatCurrency(sourceSummary?.allotment || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-rose-600 font-medium">
                      <span>Deduction:</span>
                      <span className="font-mono">-{formatCurrency(numTransfer)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-100 font-bold">
                      <span>Projected Available:</span>
                      <span
                        className={`font-mono ${
                          sourceRemaining < 0 ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {formatCurrency(sourceRemaining)}
                      </span>
                    </div>
                  </div>
                  {sourceRemaining < 0 && (
                    <div className="mt-2 text-[11px] text-rose-600 flex items-center space-x-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Exceeds available balance of {sourceCode}!</span>
                    </div>
                  )}
                </div>

                {/* Target Account Impact */}
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-slate-900">{targetCode}</span>
                    <span className="text-xs text-slate-500">Target Account</span>
                  </div>
                  <div className="text-xs space-y-1 mt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Original Allotment:</span>
                      <span className="font-mono font-medium">
                        {formatCurrency(targetSummary?.allotment || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Augmentation:</span>
                      <span className="font-mono">+{formatCurrency(numTransfer)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">New Total Allotment:</span>
                      <span className="font-mono font-bold text-blue-700">
                        {formatCurrency(targetNewAllotment)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-100 font-bold">
                      <span>New Available Headroom:</span>
                      <span className="font-mono text-emerald-700">
                        {formatCurrency(targetNewRemaining)} ({formatPercent(targetNewPercentUtilized)} utilized)
                      </span>
                    </div>
                  </div>
                  {targetNewRemaining >= 0 && (
                    <div className="mt-2 text-[11px] text-emerald-700 flex items-center space-x-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Provides sufficient headroom for Q3/Q4 demand</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Note: Simulations are virtual models and do not overwrite baseline data unless saved via Allotments menu.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
