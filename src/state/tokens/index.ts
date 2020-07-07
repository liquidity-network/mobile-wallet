import { createSelector } from 'reselect'
import produce from 'immer'
import BigNumber from 'bignumber.js'
import { nocust } from 'nocust-client'
import { NCErrorCode } from 'nocust-client/dist/helpers/errors'
import { AppState, GetState } from '..'
import { fetchBalanceCommitChain } from './commitChain'
import { fetchBalanceOnChain } from './onChain'
import { getCurrentHub, updateHubsInfo } from '../hubs'
import { getPublicKey } from '../auth'
import { openThrottleResolvePopup } from 'routes/navigationActions'
import { hideCurrentSnack } from 'ui/Snack'

export interface Token {
  address: string
  tickerName: string
  balance: BigNumber
  commitChain: boolean
  fiatPrice: number
  decimals: number
  activated: boolean
  icon: string
}

export interface TokenCursor {
  address: string
  commitChain: boolean
}

interface TokenRedux extends Omit<Token, 'balance'> {
  balance: string
}

// SHAPE
export interface TokensState {
  [networkId: number]: TokenRedux[]
}

const initialState: TokensState = {}

// TRANSFORMERS
const transformTokenFromRedux = (token: TokenRedux): Token => ({
  ...token,
  balance: new BigNumber(token.balance),
})

// SELECTORS
const getRawTokens = (state: AppState): TokenRedux[] => {
  const currentHub = getCurrentHub(state)
  if (!currentHub) return []

  let tokens = state.tokens[currentHub.network]

  if (tokens && currentHub.tokens) {
    tokens = tokens.filter(token => currentHub.tokens.includes(token.address))
  }

  return tokens || []
}
export const getTokens = createSelector(getRawTokens, (rawTokens: TokenRedux[]) =>
  rawTokens.map(t => transformTokenFromRedux(t)),
)
export const getActivatedTokens = createSelector(getTokens, tokens =>
  tokens.filter(t => t.activated),
)
export const getCommitChainTokens = createSelector(getActivatedTokens, tokens =>
  tokens.filter(t => t.commitChain),
)
export const getTokenByCursor = (state: AppState, cursor: TokenCursor): Token =>
  getTokens(state).find(t => t.address === cursor.address && t.commitChain === cursor.commitChain)
export const getETHToken = createSelector(getTokens, tokens =>
  tokens.find(t => t.tickerName === 'ETH' && !t.commitChain),
)
export const getETHFiatPrice = createSelector(getETHToken, token => (token ? token.fiatPrice : 0))

// ACTION TYPES
const ADD_TOKEN = 'ADD_TOKEN'
const UPDATE_TOKEN = 'UPDATE_TOKEN'

// ACTION CREATORS

// REDUCER
export default (state: TokensState = initialState, action): TokensState =>
  produce(state, (draft: TokensState) => {
    switch (action.type) {
      case ADD_TOKEN:
        if (!draft[action.networkId]) {
          draft[action.networkId] = []
        }

        draft[action.networkId].push({
          address: action.address,
          commitChain: action.commitChain,
          tickerName: action.tickerName,
          balance: '0',
          fiatPrice: action.fiatPrice,
          decimals: action.decimals,
          icon: action.icon,
          activated: false,
        })
        break
      case UPDATE_TOKEN: {
        const token = draft[action.networkId].find(
          t => t.address === action.address && t.commitChain === action.commitChain,
        )
        if (token) {
          if (action.delta.balance) token.balance = action.delta.balance.valueOf()
          if (action.delta.activated !== undefined) token.activated = action.delta.activated
          if (action.delta.fiatPrice !== undefined) token.fiatPrice = action.delta.fiatPrice
          if (action.delta.decimals !== undefined) token.decimals = action.delta.decimals
          if (action.delta.icon !== undefined) token.icon = action.delta.icon
          if (action.delta.tickerName !== undefined) token.tickerName = action.delta.tickerName
        }
        break
      }
    }
  })

// THUNKS
export const addToken = ({ address, commitChain, tickerName, fiatPrice, decimals, icon }) => (
  dispatch,
  getState: GetState,
) =>
  dispatch({
    type: ADD_TOKEN,
    address,
    commitChain,
    tickerName,
    fiatPrice,
    decimals,
    icon,
    networkId: getCurrentHub(getState()).network,
  })

export const updateToken = (address, commitChain, delta) => (dispatch, getState: GetState) =>
  dispatch({
    type: UPDATE_TOKEN,
    address,
    commitChain,
    delta,
    networkId: getCurrentHub(getState()).network,
  })

export const activateToken = (address: string, commitChain: boolean) => async (
  dispatch,
  getState: GetState,
) => {
  const publicKey = getPublicKey(getState())
  // register if needed
  const { id, registeredTokens = [] } = getCurrentHub(getState())
  if (commitChain && registeredTokens.indexOf(address) === -1) {
    let registrationComplete = await nocust.isWalletRegistered(publicKey, address)
    if (!registrationComplete) {
      try {
        // throw { code: NOCUSTError.REGISTRATION_THROTTLING }
        await nocust.registerWallet(publicKey, address)
        console.log('wallet registered')
        registrationComplete = true
      } catch (e) {
        if (e.code === NCErrorCode.REGISTRATION_THROTTLING) {
          hideCurrentSnack()
          await resolveThrottleError()
        } else {
          return Promise.reject(e)
        }
      }
    }

    dispatch(
      updateHubsInfo({
        [id]: { id, registeredTokens: [...registeredTokens, address] },
      }),
    )
  }

  dispatch(updateToken(address, commitChain, { activated: true }))
}

function resolveThrottleError(): Promise<'success' | 'fail'> {
  return new Promise<'success' | 'fail'>(resolve =>
    openThrottleResolvePopup({ onComplete: result => resolve(result) }),
  )
}

export const deactivateToken = (address: string, commitChain: boolean) =>
  updateToken(address, commitChain, { activated: false })

let isFetchingAllBalances: boolean = false
export const fetchAllBalances = () => async (dispatch, getState: GetState) => {
  if (isFetchingAllBalances) return

  isFetchingAllBalances = true
  try {
    await Promise.all(
      getActivatedTokens(getState()).map(async token => {
        if (token.commitChain) await dispatch(fetchBalanceCommitChain(token.address))
        else await dispatch(fetchBalanceOnChain(token.address))
      }),
    )
  } finally {
    isFetchingAllBalances = false
  }
}

// UTILS
export const getComplimentaryToken = (token: Token, tokens: Token[]) =>
  tokens.find(t => t.address === token.address && !t.commitChain === token.commitChain)

export { fetchBalanceCommitChain, transferCommitChain } from './commitChain'
export { transferOnChain } from './onChain'
