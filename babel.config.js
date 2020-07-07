module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [['transform-inline-environment-variables', { include: ['REACT_NATIVE_ENV'] }]],
  env: {
    development: {
      plugins: ['@babel/plugin-transform-react-jsx-source'],
    },
    production: {
      plugins: ['transform-remove-console'],
    },
  },
}
