import { BudgetState, BudgetAction, Transaction, Category } from '../types';
import { getCurrentMonth } from '../constants/categories';

const calculateTotals = (
  categories: BudgetState['categories'],
  totalIncome: number = 0
) => {
  const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const remainingBalance = totalIncome - totalSpent;
  return { totalBudget, totalSpent, remainingBalance };
};

const calculateCategorySpent = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
};

export const initialState: BudgetState = {
  categories: [],
  totalBudget: 0,
  totalSpent: 0,
  totalIncome: 0,
  remainingBalance: 0,
  currentMonth: getCurrentMonth(),
  lastResetDate: new Date().toISOString(),
  incomeTransactions: [],
};

export const budgetReducer = (
  state: BudgetState,
  action: BudgetAction
): BudgetState => {
  switch (action.type) {
    case 'SET_BUDGET': {
      const updatedCategories = state.categories.map(cat =>
        cat.id === action.categoryId
          ? { ...cat, budget: action.amount }
          : cat
      );
      const totals = calculateTotals(updatedCategories, state.totalIncome);
      return {
        ...state,
        categories: updatedCategories,
        ...totals,
      };
    }

    case 'SET_SPENT': {
      const updatedCategories = state.categories.map(cat =>
        cat.id === action.categoryId
          ? { ...cat, spent: Math.max(0, action.amount) }
          : cat
      );
      const totals = calculateTotals(updatedCategories, state.totalIncome);
      return {
        ...state,
        categories: updatedCategories,
        ...totals,
      };
    }

    case 'ADD_TRANSACTION': {
      const { transaction } = action;
      let updatedCategories = state.categories;
      let updatedIncomeTransactions = state.incomeTransactions;
      let updatedTotalIncome = state.totalIncome;

      if (transaction.type === 'income') {
        // Handle income transactions
        updatedIncomeTransactions = [...state.incomeTransactions, transaction];
        updatedTotalIncome = updatedIncomeTransactions.reduce(
          (sum, t) => sum + t.amount,
          0
        );
      } else {
        // Handle expense transactions
        updatedCategories = state.categories.map(cat => {
          if (cat.id === transaction.category) {
            const newTransactions = [...cat.transactions, transaction];
            const spent = calculateCategorySpent(newTransactions);
            return {
              ...cat,
              transactions: newTransactions,
              spent,
            };
          }
          return cat;
        });
      }

      const totals = calculateTotals(updatedCategories, updatedTotalIncome);
      return {
        ...state,
        categories: updatedCategories,
        incomeTransactions: updatedIncomeTransactions,
        totalIncome: updatedTotalIncome,
        ...totals,
      };
    }

    case 'DELETE_TRANSACTION': {
      const { transactionId, categoryId } = action;
      let updatedCategories = state.categories;
      let updatedIncomeTransactions = state.incomeTransactions;
      let updatedTotalIncome = state.totalIncome;

      // Check if it's an income transaction
      if (categoryId === 'income') {
        updatedIncomeTransactions = state.incomeTransactions.filter(
          t => t.id !== transactionId
        );
        updatedTotalIncome = updatedIncomeTransactions.reduce(
          (sum, t) => sum + t.amount,
          0
        );
      } else {
        updatedCategories = state.categories.map(cat => {
          if (cat.id === categoryId) {
            const newTransactions = cat.transactions.filter(
              t => t.id !== transactionId
            );
            const spent = calculateCategorySpent(newTransactions);
            return {
              ...cat,
              transactions: newTransactions,
              spent,
            };
          }
          return cat;
        });
      }

      const totals = calculateTotals(updatedCategories, updatedTotalIncome);
      return {
        ...state,
        categories: updatedCategories,
        incomeTransactions: updatedIncomeTransactions,
        totalIncome: updatedTotalIncome,
        ...totals,
      };
    }

    case 'RESET_MONTHLY_BUDGET': {
      const updatedCategories = state.categories.map(cat => ({
        ...cat,
        spent: 0,
        transactions: [],
      }));
      const totals = calculateTotals(updatedCategories, state.totalIncome);
      return {
        ...state,
        categories: updatedCategories,
        incomeTransactions: [],
        totalIncome: 0,
        ...totals,
        currentMonth: getCurrentMonth(),
        lastResetDate: new Date().toISOString(),
      };
    }

    case 'CARRY_OVER_BALANCE': {
      const carryOverAmount = state.remainingBalance;
      if (carryOverAmount > 0 && state.categories.length > 0) {
        const updatedCategories = state.categories.map(cat => ({
          ...cat,
          budget: cat.budget + (carryOverAmount / state.categories.length),
        }));
        const totals = calculateTotals(updatedCategories, state.totalIncome);
        return {
          ...state,
          categories: updatedCategories,
          ...totals,
        };
      }
      return state;
    }

    case 'ALLOCATE_TO_SAVINGS': {
      // Reduce remaining balance by allocated amount
      const newRemainingBalance = Math.max(
        0,
        state.remainingBalance - action.amount
      );
      return {
        ...state,
        remainingBalance: newRemainingBalance,
      };
    }

    case 'LOAD_DATA': {
      const loadedData = action.data;
      return {
        ...initialState,
        ...loadedData,
        categories: Array.isArray(loadedData.categories) ? loadedData.categories : [],
        totalBudget: loadedData.totalBudget ?? 0,
        totalSpent: loadedData.totalSpent ?? 0,
        totalIncome: loadedData.totalIncome ?? 0,
        remainingBalance: loadedData.remainingBalance ?? 0,
        incomeTransactions: loadedData.incomeTransactions ?? [],
        currentMonth: loadedData.currentMonth || getCurrentMonth(),
        lastResetDate: loadedData.lastResetDate || new Date().toISOString(),
      };
    }

    case 'UPDATE_CATEGORY': {
      const updatedCategories = state.categories.map(cat =>
        cat.id === action.categoryId
          ? { ...cat, ...action.updates }
          : cat
      );
      const totals = calculateTotals(updatedCategories, state.totalIncome);
      return {
        ...state,
        categories: updatedCategories,
        ...totals,
      };
    }

    case 'ADD_CATEGORY': {
      const newCategory: Category = {
        ...action.category,
        budget: 0,
        spent: 0,
        transactions: [],
      };
      const updatedCategories = [...state.categories, newCategory];
      const totals = calculateTotals(updatedCategories, state.totalIncome);
      return {
        ...state,
        categories: updatedCategories,
        ...totals,
      };
    }

    case 'DELETE_CATEGORY': {
      const updatedCategories = state.categories.filter(
        cat => cat.id !== action.categoryId
      );
      const totals = calculateTotals(updatedCategories, state.totalIncome);
      return {
        ...state,
        categories: updatedCategories,
        ...totals,
      };
    }

    default:
      return state;
  }
};

