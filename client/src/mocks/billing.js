// Offline-first demo data so the 16-page journey never blanks when API is offline.
export const demoCustomers = [];
export const demoItems = [];
export const demoInvoices = [];
export const demoEstimates = [];

export const emptyOverview = {
  cards: { billed: 0, collected: 0, outstanding: 0, spent: 0, billedCount: 0, paidCount: 0, openCount: 0, overdue: 0 },
  cashFlow: [],
  recentInvoices: [],
  recentPayments: [],
  aging: { "0-30": 0, "31-60": 0, "61-90": 0, "90+": 0 },
  mode: "offline",
};
