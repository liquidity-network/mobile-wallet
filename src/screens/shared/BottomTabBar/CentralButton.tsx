import React, { PureComponent } from 'react'
import {
  Animated, Text, TouchableOpacity, TouchableWithoutFeedback, StyleSheet,
} from 'react-native' // prettier-ignore
import { connect } from 'react-redux'
import { TapGestureHandler, State as GestureState } from 'react-native-gesture-handler'
import Feather from 'react-native-vector-icons/Feather'
import I18n from 'i18n-js'

import {
  BG_COLOR, deviceWidth, GroteskBold, isIos, isIphoneX, PRIMARY_COLOR, IcoMoon, LIGHT_ORANGE, WHITE
} from 'globalStyles' // prettier-ignore
import { AppState } from 'state'
import { getPublicKey } from 'state/auth'
import { openReceiveMoneyPopup, openSendScreen, openQRScanScreen } from 'routes/navigationActions'
import { fetchFaucet } from 'state/faucet'
import navigation from 'services/navigation'
import { getCurrentNetwork } from 'state/hubs'
import { showSnack, SnackType } from 'ui/Snack'
import { logEvent, AnalyticEvents } from 'services/analytics'

interface Props {
  address: string
  currentNetwork: number
}

interface State {
  isSelecting: boolean
}

class BottomTabBarCentralButton extends PureComponent<Props & { dispatch }, State> {
  buttons

  constructor(props) {
    super(props)

    this.buttons = [
      {
        title: I18n.t('receive'),
        icon: 'receive',
        callback: this.onReceive,
        animated: new Animated.Value(0),
        testID: 'BottomTabBarCentralButton_ReceiveButton',
      },
      {
        title: I18n.t('send'),
        icon: 'send',
        callback: this.onSend,
        animated: new Animated.Value(0),
        testID: 'BottomTabBarCentralButton_SendButton',
      },
      {
        title: I18n.t('scan-qr'),
        icon: 'scan-qr',
        callback: this.onScanQR,
        animated: new Animated.Value(0),
        testID: 'BottomTabBarCentralButton_ScanQRButton',
      },
    ]

    this.buttons
      .slice()
      .reverse()
      .forEach((button, i) => {
        button.buttonTranslate = button.animated.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -100 - i * 80],
        })

        button.textOpacity = button.animated.interpolate({
          inputRange: [0.2, 1],
          outputRange: [0, 1],
        })

