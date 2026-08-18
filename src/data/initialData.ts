import { ExpenseCategory, LedgerItem, EstimatedBill } from '../types';

export const INITIAL_CATEGORIES: ExpenseCategory[] = [
  {
    code: 'TEV',
    name: 'Traveling Expense',
    allotment: 4585.00,
    description: 'Travel expenses and official trip allowances',
    color: '#0284c7' // sky-600
  },
  {
    code: 'RE',
    name: 'Semestral RC Meeting',
    allotment: 60000.00,
    description: 'Regional coordination meetings and semestral conferences',
    color: '#8b5cf6' // violet-500
  },
  {
    code: 'HE',
    name: 'Hauling Expenses',
    allotment: 8000.00,
    description: 'Material transportation, hauling, and disposal logistics',
    color: '#f59e0b' // amber-500
  },
  {
    code: 'PS',
    name: 'Postal Services',
    allotment: 109000.00,
    description: 'Official postal mailings and dispatch invoices',
    color: '#10b981' // emerald-500
  },
  {
    code: 'SC',
    name: 'Office Supplies Sacks',
    allotment: 42000.00,
    description: 'Procurement of sacks and office storage consumables',
    color: '#ec4899' // pink-500
  },
  {
    code: 'CS',
    name: 'Courier Services',
    allotment: 134000.00,
    description: 'JRS express waybill billings and courier shipments',
    color: '#6366f1' // indigo-500
  }
];

