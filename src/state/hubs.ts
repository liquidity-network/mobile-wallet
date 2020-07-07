import produce from 'immer'
import BigNumber from 'bignumber.js'
import * as Sentry from '@sentry/react-native'
import { nocust } from 'nocust-client'
import { NCEventType } from 'nocust-client/dist/nocust/subscribe'
import { TokenInfo } from 'nocust-client/dist/nocust/getSupportedTokens'
import _ from 'lodash'

import { AppState, GetState } from '.'
import { ErrorEvents, logError } from 'services/analytics'
import {
  addToken, fetchBalanceCommitChain, getTokenByCursor, updateToken,
} from './tokens' // prettier-ignore
import { createNocustManager } from 'services/nocustManager'
import { getTokensMetadata } from './tokensMetadata'
import { COMMIT_CHAIN_NAME_PREFIX, isStaging } from 'helpers/static'
import { keychain } from 'services/keychain'
import { getPublicKey } from './auth'
import { TransactionType, updateTransaction } from './history'
import { db, DB_FAIL_TIMEOUT } from 'services/db'
import { failOnTimeout, getIdByAddressNetwork } from 'helpers/general'
import { createWallet } from './wallet'
import { openWelcomeScreen } from 'routes/navigationActions'
import { setUnseenTransactions } from './bottomBar'

export interface HubInfo {
  id: string
  name: string
  providers: { [id: string]: string }
  contract: string
  api: string
  network: number
  active: boolean
  test: boolean
  default: boolean
  tokens: string[] | undefined
  registeredTokens: string[] | undefined
  faucetUrl?: string
  transfers?: boolean
}

// SHAPE
export interface HubsState {
  list: { [id: string]: HubInfo }
  current: string | null
  fetchTimestamp: number
  connectionError: string | null
}

const initialState: HubsState = {
  current: '0x2A66937b197143907279078F3FC50Efe284C25C3-1',
  list: {},
  fetchTimestamp: 0,
  connectionError: null,
}

// SELECTORS
export const getCurrentHubId = (state: AppState) => state.hubs.current
export const getHubsList = (state: AppState): { [id: string]: HubInfo } => state.hubs.list
export const getCurrentHub = (state: AppState): HubInfo => {
  if (!_.isEmpty(getHubsList(state)) && getCurrentHubId(state))
    return getHubsList(state)[getCurrentHubId(state)]
  return null
}
export const getCurrentNetwork = (state: AppState): number => {
  if (!_.isEmpty(getCurrentHub(state))) {
    return getCurrentHub(state).network
  } else {
    return null
  }
}
export const getCurrentHubAddress = (state: AppState) =>
  getCurrentHub(state) ? getCurrentHub(state).contract : null
export const getHubConnectionError = (state: AppState) => state.hubs.connectionError
const getFetchHubTimestamp = (state: AppState) => state.hubs.fetchTimestamp

// ACTIONS
const UPDATE_HUBS_INFO = 'UPDATE_HUBS_INFO'
const SET_CURRENT_HUB = 'SET_CURRENT_HUB'
const SET_HUBS_FETCH_TIMESTAMP = 'SET_HUBS_FETCH_TIMESTAMP'
const SET_HUB_CONNECTION_ERROR = 'SET_HUB_CONNECTION_ERROR'

// ACTION CREATORS
export const setCurrentHub = (id: string) => ({ type: SET_CURRENT_HUB, id })
export const updateHubsInfo = (hubs: { [id: string]: Partial<HubInfo> }) => ({
  type: UPDATE_HUBS_INFO,
  hubs,
})
export const setHubConnectionError = (connectionError: string | null) => ({
  type: SET_HUB_CONNECTION_ERROR,
  connectionError,
})
const setFetchHubsTimestamp = (timestamp: number) => ({ type: SET_HUBS_FETCH_TIMESTAMP, timestamp })

// REDUCER
export default (state: HubsState = initialState, action): HubsState =>
  produce(state, draft => {
    switch (action.type) {
      case UPDATE_HUBS_INFO:
        Object.values<HubInfo>(action.hubs).forEach(hub => {
          draft.list[hub.id] = draft.list[hub.id] ? { ...draft.list[hub.id], ...hub } : hub
        })
        break
      case SET_HUBS_FETCH_TIMESTAMP:
        draft.fetchTimestamp = action.timestamp
        break
      case SET_CURRENT_HUB:
        draft.current = action.id
        break
      case SET_HUB_CONNECTION_ERROR:
        draft.connectionError = action.connectionError
    }
  })

