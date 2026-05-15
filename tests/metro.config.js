const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // @babel/runtime@7.29+ uses an array-format exports entry that Metro's
    // package exports resolver doesn't handle, causing resolution failures
    // for helpers like slicedToArray even though the files exist on disk.
    unstable_enablePackageExports: false,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
