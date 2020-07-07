import admin from 'firebase-admin'

admin.initializeApp()

const firebaseDb = admin.database()

const fetchTokensMetadata = async () => {
  const snapshot = await firebaseDb.ref('tokens').once('value')
  return snapshot.val()
}

const fetchTokenPricesMetadata = async () => {
  const snapshot = await firebaseDb.ref('tokenPrices').once('value')
  return snapshot.val()
}

const updateTokenMetadata = tokenData =>
  firebaseDb
    .ref('tokens')
    .child(tokenData.id)
    .set(tokenData)

const updateWallet = (publicKey: string, data) =>
  firebaseDb
    .ref('wallets')
    .child(publicKey)
    .update(data)

type LogEventParameters = {
  timestamp: Date
  publicKey: string
  network: string
  event: string
  data: string
}
const logEvent = ({ timestamp, publicKey, network, event, data }: LogEventParameters) =>
  firebaseDb
    .ref('logs')
    .child((timestamp.getUTCMonth() + 1).toString())
    .child(timestamp.getUTCDate().toString())
    .child(timestamp.getTime().toString())
    .set({ publicKey, network, event, data })

const addNotificationsToken = ({ publicKey, token }: { publicKey: string; token: string }) =>
  firebaseDb
    .ref('wallets')
    .child(publicKey)
    .child('notifications')
    .child('devices')
    .child(token)
    .set(true)

const removeNotificationsToken = ({ publicKey, token }: { publicKey: string; token: string }) =>
  firebaseDb
    .ref('wallets')
    .child(publicKey)
    .child('notifications')
    .child('devices')
    .child(token)
    .remove()

const fetchNotificationTokens = async (publicKey: string) => {
  const snapshot = await firebaseDb
    .ref('wallets')
    .child(publicKey)
    .child('notifications')
    .child('devices')
    .once('value')
  return snapshot.val()
}

export const db = {
  fetchTokenPricesMetadata,
  fetchTokensMetadata,
  updateTokenMetadata,
  updateWallet,
  addNotificationsToken,
  removeNotificationsToken,
  fetchNotificationTokens,
  logEvent,
}
