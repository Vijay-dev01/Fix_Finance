import { BudgetState } from '../types';
import { getCurrentMonth } from '../constants/categories';
import { generateMonthlyReport } from './monthlyReportService';
import { sendMonthlyReportEmail } from './emailService';

const LAST_CHECK_KEY = '@last_monthly_check';
const LAST_REPORT_MONTH_KEY = '@last_report_month';

/**
 * Check if we've moved to a new month
 */
export const isNewMonth = (currentMonth: string, lastReportMonth: string | null): boolean => {
  if (!lastReportMonth) return false;
  return currentMonth !== lastReportMonth;
};

/**
 * Check if it's the end of the month (last day)
 */
export const isEndOfMonth = (): boolean => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // If tomorrow is the 1st of next month, we're at the end of current month
  return tomorrow.getDate() === 1;
};

/**
 * Check if we should generate and send monthly report
 * This checks if:
 * 1. We're at the end of the month (last day), OR
 * 2. We've moved to a new month and haven't sent report for previous month yet
 */
export const shouldGenerateMonthlyReport = async (
  stateMonth: string
): Promise<boolean> => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const currentMonth = getCurrentMonth();
    
    // Check if we've already sent a report for the state's month
    const lastReportMonth = await AsyncStorage.getItem(LAST_REPORT_MONTH_KEY);
    
    if (lastReportMonth === stateMonth) {
      // Already sent report for this month
      return false;
    }
    
    // Case 1: It's the end of the month (last day) - send report for current month
    if (isEndOfMonth() && stateMonth === currentMonth) {
      return true;
    }
    
    // Case 2: We've moved to a new month but haven't sent report for previous month
    // This handles when app wasn't opened on the last day
    if (stateMonth !== currentMonth && lastReportMonth !== stateMonth) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking if should generate report:', error);
    return false;
  }
};

/**
 * Mark that report has been sent for the current month
 */
export const markReportSent = async (month: string): Promise<void> => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem(LAST_REPORT_MONTH_KEY, month);
    await AsyncStorage.setItem(LAST_CHECK_KEY, new Date().toISOString());
  } catch (error) {
    console.error('Error marking report as sent:', error);
  }
};

/**
 * Process monthly report: generate, send email, and reset data
 */
export const processMonthlyReport = async (
  state: BudgetState,
  onReset: () => void
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Generate report
    const report = generateMonthlyReport(state);
    
    // Send email
    const emailResult = await sendMonthlyReportEmail(report);
    
    if (emailResult.success) {
      // Mark report as sent
      await markReportSent(state.currentMonth);
      
      // Reset monthly data
      onReset();
      
      return { success: true };
    } else {
      return {
        success: false,
        error: emailResult.error || 'Failed to send email',
      };
    }
  } catch (error: any) {
    console.error('Error processing monthly report:', error);
    return {
      success: false,
      error: error?.message || 'Failed to process monthly report',
    };
  }
};

/**
 * Check and process monthly report if needed
 * This should be called periodically (e.g., when app opens, or via background task)
 */
export const checkAndProcessMonthlyReport = async (
  state: BudgetState,
  onReset: () => void
): Promise<{ processed: boolean; success?: boolean; error?: string }> => {
  try {
    // Use the state's current month (which might be previous month if we've moved to new month)
    const shouldProcess = await shouldGenerateMonthlyReport(state.currentMonth);
    
    if (shouldProcess) {
      const result = await processMonthlyReport(state, onReset);
      return {
        processed: true,
        success: result.success,
        error: result.error,
      };
    }
    
    return { processed: false };
  } catch (error: any) {
    console.error('Error in monthly check:', error);
    return {
      processed: false,
      error: error?.message || 'Error checking monthly report',
    };
  }
};

/**
 * Manually send monthly report without resetting data
 * This allows users to send the report anytime without automatic reset
 */
export const sendMonthlyReportManually = async (
  state: BudgetState
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Generate report
    const report = generateMonthlyReport(state);
    
    // Send email (without resetting)
    const emailResult = await sendMonthlyReportEmail(report);
    
    if (emailResult.success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: emailResult.error || 'Failed to send email',
      };
    }
  } catch (error: any) {
    console.error('Error sending monthly report manually:', error);
    return {
      success: false,
      error: error?.message || 'Failed to send monthly report',
    };
  }
};
