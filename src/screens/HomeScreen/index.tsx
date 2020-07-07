import React, { PureComponent } from 'react'
import {
  View, Text, TouchableOpacity, TouchableWithoutFeedback, RefreshControl, PanResponder,
  LayoutAnimation, Animated,
} from 'react-native' // prettier-ignore
import { connect } from 'react-redux'
import { NavigationEvents } from 'react-navigation'
import Octicons from 'react-native-vector-icons/Octicons'
import I18n from 'i18n-js'
import BigNumber from 'bignumber.js'

import Background from 'ui/Background'
import HomeScreenToken from './HomeScreenToken'
import { homeScreenBg } from '../../../assets/images'
import {
  deviceWidth, globalStyles, GroteskBold, LayoutAnimationScaleConfig,
  WHITE, SECONDARY_COLOR, PRIMARY_COLOR, Grotesk, mediumHitSlop,
} from 'globalStyles' // prettier-ignore
import { AppState } from 'state'
import { fetchAllBalances, getActivatedTokens, Token } from 'state/tokens'
import { weiToEth, calculateFiatBalance } from 'helpers/conversion'
import { FaucetResult, fetchFaucet } from 'state/faucet'
import { openTransactionsScreen } from 'routes/navigationActions'
import AppStateHandler from './AppStateHandler'
import TopSection from './HomeScreenTopSection'
import { initHub } from 'state/hubs'
import { fetchHistory } from 'state/history'
import { checkMinimumRequiredVersion, executeHeartBeat } from 'state/etc'
import HubConnectionFailed from './HomeScreenHubConnectionFailed'
import { addMeToContacts } from 'state/contacts'
import { sendPushNotificationsToken } from 'state/notifications'
import { notifications } from 'services/notifications'
import { logEvent, AnalyticEvents } from 'services/analytics'
interface Props {
  tokens: Token[]
}

interface State {
  selectedToken: string
  isRefreshing: boolean
  isLootVisible: boolean
  isCommitChain: boolean
  faucetAmount: string
  refreshStarted: boolean
}

class HomeScreen extends PureComponent<Props & { dispatch }, State> {
  state: State = {
    selectedToken: '',
    isCommitChain: true,
    isRefreshing: false,
    refreshStarted: false,
    isLootVisible: false,
    faucetAmount: '',
  }

  panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (e, gestureState) => gestureState.dy > 3,
    onPanResponderGrant: () => {
      console.log('refresh started')
      this.setState({ refreshStarted: true })
    },
    onPanResponderRelease: () => {
      console.log('refresh ended')
      this.setState({ refreshStarted: false })
    },
    onPanResponderTerminate: () => {
      console.log('refresh terminated')
      this.setState({ refreshStarted: false })
    },
    // These are nosense but leave them as it is because of further possible issues
    onPanResponderTerminationRequest: () => true,
    onShouldBlockNativeResponder: () => {
      // Returns whether this component should block native components from becoming the JS
      // responder. Returns true by default. Is currently only supported on android.
      return true
    },
  })

  async componentDidMount() {
    try {
      await this.props.dispatch(initHub())
      notifications.initListeners()
      await Promise.all([
        this.props.dispatch(fetchHistory()),
        this.props.dispatch(sendPushNotificationsToken()),
        this.props.dispatch(addMeToContacts()),
      ])
      await this.onFocus()
      checkMinimumRequiredVersion()
    } catch (e) {}
  }

  componentWillUnmount() {
    notifications.disposeListeners()
  }

  onFocus = async () => {
    await this.props.dispatch(fetchAllBalances())
    await this.props.dispatch(executeHeartBeat())
  }

  onBlur = () => this.state.isLootVisible && this.setState({ isLootVisible: false })

  onRefresh = async () => {
    this.setState({ isRefreshing: true, refreshStarted: false })

    logEvent(AnalyticEvents.HOME_SCREEN_PULL_DOWN)

    try {
      await this.props.dispatch(fetchAllBalances())

      const faucet: FaucetResult = await this.props.dispatch(fetchFaucet())
      // const faucet = { amount: '100000000000000', tickerName: 'fLQD' }
      if (faucet) {
        this.grabFaucet(faucet)

        logEvent(AnalyticEvents.FETCH_DAILY_FAUCET)
      }
    } catch {}

    this.setState({ isRefreshing: false })
  }

  onBackgroundToForeground = () => this.props.dispatch(fetchHistory())

  grabFaucet(faucet: FaucetResult) {
    LayoutAnimation.configureNext(LayoutAnimationScaleConfig)
    this.setState({
      isLootVisible: true,
      faucetAmount: weiToEth(new BigNumber(faucet.amount), 18) + ' ' + faucet.tickerName,
    })
  }

  hideLoot = () => openTransactionsScreen()

  selectToken = (name: string) => {
    this.setState({ selectedToken: this.state.selectedToken === name ? '' : name })

    logEvent(AnalyticEvents.HOME_SCREEN_TOGGLE_TOKEN)
  }

  switch = () =>
    this.setState({ isCommitChain: !this.state.isCommitChain }, () =>
      Animated.spring(switchProgress, {
        toValue: this.state.isCommitChain ? 1 : 0,
        useNativeDriver: true,
      }).start(),
    )

  render() {
    let totalAssetsFiat = 0

    const tokens = [...this.props.tokens]
    tokens.reverse()
    tokens.forEach(token => (totalAssetsFiat += calculateFiatBalance(token)))
    const currencies = tokens
      .filter(t => (this.state.isCommitChain ? t.commitChain : !t.commitChain))
      .map(token => (
        <HomeScreenToken
          token={token}
          key={token.tickerName}
          selectToken={this.selectToken}
          selected={this.state.selectedToken === token.tickerName}
        />
      ))

    return (
      <View style={globalStyles.flexOne} testID="HomeScreen">
        <NavigationEvents onDidFocus={this.onFocus} onDidBlur={this.onBlur} />

        <AppStateHandler onBackgroundToForeground={this.onBackgroundToForeground} />

        <Background source={homeScreenBg} />

        <TopSection />

        <View style={globalStyles.flexOne}>
          {(this.state.isRefreshing || this.state.refreshStarted) && (
            <Animated.View style={styles.totalContainer}>
              <Text style={styles.totalTitle}>{I18n.t('total-assets')}</Text>
              <View>
                <Text style={styles.totalAmount}>
                  {totalAssetsFiat > 0 ? totalAssetsFiat.toFixed(2) : 0}
                </Text>
                <Text style={styles.totalDollarIcon}>$</Text>
              </View>

              <HubConnectionFailed />

              <TouchableWithoutFeedback
                hitSlop={mediumHitSlop}
                onPressIn={this.switch}
                testID="HomeScreenChainSwitch"
              >
                <View style={styles.switchBase}>
                  <Animated.View style={styles.switchButton}>
                    <View>
                      <Animated.Text style={styles.switchOn}>ON</Animated.Text>
                      <Animated.Text style={styles.switchCommit}>COMMIT</Animated.Text>
                    </View>
                    <Text style={styles.switchChain}>CHAIN</Text>
                  </Animated.View>
                </View>
              </TouchableWithoutFeedback>
            </Animated.View>
          )}
          <Animated.ScrollView
            contentContainerStyle={styles.wallets}
            refreshControl={
              <RefreshControl
                refreshing={this.state.isRefreshing}
                onRefresh={this.onRefresh}
                colors={[WHITE]}
                progressBackgroundColor={SECONDARY_COLOR}
                tintColor={WHITE}
              />
            }
            scrollEventThrottle={8}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollOffset } } }], {
              useNativeDriver: true,
            })}
            {...this.panResponder.panHandlers}
          >
            {this.state.isLootVisible && (
              <TouchableOpacity
                style={styles.lootContainer}
                activeOpacity={0.9}
                onPress={this.hideLoot}
              >
                <Octicons name="gift" style={styles.lootIcon} />

                <Text style={styles.lootText}>+{this.state.faucetAmount}</Text>
              </TouchableOpacity>
            )}

            {currencies}
          </Animated.ScrollView>
          {!this.state.isRefreshing && !this.state.refreshStarted && (
            <Animated.View style={styles.totalContainer}>
              <Text style={styles.totalTitle}>{I18n.t('total-assets')}</Text>
              <View>
                <Text style={styles.totalAmount}>
                  {totalAssetsFiat > 0 ? totalAssetsFiat.toFixed(2) : 0}
                </Text>
                <Text style={styles.totalDollarIcon}>$</Text>
              </View>

              <HubConnectionFailed />

              <TouchableWithoutFeedback
                hitSlop={mediumHitSlop}
                onPressIn={this.switch}
                testID="HomeScreenChainSwitch"
              >
                <View style={styles.switchBase}>
                  <Animated.View style={styles.switchButton}>
                    <View>
                      <Animated.Text style={styles.switchOn}>ON</Animated.Text>
                      <Animated.Text style={styles.switchCommit}>COMMIT</Animated.Text>
                    </View>
                    <Text style={styles.switchChain}>CHAIN</Text>
                  </Animated.View>
                </View>
              </TouchableWithoutFeedback>
            </Animated.View>
          )}
        </View>
      </View>
    )
  }
}

