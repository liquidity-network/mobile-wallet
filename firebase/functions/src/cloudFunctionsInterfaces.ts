export interface FunctionResult {
  success: boolean
  error?: string
}

export interface SendPushNotificationParams {
  operator: string
  amount: string
  sender: string
  recipient: string
  tokenAddress: string
  time: number
  id: string
}

export interface SendNotificationsTokenParams {
  publicKey: string
  signature: string // SIGN_MESSAGE signed by privateKey
  token: string
}

export interface SignToSParams {
  tosSignature: string
  privacySignature: string
  publicKey: string
}

export interface LogEventsParams {
  publicKey: string
  network: string
  signature: string // SIGN_MESSAGE signed by privateKey
  event: string // name of event
  data: string // extra data stringified
}

export const SIGN_MESSAGE = 'SIGN_MESSAGE'

export const API_SECRETS = ['3DAE8316C32168527EBA415E259D3', '8DA18216CB2568527EBAB15E269D4']

// NOTIFICATION TYPES
export const INCOMING_TRANSACTION = 'INCOMING_TRANSACTION'
