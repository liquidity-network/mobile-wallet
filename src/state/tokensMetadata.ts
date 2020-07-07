import produce from 'immer'

import { AppState, GetState } from '.'
import { ErrorEvents, logError } from 'services/analytics'
import { db, DB_FAIL_TIMEOUT } from 'services/db'
import { failOnTimeout } from 'helpers/general'

interface TokenMetadata {
  address: string
  networkId: number
  tickerName: string
  fiatPrice: number
  decimals: number
  icon: string
  preactivated?: boolean
}

// SHAPE
export interface TokensMetadataState {
  list: { [id: string]: TokenMetadata }
  fetchTimestamp: number
}

const initialState: TokensMetadataState = {
  list: {},
  fetchTimestamp: 0,
}

// SELECTORS
export const getTokensMetadata = (state: AppState) => state.tokensMetadata.list
const getFetchTokensTimestamp = (state: AppState) => state.tokensMetadata.fetchTimestamp

// ACTIONS
const SET_TOKENS_METADATA = 'SET_TOKENS_METADATA'
const SET_TOKENS_FETCH_TIMESTAMP = 'SET_TOKENS_FETCH_TIMESTAMP'

// ACTION CREATORS
const setTokensMetadata = (tokens: { [id: string]: TokenMetadata }) => ({
  type: SET_TOKENS_METADATA,
  tokens,
})
const setTokensFetchTimestamp = (timestamp: number) => ({
  type: SET_TOKENS_FETCH_TIMESTAMP,
  timestamp,
})

// REDUCER
export default (state: TokensMetadataState = initialState, action): TokensMetadataState =>
  produce(state, draft => {
    switch (action.type) {
      case SET_TOKENS_METADATA:
        draft.list = action.tokens
        break
      case SET_TOKENS_FETCH_TIMESTAMP:
        draft.fetchTimestamp = action.timestamp
    }
  })

// THUNKS
const FETCH_TOKENS_COOLDOWN = 3 * 3600 * 1000 // 3 hours
export const fetchTokensMetadata = (force = false) => async (dispatch, getState: GetState) => {
  if (!force && Date.now() - getFetchTokensTimestamp(getState()) < FETCH_TOKENS_COOLDOWN) return
  try {
    const tokens: any = await Promise.race([
      db.fetchTokensMetadata(),
      failOnTimeout(DB_FAIL_TIMEOUT),
    ])
    dispatch(setTokensMetadata(tokens))
    dispatch(setTokensFetchTimestamp(Date.now()))
  } catch (error) {
    logError(ErrorEvents.FETCH_TOKENS_METADATA_ERROR, { nativeError: error })
    return {}
  }
}
