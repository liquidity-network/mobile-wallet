import semver from 'semver'

import { fetchTokensMetadata, getTokensMetadata } from './tokensMetadata'
import { fetchHubsList } from './hubs'
import { AppState, GetState } from '.'
import { fetchWithdrawalFee, getWithdrawalFee } from './config'
import { keychain } from 'services/keychain'
import { getPublicKey, isToSSigned, signMessage, signToS } from './auth'
import { signToSFunction } from 'services/cloudFunctions'
import { signWithPrivateKey } from 'helpers/general'
import { TOS_URL, PRIVACY_URL } from 'helpers/static'
import { fetchRemoteConfig, getRemoteConfigValue } from '../services/remoteConfig'
import { openForceUpdateScreen } from '../routes/navigationActions'
// SELECTORS
// Indicates if store has data, critical for application execution
// If not, user should be navigated to NoConnectionScreen
export const isCriticalDataPresent = (state: AppState): boolean => {
  if (Object.values(getTokensMetadata(state) || {}).length === 0) return false
  // if no tokens

  // if current hub is inactive

  return true
}

// GENERAL THUNKS
// Heartbeat will be executed on HomeScreen focus
export const executeHeartBeat = () => (dispatch, getState: GetState) => {
  // TODO Remove after all existing wallets will sign message
  dispatch(signMessage())

  dispatch(fetchTokensMetadata())
  dispatch(fetchHubsList())

  const withdrawalFee = getWithdrawalFee(getState())
  if (!withdrawalFee) dispatch(fetchWithdrawalFee())
}

export const checkMinimumRequiredVersion = async () => {
  try {
    await fetchRemoteConfig()

    const minimumRequiredVersion = await getRemoteConfigValue('MIN_REQUIRED_VERSION')
    if (minimumRequiredVersion) {
      if (semver.lt(require('../../package.json').version, minimumRequiredVersion)) {
        openForceUpdateScreen()
      }
    }
  } catch (e) {
    console.log(e)
  }
}

export const fetchCriticalData = () => async dispatch => {
  try {
    await Promise.all([dispatch(fetchTokensMetadata(true)), dispatch(fetchHubsList(true))])
  } catch (error) {
    return Promise.reject(error)
  }
}

export const signToSPrivacy = () => async (dispatch, getState: GetState) => {
  const state = getState()
  const publicKey = getPublicKey(state)

  if (!publicKey || isToSSigned(state)) return

  try {
    const tosSHA = await getSHAofFile(TOS_URL)
    const privacySHA = await getSHAofFile(PRIVACY_URL)

    const privateKey = await keychain.getPrivateKey()
    const tosSignature = signWithPrivateKey(tosSHA, privateKey)
    const privacySignature = signWithPrivateKey(privacySHA, privateKey)
    const { data } = await signToSFunction({ tosSignature, privacySignature, publicKey })

    if (data && data.success) dispatch(signToS())
  } catch (e) {
    console.log('Signing ToS error', e)
    return false
  }
}

async function getSHAofFile(url: string): Promise<string> {
  const response = await fetch(url)
  const html = await response.text()

  const shaIndex = html.indexOf('<p>SHA256: ')

  if (shaIndex === -1) return Promise.reject(new Error('SHA hash was not found on ' + url))

  return html.substr(shaIndex + 11, 64)
}