export const INITIAL_LEDGER_ITEMS: LedgerItem[] = [
  {
    id: 'TXN-001',
    code: 'TEV',
    drnNumber: '',
    purchaseRequestNo: '',
    particulars: 'TEV for the Month of January of Yana',
    additionalRemarks: '1939',
    amount: 1200.00,
    month: 'January 2026',
    date: '2026-01-15'
  },
  {
    id: 'TXN-002',
    code: 'PS',
    drnNumber: '',
    purchaseRequestNo: '',
    particulars: 'Billing for the month of January 2026 (Postal)',
    additionalRemarks: '',
    amount: 5687.00,
    month: 'January 2026',
    date: '2026-01-31'
  },
  {
    id: 'TXN-003',
    code: 'CS',
    drnNumber: '',
    purchaseRequestNo: '',
    particulars: 'Billing for the month of January 2026 (JRS)',
    additionalRemarks: '',
    amount: 9937.00,
    month: 'January 2026',
    date: '2026-01-31'
  },
  {
    id: 'TXN-004',
    code: 'CS',
    drnNumber: 'EXT-F-BS-26-03-17497-S',
    purchaseRequestNo: '',
    particulars: 'Billing for the month of February 2026 (JRS)',
    additionalRemarks: '',
    amount: 5923.00,
    month: 'February 2026',
    date: '2026-02-28'
  },
  {
    id: 'TXN-005',
    code: 'TEV',
    drnNumber: '',
    purchaseRequestNo: '',
    particulars: 'TEV for the Month of February of Yana',
    additionalRemarks: '',
    amount: 1165.00,
    month: 'February 2026',
    date: '2026-02-15'
  },
  {
    id: 'TXN-006',
    code: 'HE',
    drnNumber: '',
    purchaseRequestNo: '',
    particulars: 'JANUARY  - HAULING EXPENSE',
    additionalRemarks: '',
    amount: 1074.00,
    month: 'January 2026',
    date: '2026-01-20'
  },
  {
    id: 'TXN-007',
    code: 'HE',
    drnNumber: '',
    purchaseRequestNo: '',
    particulars: 'FEBRUARY - HAULING EXPENSE',
    additionalRemarks: '',
    amount: 539.00,
    month: 'February 2026',
    date: '2026-02-20'
  },
  {
    id: 'TXN-008',
    code: 'PS',
    drnNumber: '',
    purchaseRequestNo: '',
    particulars: 'Billing for the month of February 2026 (Postal)',
    additionalRemarks: '',
    amount: 10635.00,
    month: 'February 2026',
    date: '2026-02-28'
  },
  {
    id: 'TXN-009',
    code: 'HE',
    drnNumber: '',
    purchaseRequestNo: '',
    particulars: 'MARCH - HAULING EXPENSE',
    additionalRemarks: '',
    amount: 326.00,
    month: 'March 2026',
    date: '2026-03-20'
  },
  {
    id: 'TXN-010',
    code: 'PS',
    drnNumber: '',
    purchaseRequestNo: '',
    particulars: 'Billing for the month of March 2026 (Postal)',
    additionalRemarks: '',
    amount: 990.00,
    month: 'March 2026',
    date: '2026-03-31'
  },
  {
    id: 'TXN-011',
    code: 'HE',
    drnNumber: '',
    purchaseRequestNo: '',
    particulars: 'Hauling  1 April 2026',
    additionalRemarks: '',
    amount: 790.00,
    month: 'April 2026',
    date: '2026-04-01'
  },
  {
    id: 'TXN-012',
    code: 'HE',
    drnNumber: '',
    purchaseRequestNo: '',
    particulars: 'NAP Disposal  7 April 2026',
    additionalRemarks: '',
    amount: 600.00,
    month: 'April 2026',
    date: '2026-04-07'
  },
  {
    id: 'TXN-013',
    code: 'PS',
    drnNumber: '',
    purchaseRequestNo: '',
    particulars: 'Billing for the month of April 2026 (Postal)',
    additionalRemarks: 'Billing invoice number 0002321',
    amount: 899.00,
    month: 'April 2026',
    date: '2026-04-30'
  },
  {
    id: 'TXN-014',
    code: 'CS',
    drnNumber: 'EXT-F-BS-26-04-27143-S',
    purchaseRequestNo: '',
    particulars: 'Billing for the month of March 2026 (JRS)',
    additionalRemarks: '',
    amount: 4858.50,
    month: 'March 2026',
    date: '2026-03-31'
  },
  {
    id: 'TXN-015',
    code: 'CS',
    drnNumber: 'EXT-F-BS-26-05-34539-S',
    purchaseRequestNo: '',
    particulars: 'Billing for the month of April 2026 (JRS)',
    additionalRemarks: '',
    amount: 2841.50,
    month: 'April 2026',
    date: '2026-04-30'
  },
  {
    id: 'TXN-016',
    code: 'SC',
    drnNumber: '',
    purchaseRequestNo: '',
    particulars: 'Procurement of Sack',
    additionalRemarks: '',
    amount: 42000.00,
    month: 'May 2026',
    date: '2026-05-10'
  },
  {
    id: 'TXN-017',
    code: 'CS',
    drnNumber: 'EXT-F-BS-26-06-42422-S',
    purchaseRequestNo: '',
    particulars: 'Billing for the month of May 2026 (JRS)',
    additionalRemarks: '',
    amount: 4241.50,
    month: 'May 2026',
    date: '2026-05-31'
  },
  {
    id: 'TXN-018',
    code: 'PS',
    drnNumber: 'EXT-A-COMM-26-06-46723-S',
    purchaseRequestNo: '',
    particulars: 'Billing for the month of May 2026 (Postal)',
    additionalRemarks: '',
    amount: 1348.00,
    month: 'May 2026',
    date: '2026-05-31'
  },
  {
    id: 'TXN-019',
    code: 'TEV',
    drnNumber: 'I-FO-AD-RAMS-A-COMM-26-06-41978-S',
    purchaseRequestNo: '',
    particulars: 'TEV for the Month of May 2026 - MJB',
    additionalRemarks: '',
    amount: 465.00,
    month: 'May 2026',
    date: '2026-05-15'
  },
  {
    id: 'TXN-020',
    code: 'CS',
    drnNumber: 'EXT-BS-26-07-50097-S',
    purchaseRequestNo: '',
    particulars: 'Billing for the month of June 2026 (JRS)',
    additionalRemarks: '',
    amount: 5121.50,
    month: 'June 2026',
    date: '2026-06-30'
  },
  {
    id: 'TXN-021',
    code: 'PS',
    drnNumber: 'EXT-F-BS-26-07-50098-S',
    purchaseRequestNo: '',
    particulars: 'Billing for the month of June 2026 (Postal)',
    additionalRemarks: '',
    amount: 1080.00,
    month: 'June 2026',
    date: '2026-06-30'
  },
  {
    id: 'TXN-022',
    code: 'TEV',
    drnNumber: 'I-FO-AD-RAMS-A-COMM-26-07-50173-S',
    purchaseRequestNo: '',
    particulars: 'TEV FOR THE MONTH OF JUNE 2026 - M. BANIQUED',
    additionalRemarks: '',
    amount: 1250.00,
    month: 'June 2026',
    date: '2026-06-15'
  },
  {
    id: 'TXN-023',
    code: 'CS',
    drnNumber: 'EXT-F-BS-26-08-57987-S',
    purchaseRequestNo: '',
    particulars: 'JRS WAYBILL CHARGE INVOICE FOR THE PERIOD OF 1-31 JULY 2026 ₱10,202.00',
    additionalRemarks: '53,562.00',
    amount: 10202.00,
    month: 'July 2026',
    date: '2026-07-31'
  },
  {
    id: 'TXN-024',
    code: 'TEV',
    drnNumber: '',
    purchaseRequestNo: '',
    particulars: 'TEV for the Month of July 2026 - MJB',
    additionalRemarks: '',
    amount: 505.00,
    month: 'July 2026',
    date: '2026-07-15'
  }
];

