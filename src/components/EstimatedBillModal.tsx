import React, { useState, useEffect } from 'react';
import { ExpenseCategory, EstimatedBill, BillStatus, BillConfidence } from '../types';
import { X, Calendar, DollarSign, Tag, Building, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

interface EstimatedBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bill: EstimatedBill) => void;
  onConvertToActual?: (bill: EstimatedBill) => void;
  categories: ExpenseCategory[];
  billToEdit?: EstimatedBill | null;
}

export const EstimatedBillModal: React.FC<EstimatedBillModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onConvertToActual,
  categories,
  billToEdit
}) => {
  const [code, setCode] = useState<string>('CS');
  const [particulars, setParticulars] = useState<string>('');
  const [vendor, setVendor] = useState<string>('');
  const [estimatedAmount, setEstimatedAmount] = useState<string>('');
  const [expectedMonth, setExpectedMonth] = useState<string>('August 2026');
  const [expectedDueDate, setExpectedDueDate] = useState<string>('');
  const [status, setStatus] = useState<BillStatus>('estimated');
  const [confidence, setConfidence] = useState<BillConfidence>('recurring_scheduled');
  const [purchaseRequestNo, setPurchaseRequestNo] = useState<string>('');
  const [drnNumber, setDrnNumber] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState<boolean>(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  useEffect(() => {
    if (billToEdit) {
      setCode(billToEdit.code);
      setParticulars(billToEdit.particulars);
      setVendor(billToEdit.vendor || '');
      setEstimatedAmount(billToEdit.estimatedAmount.toString());
      setExpectedMonth(billToEdit.expectedMonth);
      setExpectedDueDate(billToEdit.expectedDueDate || '');
      setStatus(billToEdit.status);
      setConfidence(billToEdit.confidence);
      setPurchaseRequestNo(billToEdit.purchaseRequestNo || '');
      setDrnNumber(billToEdit.drnNumber || '');
      setRemarks(billToEdit.remarks || '');
      setIsRecurring(billToEdit.isRecurring ?? true);
    } else {
      setCode('CS');
      setParticulars('');
      setVendor('JRS Express Inc.');
      setEstimatedAmount('');
      setExpectedMonth('August 2026');
      setExpectedDueDate('2026-08-31');
      setStatus('estimated');
      setConfidence('recurring_scheduled');
      setPurchaseRequestNo('');
      setDrnNumber('');
      setRemarks('');
      setIsRecurring(true);
    }
    setErrors({});
  }, [billToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!particulars.trim()) newErrors.particulars = 'Particulars/description is required.';
    const num = parseFloat(estimatedAmount);
    if (isNaN(num) || num <= 0) newErrors.estimatedAmount = 'Enter a valid estimated amount (₱ > 0).';
    if (!code) newErrors.code = 'Expense Category is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const billData: EstimatedBill = {
      id: billToEdit?.id || `BILL-EST-${Date.now().toString().slice(-6)}`,
      code,
      particulars: particulars.trim(),
      vendor: vendor.trim(),
      estimatedAmount: parseFloat(estimatedAmount),
      expectedMonth,
      expectedDueDate: expectedDueDate || undefined,
      status,
      confidence,
      purchaseRequestNo: purchaseRequestNo.trim() || undefined,
      drnNumber: drnNumber.trim() || undefined,
      remarks: remarks.trim() || undefined,
      isRecurring
    };

    onSave(billData);
    onClose();
  };

  const handlePostDirectly = () => {
    if (!validate()) return;
    if (onConvertToActual) {
      const billData: EstimatedBill = {
        id: billToEdit?.id || `BILL-EST-${Date.now().toString().slice(-6)}`,
        code,
        particulars: particulars.trim(),
        vendor: vendor.trim(),
        estimatedAmount: parseFloat(estimatedAmount),
        expectedMonth,
        expectedDueDate: expectedDueDate || undefined,
        status: 'paid',
        confidence,
        purchaseRequestNo: purchaseRequestNo.trim() || undefined,
        drnNumber: drnNumber.trim() || undefined,
        remarks: remarks.trim() || undefined,
        isRecurring
      };
      onConvertToActual(billData);
      onClose();
    }
  };

  const selectedCategoryObj = categories.find((c) => c.code === code);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div>
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider border border-blue-400/30">
              {billToEdit ? 'Edit Upcoming Bill' : 'New Upcoming Bill Estimate'}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
              {billToEdit ? 'Modify Estimated Bill' : 'Project Next Bill / Obligation'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm overflow-y-auto flex-1">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              <span>Expense Account / Code *</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const isSelected = code === cat.code;
                return (
                  <button
                    key={cat.code}
                    type="button"
                    onClick={() => {
                      setCode(cat.code);
                      if (!particulars) {
                        if (cat.code === 'CS') {
                          setVendor('JRS Express Inc.');
                          setParticulars(`JRS Waybill Courier Charge Invoice - ${expectedMonth}`);
                          setEstimatedAmount('6200');
                        } else if (cat.code === 'PS') {
                          setVendor('Philippine Postal Corporation');
                          setParticulars(`Official Postal Mailing Invoice - ${expectedMonth}`);
                          setEstimatedAmount('2100');
                        } else if (cat.code === 'TEV') {
                          setVendor('RAMS Field Staff');
                          setParticulars(`Estimated Travel Claim - ${expectedMonth}`);
                          setEstimatedAmount('1200');
                        } else if (cat.code === 'RE') {
                          setVendor('Regional Convention Venue');
                          setParticulars('Semestral RC Meeting Catering & Logistics');
                          setEstimatedAmount('60000');
                        } else if (cat.code === 'HE') {
                          setVendor('Trucking Logistics Provider');
                          setParticulars('Quarterly Records Disposal & Hauling');
                          setEstimatedAmount('1200');
                        }
                      }
                    }}
                    className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs" style={{ color: cat.color }}>
                        {cat.code}
                      </span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <div className="text-[11px] font-medium text-slate-700 truncate mt-0.5">
                      {cat.name}
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.code && <p className="text-xs text-rose-500 mt-1">{errors.code}</p>}
          </div>

          {/* Particulars */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Bill Particulars / Service Description *</span>
            </label>
            <input
              type="text"
              value={particulars}
              onChange={(e) => setParticulars(e.target.value)}
              placeholder="e.g. JRS Waybill Courier Charge Invoice for August 2026"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
            {errors.particulars && <p className="text-xs text-rose-500 mt-1">{errors.particulars}</p>}
          </div>

          {/* Vendor / Payee & Estimated Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center space-x-1">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                <span>Vendor / Payee</span>
              </label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="e.g. JRS Express / PhilPost / Hotel"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center space-x-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Estimated Amount in Philippine Peso (₱) *</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-bold font-mono">
                  ₱
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={estimatedAmount}
                  onChange={(e) => setEstimatedAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-mono font-bold"
                />
              </div>
              {errors.estimatedAmount && (
                <p className="text-xs text-rose-500 mt-1">{errors.estimatedAmount}</p>
              )}
            </div>
          </div>

          {/* Expected Billing Month & Expected Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>Expected Billing Month</span>
              </label>
              <select
                value={expectedMonth}
                onChange={(e) => setExpectedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
              >
                {monthOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Expected Due Date (Optional)
              </label>
              <input
                type="date"
                value={expectedDueDate}
                onChange={(e) => setExpectedDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>

          {/* Status & Confidence Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Obligation / Bill Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BillStatus)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
              >
                <option value="estimated">Estimated (Upcoming Pipeline)</option>
                <option value="obligated">Obligated (PO / PR Issued)</option>
                <option value="invoiced">Invoiced (Charge Invoice Received)</option>
                <option value="paid">Paid (Disbursed & Settled)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Confidence / Schedule Type
              </label>
              <select
                value={confidence}
                onChange={(e) => setConfidence(e.target.value as BillConfidence)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
              >
                <option value="recurring_scheduled">Recurring Monthly Contract</option>
                <option value="high">High (Known Contract / Approved PR)</option>
                <option value="medium">Medium (Historical Average)</option>
                <option value="tentative">Tentative (Contingency Demand)</option>
              </select>
            </div>
          </div>

          {/* Purchase Request No & DRN Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Purchase Request (PR) No.
              </label>
              <input
                type="text"
                value={purchaseRequestNo}
                onChange={(e) => setPurchaseRequestNo(e.target.value)}
                placeholder="e.g. PR-2026-RAMS-044"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                DRN Number
              </label>
              <input
                type="text"
                value={drnNumber}
                onChange={(e) => setDrnNumber(e.target.value)}
                placeholder="e.g. EXT-F-BS-26-08-..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-mono text-xs"
              />
            </div>
          </div>

          {/* Remarks & Recurring Checkbox */}
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Additional Remarks / Billing Reference
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Invoice # 0004921, Waybill batch 1-31"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>

            <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span>Mark as recurring monthly operational utility/service bill</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              {onConvertToActual && (
                <button
                  type="button"
                  onClick={handlePostDirectly}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-sm transition-colors cursor-pointer w-full sm:w-auto justify-center"
                  title="Mark as paid and record into the actual disbursement ledger immediately"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Convert & Post to Ledger</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                {billToEdit ? 'Save Changes' : 'Add Bill Estimate'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
