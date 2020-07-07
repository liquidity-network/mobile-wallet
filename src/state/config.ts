import produce from 'immer'
import { nocust } from 'nocust-client'
import { AppState, GetState } from '.'
import { ErrorEvents, logError } from 'services/analytics'

// SHAPE
export interface ConfigState {
  gasPrice: string
  withdrawalFee: number
}

const initialState: ConfigState = {
  gasPrice: '5000000000',
  withdrawalFee: 0,
}

// SELECTORS
export const getGasPrice = (state: AppState) => state.config.gasPrice
export const getWithdrawalFee = (state: AppState) => state.config.withdrawalFee

// ACTION TYPES
const SET_GAS_PRICE = 'SET_GAS_PRICE'
const SET_WITHDRAWAL_FEE = 'SET_WITHDRAWAL_FEE'

// ACTION CREATORS

// REDUCER
export default (state: ConfigState = initialState, action): ConfigState =>
  produce(state, draft => {
    switch (action.type) {
      case SET_GAS_PRICE:
        draft.gasPrice = action.gasPrice
        break
      case SET_WITHDRAWAL_FEE:
        draft.withdrawalFee = action.fee
    }
  })

// THUNKS
export const setGasPrice = (gasPrice: string) => async (dispatch, getState: GetState) => {
  const previousGasPrice = getGasPrice(getState())

  if (gasPrice !== previousGasPrice) {
    dispatch({ type: SET_GAS_PRICE, gasPrice })
    dispatch(fetchWithdrawalFee())
  }
}

export const fetchWithdrawalFee = () => async (dispatch, getState: GetState) => {
  try {
    const gasPrice = getGasPrice(getState())
    const fee = await nocust.getWithdrawalFee(gasPrice)
    dispatch({ type: SET_WITHDRAWAL_FEE, fee })
  } catch (error) {
    logError(ErrorEvents.FETCH_WITHDRAWAL_FEE_ERROR, { nativeError: error })
  }
}
