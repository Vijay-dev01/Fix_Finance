import {
  Payment,
  PaymentState,
  PaymentType,
} from '../types/payments';
import { formatCurrency } from '../constants/categories';

export type PaymentUrgency = 'completed' | 'overdue' | 'dueSoon' | 'pending';

export interface PaymentSummaryRow {
  id: string;
  personName: string;
  amount: number;
  dueDate: string;
  dueDateLabel: string;
  type: PaymentType;
  status: Payment['status'];
  note?: string;
  completedAt?: string;
  carriedFromMonth?: string;
}

export interface PaymentSummaries {
  toGet: { pendingTotal: number; count: number };
  toGive: { pendingTotal: number; count: number };
}

export interface PaymentReportSection {
  toGet: { pendingTotal: number; count: number; items: PaymentSummaryRow[] };
  toGive: { pendingTotal: number; count: number; items: PaymentSummaryRow[] };
  completedThisMonth: PaymentSummaryRow[];
}

const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const formatDueDate = (isoDate: string): string => {
  try {
    const [y, m, d] = isoDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch {
    return isoDate;
  }
};

export const isPaymentPending = (payment: Payment): boolean =>
  payment.status === 'pending';

export const isPaymentCompleted = (payment: Payment): boolean =>
  payment.status === 'received' || payment.status === 'paid';

export const getPaymentUrgency = (payment: Payment): PaymentUrgency => {
  if (isPaymentCompleted(payment)) return 'completed';

  const today = startOfDay(new Date());
  const [y, m, d] = payment.dueDate.split('-').map(Number);
  const due = startOfDay(new Date(y, m - 1, d));
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays <= 3) return 'dueSoon';
  return 'pending';
};

export const getPendingPayments = (
  payments: Payment[],
  type: PaymentType
): Payment[] =>
  payments.filter(p => p.type === type && isPaymentPending(p));

export const getPaymentSummaries = (payments: Payment[]): PaymentSummaries => {
  const pendingGet = getPendingPayments(payments, 'get');
  const pendingGive = getPendingPayments(payments, 'give');

  return {
    toGet: {
      pendingTotal: pendingGet.reduce((sum, p) => sum + p.amount, 0),
      count: pendingGet.length,
    },
    toGive: {
      pendingTotal: pendingGive.reduce((sum, p) => sum + p.amount, 0),
      count: pendingGive.length,
    },
  };
};

export const toPaymentSummaryRow = (payment: Payment): PaymentSummaryRow => ({
  id: payment.id,
  personName: payment.personName,
  amount: payment.amount,
  dueDate: payment.dueDate,
  dueDateLabel: formatDueDate(payment.dueDate),
  type: payment.type,
  status: payment.status,
  note: payment.note,
  completedAt: payment.completedAt,
  carriedFromMonth: payment.carriedFromMonth,
});

export const getCompletedThisMonth = (
  payments: Payment[],
  reportMonth: string
): Payment[] =>
  payments.filter(p => {
    if (!isPaymentCompleted(p) || !p.completedAt) return false;
    return p.completedAt.slice(0, 7) === reportMonth;
  });

export const buildPaymentReportSection = (
  paymentState: PaymentState,
  reportMonth: string
): PaymentReportSection => {
  const pendingGet = getPendingPayments(paymentState.payments, 'get');
  const pendingGive = getPendingPayments(paymentState.payments, 'give');
  const completed = getCompletedThisMonth(paymentState.payments, reportMonth);

  return {
    toGet: {
      pendingTotal: pendingGet.reduce((sum, p) => sum + p.amount, 0),
      count: pendingGet.length,
      items: pendingGet.map(toPaymentSummaryRow),
    },
    toGive: {
      pendingTotal: pendingGive.reduce((sum, p) => sum + p.amount, 0),
      count: pendingGive.length,
      items: pendingGive.map(toPaymentSummaryRow),
    },
    completedThisMonth: completed.map(toPaymentSummaryRow),
  };
};

export const applyMonthlyCarryForward = (
  state: PaymentState,
  currentMonth: string
): PaymentState => {
  if (state.lastCheckedMonth === currentMonth) return state;

  const updatedPayments = state.payments.map(payment => {
    if (!isPaymentPending(payment)) return payment;

    const dueMonth = payment.dueDate.slice(0, 7);
    if (dueMonth >= currentMonth || payment.carriedFromMonth) return payment;

    return {
      ...payment,
      carriedFromMonth: dueMonth,
    };
  });

  return {
    payments: updatedPayments,
    lastCheckedMonth: currentMonth,
  };
};

export const formatPaymentAmount = (amount: number): string => formatCurrency(amount);

export const getStatusLabel = (payment: Payment): string => {
  if (payment.status === 'received') return 'Received';
  if (payment.status === 'paid') return 'Paid';
  const urgency = getPaymentUrgency(payment);
  if (urgency === 'overdue') return 'Overdue';
  if (urgency === 'dueSoon') return 'Due soon';
  return 'Pending';
};
