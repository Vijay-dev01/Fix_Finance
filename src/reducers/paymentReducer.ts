import { PaymentState, PaymentAction } from '../types/payments';
import { getCurrentMonth } from '../constants/categories';

export const initialPaymentState: PaymentState = {
  payments: [],
  lastCheckedMonth: getCurrentMonth(),
};

export function paymentReducer(
  state: PaymentState,
  action: PaymentAction
): PaymentState {
  switch (action.type) {
    case 'LOAD_DATA':
      return action.data;

    case 'ADD_PAYMENT':
      return {
        ...state,
        payments: [...state.payments, action.payment],
      };

    case 'UPDATE_PAYMENT':
      return {
        ...state,
        payments: state.payments.map(p =>
          p.id === action.paymentId ? { ...p, ...action.updates } : p
        ),
      };

    case 'DELETE_PAYMENT':
      return {
        ...state,
        payments: state.payments.filter(p => p.id !== action.paymentId),
      };

    case 'MARK_COMPLETE':
      return {
        ...state,
        payments: state.payments.map(p =>
          p.id === action.paymentId
            ? {
                ...p,
                status: action.status,
                completedAt: new Date().toISOString(),
              }
            : p
        ),
      };

    case 'APPLY_CARRY_FORWARD':
      return action.data;

    default:
      return state;
  }
}
