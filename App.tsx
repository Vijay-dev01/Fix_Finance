import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { BudgetProvider } from './src/context/BudgetContext';
import MainNavigator from './src/navigation/MainNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { theme } from './src/theme';

// Suppress network/development server errors in console (they're often false positives)
if (__DEV__) {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const errorMessage = args[0]?.toString() || '';
    // Filter out network timeout and Metro bundler connection errors
    if (
      errorMessage.includes('Network response timed out') ||
      errorMessage.includes('Network request failed') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('SocketTimeoutException') ||
      errorMessage.includes('failed to connect') ||
      errorMessage.includes('port 8081') ||
      errorMessage.includes('Metro') ||
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('java.net.SocketTimeoutException')
    ) {
      // Silently ignore these errors - they're development server connection issues
      return;
    }
    originalError.apply(console, args);
  };
}

export default function App() {
  return (
    <ErrorBoundary>
      <PaperProvider theme={theme}>
        <BudgetProvider>
          <StatusBar style="light" />
          <MainNavigator />
        </BudgetProvider>
      </PaperProvider>
    </ErrorBoundary>
  );
}

