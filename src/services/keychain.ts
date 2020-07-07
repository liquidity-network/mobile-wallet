import { getGenericPassword, setGenericPassword, resetGenericPassword } from 'react-native-keychain'

import { ErrorEvents, logError } from './analytics'

const KEYCHAIN_USERNAME = 'liquidityNet'
const PRIVKEY_KEY = 'PRIVKEY_KEY'
const PASSPHRASE_KEY = 'PASSPHRASE_KEY'
const PIN_KEY = 'PIN'

async function getCurrentStore(): Promise<Object> {
  let result = {}

  try {
    const credentials = await getGenericPassword()
    // console.log('current credentials', credentials)

    // Returns false in case of some unexpected error
    if (typeof credentials === 'boolean' || !credentials.password) return result

    try {
      const store = JSON.parse(credentials.password)

      if (typeof store === 'object') {
        result = store
      }
    } catch (error) {
      return Promise.reject(error)
    }
  } catch (error) {
    return Promise.reject(error)
  }

  return result
}

async function getFromStore(key) {
  try {
    const store = await getCurrentStore()
    return store[key]
  } catch (error) {
    return Promise.reject(error)
  }
}

async function saveToStore(key, value) {
  try {
    const store = await getCurrentStore()
    store[key] = value

    const result = await setGenericPassword(KEYCHAIN_USERNAME, JSON.stringify(store))
    if (!result) return Promise.reject(new Error())
  } catch (error) {
    return Promise.reject(error)
  }
}

async function wipe() {
  try {
    await resetGenericPassword()
  } catch (error) {
    return Promise.reject(error)
  }
}

async function getPrivateKey(): Promise<string> {
  try {
    return await getFromStore(PRIVKEY_KEY)
  } catch (error) {
    logError(ErrorEvents.KEYCHAIN_ERROR, { operation: 'get', nativeError: error })
    return Promise.reject(error)
  }
}

async function savePrivateKey(value) {
  try {
    await saveToStore(PRIVKEY_KEY, value)
  } catch (error) {
    logError(ErrorEvents.KEYCHAIN_ERROR, { operation: 'save', nativeError: error })
    return Promise.reject(error)
  }
}

async function getPassphrase(): Promise<string> {
  try {
    return await getFromStore(PASSPHRASE_KEY)
  } catch (error) {
    logError(ErrorEvents.KEYCHAIN_ERROR, { operation: 'get', nativeError: error })
    return Promise.reject(error)
  }
}

async function savePassphrase(value) {
  try {
    await saveToStore(PASSPHRASE_KEY, value)
  } catch (error) {
    logError(ErrorEvents.KEYCHAIN_ERROR, { operation: 'save', nativeError: error })
    return Promise.reject(error)
  }
}

async function getPin(): Promise<string> {
  try {
    return await getFromStore(PIN_KEY)
  } catch (error) {
    logError(ErrorEvents.KEYCHAIN_ERROR, { operation: 'get', nativeError: error })
    return Promise.reject(error)
  }
}

async function savePin(value) {
  try {
    await saveToStore(PIN_KEY, value)
  } catch (error) {
    logError(ErrorEvents.KEYCHAIN_ERROR, { operation: 'save', nativeError: error })
    return Promise.reject(error)
  }
}

export const keychain = {
  wipe,
  getPrivateKey,
  savePrivateKey,
  getPassphrase,
  savePassphrase,
  getPin,
  savePin,
}
