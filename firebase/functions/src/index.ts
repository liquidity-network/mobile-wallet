import { https } from 'firebase-functions'
import axios from 'axios'
import get from 'lodash.get'

import { db } from './services/db'
import { getSHAofFile, sendErrorToSlack, checkSign } from './utils'
import {
  FunctionResult, LogEventsParams, SendNotificationsTokenParams,
  SIGN_MESSAGE, SignToSParams,
} from './cloudFunctionsInterfaces' // prettier-ignore
import { sendTransferNotificationFn } from './sendTransferNotification'

export const fetchTokenRates = https.onRequest(async (_req, response) => {
  let tokens
  let tokenPricesData

  try {
    tokens = await db.fetchTokensMetadata()

    tokenPricesData = await db.fetchTokenPricesMetadata()
  } catch (error) {
    console.log('error', error)
    return sendErrorToSlack('@channel General fetching token rates error' + error.toString())
  }

  for (const tickerName in tokenPricesData) {
    console.log('ticker:', tickerName)
    try {
      const response = await axios(tokenPricesData[tickerName].apiUrl)
      // console.log('data', response.data)

      if (response.data) {
        const price = get(response.data, tokenPricesData[tickerName].resultPath)
        console.log('price', price)

        if (price) {
          Object.keys(tokens)
            .map(tokenId => tokens[tokenId])
            .filter(t => t.tickerName === tickerName)
            .forEach(tokenData =>
              db.updateTokenMetadata({ ...tokenData, fiatPrice: Number(price) }),
            )
        }
      }
    } catch (error) {
      console.log('error:', error)
      sendErrorToSlack(
        `@channel Error fetching rate of token ${tickerName}\nDetails: ` + error.toString(),
      )
    }
  }

  return response.send('Cloud function completed')
})

export const sendTransferNotification = sendTransferNotificationFn

export const sendNotificationsToken = https.onCall(
  async (data: SendNotificationsTokenParams): Promise<FunctionResult> => {
    const { token, publicKey, signature } = data
    console.log('sendNotificationsToken', data)

    if (!checkSign(SIGN_MESSAGE, signature, publicKey)) {
      console.log('sendNotificationsToken signature validation failed')
      return { success: false, error: 'sendNotificationsToken signature validation failed' }
    }

    await db.addNotificationsToken({ publicKey, token })
    return { success: true }
  },
)

export const removeNotificationsToken = https.onCall(
  async (data: SendNotificationsTokenParams): Promise<FunctionResult> => {
    const { token, publicKey, signature } = data
    console.log('removeNotificationsToken', data)

    if (!checkSign(SIGN_MESSAGE, signature, publicKey)) {
      console.log('removeNotificationsToken signature validation failed')
      return { success: false, error: 'removeNotificationsToken signature validation failed' }
    }

    await db.removeNotificationsToken({ publicKey, token })
    return { success: true }
  },
)

const TOS_URL = 'https://liquidity-network.github.io/terms/tos'
const PRIVACY_URL = 'https://liquidity-network.github.io/terms/privacy'
export const signToS = https.onCall(
  async (data: SignToSParams): Promise<FunctionResult> => {
    const { tosSignature, privacySignature, publicKey } = data

    console.log('signToS', data)
    const tosSHA = await getSHAofFile(TOS_URL)
    const privacySHA = await getSHAofFile(PRIVACY_URL)

    if (!checkSign(tosSHA, tosSignature, publicKey)) {
      console.log('ToS signature validation failed')
      return { success: false, error: 'ToS signature validation failed' }
    }

    if (!checkSign(privacySHA, privacySignature, publicKey)) {
      console.log('Privacy signature validation failed')
      return { success: false, error: 'Privacy signature validation failed' }
    }

    await db.updateWallet(publicKey, { tosSignature, privacySignature })

    return { success: true }
  },
)

export const logEvent = https.onCall(
  async (data: LogEventsParams): Promise<FunctionResult> => {
    const { publicKey, signature, event, network = '', data: eventData } = data

    if (!checkSign(SIGN_MESSAGE, signature, publicKey)) {
      console.log('logEvent signature validation failed')
      return { success: false, error: 'logEvent signature validation failed' }
    }

    await db.logEvent({ timestamp: new Date(), publicKey, network, event, data: eventData })
    return { success: true }
  },
)
