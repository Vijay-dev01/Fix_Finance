import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePayments } from '../context/PaymentContext';
import PaymentCard from '../components/PaymentCard';
import PaymentSummaryRow from '../components/PaymentSummaryRow';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme';
import { getCurrentMonth } from '../constants/categories';
import {
  getPendingPayments,
  getPaymentSummaries,
  getCompletedThisMonth,
} from '../services/paymentService';
import { Payment } from '../types/payments';

type NavProp = StackNavigationProp<RootStackParamList>;

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

const PaymentListGroup: React.FC<{
  payments: Payment[];
  onMarkComplete: (p: Payment) => void;
  onEdit: (id: string) => void;
  onDelete: (p: Payment) => void;
  emptyLabel?: string;
}> = ({ payments, onMarkComplete, onEdit, onDelete, emptyLabel }) => {
  if (payments.length === 0) {
    return emptyLabel ? <Text style={styles.emptySection}>{emptyLabel}</Text> : null;
  }

  return (
    <View style={styles.listGroup}>
      {payments.map((payment, index) => (
        <PaymentCard
          key={payment.id}
          payment={payment}
          variant="pending"
          isLast={index === payments.length - 1}
          onMarkComplete={() => onMarkComplete(payment)}
          onEdit={() => onEdit(payment.id)}
          onDelete={() => onDelete(payment)}
        />
      ))}
    </View>
  );
};

const PaymentsScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { state, deletePayment, markComplete, notificationsEnabled, requestNotifications } =
    usePayments();
  const [showCompleted, setShowCompleted] = useState(false);

  const summaries = useMemo(() => getPaymentSummaries(state.payments), [state.payments]);
  const pendingGet = useMemo(
    () => getPendingPayments(state.payments, 'get'),
    [state.payments]
  );
  const pendingGive = useMemo(
    () => getPendingPayments(state.payments, 'give'),
    [state.payments]
  );
  const completedThisMonth = useMemo(
    () => getCompletedThisMonth(state.payments, getCurrentMonth()),
    [state.payments]
  );

  const handleDelete = (payment: Payment) => {
    Alert.alert(
      'Delete payment',
      `Delete payment for "${payment.personName}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePayment(payment.id),
        },
      ]
    );
  };

  const handleMarkComplete = (payment: Payment) => {
    const label = payment.type === 'get' ? 'received' : 'paid';
    Alert.alert(
      `Mark as ${label}`,
      `Mark payment from ${payment.personName} as ${label}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => markComplete(payment.id) },
      ]
    );
  };

  const isEmpty =
    pendingGet.length === 0 && pendingGive.length === 0 && completedThisMonth.length === 0;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!notificationsEnabled && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              Enable notifications for due-date reminders.
            </Text>
            <Pressable onPress={requestNotifications} hitSlop={8}>
              <Text style={styles.bannerAction}>Enable</Text>
            </Pressable>
          </View>
        )}

        <PaymentSummaryRow summaries={summaries} />

        <SectionHeader title="TO GET" />
        <PaymentListGroup
          payments={pendingGet}
          onMarkComplete={handleMarkComplete}
          onEdit={id => navigation.navigate('AddPayment', { paymentId: id })}
          onDelete={handleDelete}
          emptyLabel="No pending payments"
        />

        <SectionHeader title="TO GIVE" />
        <PaymentListGroup
          payments={pendingGive}
          onMarkComplete={handleMarkComplete}
          onEdit={id => navigation.navigate('AddPayment', { paymentId: id })}
          onDelete={handleDelete}
          emptyLabel="No pending payments"
        />

        {isEmpty && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No payments yet</Text>
            <Text style={styles.emptyHint}>
              Tap + to track money you need to receive or pay.
            </Text>
          </View>
        )}

        {completedThisMonth.length > 0 && (
          <View style={styles.completedSection}>
            <Pressable
              style={styles.completedToggle}
              onPress={() => setShowCompleted(v => !v)}
            >
              <Text style={styles.completedToggleText}>
                Completed · {completedThisMonth.length}
              </Text>
              <MaterialCommunityIcons
                name={showCompleted ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={theme.colors.textSecondary}
              />
            </Pressable>

            {showCompleted && (
              <View style={styles.listGroup}>
                {completedThisMonth.map((payment, index) => (
                  <PaymentCard
                    key={payment.id}
                    payment={payment}
                    variant="completed"
                    isLast={index === completedThisMonth.length - 1}
                    onMarkComplete={() => {}}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddPayment', {})}
        color={theme.colors.onPrimary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 88,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginRight: 12,
  },
  bannerAction: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 4,
  },
  listGroup: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  emptySection: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 20,
    paddingLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 6,
  },
  emptyHint: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  completedSection: {
    marginTop: 8,
  },
  completedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  completedToggleText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: theme.colors.primary,
  },
});

export default PaymentsScreen;
