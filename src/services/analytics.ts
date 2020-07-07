import firebase from 'react-native-firebase'

import { logEventFunction } from './cloudFunctions'

export const logEvent = (event: AnalyticEvents) =>
  __DEV__
    ? console.log(`---------- EVENT ${event} ----------`)
    : firebase.analytics().logEvent(event)
export const logError = async (event: ErrorEvents, data?: { [id: string]: any }) => {
  if (__DEV__) {
    console.log(`========== ERROR ${event} ==========\n`, data, '\n---------------')
  } else {
    const { store } = require('state/store')
    const { getPublicKey, getSignature } = require('state/auth')
    const { getCurrentNetwork } = require('state/hubs')

    const state = store.getState()
    const signature = getSignature(state)
    const publicKey = getPublicKey(state)

    let network = ''
    try {
      network = getCurrentNetwork(state).toString()
    } catch {}

    if (data && data.nativeError) {
      const error = data.nativeError
      data.nativeError = { code: error.code, message: error.message, stack: error.stack }
    }

    try {
      await logEventFunction({
        signature,
        publicKey,
        event,
        network,
        data: JSON.stringify(data || {}),
      })
    } catch (e) {
      console.log('logEventFunction invocation error:', e)
    }
  }
}

export enum ErrorEvents {
  TRANSFER_ONCHAIN_ERROR = 'TRANSFER_ONCHAIN_ERROR',
  TRANSFER_OFFCHAIN_ERROR = 'TRANSFER_OFFCHAIN_ERROR',
  DEPOSIT_ERROR = 'DEPOSIT_ERROR',
  WITHDRAWAL_REQUEST_ERROR = 'WITHDRAWAL_REQUEST_ERROR',
  WITHDRAWAL_CONFIRMATION_ERROR = 'WITHDRAWAL_CONFIRMATION_ERROR',
  KEYCHAIN_ERROR = 'KEYCHAIN_ERROR',
  QR_SCAN_ERROR = 'QR_SCAN_ERROR',
  SETUP_KEY_ERROR = 'SETUP_KEY_ERROR',
  FETCH_BALANCE_ERROR = 'FETCH_BALANCE_ERROR',
  FAUCET_ERROR = 'FAUCET_ERROR',
  FETCH_SUPPORTED_TOKENS = 'FETCH_SUPPORTED_TOKENS',
  FETCH_TOKENS_METADATA_ERROR = 'FETCH_TOKENS_METADATA_ERROR',
  FETCH_HUBS_LIST_ERROR = 'FETCH_HUBS_LIST_ERROR',
  FETCH_WITHDRAWAL_FEE_ERROR = 'FETCH_WITHDRAWAL_FEE_ERROR',
  STATE_UPDATE_CHALLENGE_ERROR = 'STATE_UPDATE_CHALLENGE_ERROR',
  DELIVERY_CHALLENGE_ERROR = 'DELIVERY_CHALLENGE_ERROR',
  RECOVERY_FUNDS_ERROR = 'RECOVERY_FUNDS_ERROR',
  SETUP_NOCUST = 'SETUP_NOCUST',
}

export enum AnalyticEvents {
  TRANSFER_ONCHAIN = 'TRANSFER_ONCHAIN',
  TRANSFER_COMMITCHAIN = 'TRANSFER_COMMITCHAIN',
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  WITHDRAWAL_CONFIRMATION = 'WITHDRAWAL_CONFIRMATION',
  CREATE_WALLET = 'CREATE_WALLET',
  RESTORE_WALLET = 'RESTORE_WALLET',
  WIPE_WALLET = 'WIPE_WALLET',
  SWITCH_HUB = 'SWITCH_HUB',
  FETCH_DAILY_FAUCET = 'FETCH_DAILY_FAUCET',
  FETCH_QR_FAUCET = 'FETCH_QR_FAUCET',
  SCAN_QR_ADDRESS = 'SCAN_QR_ADDRESS',
  SCAN_QR_INVOICE = 'SCAN_QR_INVOICE',
  ADD_CONTACT = 'ADD_CONTACT',
  DELETE_CONTACT = 'DELETE_CONTACT',
  ACTIVATE_TOKEN = 'ACTIVATE_TOKEN',
  DEACTIVATE_TOKEN = 'DEACTIVATE_TOKEN',
  ACCEPT_TOS = 'ACCEPT_TOS',
  SELECT_PIN = 'SELECT_PIN',
  SELECT_BIO_ID = 'SELECT_BIO_ID',
  COMPLETE_INTRO_ONBOARDING = 'COMPLETE_INTRO_ONBOARDING',
  CREATE_PAYMENT_REQUEST = 'CREATE_PAYMENT_REQUEST',
  BACKUP_PASSPHRASE = 'BACKUP_PASSPHRASE',
  BUY_SLA = 'BUY_SLA',
  SWITCH_LANGUAGE = 'SWITCH_LANGUAGE',
  SHARE_ADDRESS = 'SHARE_ADDRESS',
  OPEN_WEBSITE = 'OPEN_WEBSITE',
  OPEN_TELEGRAM = 'OPEN_TELEGRAM',
  THROTTLE_OPENED = 'THROTTLE_OPENED',
  THROTTLE_RESOLVED = 'THROTTLE_RESOLVED',
  THROTTLE_FAILED = 'THROTTLE_FAILED',
  OPEN_PLUS_MENU = 'OPEN_PLUS_MENU',
  PIN_ATTEMPTS_LIMIT_EXCEEDED = 'PIN_ATTEMPTS_LIMIT_EXCEEDED',
  HOME_SCREEN_TOGGLE_TOKEN = 'HOME_SCREEN_TOGGLE_TOKEN',
  HOME_SCREEN_PULL_DOWN = 'HOME_SCREEN_PULL_DOWN',
}