const mapStateToProps = (state: AppState): Props => ({ tokens: getActivatedTokens(state) })

export default connect(mapStateToProps)(HomeScreen)

const scrollOffset = new Animated.Value(0)

const totalTranslateY = scrollOffset.interpolate({
  inputRange: [0, 100],
  outputRange: [0, -50],
  extrapolate: 'clamp',
})

const totalOpacity = scrollOffset.interpolate({
  inputRange: [0, 100],
  outputRange: [1, 0],
  extrapolate: 'clamp',
})

const switchProgress = new Animated.Value(1)

const reverseOpacity = switchProgress.interpolate({
  inputRange: [0, 1],
  outputRange: [1, 0],
})

const switchTranslate = switchProgress.interpolate({
  inputRange: [0, 1],
  outputRange: [0, 32],
})

const onTranslate = switchProgress.interpolate({
  inputRange: [0, 1],
  outputRange: [0, 16],
})

const commitTranslate = switchProgress.interpolate({
  inputRange: [0, 1],
  outputRange: [-16, 0],
})

const styles: any = {
  totalContainer: {
    position: 'absolute',
    top: 4,
    alignSelf: 'center',
    alignItems: 'center',
    transform: [{ translateY: totalTranslateY }],
    opacity: totalOpacity,
  },
  totalTitle: {
    fontSize: 12,
    lineHeight: 13,
    letterSpacing: 3,
    color: '#685c8a',
  },
  totalAmount: {
    fontFamily: GroteskBold,
    fontSize: 50,
    letterSpacing: 1,
    color: WHITE,
  },
  totalDollarIcon: {
    position: 'absolute',
    left: -15,
    top: 6,
    fontFamily: GroteskBold,
    fontSize: 24,
    color: WHITE,
  },
  wallets: {
    paddingTop: 165,
    width: deviceWidth,
    paddingHorizontal: deviceWidth * 0.05,
    paddingBottom: 120,
  },
  lootContainer: {
    marginBottom: 20,
    width: 220,
    height: 66,
    alignSelf: 'center',
    borderRadius: 33,
    borderColor: WHITE,
    borderWidth: 1,
    backgroundColor: PRIMARY_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lootIcon: { fontSize: 28, color: WHITE },
  lootText: { marginLeft: 15, fontFamily: Grotesk, fontSize: 18, color: WHITE },
  switchBase: {
    marginTop: 20,
    backgroundColor: PRIMARY_COLOR,
    width: 60,
    height: 30,
    borderRadius: 15,
  },
  switchButton: {
    position: 'absolute',
    left: -10,
    top: -9,
    backgroundColor: WHITE,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: switchTranslate }],
  },
  switchOn: {
    position: 'absolute',
    top: -7,
    left: -23,
    width: 46,
    textAlign: 'center',
    fontFamily: GroteskBold,
    fontSize: 12,
    color: PRIMARY_COLOR,
    transform: [{ translateX: onTranslate }],
    opacity: reverseOpacity,
  },
  switchCommit: {
    position: 'absolute',
    top: -5,
    left: -23,
    width: 46,
    textAlign: 'center',
    fontFamily: GroteskBold,
    letterSpacing: -0.6,
    fontSize: 10,
    color: PRIMARY_COLOR,
    transform: [{ translateX: commitTranslate }],
    opacity: switchProgress,
  },
  switchChain: { top: 7, fontFamily: GroteskBold, fontSize: 11, color: PRIMARY_COLOR },
}
