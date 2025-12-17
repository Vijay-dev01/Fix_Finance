import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { BudgetState, BudgetAction, Transaction } from '../types';
import { budgetReducer, initialState } from '../reducers/budgetReducer';
import { saveBudgetData, loadBudgetData } from '../utils/storage';
import { getCurrentMonth } from '../constants/categories';
import LoadingScreen from '../components/LoadingScreen';

interface BudgetContextType {
  state: BudgetState;
  dispatch: React.Dispatch<BudgetAction>;
  setBudget: (categoryId: string, amount: number) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  deleteTransaction: (transactionId: string, categoryId: string) => void;
  resetMonthlyBudget: () => void;
  carryOverBalance: () => void;
  allocateToSavings: (amount: number) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState);
  const [isLoading, setIsLoading] = React.useState(true);
  const isInitialMount = React.useRef(true);
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Load data on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        const savedData = await loadBudgetData();
        
        if (!isMounted) return;
        
        if (savedData) {
          // Migrate old data structure to new one if needed
          const migratedData: BudgetState = {
            ...savedData,
            totalIncome: savedData.totalIncome ?? 0,
            incomeTransactions: savedData.incomeTransactions ?? [],
            categories: (savedData.categories || []).map(cat => ({
              ...cat,
              transactions: cat.transactions ?? [],
            })),
          };

          // Check if we need to reset for new month
          const currentMonth = getCurrentMonth();
          if (migratedData.currentMonth !== currentMonth) {
            // New month - reset spent amounts but keep budgets
            const resetData: BudgetState = {
              ...migratedData,
              currentMonth,
              categories: migratedData.categories.map(cat => ({
                ...cat,
                spent: 0,
                transactions: [],
              })),
              totalSpent: 0,
              incomeTransactions: [],
              totalIncome: 0,
              remainingBalance: migratedData.totalBudget,
            };
            dispatch({ type: 'LOAD_DATA', data: resetData });
          } else {
            dispatch({ type: 'LOAD_DATA', data: migratedData });
          }
        }
      } catch (error: any) {
        console.error('Error loading data:', error?.message || error);
        // Continue with initial state if loading fails
      } finally {
        if (isMounted) {
          setIsLoading(false);
          isInitialMount.current = false;
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Save data whenever state changes (but not on initial load) - with debouncing
  useEffect(() => {
    if (isInitialMount.current || isLoading) {
      return;
    }

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save operation to avoid too frequent saves
    saveTimeoutRef.current = setTimeout(() => {
      const saveData = async () => {
        try {
          await saveBudgetData(state);
        } catch (error: any) {
          console.error('Error saving data:', error?.message || error);
          // Don't throw - just log the error to prevent app crash
        }
      };
      saveData();
    }, 500); // Wait 500ms after last state change before saving

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state, isLoading]);

  const setBudget = (categoryId: string, amount: number) => {
    dispatch({ type: 'SET_BUDGET', categoryId, amount });
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      date: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_TRANSACTION', transaction: newTransaction });
  };

  const deleteTransaction = (transactionId: string, categoryId: string) => {
    dispatch({ type: 'DELETE_TRANSACTION', transactionId, categoryId });
  };

  const resetMonthlyBudget = () => {
    dispatch({ type: 'RESET_MONTHLY_BUDGET' });
  };

  const carryOverBalance = () => {
    dispatch({ type: 'CARRY_OVER_BALANCE' });
  };

  const allocateToSavings = (amount: number) => {
    dispatch({ type: 'ALLOCATE_TO_SAVINGS', amount });
  };

  // Show loading state while initial data is being loaded
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <BudgetContext.Provider
      value={{
        state,
        dispatch,
        setBudget,
        addTransaction,
        deleteTransaction,
        resetMonthlyBudget,
        carryOverBalance,
        allocateToSavings,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = (): BudgetContextType => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};