        button.textTranslate = button.animated.interpolate({
          inputRange: [0.2, 1],
          outputRange: [-80, 0],
        })
      })
  }

  state = { isSelecting: false }

  feedbackProgress = new Animated.Value(0)

  centralButtonScale = this.feedbackProgress.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [1, 1.25, 1],
  })

  toggleProgress = new Animated.Value(0)

  centralButtonRotate = this.toggleProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '225deg'],
  })

  backdropOpacity = this.toggleProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.9],
  })

  toggle = () => {
    if (this.state.isSelecting) {
      Animated.timing(this.toggleProgress, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()

      this.buttons.forEach((button, i) =>
        Animated.timing(button.animated, {
          toValue: 0,
          duration: 200,
          delay: i * 30,
          useNativeDriver: true,
        }).start(() => i === this.buttons.length - 1 && this.setState({ isSelecting: false })),
      )
    } else {
      this.setState({ isSelecting: true })

      Animated.timing(this.toggleProgress, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()

      this.buttons
        .slice()
        .reverse()
        .forEach((button, i) =>
          Animated.spring(button.animated, {
            toValue: 1,
            delay: i * 30,
            useNativeDriver: true,
          } as any).start(),
        )

      logEvent(AnalyticEvents.OPEN_PLUS_MENU)
    }
  }

  onCentralButtonPress = event => {
    if (event.nativeEvent.state === GestureState.BEGAN) {
      Animated.timing(this.feedbackProgress, {
        duration: 300,
        toValue: 1,
        useNativeDriver: true,
      }).start(() => this.feedbackProgress.setValue(0))
    } else if (event.nativeEvent.state === GestureState.ACTIVE) {
      this.toggle()
    }
  }

  onScanQR = () => {
    this.toggle()

    openQRScanScreen({
      onComplete: async qrResult => {
        if (qrResult.type === 'faucet') {
          console.log(qrResult)

          if (this.props.currentNetwork !== 1) {
            showSnack({
              type: SnackType.FAIL,
              title: 'Wrong network',
              message: 'Please switch to main network to receive faucet',
            })
            navigation.goBack()
            return
          }

          try {
            await this.props.dispatch(fetchFaucet(qrResult.nonce.toString()))

            logEvent(AnalyticEvents.FETCH_QR_FAUCET)
          } catch (error) {
            showSnack({ type: SnackType.FAIL, message: error.message })
          } finally {
            navigation.goBack()
          }
        } else if (qrResult.type === 'address') {
          openSendScreen({ to: qrResult.publicKey })

          logEvent(AnalyticEvents.SCAN_QR_ADDRESS)
        } else if (qrResult.type === 'invoice') {
          openSendScreen({ invoice: qrResult })

          logEvent(AnalyticEvents.SCAN_QR_INVOICE)
        } else {
          navigation.goBack()
        }
      },
    })
  }

  onSend = () => {
    this.toggle()
    openSendScreen()
  }

  onReceive = () => {
    this.toggle()
    openReceiveMoneyPopup()
  }

  render() {
    return (
      <>
        {this.state.isSelecting && (
          <TouchableWithoutFeedback style={StyleSheet.absoluteFillObject} onPressIn={this.toggle}>
            <Animated.View style={[styles.backdrop, { opacity: this.backdropOpacity }]} />
          </TouchableWithoutFeedback>
        )}

        {this.state.isSelecting &&
          this.buttons.map(button => (
            <TouchableOpacity
              onPress={button.callback}
              style={[
                styles.container,
                styles.buttonsContainer,
                { transform: [{ translateY: button.buttonTranslate }] },
              ]}
              activeOpacity={0.9}
              key={button.title}
              testID={button.testID}
            >
              <Animated.View
                style={[
                  styles.buttonTextContainer,
                  {
                    opacity: button.textOpacity,
                    transform: [{ translateX: button.textTranslate }],
                  },
                ]}
              >
                <Text style={styles.buttonText}>{button.title}</Text>
              </Animated.View>

              <Animated.View style={[styles.button, styles.buttonBg, { opacity: button.animated }]}>
                <IcoMoon name={button.icon} style={styles.buttonIcon} />
              </Animated.View>
            </TouchableOpacity>
          ))}

        <TapGestureHandler onHandlerStateChange={this.onCentralButtonPress}>
          <Animated.View
            style={[
              styles.container,
              styles.button,
              {
                transform: [
                  { rotate: this.centralButtonRotate },
                  { scale: this.centralButtonScale },
                ],
              },
            ]}
          >
            <Feather name="plus" style={styles.plus} />
          </Animated.View>
        </TapGestureHandler>
      </>
    )
  }
}

const mapStateToProps = (state: AppState): Props => ({
  address: getPublicKey(state),
  currentNetwork: getCurrentNetwork(state),
})

export default connect(mapStateToProps)(BottomTabBarCentralButton)

const styles: any = {
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BG_COLOR,
    opacity: 0,
  },
  container: {
    position: 'absolute',
    bottom: isIphoneX ? 27 : 17,
    left: deviceWidth / 2 - 26,
  },
  buttonsContainer: { width: deviceWidth / 2 },
  button: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LIGHT_ORANGE,
  },
  buttonBg: { backgroundColor: PRIMARY_COLOR },
  buttonIcon: { left: isIos ? 0.5 : undefined, fontSize: 36, color: '#fff' },
  buttonTextContainer: { position: 'absolute', left: 65, top: 13, width: 150 },
  buttonText: {
    fontFamily: GroteskBold,
    fontSize: 20,
    color: WHITE,
    backgroundColor: '#00000000',
  },
  plus: { fontSize: 32, color: WHITE },
}
