import tokens, { TokensState } from './tokens'
import { combineReducers } from 'redux'
import storage from 'redux-persist/lib/storage'

import auth, { AuthState } from './auth'
import config, { ConfigState } from './config'
import history, { HistoryState } from './history'
import contacts, { ContactsState } from './contacts'
import faucet, { FaucetState } from './faucet'
import hubs, { HubsState } from './hubs'
import bottomBar, { BottomBarState } from './bottomBar'
import tokensMetadata, { TokensMetadataState } from './tokensMetadata'
import notifications, { NotificationsState } from './notifications'

export interface AppState {
  auth: AuthState
  tokens: TokensState
  config: ConfigState
  history: HistoryState
  contacts: ContactsState
  faucet: FaucetState
  hubs: HubsState
  bottomBar: BottomBarState
  tokensMetadata: TokensMetadataState
  notifications: NotificationsState
}

export type GetState = () => AppState

const combinedReducer = combineReducers<AppState>({
  auth,
  config,
  tokens,
  history,
  contacts,
  faucet,
  hubs,
  bottomBar,
  tokensMetadata,
  notifications,
})

export const rootReducer = (state: AppState, action): AppState => {
  if (action.type === 'WIPE_WALLET') {
    // Clean up redux-persist storage
    Object.keys(state).forEach(key => storage.removeItem(`persist:${key}`))

    //    const { contacts, config, tokensMetadata } = state
    const newState = combinedReducer(undefined, action)
    return {
      ...newState,
      auth: { ...newState.auth, isToSAccepted: true },
    }
  }

  return combinedReducer(state, action)
}
