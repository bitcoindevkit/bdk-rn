/**
 * Simple test runner for integration tests
 * Prints results to console for CI capture
 */

export interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'pending';
  error?: string;
  duration?: number;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
}

class TestRunner {
  private suites: TestSuite[] = [];
  private currentSuite: TestSuite | null = null;
  private pendingPromises: Promise<void>[] = [];

  describe(suiteName: string, fn: () => void) {
    console.log(`\n[TEST SUITE] ${suiteName}`);
    this.currentSuite = { name: suiteName, tests: [] };
    this.suites.push(this.currentSuite);

    try {
      fn();
    } catch (error) {
      console.error(`[TEST SUITE ERROR] ${suiteName}:`, error);
    }
  }

  it(testName: string, fn: () => void | Promise<void>) {
    if (!this.currentSuite) {
      throw new Error('Test must be inside a describe block');
    }

    const startTime = Date.now();
    const result: TestResult = {
      name: testName,
      status: 'pending',
    };

    try {
      console.log(`[TEST START] ${testName}`);
      const maybePromise = fn();

      // Check if the function returned a promise (async test)
      if (maybePromise && typeof maybePromise.then === 'function') {
        const promise = maybePromise
          .then(() => {
            result.status = 'pass';
            result.duration = Date.now() - startTime;
            console.log(`[TEST PASS] ${testName} (${result.duration}ms)`);
          })
          .catch((error) => {
            result.status = 'fail';
            result.duration = Date.now() - startTime;
            result.error = error instanceof Error ? error.message : String(error);
            console.error(`[TEST FAIL] ${testName}: ${result.error}`);
          });

        // Track this promise so we can wait for it
        this.pendingPromises.push(promise);
      } else {
        // Synchronous test
        result.status = 'pass';
        result.duration = Date.now() - startTime;
        console.log(`[TEST PASS] ${testName} (${result.duration}ms)`);
      }
    } catch (error) {
      result.status = 'fail';
      result.duration = Date.now() - startTime;
      result.error = error instanceof Error ? error.message : String(error);
      console.error(`[TEST FAIL] ${testName}: ${result.error}`);
    }

    this.currentSuite.tests.push(result);
  }

  async waitForAsyncTests() {
    if (this.pendingPromises.length > 0) {
      await Promise.all(this.pendingPromises);
      this.pendingPromises = [];
    }
  }

  expect(value: any) {
    return {
      toBeDefined: () => {
        if (value === undefined || value === null) {
          throw new Error(`Expected value to be defined, but got ${value}`);
        }
      },
      toBe: (expected: any) => {
        if (value !== expected) {
          throw new Error(`Expected ${value} to be ${expected}`);
        }
      },
      toBeGreaterThan: (expected: number) => {
        if (typeof value !== 'number' || value <= expected) {
          throw new Error(`Expected ${value} to be greater than ${expected}`);
        }
      },
      toThrow: () => {
        // value should be a function
        if (typeof value !== 'function') {
          throw new Error('Expected value to be a function');
        }
        try {
          value();
          throw new Error('Expected function to throw an error, but it did not');
        } catch (error) {
          // Expected behavior - function threw an error
          if (error instanceof Error && error.message.includes('Expected function to throw')) {
            throw error;
          }
        }
      },
    };
  }

  reset() {
    this.suites = [];
    this.currentSuite = null;
    this.pendingPromises = [];
  }

  getSummary() {
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    this.suites.forEach(suite => {
      suite.tests.forEach(test => {
        totalTests++;
        if (test.status === 'pass') passedTests++;
        if (test.status === 'fail') failedTests++;
      });
    });

    return {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      suites: this.suites,
    };
  }

  printSummary() {
    const summary = this.getSummary();

    console.log('\n' + '='.repeat(60));
    console.log('[TEST SUMMARY]');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${summary.total}`);
    console.log(`Passed: ${summary.passed}`);
    console.log(`Failed: ${summary.failed}`);
    console.log('='.repeat(60));

    summary.suites.forEach(suite => {
      console.log(`\n${suite.name}:`);
      suite.tests.forEach(test => {
        const icon = test.status === 'pass' ? '✓' : '✗';
        const status = test.status === 'pass' ? 'PASS' : 'FAIL';
        console.log(`  ${icon} [${status}] ${test.name} (${test.duration}ms)`);
        if (test.error) {
          console.log(`    Error: ${test.error}`);
        }
      });
    });

    console.log('\n' + '='.repeat(60));

    if (summary.failed > 0) {
      console.error('[TEST RUN FAILED]');
      return false;
    } else {
      console.log('[TEST RUN PASSED]');
      return true;
    }
  }
}

// Export singleton instance
export const testRunner = new TestRunner();

// Global test functions
export const describe = testRunner.describe.bind(testRunner);
export const it = testRunner.it.bind(testRunner);
export const expect = testRunner.expect.bind(testRunner);
