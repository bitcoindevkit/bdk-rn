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

# Install compilation targets
rustup target add aarch64-linux-android aarch64-apple-ios aarch64-apple-ios-sim

# Apply the patch to the submodule (required for async Electrum and Esplora methods)
just submodule-apply-patch

# Build the library and create bdk-rn-VERSION.tgz tarball (includes both Android and iOS)
just build-tarball
```

## Running the Test Suite (Android)

The `tests/` directory contains a standalone test app that uses the library as a tarball dependency (similar to how end-users would consume it). This app is **not** part of the workspace and is completely decoupled from the library development.

You can use the following workflow to run the tests locally on an Android emulator, or to develop features on the library by first making changes to the local `bdk-ffi` repository and then running through the workflow with new/modified tests.

```shell
# Build and package the library
just build-tarball-android

# Install dependencies in the tests
# Make sure your package.json file references the ../bdk-rn-<version>-next.tgz
# Start an Android emulator
cd tests

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
3. Update tests: `cd tests && npm install`
4. Add or modify tests in the tests
5. Run the app and verify test results in logcat or in the emulator

## Generating API Reference Docs

The API reference is generated with [TypeDoc](https://typedoc.org/) from the
TypeScript bindings produced by ubrn. You must generate the bindings first:

```shell
just submodule-init
just submodule-apply-patch
pnpm ubrn:android --config ubrn.config.yaml
```

Then build the API docs alone or the full site:

```shell
# API reference only → site/api/
just api-docs

# Full site (guides + API) → site/
just docs-build
```

Preview the API reference by opening `site/api/index.html` in a browser.
`just docs` serves the Zensical guides only; use a static server on `site/`
to preview the combined site locally.

Docs are deployed to GitHub Pages on push to `main` (once CI is in place),
or manually via `./deploy-docs.sh`.
