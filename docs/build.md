# Building the Library

You can easily build the library from source for quick development and iteration with only a few prerequisites:

- Rust toolchain (stable 1.91.1)
- `just` CLI tool: https://github.com/casey/just
- `cargo-ndk` (`cargo install cargo-ndk`)
- For iOS: CocoaPods >= 1.13: ()`brew install cocoapods`)

### Build Instructions

```shell
# Clone the repo and install prerequisites
git clone git@github.com:bitcoindevkit/bdk-rn.git
cd bdk-rn

# Install JS dependencies
yarn install

# Install compilation targets
rustup target add aarch64-linux-android aarch64-apple-ios aarch64-apple-ios-sim

# Apply the patch to the submodule (required for async Electrum and Esplora methods)
just submodule-apply-patch

# Build the library and create bdk-rn-VERSION.tgz tarball (includes both Android and iOS)
just build-tarball
```

## Running the Test Suite (Android)

The `IntegrationTestingApp/` directory contains a standalone test app that uses the library as a tarball dependency (similar to how end-users would consume it). This app is **not** part of the workspace and is completely decoupled from the library development.

You can use the following workflow to run the tests locally on an Android emulator, or to develop features on the library by first making changes to the local `bdk-ffi` repository and then running through the workflow with new/modified tests.

```shell
# Build and package the library
just build-tarball-android

# Install dependencies in the IntegrationTestingApp
# Make sure your package.json file references the ../bdk-rn-<version>-next.tgz
# Start an Android emulator
cd IntegrationTestingApp

# Install JS dependencies
npm install

# Terminal 1: Monitor the logs
adb logcat -c && adb logcat -s ReactNativeJS | tee tests.log

# Terminal 2: Always restart metro (caching issues)
npx react-native start --reset-cache

# Terminal 3: Build the app and run the tests
just test-android
```

## Test Development Workflow

1. Make changes to `bdk-ffi` or the library code
2. Build and package: `just build-android && npm pack`
3. Update IntegrationTestingApp: `cd IntegrationTestingApp && npm install`
4. Add or modify tests in the IntegrationTestingApp
5. Run the app and verify test results in logcat or in the emulator
