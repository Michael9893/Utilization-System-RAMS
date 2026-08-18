import React, { useState, useEffect } from 'react';
import { LedgerItem, ExpenseCategory, CategorySummary } from '../types';
import { formatCurrency, formatPercent } from '../utils/calculations';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: LedgerItem) => void;
  editingItem: LedgerItem | null;
  categories: ExpenseCategory[];
  summaries: CategorySummary[];
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  categories,
  summaries
}) => {
  const [code, setCode] = useState('CS');
  const [particulars, setParticulars] = useState('');
  const [amount, setAmount] = useState('');
  const [drnNumber, setDrnNumber] = useState('');
  const [purchaseRequestNo, setPurchaseRequestNo] = useState('');
  const [additionalRemarks, setAdditionalRemarks] = useState('');
  const [month, setMonth] = useState('August 2026');
  const [date, setDate] = useState('2026-08-17');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingItem) {
      setCode(editingItem.code);
      setParticulars(editingItem.particulars);
      setAmount(editingItem.amount.toString());
      setDrnNumber(editingItem.drnNumber || '');
      setPurchaseRequestNo(editingItem.purchaseRequestNo || '');
      setAdditionalRemarks(editingItem.additionalRemarks || '');
      setMonth(editingItem.month || 'August 2026');
      setDate(editingItem.date || '2026-08-17');
    } else {
      setCode(categories[0]?.code || 'TEV');
      setParticulars('');
      setAmount('');
      setDrnNumber('');
      setPurchaseRequestNo('');
      setAdditionalRemarks('');
      setMonth('August 2026');
      setDate('2026-08-17');
    }
    setErrors({});
  }, [editingItem, isOpen, categories]);

  if (!isOpen) return null;

  const currentCategorySummary = summaries.find((s) => s.code === code);
  const parsedAmount = parseFloat(amount) || 0;

  // Calculate new projected utilization for this category
  const previousItemAmount = editingItem && editingItem.code === code ? editingItem.amount : 0;
  const currentUtilized = currentCategorySummary?.amountUtilized || 0;
  const allotment = currentCategorySummary?.allotment || 0;
  const projectedUtilized = currentUtilized - previousItemAmount + parsedAmount;
  const projectedPercent = allotment > 0 ? (projectedUtilized / allotment) * 100 : 0;
  const isExceedingBudget = projectedUtilized > allotment;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!particulars.trim()) {
      newErrors.particulars = 'Particulars description is required';
    }
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'Please enter a valid positive amount';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const item: LedgerItem = {
      id: editingItem?.id || `TXN-${Date.now().toString().slice(-6)}`,
      code,
      particulars: particulars.trim(),
      amount: parsedAmount,
      drnNumber: drnNumber.trim() || undefined,
      purchaseRequestNo: purchaseRequestNo.trim() || undefined,
      additionalRemarks: additionalRemarks.trim() || undefined,
      month,
      date
    };

    onSave(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm sm:text-base font-bold">
              {editingItem ? 'Edit Disbursement Voucher' : 'Record New Disbursement Line'}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-300">
              WFP Expense itemization and real-time allotment check
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Category Code Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Expense Account / Code
            </label>
            <select
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white"
            >
              {categories.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name} (Allotment: {formatCurrency(c.allotment)})
                </option>
              ))}
            </select>
          </div>

          {/* Particulars */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Particulars / Description <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={particulars}
              onChange={(e) => setParticulars(e.target.value)}
              placeholder="e.g. Billing for the month of August 2026 (JRS)"
              className={`w-full px-3 py-2 border rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 ${
                errors.particulars ? 'border-rose-500' : 'border-slate-300'
              }`}
            />
            {errors.particulars && (
              <span className="text-xs text-rose-500 mt-1 block">{errors.particulars}</span>
            )}
          </div>

          {/* Amount & Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Amount (₱ - Philippine Peso) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={`w-full px-3 py-2 border rounded-lg text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 ${
                  errors.amount ? 'border-rose-500' : 'border-slate-300'
                }`}
              />
              {errors.amount && (
                <span className="text-xs text-rose-500 mt-1 block">{errors.amount}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Month / Period
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="January 2026">January 2026</option>
                <option value="February 2026">February 2026</option>
                <option value="March 2026">March 2026</option>
                <option value="April 2026">April 2026</option>
                <option value="May 2026">May 2026</option>
                <option value="June 2026">June 2026</option>
                <option value="July 2026">July 2026</option>
                <option value="August 2026">August 2026</option>
                <option value="September 2026">September 2026</option>
                <option value="October 2026">October 2026</option>
                <option value="November 2026">November 2026</option>
                <option value="December 2026">December 2026</option>
              </select>
            </div>
          </div>

          {/* DRN Number & PR Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                DRN Number (Optional)
              </label>
              <input
                type="text"
                value={drnNumber}
                onChange={(e) => setDrnNumber(e.target.value)}
                placeholder="e.g. EXT-F-BS-26-08-57987-S"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Purchase Request No.
              </label>
              <input
                type="text"
                value={purchaseRequestNo}
                onChange={(e) => setPurchaseRequestNo(e.target.value)}
                placeholder="e.g. PR-2026-0042"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Additional Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Additional Remarks / Invoice Ref
            </label>
            <input
              type="text"
              value={additionalRemarks}
              onChange={(e) => setAdditionalRemarks(e.target.value)}
              placeholder="e.g. Billing invoice number 0002321"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Live Budget Impact Preview */}
          <div
            className={`p-3 rounded-lg border text-xs ${
              isExceedingBudget
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            <div className="flex items-center space-x-1.5 font-bold mb-1">
              {isExceedingBudget ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Warning: Exceeds Approved Allotment Cap!</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Budget Impact Assessment</span>
                </>
              )}
            </div>
            <div className="flex justify-between items-center mt-1">
              <span>Account Allotment ({code}):</span>
              <span className="font-mono font-semibold">{formatCurrency(allotment)}</span>
            </div>
            <div className="flex justify-between items-center mt-0.5">
              <span>Projected Utilization:</span>
              <span className="font-mono font-semibold">
                {formatCurrency(projectedUtilized)} ({formatPercent(projectedPercent)})
              </span>
            </div>
            <div className="flex justify-between items-center mt-0.5">
              <span>Remaining Balance:</span>
              <span className="font-mono font-bold">
                {formatCurrency(allotment - projectedUtilized)}
              </span>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {editingItem ? 'Save Changes' : 'Record Disbursement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
