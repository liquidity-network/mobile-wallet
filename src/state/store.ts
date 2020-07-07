import { applyMiddleware, compose, createStore, Store } from 'redux'
import { persistReducer, persistStore, createMigrate } from 'redux-persist'
import thunk from 'redux-thunk'
import AsyncStorage from '@react-native-community/async-storage'

import { AppState, rootReducer } from 'state'
import { initialFaucetState } from './faucet'
import { keychain } from 'services/keychain'

export let composeEnhancers = compose

declare const global: any
if (__DEV__) {
  global.clearAsync = () => setInterval(AsyncStorage.clear, 50)
  composeEnhancers = global.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
}

const migrations: any = {
  0: () => ({}),
  3: state => ({ ...state, faucet: initialFaucetState }),
  4: state => ({ ...state, tokensMetadata: { list: {}, fetchTimestamp: 0 } }),
  5: state => {
    const newState = { ...state }

    if (state.auth.pin) keychain.savePin(state.auth.pin)

    delete newState.auth.pin

    return newState
  },
  6: state => {
    const newState = { ...state }

    delete newState.auth.lastUnlockAttempt
    newState.auth.lockedUntil = 0

    return newState
  },
  7: state => {
    const newState = { ...state }

    newState.auth.isToSAccepted = true
    delete newState.auth.isTOSAccepted

    return newState
  },
  8: state => {
    const newState = { ...state }

    delete newState.config.gasLimit

    return newState
  },
  9: state => {
    const newState = { ...state }

    delete newState.hubs.list['0x9561C133DD8580860B6b7E504bC5Aa500f0f06a7-1337'] // Limbo
    delete newState.hubs.list['0x83aFD697144408C344ce2271Ce16F33A74b3d98b-1'] // Old mainnet
    delete newState.hubs.list['0x13490D2143Dd9f2Bb30925710cEBd6CA44a594cB-1'] // XCHF
    delete newState.hubs.list['0x66b26B6CeA8557D6d209B33A30D69C11B0993a3a-4'] // Old Rinkeby

    // Set current to new mainnet
    newState.hubs.current = '0x2A66937b197143907279078F3FC50Efe284C25C3-1'
    newState.hubs.fetchTimestamp = 0

    return newState
  },
  10: state => {
    const newState = { ...state }

    delete newState.hubs.list['0xe1ee82e9a003A26959bAD20B861f4E83C78cbdD9-4'] // Wrong Rinkeby
    delete newState.hubs.list['0x01A6cC0201F51fc6e016DB734489799031881fD3-4'] // Wrong Rinkeby

    return newState
  },
  11: state => {
    const newState = { ...state }

    delete newState.hubs.list['0xE2369D8931653929d732A3C92bd520b0D32bbA8b-1'] // Dead mainnet
    delete newState.hubs.list['0x759fb9f2A64DaE68FB7eD803A98DbA703f73AeAd-4'] // Dead rinkeby

    // Set current to new mainnet
    newState.hubs.current = '0xE2369D8931653929d732A3C92bd520b0D32bbA8b-1'
    newState.hubs.fetchTimestamp = 0

    return newState
  },
}

export const store: Store<AppState> = createStore(
  persistReducer(
    {
      key: 'root',
      storage: AsyncStorage,
      version: 11,
      migrate: createMigrate(migrations, { debug: false }),
    },
    rootReducer,
  ),
  composeEnhancers(applyMiddleware(thunk)),
)

export const persistor = persistStore(store, {})
