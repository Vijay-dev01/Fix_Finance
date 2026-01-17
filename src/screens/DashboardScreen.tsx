import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text, FAB, Card, Button, Menu, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { useBudget } from '../context/BudgetContext';
import { Alert } from 'react-native';
import StatCard from '../components/StatCard';
import BudgetProgressCard from '../components/BudgetProgressCard';
import { RootStackParamList, MainTabParamList } from '../navigation/types';
import { theme } from '../theme';
import { formatCurrency } from '../constants/categories';

type DashboardScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Dashboard'>,
  StackNavigationProp<RootStackParamList>
>;

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { state, resetMonthlyBudget, carryOverBalance, allocateToSavings, sendMonthlyReportManually } =
    useBudget();
  const [menuVisible, setMenuVisible] = React.useState(false);

  const topCategories = useMemo(() => {
    return [...state.categories]
      .sort((a, b) => b.spent - a.spent)
      .filter(cat => cat.spent > 0)
      .slice(0, 3);
  }, [state.categories]);

  const handleAllocateToSavings = () => {
    if (state.remainingBalance > 0) {
      allocateToSavings(state.remainingBalance);
      setMenuVisible(false);
    }
  };

  const handleSendMonthlyReport = async () => {
    try {
      Alert.alert(
        'Generating Report',
        'Preparing monthly report and opening email composer...',
        [{ text: 'OK' }]
      );
      const result = await sendMonthlyReportManually();
      if (result.success) {
        Alert.alert(
          'Success',
          'Monthly report email has been opened! Please review and send the email.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          result.error || 'Could not generate report. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message || 'Failed to generate monthly report',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Menu */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Budget Overview</Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity onPress={() => setMenuVisible(true)}>
                <Text style={styles.menuButton}>⋮</Text>
              </TouchableOpacity>
            }
            contentStyle={styles.menuContent}
          >
            <Menu.Item
              onPress={() => {
                resetMonthlyBudget();
                setMenuVisible(false);
              }}
              title="Reset Monthly Budget"
            />
            <Menu.Item
              onPress={carryOverBalance}
              title="Carry Over Balance"
            />
            <Menu.Item
              onPress={handleAllocateToSavings}
              title="Allocate to Savings"
              disabled={state.remainingBalance <= 0}
            />
          </Menu>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Budget"
            value={state.totalBudget}
            icon="💰"
            color={theme.colors.primary}
          />
          <StatCard
            title="Total Income"
            value={state.totalIncome}
            icon="💵"
            color={theme.colors.success}
          />
        </View>
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Spent"
            value={state.totalSpent}
            icon="💸"
            color={theme.colors.error}
          />
          <StatCard
            title="Remaining"
            value={state.remainingBalance}
            icon="✅"
            color={
              state.remainingBalance >= 0
                ? theme.colors.success
                : theme.colors.error
            }
          />
        </View>
        <View style={styles.statsContainer}>
          <StatCard
            title="Progress"
            value={
              state.totalBudget > 0
                ? ((state.totalSpent / state.totalBudget) * 100).toFixed(0)
                : 0
            }
            icon="📊"
            color={theme.colors.info}
          />
        </View>

        {/* Overall Progress */}
        <Card style={styles.progressCard} mode="outlined">
          <Card.Content>
            <Text style={styles.progressTitle}>Overall Budget Progress</Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${
                      state.totalBudget > 0
                        ? Math.min(
                            (state.totalSpent / state.totalBudget) * 100,
                            100
                          )
                        : 0
                    }%`,
                    backgroundColor:
                      state.totalSpent > state.totalBudget
                        ? theme.colors.error
                        : theme.colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {state.totalBudget > 0
                ? `${((state.totalSpent / state.totalBudget) * 100).toFixed(1)}% used`
                : 'No budget set'}
            </Text>
          </Card.Content>
        </Card>

        {/* Top Spending Categories */}
        {topCategories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Spending Categories</Text>
            {topCategories.map(category => (
              <BudgetProgressCard key={category.id} category={category} />
            ))}
          </View>
        )}

        {/* Send Monthly Report Button */}
        <Card style={styles.reportCard} mode="outlined">
          <Card.Content>
            <Text style={styles.reportCardTitle}>📧 Monthly Report</Text>
            <Text style={styles.reportCardDescription}>
              Generate and send your monthly budget report via email
            </Text>
            <Button
              mode="contained"
              onPress={handleSendMonthlyReport}
              style={styles.sendReportButton}
              icon="email"
              buttonColor={theme.colors.primary}
            >
              Send Monthly Report
            </Button>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('AddTransaction')}
              style={styles.actionButton}
              icon="plus"
            >
              Add Transaction
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Categories')}
              style={styles.actionButton}
              icon="folder-multiple"
            >
              View Categories
            </Button>
          </View>
        </View>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddTransaction')}
        label="Add"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  menuButton: {
    fontSize: 24,
    color: theme.colors.onSurface,
    padding: 8,
  },
  menuContent: {
    backgroundColor: theme.colors.surface,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  progressCard: {
    margin: 16,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.surfaceVariant,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  reportCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  reportCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 8,
  },
  reportCardDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  sendReportButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default DashboardScreen;

