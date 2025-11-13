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

## Building the library and running the example wallet

The `example/` directory contains a full-featured example wallet app that uses workspaces for development.

```shell
# Clone the repo and install prerequisites
git clone git@github.com:bitcoindevkit/bdk-react-native.git
cargo install cargo-ndk
yarn install

# Install compilation targets, for example:
rustup target add aarch64-linux-android aarch64-apple-ios aarch64-apple-ios-sim

# Build the library
just rename-library
just build-android

# Start an Android emulator and run the example app
yarn example start    # In terminal 1
yarn example android  # In terminal 2
```

## Running the IntegrationTestingApp

The `IntegrationTestingApp/` directory contains a standalone test app that uses the library as a tarball dependency (similar to how end-users would consume it). This app is **not** part of the workspace and is completely decoupled from the library development.

```shell
# First, build and package the library
just build-android
npm pack  # Creates bdk-rn-0.1.0.tgz

# Install dependencies in the IntegrationTestingApp
cd IntegrationTestingApp
npm install

# Run the app
npm run android  # or npm run ios
```

## Workflow for testing library changes

When you make changes to the `bdk-rn` library and want to test them in the IntegrationTestingApp:

```shell
# Make local changes to the Rust code in bdk-ffi/bdk-ffi/src/

# Recompile the libary
just build-android

# Build the tarball
npm pack  # Creates updated bdk-rn-0.1.0.tgz

# Reinstall in IntegrationTestingApp
cd IntegrationTestingApp
npm install ../bdk-rn-0.1.0.tgz
```

## Notes

1. The `cargo-ndk` library removed the `--no-strip` argument and this is creating a build error when using the latest release of `uniffi-bindgen-react-native` (`0.29.3-1`). We are currently building using a commit on their `main` branch which contains the patch. See the `package.json` file.
2. For some reason the example app doesn't work on my Pixel 8 API 35 emulator, but does work on the Pixel 5 API 31 and the Pixel 9 API 36. If you get a red banner at the top of the app when launching saying `Unable to load script... ` and asking you to start Metro, try the example in a different emulator!
