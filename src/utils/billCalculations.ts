import {
  ExpenseCategory,
  LedgerItem,
  EstimatedBill,
  BillEstimationOverview,
  BillCategorySolvency
} from '../types';

export function calculateBillEstimationOverview(
  categories: ExpenseCategory[],
  ledgerItems: LedgerItem[],
  estimatedBills: EstimatedBill[]
): BillEstimationOverview {
  // Only count bills that haven't already been converted to 'paid' (active pipeline)
  const activeBills = estimatedBills.filter((b) => b.status !== 'paid');

  const solvencyBreakdown: BillCategorySolvency[] = categories.map((cat) => {
    const catCode = cat.code;
    const catAllotment = cat.allotment;

    // Actual utilized to date from ledger
    const utilizedToDate = ledgerItems
      .filter((item) => item.code.toUpperCase() === catCode.toUpperCase())
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    const unutilizedBalance = Math.max(0, catAllotment - utilizedToDate);

    // Active bills for this category
    const catBills = activeBills.filter(
      (b) => b.code.toUpperCase() === catCode.toUpperCase()
    );

    const totalEstimatedBills = catBills.reduce(
      (sum, b) => sum + (Number(b.estimatedAmount) || 0),
      0
    );

    const obligatedBillsAmount = catBills
      .filter((b) => b.status === 'obligated' || b.status === 'invoiced')
      .reduce((sum, b) => sum + (Number(b.estimatedAmount) || 0), 0);

    const pendingEstimatedBillsAmount = catBills
      .filter((b) => b.status === 'estimated')
      .reduce((sum, b) => sum + (Number(b.estimatedAmount) || 0), 0);

    const projectedNetVariance = unutilizedBalance - totalEstimatedBills;

    let solvencyStatus: 'solvent' | 'deficit_warning' | 'critical_overdraft' | 'surplus_excess' = 'solvent';
    let solvencyMessage = 'Budget allotment comfortably covers all projected upcoming bills.';

    if (projectedNetVariance < 0) {
      solvencyStatus = Math.abs(projectedNetVariance) > 2000 ? 'critical_overdraft' : 'deficit_warning';
      solvencyMessage = `Deficit of ₱${Math.abs(projectedNetVariance).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })} projected. Augmentation or realignment required.`;
    } else if (projectedNetVariance > catAllotment * 0.45 && catAllotment > 15000) {
      solvencyStatus = 'surplus_excess';
      solvencyMessage = `Surplus of ₱${projectedNetVariance.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })} remaining after all projected bills. Available for realignment.`;
    } else if (projectedNetVariance === 0) {
      solvencyStatus = 'solvent';
      solvencyMessage = '100% absorption anticipated. Exactly on budget.';
    }

    return {
      code: catCode,
      name: cat.name,
      color: cat.color || '#64748b',
      allotment: catAllotment,
      utilizedToDate,
      unutilizedBalance,
      totalEstimatedBills,
      obligatedBillsAmount,
      pendingEstimatedBillsAmount,
      projectedNetVariance,
      solvencyStatus,
      solvencyMessage,
      billCount: catBills.length
    };
  });

  const totalAllotment = categories.reduce((sum, c) => sum + c.allotment, 0);
  const totalUtilized = ledgerItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  const totalEstimatedUpcomingBills = activeBills.reduce(
    (sum, b) => sum + (Number(b.estimatedAmount) || 0),
    0
  );

  const totalObligatedBills = activeBills
    .filter((b) => b.status === 'obligated' || b.status === 'invoiced')
    .reduce((sum, b) => sum + (Number(b.estimatedAmount) || 0), 0);

  const totalPendingBills = activeBills
    .filter((b) => b.status === 'estimated')
    .reduce((sum, b) => sum + (Number(b.estimatedAmount) || 0), 0);

  const projectedYearEndSpend = totalUtilized + totalEstimatedUpcomingBills;
  const projectedYearEndNetSavings = totalAllotment - projectedYearEndSpend;
  const projectedYearEndAbsorptionPct =
    totalAllotment > 0 ? (projectedYearEndSpend / totalAllotment) * 100 : 0;

  return {
    totalEstimatedUpcomingBills,
    totalObligatedBills,
    totalPendingBills,
    projectedYearEndSpend,
    projectedYearEndNetSavings,
    projectedYearEndAbsorptionPct,
    solvencyBreakdown,
    upcomingBills: estimatedBills
  };
}

/**
 * Auto-generates intelligent recurring bill projections for August - December 2026
 */
