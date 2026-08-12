import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { theme } from '../theme';
import { formatCurrency } from '../constants/categories';
import { PaymentSummaries } from '../services/paymentService';

interface PaymentSummaryRowProps {
  summaries: PaymentSummaries;
}

const PaymentSummaryRow: React.FC<PaymentSummaryRowProps> = ({ summaries }) => {
  return (
    <View style={styles.container}>
      <View style={styles.column}>
        <View style={styles.labelRow}>
          <View style={[styles.dot, { backgroundColor: theme.colors.success }]} />
          <Text style={styles.label}>To Get</Text>
        </View>
        <Text style={styles.amount}>{formatCurrency(summaries.toGet.pendingTotal)}</Text>
        <Text style={styles.count}>
          {summaries.toGet.count} {summaries.toGet.count === 1 ? 'payment' : 'payments'}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.column}>
        <View style={styles.labelRow}>
          <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
          <Text style={styles.label}>To Give</Text>
        </View>
        <Text style={styles.amount}>{formatCurrency(summaries.toGive.pendingTotal)}</Text>
        <Text style={styles.count}>
          {summaries.toGive.count} {summaries.toGive.count === 1 ? 'payment' : 'payments'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.onSurface,
    marginBottom: 2,
  },
  count: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.surfaceVariant,
    marginVertical: 4,
  },
});

export default PaymentSummaryRow;
