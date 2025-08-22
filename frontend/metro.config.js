const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration for VirtualizeUtils
config.resolver.alias = {
  ...config.resolver.alias,
  './Lists/VirtualizeUtils': require.resolve('react-native/Libraries/Lists/VirtualizeUtils'),
};

// Enable symlinks for better resolution
config.resolver.symlinks = false;

module.exports = config;
