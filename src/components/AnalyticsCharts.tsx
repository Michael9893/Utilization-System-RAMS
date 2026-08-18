import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { CategorySummary, LedgerItem } from '../types';
import { formatCurrency } from '../utils/calculations';
import { BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon } from 'lucide-react';

interface AnalyticsChartsProps {
  summaries: CategorySummary[];
  ledgerItems: LedgerItem[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  summaries,
  ledgerItems
}) => {
  // Monthly aggregation (Jan to Dec 2026)
  const monthlyData = useMemo(() => {
    const monthOrder = [
      'January 2026',
      'February 2026',
      'March 2026',
      'April 2026',
      'May 2026',
      'June 2026',
      'July 2026',
      'August 2026',
      'September 2026',
      'October 2026',
      'November 2026',
      'December 2026'
    ];

    const shortLabels: Record<string, string> = {
      'January 2026': 'Jan',
      'February 2026': 'Feb',
      'March 2026': 'Mar',
      'April 2026': 'Apr',
      'May 2026': 'May',
      'June 2026': 'Jun',
      'July 2026': 'Jul',
      'August 2026': 'Aug',
      'September 2026': 'Sep',
      'October 2026': 'Oct',
      'November 2026': 'Nov',
      'December 2026': 'Dec'
    };

    const monthlyMap: Record<string, number> = {};
    monthOrder.forEach((m) => {
      monthlyMap[m] = 0;
    });

    ledgerItems.forEach((item) => {
      let m = item.month || 'Other';
      if (!monthlyMap[m] && monthlyMap[m] !== 0) {
        m = 'Other';
      }
      monthlyMap[m] = (monthlyMap[m] || 0) + item.amount;
    });

    let cumulative = 0;
    // Show only months with data or first 7 months (Jan-Jul)
    return monthOrder.slice(0, 7).map((m) => {
      const amount = monthlyMap[m] || 0;
      cumulative += amount;
      return {
        month: shortLabels[m] || m,
        fullName: m,
        amount,
        cumulative
      };
    });
  }, [ledgerItems]);

  // Data for Category Allotment vs Utilized Bar Chart
  const categoryBarData = useMemo(() => {
    return summaries.map((s) => ({
      code: s.code,
      name: s.name,
      allotment: s.allotment,
      utilized: s.amountUtilized,
      unutilized: Math.max(0, s.unutilizedAmount),
      color: s.color
    }));
  }, [summaries]);

  // Data for Utilization Share Pie Chart
  const pieData = useMemo(() => {
    return summaries
      .filter((s) => s.amountUtilized > 0)
      .map((s) => ({
        name: `${s.code} - ${s.name}`,
        value: s.amountUtilized,
        code: s.code,
        color: s.color
      }));
  }, [summaries]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 1. Allotment vs Utilized Bar Chart */}
      <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-50 text-blue-700 rounded">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Approved Allotment vs Amount Utilized per Expense Code
            </h3>
          </div>
          <span className="text-xs text-slate-400">Values in Philippine Peso (₱)</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categoryBarData}
              margin={{ top: 10, right: 10, left: 15, bottom: 20 }}
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
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: any) => [formatCurrency(Number(value)), '']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
              />
              <Bar
                dataKey="allotment"
                name="Allotment (WFP)"
                fill="#94a3b8"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="utilized"
                name="Amount Utilized"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Category Share Breakdown Pie Chart */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded">
              <PieChartIcon className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Disbursement Composition
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {pieData.length} active codes
          </span>
        </div>

        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any) => [formatCurrency(Number(value)), name]}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-xs border-t border-slate-100 pt-2.5">
          {pieData.map((item) => (
            <div key={item.code} className="flex items-center space-x-1.5 truncate">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-medium text-slate-700 truncate">
                {item.code}:
              </span>
              <span className="font-mono text-slate-900 font-semibold">
                {formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Monthly Disbursement Trend (Jan - Jul 2026) */}
      <div className="lg:col-span-3 bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded">
              <LineChartIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Monthly Spending & Cumulative Burn Curve (Jan – Jul 2026)
              </h3>
              <p className="text-xs text-slate-500">
                Tracking monthly invoice disbursements and cumulative execution
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1">
              <span className="w-3 h-3 bg-blue-600 rounded-sm"></span>
              <span className="text-slate-600">Monthly Disbursed</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-3 h-1 bg-emerald-500 rounded"></span>
              <span className="text-slate-600">Cumulative Total</span>
            </div>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monthlyData}
              margin={{ top: 10, right: 20, left: 15, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 11, fill: '#10b981' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: any, name: any) => [
                  formatCurrency(Number(value)),
                  name === 'amount' ? 'Monthly Spend' : 'Cumulative Total'
                ]}
                labelFormatter={(label) => `Period: ${label} 2026`}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px'
                }}
              />
              <Bar
                yAxisId="left"
                dataKey="amount"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                barSize={32}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cumulative"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
