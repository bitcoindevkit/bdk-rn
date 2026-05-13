const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const root = path.resolve(__dirname, '..');
const config = getDefaultConfig(__dirname);

// Watch the library source for live changes during development
config.watchFolders = [root];

// Resolve react/react-native from the example's node_modules to avoid duplicates
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(root, 'node_modules'),
];

module.exports = config;
