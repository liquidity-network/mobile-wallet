import React, { PureComponent } from 'react'
import { View, Text, TouchableOpacity, Animated } from 'react-native'
import I18n from 'i18n-js'

import {
  deviceWidth, globalStyles, Grotesk, GroteskBold, isIos,
  SECONDARY_COLOR, IcoMoon, PRIMARY_COLOR, WHITE, PRIMARY_COLOR_LIGHT,
} from 'globalStyles' // prettier-ignore
import { amountToFiat, formatTokenBalance } from 'helpers/conversion'
import { Token } from 'state/tokens'
import {
  openConversionScreen, openReceiveMoneyPopup, openSendScreen,
} from 'routes/navigationActions' // prettier-ignore

interface Props {
  token: Token
  selected: boolean
  selectToken: (name: string) => void
}

interface State {
  isButtonsVisible: boolean
}

export default class HomeScreenToken extends PureComponent<Props, State> {
  state: State = { isButtonsVisible: true }

  heightValue = new Animated.Value(72)

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (prevProps.selected !== this.props.selected) {
      // A bit hackish solution to remove buttons from render tree only after animation completion
      Animated.spring(this.heightValue, {
        toValue: this.props.selected ? 140 : 72,
      }).start(() => prevProps.selected && this.setState({ isButtonsVisible: false }))

      if (this.props.selected) {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({ isButtonsVisible: true })
      }
    }
  }

  toggle = () => this.props.selectToken(this.props.token.tickerName)

  openReceiveScreen = () => openReceiveMoneyPopup({ token: this.props.token })

  openSendScreen = () => openSendScreen({ tokenTickerName: this.props.token.tickerName })

  openConversionScreen = () => openConversionScreen({ tokenFrom: this.props.token })

  render() {
    const { token } = this.props
    return (
      <Animated.View
        style={[
          styles.container,
          token.commitChain && styles.containerLiquid,
          { height: this.heightValue },
        ]}
      >
        <TouchableOpacity
          style={styles.infoContainer}
          activeOpacity={0.9}
          onPress={this.toggle}
          testID={'HomeScreenToken' + token.tickerName}
        >
          <View style={globalStyles.inlineCentered}>
            <View style={styles.iconContainer}>
              {token.icon != null && <IcoMoon name={token.icon} style={styles.icon} />}
            </View>

            <Text style={styles.title}>{token.tickerName}</Text>
          </View>

          <View>
            <Text style={styles.amount}>{formatTokenBalance(token)}</Text>

            <Text style={styles.amountDollars}>
              ${amountToFiat(token.balance, token.fiatPrice, token.decimals)}
            </Text>
          </View>
        </TouchableOpacity>

        {this.state.isButtonsVisible && (
          <View style={styles.buttons} testID={'HomeScreenTokenButtons' + token.tickerName}>
            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.7}
              onPress={this.openReceiveScreen}
            >
              <IcoMoon name="receive" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>{I18n.t('receive')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.7}
              onPress={this.openSendScreen}
            >
              <IcoMoon name="send" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>{I18n.t('send')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.7}
              onPress={this.openConversionScreen}
              testID="CurrencyScreenConversionButton"
            >
              <IcoMoon name="conversion" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>{I18n.t('convert')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    )
  }
}

const styles: any = {
  container: {
    marginBottom: 16,
    height: 72,
    paddingHorizontal: deviceWidth * 0.065,
    backgroundColor: `${PRIMARY_COLOR}99`,
    borderRadius: 4,
    overflow: 'hidden',
  },
  containerLiquid: { backgroundColor: `${PRIMARY_COLOR_LIGHT}99` },
  infoContainer: {
    width: '100%',
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
  },
  icon: { left: isIos ? 0.5 : undefined, fontSize: 20, color: SECONDARY_COLOR },
  title: { marginLeft: 12, fontFamily: Grotesk, fontSize: 18, color: WHITE },
  amount: {
    fontFamily: GroteskBold,
    textAlign: 'right',
    fontSize: 18,
    letterSpacing: 0.2,
    color: WHITE,
  },
  amountDollars: {
    fontFamily: Grotesk,
    textAlign: 'right',
    fontSize: 15,
    letterSpacing: 0.2,
    color: '#ffffff55',
  },
  buttons: {
    width: deviceWidth * 0.77,
    height: 72,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    width: '30%',
    height: 60,
    backgroundColor: 'transparent',
    borderColor: WHITE,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: { top: -1, fontSize: 36, color: WHITE },
  buttonText: {
    top: -3,
    fontFamily: Grotesk,
    fontSize: 14,
    color: WHITE,
  },
}
