import React, { useState, useMemo } from 'react';
import { LedgerItem, ExpenseCategory } from '../types';
import { formatCurrency } from '../utils/calculations';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  FileText,
  Copy,
  Check,
  LayoutGrid,
  TableProperties,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface LedgerTableProps {
  items: LedgerItem[];
  categories: ExpenseCategory[];
  selectedCode: string;
  onSelectCode: (code: string) => void;
  onAddNew: () => void;
  onEdit: (item: LedgerItem) => void;
  onDelete: (id: string) => void;
}

export const LedgerTable: React.FC<LedgerTableProps> = ({
  items,
  categories,
  selectedCode,
  onSelectCode,
  onAddNew,
  onEdit,
  onDelete
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [sortBy, setSortBy] = useState<'index' | 'amount' | 'code' | 'date'>('index');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'auto' | 'cards' | 'table'>('auto');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Extract unique months
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    items.forEach((item) => {
      if (item.month) months.add(item.month);
    });
    return Array.from(months);
  }, [items]);

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Category code filter
        if (selectedCode && item.code.toUpperCase() !== selectedCode.toUpperCase()) {
          return false;
        }

        // Month filter
        if (selectedMonth !== 'ALL' && item.month !== selectedMonth) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchParticulars = item.particulars?.toLowerCase().includes(q);
          const matchDrn = item.drnNumber?.toLowerCase().includes(q);
          const matchPr = item.purchaseRequestNo?.toLowerCase().includes(q);
          const matchRemarks = item.additionalRemarks?.toLowerCase().includes(q);
          const matchCode = item.code?.toLowerCase().includes(q);
          if (!matchParticulars && !matchDrn && !matchPr && !matchRemarks && !matchCode) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'amount') {
          return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
        }
        if (sortBy === 'code') {
          return sortOrder === 'asc'
            ? a.code.localeCompare(b.code)
            : b.code.localeCompare(a.code);
        }
        if (sortBy === 'date') {
          return sortOrder === 'asc'
            ? (a.date || '').localeCompare(b.date || '')
            : (b.date || '').localeCompare(a.date || '');
        }
        return 0; // default order
      });
  }, [items, selectedCode, selectedMonth, searchQuery, sortBy, sortOrder]);

  const filteredTotal = useMemo(() => {
    return filteredItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  }, [filteredItems]);

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getCategoryColor = (code: string) => {
    const cat = categories.find((c) => c.code.toUpperCase() === code.toUpperCase());
    return cat?.color || '#6366f1';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600 shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                Disbursement & Expense Ledger
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Itemized vouchers, DRN tracking, purchase requests, and disbursement billing particulars
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            {/* View Mode Toggle */}
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

            <button
              id="btn-add-ledger-item"
              onClick={onAddNew}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 min-h-[38px] bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer shrink-0 touch-manipulation"
            >
              <Plus className="w-4 h-4" />
              <span>Add Voucher</span>
            </button>
          </div>
        </div>

        {/* Mobile Filter Toggle Button */}
        <div className="mt-3 block sm:hidden">
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs"
          >
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>Search & Filter Options ({filteredItems.length} records)</span>
            </div>
            {isFiltersOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
        </div>

        {/* Filters and search row */}
        <div className={`mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 ${isFiltersOpen ? 'block' : 'hidden sm:grid'}`}>
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              id="input-ledger-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search particulars, DRN, PR..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[38px]"
            />
          </div>

          {/* Month selector */}
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <select
              id="select-ledger-month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[38px]"
            >
              <option value="ALL">All Periods (Jan - Jul 2026)</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              id="select-ledger-sort"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-') as [
                  'index' | 'amount' | 'code' | 'date',
                  'asc' | 'desc'
                ];
                setSortBy(sb);
                setSortOrder(so);
              }}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[38px]"
            >
              <option value="index-asc">Default Order (Chronological)</option>
              <option value="amount-desc">Amount: Highest to Lowest</option>
              <option value="amount-asc">Amount: Lowest to Highest</option>
              <option value="code-asc">Expense Code (A-Z)</option>
              <option value="date-desc">Date: Latest First</option>
            </select>
          </div>

          {/* Active Filter summary */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-100/90 rounded-lg border border-slate-200 text-xs min-h-[38px]">
            <span className="text-slate-500">Showing:</span>
            <span className="font-semibold text-slate-800">
              {filteredItems.length} of {items.length} records
            </span>
          </div>
        </div>

        {/* Category Filter Pills (Horizontal Touch-Scrollable) */}
        <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-slate-200/60 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
          <span className="text-xs text-slate-400 font-medium shrink-0 mr-1">Code:</span>
          <button
            onClick={() => onSelectCode('')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
              !selectedCode
                ? 'bg-slate-800 text-white'
                : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
            }`}
          >
            All ({items.length})
          </button>
          {categories.map((cat) => {
            const count = items.filter((i) => i.code === cat.code).length;
            const isSelected = selectedCode === cat.code;
            return (
              <button
                key={cat.code}
                onClick={() => onSelectCode(isSelected ? '' : cat.code)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all border shrink-0 cursor-pointer ${
                  isSelected
                    ? 'text-white shadow-xs'
                    : 'hover:bg-slate-100'
                }`}
                style={{
                  backgroundColor: isSelected ? cat.color : `${cat.color}15`,
                  borderColor: isSelected ? cat.color : `${cat.color}40`,
                  color: isSelected ? '#ffffff' : cat.color
                }}
              >
                {cat.code} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* MOBILE CARD VIEW: Rendered when viewMode is 'cards' OR on small screens when viewMode is 'auto' */}
      <div
        className={`${
          viewMode === 'table'
            ? 'hidden'
            : viewMode === 'cards'
            ? 'block'
            : 'block md:hidden'
        } p-3.5 sm:p-4 space-y-2.5`}
      >
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No disbursement records match your filter criteria.
          </div>
        ) : (
          filteredItems.map((item, idx) => {
            const color = getCategoryColor(item.code);
            return (
              <div
                key={item.id || idx}
                className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all space-y-2.5"
              >
                {/* Card Top: Amount & Category Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-base sm:text-lg font-bold font-mono text-slate-900 block leading-tight">
                      {formatCurrency(item.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Voucher #{idx + 1} • {item.month || '2026'}
                    </span>
                  </div>

                  <span
                    className="px-2 py-0.5 rounded text-xs font-mono font-bold shrink-0"
                    style={{
                      backgroundColor: `${color}15`,
                      color: color,
                      border: `1px solid ${color}35`
                    }}
                  >
                    {item.code}
                  </span>
                </div>

                {/* Particulars Description */}
                <p className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">
                  {item.particulars}
                </p>

                {/* Badges / Metadata */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                  {item.drnNumber && (
                    <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                      <span className="truncate max-w-[170px]">{item.drnNumber}</span>
                      <button
                        onClick={() => handleCopy(item.drnNumber!, item.id)}
                        className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                        title="Copy DRN"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}

                  {item.purchaseRequestNo && (
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      PR: {item.purchaseRequestNo}
                    </span>
                  )}

                  {item.additionalRemarks && (
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      {item.additionalRemarks}
                    </span>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs print:hidden">
                  <span className="text-[10px] text-slate-400">
                    ID: {item.id}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer touch-manipulation"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer touch-manipulation"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Filtered Subtotal Card on Mobile */}
        <div className="p-3.5 rounded-xl bg-slate-900 text-white shadow-sm flex items-center justify-between mt-3">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">
              Disbursements Subtotal ({filteredItems.length} items)
            </span>
            <span className="text-lg font-bold font-mono text-emerald-400">
              {formatCurrency(filteredTotal)}
            </span>
          </div>
          <button
            onClick={onAddNew}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer touch-manipulation"
          >
            + New Line
          </button>
        </div>
      </div>

      {/* DESKTOP TABLE VIEW: Rendered when viewMode is 'table' OR on desktop when viewMode is 'auto' */}
      <div
        className={`${
          viewMode === 'cards'
            ? 'hidden'
            : viewMode === 'table'
            ? 'block'
            : 'hidden md:block'
        } overflow-x-auto`}
      >
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-100 text-slate-700 uppercase font-semibold tracking-wider text-[11px] border-b border-slate-200">
              <th className="py-3 px-3 w-12 text-center">#</th>
              <th className="py-3 px-3 w-20">Code</th>
              <th className="py-3 px-4 min-w-[180px]">DRN Number</th>
              <th className="py-3 px-4 min-w-[260px]">Particulars</th>
              <th className="py-3 px-4 min-w-[140px]">Addt'l Remarks</th>
              <th className="py-3 px-4 min-w-[110px]">Period</th>
              <th className="py-3 px-4 text-right min-w-[150px]">Amount (₱ - Philippine Peso)</th>
              <th className="py-3 px-3 text-center w-20 print:hidden">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  No disbursement records match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredItems.map((item, idx) => {
                const color = getCategoryColor(item.code);
                return (
                  <tr
                    key={item.id || idx}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3 px-3 text-center text-slate-400 text-xs font-mono">
                      {idx + 1}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className="inline-block px-2 py-0.5 rounded text-xs font-mono font-bold"
                        style={{
                          backgroundColor: `${color}15`,
                          color: color,
                          border: `1px solid ${color}35`
                        }}
                      >
                        {item.code}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-xs">
                      {item.drnNumber ? (
                        <div className="flex items-center space-x-1.5">
                          <span className="text-slate-700 font-medium bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 max-w-[200px] truncate" title={item.drnNumber}>
                            {item.drnNumber}
                          </span>
                          <button
                            onClick={() => handleCopy(item.drnNumber!, item.id)}
                            className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors cursor-pointer"
                            title="Copy DRN"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-900 font-medium">
                      <div className="leading-snug">
                        {item.particulars}
                      </div>
                      {item.purchaseRequestNo && (
                        <span className="text-[11px] text-slate-500 block font-normal mt-0.5">
                          PR No: {item.purchaseRequestNo}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {item.additionalRemarks ? (
                        <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200/80 inline-block font-mono">
                          {item.additionalRemarks}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-500 text-xs whitespace-nowrap">
                      {item.month || '2026'}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(item.amount)}
                    </td>

                    <td className="py-3 px-3 text-center print:hidden">
                      <div className="flex items-center justify-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(item)}
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          title="Edit Line Item"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Delete Line Item"
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

          {/* Subtotal Footer */}
          <tfoot>
            <tr className="bg-slate-900 text-white font-bold text-xs sm:text-sm">
              <td colSpan={6} className="py-3.5 px-4 text-right font-medium text-slate-300">
                {selectedCode || selectedMonth !== 'ALL' || searchQuery
                  ? `Filtered Subtotal (${filteredItems.length} items):`
                  : 'TOTAL DISBURSEMENTS (Ledger Sum):'}
              </td>
              <td className="py-3.5 px-4 text-right font-mono text-emerald-400 text-base">
                {formatCurrency(filteredTotal)}
              </td>
              <td className="py-3.5 px-3 print:hidden"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

