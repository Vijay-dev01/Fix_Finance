import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaymentState } from '../types/payments';

const STORAGE_KEY = '@vstack_payments';

const validatePaymentState = (data: unknown): data is PaymentState => {
  if (!data || typeof data !== 'object') return false;
  const d = data as PaymentState;
  if (!Array.isArray(d.payments)) return false;
  if (typeof d.lastCheckedMonth !== 'string') return false;
  return true;
};

export const savePayments = async (data: PaymentState): Promise<void> => {
  try {
    if (!validatePaymentState(data)) return;

    const cleanData: PaymentState = {
      lastCheckedMonth: data.lastCheckedMonth,
      payments: (data.payments || []).map(p => ({
        id: p.id,
        type: p.type,
        personName: p.personName,
        amount: p.amount,
        dueDate: p.dueDate,
        note: p.note,
        status: p.status,
        createdAt: p.createdAt,
        completedAt: p.completedAt,
        carriedFromMonth: p.carriedFromMonth,
      })),
    };

    const jsonData = JSON.stringify(cleanData);
    if (jsonData.length > 2 * 1024 * 1024) return;

    await AsyncStorage.setItem(STORAGE_KEY, jsonData);
  } catch {
    // fail silently
  }
};

export const loadPayments = async (): Promise<PaymentState | null> => {
  try {
    const jsonData = await AsyncStorage.getItem(STORAGE_KEY);
    if (!jsonData) return null;

    const parsed = JSON.parse(jsonData);
    if (validatePaymentState(parsed)) {
      return parsed as PaymentState;
    }
    return null;
  } catch (error) {
    console.error('Error loading payments:', error);
    return null;
  }
};