export function generateAutoProjectedBills(
  categories: ExpenseCategory[],
  ledgerItems: LedgerItem[]
): EstimatedBill[] {
  const months = [
    { name: 'August 2026', due: '2026-08-31' },
    { name: 'September 2026', due: '2026-09-30' },
    { name: 'October 2026', due: '2026-10-31' },
    { name: 'November 2026', due: '2026-11-30' },
    { name: 'December 2026', due: '2026-12-20' }
  ];

  const generatedBills: EstimatedBill[] = [];
  let idCounter = 1;

  // 1. Courier Services (CS)
  months.forEach((m) => {
    generatedBills.push({
      id: `AUTO-BILL-${String(idCounter++).padStart(3, '0')}`,
      code: 'CS',
      particulars: `JRS Waybill Charge Invoice - ${m.name}`,
      vendor: 'JRS Express Inc.',
      estimatedAmount: 6200.0,
      expectedMonth: m.name,
      expectedDueDate: m.due,
      status: m.name === 'August 2026' ? 'invoiced' : 'estimated',
      confidence: 'recurring_scheduled',
      isRecurring: true,
      remarks: 'Estimated monthly courier mailing bill'
    });
  });

  // 2. Postal Services (PS)
  months.forEach((m) => {
    generatedBills.push({
      id: `AUTO-BILL-${String(idCounter++).padStart(3, '0')}`,
      code: 'PS',
      particulars: `Postal Mailing Invoice - ${m.name}`,
      vendor: 'Philippine Postal Corporation',
      estimatedAmount: 2100.0,
      expectedMonth: m.name,
      expectedDueDate: m.due,
      status: m.name === 'August 2026' ? 'invoiced' : 'estimated',
      confidence: 'recurring_scheduled',
      isRecurring: true,
      remarks: 'Estimated monthly official mailings'
    });
  });

  // 3. Semestral RC Meeting (RE)
  generatedBills.push({
    id: `AUTO-BILL-${String(idCounter++).padStart(3, '0')}`,
    code: 'RE',
    particulars: 'Semestral RC Coordination Meeting Venue & Catering',
    vendor: 'Regional Convention & Catering',
    estimatedAmount: 60000.0,
    expectedMonth: 'October 2026',
    expectedDueDate: '2026-10-25',
    status: 'obligated',
    confidence: 'high',
    purchaseRequestNo: 'PR-2026-RAMS-044',
    isRecurring: false,
    remarks: 'Approved Semestral Regional Meeting (H2)'
  });

  // 4. Traveling Expense (TEV)
  months.forEach((m) => {
    generatedBills.push({
      id: `AUTO-BILL-${String(idCounter++).padStart(3, '0')}`,
      code: 'TEV',
      particulars: `TEV Field Travel Claim - ${m.name}`,
      vendor: 'RAMS Field Officers',
      estimatedAmount: 1100.0,
      expectedMonth: m.name,
      expectedDueDate: m.due,
      status: 'estimated',
      confidence: 'medium',
      isRecurring: true,
      remarks: 'Reimbursement for regional monitoring travel'
    });
  });

  // 5. Hauling (HE)
  generatedBills.push({
    id: `AUTO-BILL-${String(idCounter++).padStart(3, '0')}`,
    code: 'HE',
    particulars: 'Quarterly Records Disposal & Hauling Fee',
    vendor: 'RAMS Trucking Logistics',
    estimatedAmount: 1200.0,
    expectedMonth: 'September 2026',
    expectedDueDate: '2026-09-20',
    status: 'estimated',
    confidence: 'medium',
    isRecurring: false,
    remarks: 'Disposal of obsolete documents'
  });

  generatedBills.push({
    id: `AUTO-BILL-${String(idCounter++).padStart(3, '0')}`,
    code: 'HE',
    particulars: 'Year-End Warehouse & Storage Hauling',
    vendor: 'RAMS Trucking Logistics',
    estimatedAmount: 1500.0,
    expectedMonth: 'November 2026',
    expectedDueDate: '2026-11-20',
    status: 'estimated',
    confidence: 'medium',
    isRecurring: false,
    remarks: 'Supplies transfer & storage'
  });

  return generatedBills;
}

/**
 * Exports CSV report of upcoming bills, obligations, and solvency analysis
 */
export function exportBillsEstimationCSV(
  overview: BillEstimationOverview,
  categories: ExpenseCategory[]
) {
  const lines: string[] = [];

  lines.push('"RAMS ADMINISTRATIVE COSTS - UPCOMING BILLS ESTIMATION & SOLVENCY REPORT"');
  lines.push(`"Export Date: ${new Date().toLocaleString()}"`);
  lines.push(`"Total Estimated Upcoming Pipeline: ₱${overview.totalEstimatedUpcomingBills.toFixed(2)}"`);
  lines.push(`"Projected Year-End Absorption: ${overview.projectedYearEndAbsorptionPct.toFixed(2)}%"`);
  lines.push('');

  // 1. SOLVENCY BREAKDOWN
  lines.push('"SECTION 1: BUDGET SOLVENCY & UPCOMING OBLIGATIONS BY CATEGORY"');
  lines.push(
    '"Code","Account Name","Allotment (₱)","Utilized (Jan-Jul) (₱)","Unutilized (₱)","Estimated Next Bills (₱)","Obligated Bills (₱)","Pending Bills (₱)","Projected Net Variance (₱)","Solvency Status","Operational Assessment"'
  );

  overview.solvencyBreakdown.forEach((s) => {
    lines.push(
      `"${s.code}","${s.name}",${s.allotment.toFixed(2)},${s.utilizedToDate.toFixed(2)},${s.unutilizedBalance.toFixed(2)},${s.totalEstimatedBills.toFixed(2)},${s.obligatedBillsAmount.toFixed(2)},${s.pendingEstimatedBillsAmount.toFixed(2)},${s.projectedNetVariance.toFixed(2)},"${s.solvencyStatus}","${s.solvencyMessage.replace(/"/g, '""')}"`
    );
  });
  lines.push('');

  // 2. ITEMIZED UPCOMING BILLS
  lines.push('"SECTION 2: SCHEDULED & PROJECTED UPCOMING BILLS PIPELINE (AUG - DEC 2026)"');
  lines.push(
    '"Bill ID","Code","Particulars","Vendor / Payee","Estimated Amount (₱)","Expected Month","Due Date","Status","Confidence","PR Number","DRN Number","Remarks"'
  );

  overview.upcomingBills.forEach((b) => {
    lines.push(
      `"${b.id}","${b.code}","${b.particulars.replace(/"/g, '""')}","${(b.vendor || '-').replace(/"/g, '""')}",${b.estimatedAmount.toFixed(2)},"${b.expectedMonth}","${b.expectedDueDate || '-'}","${b.status}","${b.confidence}","${b.purchaseRequestNo || '-'}","${b.drnNumber || '-'}","${(b.remarks || '-').replace(/"/g, '""')}"`
    );
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute(
    'download',
    `RAMS_Upcoming_Bills_Estimation_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
