import produce from 'immer'
import firebase from 'react-native-firebase'

import { AppState, GetState } from '.'

// SHAPE
export interface BottomBarState {
  unseenTransactions: number
}

const initialState: BottomBarState = { unseenTransactions: 0 }

// SELECTORS
export const getUnseenTransactionsCount = (state: AppState) => state.bottomBar.unseenTransactions

// ACTION TYPES
const SET_UNSEEN_TRANSACTIONS = 'SET_UNSEEN_TRANSACTIONS'

// REDUCER
export default (state: BottomBarState = initialState, action): BottomBarState =>
  produce(state, draft => {
    switch (action.type) {
      case SET_UNSEEN_TRANSACTIONS:
        draft.unseenTransactions = action.counter
    }
  })

// THUNKS
export const setUnseenTransactions = (counter: number) => (dispatch, getState: GetState) => {
  if (getUnseenTransactionsCount(getState()) === counter) return

  firebase.notifications().setBadge(counter)

  dispatch({ type: SET_UNSEEN_TRANSACTIONS, counter })
}
