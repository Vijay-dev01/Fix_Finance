import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { BudgetState, BudgetAction, Transaction } from '../types';
import { budgetReducer, initialState } from '../reducers/budgetReducer';
import { saveBudgetData, loadBudgetData } from '../utils/storage';
import { getCurrentMonth } from '../constants/categories';
import LoadingScreen from '../components/LoadingScreen';
import { checkAndProcessMonthlyReport, sendMonthlyReportManually as sendReportManually } from '../services/monthlyCheckService';

interface BudgetContextType {
  state: BudgetState;
  dispatch: React.Dispatch<BudgetAction>;
  setBudget: (categoryId: string, amount: number) => void;
  setSpent: (categoryId: string, amount: number) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  deleteTransaction: (transactionId: string, categoryId: string) => void;
  resetMonthlyBudget: () => void;
  carryOverBalance: () => void;
  allocateToSavings: (amount: number) => void;
  generateAndSendMonthlyReport: () => Promise<{ success: boolean; error?: string }>;
  sendMonthlyReportManually: () => Promise<{ success: boolean; error?: string }>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState);
  const [isLoading, setIsLoading] = React.useState(true);
  const isInitialMount = React.useRef(true);
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const monthlyCheckDoneRef = React.useRef(false);

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
            // New month detected - check if we need to send monthly report first
            // This handles the case where app wasn't opened on the last day of previous month
            if (!monthlyCheckDoneRef.current && isMounted) {
              monthlyCheckDoneRef.current = true;
              // Check if we should process monthly report for the previous month
              checkAndProcessMonthlyReport(migratedData, () => {
                // This will be called after email is sent to reset data
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
              }).catch(err => {
                console.error('Error in monthly check:', err);
                // If check fails, just reset normally
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
              });
            } else {
              // Already checked or not mounted, just reset
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
            }
          } else {
            dispatch({ type: 'LOAD_DATA', data: migratedData });
            // Check for monthly report even if same month (in case it's end of month)
            if (!monthlyCheckDoneRef.current && isMounted) {
              monthlyCheckDoneRef.current = true;
              setTimeout(() => {
                checkAndProcessMonthlyReport(migratedData, () => {
                  dispatch({ type: 'RESET_MONTHLY_BUDGET' });
                }).catch(err => {
                  console.error('Error in monthly check:', err);
                });
              }, 2000); // Wait 2 seconds after app loads
            }
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

  // Monitor app state to check for monthly reports when app comes to foreground
  useEffect(() => {
    if (isLoading) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground, check for monthly report
        checkAndProcessMonthlyReport(state, () => {
          dispatch({ type: 'RESET_MONTHLY_BUDGET' });
        }).catch(err => {
          console.error('Error checking monthly report on app state change:', err);
        });
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Also check immediately when app is active
    if (AppState.currentState === 'active') {
      setTimeout(() => {
        checkAndProcessMonthlyReport(state, () => {
          dispatch({ type: 'RESET_MONTHLY_BUDGET' });
        }).catch(err => {
          console.error('Error checking monthly report:', err);
        });
      }, 1000);
    }

    return () => {
      subscription.remove();
    };
  }, [state, isLoading]);

  const setBudget = (categoryId: string, amount: number) => {
    dispatch({ type: 'SET_BUDGET', categoryId, amount });
  };

  const setSpent = (categoryId: string, amount: number) => {
    dispatch({ type: 'SET_SPENT', categoryId, amount });
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

  const generateAndSendMonthlyReport = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await checkAndProcessMonthlyReport(state, () => {
        dispatch({ type: 'RESET_MONTHLY_BUDGET' });
      });
      
      if (result.processed) {
        return {
          success: result.success || false,
          error: result.error,
        };
      } else {
        return {
          success: false,
          error: 'Monthly report not needed at this time (not end of month or already sent)',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to generate monthly report',
      };
    }
  };

  const sendMonthlyReportManually = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      return await sendReportManually(state);
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to send monthly report',
      };
    }
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
        setSpent,
        addTransaction,
        deleteTransaction,
        resetMonthlyBudget,
        carryOverBalance,
        allocateToSavings,
        generateAndSendMonthlyReport,
        sendMonthlyReportManually,
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

