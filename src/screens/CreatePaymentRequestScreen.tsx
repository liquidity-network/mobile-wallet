import React, { PureComponent } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { connect } from 'react-redux'
import qrCode from 'yaqrcode'
import I18n from 'i18n-js'

import Header from './shared/Header'
import navigation from 'services/navigation'
import { getETHFiatPrice, Token } from 'state/tokens'
import {
  ALMOST_BLACK, deviceWidth, globalStyles, mediumHitSlop, RED, WHITE,
} from 'globalStyles' // prettier-ignore
import TextInput from 'ui/TextInput'
import { convertCurrency } from 'helpers/conversion'
import { normaliseComma } from 'helpers/general'
import { openPickerPopup } from 'routes/navigationActions'
import Button from 'ui/Button'
import { createInvoice } from 'state/invoice'
import { AppState } from 'state'
import { validateCurrency } from 'helpers/validations'
import { CurrencyType } from 'helpers/static'
import { logEvent, AnalyticEvents } from 'services/analytics'

export interface CreatePaymentRequestScreenParams {
  token: Token
}

interface Props {
  ETHFiatPrice: number
}

interface State {
  amount: string
  currency: CurrencyType
  isValid: boolean
  errorMessage: string
  invoice: string
}

class CreatePaymentRequestScreen extends PureComponent<Props & { dispatch }, State> {
  params = navigation.getCurrentScreenParams<CreatePaymentRequestScreenParams>()

  state: State = {
    amount: '',
    isValid: null,
    errorMessage: '',
    currency: CurrencyType.ERC20,
    invoice: '',
  }

  updateAmount = (amount: string) => this.setState({ amount }, this.validate)

  setCurrency = (currency: CurrencyType) => {
    let amount = this.state.amount
    if (this.state.currency !== currency && this.state.amount !== '' && this.state.amount !== '0') {
      amount = convertCurrency(
        this.state.amount,
        this.state.currency,
        currency,
        this.params.token,
      ).toString()
    }
    this.setState({ currency, amount }, this.validate)
  }

  validate = () => {
    if (!validateCurrency(this.state.amount, this.state.currency)) {
      this.setState({ isValid: false, errorMessage: I18n.t('amount-not-valid') })
    } else {
      this.setState({ isValid: true, errorMessage: '' })
    }
  }

  openCurrencyPicker = () =>
    openPickerPopup({
      data: Object.values(CurrencyType).map(currencyType => ({
        id: currencyType,
        value: this.getCurrencyText(currencyType),
      })),
      initialId: this.state.currency,
      onSubmit: this.setCurrency,
    })

  getCurrencyText = (type: CurrencyType): string => {
    if (type === CurrencyType.FIAT) return 'USD'
    if (type === CurrencyType.WEI) return 'WEI'
    if (type === CurrencyType.ERC20) return this.params.token.tickerName
  }

  confirm = () =>
    requestAnimationFrame(() => {
      const invoice = this.props.dispatch(
        createInvoice(
          convertCurrency(
            normaliseComma(this.state.amount),
            this.state.currency,
            CurrencyType.WEI,
            this.params.token,
          ).toNumber(),
          this.params.token.address,
        ),
      )

      this.setState({ invoice })

      logEvent(AnalyticEvents.CREATE_PAYMENT_REQUEST)
    })

  render() {
    return (
      <View>
        <Header title={I18n.t('create-payment-request')} />

        {this.state.invoice !== '' ? (
          <View style={styles.bodyQR}>
            <Image source={{ uri: qrCode(this.state.invoice) }} style={styles.qrcode} />

            <Text style={styles.title}>{I18n.t('scan-this-code')}</Text>

            <Button onPress={navigation.goBack} style={styles.button} text={I18n.t('close')} />
          </View>
        ) : (
          <View style={styles.body}>
            <Text style={globalStyles.P} testID="CreatePaymentRequestScreenAmountText">
              {I18n.t('amount')}
            </Text>

            <TextInput
              testID="CreatePaymentRequestScreenAmountTextInput"
              style={styles.input}
              placeholder="0"
              keyboardType="numeric"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={this.updateAmount}
              value={this.state.amount}
              right={
                <TouchableOpacity
                  style={styles.currencyButton}
                  onPress={this.openCurrencyPicker}
                  hitSlop={mediumHitSlop}
                  activeOpacity={0.7}
                >
                  <Text style={styles.currencyText}>
                    {this.getCurrencyText(this.state.currency)}
                  </Text>
                </TouchableOpacity>
              }
            />

            <Button
              onPress={this.confirm}
              style={styles.button}
              text={I18n.t('confirm')}
              disabled={!this.state.isValid}
            />

            {this.state.errorMessage !== '' && (
              <Text style={styles.errorMessage}>{this.state.errorMessage}</Text>
            )}
          </View>
        )}
      </View>
    )
  }
}

const mapStateToProps = (state: AppState): Props => ({
  ETHFiatPrice: getETHFiatPrice(state),
})

export default connect(mapStateToProps)(CreatePaymentRequestScreen)

const styles: any = {
  body: { marginTop: 20, width: deviceWidth, paddingHorizontal: 16 },
  bodyQR: { marginTop: 40, width: deviceWidth, paddingHorizontal: 16 },
  qrcode: { width: 250, height: 250, alignSelf: 'center' },
  input: { marginTop: 6 },
  currencyButton: {
    marginRight: 8,
    width: 50,
    height: 32,
    borderRadius: 4,
    backgroundColor: ALMOST_BLACK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyText: { ...globalStyles.P, color: WHITE },
  button: { marginTop: 20 },
  title: { marginTop: 25, ...globalStyles.P, textAlign: 'center' },
  errorMessage: {
    marginTop: 25,
    paddingHorizontal: deviceWidth * 0.06,
    textAlign: 'center',
    ...globalStyles.P_SMALL,
    color: RED,
  },
}
