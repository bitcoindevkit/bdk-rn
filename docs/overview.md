# Bitcoin Dev Kit — React Native

React Native language bindings for the [Bitcoin Development Kit](https://bitcoindevkit.org/).

## Overview

The code in this repository is mostly comprised of:

- Build tools
- CI workflows
- Tests
- Docs

The core Rust code that is exposed to the React Native language bindings actually resides in the [bdk-ffi](https://github.com/bitcoindevkit/bdk-ffi) repository. This repo pulls it in as a submodule and applies a specialized [patch]() to it so that sync methods on the Electrum and Esplora clients become `async` when used on the JS side.

## Prerequisites

To build the library and start testing locally, you must have:

- The [Rust](https://rust-lang.org/) toolchain installed on your machine
- Set the default Rust toolchain to `1.91.1` (currently Rust stable)
- The [just](https://github.com/casey/just) CLI tool
- Initiated the submodule (`just submodule-init`)
- Installed your Rust compilation targets

## Additional Resources

For more advanced information on how to build this library, see the [uniffi-bindgen-react-native documentation](https://jhugman.github.io/uniffi-bindgen-react-native/guides/rn/getting-started.html).
