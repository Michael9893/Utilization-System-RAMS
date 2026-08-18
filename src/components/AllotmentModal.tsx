import React, { useState, useEffect } from 'react';
import { ExpenseCategory } from '../types';
import { formatCurrency } from '../utils/calculations';
import { X, Plus, Trash2, Check } from 'lucide-react';

interface AllotmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ExpenseCategory[];
  onSaveCategories: (categories: ExpenseCategory[]) => void;
  initialSelectedCode?: string;
}

export const AllotmentModal: React.FC<AllotmentModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategories,
  initialSelectedCode
}) => {
  const [localCategories, setLocalCategories] = useState<ExpenseCategory[]>([]);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newAllotment, setNewAllotment] = useState('');
  const [newColor, setNewColor] = useState('#6366f1');
  const [showAddRow, setShowAddRow] = useState(false);

  useEffect(() => {
    setLocalCategories(JSON.parse(JSON.stringify(categories)));
  }, [categories, isOpen]);

  if (!isOpen) return null;

  const handleAllotmentChange = (code: string, value: string) => {
    const num = parseFloat(value) || 0;
    setLocalCategories((prev) =>
      prev.map((c) => (c.code === code ? { ...c, allotment: num } : c))
    );
  };

  const handleNameChange = (code: string, name: string) => {
    setLocalCategories((prev) =>
      prev.map((c) => (c.code === code ? { ...c, name } : c))
    );
  };

  const handleDeleteCategory = (code: string) => {
    if (confirm(`Are you sure you want to remove category ${code}?`)) {
      setLocalCategories((prev) => prev.filter((c) => c.code !== code));
    }
  };

  const handleAddCategory = () => {
    if (!newCode.trim() || !newName.trim()) return;
    const parsed = parseFloat(newAllotment) || 0;
    const exists = localCategories.some(
      (c) => c.code.toUpperCase() === newCode.trim().toUpperCase()
    );
    if (exists) {
      alert('A category with this code already exists.');
      return;
    }

    const newCat: ExpenseCategory = {
      code: newCode.trim().toUpperCase(),
      name: newName.trim(),
      allotment: parsed,
      color: newColor
    };

    setLocalCategories([...localCategories, newCat]);
    setNewCode('');
    setNewName('');
    setNewAllotment('');
    setShowAddRow(false);
  };

  const handleSave = () => {
    onSaveCategories(localCategories);
    onClose();
  };

  const totalAllotment = localCategories.reduce((sum, c) => sum + (c.allotment || 0), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">Manage WFP Expense Codes & Allotments</h3>
            <p className="text-xs text-slate-300">
              Update authorized allotment ceilings or create your own custom expense codes
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="space-y-3">
            {localCategories.map((cat) => {
              const isHighlight = initialSelectedCode === cat.code;
              return (
                <div
                  key={cat.code}
                  className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isHighlight
                      ? 'bg-blue-50/80 border-blue-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-[200px]">
                    <span
                      className="px-2.5 py-1 rounded text-xs font-mono font-bold"
                      style={{
                        backgroundColor: `${cat.color}20`,
                        color: cat.color,
                        border: `1px solid ${cat.color}50`
                      }}
                    >
                      {cat.code}
                    </span>
                    <input
                      type="text"
                      value={cat.name}
                      onChange={(e) => handleNameChange(cat.code, e.target.value)}
                      className="text-sm font-medium text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none px-1"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500 font-medium">Allotment:</span>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-mono">
                        ₱
                      </span>
                      <input
                        type="number"
                        step="100"
                        value={cat.allotment}
                        onChange={(e) => handleAllotmentChange(cat.code, e.target.value)}
                        className="pl-6 pr-2 py-1 bg-white border border-slate-300 rounded text-sm font-mono font-bold text-slate-900 w-32 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={() => handleDeleteCategory(cat.code)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Remove Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add custom category toggle */}
          {!showAddRow ? (
            <button
              onClick={() => setShowAddRow(true)}
              className="w-full py-2.5 border-2 border-dashed border-slate-300 hover:border-blue-500 text-slate-600 hover:text-blue-600 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your Own Expense Code</span>
            </button>
          ) : (
            <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-lg space-y-3">
              <span className="text-xs font-bold text-slate-800 block">
                Add New Expense Code
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Code (e.g. COMM)"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono font-bold text-slate-900 uppercase"
                />
                <input
                  type="text"
                  placeholder="Expense Type Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900"
                />
                <input
                  type="number"
                  placeholder="Allotment (₱)"
                  value={newAllotment}
                  onChange={(e) => setNewAllotment(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono text-slate-900"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddRow(false)}
                  className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-3 py-1 text-xs bg-blue-600 text-white font-medium rounded hover:bg-blue-500 cursor-pointer"
                >
                  Add Code
                </button>
              </div>
            </div>
          )}

          {/* Total summary */}
          <div className="p-3 bg-slate-100 rounded-lg flex items-center justify-between text-sm font-bold text-slate-800">
            <span>New Consolidated Allotment:</span>
            <span className="font-mono text-base text-blue-700">
              {formatCurrency(totalAllotment)}
            </span>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors cursor-pointer inline-flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Apply Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
