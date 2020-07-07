// *** ConversionScreen Specs ***
// This screen allows the user to convert/exchange his assets. In a first version this
// allows to convert only Liquid assets to its non Liquid asset (ETH <> L.ETH) and vice versa at
// a 1:1 ratio.
// - The screen has 2 lines for the conversion. The conversion always goes from the currency on
// the first line to the currency showed on the second. An arrow indicate the direction in between
// - The first line should provide a selector to chose the currency to convert from. And the user
// should specify the amount in the input field in the first line
// - The currency on the second line is auto-filled with the corresponding currency to the first
// line (no selector). The input is non-editable and mirror the value of the input field of the first
// line.
// - Confirmations:
//   1) Deposits (onChain -> offchain):
//      - Ensure sufficient funds for the specified token, display error (i) if not.
//      - Ensure sufficient Ether to pay for gas fee:
//        gasPrice * gasLimit - (isDepositingEther ? depositAmount : 0) > tokenBalance,
//        display error if not.
//      - Call the deposit thunk.
//   2) Withdrawals (offChain -> onChain):
//      - Ensure sufficient funds display error ("Insufficient funds") if not.
//      - Ensure sufficient Ether to pay for gas fee:
//        2 * gasPrice * gasLimit + operatorFee - (isWithdrawingEther ? withdrawAmount : 0) > tokenBalance
//        display error ("Not enough Ether to pay for gas fees") if not. operatorFee can be fetch with
//        getWithdrawalFee function of the nocust manager.
//      - Ensure that we are above the withdrawal limit and display error ("Your current limit for the conversion is
//        {value from async func}. Chose a smaller amount or wait longer.") if not. Do:
//        (await lqdManager.lqdManager.getWithdrawalLimit(pubKey, tokenAddress)) >= tokenBalance
//      - Call the withdrawal thunk
import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { NavigationEvents } from 'react-navigation'
import BigNumber from 'bignumber.js/bignumber'
import I18n from 'i18n-js'
import { nocust } from 'nocust-client'

import navigation from 'services/navigation'
import ConversionScreenView from './ConversionScreenView'
import NoActiveCoin from './NoActiveCoin'
import {
  getActivatedTokens, getComplimentaryToken, getETHFiatPrice, Token, getETHToken,
} from 'state/tokens' // prettier-ignore
import { AppState } from 'state'
import { getGasPrice, getWithdrawalFee } from 'state/config'
import { ethToWei, weiToEth, amountToFiat } from 'helpers/conversion'
import { validateCurrency } from 'helpers/validations'
import { deposit, requestWithdrawal } from 'state/tokens/onChain'
import { getPublicKey } from 'state/auth'
import { showSnack, SnackType } from 'ui/Snack'
import { getTransferMaxFee, normaliseComma } from 'helpers/general'
import {
  openConversionScreen, openHomeScreen, openPickerPopup,
} from 'routes/navigationActions' // prettier-ignore
import { CurrencyType } from 'helpers/static'
import { logEvent, AnalyticEvents } from 'services/analytics'

export interface ConversionScreenParams {
  tokenFrom?: Token
}

interface Props {
  tokens: Token[]
  ETHFiatPrice: number
  publicKey: string
  gasPrice: string
  withdrawalFee: number
  ethToken: Token
}

interface State {
  tokenFrom: Token
  tokenTo: Token
  amount: string
  errorMessage: string
  isOnToCommitChain: boolean
  isValid: boolean
  operatorFee: number
  withdrawalLimit: BigNumber
}

class ConversionScreen extends PureComponent<Props & { dispatch }, State> {
  state: State = {
    tokenFrom: null,
    tokenTo: null,
    amount: '',
    errorMessage: '',
    isOnToCommitChain: true,
    isValid: false,
    operatorFee: 0,
    withdrawalLimit: new BigNumber(0),
  }

  onFocus = () => {
    const params = navigation.getCurrentScreenParams<ConversionScreenParams>()

    const notEmptyTokens = this.props.tokens.length > 0
    let tokenFrom = notEmptyTokens ? this.props.tokens[0] : null
    if (params.tokenFrom) tokenFrom = params.tokenFrom

    this.setState(
      {
        tokenFrom,
        tokenTo: notEmptyTokens ? getComplimentaryToken(tokenFrom, this.props.tokens) : null,
        isOnToCommitChain: notEmptyTokens ? !tokenFrom.commitChain : null,
      },
      async () => {
        if (this.state.tokenFrom) {
          await this.fetchWithdrawalLimit()
          this.validate()
        }
      },
    )
  }

  fetchWithdrawalLimit = async () => {
    try {
      const withdrawalLimit = await nocust.getWithdrawalLimit(
        this.props.publicKey,
        this.state.tokenFrom.address,
      )
      this.setState({ withdrawalLimit })
      const walletInfo = await nocust.getWallet(this.props.publicKey, this.state.tokenFrom.address)
      console.log('walletinfo', walletInfo)
    } catch (e) {
      console.log(e)
    }
  }

  calculateFee = () =>
    getTransferMaxFee(this.props.gasPrice)
      .times(this.state.isOnToCommitChain ? 1 : 2)
      .plus(this.state.isOnToCommitChain ? 0 : this.props.withdrawalFee)

  calculateFeeUSD = () => amountToFiat(this.calculateFee(), this.props.ETHFiatPrice, 18)

  calculateTime = () =>
    this.state.isOnToCommitChain ? '15 ' + I18n.t('min') : '36 - 72 ' + I18n.t('hrs')

