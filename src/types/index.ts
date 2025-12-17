export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  budget: number;
  spent: number;
  transactions: Transaction[];
}

export interface BudgetState {
  categories: Category[];
  totalBudget: number;
  totalSpent: number;
  totalIncome: number;
  remainingBalance: number;
  currentMonth: string;
  lastResetDate: string;
  incomeTransactions: Transaction[];
}

export type BudgetAction =
  | { type: 'SET_BUDGET'; categoryId: string; amount: number }
  | { type: 'ADD_TRANSACTION'; transaction: Transaction }
  | { type: 'DELETE_TRANSACTION'; transactionId: string; categoryId: string }
  | { type: 'RESET_MONTHLY_BUDGET' }
  | { type: 'CARRY_OVER_BALANCE' }
  | { type: 'ALLOCATE_TO_SAVINGS'; amount: number }
  | { type: 'LOAD_DATA'; data: BudgetState }
  | { type: 'UPDATE_CATEGORY'; categoryId: string; updates: Partial<Category> };

