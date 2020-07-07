import { FunctionComponent } from 'react'
import { Linking } from 'react-native'
import { connect } from 'react-redux'

import { AppState } from 'state'
import { getPublicKey, isToSAccepted } from 'state/auth'
import { isCriticalDataPresent } from 'state/etc'
import { handleDeepLinkUrl } from 'services/deepLinking'
import { notifications } from 'services/notifications'
import {
  openNoConnectionScreen, openHomeScreen, openWelcomeScreen, openTermsAcceptanceScreen, openLockScreen,
} from './navigationActions' // prettier-ignore

interface Props {
  pubKey: string
  isToSAccepted: boolean
  isCriticalDataPresent: boolean
}

Linking.addEventListener('url', data => handleDeepLinkUrl(data.url))

const RootResolver: FunctionComponent<Props> = ({
  pubKey,
  isToSAccepted,
  isCriticalDataPresent,
}) => {
  if (!isToSAccepted) {
    openTermsAcceptanceScreen()
  } else if (!isCriticalDataPresent) {
    openNoConnectionScreen()
  } else if (pubKey != null) {
    openLockScreen({ onComplete: openFirstScreen }, true)
  } else {
    openWelcomeScreen()
  }

  return null
}

const openFirstScreen = async () => {
  const result = await notifications.processNotificationOpenedApp()

  if (!result) openHomeScreen()
}

const mapStateToProps = (state: AppState): Props => ({
  pubKey: getPublicKey(state),
  isToSAccepted: isToSAccepted(state),
  isCriticalDataPresent: isCriticalDataPresent(state),
})

export default connect(mapStateToProps)(RootResolver)
