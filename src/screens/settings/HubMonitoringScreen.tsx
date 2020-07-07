import React, { PureComponent } from 'react'
import { View, Text, TouchableOpacity, Alert } from 'react-native'
import { connect } from 'react-redux'
import I18n from 'i18n-js'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import BigNumber from 'bignumber.js'
import { nocust } from 'nocust-client'

import { deviceWidth, Grotesk, RED, WHITE, GREEN, BG_COLOR, globalStyles } from 'globalStyles' // prettier-ignore
import { AppState } from '../../state'
import Header from '../shared/Header'
import Button from 'ui/Button'
import { getCommitChainTokens, Token } from 'state/tokens'
import { getPublicKey } from 'state/auth'
import { getGasPrice } from 'state/config'
import { stateUpdateChallenge } from 'state/tokens/onChain'
import { openDeliveryChallengeScreen, openPickerPopup } from 'routes/navigationActions'
import { getCurrentHubAddress } from 'state/hubs'
import { hideCurrentSnack, showSnack, SnackType } from 'ui/Snack'

interface Props {
  tokens: Token[]
  publicKey: string
  gasPrice: BigNumber
  hubAddress: string
}

interface State {
  selectedToken: string
  isSafe: boolean
  textStatus: string
}

class HubMonitoringScreen extends PureComponent<Props & { dispatch }, State> {
  state: State = {
    selectedToken: this.props.tokens.length > 0 ? this.props.tokens[0].tickerName : null,
    isSafe: false,
    textStatus: '...',
  }

  componentDidMount() {
    if (this.props.tokens.length > 0) {
      this.tokenSelected(this.props.tokens[0].tickerName)
    }
  }

  openTokenPicker = () =>
    this.props.tokens.length > 0 &&
    openPickerPopup({
      data: this.props.tokens.map(c => ({ id: c.tickerName, value: c.tickerName })),
      initialId: this.state.selectedToken,
      onSubmit: this.tokenSelected,
    })

  tokenSelected = async (name: string) => {
    this.setState({ selectedToken: name, textStatus: '...', isSafe: false })

    try {
      await nocust.getWallet(
        this.props.publicKey,
        this.props.tokens.find(t => name === t.tickerName).address,
      )
      this.setState({ isSafe: true, textStatus: I18n.t('safe') })
    } catch {
      this.setState({ isSafe: false, textStatus: I18n.t('unsafe') })
    }
  }

  initiateStateUpdateChallenge = () => {
    Alert.alert(
      I18n.t('initiate-state-update-challenge'),
      I18n.t('initiate-state-update-challenge-description'),
      [
        { text: I18n.t('cancel') },
        {
          text: I18n.t('confirm'),
          onPress: async () => {
            try {
              showSnack({
                type: SnackType.WAITING,
                title: 'Processing transaction',
                message: I18n.t('be-patient'),
                duration: 60000,
              })

              await this.props.dispatch(
                stateUpdateChallenge(
                  this.props.tokens.find(t => this.state.selectedToken === t.tickerName).address,
                ),
              )

              hideCurrentSnack()
            } catch {
              showSnack({ type: SnackType.FAIL, title: I18n.t('transaction-failed') })
            }
          },
        },
      ],
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <Header title={I18n.t('hub-monitoring')} transparent />

        <View style={styles.body}>
          <Text style={styles.text}>{I18n.t('liquidity-network-hubs-are')}</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={this.openTokenPicker}
            style={globalStyles.inline}
          >
            <Text style={styles.currencyTitle}>
              {I18n.t('currency') + ':  ' + (this.state.selectedToken || '')}
            </Text>

            <FontAwesome name="sort-down" style={styles.iconDown} />
          </TouchableOpacity>

          <View style={styles.phraseContainer}>
            <Text style={styles.status} selectable>
              {I18n.t('hub-address') + ': ' + this.props.hubAddress}
            </Text>

            <Text style={styles.status}>
              {I18n.t('hub-status') + ': '}
              <Text style={this.state.isSafe ? styles.good : styles.bad}>
                {this.state.textStatus}
              </Text>
            </Text>
            {this.state.textStatus !== '...' && (
              <Text style={styles.status}>
                {I18n.t('what-to-do') + ': '}
                <Text style={this.state.isSafe ? styles.good : styles.bad}>
                  {this.state.isSafe
                    ? I18n.t('you-are-safe')
                    : I18n.t('open-state-update-challenge')}
                </Text>
              </Text>
            )}
          </View>

          <Button
            text={I18n.t('initiate-state-update-challenge')}
            onPress={this.initiateStateUpdateChallenge}
            disabled={this.props.tokens.length === 0}
          />

          <Button
            style={styles.deliveryButton}
            text={I18n.t('initiate-delivery-challenge')}
            onPress={openDeliveryChallengeScreen}
            disabled={this.props.tokens.length === 0}
          />
        </View>
      </View>
    )
  }
}

const mapStateToProps = (state: AppState): Props => ({
  tokens: getCommitChainTokens(state),
  publicKey: getPublicKey(state),
  gasPrice: new BigNumber(getGasPrice(state)),
  hubAddress: getCurrentHubAddress(state),
})

export default connect(mapStateToProps)(HubMonitoringScreen)

const styles: any = {
  container: { flex: 1, backgroundColor: BG_COLOR },
  body: { paddingHorizontal: deviceWidth * 0.06 },
  text: { marginBottom: 18, ...globalStyles.P, lineHeight: 21, color: WHITE },
  phraseContainer: {
    marginTop: 18,
    marginBottom: 30,
    alignSelf: 'stretch',
    paddingTop: 13,
    paddingBottom: 15,
    paddingHorizontal: 18,
    backgroundColor: '#ffffff10',
  },
  status: {
    fontFamily: Grotesk,
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0.28,
    backgroundColor: 'transparent',
    color: WHITE,
  },
  good: { color: GREEN },
  bad: { color: RED },
  currencyTitle: { ...globalStyles.P_BIG, color: WHITE },
  iconDown: { top: -3, left: 8, width: 26, fontSize: 18, color: WHITE },
  deliveryButton: { marginTop: 20 },
}
