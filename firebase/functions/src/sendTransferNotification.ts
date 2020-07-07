import { https } from 'firebase-functions'
import admin from 'firebase-admin'
import { BigNumber } from 'bignumber.js'

import {
  API_SECRETS, INCOMING_TRANSACTION, SendPushNotificationParams,
} from './cloudFunctionsInterfaces' // prettier-ignore
import { db } from './services/db'
import { weiToEth } from './utils'

export const sendTransferNotificationFn = https.onRequest(async (request, response) => {
  console.log('==> sendTransferNotification, secret', request.query.secret)

  if (!API_SECRETS.includes(request.query.secret)) {
    return response.send({ success: false, error: 'Secret is not valid' })
  }

  const {
    id, recipient, amount, sender, time, tokenAddress, operator
  } = request.body as SendPushNotificationParams // prettier-ignore

  console.log(JSON.stringify(request.body))

  if (!id || !recipient || !sender || !time || !tokenAddress || !operator || amount == null) {
    return response.send({ success: false, error: 'Required parameter(s) is missed' })
  }

  const [, network] = operator.split('-')

  const tokensMetadata = await db.fetchTokensMetadata()
  // console.log('tokensMetadata', Object.keys(tokensMetadata))

  const tokenMetadata = tokensMetadata[tokenAddress + '-' + network]
  console.log('tokenMetadata', tokenMetadata)

  const recipientTokens = await db.fetchNotificationTokens(recipient)

  const senderShort = sender.slice(0, 7) + '...' + sender.slice(37)
  const amountFormatted = weiToEth(new BigNumber(amount), tokenMetadata.decimals)

  if (recipientTokens) {
    const recipientTokensArray = Object.keys(recipientTokens)
    console.log('recipient tokens', recipientTokensArray)

    for (const token of recipientTokensArray) {
      try {
        await admin.messaging().send({
          token,
          data: {
            type: INCOMING_TRANSACTION,
            id: id.toString(),
            recipient,
            sender,
            time: time.toString(),
            tokenAddress,
            amount,
          },
          notification: {
            title: 'Incoming transaction',
            body: `You've received ${amountFormatted} f${tokenMetadata.tickerName} from ${senderShort}`,
          },
        })
      } catch (error) {
        console.log('notification sending error', error.code)
      }
    }

    return response.send({ success: true })
  } else {
    return response.send({ success: false, error: 'Recipient has no registered devices' })
  }
})
