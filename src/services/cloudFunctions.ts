import firebase from 'react-native-firebase'
import {
  FunctionResult, LogEventsParams, SendNotificationsTokenParams, SignToSParams,
} from '../../firebase/functions/src/cloudFunctionsInterfaces' // prettier-ignore

export const signToSFunction = firebase
  .functions()
  .httpsCallable<SignToSParams, FunctionResult>('signToS')
export const logEventFunction = firebase
  .functions()
  .httpsCallable<LogEventsParams, FunctionResult>('logEvent')
export const sendNotificationsTokenFunction = firebase
  .functions()
  .httpsCallable<SendNotificationsTokenParams, FunctionResult>('sendNotificationsToken')
export const removeNotificationsTokenFunction = firebase
  .functions()
  .httpsCallable<SendNotificationsTokenParams, FunctionResult>('removeNotificationsToken')
