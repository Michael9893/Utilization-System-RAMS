import React from 'react';
import { RGASS_BENCHMARK } from '../data/initialData';
import { formatCurrency, formatPercent } from '../utils/calculations';
import { Target, TrendingDown, Scale } from 'lucide-react';

interface BenchmarkCardsProps {
  currentTotalAllotment: number;
  currentTotalUtilized: number;
}

export const BenchmarkCards: React.FC<BenchmarkCardsProps> = ({
  currentTotalAllotment,
  currentTotalUtilized
}) => {
  const standard = RGASS_BENCHMARK.standard;
  const adjusted = RGASS_BENCHMARK.adjusted;

  // Variances against current Consolidated WFP Allotment
  const diffAllotmentStandard = currentTotalAllotment - standard.allotment;
  const diffAllotmentAdjusted = currentTotalAllotment - adjusted.allotment;

  // Variances against current Total Utilized
  const diffUtilizedStandard = currentTotalUtilized - standard.utilized;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Standard RGASS Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-0 opacity-60 pointer-events-none" />
        
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Benchmark Reference 1</span>
              <h3 className="text-base font-bold text-slate-900">{standard.name}</h3>
            </div>
          </div>

          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {formatPercent(standard.percentUtilized)} Utilized
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 relative z-10">
          <div>
            <span className="text-xs text-slate-500 block">Baseline Allotment</span>
            <span className="text-sm sm:text-base font-mono font-bold text-slate-900">
              {formatCurrency(standard.allotment)}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-500 block">Target Utilized</span>
            <span className="text-sm sm:text-base font-mono font-semibold text-blue-600">
              {formatCurrency(standard.utilized)}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-500 block">Target Unutilized</span>
            <span className="text-sm sm:text-base font-mono font-medium text-emerald-600">
              {formatCurrency(standard.unutilized)}
            </span>
            <span className="text-[10px] text-slate-400 block">({formatPercent(standard.percentUnutilized)})</span>
          </div>
        </div>

        <div className="mt-3.5 bg-slate-50 rounded-lg p-2.5 border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Scale className="w-4 h-4 text-slate-500" />
            <span>WFP Variance to Baseline:</span>
          </div>
          <span className="font-mono font-semibold text-blue-700">
            {diffAllotmentStandard >= 0 ? '+' : ''}{formatCurrency(diffAllotmentStandard)} ({((diffAllotmentStandard / standard.allotment) * 100).toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Adjusted RGASS Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-0 opacity-60 pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Benchmark Reference 2</span>
              <h3 className="text-base font-bold text-slate-900">{adjusted.name}</h3>
            </div>
          </div>

          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            {formatPercent(adjusted.percentUtilized)} Utilized
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 relative z-10">
          <div>
            <span className="text-xs text-slate-500 block">Adjusted Allotment</span>
            <span className="text-sm sm:text-base font-mono font-bold text-slate-900">
              {formatCurrency(adjusted.allotment)}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-500 block">Utilized (Ref)</span>
            <span className="text-sm sm:text-base font-mono font-semibold text-amber-600">
              {formatCurrency(adjusted.utilized)}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-500 block">Adjusted Unutilized</span>
            <span className="text-sm sm:text-base font-mono font-medium text-emerald-600">
              {formatCurrency(adjusted.unutilized)}
            </span>
            <span className="text-[10px] text-slate-400 block">({formatPercent(adjusted.percentUnutilized)})</span>
          </div>
        </div>

        <div className="mt-3.5 bg-slate-50 rounded-lg p-2.5 border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Scale className="w-4 h-4 text-slate-500" />
            <span>WFP Variance to Adjusted:</span>
          </div>
          <span className="font-mono font-semibold text-amber-700">
            {diffAllotmentAdjusted >= 0 ? '+' : ''}{formatCurrency(diffAllotmentAdjusted)} ({((diffAllotmentAdjusted / adjusted.allotment) * 100).toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
};
