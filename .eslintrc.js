module.exports = {
  'extends': ['liquidity'],
  'plugins': ['mocha', 'detox'],
  'env': {
    'mocha': true,
    'detox/detox': true
  },
  'rules': {
    'react/prop-types': 0,
    'react/jsx-handler-names': 0,
    'react/jsx-indent': 0,
  },
  'globals': {
    '__DEV__': true
  }
}
