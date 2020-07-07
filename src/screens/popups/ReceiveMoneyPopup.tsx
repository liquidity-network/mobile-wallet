import React, { createRef, PureComponent } from 'react'
import { View, Text, Image, TouchableOpacity, Clipboard, Share } from 'react-native'
import { connect } from 'react-redux'
import qrCode from 'yaqrcode'
import Ionicons from 'react-native-vector-icons/Ionicons'
import I18n from 'i18n-js'

import Popup from 'ui/Popup'
import {
  BLACK, KIMBERLY_SEMITRANSPARENT, deviceWidth, globalStyles, Grotesk, WHITE, bigHitSlop
} from 'globalStyles' // prettier-ignore
import Button from 'ui/Button'
import CopyButton from 'ui/CopyButton'
import { showSnack, SnackType } from 'ui/Snack'
import { AppState } from 'state'
import { getPublicKey } from 'state/auth'
import navigation from 'services/navigation'
import { openCreatePaymentRequestScreen } from 'routes/navigationActions'
import Tweenable from 'ui/Tweenable'
import { Token } from 'state/tokens'
import { logEvent, AnalyticEvents } from 'services/analytics'

export interface ReceiveMoneyPopupParams {
  token: Token
}

interface Props {
  publicKey: string
}

interface State {
  qrString: string
}

class ReceiveMoneyPopup extends PureComponent<Props, State> {
  params = navigation.getCurrentScreenParams<ReceiveMoneyPopupParams>()

  state: State = { qrString: null }

  popupRef = createRef<Popup>()

  componentDidMount() {
    requestAnimationFrame(() => this.setState({ qrString: qrCode(this.props.publicKey) }))
  }

  close = () => this.popupRef.current.close()

  copyToClipboard = () => {
    Clipboard.setString(this.props.publicKey)

    showSnack({
      type: SnackType.INFO,
      message: I18n.t('address') + ' ' + I18n.t('has-been-copied'),
      duration: 1500,
    })
  }

  share = () => {
    Share.share({
      title: I18n.t('share-public-key'),
      message:
        "Hey, that's my zero transaction fees crypto address from Liquidity Network - " +
        this.props.publicKey,
    })

    logEvent(AnalyticEvents.SHARE_ADDRESS)

    this.close()
  }

  createPaymentRequest = () => openCreatePaymentRequestScreen({ token: this.params.token })

  render() {
    return (
      <Popup containerStyle={styles.container} ref={this.popupRef}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{I18n.t('receive-money')}</Text>

          <TouchableOpacity onPress={this.close} activeOpacity={0.7} hitSlop={bigHitSlop}>
            <Ionicons name="ios-close" size={42} color={BLACK} />
          </TouchableOpacity>
        </View>

        <View style={globalStyles.inlineCentered}>
          <Text style={styles.subtitle}>{I18n.t('address')}:</Text>

          <CopyButton onPress={this.copyToClipboard} />
        </View>

        <Text style={styles.address}>{this.props.publicKey}</Text>

        <TouchableOpacity style={styles.qrCodeContainer} onPress={this.copyToClipboard}>
          {this.state.qrString != null && (
            <Tweenable tweens={[{ property: 'opacity', from: 0, to: 1 }]}>
              <Image source={{ uri: this.state.qrString }} style={styles.qrCode} />
            </Tweenable>
          )}
        </TouchableOpacity>

        {this.params.token && this.params.token.commitChain && (
          <Button
            style={styles.createRequestButton}
            text={I18n.t('create-payment-request')}
            onPress={this.createPaymentRequest}
          />
        )}

        <Button text={I18n.t('share')} onPress={this.share} />
      </Popup>
    )
  }
}

const mapStateToProps = (state: AppState): Props => ({ publicKey: getPublicKey(state) })

export default connect(mapStateToProps)(ReceiveMoneyPopup)

const styles: any = {
  container: {
    position: 'absolute',
    bottom: 0,
    width: deviceWidth,
    paddingTop: 18,
    paddingHorizontal: deviceWidth * 0.06,
    paddingBottom: 30,
    backgroundColor: WHITE,
  },
  titleContainer: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
  },
  title: {
    paddingTop: 6,
    paddingBottom: 3,
    fontFamily: Grotesk,
    fontSize: 22,
    letterSpacing: 0.2,
    color: BLACK,
  },
  subtitle: {
    marginRight: 15,
    fontFamily: Grotesk,
    fontSize: 14,
    letterSpacing: 0.2,
    color: KIMBERLY_SEMITRANSPARENT,
  },
  address: {
    marginTop: 8,
    fontFamily: Grotesk,
    fontSize: 13,
    lineHeight: 24,
    letterSpacing: 0.1,
    color: BLACK,
  },
  qrCodeContainer: {
    marginTop: 20,
    marginBottom: 30,
    width: 160,
    height: 160,
    alignSelf: 'center',
  },
  qrCode: { width: 160, height: 160 },
  createRequestButton: { marginBottom: 15 },
}
