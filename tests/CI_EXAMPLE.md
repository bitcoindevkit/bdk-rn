# Running Integration Tests in CI

The tests runs tests on app launch and prints results to console, making it perfect for CI/CD pipelines.

## Console Output Format

The test runner prints standardized log messages that CI can parse:

```
[TEST SUITE] Mnemonic Integration Tests
[TEST START] should create a new 12-word mnemonic
[TEST PASS] should create a new 12-word mnemonic (45ms)
[TEST START] should throw error for invalid mnemonic string
[TEST FAIL] should throw error for invalid mnemonic string: Expected function to throw an error

============================================================
[TEST SUMMARY]
============================================================
Total Tests: 6
Passed: 5
Failed: 1
============================================================

[TEST RUN FAILED]  # or [TEST RUN PASSED]
```

## CI Configuration Example

### GitHub Actions (Android)

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  android-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up JDK
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        working-directory: tests
        run: npm install

      - name: Start Android Emulator
        uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 31
          target: google_apis
          arch: x86_64
          script: |
            cd tests
            npm run android 2>&1 | tee test-output.log &

            # Wait for app to launch and tests to run
            sleep 60

            # Check for test completion
            if grep -q "\[TEST SUMMARY\]" test-output.log; then
              echo "Tests completed"
            else
              echo "Tests did not complete"
              exit 1
            fi

            # Check for failures
            if grep -q "\[TEST RUN FAILED\]" test-output.log; then
              echo "Tests failed!"
              cat test-output.log
              exit 1
            fi

            echo "All tests passed!"
```

### Using adb logcat (Alternative)

```bash
# Start the app
npm run android &

# Monitor logcat for test output
adb logcat -s ReactNativeJS:* | grep "\[TEST" > test-output.log &

# Wait for tests to complete (adjust timeout as needed)
timeout=60
elapsed=0
while [ $elapsed -lt $timeout ]; do
  if grep -q "\[TEST SUMMARY\]" test-output.log; then
    break
  fi
  sleep 1
  elapsed=$((elapsed + 1))
done

# Check results
if grep -q "\[TEST RUN FAILED\]" test-output.log; then
  echo "Tests failed!"
  cat test-output.log
  exit 1
fi

echo "All tests passed!"
```

## Local Testing

Run tests locally and capture output:

```bash
cd tests

# Android
npm run android 2>&1 | tee test-output.log

# iOS
npm run ios 2>&1 | tee test-output.log

# Check results
if grep -q "\[TEST RUN FAILED\]" test-output.log; then
  echo "Tests failed"
  exit 1
fi
```

## Test Exit Codes

The app itself doesn't exit with error codes (since it's a long-running React Native app), but CI scripts can parse the console output to determine success/failure:

- `[TEST PASS]` - Individual test passed
- `[TEST FAIL]` - Individual test failed
- `[TEST RUN PASSED]` - All tests passed
- `[TEST RUN FAILED]` - At least one test failed
