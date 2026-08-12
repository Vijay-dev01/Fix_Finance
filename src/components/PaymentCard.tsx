import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Menu, IconButton } from 'react-native-paper';
import { Payment } from '../types/payments';
import { theme } from '../theme';
import { formatCurrency } from '../constants/categories';
import { formatDueDate, getPaymentUrgency, getStatusLabel } from '../services/paymentService';

const formatCarriedMonth = (monthStr: string): string => {
  try {
    const [y, m] = monthStr.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, 1);
    return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  } catch {
    return monthStr;
  }
};

interface PaymentCardProps {
  payment: Payment;
  onMarkComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  variant?: 'pending' | 'completed';
  isLast?: boolean;
}

const urgencyColors: Record<string, string> = {
  completed: theme.colors.success,
  overdue: theme.colors.error,
  dueSoon: theme.colors.warning,
  pending: theme.colors.info,
};

const PaymentCard: React.FC<PaymentCardProps> = ({
  payment,
  onMarkComplete,
  onEdit,
  onDelete,
  variant = 'pending',
  isLast = false,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const urgency = getPaymentUrgency(payment);
  const statusColor = urgencyColors[urgency];
  const typeLabel = payment.type === 'get' ? 'Get' : 'Give';
  const isPending = payment.status === 'pending' && variant === 'pending';
  const markLabel = payment.type === 'get' ? 'Mark Received' : 'Mark Paid';
  const isCompleted = variant === 'completed';

  return (
    <View
      style={[
        styles.container,
        isCompleted && styles.containerCompleted,
        !isLast && styles.containerDivider,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.mainInfo}>
          <Text style={[styles.personName, isCompleted && styles.textDimmed]} numberOfLines={1}>
            {payment.personName}
          </Text>
          <View style={styles.amountRow}>
            <Text style={[styles.amount, isCompleted && styles.textDimmed]}>
              {formatCurrency(payment.amount)}
            </Text>
            <Text style={styles.typeLabel}>{typeLabel}</Text>
          </View>
          <Text style={styles.dueLine}>Due {formatDueDate(payment.dueDate)}</Text>
        </View>

        <View style={styles.rightCol}>
          <View style={[styles.badge, { backgroundColor: statusColor + '22' }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {getStatusLabel(payment)}
            </Text>
          </View>
          {isPending && (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  iconColor={theme.colors.textSecondary}
                  onPress={() => setMenuVisible(true)}
                  style={styles.menuBtn}
                />
              }
              contentStyle={styles.menuContent}
            >
              <Menu.Item
                onPress={() => {
                  setMenuVisible(false);
                  onEdit();
                }}
                title="Edit"
              />
              <Menu.Item
                onPress={() => {
                  setMenuVisible(false);
                  onDelete();
                }}
                title="Delete"
                titleStyle={{ color: theme.colors.error }}
              />
            </Menu>
          )}
        </View>
      </View>

      {payment.carriedFromMonth && isPending && (
        <Text style={styles.carriedNote}>
          Carried from {formatCarriedMonth(payment.carriedFromMonth)}
        </Text>
      )}

      {payment.note && !isCompleted ? (
        <Text style={styles.note} numberOfLines={2}>
          {payment.note}
        </Text>
      ) : null}

      {isPending && (
        <Button
          mode="contained"
          onPress={onMarkComplete}
          style={styles.markBtn}
          labelStyle={styles.markBtnLabel}
          buttonColor={theme.colors.primary}
        >
          {markLabel}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  containerCompleted: {
    opacity: 0.65,
    paddingVertical: 10,
  },
  containerDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.surfaceVariant,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  mainInfo: {
    flex: 1,
    marginRight: 8,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 2,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  typeLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  dueLine: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  textDimmed: {
    color: theme.colors.textSecondary,
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  menuBtn: {
    margin: 0,
    width: 32,
    height: 32,
  },
  menuContent: {
    backgroundColor: theme.colors.surface,
  },
  carriedNote: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 6,
  },
  note: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 6,
  },
  markBtn: {
    marginTop: 12,
    borderRadius: 8,
  },
  markBtnLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PaymentCard;
