import React, { createRef, PureComponent } from 'react'
import BigNumber from 'bignumber.js'
import { connect } from 'react-redux'
import I18n from 'i18n-js'

import SendScreenView from './SendScreenView'
import navigation from 'services/navigation'
import {
  convertCurrency, weiToEth, amountToFiat, roundStripZeros
} from 'helpers/conversion' // prettier-ignore
import { QRResult } from '../QRScannerScreen'
import { AppState } from 'state'
import { getGasPrice } from 'state/config'
import { getTransferMaxFee, normaliseComma } from 'helpers/general'
import {
  transferOnChain, transferCommitChain, getActivatedTokens, getETHFiatPrice, Token,
} from 'state/tokens' // prettier-ignore
import { showSnack, SnackType } from 'ui/Snack'
import { isCorrectETHAddress, validateCurrency } from 'helpers/validations'
import { ErrorMessages, getErrorMessage } from 'services/errorMessages'
import { COMMIT_CHAIN_NAME_PREFIX, CurrencyType } from 'helpers/static'
import { getCurrentHub, HubInfo } from 'state/hubs'
import { logEvent, AnalyticEvents } from 'services/analytics'

export interface SendScreenParams {
  tokenTickerName?: string
  to?: string
  invoice?: QRResult
}

interface Props {
  currentHub: HubInfo
  tokens: Token[]
  ETHFiatPrice: number
  gasPrice: string
}

interface State {
  token: Token | null
  carouselIndex: number
  toAddress: string
  amount: string
  invoiceNonce: number | undefined
  currency: CurrencyType
  isValid: boolean
  errorMessage: string
}

class SendScreen extends PureComponent<Props & { dispatch }, State> {
  params = navigation.getCurrentScreenParams<SendScreenParams>()

