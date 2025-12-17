import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { theme, colors } from '../theme';
import { formatCurrency } from '../constants/categories';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = theme.colors.primary,
}) => {
  return (
    <Card style={styles.card} mode="outlined">
      <Card.Content>
        <View style={styles.content}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={[styles.value, { color }]}>
              {typeof value === 'number' ? formatCurrency(value) : `${value}%`}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 4,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceVariant,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default StatCard;

