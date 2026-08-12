export type PaymentType = 'get' | 'give';
export type PaymentStatus = 'pending' | 'received' | 'paid';

export interface Payment {
  id: string;
  type: PaymentType;
  personName: string;
  amount: number;
  dueDate: string;
  note?: string;
  status: PaymentStatus;
  createdAt: string;
  completedAt?: string;
  carriedFromMonth?: string;
}

export interface PaymentState {
  payments: Payment[];
  lastCheckedMonth: string;
}

export type PaymentAction =
  | { type: 'LOAD_DATA'; data: PaymentState }
  | { type: 'ADD_PAYMENT'; payment: Payment }
  | { type: 'UPDATE_PAYMENT'; paymentId: string; updates: Partial<Payment> }
  | { type: 'DELETE_PAYMENT'; paymentId: string }
  | { type: 'MARK_COMPLETE'; paymentId: string; status: 'received' | 'paid' }
  | { type: 'APPLY_CARRY_FORWARD'; data: PaymentState };
