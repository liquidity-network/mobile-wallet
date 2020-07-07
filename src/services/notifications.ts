import firebase from 'react-native-firebase'

import { INCOMING_TRANSACTION } from '../../firebase/functions/src/cloudFunctionsInterfaces'
import { openTransactionsScreen } from 'routes/navigationActions'

const getToken = async (): Promise<string | null> => {
  try {
    const enabled = await firebase.messaging().hasPermission()
    if (!enabled) {
      await firebase.messaging().requestPermission()
    }
    return firebase.messaging().getToken()
  } catch (error) {
    return null
  }
}

// let messageListener
let notificationDisplayedListener
let notificationListener
let notificationOpenedListener

async function initListeners() {
  const channel = new firebase.notifications.Android.Channel(
    'main',
    'Main channel',
    firebase.notifications.Android.Importance.Max,
  ).setDescription('Main notification channel for Liquidity Network app')
  firebase.notifications().android.createChannel(channel)

  notificationDisplayedListener = firebase
    .notifications()
    .onNotificationDisplayed(notification => processNotification(notification))

  // when application is in foreground
  notificationListener = firebase.notifications().onNotification(() => {
    // processNotificationInForeground(notification)
  })

  notificationOpenedListener = firebase.notifications().onNotificationOpened(notificationOpen => {
    // console.log('onNotificationOpened', notificationOpen)
    processNotification(notificationOpen.notification)
  })
}

async function processNotificationOpenedApp(): Promise<boolean> {
  // when application is started as a result of tapping notification
  const closedAppOpenedByNotification = await firebase.notifications().getInitialNotification()
  if (closedAppOpenedByNotification) {
    const notification = closedAppOpenedByNotification.notification
    processNotification(notification)
    return true
  } else {
    return false
  }
}

async function processNotification(notification) {
  console.log('notification', notification.data)
  if (notification.data) {
    if (notification.data.type === INCOMING_TRANSACTION) {
      openTransactionsScreen()
    }
  }
}

function disposeListeners() {
  notificationDisplayedListener && notificationDisplayedListener()
  notificationListener && notificationListener()
  notificationOpenedListener && notificationOpenedListener()
}

export const notifications = {
  getToken,
  initListeners,
  processNotificationOpenedApp,
  disposeListeners,
}
