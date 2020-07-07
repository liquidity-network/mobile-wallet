import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { View, StyleSheet, Keyboard, Animated, Platform } from 'react-native'

import I18n from 'i18n-js'

import BottomTabBarCentralButton from './CentralButton'
import BottomTabBarItem from './Item'
import { BG_COLOR, deviceWidth, SMALL_DEVICE } from 'globalStyles'
import navigation from 'services/navigation'
import { AppState } from 'state'
import { getUnseenTransactionsCount } from 'state/bottomBar'
import { BOTTOM_TOOLBAR_HEIGHT } from './constants'
import {
  openConversionScreen,
  openSettingsScreen,
  openHomeScreen,
  openTransactionsScreen,
} from 'routes/navigationActions'
var ExtraDimensions
if (Platform.OS === "android")
{
  ExtraDimensions = require('react-native-extra-dimensions-android')
} // prettier-ignore

interface Props {
  unseenTransactions: number
}

interface States {
  initialPosition: Animated.Value
}

class BottomTabBar extends PureComponent<Props, States> {
  keyboardShowListener: any
  keyboardHideListener: any
  constructor(props) {
    super(props)
    this.state = {
      initialPosition: new Animated.Value(0),
    }
  }

  componentDidMount() {
    this.keyboardShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardShow)
    this.keyboardHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardHide)
  }

  componentWillUnmount() {
    this.keyboardShowListener.remove()
    this.keyboardHideListener.remove()
  }

  _keyboardHide = () => {
    Animated.timing(this.state.initialPosition, {
      toValue: 0,
      duration: 200,
    }).start()
  }

  _keyboardShow = e => {
    let softMenuBarHeight = 0
    if (Platform.OS === 'android') softMenuBarHeight = ExtraDimensions.getSoftMenuBarHeight()
    Animated.timing(this.state.initialPosition, {
      toValue: e.endCoordinates.height + softMenuBarHeight,
      duration: 200,
    }).start()
  }

  openConversionScreen = () => openConversionScreen()

  render() {
    const { initialPosition } = this.state
    const currentScreen = navigation.getCurrentScreen()
    const isHomeScreen = currentScreen === 'HomeScreen' || currentScreen === 'LockMainScreen'
    return (
      <Animated.View
        style={[StyleSheet.absoluteFillObject, { marginBottom: initialPosition }]}
        pointerEvents="box-none"
      >
        <View style={styles.bar}>
          <View style={[styles.halfBar, styles.halfBarLeft]}>
            <BottomTabBarItem
              icon="home"
              title={I18n.t('menu-home')}
              active={isHomeScreen}
              onPress={openHomeScreen}
              testID="BottomTabBarHomeButton"
            />

            <BottomTabBarItem
              icon="list"
              title={I18n.t('menu-transactions')}
              active={currentScreen === 'TransactionsScreen'}
              onPress={openTransactionsScreen}
              unseenTransactions={this.props.unseenTransactions}
              testID="BottomTabBarTransactionsButton"
            />
          </View>

          <View style={[styles.halfBar, styles.halfBarRight]}>
            <BottomTabBarItem
              icon="conversion"
              title={I18n.t('menu-conversion')}
              active={currentScreen === 'ConversionScreen'}
              onPress={this.openConversionScreen}
              testID="BottomTabBarConversionButton"
            />

            <BottomTabBarItem
              icon="settings"
              title={I18n.t('menu-settings')}
              active={currentScreen === 'SettingsScreen'}
              onPress={openSettingsScreen}
              testID="BottomTabBarSettingsButton"
            />
          </View>
        </View>

        <BottomTabBarCentralButton />
      </Animated.View>
    )
  }
}

const mapStateToProps = (state: AppState): Props => ({
  unseenTransactions: getUnseenTransactionsCount(state),
})

export default connect(mapStateToProps)(BottomTabBar)

const styles: any = {
  bar: {
    position: 'absolute',
    bottom: 0,
    width: deviceWidth,
    height: BOTTOM_TOOLBAR_HEIGHT,
    backgroundColor: BG_COLOR,
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  halfBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SMALL_DEVICE ? deviceWidth * 0.09 : deviceWidth * 0.1,
  },
  halfBarLeft: {
    paddingLeft: SMALL_DEVICE ? deviceWidth * 0.072 : deviceWidth * 0.08,
  },
  halfBarRight: {
    paddingRight: SMALL_DEVICE ? deviceWidth * 0.072 : deviceWidth * 0.08,
  },
}
