import AsyncStorage from '@react-native-async-storage/async-storage';
import { BudgetState } from '../types';

const STORAGE_KEY = '@budget_planner_data';

// Validate data structure before saving
const validateBudgetState = (data: any): data is BudgetState => {
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data.categories)) return false;
  if (typeof data.totalBudget !== 'number') return false;
  if (typeof data.totalSpent !== 'number') return false;
  if (typeof data.remainingBalance !== 'number') return false;
  return true;
};

export const saveBudgetData = async (data: BudgetState): Promise<void> => {
  try {
    // Validate data before saving
    if (!validateBudgetState(data)) {
      return; // Silently skip invalid data
    }

    // Create a clean copy without any potential circular references
    const cleanData: BudgetState = {
      categories: (data.categories || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        budget: cat.budget,
        spent: cat.spent,
        transactions: (cat.transactions || []).map(t => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          category: t.category,
          description: t.description,
          date: t.date,
        })),
      })),
      totalBudget: data.totalBudget,
      totalSpent: data.totalSpent,
      totalIncome: data.totalIncome ?? 0,
      remainingBalance: data.remainingBalance,
      currentMonth: data.currentMonth,
      lastResetDate: data.lastResetDate,
      incomeTransactions: (data.incomeTransactions ?? []).map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        category: t.category,
        description: t.description,
        date: t.date,
      })),
    };

    const jsonData = JSON.stringify(cleanData);
    
    // Check if data is too large (AsyncStorage has limits)
    if (jsonData.length > 2 * 1024 * 1024) { // 2MB limit
      return; // Silently skip if too large
    }

    await AsyncStorage.setItem(STORAGE_KEY, jsonData);
  } catch (error: any) {
    // Silently ignore all errors - prevents any storage issues from affecting the app
    // Don't log, don't throw - just fail silently
  }
};

export const loadBudgetData = async (): Promise<BudgetState | null> => {
  try {
    const jsonData = await AsyncStorage.getItem(STORAGE_KEY);
    
    if (jsonData) {
      const parsed = JSON.parse(jsonData);
      // Validate and migrate data structure
      if (validateBudgetState(parsed)) {
        return parsed as BudgetState;
      } else {
        console.warn('Invalid data structure in storage, starting fresh');
        // Clear corrupted data
        try {
          await AsyncStorage.removeItem(STORAGE_KEY);
        } catch (e) {
          // Ignore clear errors
        }
        return null;
      }
    }
    return null;
  } catch (error: any) {
    console.error('Error loading budget data:', error?.message || error);
    // Return null on error to start fresh
    return null;
  }
};

export const clearBudgetData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing budget data:', error);
    throw error;
  }
};

