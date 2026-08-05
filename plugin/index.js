/**
 * Expo config plugin for bdk-rn.
 *
 * bdk-rn ships as a TurboModule with prebuilt native binaries (downloaded by
 * the package's postinstall script), so regular React Native autolinking —
 * which `expo prebuild` runs automatically — does most of the work. This
 * plugin only validates and enforces the requirements the library cannot
 * autolink its way around:
 *
 * - The React Native New Architecture must be enabled (bdk-rn is a
 *   JSI/TurboModule-only library with no old-architecture fallback).
 * - `android.useAndroidX=true` must be set in gradle.properties.
 *
 * Usage in app.json / app.config.js:
 *
 *   { "expo": { "plugins": ["bdk-rn"] } }
 *
 * Note: bdk-rn contains custom native code, so it does not work in Expo Go.
 * Use a development build (`expo run:android` / `expo run:ios`) or EAS Build.
 */

'use strict';

const pkg = require('../package.json');

let plugins;
try {
  plugins = require('@expo/config-plugins');
} catch (error) {
  throw new Error(
    `bdk-rn: unable to load '@expo/config-plugins'. The bdk-rn config plugin ` +
      `must be used inside an Expo project. (${error.message})`
  );
}

const { createRunOncePlugin, withGradleProperties } = plugins;

function setGradleProperty(properties, key, value) {
  const result = properties.filter(
    (item) => !(item.type === 'property' && item.key === key)
  );
  result.push({ type: 'property', key, value });
  return result;
}

const withBdkRn = (config) => {
  if (config.newArchEnabled === false) {
    throw new Error(
      'bdk-rn requires the React Native New Architecture, but "newArchEnabled" ' +
        'is set to false in your app config. Remove it (it defaults to enabled ' +
        'since Expo SDK 52) or set it to true.'
    );
  }

  return withGradleProperties(config, (gradleConfig) => {
    gradleConfig.modResults = setGradleProperty(
      gradleConfig.modResults,
      'newArchEnabled',
      'true'
    );
    gradleConfig.modResults = setGradleProperty(
      gradleConfig.modResults,
      'android.useAndroidX',
      'true'
    );
    return gradleConfig;
  });
};

module.exports = createRunOncePlugin(withBdkRn, pkg.name, pkg.version);
