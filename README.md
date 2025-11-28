# Bitcoin Dev Kit — React Native

React Native language bindings for the [Bitcoin Development Kit](https://bitcoindevkit.org/).

The code in this repository is mostly comprised of:

- Build tools and workflows
- CI workflows
- Tests
- Docs

The core Rust code that is exposed to the React Native language bindings actually resides in the [bdk-ffi](https://github.com/bitcoindevkit/bdk-ffi) repository. This repo pulls it in as a submodule.

## Notes for developers

See the docs at https://jhugman.github.io/uniffi-bindgen-react-native/guides/rn/getting-started.html for more advanced information on how to build this library.

To build the library and start testing locally, you must have:

- The [Rust](https://rust-lang.org/) toolchain installed on your machine
- Set the default Rust toolchain to `1.90.0` (currently Rust stable)
- The [just](https://github.com/casey/just) cli tool
- Initiated the submodule (`just submodule-init`)
- Installed your Rust compilation targets

## Running the example app (using the pre-built tarball)

The `example/` directory contains a full-featured example wallet app. The easiest way to get started is to download a pre-built tarball from our [GitHub Releases](https://github.com/bitcoindevkit/bdk-rn/releases).

```shell
# Clone the repo
git clone git@github.com:bitcoindevkit/bdk-rn.git
cd bdk-rn

# Download the pre-built tarball from GitHub releases and add it to the root of this repository

# Install dependencies in the example app
cd example
npm install
# Note: The tarball is already referenced in package.json as file:../bdk-rn-VERSION.tgz
# Make sure the version matches.

# For iOS, also install pods
cd ios && pod install && cd ..

# Start the example app
npm run start     # In terminal 1
npm run android   # In terminal 2 (or npm run ios for iOS)
```

## Building the library from source

If you need to modify the library or build from source, you must have the Rust toolchain installed:

```shell
# Clone the repo and install prerequisites
git clone git@github.com:bitcoindevkit/bdk-rn.git
cd bdk-rn
cargo install cargo-ndk

# Install compilation targets, for example:
rustup target add aarch64-linux-android aarch64-apple-ios aarch64-apple-ios-sim

# Build the library and create tarball
just rename-library
just build-android
npm pack  # Creates bdk-rn-VERSION.tgz

# Install in the example app
cd example
npm install
# The package.json already references the tarball from the parent directory

# For iOS, also install pods
cd ios && pod install && cd ..

# Start the example app
npm run start     # In terminal 1
npm run android   # In terminal 2 (or npm run ios for iOS)
```

## Running the IntegrationTestingApp

The `IntegrationTestingApp/` directory contains a standalone test app that uses the library as a tarball dependency (similar to how end-users would consume it). This app is **not** part of the workspace and is completely decoupled from the library development. You can use the following workflow to run the tests locally on an Android emulator, or to develop features on the library by first making changes to the local `bdk-ffi` repository, and then running through the workflow with new/modified tests.

```shell
# First, build and package the library
just build-android
npm pack  # Creates bdk-rn-0.1.0.tgz

# Install dependencies in the IntegrationTestingApp
cd IntegrationTestingApp
npm install
npm install ../bdk-rn-0.1.0-next.tgz

# To see tests results in your shell, run this prior to starting the app
adb logcat -c && adb logcat -s ReactNativeJS | tee tests.log

# Run the app
npm run android  # or npm run ios
```

## Notes

1. The `cargo-ndk` library removed the `--no-strip` argument and this is creating a build error when using the latest release of `uniffi-bindgen-react-native` (`0.29.3-1`). We are currently building using a commit on their `main` branch which contains the patch. See the `package.json` file.
2. For some reason the example app doesn't work on my Pixel 8 API 35 emulator, but does work on the Pixel 5 API 31 and the Pixel 9 API 36. If you get a red banner at the top of the app when launching saying `Unable to load script... ` and asking you to start Metro, try the example in a different emulator!