  validate = () => {
    const { amount, tokenFrom, isOnToCommitChain, withdrawalLimit } = this.state
    const { ethToken } = this.props
    console.log('ethToken', ethToken)
    if (!ethToken) return

    if (amount === '') {
      this.setState({ isValid: false, errorMessage: '' })
      return
    }

    if (!validateCurrency(amount, CurrencyType.ERC20)) {
      this.setState({ isValid: false, errorMessage: I18n.t('amount-not-valid') })
      return
    }

    const amountInWei = ethToWei(normaliseComma(amount), this.state.tokenFrom.decimals)
    if (tokenFrom.balance.isLessThan(amountInWei)) {
      this.setState({
        isValid: false,
        errorMessage: I18n.t('not-enough-funds'),
      })
      return
    }

    if (!isOnToCommitChain && withdrawalLimit.isLessThan(amountInWei)) {
      this.setState({ isValid: false, errorMessage: I18n.t('conversion-limit-exceeded') })
      return
    }

    const fee = this.calculateFee()
    if (ethToken.balance.isLessThan(fee.plus(tokenFrom.tickerName === 'ETH' ? amountInWei : 0))) {
      this.setState({ isValid: false, errorMessage: I18n.t('not-enough-eth-gas-fee') })
      return
    }

    this.setState({ isValid: true, errorMessage: '' })
  }

  convert = async () => {
    try {
      showSnack({ type: SnackType.WAITING, title: 'Processing transaction', duration: 60000 })

      const { amount, tokenFrom, isOnToCommitChain } = this.state
      if (isOnToCommitChain) {
        await this.props.dispatch(
          deposit(
            ethToWei(normaliseComma(amount), tokenFrom.decimals),
            tokenFrom.address,
            tokenFrom.tickerName,
          ),
        )

        logEvent(AnalyticEvents.DEPOSIT)
      } else {
        await this.props.dispatch(
          requestWithdrawal(
            ethToWei(normaliseComma(amount), tokenFrom.decimals),
            tokenFrom.address,
          ),
        )

        logEvent(AnalyticEvents.WITHDRAWAL)
      }

      openHomeScreen()

      requestAnimationFrame(() =>
        showSnack({ type: SnackType.SUCCESS, title: I18n.t('transaction-sent') }),
      )

      this.setState({ amount: '' })
    } catch (error) {
      showSnack({ type: SnackType.FAIL, title: I18n.t('transaction-failed') })
    }
  }

  selectTokenFrom = (tickerName: string) => {
    const tokenFrom = this.props.tokens.find(t => t.tickerName === tickerName)
    openConversionScreen({ tokenFrom })
  }

  selectTokenTo = (tickerName: string) => {
    const tokenTo = this.props.tokens.find(t => t.tickerName === tickerName)
    const tokenFrom = getComplimentaryToken(tokenTo, this.props.tokens)
    openConversionScreen({ tokenFrom })
  }

  createOpenPicker = (tokenTo?: boolean) => () =>
    this.props.tokens.length > 0 &&
    openPickerPopup({
      data: this.props.tokens.map(t => ({ id: t.tickerName, value: t.tickerName })),
      initialId: tokenTo ? this.state.tokenTo.tickerName : this.state.tokenFrom.tickerName,
      onSubmit: tokenTo ? this.selectTokenTo : this.selectTokenFrom,
    })

  openFromPicker = this.createOpenPicker()

  openToPicker = this.createOpenPicker(true)

  swapTokens = () => {
    openConversionScreen({ tokenFrom: this.state.tokenTo })
    requestAnimationFrame(this.onFocus)
  }

  onAmountChange = (amount: string) => this.setState({ amount }, this.validate)

  render() {
    const { tokenFrom, tokenTo, amount, withdrawalLimit, isOnToCommitChain } = this.state
    const { tokens } = this.props
    if (tokens.length <= 0) return <NoActiveCoin />
    return (
      <>
        <NavigationEvents onDidFocus={this.onFocus} />
        <ConversionScreenView
          fromIcon={tokenFrom && tokenFrom.icon}
          fromName={tokenFrom && tokenFrom.tickerName}
          fromBalance={tokenFrom && weiToEth(tokenFrom.balance, tokenFrom.decimals, 5)}
          fromBalanceFiat={tokenFrom && amountToFiat(tokenFrom.balance, tokenFrom.fiatPrice, 18)}
          openFromPicker={this.openFromPicker}
          openToPicker={this.openToPicker}
          onAmountChange={this.onAmountChange}
          amount={amount}
          toIcon={tokenTo && tokenTo.icon}
          toName={tokenTo && tokenTo.tickerName}
          toBalance={tokenTo && weiToEth(tokenTo.balance, tokenTo.decimals, 5)}
          toBalanceFiat={tokenTo && amountToFiat(tokenTo.balance, tokenTo.fiatPrice, 18)}
          maxFee={weiToEth(this.calculateFee(), 18, 4)}
          maxFeeFiat={this.calculateFeeUSD()}
          time={this.calculateTime()}
          withdrawalLimit={
            isOnToCommitChain ? '' : weiToEth(withdrawalLimit, tokenFrom.decimals, 12)
          }
          errorMessage={this.state.errorMessage}
          isValid={this.state.isValid}
          convert={this.convert}
          swapTokens={this.swapTokens}
        />
      </>
    )
  }
}

const mapStateToProps = (state: AppState): Props => ({
  gasPrice: getGasPrice(state),
  withdrawalFee: getWithdrawalFee(state),
  tokens: getActivatedTokens(state),
  ethToken: getETHToken(state),
  ETHFiatPrice: getETHFiatPrice(state),
  publicKey: getPublicKey(state),
})

export default connect(mapStateToProps)(ConversionScreen)
