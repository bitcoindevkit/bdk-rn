# Bitcoin Dev Kit — React Native

React Native language bindings for the [Bitcoin Development Kit](https://bitcoindevkit.org/). Read our [documentation for this library here](https://bitcoindevkit.github.io/bdk-rn/).

The code in this repository is mostly comprised of:

- Build tools and workflows
- CI workflows
- Tests
- Docs

The core Rust code that is exposed to the React Native language bindings actually resides in the [bdk-ffi](https://github.com/bitcoindevkit/bdk-ffi) repository. This repo pulls it in as a submodule.

## Installing

1. Install the package

```shell
npm install bdk-rn
# or in an Expo project
npx expo install bdk-rn
```

2. In an Expo project, make sure the plugin is in `app.json`, and run `prebuild`.

```json
{
  "expo": {
    "plugins": ["bdk-rn"]
  }
}
```

```bash
npx expo prebuild
```

Warning: If you are using pnpm v10+, run pnpm approve-builds and select `bdk-rn` to allow the postinstall script to download the prebuilt native binaries.

## Exploring the Example Apps

To take a look at the API exposed in this library, you can run our example applications. [Read the docs on this here](https://bitcoindevkit.github.io/bdk-rn/example-apps/), and [find our example apps here](https://github.com/thunderbiscuit/bdk-rn-example-apps).

<br>

## Building the Library and Running the Tests

Take a look at [our docs here](https://bitcoindevkit.github.io/bdk-rn/) for more complete information on building, testing, CI, releases, etc.

You can easily build the library from source for quick development and iteration with only a few prerequisites:

- Rust toolchain (stable 1.91.1)
- `just` CLI tool: https://github.com/casey/just
- `cargo-ndk` (`cargo install cargo-ndk`)
- For iOS: CocoaPods >= 1.13 (`brew install cocoapods`)

### Build Instructions

```shell
# Clone the repo and install prerequisites
git clone git@github.com:bitcoindevkit/bdk-rn.git
cd bdk-rn

# Install compilation targets
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android \
  aarch64-apple-ios aarch64-apple-ios-sim x86_64-apple-ios

# Initialize the bdk-ffi submodule and apply the async-sync patches
just submodule-init
just submodule-apply-patch

# Build both platforms and create the bdk-rn-VERSION.tgz tarball
just build-tarball
```

### Running the Test Suite

The `tests/` directory contains a standalone test app that uses the library as a tarball dependency (similar to how end-users would consume it). This app is **not** part of the workspace and is completely decoupled from the library development.

You can use the following workflow to run the tests locally on an Android emulator, or to develop features on the library by first making changes to the local `bdk-ffi` repository and then running through the workflow with new/modified tests.

```shell
# Build and package the library
just build-tarball-android

# Install dependencies in the tests
cd tests

# Make sure your package.json file references the ../bdk-rn-<version>-next.tgz
npm install

# To see tests results in your shell, run this prior to starting the app
adb logcat -c && adb logcat -s ReactNativeJS | tee tests.log

# Run the app
npm run android
```

### Test Development Workflow

1. Make changes to `bdk-ffi` or the library code
2. Build and package: `just build-tarball-android`
3. Update tests: `cd tests && npm install`
4. Add or modify tests in the tests
5. Run the app and verify test results in logcat or in the emulator
