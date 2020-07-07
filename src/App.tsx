import React from 'react'
import { UIManager } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import * as Sentry from '@sentry/react-native'

import { store, persistor } from 'state/store'
import Root from './Root'

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true)

if (!__DEV__) {
  Sentry.init({ dsn: 'https://aef8b778e7ca4890ac76c0243afb314f@sentry.io/1393424' })
}

if (__DEV__) {
  console.log('Reactotron init...')

  console.trace = require('reactotron-react-native').default.log

  require('reactotron-react-native')
    .default.configure({ host: 'localhost' }) // controls connection & communication settings
    .useReactNative() // add all built-in react native plugins
    .setAsyncStorageHandler(AsyncStorage)
    .connect() // let's connect!
}

console.error = console.log

export default () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <Root />
    </PersistGate>
  </Provider>
)
