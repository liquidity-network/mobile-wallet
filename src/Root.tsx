import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { View, StatusBar } from 'react-native'
import NetInfo, { NetInfoState } from '@react-native-community/netinfo'
import SplashScreen from 'react-native-splash-screen'
import BigNumber from 'bignumber.js'

import Routes from 'routes/Routes'
import { registerSnack, Snack } from 'ui/Snack'
import { initTranslations } from 'services/translations'
import NoInternetIndicator from 'ui/NoInternetIndicator'
import { executeHeartBeat } from 'state/etc'
import { globalStyles } from 'globalStyles'
import { AppState } from 'state'
import { getCommitChainTokens, Token } from 'state/tokens'
import { getPublicKey } from 'state/auth'
import { getGasPrice } from 'state/config'
import { getCurrentHub, fetchHubsList, HubInfo } from 'state/hubs'
import { openHubSettingsScreen } from 'routes/navigationActions'
import BackgroundTimer from 'react-native-background-timer'
import NoConnectionScreen from 'screens/NoConnectionScreen'

interface State {
  isReady: boolean
  noInternetConnection: boolean
}

interface Props {
  tokens: Token[]
  publicKey: string
  gasPrice: BigNumber
  currentHub: HubInfo
}

class Root extends PureComponent<Props & { dispatch }, State> {
  state: State = { isReady: false, noInternetConnection: false }
  timer = null

  async componentWillMount() {
    this.handleConnectivityChange(await NetInfo.fetch())

    NetInfo.addEventListener(this.handleConnectivityChange)
    BackgroundTimer.runBackgroundTimer(() => {
      this.checkHubStatus()
    }, 5000)
    await initTranslations()

    this.props.dispatch(executeHeartBeat())

    this.setState({ isReady: true })

    SplashScreen.hide()
  }

  checkHubStatus = async () => {
    const netInfo = await NetInfo.fetch()
    try {
      if (netInfo.isInternetReachable) {
        this.props.dispatch(fetchHubsList())
        if (Object.keys(this.props.currentHub).length > 0 && !this.props.currentHub.active) {
          openHubSettingsScreen()
        }
      }
    } catch (e) {}
  }

  handleConnectivityChange = (state: NetInfoState) => {
    console.log('network status', state)
    if (state.isInternetReachable !== null)
      this.setState({ noInternetConnection: !state.isInternetReachable })
  }

  setSnack = ref => registerSnack(ref)

  render() {
    return this.state.isReady ? (
      this.state.noInternetConnection ? (
        <NoConnectionScreen />
      ) : (
        <View style={globalStyles.flexOne}>
          <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />
          <Routes />
          {this.state.noInternetConnection && <NoInternetIndicator />}
          <Snack ref={this.setSnack} />
        </View>
      )
    ) : null
  }
}

const mapStateToProps = (state: AppState): Props => ({
  tokens: getCommitChainTokens(state),
  publicKey: getPublicKey(state),
  gasPrice: new BigNumber(getGasPrice(state)),
  currentHub: getCurrentHub(state),
})

export default connect(mapStateToProps)(Root)
