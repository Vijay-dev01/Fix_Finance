/**
 * Local scheduled payment reminders.
 * Requires a custom dev build / EAS build — not supported in Expo Go.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Payment } from '../types/payments';
import { formatCurrency } from '../constants/categories';
import { isPaymentPending } from './paymentService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const REMINDER_HOUR = 9;
const REMINDER_MINUTE = 0;

const reminderId = (paymentId: string) => `${paymentId}-reminder`;
const dueId = (paymentId: string) => `${paymentId}-due`;

const formatAmount = (amount: number): string =>
  formatCurrency(amount).replace(/\.00$/, '');

const buildMessages = (payment: Payment): { reminder: string; due: string } => {
  const amount = formatAmount(payment.amount);
  const name = payment.personName;

  if (payment.type === 'get') {
    return {
      reminder: `Reminder: ${amount} is due tomorrow from ${name}.`,
      due: `Payment Due Today: ${amount} is due from ${name}.`,
    };
  }

  return {
    reminder: `Reminder: ${amount} payment to ${name} is due tomorrow.`,
    due: `Payment Due Today: ${amount} payment to ${name} is due today.`,
  };
};

const parseDueDate = (dueDate: string): Date => {
  const [y, m, d] = dueDate.split('-').map(Number);
  return new Date(y, m - 1, d, REMINDER_HOUR, REMINDER_MINUTE, 0, 0);
};

const scheduleAt = async (
  identifier: string,
  title: string,
  body: string,
  triggerDate: Date
): Promise<void> => {
  if (triggerDate.getTime() <= Date.now()) return;

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title,
      body,
      sound: true,
      ...(Platform.OS === 'android' ? { channelId: 'payments' } : {}),
    },
    trigger: { date: triggerDate },
  });
};

export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
};

export const cancelPaymentNotifications = async (paymentId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(reminderId(paymentId));
    await Notifications.cancelScheduledNotificationAsync(dueId(paymentId));
  } catch {
    // ignore
  }
};

export const schedulePaymentNotifications = async (payment: Payment): Promise<void> => {
  if (!isPaymentPending(payment)) {
    await cancelPaymentNotifications(payment.id);
    return;
  }

  const granted = await requestNotificationPermissions();
  if (!granted) return;

  await cancelPaymentNotifications(payment.id);

  const dueDate = parseDueDate(payment.dueDate);
  const dayBefore = new Date(dueDate);
  dayBefore.setDate(dayBefore.getDate() - 1);

  const { reminder, due } = buildMessages(payment);
  const title = payment.type === 'get' ? 'Payment Reminder' : 'Payment Due';

  await scheduleAt(reminderId(payment.id), title, reminder, dayBefore);
  await scheduleAt(dueId(payment.id), title, due, dueDate);
};

export const syncPaymentNotifications = async (payments: Payment[]): Promise<void> => {
  try {
    const pending = payments.filter(isPaymentPending);
    const pendingIds = new Set(pending.map(p => p.id));

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      const id = notification.identifier;
      if (id.endsWith('-reminder') || id.endsWith('-due')) {
        const paymentId = id.replace(/-reminder$/, '').replace(/-due$/, '');
        if (!pendingIds.has(paymentId)) {
          await Notifications.cancelScheduledNotificationAsync(id);
        }
      }
    }

    for (const payment of pending) {
      await schedulePaymentNotifications(payment);
    }
  } catch (error) {
    console.error('Error syncing payment notifications:', error);
  }
};

export const configureNotificationChannel = async (): Promise<void> => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('payments', {
      name: 'Payment Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
};
