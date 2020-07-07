import React, { PureComponent } from 'react'
import { View, Text, Switch, ScrollView, StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import I18n from 'i18n-js'

import Header from './shared/Header'
import {
  deviceWidth, globalStyles, LIGHTEST_GRAY, ACTIVE_COLOR,
  MUTED_COLOR, GREY, isAndroid, WHITE, SMALL_DEVICE
} from 'globalStyles' // prettier-ignore
import {
  activateToken, deactivateToken, getActivatedTokens, getTokens, Token,
} from 'state/tokens' // prettier-ignore
import { AppState } from 'state'
import { logEvent, AnalyticEvents } from '../services/analytics'

interface Props {
  tokens: Token[]
  activatedCurrencies: Token[]
}

class TokenSelectionScreen extends PureComponent<Props & { dispatch }> {
  adjustedToken

  toggleToken = async (address: string, commitChain: boolean, value: boolean) => {
    if (commitChain) this.adjustedToken = { address, commitChain, value }

    this.forceUpdate()

    if (value) {
      await this.props.dispatch(activateToken(address, commitChain))

      logEvent(AnalyticEvents.ACTIVATE_TOKEN)
    } else {
      await this.props.dispatch(deactivateToken(address, commitChain))

      logEvent(AnalyticEvents.DEACTIVATE_TOKEN)
    }

    this.adjustedToken = null
  }

  render() {
    let tokens = this.props.tokens

    const { adjustedToken } = this
    if (adjustedToken) {
      tokens = tokens.map(t =>
        t.address === adjustedToken.address && t.commitChain === adjustedToken.commitChain
          ? { ...t, activated: adjustedToken.value }
          : t,
      )
    }

    return (
      <View style={globalStyles.flexOne} testID="TokenSelectionScreen">
        <Header title={I18n.t('select-wallet')} />

        <Text style={styles.heading}>{I18n.t('chose-the-tokens')}</Text>

        <Text style={styles.explanation}>{I18n.t('ftokens-explanation')}</Text>

        <ScrollView>
          {tokens.map((token, i) => (
            <View style={[styles.block, i === 0 && styles.blockFirst]} key={token.tickerName}>
              <Text style={globalStyles.P_BIG}>{token.tickerName}</Text>

              <Switch
                onValueChange={value => this.toggleToken(token.address, token.commitChain, value)}
                value={token.activated}
                trackColor={switchColors}
                thumbColor={isAndroid ? WHITE : null}
                testID={'TokenSelectionScreenSwitch' + token.tickerName}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    )
  }
}

const mapStateToProps = (state: AppState): Props => ({
  tokens: getTokens(state),
  activatedCurrencies: getActivatedTokens(state),
})

export default connect(mapStateToProps)(TokenSelectionScreen)

const styles: any = {
  block: {
    paddingVertical: 18,
    paddingHorizontal: deviceWidth * 0.06,
    borderColor: LIGHTEST_GRAY,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  blockFirst: { borderTopWidth: StyleSheet.hairlineWidth },
  heading: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: SMALL_DEVICE ? 13 : 15,
    color: GREY,
  },
  explanation: {
    marginTop: 15,
    marginHorizontal: deviceWidth * 0.15,
    textAlign: 'center',
    fontSize: SMALL_DEVICE ? 13 : 15,
    marginBottom: 20,
    color: GREY,
  },
}

const switchColors = { false: MUTED_COLOR, true: ACTIVE_COLOR }
