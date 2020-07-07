import React, { createRef, PureComponent } from 'react'
import { Keyboard, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import Carousel from 'react-native-snap-carousel'
import I18n from 'i18n-js'

import {
  ACTIVE_COLOR, ALMOST_BLACK, deviceWidth, globalStyles, GREEN, Grotesk,
  GroteskBold, KIMBERLY_SEMITRANSPARENT, mediumHitSlop, PRIMARY_COLOR,
  PRIMARY_COLOR_LIGHT, RED, SECONDARY_COLOR, WHITE,
} from 'globalStyles' // prettier-ignore
import { formatTokenBalance, amountToFiat } from 'helpers/conversion'
import Button from 'ui/Button'
import Header from '../shared/Header'
import { openGasPricePopup, openPickerPopup } from 'routes/navigationActions'
import { Token } from 'state/tokens'
import TextInput from 'ui/TextInput'
import ToTextInput from '../shared/ToTextInput'
import { CurrencyType } from 'helpers/static'

interface Props {
  tokens: Token[]
  carouselIndex: number
  token: Token
  toAddress: string
  amount: string
  currency: CurrencyType
  maxFee: string
  maxFeeUSD: string
  isValid: boolean
  errorMessage: string
  updateToken: (index: number) => void
  updateToAddress: (address: string) => void
  updateAmount: (amount: string) => void
  updateCurrency: (currency: CurrencyType) => void
  onQRScanned: (result: any) => void
  send: () => void
  transfersRestricted: boolean
}

export default class SendScreenView extends PureComponent<Props> {
  carouselRef = createRef<Carousel>()

  componentDidMount() {
    this.carouselRef.current.triggerRenderingHack()
  }

  componentWillUpdate(nextProps: Readonly<Props>) {
    if (nextProps.carouselIndex !== this.props.carouselIndex) {
      this.carouselRef.current.snapToItem(nextProps.carouselIndex, false, false)
    }
  }

  updateToken = (index: number) => {
    this.carouselRef.current.triggerRenderingHack()

    this.props.updateToken(index)
  }

  openCurrencyPicker = () => {
    let currencies = Object.values(CurrencyType)
    if (this.props.token.tickerName.indexOf('ETH') === -1) {
      currencies = currencies.filter(c => c !== CurrencyType.WEI)
    }

    openPickerPopup({
      data: currencies.map(currencyType => ({
        id: currencyType,
        value: this.getCurrencyText(currencyType),
      })),
      initialId: this.props.currency,
      onSubmit: this.props.updateCurrency,
    })
  }

  getCurrencyText = (type: CurrencyType): string => {
    if (type === CurrencyType.FIAT) return 'USD'
    if (type === CurrencyType.WEI) return 'WEI'
    if (type === CurrencyType.ERC20) return this.props.token ? this.props.token.tickerName : 'ETH'
  }

  renderCarouselItem = ({ item }: { item: Token }) => {
    return (
      <View style={[styles.carouselItem, item.commitChain && styles.carouselItemCommitChain]}>
        <Text style={styles.carouselTitle}>{item.tickerName}</Text>

        <View>
          <Text style={styles.carouselAmount}>{formatTokenBalance(item)}</Text>
          <Text style={styles.carouselDollars}>
            ${amountToFiat(item.balance, item.fiatPrice, item.decimals)}
          </Text>
        </View>
      </View>
    )
  }

  renderCurrencyButton = () => {
    return (
      <TouchableOpacity
        style={styles.currencyButton}
        onPress={this.openCurrencyPicker}
        hitSlop={mediumHitSlop}
        activeOpacity={0.7}
      >
        <Text style={styles.currencyText}>{this.getCurrencyText(this.props.currency)}</Text>
      </TouchableOpacity>
    )
  }

  render() {
    return (
      <View style={globalStyles.flexOne} testID="SendScreen">
        <Header
          title={I18n.t('send-money')}
          content={
            <>
              <Carousel
                ref={this.carouselRef}
                data={this.props.tokens}
                onSnapToItem={this.updateToken}
                renderItem={this.renderCarouselItem}
                firstItem={this.props.carouselIndex}
                sliderWidth={deviceWidth}
                itemWidth={deviceWidth * 0.7}
                inactiveSlideScale={0.85}
                inactiveSlideOpacity={0.4}
                containerCustomStyle={styles.carousel}
                useScrollView
                swipeThreshold={10}
                removeClippedSubviews={false}
              />
            </>
          }
        />

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.body}>
            <Text style={globalStyles.P}>{I18n.t('to-address-or-name')}</Text>

            <ToTextInput
              testID="SendScreenToTextInput"
              style={styles.input}
              value={this.props.toAddress}
              onChangeText={this.props.updateToAddress}
              onQRScanned={this.props.onQRScanned}
            />

            <Text style={[globalStyles.P, styles.amountLabel]} testID="SendScreenAmountText">
              {I18n.t('amount')}
            </Text>

            <TextInput
              testID="SendScreenAmountTextInput"
              style={styles.input}
              placeholder="0.000"
              keyboardType="numeric"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={this.props.updateAmount}
              value={this.props.amount}
              right={this.renderCurrencyButton()}
            />

            {!(this.props.token && this.props.token.commitChain) ? (
              <View style={[globalStyles.inlineToSides, styles.feeContainer]}>
                <Text style={globalStyles.P_SMALL}>
                  {I18n.t('max-fee')}:<Text style={styles.feeAmount}> {this.props.maxFee} ETH</Text>
                  <Text style={styles.feeDollars}> (${this.props.maxFeeUSD})</Text>
                </Text>

                <TouchableOpacity
                  onPress={openGasPricePopup}
                  hitSlop={mediumHitSlop}
                  activeOpacity={0.7}
                >
                  <Text style={styles.blueButton}>{I18n.t('edit-gas')}</Text>
                </TouchableOpacity>
              </View>
            ) : this.props.transfersRestricted ? (
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>
                  We’re currently updating the client library and have intermittently halted mainnet
                  transfers. You can still deposit and withdraw all your coins.
                </Text>
              </View>
            ) : (
              <Text style={styles.feeText}>{I18n.t('no-transaction-fee')}</Text>
            )}

            <Button
              testID="SendScreenConfirmButton"
              style={styles.sendButton}
              text={I18n.t('send')}
              disabled={
                (this.props.transfersRestricted && this.props.token.commitChain) ||
                !this.props.isValid
              }
              onPress={this.props.send}
            />

            {this.props.errorMessage !== '' && (
              <Text style={styles.errorMessage}>{this.props.errorMessage}</Text>
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>
    )
  }
}

const styles: any = {
  warningContainer: {
    marginTop: 12,
    width: '100%',
    paddingTop: 8,
    paddingBottom: 9,
    paddingHorizontal: 16,
    backgroundColor: SECONDARY_COLOR,
  },
  warningText: { fontFamily: Grotesk, fontSize: 12, color: WHITE },
  bookIcon: { paddingLeft: 12, fontSize: 38, color: WHITE },
  carousel: { top: -10, width: deviceWidth, marginBottom: 12 },
  carouselItem: {
    width: deviceWidth * 0.7,
    height: 70,
    paddingHorizontal: 20,
    borderRadius: 4,
    backgroundColor: PRIMARY_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  carouselItemCommitChain: { backgroundColor: PRIMARY_COLOR_LIGHT },
  carouselTitle: { fontFamily: Grotesk, fontSize: 18, color: WHITE },
  carouselAmount: {
    textAlign: 'right',
    fontFamily: GroteskBold,
    fontSize: 18,
    letterSpacing: 0.2,
    color: WHITE,
  },
  carouselDollars: {
    textAlign: 'right',
    fontFamily: Grotesk,
    fontSize: 16,
    color: '#ffffff55',
  },
  body: { flex: 1, marginTop: 11, width: deviceWidth, paddingHorizontal: 16 },
  input: { marginTop: 6 },
  amountLabel: { marginTop: 16 },
  feeText: {
    marginTop: 18,
    alignSelf: 'center',
    fontFamily: Grotesk,
    fontSize: 18,
    color: GREEN,
  },
  sendButton: { marginTop: 16 },
  feeContainer: { marginTop: 15 },
  feeAmount: { fontFamily: GroteskBold },
  feeDollars: { color: KIMBERLY_SEMITRANSPARENT },
  blueButton: {
    fontFamily: Grotesk,
    fontSize: 13,
    letterSpacing: 0.1,
    color: ACTIVE_COLOR,
  },
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
  errorMessage: {
    marginTop: 25,
    paddingHorizontal: deviceWidth * 0.06,
    textAlign: 'center',
    ...globalStyles.P_SMALL,
    color: RED,
  },
}
