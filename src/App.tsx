import { useState, useMemo, useEffect } from 'react';
import { ExpenseCategory, LedgerItem, EstimatedBill } from './types';
import {
  INITIAL_CATEGORIES,
  INITIAL_LEDGER_ITEMS,
  INITIAL_ESTIMATED_BILLS
} from './data/initialData';
import { calculateSummaries, exportToCSV } from './utils/calculations';
import { Header } from './components/Header';
import { BudgetSummaryTable } from './components/BudgetSummaryTable';
import { BenchmarkCards } from './components/BenchmarkCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { LedgerTable } from './components/LedgerTable';
import { BudgetForecastReport } from './components/BudgetForecastReport';
import { BillsEstimatorView } from './components/BillsEstimatorView';
import { TransactionModal } from './components/TransactionModal';
import { AllotmentModal } from './components/AllotmentModal';
import { WhatIfScenarioModal } from './components/WhatIfScenarioModal';
import { EstimatedBillModal } from './components/EstimatedBillModal';
import {
  TrendingUp,
  ArrowRight,
  Sparkles,
  Receipt,
  CalendarClock,
  Plus,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

export default function App() {
  // Load state from localStorage with fallback to default WFP data
  const [categories, setCategories] = useState<ExpenseCategory[]>(() => {
    const saved = localStorage.getItem('rams_wfp_categories');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse categories from storage', e);
      }
    }
    return INITIAL_CATEGORIES;
  });

  const [ledgerItems, setLedgerItems] = useState<LedgerItem[]>(() => {
    const saved = localStorage.getItem('rams_wfp_ledger');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse ledger from storage', e);
      }
    }
    return INITIAL_LEDGER_ITEMS;
  });

  const [estimatedBills, setEstimatedBills] = useState<EstimatedBill[]>(() => {
    const saved = localStorage.getItem('rams_wfp_estimated_bills');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse estimated bills from storage', e);
      }
    }
    return INITIAL_ESTIMATED_BILLS;
  });

  // Active Category Filter across tables
  const [selectedCode, setSelectedCode] = useState<string>('');

  // Active View Tab: 'overview' | 'bills' | 'forecast' | 'ledger' | 'analytics'
  const [activeTab, setActiveTab] = useState<'overview' | 'bills' | 'forecast' | 'ledger' | 'analytics'>('overview');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAllotmentModalOpen, setIsAllotmentModalOpen] = useState(false);
  const [isWhatIfModalOpen, setIsWhatIfModalOpen] = useState(false);
  const [isEstimatedBillModalOpen, setIsEstimatedBillModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LedgerItem | null>(null);
  const [editingBill, setEditingBill] = useState<EstimatedBill | null>(null);
  const [editingCodeForModal, setEditingCodeForModal] = useState<string | undefined>(undefined);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('rams_wfp_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('rams_wfp_ledger', JSON.stringify(ledgerItems));
  }, [ledgerItems]);

  useEffect(() => {
    localStorage.setItem('rams_wfp_estimated_bills', JSON.stringify(estimatedBills));
  }, [estimatedBills]);

  // Derived Dynamic Calculations
  const {
    categorySummaries,
    totalAllotment,
    totalUtilized,
    totalPercentUtilized,
    totalUnutilized,
    totalPercentUnutilized,
    itemCount
  } = useMemo(() => {
    return calculateSummaries(categories, ledgerItems);
  }, [categories, ledgerItems]);

  // Handlers
  const handleSaveTransaction = (item: LedgerItem) => {
    if (editingItem) {
      setLedgerItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
    } else {
      setLedgerItems((prev) => [item, ...prev]);
    }
    setEditingItem(null);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Are you sure you want to delete this disbursement voucher line?')) {
      setLedgerItems((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleEditTransaction = (item: LedgerItem) => {
    setEditingItem(item);
    setIsAddModalOpen(true);
  };

  // Bill Handlers
  const handleSaveBill = (bill: EstimatedBill) => {
    if (editingBill) {
      setEstimatedBills((prev) => prev.map((b) => (b.id === bill.id ? bill : b)));
    } else {
      setEstimatedBills((prev) => [bill, ...prev]);
    }
    setEditingBill(null);
  };

  const handleEditBill = (bill: EstimatedBill) => {
    setEditingBill(bill);
    setIsEstimatedBillModalOpen(true);
  };

  const handleDeleteBill = (billId: string) => {
    if (confirm('Are you sure you want to remove this upcoming bill estimate?')) {
      setEstimatedBills((prev) => prev.filter((b) => b.id !== billId));
    }
  };

  const handleConvertBillToActual = (bill: EstimatedBill) => {
    // 1. Create a real ledger transaction
    const newTransaction: LedgerItem = {
      id: `TXN-POST-${Date.now().toString().slice(-5)}`,
      code: bill.code,
      particulars: bill.particulars + (bill.vendor ? ` (${bill.vendor})` : ''),
      amount: bill.estimatedAmount,
      month: bill.expectedMonth,
      date: bill.expectedDueDate || new Date().toISOString().slice(0, 10),
      drnNumber: bill.drnNumber || `DRN-${Date.now().toString().slice(-6)}`,
      purchaseRequestNo: bill.purchaseRequestNo || '',
      additionalRemarks: bill.remarks || 'Settled from upcoming bill queue'
    };

    // 2. Add to actual ledger
    setLedgerItems((prev) => [newTransaction, ...prev]);

    // 3. Mark the bill as paid
    setEstimatedBills((prev) =>
      prev.map((b) => (b.id === bill.id ? { ...b, status: 'paid' as const } : b))
    );
  };

  const handleUpdateAllBills = (bills: EstimatedBill[]) => {
    setEstimatedBills(bills);
  };

  const handleSaveCategories = (newCategories: ExpenseCategory[]) => {
    setCategories(newCategories);
  };

  const handleResetData = () => {
    if (
      confirm(
        'Reset all budget allocations, disbursement ledger, and upcoming bills estimation pipeline back to the approved initial Consolidated WFP baseline?'
      )
    ) {
      setCategories(INITIAL_CATEGORIES);
      setLedgerItems(INITIAL_LEDGER_ITEMS);
      setEstimatedBills(INITIAL_ESTIMATED_BILLS);
      setSelectedCode('');
    }
  };

  const handleExportCSV = () => {
    exportToCSV(categories, ledgerItems, categorySummaries);
  };

  const activeBillsCount = estimatedBills.filter((b) => b.status !== 'paid').length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <Header
        totalAllotment={totalAllotment}
        totalUtilized={totalUtilized}
        totalUnutilized={totalUnutilized}
        totalPercentUtilized={totalPercentUtilized}
        transactionCount={itemCount}
        onOpenAddModal={() => {
          setEditingItem(null);
          setIsAddModalOpen(true);
        }}
        onOpenAllotmentModal={() => {
          setEditingCodeForModal(undefined);
          setIsAllotmentModalOpen(true);
        }}
        onOpenWhatIfModal={() => setIsWhatIfModalOpen(true)}
        onOpenBills={() => setActiveTab('bills')}
        onOpenForecast={() => setActiveTab('forecast')}
        onExportCSV={handleExportCSV}
        onResetData={handleResetData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6 pb-20 md:pb-8">
        {/* Navigation Tabs (Overview / Bills / Forecast / Ledger / Analytics) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 sm:pb-3 gap-2 print:hidden overflow-x-auto no-scrollbar -mx-1 px-1">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/60'
              }`}
            >
              Executive Summary & Allotments
            </button>

            <button
              onClick={() => setActiveTab('bills')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer inline-flex items-center space-x-1.5 shrink-0 whitespace-nowrap ${
                activeTab === 'bills'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200'
              }`}
            >
              <CalendarClock className="w-4 h-4" />
              <span>Next Bills & Estimator</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  activeTab === 'bills'
                    ? 'bg-blue-800 text-blue-100'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {activeBillsCount} active
              </span>
            </button>

            <button
              onClick={() => setActiveTab('forecast')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer inline-flex items-center space-x-1.5 shrink-0 whitespace-nowrap ${
                activeTab === 'forecast'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Multi-Year Forecast</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  activeTab === 'forecast'
                    ? 'bg-indigo-900 text-indigo-100'
                    : 'bg-indigo-100 text-indigo-800'
                }`}
              >
                FY 2026-2028
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === 'ledger'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/60'
              }`}
            >
              Disbursement Ledger ({ledgerItems.length})
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200/60'
              }`}
            >
              Visual Analytics & Trends
            </button>
          </div>

          <div className="text-xs text-slate-500 hidden xl:block shrink-0">
            Approved Consolidated WFP 2026
          </div>
        </div>

        {/* View 1: Executive Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Action Banners */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
              {/* Banner 1: Next Bills Estimator */}
              <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-xl p-4 shadow-sm flex items-center justify-between border border-blue-800/60">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-300">
                    <CalendarClock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Next Bills & Obligations Pipeline
                    </h3>
                    <p className="text-xs text-blue-200 mt-0.5">
                      {activeBillsCount} bills estimated for Aug–Dec. Review solvency buffers & deficits.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('bills')}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer shrink-0 ml-2"
                >
                  <span>Open Estimator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Banner 2: Multi-Year Forecast */}
              <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-xl p-4 shadow-sm flex items-center justify-between border border-indigo-800/60">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-500/20 border border-indigo-400/30 rounded-lg text-indigo-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Multi-Year Forecast (FY 2027-2028)
                    </h3>
                    <p className="text-xs text-indigo-200 mt-0.5">
                      Projected budgets based on 7-month run-rate with inflation adjustments.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('forecast')}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer shrink-0 ml-2"
                >
                  <span>View Forecast</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Primary Budget Allotment Summary Table */}
            <section aria-label="WFP Allotments Summary">
              <BudgetSummaryTable
                summaries={categorySummaries}
                totalAllotment={totalAllotment}
                totalUtilized={totalUtilized}
                totalUnutilized={totalUnutilized}
                totalPercentUtilized={totalPercentUtilized}
                totalPercentUnutilized={totalPercentUnutilized}
                selectedCode={selectedCode}
                onSelectCode={setSelectedCode}
                onEditAllotment={(code) => {
                  setEditingCodeForModal(code);
                  setIsAllotmentModalOpen(true);
                }}
              />
            </section>

            {/* Benchmark Cards: RGASS & Adjusted RGASS */}
            <section aria-label="RGASS Benchmark Comparisons">
              <BenchmarkCards
                currentTotalAllotment={totalAllotment}
                currentTotalUtilized={totalUtilized}
              />
            </section>

            {/* Compact Analytics Preview */}
            <section aria-label="Visual Trends Preview">
              <AnalyticsCharts
                summaries={categorySummaries}
                ledgerItems={ledgerItems}
              />
            </section>

            {/* Detailed Ledger Section */}
            <section aria-label="Itemized Disbursement Ledger">
              <LedgerTable
                items={ledgerItems}
                categories={categories}
                selectedCode={selectedCode}
                onSelectCode={setSelectedCode}
                onAddNew={() => {
                  setEditingItem(null);
                  setIsAddModalOpen(true);
                }}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            </section>
          </div>
        )}

        {/* View 2: Next Bills & Estimator View */}
        {activeTab === 'bills' && (
          <BillsEstimatorView
            categories={categories}
            ledgerItems={ledgerItems}
            estimatedBills={estimatedBills}
            onAddBill={() => {
              setEditingBill(null);
              setIsEstimatedBillModalOpen(true);
            }}
            onEditBill={handleEditBill}
            onDeleteBill={handleDeleteBill}
            onConvertBillToActual={handleConvertBillToActual}
            onUpdateAllBills={handleUpdateAllBills}
            onNavigateToLedger={() => setActiveTab('ledger')}
          />
        )}

        {/* View 3: Multi-Year Budget Forecast & Utilization Report */}
        {activeTab === 'forecast' && (
          <section aria-label="Multi-Year Budget Forecasting & Needed Utilization">
            <BudgetForecastReport
              categories={categories}
              ledgerItems={ledgerItems}
              summaries={categorySummaries}
            />
          </section>
        )}

        {/* View 4: Ledger Only Focus */}
        {activeTab === 'ledger' && (
          <div className="space-y-6">
            <LedgerTable
              items={ledgerItems}
              categories={categories}
              selectedCode={selectedCode}
              onSelectCode={setSelectedCode}
              onAddNew={() => {
                setEditingItem(null);
                setIsAddModalOpen(true);
              }}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
            />
          </div>
        )}

        {/* View 5: Analytics Only Focus */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <BenchmarkCards
              currentTotalAllotment={totalAllotment}
              currentTotalUtilized={totalUtilized}
            />
            <AnalyticsCharts
              summaries={categorySummaries}
              ledgerItems={ledgerItems}
            />
          </div>
        )}
      </main>

      {/* Sticky Mobile Bottom Navigation Bar (Visible only on mobile/tablet) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 flex items-center justify-around md:hidden shadow-lg print:hidden">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer touch-manipulation min-w-[54px] ${
            activeTab === 'overview'
              ? 'text-blue-600 bg-blue-50'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 mb-0.5" />
          <span>Summary</span>
        </button>

        <button
          onClick={() => setActiveTab('bills')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer touch-manipulation relative min-w-[54px] ${
            activeTab === 'bills'
              ? 'text-blue-600 bg-blue-50'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarClock className="w-4 h-4 mb-0.5" />
          <span>Next Bills</span>
          {activeBillsCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
          )}
        </button>

        {/* Center Quick Record Button */}
        <button
          onClick={() => {
            setEditingItem(null);
            setIsAddModalOpen(true);
          }}
          className="flex flex-col items-center justify-center -mt-5 bg-blue-600 active:bg-blue-700 text-white rounded-full p-3 shadow-lg shadow-blue-500/40 cursor-pointer touch-manipulation ring-4 ring-white"
          title="Add Expense Voucher"
        >
          <Plus className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveTab('forecast')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer touch-manipulation min-w-[54px] ${
            activeTab === 'forecast'
              ? 'text-indigo-600 bg-indigo-50'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 mb-0.5" />
          <span>Forecast</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer touch-manipulation min-w-[54px] ${
            activeTab === 'ledger'
              ? 'text-slate-900 bg-slate-100'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 mb-0.5" />
          <span>Ledger</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-4 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            RAMS Financial & Administrative Management • Approved Consolidated WFP • Reserved by Michael John A. Baniqued
          </span>
          <span>
            Calculated: Total Allotment ₱{totalAllotment.toLocaleString()} | Utilized: ₱{totalUtilized.toLocaleString()} ({totalPercentUtilized.toFixed(2)}%)
          </span>
        </div>
      </footer>

      {/* Modals */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveTransaction}
        editingItem={editingItem}
        categories={categories}
        summaries={categorySummaries}
      />

      <AllotmentModal
        isOpen={isAllotmentModalOpen}
        onClose={() => {
          setIsAllotmentModalOpen(false);
          setEditingCodeForModal(undefined);
        }}
        categories={categories}
        onSaveCategories={handleSaveCategories}
        initialSelectedCode={editingCodeForModal}
      />

      <WhatIfScenarioModal
        isOpen={isWhatIfModalOpen}
        onClose={() => setIsWhatIfModalOpen(false)}
        categories={categories}
        summaries={categorySummaries}
        totalAllotment={totalAllotment}
        totalUtilized={totalUtilized}
      />

      <EstimatedBillModal
        isOpen={isEstimatedBillModalOpen}
        onClose={() => {
          setIsEstimatedBillModalOpen(false);
          setEditingBill(null);
        }}
        onSave={handleSaveBill}
        onConvertToActual={handleConvertBillToActual}
        categories={categories}
        billToEdit={editingBill}
      />
    </div>
  );
}
