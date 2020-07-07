import React, { PureComponent, createRef, ReactElement } from 'react'
import { Image, View, Text, Linking, StyleSheet, Clipboard } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { connect } from 'react-redux'
import Ionicons from 'react-native-vector-icons/Ionicons'
import dateFns from 'date-fns'
import I18n from 'i18n-js'

import Popup from 'ui/Popup'
import {
  ACTIVE_COLOR, BLACK, deviceHeight, deviceWidth, GREY, Grotesk,
  LIGHT_GRAY, LIGHTEST_GRAY, mediumHitSlop, SECONDARY_COLOR, WHITE,
} from 'globalStyles' // prettier-ignore
import navigation from 'services/navigation'
import { popupBottomEdge } from '../../../assets/images'
import CopyButton from '../../ui/CopyButton'
import { Transaction, TransactionType } from '../../state/history'
import { amountToFiat, shortenId, weiToEth } from '../../helpers/conversion'
import { MAINNET_EXPLORER, TESTNET_EXPLORER } from '../../helpers/static'
import { showSnack, SnackType } from '../../ui/Snack'

export interface TransactionPopupParams {
  status: string
  time: number
  amount: string
  infoLine: string
  icon: ReactElement
  tx: Transaction
  isTransfer: boolean
  isReceiving: boolean
  fiatPrice: number
  network: number
}

class TransactionPopup extends PureComponent {
  params = navigation.getCurrentScreenParams<TransactionPopupParams>()

  popup = createRef<Popup>()

  explore = () => {
    // TODO This info should be moved to fetched networks redux state instead of hardcoded
    const url =
      (this.params.network === 1 ? MAINNET_EXPLORER : TESTNET_EXPLORER) + this.params.tx.id
    Linking.openURL(url)
  }

  copyAddress = () => {
    Clipboard.setString(this.params.isReceiving ? this.params.tx.sender : this.params.tx.recipient)

    showSnack({
      type: SnackType.INFO,
      message: I18n.t('address') + ' ' + I18n.t('has-been-copied'),
      duration: 1500,
    })
  }

  renderBottomItem(title: string, value: string, isFirst = false) {
    return (
      <View style={isFirst ? styles.bottomItemFirst : styles.bottomItem}>
        <Text style={styles.bottomItemTitle}>{title}</Text>

        <Text style={styles.bottomItemValue}>{value}</Text>
      </View>
    )
  }

  renderFee() {
    const { tx, fiatPrice } = this.params

    if (
      tx.type === TransactionType.DELIVERY_CHALLENGE ||
      tx.type === TransactionType.STATE_UPDATE_CHALLENGE ||
      tx.type === TransactionType.COMMIT_CHAIN ||
      tx.rejected
    )
      return null

    let value = I18n.t('pending')

    if (tx.confirmed || tx.approved) {
      if (tx.fee) {
        value = weiToEth(tx.fee, 18, 5) + ' ETH'

        if (this.params.fiatPrice > 0) value += ' ($' + amountToFiat(tx.fee, fiatPrice, 18) + ')'
      }
    }

    return this.renderBottomItem('FEE', value)
  }

  render() {
    const { tx } = this.params
    const isBlocksVisible =
      (tx.type === TransactionType.WITHDRAWAL_REQUEST || tx.type === TransactionType.DEPOSIT) &&
      !tx.confirmed &&
      tx.blocksToConfirmation != null
    console.log('tx', tx)
    return (
      <Popup containerStyle={styles.container} ref={this.popup}>
        <View style={styles.body}>
          <Text style={styles.status}>{this.params.status}</Text>

          <Text style={styles.date}>{dateFns.format(this.params.time, 'HH:mm, D MMM YYYY')}</Text>

          <View style={styles.icon}>{this.params.icon}</View>

          <View style={styles.info}>
            <Text style={styles.infoText}>{this.params.infoLine}</Text>

            {this.params.isTransfer && <CopyButton onPress={this.copyAddress} />}
          </View>

          <Text style={styles.amount}>{this.params.amount}</Text>

          <View style={styles.bottomBlock}>
            {this.renderBottomItem(
              'ID',
              tx.id && tx.id.length > 10 ? shortenId(tx.id) : tx.id,
              true,
            )}

            {this.renderFee()}

            {isBlocksVisible &&
              this.renderBottomItem(
                'TIME TO CONFIRM',
                tx.blocksToConfirmation > 0
                  ? (tx.blocksToConfirmation * 13.2).toFixed(2).toString() + ' seconds'
                  : 'Confirming',
              )}
          </View>

          {tx.type !== TransactionType.COMMIT_CHAIN && !tx.rejected && (
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={this.explore}
              hitSlop={mediumHitSlop}
              activeOpacity={0.7}
            >
              <Text style={styles.exploreText}>{I18n.t('explore')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <Image source={popupBottomEdge} style={styles.bottomEdge} />

        <View pointerEvents="none" style={styles.closeIcon}>
          <Ionicons name="ios-close-circle-outline" size={42} color={LIGHT_GRAY} />
        </View>
      </Popup>
    )
  }
}

export default connect()(TransactionPopup)

const styles: any = {
  container: {
    position: 'absolute',
    top: deviceHeight * 0.08,
    left: deviceWidth * 0.05,
    right: deviceWidth * 0.05,
  },
  body: {
    width: '100%',
    paddingTop: deviceHeight * 0.06,
    paddingBottom: deviceHeight * 0.052,
    backgroundColor: WHITE,
  },
  status: { alignSelf: 'center', fontFamily: Grotesk, fontSize: 18, color: BLACK },
  date: { marginTop: 8, alignSelf: 'center', fontFamily: Grotesk, fontSize: 14, color: GREY },
  icon: { alignSelf: 'center', transform: [{ scale: 1.2 }] },
  info: { marginTop: 15, alignSelf: 'center', flexDirection: 'row', alignItems: 'center' },
  infoText: { marginRight: 10, fontFamily: Grotesk, fontSize: 13, color: BLACK },
  amount: {
    marginTop: 15,
    alignSelf: 'center',
    fontFamily: Grotesk,
    fontSize: 19,
    color: SECONDARY_COLOR,
  },
  bottomBlock: { marginTop: 30, marginHorizontal: 15, flex: 1 },
  bottomItemFirst: {
    width: '100%',
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomItemTitle: { fontFamily: Grotesk, fontSize: 12, color: GREY },
  bottomItemValue: { fontFamily: Grotesk, fontSize: 11, color: BLACK },
  exploreButton: { alignSelf: 'center', marginTop: deviceHeight * 0.04 },
  exploreText: { fontFamily: Grotesk, fontSize: 14, color: ACTIVE_COLOR },
  bottomEdge: { width: '100%', resizeMode: 'repeat' },
  closeIcon: { position: 'absolute', bottom: -deviceHeight * 0.12, alignSelf: 'center' },
}
styles.bottomItem = {
  ...styles.bottomItemFirst,
  borderTopWidth: StyleSheet.hairlineWidth,
  borderColor: LIGHTEST_GRAY,
}
