import produce from 'immer'
import Bip39 from 'bip39'
import HDKey from 'ethereumjs-wallet/hdkey'
import EthereumWallet from 'ethereumjs-wallet'

import { keychain } from 'services/keychain'
import { AppState, GetState } from '.'
import { ErrorEvents, logError } from 'services/analytics'
import { signWithPrivateKey } from 'helpers/general'
import { SIGN_MESSAGE } from '../../firebase/functions/src/cloudFunctionsInterfaces'

export enum AuthMethod {
  PIN = 'PIN',
  FINGERPRINT = 'Fingerprint',
}

export enum KeyType {
  PASSPHRASE = 1,
  PRIVATE_KEY = 2,
  KEYSTORE = 3,
}

// SHAPE
export interface AuthState {
  isToSAccepted: boolean
  isToSSigned: boolean
  pubKey: string
  derivationPath: string // used for derivation single pub/private key from seed phrase
  setupDate: number
  authMethod: AuthMethod
  lockedUntil: number
  didBackupPassphrase: boolean
  privateKeyType: KeyType
  signMessage: string
}

const initialState: AuthState = {
  isToSAccepted: false,
  isToSSigned: false,
  pubKey: null,
  derivationPath: "m/44'/60'/0'/0/0",
  setupDate: null,
  authMethod: AuthMethod.PIN,
  lockedUntil: 0,
  didBackupPassphrase: false,
  privateKeyType: KeyType.PASSPHRASE,
  signMessage: null,
}

// SELECTORS
export const getPublicKey = (state: AppState) => state.auth.pubKey
export const getAuthMethod = (state: AppState) => state.auth.authMethod
export const getLockedUntil = (state: AppState) => state.auth.lockedUntil
export const getPrivateKeyType = (state: AppState) => state.auth.privateKeyType
export const getSignature = (state: AppState) => state.auth.signMessage
export const isToSAccepted = (state: AppState) => state.auth.isToSAccepted
export const isToSSigned = (state: AppState) => state.auth.isToSSigned
export const didBackupPassphrase = (state: AppState) => state.auth.didBackupPassphrase

// ACTION TYPES
const SET_PUBLIC_KEY = 'SET_PUBLIC_KEY'
const SET_AUTH_METHOD = 'SET_AUTH_METHOD'
const SET_LOCKED_UNTIL = 'SET_LOCKED_UNTIL'
const BACKUP_PASSPHRASE = 'BACKUP_PASSPHRASE'
const SET_PRIVATE_KEY_TYPE = 'SET_PRIVATE_KEY_TYPE'
const ACCEPT_TOS = 'ACCEPT_TOS'
const SIGN_TOS = 'SIGN_TOS'
const SET_SIGN_MESSAGE = 'SET_SIGN_MESSAGE'

// ACTION CREATORS
export const setPassphraseBackedUp = () => ({ type: BACKUP_PASSPHRASE })
export const setAuthMethod = (method: AuthMethod) => ({ type: SET_AUTH_METHOD, method })
export const setPrivateKeyType = (privateKeyType: KeyType) => ({
  type: SET_PRIVATE_KEY_TYPE,
  privateKeyType,
})
export const acceptToS = () => ({ type: ACCEPT_TOS })
export const signToS = () => ({ type: SIGN_TOS })
export const setLockedUntil = (timestamp: number) => ({ type: SET_LOCKED_UNTIL, timestamp })

// REDUCER
export default (state: AuthState = initialState, action): AuthState =>
  produce(state, draft => {
    switch (action.type) {
      case SET_PUBLIC_KEY:
        draft.pubKey = action.pubKey
        draft.setupDate = action.timestamp
        break
      case SET_AUTH_METHOD:
        draft.authMethod = action.method
        break
      case BACKUP_PASSPHRASE:
        draft.didBackupPassphrase = true
        break
      case SET_PRIVATE_KEY_TYPE:
        draft.privateKeyType = action.privateKeyType
        break
      case ACCEPT_TOS:
        draft.isToSAccepted = true
        break
      case SIGN_TOS:
        draft.isToSSigned = true
        break
      case SET_LOCKED_UNTIL:
        draft.lockedUntil = action.timestamp
        break
      case SET_SIGN_MESSAGE:
        draft.signMessage = action.message
    }
  })

// THUNKS
export const setupKeys = (key: string, keyType: KeyType, password?: string) => async dispatch => {
  let wallet

  switch (keyType) {
    case KeyType.PASSPHRASE:
      try {
        const masterSeed = Bip39.mnemonicToSeed(key)
        const hdDerivator = HDKey.fromMasterSeed(masterSeed)
        wallet = hdDerivator.derivePath(initialState.derivationPath).getWallet()
      } catch (error) {
        logError(ErrorEvents.SETUP_KEY_ERROR, { type: 'PASSPHRASE', nativeError: error })
        return Promise.reject(error)
      }
      break
    case KeyType.PRIVATE_KEY:
      try {
        wallet = EthereumWallet.fromPrivateKey(Buffer.from(key, 'hex'))
      } catch (error) {
        logError(ErrorEvents.SETUP_KEY_ERROR, { type: 'PRIVATE_KEY', nativeError: error })
        return Promise.reject(error)
      }
      break
    case KeyType.KEYSTORE:
      try {
        wallet = EthereumWallet.fromV3(key, password, true)
      } catch (error) {
        logError(ErrorEvents.SETUP_KEY_ERROR, { type: 'KEYSTORE', nativeError: error })
        return Promise.reject(error)
      }
  }

  const publicKey = wallet.getChecksumAddressString()
  const privateKey = wallet.getPrivateKeyString()

  // Save in iOS keychain/Android secure storage private key and passphrase
  try {
    await keychain.savePrivateKey(privateKey)
    if (keyType === KeyType.PASSPHRASE) {
      await keychain.savePassphrase(key)
    }
  } catch (error) {
    return Promise.reject(error)
  }

  dispatch(signMessage())

  dispatch({ type: SET_PUBLIC_KEY, pubKey: publicKey, timestamp: Date.now() })
}

export const signMessage = () => async (dispatch, getState: GetState) => {
  if (!getSignature(getState())) {
    const privateKey = await keychain.getPrivateKey()
    if (privateKey) {
      dispatch({ type: SET_SIGN_MESSAGE, message: signWithPrivateKey(SIGN_MESSAGE, privateKey) })
    }
  }
}
