/**
 * BDK Integration Testing App
 * Runs integration tests on app launch
 *
 * @format
 */

import { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { runAllTests } from './tests';
import type { TestResult, TestSuite } from './tests/testRunner';

interface TestResults {
  passed: boolean;
  summary?: {
    total: number;
    passed: number;
    failed: number;
    suites: TestSuite[];
  };
  error?: string;
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [running, setRunning] = useState(true);

  const handleRunTests = async () => {
    setTestResults(null);
    setRunning(true);
    const results = await runAllTests();
    setTestResults(results);
    setRunning(false);
  };

  useEffect(() => {
    handleRunTests();
  }, []);

  if (running) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.runningText}>Running Integration Tests...</Text>
      </View>
    );
  }

  if (!testResults) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to run tests</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>BDK Integration Tests</Text>
        <View
          style={[
            styles.statusBadge,
            testResults.passed ? styles.passedBadge : styles.failedBadge,
          ]}
        >
          <Text style={styles.statusText}>
            {testResults.passed ? '✓ PASSED' : '✗ FAILED'}
          </Text>
        </View>
        <Pressable
          onPress={handleRunTests}
          style={[styles.button, running && styles.buttonDisabled]}
          disabled={running}
        >
          <Text style={styles.buttonText}>
            {running ? 'Running Tests...' : 'Run Tests Again'}
          </Text>
        </Pressable>
      </View>

      {testResults.summary && (
        <>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              Total: {testResults.summary.total} | Passed: {testResults.summary.passed} | Failed: {testResults.summary.failed}
            </Text>
          </View>

          {testResults.summary.suites.map((suite, index) => (
            <View key={index} style={styles.suiteContainer}>
              <Text style={styles.suiteName}>{suite.name}</Text>
              {suite.tests.map((test: TestResult, testIndex: number) => (
                <View
                  key={testIndex}
                  style={[
                    styles.testItem,
                    test.status === 'pass' ? styles.passedTest : styles.failedTest,
                  ]}
                >
                  <Text style={styles.testIcon}>
                    {test.status === 'pass' ? '✓' : '✗'}
                  </Text>
                  <View style={styles.testDetails}>
                    <Text style={styles.testName}>{test.name}</Text>
                    <Text style={styles.testDuration}>{test.duration}ms</Text>
                    {test.error && (
                      <Text style={styles.errorText}>{test.error}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ))}
        </>
      )}

      {testResults.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error:</Text>
          <Text style={styles.errorText}>{testResults.error}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  passedBadge: {
    backgroundColor: '#4caf50',
  },
  failedBadge: {
    backgroundColor: '#f44336',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  summaryContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  summaryText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  suiteContainer: {
    marginTop: 10,
    marginHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  suiteName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  testItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 6,
  },
  passedTest: {
    backgroundColor: '#e8f5e9',
  },
  failedTest: {
    backgroundColor: '#ffebee',
  },
  testIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  testDetails: {
    flex: 1,
  },
  testName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  testDuration: {
    fontSize: 12,
    color: '#666',
  },
  errorContainer: {
    margin: 10,
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#d32f2f',
    marginTop: 4,
  },
  runningText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  button: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default App;
