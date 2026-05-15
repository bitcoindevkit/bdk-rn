/**
 * Main test entry point
 * Import and run all test suites here
 */

import { testRunner } from './testRunner';
import { runMnemonicTests } from './mnemonic.test';
import { runWalletTests } from './wallet.test';
import { runDescriptorTests } from './descriptor.test';
import { runCreatingWalletTests } from './creatingWallet.test';
import { runPersistenceTests } from './persistence.test';
import { runBackgroundSyncTests } from './backgroundSync.test';

export async function runAllTests() {
  console.log('\n🧪 Starting BDK Integration Tests...\n');

  // Reset test runner state before running tests
  testRunner.reset();

  try {
    // Run all test suites
    runMnemonicTests();
    runDescriptorTests();
    runCreatingWalletTests();
    runWalletTests();
    runPersistenceTests();
    runBackgroundSyncTests();

    // Wait for all async tests to complete
    await testRunner.waitForAsyncTests();

    // Print summary
    const passed = testRunner.printSummary();

    return {
      passed,
      summary: testRunner.getSummary(),
    };
  } catch (error) {
    console.error('[TEST ERROR]', error);
    return {
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
