# BDK React Native Tests

This directory contains all tests for the bdk-rn library, built as integration tests.

## Directory Structure

```txt
__tests__/
│
├── integration/                       # Integration tests (run on device/emulator)
│   ├── Mnemonic.integration.test.ts   # Mnemonic integration tests
│   └── Wallet.integration.test.ts     # Wallet integration tests
│
└── test-app/                  # Minimal React Native app for running integration tests
    ├── android/               # Android configuration
    ├── App.tsx                # Minimal test app UI
    ├── package.json           # Test app dependencies
    └── README.md              # Test app documentation
```

## Running Tests

### Unit Tests

We do not have unit tests, because they require mocking the native modules, and therefore end up just testing that our mocks are correct.

### Integration Tests

Integration tests require a built native module and run on an Android emulator or device:

```bash
# 1. Build the native module
yarn ubrn:android

# 2. Start Android emulator

# 3. Run integration tests
cd __tests__/test-app
yarn install
yarn android  # Install app on emulator
yarn test     # Run integration tests
```

**What they test:**
- Actual BDK native functionality
- Real mnemonic generation and parsing
- Wallet creation and address derivation
- Native module FFI integration

## Adding New Tests

1. Create test file in `integration/`:

```typescript
import { YourClass } from 'bdk-rn';

describe('YourClass Integration Tests', () => {
  it('should work with native module', () => {
    // Test actual native functionality
  });
});
```

2. Run from test-app:

```bash
cd __tests__/test-app
yarn test
```

## Trying Fresh

```shell
npm run android
```
