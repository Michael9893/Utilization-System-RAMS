import React, { useState, useMemo } from 'react';
import {
  ExpenseCategory,
  LedgerItem,
  EstimatedBill,
  BillStatus,
  BillConfidence
} from '../types';
import {
  calculateBillEstimationOverview,
  exportBillsEstimationCSV,
  generateAutoProjectedBills
} from '../utils/billCalculations';
import { formatCurrency, formatPercent } from '../utils/calculations';
import {
  Calendar,
  DollarSign,
  Plus,
  FileDown,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Building,
  Edit2,
  Trash2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  Filter,
  CheckCircle
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

interface BillsEstimatorViewProps {
  categories: ExpenseCategory[];
  ledgerItems: LedgerItem[];
  estimatedBills: EstimatedBill[];
  onAddBill: () => void;
  onEditBill: (bill: EstimatedBill) => void;
  onDeleteBill: (billId: string) => void;
  onConvertBillToActual: (bill: EstimatedBill) => void;
  onUpdateAllBills: (bills: EstimatedBill[]) => void;
  onNavigateToLedger?: () => void;
}

export const BillsEstimatorView: React.FC<BillsEstimatorViewProps> = ({
  categories,
  ledgerItems,
  estimatedBills,
  onAddBill,
  onEditBill,
  onDeleteBill,
  onConvertBillToActual,
  onUpdateAllBills,
  onNavigateToLedger
}) => {
  const [selectedCode, setSelectedCode] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'schedule' | 'solvency' | 'timeline'>('schedule');

  const overview = useMemo(() => {
    return calculateBillEstimationOverview(categories, ledgerItems, estimatedBills);
  }, [categories, ledgerItems, estimatedBills]);

  // Filtered bills list
  const filteredBills = useMemo(() => {
    return estimatedBills.filter((bill) => {
      if (selectedCode && bill.code.toUpperCase() !== selectedCode.toUpperCase()) return false;
      if (selectedMonth && bill.expectedMonth !== selectedMonth) return false;
      if (selectedStatus && bill.status !== selectedStatus) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchParticulars = bill.particulars.toLowerCase().includes(query);
        const matchVendor = bill.vendor?.toLowerCase().includes(query) ?? false;
        const matchDrn = bill.drnNumber?.toLowerCase().includes(query) ?? false;
        const matchPr = bill.purchaseRequestNo?.toLowerCase().includes(query) ?? false;
        const matchCode = bill.code.toLowerCase().includes(query);
        if (!matchParticulars && !matchVendor && !matchDrn && !matchPr && !matchCode) return false;
      }
      return true;
    });
  }, [estimatedBills, selectedCode, selectedMonth, selectedStatus, searchQuery]);

  // Monthly Cash Flow Chart Data (Jan - Dec 2026)
  const monthlyChartData = useMemo(() => {
    const months = [
      { key: 'January 2026', label: 'Jan' },
      { key: 'February 2026', label: 'Feb' },
      { key: 'March 2026', label: 'Mar' },
      { key: 'April 2026', label: 'Apr' },
      { key: 'May 2026', label: 'May' },
      { key: 'June 2026', label: 'Jun' },
      { key: 'July 2026', label: 'Jul' },
      { key: 'August 2026', label: 'Aug' },
      { key: 'September 2026', label: 'Sep' },
      { key: 'October 2026', label: 'Oct' },
      { key: 'November 2026', label: 'Nov' },
      { key: 'December 2026', label: 'Dec' }
    ];

    return months.map((m) => {
      const actualAmount = ledgerItems
        .filter((item) => item.month === m.key)
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

      const estimatedAmount = estimatedBills
        .filter((b) => b.expectedMonth === m.key && b.status !== 'paid')
        .reduce((sum, b) => sum + (Number(b.estimatedAmount) || 0), 0);

      return {
        month: m.label,
        fullMonth: m.key,
        'Actual Paid (₱)': actualAmount > 0 ? actualAmount : undefined,
        'Estimated Next Bills (₱)': estimatedAmount > 0 ? estimatedAmount : undefined
      };
    });
  }, [ledgerItems, estimatedBills]);

  const handleAutoGenerate = () => {
    if (
      window.confirm(
        'Generate intelligent upcoming recurring bill estimates for August – December 2026 based on historical run rates?'
      )
    ) {
      const generated = generateAutoProjectedBills(categories, ledgerItems);
      onUpdateAllBills(generated);
    }
  };

  const handleExportCSV = () => {
    exportBillsEstimationCSV(overview, categories);
  };

  const getStatusBadge = (status: BillStatus) => {
    switch (status) {
      case 'invoiced':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3 mr-1 text-blue-600" /> Invoiced (Pending Payment)
          </span>
        );
      case 'obligated':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldCheck className="w-3 h-3 mr-1 text-purple-600" /> Obligated (PO/PR Issued)
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" /> Paid / Settled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <TrendingUp className="w-3 h-3 mr-1 text-amber-600" /> Estimated (Forecast)
          </span>
        );
    }
  };

  const getConfidenceBadge = (confidence: BillConfidence) => {
    switch (confidence) {
      case 'recurring_scheduled':
        return <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-medium border border-blue-200">Recurring Contract</span>;
      case 'high':
        return <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium border border-emerald-200">High Confidence</span>;
      case 'medium':
        return <span className="text-[10px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded font-medium">Historical Run-Rate</span>;
      default:
        return <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium">Tentative</span>;
    }
  };

  const getSolvencyBadge = (status: string) => {
    switch (status) {
      case 'critical_overdraft':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <Flame className="w-3.5 h-3.5 mr-1 text-rose-600" /> Overdraft / Deficit Risk
          </span>
        );
      case 'deficit_warning':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" /> Deficit Warning
          </span>
        );
      case 'surplus_excess':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <TrendingUp className="w-3.5 h-3.5 mr-1 text-indigo-600" /> High Surplus Available
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Fully Solvent
          </span>
        );
    }
  };

  const monthOptions = [
    'August 2026',
    'September 2026',
    'October 2026',
    'November 2026',
    'December 2026',
    'January 2027',
    'February 2027',
    'March 2027'
  ];

  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
                Upcoming Bills & Obligations Pipeline
              </span>
              <span className="text-xs text-slate-400">
                Philippine Peso (₱) • August – December 2026
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mt-1 text-white tracking-tight">
              Upcoming Bills Estimator & Cash Flow Schedule
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Forecasts, tracks, and manages estimated upcoming recurring bills (JRS Courier, PhilPost Postal, Travel Claims, Semestral Meetings, Hauling) against remaining WFP allotments to prevent budget overdrafts.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 print:hidden">
            <button
              id="btn-add-estimated-bill"
              onClick={onAddBill}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Bill Estimate</span>
            </button>

            <button
              id="btn-auto-project-bills"
              onClick={handleAutoGenerate}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-700 hover:bg-indigo-600 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              title="Automatically generate recurring bills for August-December based on historical run rates"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Auto-Project 2026 Bills</span>
            </button>

            <button
              id="btn-export-bills-csv"
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Export upcoming bills schedule to CSV"
            >
              <FileDown className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700 overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === 'schedule'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Upcoming Queue ({estimatedBills.filter((b) => b.status !== 'paid').length})
            </button>
            <button
              onClick={() => setActiveTab('solvency')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === 'solvency'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Category Solvency & Health
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === 'timeline'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              12-Mo Cash Flow (Jan-Dec)
            </button>
          </div>

          <div className="text-xs text-slate-400 flex items-center justify-between sm:justify-end space-x-2">
            <span>Pipeline:</span>
            <strong className="text-emerald-400 font-mono text-sm">
              {formatCurrency(overview.totalEstimatedUpcomingBills)}
            </strong>
          </div>
        </div>
      </div>

      {/* KPI Ribbon (4 Summary Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Estimated Upcoming Bills */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Next Bills (Aug-Dec)
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px] font-bold">
              {estimatedBills.filter((b) => b.status !== 'paid').length} Bills
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-blue-900">
            {formatCurrency(overview.totalEstimatedUpcomingBills)}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Committed / Obligated:</span>
            <span className="font-mono font-bold text-slate-800">
              {formatCurrency(overview.totalObligatedBills)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Sum of scheduled invoices and pending obligations through year-end.
          </p>
        </div>

        {/* Card 2: Projected Year-End Spend */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Projected Total Spend
            </span>
            <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[11px] font-bold">
              {formatPercent(overview.projectedYearEndAbsorptionPct)} WFP
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-indigo-900">
            {formatCurrency(overview.projectedYearEndSpend)}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Actual Paid to Date:</span>
            <span className="font-mono font-semibold text-slate-700">
              {formatCurrency(ledgerItems.reduce((sum, i) => sum + (Number(i.amount) || 0), 0))}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Combined actual Jan-Jul disbursements + August-December estimated bills.
          </p>
        </div>

        {/* Card 3: Projected Net Unutilized Savings */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Net Year-End Variance
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
              Uncommitted Balance
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-700">
            {formatCurrency(overview.projectedYearEndNetSavings)}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Total Allotment:</span>
            <span className="font-mono font-semibold text-slate-700">
              {formatCurrency(categories.reduce((sum, c) => sum + c.allotment, 0))}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Remaining surplus available across all accounts after settling all estimated bills.
          </p>
        </div>

        {/* Card 4: Critical Deficit & Realignment Alert */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Realignment Need
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[11px] font-bold">
              TEV Deficit
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-700">
            ₱4,585.00
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
            <span>Surplus Source:</span>
            <span className="font-bold text-emerald-700">PS (₱77,911 surplus)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Realign from Postal surplus to Traveling Expense to cover Aug-Dec field trips.
          </p>
        </div>
      </div>

      {/* VIEW 1: UPCOMING BILLS SCHEDULE & QUEUE */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bills, vendors, DRN, PR..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>

              {/* Code Filter */}
              <select
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Accounts</option>
                {categories.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>

              {/* Month Filter */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Months</option>
                {monthOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="estimated">Estimated</option>
                <option value="obligated">Obligated</option>
                <option value="invoiced">Invoiced</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 self-end md:self-auto">
              Showing <strong className="text-slate-800">{filteredBills.length}</strong> of{' '}
              {estimatedBills.length} upcoming bill records
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-3 w-16">Code</th>
                  <th className="py-3 px-4">Bill Particulars & Vendor</th>
                  <th className="py-3 px-4">Billing Month</th>
                  <th className="py-3 px-4 text-right">Estimated Amount (₱)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Confidence</th>
                  <th className="py-3 px-4">PR / DRN No.</th>
                  <th className="py-3 px-4 text-right print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No upcoming bill records found matching the active filter.
                    </td>
                  </tr>
                ) : (
                  filteredBills.map((bill) => {
                    const catObj = categories.find((c) => c.code === bill.code);
                    const color = catObj?.color || '#64748b';

                    return (
                      <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold">
                          <span
                            className="inline-block px-2 py-0.5 rounded text-xs"
                            style={{
                              backgroundColor: `${color}15`,
                              color: color,
                              border: `1px solid ${color}40`
                            }}
                          >
                            {bill.code}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{bill.particulars}</div>
                          {bill.vendor && (
                            <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                              <Building className="w-3 h-3 text-slate-400" />
                              <span>{bill.vendor}</span>
                            </div>
                          )}
                          {bill.remarks && (
                            <div className="text-[11px] text-slate-400 italic mt-0.5">
                              {bill.remarks}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                          <div className="font-medium">{bill.expectedMonth}</div>
                          {bill.expectedDueDate && (
                            <div className="text-[11px] text-slate-400">
                              Due: {bill.expectedDueDate}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          {formatCurrency(bill.estimatedAmount)}
                        </td>

                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {getStatusBadge(bill.status)}
                        </td>

                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {getConfidenceBadge(bill.confidence)}
                        </td>

                        <td className="py-3 px-4 text-xs font-mono text-slate-600">
                          {bill.purchaseRequestNo && (
                            <div className="text-purple-700 font-semibold">{bill.purchaseRequestNo}</div>
                          )}
                          {bill.drnNumber && <div className="text-slate-500">{bill.drnNumber}</div>}
                          {!bill.purchaseRequestNo && !bill.drnNumber && <span className="text-slate-300">—</span>}
                        </td>

                        <td className="py-3 px-4 text-right print:hidden whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1.5">
                            {bill.status !== 'paid' && (
                              <button
                                onClick={() => onConvertBillToActual(bill)}
                                className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                                title="Post to actual disbursement ledger as paid"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Post Paid</span>
                              </button>
                            )}

                            <button
                              onClick={() => onEditBill(bill)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                              title="Edit Bill Estimate"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onDeleteBill(bill.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Totals */}
              <tfoot>
                <tr className="bg-slate-900 text-white font-bold text-xs sm:text-sm">
                  <td className="py-3.5 px-3 font-mono text-emerald-300">TOTAL:</td>
                  <td className="py-3.5 px-4 text-white">
                    Estimated Upcoming Obligations Pipeline ({filteredBills.length} records)
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">Aug – Dec 2026</td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-400 text-base">
                    {formatCurrency(
                      filteredBills
                        .filter((b) => b.status !== 'paid')
                        .reduce((sum, b) => sum + (Number(b.estimatedAmount) || 0), 0)
                    )}
                  </td>
                  <td colSpan={4} className="py-3.5 px-4 text-xs text-slate-300 text-right">
                    Projected Year-End Absorption: {formatPercent(overview.projectedYearEndAbsorptionPct)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: CATEGORY SOLVENCY & BUFFER HEALTH MATRIX */}
      {activeTab === 'solvency' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Category Solvency & Allotment Cover Analysis
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluates whether each approved WFP allotment is sufficient to cover actual disbursements plus all scheduled upcoming bills through December 31, 2026.
              </p>
            </div>
            <span className="text-xs text-slate-600 font-medium hidden sm:inline">
              Philippine Peso (₱)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold uppercase text-[11px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-3 w-16">Code</th>
                  <th className="py-3 px-4">Expense Category</th>
                  <th className="py-3 px-4 text-right">Approved Allotment (₱)</th>
                  <th className="py-3 px-4 text-right">Paid (Jan-Jul) (₱)</th>
                  <th className="py-3 px-4 text-right">Current Unutilized (₱)</th>
                  <th className="py-3 px-4 text-right font-bold text-blue-900 bg-blue-50/70">
                    Est. Next Bills (₱)
                  </th>
                  <th className="py-3 px-4 text-right font-bold text-indigo-900 bg-indigo-50/70">
                    Projected Net Variance (₱)
                  </th>
                  <th className="py-3 px-4 text-center">Solvency Status</th>
                  <th className="py-3 px-4 min-w-[200px]">Strategic Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overview.solvencyBreakdown.map((s) => {
                  return (
                    <tr key={s.code} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold">
                        <span
                          className="inline-block px-2 py-0.5 rounded text-xs"
                          style={{
                            backgroundColor: `${s.color}15`,
                            color: s.color,
                            border: `1px solid ${s.color}40`
                          }}
                        >
                          {s.code}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {s.name}
                        <span className="block text-[11px] text-slate-400 font-normal">
                          {s.billCount} upcoming bill{s.billCount === 1 ? '' : 's'} scheduled
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-800">
                        {formatCurrency(s.allotment)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                        {formatCurrency(s.utilizedToDate)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-700">
                        {formatCurrency(s.unutilizedBalance)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-700 bg-blue-50/40">
                        {formatCurrency(s.totalEstimatedBills)}
                      </td>

                      <td
                        className={`py-3.5 px-4 text-right font-mono font-bold bg-indigo-50/30 ${
                          s.projectedNetVariance < 0 ? 'text-rose-700' : 'text-emerald-700'
                        }`}
                      >
                        {s.projectedNetVariance < 0 ? '-' : '+'}
                        {formatCurrency(Math.abs(s.projectedNetVariance))}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {getSolvencyBadge(s.solvencyStatus)}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600 leading-relaxed">
                        {s.solvencyMessage}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Totals */}
              <tfoot>
                <tr className="bg-slate-900 text-white font-bold text-xs sm:text-sm">
                  <td className="py-3.5 px-3 font-mono text-emerald-300">TOTAL:</td>
                  <td className="py-3.5 px-4 text-white">Consolidated Solvency Projection</td>
                  <td className="py-3.5 px-4 text-right font-mono text-white">
                    {formatCurrency(categories.reduce((sum, c) => sum + c.allotment, 0))}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-blue-300">
                    {formatCurrency(
                      overview.solvencyBreakdown.reduce((sum, s) => sum + s.utilizedToDate, 0)
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                    {formatCurrency(
                      overview.solvencyBreakdown.reduce((sum, s) => sum + s.unutilizedBalance, 0)
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-blue-400 bg-slate-800 text-base">
                    {formatCurrency(overview.totalEstimatedUpcomingBills)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-400 bg-slate-800 text-base">
                    +{formatCurrency(overview.projectedYearEndNetSavings)}
                  </td>
                  <td colSpan={2} className="py-3.5 px-4 text-xs text-slate-300 text-right">
                    Overall Status: <strong>Fully Solvent ({formatPercent(overview.projectedYearEndAbsorptionPct)} absorption)</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: 12-MONTH TIMELINE & CASH OUTFLOW CHART */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Full-Year Cash Flow Timeline (January – December 2026)
                </h3>
                <p className="text-xs text-slate-500">
                  Comparing actual historical disbursements (Jan–Jul) against estimated upcoming bills (Aug–Dec).
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-blue-600 inline-block"></span>
                <span className="text-slate-600 font-medium">Actual Paid (Jan-Jul)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span>
                <span className="text-slate-600 font-medium">Estimated Next Bills (Aug-Dec)</span>
              </div>
            </div>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
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
                <Bar
                  dataKey="Actual Paid (₱)"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                  stackId="a"
                />
                <Bar
                  dataKey="Estimated Next Bills (₱)"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  stackId="a"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <span className="font-bold text-slate-900 block">Quarterly & Seasonal Dynamics:</span>
            • <strong>May 2026 Peak:</strong> ₱42,000 bulk supplies procurement (SC).<br />
            • <strong>October 2026 Projected Peak:</strong> ₱60,000 Semestral Regional Meeting (RE) execution.<br />
            • <strong>Recurring Monthly Base:</strong> Steady ₱8,000–₱9,000 monthly combined courier (CS) and postal (PS) bills.
          </div>
        </div>
      )}
    </div>
  );
};
