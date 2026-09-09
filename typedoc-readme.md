# bdk-rn API Reference

React Native language bindings for the [Bitcoin Development Kit](https://bitcoindevkit.org/).

This reference is auto-generated from the TypeScript bindings produced by
[uniffi-bindgen-react-native](https://github.com/jhugman/uniffi-bindgen-react-native),
which in turn reflects the Rust API in [bdk-ffi](https://github.com/bitcoindevkit/bdk-ffi).

## React Native-specific behavior

The Electrum and Esplora blockchain client methods (`scan`, `fullScan`,
`broadcast`) are **asynchronous** in this library (they return `Promise`).
This differs from bdk-python and other bindings where these methods are
synchronous. This is a deliberate patch applied to bdk-ffi for React Native
compatibility.

## Getting started

See [Getting Started](https://bitcoindevkit.github.io/bdk-rn/overview/) for
installation and setup. For usage examples, see the
[example apps](https://bitcoindevkit.github.io/bdk-rn/examples/about/).
