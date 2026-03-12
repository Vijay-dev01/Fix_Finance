import { BudgetState } from '../types';
import { getCurrentMonth } from '../constants/categories';
import { generateMonthlyReport } from './monthlyReportService';
import { sendMonthlyReportEmail } from './emailService';

const LAST_CHECK_KEY = '@last_monthly_check';
const LAST_REPORT_MONTH_KEY = '@last_report_month';
const PENDING_CONFIRMATION_MONTH_KEY = '@pending_confirmation_month';

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
 * 1. We're at the end of the month (last day) - open composer for current month, OR
 * 2. We've moved to a new month and have pending confirmation (handled separately in UI)
 */
export const shouldGenerateMonthlyReport = async (
  stateMonth: string
): Promise<boolean> => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const currentMonth = getCurrentMonth();

    // Already sent report for this month (pending user confirmation)
    const lastReportMonth = await AsyncStorage.getItem(LAST_REPORT_MONTH_KEY);
    if (lastReportMonth === stateMonth) {
      return false;
    }

    // End of month (last day): auto-open composer for current month
    if (isEndOfMonth() && stateMonth === currentMonth) {
      return true;
    }

    // New month but we haven't sent for previous month - don't auto-send here; user can send manually
    return false;
  } catch (error) {
    console.error('Error checking if should generate report:', error);
    return false;
  }
};

/**
 * Check if we're in a new month and have a pending confirmation for the stored (previous) month.
 * UI should show "Did you receive the email?" and only delete data after user confirms.
 */
export const getPendingConfirmationMonth = async (): Promise<string | null> => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return await AsyncStorage.getItem(PENDING_CONFIRMATION_MONTH_KEY);
  } catch (error) {
    console.error('Error getting pending confirmation month:', error);
    return null;
  }
};

/**
 * User confirmed they received the email. Clear pending and allow data reset.
 */
export const confirmReportReceived = async (): Promise<void> => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.removeItem(PENDING_CONFIRMATION_MONTH_KEY);
  } catch (error) {
    console.error('Error confirming report received:', error);
  }
};

/**
 * Mark that report has been sent for the given month (data is NOT deleted until user confirms next month).
 */
export const markReportSent = async (month: string): Promise<void> => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem(LAST_REPORT_MONTH_KEY, month);
    await AsyncStorage.setItem(PENDING_CONFIRMATION_MONTH_KEY, month);
    await AsyncStorage.setItem(LAST_CHECK_KEY, new Date().toISOString());
  } catch (error) {
    console.error('Error marking report as sent:', error);
  }
};

/**
 * Process monthly report: generate and send email. Do NOT delete data.
 * Data is deleted only after user confirms receipt in the next month.
 */
export const processMonthlyReport = async (
  state: BudgetState,
  _onReset: () => void
): Promise<{ success: boolean; error?: string }> => {
  try {
    const report = generateMonthlyReport(state);
    const emailResult = await sendMonthlyReportEmail(report, { automated: true });

    if (emailResult.success) {
      await markReportSent(state.currentMonth);
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
 * Check and process monthly report if needed.
 * - End of month: open composer automatically (no permission dialog). On send, mark pending confirmation; do not delete data.
 * - New month with pending confirmation: return needsConfirmation so UI can ask user to confirm before deleting.
 */
export const checkAndProcessMonthlyReport = async (
  state: BudgetState,
  onReset: () => void
): Promise<{
  processed: boolean;
  success?: boolean;
  error?: string;
  needsConfirmation?: boolean;
  pendingMonth?: string;
}> => {
  try {
    const currentMonth = getCurrentMonth();

    // New month and we have pending confirmation for the stored (previous) month
    if (state.currentMonth !== currentMonth) {
      const pendingMonth = await getPendingConfirmationMonth();
      if (pendingMonth === state.currentMonth) {
        return {
          processed: false,
          needsConfirmation: true,
          pendingMonth: state.currentMonth,
        };
      }
      // No pending confirmation: don't auto-send; caller can reset to new month if desired
      return { processed: false };
    }

    // Same month: check if we should open composer (end of month)
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
 * Manually send monthly report: PDF attachment only, no body text. Does not reset data.
 */
export const sendMonthlyReportManually = async (
  state: BudgetState
): Promise<{ success: boolean; error?: string }> => {
  try {
    const report = generateMonthlyReport(state);
    const emailResult = await sendMonthlyReportEmail(report, { automated: false });
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
