import React, { PureComponent, createRef } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { NavigationEvents } from 'react-navigation'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Entypo from 'react-native-vector-icons/Entypo'
import I18n from 'i18n-js'

import Header from '../shared/Header'
import {
  ACTIVE_COLOR, BG_COLOR, deviceWidth, globalStyles, GREY, Grotesk, IcoMoon, isIos,
  mediumHitSlop, MUTED_COLOR, ORANGE, PRIMARY_COLOR, RED, SMALL_DEVICE, WHITE,
} from 'globalStyles' // prettier-ignore
import TextInput from 'ui/TextInput'
import Button from 'ui/Button'
import TouchableScale from 'ui/TouchableScale'
import Tooltip from 'ui/Tooltip'
import { openGasPricePopup } from '../../routes/navigationActions'

interface Props {
  fromIcon: string
  fromName: string
  fromBalance: string
  fromBalanceFiat: string
  openFromPicker: () => void
  openToPicker: () => void
  amount: string
  onAmountChange: (amount: string) => void
  toIcon: string
  toName: string
  toBalance: string
  toBalanceFiat: string
  maxFee: string
  maxFeeFiat: string
  time: string
  withdrawalLimit: string
  errorMessage: string
  isValid: boolean
  convert: () => void
  swapTokens: () => void
}

export default class ConversionScreenView extends PureComponent<Props> {
  fromTextInput = createRef<TextInput>()

  // Without setTimeout on Android soft keyboard is not being showed
  onFocus = () => setTimeout(this.fromTextInput.current.focus, 0)

  render() {
    const { fromIcon, fromBalance, toIcon, toBalance } = this.props
    return (
      <ScrollView contentContainerStyle={styles.container} scrollEnabled={false}>
        <NavigationEvents onDidFocus={this.onFocus} />

        <Header title={I18n.t('conversion')} noBackButton transparent />

        <View style={[styles.currencyContainer, styles.currencyContainerFirst]}>
          <View>
            <TouchableOpacity
              onPress={this.props.openFromPicker}
              activeOpacity={0.7}
              hitSlop={mediumHitSlop}
              style={globalStyles.inline}
            >
              {fromIcon != null && <IcoMoon name={fromIcon} style={styles.tokenIcon} />}

              <Text style={styles.currencyTitle}>{this.props.fromName}</Text>

              <Entypo name="chevron-thin-down" style={styles.iconDown} />
            </TouchableOpacity>

            <Text style={styles.balance}>
              {I18n.t('balance')}: <Text style={styles.balanceAmount}>{fromBalance}</Text>
              <Text style={styles.balanceFiat}> (${this.props.fromBalanceFiat})</Text>
            </Text>
          </View>

          <TextInput
            style={styles.inputContainer}
            inputStyle={styles.input}
            value={this.props.amount}
            onChangeText={this.props.onAmountChange}
            keyboardType="numeric"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="0"
            placeholderTextColor="#fff"
            testID="ConversionScreenAmountInput"
            ref={this.fromTextInput}
          />
        </View>

        <View style={styles.bottomBlock}>
          <View style={styles.middleBlock}>
            <TouchableScale style={styles.exchangeButton} onPress={this.props.swapTokens}>
              <IcoMoon name="sort" style={styles.exchangeIcon} />
            </TouchableScale>

            <View style={styles.exchangeRateContainer}>
              <Text style={styles.exchangeRate}>
                1 {this.props.fromName} = 1 {this.props.toName}
              </Text>
            </View>

            <TouchableScale style={styles.editGasButton} onPress={openGasPricePopup}>
              <Text style={styles.editGas}>{I18n.t('edit-gas')}</Text>
            </TouchableScale>
          </View>

          <View style={styles.currencyContainer}>
            <View>
              <TouchableOpacity
                onPress={this.props.openToPicker}
                activeOpacity={0.7}
                hitSlop={mediumHitSlop}
                style={globalStyles.inline}
              >
                {toIcon != null && (
                  <IcoMoon name={toIcon} style={[styles.tokenIcon, styles.colorPrimary]} />
                )}

                <Text style={[styles.currencyTitle, styles.colorPrimary]}>
                  {this.props.toName || '-'}
                </Text>

                <Entypo name="chevron-thin-down" style={styles.iconDown} />
              </TouchableOpacity>

              <Text style={[styles.balance, styles.colorPrimary]}>
                {I18n.t('balance')}:<Text style={styles.balanceAmount}> {toBalance}</Text>
                <Text style={styles.balanceFiat}> (${this.props.toBalanceFiat})</Text>
              </Text>
            </View>

            <TextInput
              style={styles.inputContainer}
              inputStyle={[styles.input, styles.colorPrimary]}
              value={this.props.amount}
              keyboardType="numeric"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={this.props.onAmountChange}
              placeholder="0"
              placeholderTextColor="#685c8a"
            />
          </View>

          <View style={styles.infoBlock}>
            <View style={globalStyles.inlineCentered}>
              <IcoMoon name="coin" style={styles.infoIcon} />

              <Text style={styles.infoText}>
                {I18n.t('max-fee')} =
                <Text style={styles.infoValue}>
                  {' '}
                  {this.props.maxFee} ETH (${this.props.maxFeeFiat})
                </Text>
              </Text>
            </View>

            <View style={globalStyles.inlineCentered}>
              <IcoMoon name="clock" style={styles.infoIcon} />

              <Text style={styles.infoText}>
                {I18n.t('time')} ≈ <Text style={styles.infoValue}>{this.props.time}</Text>
              </Text>
            </View>
          </View>

          {this.props.withdrawalLimit !== '' && (
            <View style={styles.limit}>
              <Text style={styles.limitText}>Withdrawal limit: {this.props.withdrawalLimit}</Text>

              <Tooltip text="Freshly received funds can't be withdrawn immediately, wait some time (72h max) and your withdrawal limit will match the balance." />
            </View>
          )}

          <Button
            style={styles.button}
            text={I18n.t('convert')}
            onPress={this.props.convert}
            disabled={!this.props.isValid}
            testID="ConversionScreenSubmitButton"
          />

          {this.props.errorMessage !== '' && (
            <Text style={styles.errorText}>{this.props.errorMessage}</Text>
          )}
        </View>
      </ScrollView>
    )
  }
}

