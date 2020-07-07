module.exports = {
  resolver: {
    extraNodeModules: {
      crypto: require.resolve('react-native-crypto'),
      http: require.resolve('@tradle/react-native-http'),
      https: require.resolve('https-browserify'),
      net: require.resolve('https-browserify'),
      os: require.resolve('react-native-os'),
      stream: require.resolve('stream-browserify'),
      vm: require.resolve('vm-browserify'),
      tls: require.resolve('https-browserify'),
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
}
