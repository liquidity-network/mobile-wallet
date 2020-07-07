import produce from 'immer'

import { AppState, GetState } from '.'
import { getPublicKey } from './auth'
import { ErrorEvents, logError } from 'services/analytics'
import { getCurrentHub, getCurrentNetwork } from './hubs'
import { getTokenByCursor } from './tokens'

// SHAPE
export interface FaucetState {
  [networkId: number]: {
    nextFaucetTimestamp: number
  }
}

export const initialFaucetState: FaucetState = {}

// SELECTORS
const getNextFaucetTimestamp = (state: AppState): number =>
  state.faucet[getCurrentNetwork(state)]
    ? state.faucet[getCurrentNetwork(state)].nextFaucetTimestamp
    : 0
const getFaucetUrl = (state: AppState): string | null => getCurrentHub(state).faucetUrl

// ACTION TYPES
const SET_NEXT_FAUCET_TIMESTAMP = 'SET_NEXT_FAUCET_TIMESTAMP'

// ACTION CREATORS

// REDUCER
export default (state: FaucetState = initialFaucetState, action): FaucetState =>
  produce(state, draft => {
    switch (action.type) {
      case SET_NEXT_FAUCET_TIMESTAMP:
        if (draft[action.network]) {
          draft[action.network].nextFaucetTimestamp = action.timestamp
        } else {
          draft[action.network] = { nextFaucetTimestamp: action.timestamp }
        }
        break
    }
  })

// THUNKS
const setNextLootTimestamp = (timestamp: number) => (dispatch, getState: GetState) =>
  dispatch({ type: SET_NEXT_FAUCET_TIMESTAMP, timestamp, network: getCurrentNetwork(getState()) })

export interface FaucetResult {
  tickerName: string
  amount: string
}

export const fetchFaucet = (nonce: string = '') => async (
  dispatch,
  getState: GetState,
): Promise<FaucetResult> => {
  const faucetUrl = getFaucetUrl(getState())
  if (faucetUrl == null) return

  if (nonce === '' && Date.now() < getNextFaucetTimestamp(getState())) return

  try {
    const result = await fetch(faucetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        nonce
          ? { address: getPublicKey(getState()), token: nonce }
          : { address: getPublicKey(getState()) },
      ),
    })

    console.log('fetch faucet result', result)
    if (result.ok) {
      const data: {
        success: boolean
        tokenAddress?: string
        amount: string
        next: number
        message?: string
      } = await result.json()
      console.log('loot server response', data)

      if (!data.success) {
        return Promise.reject(new Error(data.message))
      }

      dispatch(setNextLootTimestamp(Date.now() + data.next))

      const token = getTokenByCursor(getState(), { address: data.tokenAddress, commitChain: true })
      const tickerName = token ? token.tickerName : 'fLQD'

      return { tickerName, amount: data.amount }
    } else {
      return Promise.reject(new Error('Faucet processing failed'))
    }
  } catch (error) {
    logError(ErrorEvents.FAUCET_ERROR, { nativeError: error })
    return Promise.reject(error)
  }
}