const styles: any = {
  container: { flex: 1, backgroundColor: BG_COLOR },
  currencyContainer: {
    marginTop: SMALL_DEVICE ? -5 : -10,
    width: deviceWidth,
    height: SMALL_DEVICE ? 70 : 90,
    paddingLeft: deviceWidth * 0.06,
    paddingRight: deviceWidth * 0.03,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currencyContainerFirst: {
    marginTop: SMALL_DEVICE ? -25 : -15,
    marginBottom: SMALL_DEVICE ? 15 : 25,
  },
  inputContainer: {
    top: -8,
    width: deviceWidth * 0.44,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  input: { textAlign: 'right', fontSize: 21, color: WHITE },
  tokenIcon: { width: 24, fontSize: 24, color: MUTED_COLOR },
  currencyTitle: { fontFamily: Grotesk, fontSize: 22, color: WHITE },
  iconDown: { top: 4, left: 5, width: 26, fontSize: 13, color: ACTIVE_COLOR },
  balance: { marginTop: 4, fontFamily: Grotesk, fontSize: 11, color: WHITE },
  balanceAmount: { opacity: 0.5 },
  balanceFiat: { color: ORANGE },
  middleBlock: {
    top: -20,
    width: deviceWidth,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exchangeButton: {
    position: 'absolute',
    left: deviceWidth * 0.06,
    top: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ACTIVE_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exchangeIcon: { left: isIos ? 0.5 : undefined, fontSize: 16, color: WHITE },
  exchangeRateContainer: {
    height: 26,
    borderRadius: 13,
    backgroundColor: ACTIVE_COLOR,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  exchangeRate: { fontFamily: Grotesk, fontSize: 11, color: WHITE },
  editGasButton: {
    position: 'absolute',
    right: deviceWidth * 0.06,
    height: 26,
    borderRadius: 13,
    backgroundColor: MUTED_COLOR,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  editGas: { fontFamily: Grotesk, fontSize: 9, color: ACTIVE_COLOR },
  bottomBlock: { flex: 1, backgroundColor: WHITE },
  colorPrimary: { color: PRIMARY_COLOR },
  infoBlock: {
    marginTop: 4,
    paddingHorizontal: deviceWidth * 0.06,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoIcon: { width: 15, fontSize: 11, color: ACTIVE_COLOR },
  infoText: { fontFamily: Grotesk, fontSize: 11, color: GREY },
  infoValue: { color: ACTIVE_COLOR },
  limit: { marginTop: 16, alignSelf: 'center', flexDirection: 'row', alignItems: 'center' },
  limitText: { fontFamily: Grotesk, fontSize: 11, color: ACTIVE_COLOR },
  errorText: {
    marginTop: 12,
    alignSelf: 'center',
    paddingHorizontal: deviceWidth * 0.1,
    textAlign: 'center',
    fontFamily: Grotesk,
    fontSize: 12,
    color: RED,
  },
  button: { marginTop: 20, marginLeft: deviceWidth * 0.06, width: deviceWidth * 0.88 },
}