// THUNKS
const FETCH_HUBS_COOLDOWN = 3 * 3600 * 1000 // 3 hours
export const fetchHubsList = (force = false) => async (dispatch, getState: GetState) => {
  if (!force && Date.now() - getFetchHubTimestamp(getState()) < FETCH_HUBS_COOLDOWN) return

  try {
    const hubsData: any = await Promise.race([db.fetchHubsList(), failOnTimeout(DB_FAIL_TIMEOUT)])
    dispatch(updateHubsInfo(hubsData))
    dispatch(setFetchHubsTimestamp(Date.now()))
  } catch (error) {
    logError(ErrorEvents.FETCH_HUBS_LIST_ERROR, { nativeError: error })
    return {}
  }
  if (!getCurrentHub(getState())) {
    if (isStaging) {
      dispatch(
        setCurrentHub(
          Object.values(getHubsList(getState())).find(
            h => h.api === 'https://rinkeby-v2.liquidity.network/',
          ).id,
        ),
      )
    } else {
      const hub = Object.values(getHubsList(getState())).find(h => h.default)
      dispatch(setCurrentHub(hub ? hub.id : Object.values(getHubsList(getState()))[0].id))
    }
  }
}

export const switchHub = (id: string) => async dispatch => {
  dispatch(disposeCurrentHub())

  dispatch(setUnseenTransactions(0))

  dispatch(setCurrentHub(id))

  try {
    await dispatch(createWallet(true))
  } catch (e) {
    console.log('error switching hubs', e)

    dispatch(disposeCurrentHub())
    openWelcomeScreen()
  }
}

let initialisedHubId: string = ''
let incomingTransfersUnsubscribe

export const initHub = () => async (dispatch, getState: GetState) => {
  const publicKey = getPublicKey(getState())
  const { id, providers, contract, api, network, tokens } = getCurrentHub(getState())

  if (id === initialisedHubId) return console.log('Hub is already initialised')

  if (!__DEV__) Sentry.setExtra('publicKey', publicKey)

  try {
    const privateKey = await keychain.getPrivateKey()
    console.log('privatekey', privateKey, providers)
    await createNocustManager(providers.default, contract, api, privateKey)
  } catch (error) {
    console.log(error)
    return Promise.reject(error)
  }
  let supportedTokens: TokenInfo[]
  try {
    supportedTokens = await nocust.getSupportedTokens()
    if (tokens) {
      supportedTokens = supportedTokens.filter(token => tokens.includes(token.address))
      const tokensMetadata = getTokensMetadata(getState())

      // Add missing tokens in the token store
      if (supportedTokens) {
        for (const token of supportedTokens) {
          const address = token.address
          const tokenMetadata = tokensMetadata[getIdByAddressNetwork(address, network)]
          if (!tokenMetadata) continue

          const { tickerName, fiatPrice, decimals, icon } = tokenMetadata

          if (!getTokenByCursor(getState(), { address, commitChain: false })) {
            dispatch(
              addToken({ address, commitChain: false, tickerName, fiatPrice, decimals, icon }),
            )
          } else {
            dispatch(updateToken(address, false, { fiatPrice, decimals, icon }))
          }

          if (!getTokenByCursor(getState(), { address, commitChain: true })) {
            dispatch(
              addToken({
                address,
                commitChain: true,
                tickerName: COMMIT_CHAIN_NAME_PREFIX + tickerName,
                fiatPrice,
                decimals,
                icon,
              }),
            )
          } else {
            dispatch(updateToken(address, true, { fiatPrice, decimals, icon }))
          }
        }
      }

      // Subscribe to incoming transfer
      incomingTransfersUnsubscribe = await nocust.subscribe({
        address: publicKey,
        callback: handleIncomingCommitChainTransaction(dispatch),
        event: NCEventType.TRANSFER_CONFIRMATION,
      })
      initialisedHubId = id
    }
  } catch (error) {
    logError(ErrorEvents.FETCH_SUPPORTED_TOKENS, { nativeError: error })
    return Promise.reject(error)
  }
}

export const disposeCurrentHub = () => () => {
  if (incomingTransfersUnsubscribe) {
    incomingTransfersUnsubscribe()
    incomingTransfersUnsubscribe = null
  }

  initialisedHubId = ''
}

function handleIncomingCommitChainTransaction(dispatch) {
  return (tx: any) => {
    console.log('Incoming transaction', tx)
    dispatch(
      updateTransaction({
        id: tx.id.toString(),
        type: TransactionType.COMMIT_CHAIN,
        amount: new BigNumber(tx.amount),
        sender: tx.wallet.address,
        recipient: tx.recipient.address,
        tokenAddress: tx.wallet.token,
        // @ts-ignore
        time: tx.timestamp,
        round: tx.eon_number,
        rejected: false,
        approved: true,
        confirmed: false,
      }),
    )
    // Update balance immediately
    dispatch(fetchBalanceCommitChain(tx.wallet.token))
  }
}