  state: State = {
    token: this.params.tokenTickerName
      ? this.props.tokens.find(t => t.tickerName === this.params.tokenTickerName)
      : this.props.tokens.length > 0
      ? this.props.tokens[0]
      : null,
    carouselIndex: this.params.tokenTickerName
      ? this.props.tokens.findIndex(t => t.tickerName === this.params.tokenTickerName)
      : 0,
    toAddress: this.params.to || '',
    amount: '',
    invoiceNonce: undefined,
    currency: CurrencyType.ERC20,
    isValid: false,
    errorMessage: '',
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount() {
    if (this.params.invoice) {
      this.fillInvoiceData(this.params.invoice)
    }
  }

  viewRef = createRef<SendScreenView>()

  onQRScanned = (result: QRResult) => {
    if (result.type === 'address') {
      this.updateToAddress(result.publicKey)
    } else if (result.type === 'invoice') {
      this.fillInvoiceData(result)
    }
  }

  fillInvoiceData(data: QRResult) {
    const { tokens, currentHub } = this.props

    if (data.network !== currentHub.network) {
      return showSnack({
        type: SnackType.FAIL,
        message: 'Invoice network id is different from current one',
      })
    }

    if (data.contractAddress != null && data.contractAddress !== currentHub.contract) {
      return showSnack({
        type: SnackType.FAIL,
        message: 'Invoice operator is different from current one',
      })
    }

    const carouselIndex = tokens.findIndex(
      t => t.address === data.tokenAddress && t.commitChain === (data.contractAddress != null),
    )

    if (carouselIndex !== -1) {
      const token = tokens[carouselIndex]
      const inWei =
        token.tickerName.indexOf('ETH') > -1 &&
        data.amount &&
        data.amount.isLessThanOrEqualTo(new BigNumber('10000000000'))

      this.setState(
        {
          token,
          toAddress: data.publicKey,
          invoiceNonce: data.nonce,
          currency: inWei ? CurrencyType.WEI : CurrencyType.ERC20,
          carouselIndex,
        },
        () =>
          data.amount &&
          this.updateAmount(
            inWei ? data.amount.toString() : weiToEth(data.amount, token.decimals, 18),
          ),
      )
    } else {
      showSnack({
        type: SnackType.FAIL,
        title: I18n.t('alert'),
        message: I18n.t('currency-inside-payment-not-exist'),
      })
    }
  }

  updateToken = (index: number) =>
    this.setState({ token: this.props.tokens[index], carouselIndex: index }, () => {
      console.log('updateToken', this.state.currency, this.state.token.tickerName)
      if (
        this.state.currency === CurrencyType.WEI &&
        this.state.token.tickerName !== 'ETH' &&
        this.state.token.tickerName !== COMMIT_CHAIN_NAME_PREFIX + 'ETH'
      ) {
        this.updateCurrency(CurrencyType.ERC20)
      } else {
        this.updateAmount(this.state.amount)
      }
    })

  updateToAddress = (toAddress: string) => this.setState({ toAddress }, this.validate)

  updateAmount = (amount: string) => this.setState({ amount }, this.validate)

  validate = () => {
    const { toAddress, amount, currency } = this.state

    if (toAddress === '' || amount === '') {
      this.setState({ isValid: false, errorMessage: '' })
      return
    }

    if (!isCorrectETHAddress(toAddress)) {
      this.setState({ isValid: false, errorMessage: I18n.t('address-not-valid') })
      return
    }

    if (!validateCurrency(amount, currency)) {
      this.setState({ isValid: false, errorMessage: I18n.t('amount-not-valid') })
      return
    }

    if (!this.hasEnoughFunds()) {
      this.setState({ isValid: false, errorMessage: I18n.t('not-enough-funds') })
      return
    }

    this.setState({ isValid: true, errorMessage: '' })
  }

  get currentAmountInWei() {
    return convertCurrency(
      normaliseComma(this.state.amount),
      this.state.currency,
      CurrencyType.WEI,
      this.state.token,
    )
  }

  updateCurrency = (currency: CurrencyType) => {
    let newAmount = this.state.amount
    if (this.state.currency !== currency && this.state.amount !== '' && this.state.amount !== '0') {
      newAmount = roundStripZeros(
        convertCurrency(this.state.amount, this.state.currency, currency, this.state.token),
        this.state.token.decimals,
      )
    }
    this.setState({ currency }, () => this.updateAmount(newAmount))
  }

  hasEnoughFunds = () =>
    this.state.token && this.state.token.balance.isGreaterThanOrEqualTo(this.currentAmountInWei)

  send = async () => {
    if (!this.state.isValid) return

    try {
      showSnack({
        type: SnackType.WAITING,
        title: 'Processing transaction',
        message: I18n.t('be-patient'),
        duration: 60000,
      })

      const { toAddress, token } = this.state

      this.setState({ isValid: false })

      if (this.state.token && this.state.token.commitChain) {
        await this.props.dispatch(
          transferCommitChain(
            toAddress,
            this.currentAmountInWei,
            token.address,
            this.state.invoiceNonce ? new BigNumber(this.state.invoiceNonce) : undefined,
          ),
        )

        logEvent(AnalyticEvents.TRANSFER_COMMITCHAIN)
      } else {
        await this.props.dispatch(
          transferOnChain(toAddress, this.currentAmountInWei, token.address),
        )

        logEvent(AnalyticEvents.TRANSFER_ONCHAIN)
      }

      navigation.goBack()

      requestAnimationFrame(() =>
        showSnack({ type: SnackType.SUCCESS, title: I18n.t('transaction-sent') }),
      )
    } catch (error) {
      let message: string = null
      // TODO Dirty hack! Fix when we'll have error code received from nocust-client
      if (error.message.indexOf('is not registered with') !== -1) {
        message = getErrorMessage(ErrorMessages.SEND_RECIPIENT_NOT_REGISTERED)
      }

      showSnack({ type: SnackType.FAIL, title: I18n.t('transaction-failed'), message })
    } finally {
      this.setState({ isValid: true })
    }
  }

  render() {
    return (
      <SendScreenView
        ref={this.viewRef}
        carouselIndex={this.state.carouselIndex}
        tokens={this.props.tokens}
        token={this.state.token}
        toAddress={this.state.toAddress}
        amount={this.state.amount}
        currency={this.state.currency}
        maxFee={weiToEth(getTransferMaxFee(this.props.gasPrice), 18, 4)}
        maxFeeUSD={amountToFiat(
          getTransferMaxFee(this.props.gasPrice),
          this.props.ETHFiatPrice,
          18,
        )}
        errorMessage={this.state.errorMessage}
        isValid={this.state.isValid}
        updateToken={this.updateToken}
        updateToAddress={this.updateToAddress}
        updateAmount={this.updateAmount}
        updateCurrency={this.updateCurrency}
        send={this.send}
        onQRScanned={this.onQRScanned}
        transfersRestricted={this.props.currentHub.transfers === false}
      />
    )
  }
}

const mapStateToProps = (state: AppState): Props => ({
  currentHub: getCurrentHub(state),
  tokens: getActivatedTokens(state),
  ETHFiatPrice: getETHFiatPrice(state),
  gasPrice: getGasPrice(state),
})

export default connect(mapStateToProps)(SendScreen)
