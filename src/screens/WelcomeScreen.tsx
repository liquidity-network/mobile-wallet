// This is the first screen that will appear after splash screen (if the user has not
// created or restored wallet already). It allows the user to select one of the two options for
// logging in - either create new wallet or restore the previous one.
import React, { PureComponent } from 'react'
import { Image, Text, View } from 'react-native'
import { connect } from 'react-redux'
import I18n from 'i18n-js'

import Button from 'ui/Button'
import { liquidityLogo } from '../../assets/images'
import { deviceHeight, Grotesk, SMALL_DEVICE, WHITE } from 'globalStyles'
import { hideCurrentSnack, showSnack, SnackType } from 'ui/Snack'
import { InteractionManager } from 'helpers/general'
import { createWallet } from 'state/wallet'
import {
  openHomeScreen, openRestoreWalletScreen, openSelectAuthMethodScreen,
} from 'routes/navigationActions' // prettier-ignore
import { AnalyticEvents, logEvent } from 'services/analytics'
import { checkMinimumRequiredVersion } from '../state/etc'

class WelcomeScreen extends PureComponent<{ dispatch }> {
  componentDidMount() {
    checkMinimumRequiredVersion()
  }

  completeCreatingWallet = (restoreWallet?: boolean) => {
    showSnack({
      type: SnackType.WAITING,
      title: I18n.t('generating-wallet'),
      message: I18n.t('be-patient'),
      duration: 90000,
    })

    setTimeout(
      () =>
        InteractionManager.runAfterInteractions(async () => {
          try {
            await this.props.dispatch(createWallet(restoreWallet))
          } catch {}
          logEvent(restoreWallet ? AnalyticEvents.RESTORE_WALLET : AnalyticEvents.CREATE_WALLET)
          hideCurrentSnack()
          InteractionManager.runAfterInteractions(openHomeScreen)
        }),
      100,
    )
  }

  createWallet = () =>
    openSelectAuthMethodScreen({ onComplete: () => this.completeCreatingWallet(false) })

  completeRestoringWallet = () =>
    openRestoreWalletScreen({ onComplete: () => this.completeCreatingWallet(true) })

  restoreWallet = () => openSelectAuthMethodScreen({ onComplete: this.completeRestoringWallet })

  render() {
    return (
      <View style={styles.container} testID="WelcomeScreen">
        <Image source={liquidityLogo} style={styles.logo} />

        <Text style={styles.title}>Liquidity Network</Text>

        <Text style={styles.cta}>{I18n.t('create-your-wallet-and')}</Text>

        <Button
          text={I18n.t('create-wallet')}
          onPress={this.createWallet}
          style={[styles.button, styles.topButton]}
          testID="WelcomeScreenCreateWalletButton"
        />

        <Button
          text={I18n.t('restore-wallet')}
          transparent
          onPress={this.restoreWallet}
          style={[styles.button, styles.bottomButton]}
          testID="WelcomeScreenRestoreWalletButton"
        />

        <Text style={styles.warn}>{I18n.t('this-is-highly-experimental')}</Text>
      </View>
    )
  }
}

export default connect()(WelcomeScreen)

const styles: any = {
  container: { flex: 1, justifyContent: 'space-between', alignItems: 'center' },
  logo: {
    marginTop: deviceHeight * (SMALL_DEVICE ? 0.15 : 0.18),
    width: 71,
    height: 84,
    resizeMode: 'contain',
  },
  title: {
    marginTop: deviceHeight * 0.04,
    fontFamily: Grotesk,
    fontSize: SMALL_DEVICE ? 29 : 31,
    letterSpacing: 0.2,
    color: WHITE,
  },
  cta: {
    marginTop: deviceHeight * 0.015,
    marginBottom: deviceHeight * (SMALL_DEVICE ? 0.06 : 0.1),
    width: 300,
    fontFamily: Grotesk,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: 0.55,
    textAlign: 'center',
    color: WHITE,
  },
  button: { width: 300 },
  topButton: { marginBottom: 10 },
  bottomButton: { marginBottom: deviceHeight * 0.04 },
  warn: {
    marginBottom: 12,
    width: 280,
    fontFamily: Grotesk,
    fontSize: 14,
    lineHeight: SMALL_DEVICE ? 16 : 18,
    textAlign: 'center',
    color: '#ff000099',
  },
}
