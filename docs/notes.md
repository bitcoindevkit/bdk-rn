# Notes and Known Issues

## Known Issues

### 1. Emulator Compatibility

For some reason the [Android example app](https://github.com/thunderbiscuit/bdk-rn-example-apps) doesn't work on the Pixel 8 API 35 emulator, but does work on the Pixel 5 API 31 and the Pixel 9 API 36.

If you get a red banner at the top of the app when launching saying `Unable to load script...` and asking you to start Metro, try the example in a different emulator!

## Troubleshooting

### Metro Bundler Issues

If you encounter Metro bundler issues:

1. Clear the cache: `npm start -- --reset-cache`
2. Try a different emulator version (see compatibility notes above)
3. Make sure Metro is running before launching the app

### Build Issues

If you encounter build issues:

1. Ensure all Rust targets are installed: `rustup target list --installed`
2. Verify `just` is properly installed: `just --version`
3. Check that the bdk-ffi submodule is initialized: `git submodule status`
4. Clean and rebuild: `just clean && just build-tarball`
