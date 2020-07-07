import produce from 'immer'

import { AppState, GetState } from '.'
import { getPublicKey, getSignature } from './auth'
import { notifications } from 'services/notifications'
import {
  sendNotificationsTokenFunction, removeNotificationsTokenFunction,
} from 'services/cloudFunctions' // prettier-ignore

// SHAPE
export interface NotificationsState {
  token: string
  isTokenSent: boolean
}

const initialState: NotificationsState = {
  token: '',
  isTokenSent: false,
}

// SELECTORS
export const isPushNotificationsTokenSent = (state: AppState) => state.notifications.isTokenSent
export const getPushNotificationsToken = (state: AppState) => state.notifications.token

// ACTION TYPES
const SET_PUSH_NOTIFICATIONS_TOKEN = 'SET_PUSH_NOTIFICATIONS_TOKEN'
const SET_PUSH_NOTIFICATIONS_TOKEN_SENT = 'SET_PUSH_NOTIFICATIONS_TOKEN_SENT'

// REDUCER
export default (state: NotificationsState = initialState, action): NotificationsState =>
  produce(state, draft => {
    switch (action.type) {
      case SET_PUSH_NOTIFICATIONS_TOKEN:
        draft.token = action.token
        break
      case SET_PUSH_NOTIFICATIONS_TOKEN_SENT:
        draft.isTokenSent = action.value
    }
  })

// THUNKS
export const sendPushNotificationsToken = () => async (dispatch, getState: GetState) => {
  const state = getState()
  const signature = getSignature(state)
  const publicKey = getPublicKey(state)

  if (isPushNotificationsTokenSent(state) || !publicKey || !signature) return

  const token = await notifications.getToken()

  if (token === '') return

  try {
    await sendNotificationsTokenFunction({ publicKey, signature, token })
  } catch (error) {
    return Promise.reject(error)
  }

  dispatch({ type: SET_PUSH_NOTIFICATIONS_TOKEN, token })
  dispatch({ type: SET_PUSH_NOTIFICATIONS_TOKEN_SENT, value: true })
}

export const removePushNotificationsToken = () => async (_dispatch, getState: GetState) => {
  const state = getState()
  const signature = getSignature(state)
  const publicKey = getPublicKey(state)
  const token = getPushNotificationsToken(state)

  if (!signature || !publicKey || !token) return

  try {
    await removeNotificationsTokenFunction({ publicKey, signature, token })
  } catch (error) {
    return Promise.reject(error)
  }
}
