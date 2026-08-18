import { ExpenseCategory, LedgerItem, CategorySummary } from '../types';

export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '₱0.00';
  return '₱' + amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function formatPercent(value: number): string {
  if (isNaN(value)) return '0.00%';
  return `${value.toFixed(2)}%`;
}

export function calculateSummaries(
  categories: ExpenseCategory[],
  ledgerItems: LedgerItem[]
): {
  categorySummaries: CategorySummary[];
  totalAllotment: number;
  totalUtilized: number;
  totalPercentUtilized: number;
  totalUnutilized: number;
  totalPercentUnutilized: number;
  itemCount: number;
} {
  // Aggregate utilized amount per category code
  const spentByCode: Record<string, { total: number; count: number }> = {};
  
  categories.forEach(c => {
    spentByCode[c.code] = { total: 0, count: 0 };
  });

  ledgerItems.forEach(item => {
    const code = item.code.trim().toUpperCase();
    if (!spentByCode[code]) {
      spentByCode[code] = { total: 0, count: 0 };
    }
    spentByCode[code].total += item.amount || 0;
    spentByCode[code].count += 1;
  });

  const categorySummaries: CategorySummary[] = categories.map(cat => {
    const code = cat.code.trim().toUpperCase();
    const stats = spentByCode[code] || { total: 0, count: 0 };
    const amountUtilized = stats.total;
    const allotment = cat.allotment || 0;
    const unutilizedAmount = allotment - amountUtilized;
    const percentUtilized = allotment > 0 ? (amountUtilized / allotment) * 100 : 0;
    const percentUnutilized = allotment > 0 ? (unutilizedAmount / allotment) * 100 : 0;

    return {
      code: cat.code,
      name: cat.name,
      allotment,
      amountUtilized,
      percentUtilized,
      unutilizedAmount,
      percentUnutilized,
      color: cat.color || '#6366f1',
      transactionCount: stats.count
    };
  });

  const totalAllotment = categories.reduce((sum, c) => sum + (c.allotment || 0), 0);
  const totalUtilized = ledgerItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalUnutilized = totalAllotment - totalUtilized;
  const totalPercentUtilized = totalAllotment > 0 ? (totalUtilized / totalAllotment) * 100 : 0;
  const totalPercentUnutilized = totalAllotment > 0 ? (totalUnutilized / totalAllotment) * 100 : 0;

  return {
    categorySummaries,
    totalAllotment,
    totalUtilized,
    totalPercentUtilized,
    totalUnutilized,
    totalPercentUnutilized,
    itemCount: ledgerItems.length
  };
}

export function exportToCSV(
  categories: ExpenseCategory[],
  ledgerItems: LedgerItem[],
  summaries: CategorySummary[]
) {
  const lines: string[] = [];

  // Title
  lines.push('"ADMINISTRATIVE COSTS OF RAMS PER APPROVED CONSOLIDATED WFP"');
  lines.push('"Generated: ' + new Date().toLocaleString() + '"');
  lines.push('');

  // Summary Table
  lines.push('"CONSOLIDATED WFP ALLOTMENT & UTILIZATION SUMMARY (IN PHILIPPINE PESO ₱)"');
  lines.push('"Code","Type of Expense","Allotment (per WFP) (₱)","Amount Utilized (₱)","% of Utilization","Unutilized Amount (₱)","% of Un-utilized","Txn Count"');
  
  let totAllot = 0;
  let totUtil = 0;
  let totUnutil = 0;

  summaries.forEach(s => {
    totAllot += s.allotment;
    totUtil += s.amountUtilized;
    totUnutil += s.unutilizedAmount;
    lines.push(`"${s.code}","${s.name}",${s.allotment.toFixed(2)},${s.amountUtilized.toFixed(2)},"${s.percentUtilized.toFixed(2)}%",${s.unutilizedAmount.toFixed(2)},"${s.percentUnutilized.toFixed(2)}%",${s.transactionCount}`);
  });

  const totPctUtil = totAllot > 0 ? (totUtil / totAllot) * 100 : 0;
  const totPctUnutil = totAllot > 0 ? (totUnutil / totAllot) * 100 : 0;
  lines.push(`"TOTAL:","All Categories",${totAllot.toFixed(2)},${totUtil.toFixed(2)},"${totPctUtil.toFixed(2)}%",${totUnutil.toFixed(2)},"${totPctUnutil.toFixed(2)}%",${ledgerItems.length}`);
  lines.push('');

  // Benchmarks
  lines.push('"BENCHMARKS & COMPARATIVE TARGETS"');
  lines.push('"RGASS TOTAL ON WFP",345000.00,105764.00,"30.66%",239236.00,"69.34%"');
  lines.push('"ADJUSTED RGASS TOTAL ON WFP",285000.00,105764.00,"37.11%",179236.00,"62.89%"');
  lines.push('');

  // Ledger Table
  lines.push('"DETAILED DISBURSEMENT & EXPENSE LEDGER"');
  lines.push('"Item #","Code","Expense Category","DRN Number","Purchase Request No.","Particulars","Addt\'l Remarks","Month / Period","Date","Amount (₱ - Philippine Peso)"');
  
  ledgerItems.forEach((item, index) => {
    const cat = categories.find(c => c.code === item.code);
    lines.push(
      `"${index + 1}","${item.code}","${cat ? cat.name : item.code}","${item.drnNumber || ''}","${item.purchaseRequestNo || ''}","${item.particulars.replace(/"/g, '""')}","${(item.additionalRemarks || '').replace(/"/g, '""')}","${item.month || ''}","${item.date || ''}",${item.amount.toFixed(2)}`
    );
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `RAMS_WFP_Administrative_Costs_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
