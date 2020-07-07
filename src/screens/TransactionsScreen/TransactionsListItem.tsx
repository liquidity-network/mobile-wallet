import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import dateFns from 'date-fns'
import { Image, Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import I18n from 'i18n-js'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

import {
  BLACK, deviceWidth, globalStyles, GREEN, GREY, Grotesk, RED,
} from 'globalStyles' // prettier-ignore
import {
  transactionExchangeIcon, transactionReceiveIcon, transactionReceiveSmallIcon, transactionRejectedIcon,
  transactionSendIcon, transactionSendSmallIcon,
} from '../../../assets/images' // prettier-ignore
import { Transaction, TransactionType } from 'state/history'
import { getTokenByCursor, Token } from 'state/tokens'
import { weiToEth } from 'helpers/conversion'
import { AppState } from 'state'
import { getPublicKey } from 'state/auth'
import { COMMIT_CHAIN_NAME_PREFIX } from 'helpers/static'
import { getCurrentHub, HubInfo } from 'state/hubs'
import { Contact, getContacts } from '../../state/contacts'
import Avatar from '../../ui/Avatar'
import { openTransactionPopup } from '../../routes/navigationActions'

interface Props {
  tx: Transaction
  challengeMode?: boolean
}

interface ReduxProps {
  token: Token
  hub: HubInfo
  contacts: Contact[]
  publicKey: string
}

interface State {
  isTransfer: boolean
  isReceiving: boolean
  name: string | null
}

class TransactionsListItem extends PureComponent<Props & ReduxProps & { dispatch }> {
  state: State = { isTransfer: false, isReceiving: false, name: null }

  static getDerivedStateFromProps(props: Props & ReduxProps): State {
    const isTransfer =
      props.tx.type === TransactionType.ON_CHAIN || props.tx.type === TransactionType.COMMIT_CHAIN
    const isReceiving = props.tx.recipient === props.publicKey
    let name = null

    if (isTransfer) {
      const contact = props.contacts.find(
        c => c.address === (isReceiving ? props.tx.sender : props.tx.recipient),
      )
      if (contact) name = contact.name
    }

    return { isTransfer, isReceiving, name }
  }

  getShortAddress = (address: string) =>
    address.substring(0, 6) + '...' + address.substr(address.length - 4)

  openTransactionPopup = () =>
    openTransactionPopup({
      tx: this.props.tx,
      status: this.getStatus(),
      time: this.props.tx.time,
      amount: this.getAmount(true),
      infoLine: this.getInfo(),
      icon: this.renderIcon(),
      isTransfer: this.state.isTransfer,
      isReceiving: this.state.isReceiving,
      fiatPrice: this.props.token.fiatPrice,
      network: this.props.hub.network,
    })

  renderIcon() {
    const { type, rejected } = this.props.tx
    if (rejected) {
      return <Image source={transactionRejectedIcon} style={styles.icon} />
    } else if (this.state.isTransfer) {
      return this.state.name ? (
        <View style={styles.icon}>
          <Avatar small name={this.state.name} />
          <Image
            source={this.state.isReceiving ? transactionReceiveSmallIcon : transactionSendSmallIcon}
            style={styles.smallTransferIcon}
          />
        </View>
      ) : (
        <Image
          source={this.state.isReceiving ? transactionReceiveIcon : transactionSendIcon}
          style={styles.icon}
        />
      )
    } else if (
      type === TransactionType.STATE_UPDATE_CHALLENGE ||
      type === TransactionType.DELIVERY_CHALLENGE ||
      type === TransactionType.RECOVER_FUNDS
    ) {
      return (
        <View style={styles.challengeIcon}>
          <MaterialCommunityIcons name="bomb" color={BLACK} size={24} />
        </View>
      )
    } else {
      return <Image source={transactionExchangeIcon} style={styles.icon} />
    }
  }

  getInfo() {
    const { type } = this.props.tx
    const { tickerName } = this.props.token
    const { isReceiving, isTransfer, name } = this.state
    let text = ''
    if (isTransfer) {
      text = isReceiving
        ? I18n.t('from') + ' ' + (name || this.getShortAddress(this.props.tx.sender))
        : I18n.t('to') + ' ' + (name || this.getShortAddress(this.props.tx.recipient))
    } else if (type === TransactionType.DEPOSIT) {
      text = tickerName + ' > ' + COMMIT_CHAIN_NAME_PREFIX + tickerName
    } else if (type === TransactionType.WITHDRAWAL_REQUEST) {
      text = COMMIT_CHAIN_NAME_PREFIX + tickerName + ' > ' + tickerName
    } else if (type === TransactionType.STATE_UPDATE_CHALLENGE) {
      text = I18n.t('state-challenge')
    } else if (type === TransactionType.DELIVERY_CHALLENGE) {
      text = I18n.t('delivery-challenge')
    } else if (type === TransactionType.RECOVER_FUNDS) {
      text = I18n.t('recover-funds')
    }
    return text
  }

  getAmount(popupView: boolean = false) {
    if (this.props.tx.type === TransactionType.STATE_UPDATE_CHALLENGE) return null

    return (
      (this.state.isTransfer ? (this.state.isReceiving ? '+ ' : '- ') : '') +
      weiToEth(this.props.tx.amount, this.props.token.decimals, popupView ? 18 : 6) +
      ' ' +
      (this.props.tx.type === TransactionType.COMMIT_CHAIN ? COMMIT_CHAIN_NAME_PREFIX : '') +
      this.props.token.tickerName
    )
  }

  getStatus() {
    if (this.props.tx.rejected) return I18n.t('rejected')
    else if (this.props.tx.confirmed) return I18n.t('confirmed')
    else if (this.props.tx.approved) return I18n.t('approved')
    else return I18n.t('pending')
  }

  render() {
    return (
      <TouchableOpacity
        style={styles.container}
        activeOpacity={0.9}
        onPress={this.openTransactionPopup}
      >
        <View style={globalStyles.inline}>
          {this.renderIcon()}

          <View style={styles.topBlock}>
            <View style={styles.topBlockLine}>
              <Text style={styles.boldText}>{this.getInfo()}</Text>

              <Text style={this.props.tx.rejected ? styles.rejectedText : styles.boldText}>
                {this.getAmount()}
              </Text>
            </View>

            <View style={styles.topBlockLine}>
              <Text style={styles.topBlockText}>
                {dateFns.format(this.props.tx.time, 'D MMM, HH:mm')}
              </Text>

              <Text style={styles.topBlockText}>{this.getStatus()}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }
}

const mapStateToProps = (state: AppState, ownProps: Props): ReduxProps => ({
  token:
    getTokenByCursor(state, {
      address: ownProps.tx.tokenAddress,
      commitChain: false,
    }) || ({ tickerName: 'ERROR', fiatPrice: 0 } as any),
  hub: getCurrentHub(state),
  publicKey: getPublicKey(state),
  contacts: getContacts(state),
})

export default connect(mapStateToProps)(TransactionsListItem)

const styles: any = {
  container: { width: deviceWidth },
  icon: { marginTop: 12, marginLeft: 10, width: 32, height: 32, marginRight: 13 },
  challengeIcon: { marginTop: 15, marginLeft: 12, width: 43 },
  smallTransferIcon: { position: 'absolute', bottom: 0, right: 0, width: 13, height: 13 },
  topBlock: { width: deviceWidth - 50, height: 56, justifyContent: 'center' },
  topBlockLine: {
    width: deviceWidth - 50,
    paddingRight: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  boldText: { fontFamily: Grotesk, fontSize: 15, color: BLACK },
  topBlockText: { marginTop: 1.5, fontFamily: Grotesk, fontSize: 13, color: GREY },
  receiveText: { color: GREEN },
  sendText: { color: RED },
}
styles.rejectedText = { ...styles.boldText, textDecorationLine: 'line-through' }
