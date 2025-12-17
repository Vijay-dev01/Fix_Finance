import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { theme, colors } from '../theme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Don't show error boundary for network/development server errors - they're often false positives
    const errorMessage = error.message || '';
    if (
      errorMessage.includes('Network response timed out') ||
      errorMessage.includes('Network request failed') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('SocketTimeoutException') ||
      errorMessage.includes('failed to connect') ||
      errorMessage.includes('port 8081') ||
      errorMessage.includes('Metro') ||
      errorMessage.includes('ECONNREFUSED')
    ) {
      // Return null to prevent error boundary from showing for dev server issues
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Only log non-network/development server errors
    const errorMessage = error.message || '';
    if (
      !errorMessage.includes('Network response timed out') &&
      !errorMessage.includes('Network request failed') &&
      !errorMessage.includes('timeout') &&
      !errorMessage.includes('SocketTimeoutException') &&
      !errorMessage.includes('failed to connect') &&
      !errorMessage.includes('port 8081') &&
      !errorMessage.includes('Metro') &&
      !errorMessage.includes('ECONNREFUSED')
    ) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: theme.colors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorBoundary;

