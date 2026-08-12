import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Payment, PaymentState } from '../types/payments';
import { paymentReducer, initialPaymentState } from '../reducers/paymentReducer';
import { savePayments, loadPayments } from '../utils/paymentStorage';
import { getCurrentMonth } from '../constants/categories';
import { applyMonthlyCarryForward } from '../services/paymentService';
import {
  syncPaymentNotifications,
  configureNotificationChannel,
  schedulePaymentNotifications,
  cancelPaymentNotifications,
  requestNotificationPermissions,
} from '../services/paymentNotificationService';

interface PaymentContextType {
  state: PaymentState;
  notificationsEnabled: boolean;
  addPayment: (
    payment: Omit<Payment, 'id' | 'createdAt' | 'status'>
  ) => Promise<void>;
  updatePayment: (paymentId: string, updates: Partial<Payment>) => Promise<void>;
  deletePayment: (paymentId: string) => Promise<void>;
  markComplete: (paymentId: string) => Promise<void>;
  requestNotifications: () => Promise<boolean>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(paymentReducer, initialPaymentState);
  const [isLoading, setIsLoading] = React.useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);
  const isInitialMount = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const runCarryForward = (data: PaymentState): PaymentState => {
    const currentMonth = getCurrentMonth();
    return applyMonthlyCarryForward(data, currentMonth);
  };

  const syncNotifications = async (payments: Payment[]) => {
    await syncPaymentNotifications(payments);
    const granted = await requestNotificationPermissions();
    setNotificationsEnabled(granted);
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        await configureNotificationChannel();
        const saved = await loadPayments();
        if (!isMounted) return;

        const base: PaymentState = saved ?? initialPaymentState;
        const withCarryForward = runCarryForward(base);
        dispatch({ type: 'LOAD_DATA', data: withCarryForward });
        await syncNotifications(withCarryForward.payments);
      } catch (error) {
        console.error('Error loading payments:', error);
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

  // Don't block app render while payments load

  useEffect(() => {
    if (isInitialMount.current || isLoading) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      savePayments(state).catch(err =>
        console.error('Error saving payments:', err)
      );
    }, 500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [state, isLoading]);

  useEffect(() => {
    if (isLoading) return;

    const handleAppStateChange = (next: AppStateStatus) => {
      if (next !== 'active') return;
      const updated = runCarryForward(state);
      if (updated.lastCheckedMonth !== state.lastCheckedMonth) {
        dispatch({ type: 'APPLY_CARRY_FORWARD', data: updated });
        syncNotifications(updated.payments);
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [state, isLoading]);

  const addPayment = async (
    payment: Omit<Payment, 'id' | 'createdAt' | 'status'>
  ) => {
    const newPayment: Payment = {
      ...payment,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_PAYMENT', payment: newPayment });
    await schedulePaymentNotifications(newPayment);
    const granted = await requestNotificationPermissions();
    setNotificationsEnabled(granted);
  };

  const updatePayment = async (paymentId: string, updates: Partial<Payment>) => {
    const existing = state.payments.find(p => p.id === paymentId);
    if (!existing) return;

    dispatch({ type: 'UPDATE_PAYMENT', paymentId, updates });
    await schedulePaymentNotifications({ ...existing, ...updates });
  };

  const deletePayment = async (paymentId: string) => {
    dispatch({ type: 'DELETE_PAYMENT', paymentId });
    await cancelPaymentNotifications(paymentId);
  };

  const markComplete = async (paymentId: string) => {
    const payment = state.payments.find(p => p.id === paymentId);
    if (!payment || payment.status !== 'pending') return;

    const status = payment.type === 'get' ? 'received' : 'paid';
    dispatch({ type: 'MARK_COMPLETE', paymentId, status });
    await cancelPaymentNotifications(paymentId);
  };

  const requestNotifications = async () => {
    const granted = await requestNotificationPermissions();
    setNotificationsEnabled(granted);
    if (granted) {
      await syncPaymentNotifications(state.payments);
    }
    return granted;
  };

  return (
    <PaymentContext.Provider
      value={{
        state,
        notificationsEnabled,
        addPayment,
        updatePayment,
        deletePayment,
        markComplete,
        requestNotifications,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayments = (): PaymentContextType => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayments must be used within a PaymentProvider');
  }
  return context;
};
