# Bitcoin Dev Kit — React Native

React Native language bindings for the [Bitcoin Development Kit](https://bitcoindevkit.org/).

## Installation

```shell
npm install bdk-rn
```

The package ships prebuilt native libraries for iOS and Android, so you do not need a Rust toolchain, and nothing is compiled or downloaded at install time.

While 1.x is in prerelease, versions are published under the `next` tag. Install one with `npm install bdk-rn@next`.

### Requirements

- The React Native [New Architecture](https://reactnative.dev/architecture/landscape-and-new-architecture), which is on by default since React Native 0.76. bdk-rn is a TurboModule and does not work with the old architecture.
- An app with native projects you build yourself. bdk-rn contains native code, so it does not run in Expo Go. With Expo, use a [development build](https://docs.expo.dev/develop/development-builds/introduction/).

### iOS

Install the pods after adding the package:

```shell
cd ios && pod install
```

Supported targets are `arm64` devices and `arm64` simulators (Apple Silicon Macs).

### Android

Supported ABIs are `arm64-v8a` (devices) and `x86_64` (emulators). 32-bit ABIs (`armeabi-v7a` and `x86`) are not supported.

New React Native apps build all four ABIs by default. The 32-bit builds would not contain bdk-rn and would crash on a 32-bit-only device, so restrict your app to the supported ABIs in `android/gradle.properties`:

```properties
reactNativeArchitectures=arm64-v8a,x86_64
```

bdk-rn's small C++ bridge is compiled as part of your app's build, using the NDK and CMake your React Native app already uses.

## Usage

```typescript
import {
  Mnemonic,
  WordCount,
  DescriptorSecretKey,
  Descriptor,
  KeychainKind,
  Network,
  NetworkKind,
  Persister,
  Wallet,
} from 'bdk-rn';

const mnemonic = new Mnemonic(WordCount.Words12);
const secretKey = new DescriptorSecretKey(NetworkKind.Test, mnemonic, undefined);
const descriptor = Descriptor.newBip86(secretKey, KeychainKind.External, NetworkKind.Test);

const wallet = Wallet.createSingle(descriptor, Network.Signet, Persister.newInMemory());
const addressInfo = wallet.revealNextAddress(KeychainKind.External);
```

The [example apps](examples/about.md) show more of the API.

## About This Repository

The code in this repository is mostly comprised of:

- Build tools
- CI and release workflows
- Tests
- Docs

The core Rust code that is exposed to the React Native language bindings actually resides in the [bdk-ffi](https://github.com/bitcoindevkit/bdk-ffi) repository. This repo pulls it in as a submodule and applies [patches](https://github.com/bitcoindevkit/bdk-rn/tree/master/patches) to it so that sync methods on the Electrum and Esplora clients become `async` when used on the JS side.

To build the library from source, for example to work on bdk-rn itself, see [Build](build.md). For more on how the bindings are generated, see the [uniffi-bindgen-react-native documentation](https://jhugman.github.io/uniffi-bindgen-react-native/guides/rn/getting-started.html).
