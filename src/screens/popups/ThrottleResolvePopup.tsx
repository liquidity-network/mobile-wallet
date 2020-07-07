import React, { createRef, PureComponent } from 'react'
import { connect } from 'react-redux'
import { NavigationEvents } from 'react-navigation'
import { WebView } from 'react-native-webview'
import { WebViewNavigation } from 'react-native-webview/lib/WebViewTypes'

import Popup from 'ui/Popup'
import { deviceHeight, WHITE } from 'globalStyles'
import navigation from 'services/navigation'
import { AppState } from 'state'
import { getCurrentHub } from 'state/hubs'
import { getPublicKey } from 'state/auth'
import { AnalyticEvents, logEvent } from 'services/analytics'

export interface ThrottleResolvePopupParams {
  onComplete: (result: 'fail' | 'success') => void
}

interface Props {
  apiUrl: string
  publicKey: string
}

class ThrottleResolvePopup extends PureComponent<Props> {
  params = navigation.getCurrentScreenParams<ThrottleResolvePopupParams>()

  isSucceed: boolean = false

  popup = createRef<Popup>()

  componentDidMount() {
    logEvent(AnalyticEvents.THROTTLE_OPENED)
  }

  onNavigationChange = (e: WebViewNavigation) => {
    if (e.url === this.props.apiUrl + 'whitelist/success.html') {
      this.isSucceed = true
      this.popup.current.close()

      logEvent(AnalyticEvents.THROTTLE_RESOLVED)
    } else if (e.url.startsWith(this.props.apiUrl + 'whitelist/failure.html')) {
      this.popup.current.close()

      logEvent(AnalyticEvents.THROTTLE_FAILED)
    }
  }

  onBlur = () => this.params.onComplete(this.isSucceed ? 'success' : 'fail')

  render() {
    return (
      <Popup containerStyle={styles.container} ref={this.popup}>
        <NavigationEvents onWillBlur={this.onBlur} />

        <WebView
          source={{ uri: this.props.apiUrl + 'whitelist/#address=' + this.props.publicKey }}
          onNavigationStateChange={this.onNavigationChange}
        />
      </Popup>
    )
  }
}

const mapStateToProps = (state: AppState): Props => ({
  apiUrl: getCurrentHub(state).api,
  publicKey: getPublicKey(state),
})

export default connect(mapStateToProps)(ThrottleResolvePopup)

const styles: any = {
  container: {
    position: 'absolute',
    top: deviceHeight * 0.05,
    bottom: deviceHeight * 0.05,
    left: 0,
    right: 0,
    backgroundColor: WHITE,
  },
}