export const RGASS_BENCHMARK = {
  standard: {
    name: 'RGASS TOTAL ON WFP',
    allotment: 345000.00,
    utilized: 105764.00,
    percentUtilized: 30.66,
    unutilized: 239236.00,
    percentUnutilized: 69.34
  },
  adjusted: {
    name: 'ADJUSTED RGASS TOTAL ON WFP',
    allotment: 285000.00,
    utilized: 105764.00,
    percentUtilized: 37.11,
    unutilized: 179236.00,
    percentUnutilized: 62.89
  }
};

export const INITIAL_ESTIMATED_BILLS: EstimatedBill[] = [
  // 1. Courier Services (CS) - Projected monthly bills based on ~₱6,160/mo
  {
    id: 'BILL-EST-001',
    code: 'CS',
    particulars: 'JRS Waybill Courier Charge Invoice - August 2026',
    vendor: 'JRS Express Inc.',
    estimatedAmount: 6500.00,
    expectedMonth: 'August 2026',
    expectedDueDate: '2026-08-31',
    status: 'invoiced',
    confidence: 'recurring_scheduled',
    drnNumber: 'PENDING-CS-AUG26',
    remarks: 'Expected end-of-month courier billing',
    isRecurring: true
  },
  {
    id: 'BILL-EST-002',
    code: 'CS',
    particulars: 'JRS Waybill Courier Charge Invoice - September 2026',
    vendor: 'JRS Express Inc.',
    estimatedAmount: 6100.00,
    expectedMonth: 'September 2026',
    expectedDueDate: '2026-09-30',
    status: 'estimated',
    confidence: 'recurring_scheduled',
    remarks: 'Projected monthly dispatch billing',
    isRecurring: true
  },
  {
    id: 'BILL-EST-003',
    code: 'CS',
    particulars: 'JRS Waybill Courier Charge Invoice - October 2026',
    vendor: 'JRS Express Inc.',
    estimatedAmount: 6250.00,
    expectedMonth: 'October 2026',
    expectedDueDate: '2026-10-31',
    status: 'estimated',
    confidence: 'recurring_scheduled',
    remarks: 'Projected monthly dispatch billing',
    isRecurring: true
  },
  {
    id: 'BILL-EST-004',
    code: 'CS',
    particulars: 'JRS Waybill Courier Charge Invoice - November 2026',
    vendor: 'JRS Express Inc.',
    estimatedAmount: 6000.00,
    expectedMonth: 'November 2026',
    expectedDueDate: '2026-11-30',
    status: 'estimated',
    confidence: 'recurring_scheduled',
    remarks: 'Projected monthly dispatch billing',
    isRecurring: true
  },
  {
    id: 'BILL-EST-005',
    code: 'CS',
    particulars: 'JRS Waybill Courier Charge Invoice - December 2026',
    vendor: 'JRS Express Inc.',
    estimatedAmount: 6300.00,
    expectedMonth: 'December 2026',
    expectedDueDate: '2026-12-20',
    status: 'estimated',
    confidence: 'recurring_scheduled',
    remarks: 'Year-end reconciliation & closing bill',
    isRecurring: true
  },

  // 2. Postal Services (PS) - Projected monthly bills based on ~₱2,000/mo
  {
    id: 'BILL-EST-006',
    code: 'PS',
    particulars: 'Official Postal Mailing Invoice - August 2026',
    vendor: 'Philippine Postal Corporation (PhilPost)',
    estimatedAmount: 1850.00,
    expectedMonth: 'August 2026',
    expectedDueDate: '2026-08-31',
    status: 'invoiced',
    confidence: 'recurring_scheduled',
    drnNumber: 'PENDING-PS-AUG26',
    remarks: 'Postal bill for August official dispatches',
    isRecurring: true
  },
  {
    id: 'BILL-EST-007',
    code: 'PS',
    particulars: 'Official Postal Mailing Invoice - September 2026',
    vendor: 'Philippine Postal Corporation (PhilPost)',
    estimatedAmount: 2100.00,
    expectedMonth: 'September 2026',
    expectedDueDate: '2026-09-30',
    status: 'estimated',
    confidence: 'recurring_scheduled',
    remarks: 'Projected postal billing',
    isRecurring: true
  },
  {
    id: 'BILL-EST-008',
    code: 'PS',
    particulars: 'Official Postal Mailing Invoice - October 2026',
    vendor: 'Philippine Postal Corporation (PhilPost)',
    estimatedAmount: 1950.00,
    expectedMonth: 'October 2026',
    expectedDueDate: '2026-10-31',
    status: 'estimated',
    confidence: 'recurring_scheduled',
    remarks: 'Projected postal billing',
    isRecurring: true
  },
  {
    id: 'BILL-EST-009',
    code: 'PS',
    particulars: 'Official Postal Mailing Invoice - November 2026',
    vendor: 'Philippine Postal Corporation (PhilPost)',
    estimatedAmount: 2400.00,
    expectedMonth: 'November 2026',
    expectedDueDate: '2026-11-30',
    status: 'estimated',
    confidence: 'recurring_scheduled',
    remarks: 'Projected postal billing',
    isRecurring: true
  },
  {
    id: 'BILL-EST-010',
    code: 'PS',
    particulars: 'Official Postal Mailing Invoice - December 2026',
    vendor: 'Philippine Postal Corporation (PhilPost)',
    estimatedAmount: 2200.00,
    expectedMonth: 'December 2026',
    expectedDueDate: '2026-12-20',
    status: 'estimated',
    confidence: 'recurring_scheduled',
    remarks: 'Year-end postal dispatch bill',
    isRecurring: true
  },

  // 3. Semestral RC Meeting (RE) - Scheduled 2nd Semester Meeting
  {
    id: 'BILL-EST-011',
    code: 'RE',
    particulars: 'Semestral RC Coordination Meeting - Venue, Catering & Logistics',
    vendor: 'Regional Convention & Catering Services',
    estimatedAmount: 60000.00,
    expectedMonth: 'October 2026',
    expectedDueDate: '2026-10-25',
    status: 'obligated',
    confidence: 'high',
    purchaseRequestNo: 'PR-2026-RAMS-044',
    remarks: 'Approved Semestral Regional Meeting (Scheduled H2)',
    isRecurring: false
  },

  // 4. Traveling Expense (TEV) - Estimated Remaining Travel Claims (Exceeds current cap)
  {
    id: 'BILL-EST-012',
    code: 'TEV',
    particulars: 'Estimated TEV Travel Claim - August Field Monitoring',
    vendor: 'RAMS Field Officers (Yana & Baniqued)',
    estimatedAmount: 1200.00,
    expectedMonth: 'August 2026',
    expectedDueDate: '2026-08-25',
    status: 'estimated',
    confidence: 'medium',
    remarks: 'Field validation travel (Needs budget augmentation)',
    isRecurring: true
  },
  {
    id: 'BILL-EST-013',
    code: 'TEV',
    particulars: 'Estimated TEV Travel Claim - September Regional Audit',
    vendor: 'RAMS Field Officers',
    estimatedAmount: 1200.00,
    expectedMonth: 'September 2026',
    expectedDueDate: '2026-09-25',
    status: 'estimated',
    confidence: 'medium',
    remarks: 'Quarterly field inspection',
    isRecurring: true
  },
  {
    id: 'BILL-EST-014',
    code: 'TEV',
    particulars: 'Estimated TEV Travel Claim - October Semestral Meeting Attendance',
    vendor: 'RAMS Staff',
    estimatedAmount: 1100.00,
    expectedMonth: 'October 2026',
    expectedDueDate: '2026-10-25',
    status: 'estimated',
    confidence: 'high',
    remarks: 'Travel to semestral coordination venue',
    isRecurring: false
  },
  {
    id: 'BILL-EST-015',
    code: 'TEV',
    particulars: 'Estimated TEV Travel Claim - November Year-End Wrapup',
    vendor: 'RAMS Staff',
    estimatedAmount: 1085.00,
    expectedMonth: 'November 2026',
    expectedDueDate: '2026-11-25',
    status: 'estimated',
    confidence: 'medium',
    remarks: 'Final regional field visit',
    isRecurring: true
  },

  // 5. Hauling Expenses (HE)
  {
    id: 'BILL-EST-016',
    code: 'HE',
    particulars: 'Scheduled Records Disposal & Hauling Trucking Fee',
    vendor: 'RAMS Logistics Trucking Services',
    estimatedAmount: 1200.00,
    expectedMonth: 'September 2026',
    expectedDueDate: '2026-09-18',
    status: 'estimated',
    confidence: 'medium',
    remarks: 'Quarterly records disposal hauling',
    isRecurring: false
  },
  {
    id: 'BILL-EST-017',
    code: 'HE',
    particulars: 'Year-End Supplies Transfer & Facility Hauling',
    vendor: 'RAMS Logistics Trucking Services',
    estimatedAmount: 1500.00,
    expectedMonth: 'November 2026',
    expectedDueDate: '2026-11-15',
    status: 'estimated',
    confidence: 'medium',
    remarks: 'Warehouse consolidation hauling',
    isRecurring: false
  }
];

