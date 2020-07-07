// *** SelectAuthMethodScreen Specs ***
// Purpose: This screen allows the user to select on of two available authentication methods,
// so that wallet data is saved from unauthorized access
// - The screen has two buttons, Pincode and Fingeprint
// - Fingerprint button will only be enabled if the device supports fingerprint authentication
// - Pressing the buttons will navigate the app to respective screens.
import React, { PureComponent } from 'react'
import { Image, Text, View } from 'react-native'
import { connect } from 'react-redux'
import TouchID from 'react-native-touch-id'
import I18n from 'i18n-js'

import Button from 'ui/Button'
import BackButton from 'ui/BackButton'
import navigation from 'services/navigation'
import { fingerprintIcon, liquidityLogo, faceIdIcon } from '../../assets/images'
import { DARK_GRAY, deviceHeight, globalStyles, Grotesk, WHITE } from 'globalStyles'
import { AppState } from 'state'
import { AuthMethod, getPublicKey, setAuthMethod } from 'state/auth'
import { InteractionManager } from 'helpers/general'
import { openLockScreen } from 'routes/navigationActions'
import { AnalyticEvents, logEvent } from 'services/analytics'

export interface SelectAuthMethodScreenParams {
  onComplete: () => void
}

interface Props {
  pubKey: string
}

interface State {
  identificationType: 'FaceID' | 'TouchID' | null
}

class SelectAuthMethodScreen extends PureComponent<Props & { dispatch }, State> {
  params = navigation.getCurrentScreenParams<SelectAuthMethodScreenParams>()

  state: State = { identificationType: null }

  componentDidMount() {
    InteractionManager.runAfterInteractions(async () => {
      try {
        let identificationType = await TouchID.isSupported({ unifiedErrors: true })
        // @ts-ignore
        if (identificationType === true) identificationType = 'TouchID'
        this.setState({ identificationType })
      } catch {
        console.log('Fingerprint sensor not available')
      }
    })
  }

  pinAuth = () => {
    this.props.dispatch(setAuthMethod(AuthMethod.PIN))

    logEvent(AnalyticEvents.SELECT_PIN)
    openLockScreen({ onComplete: this.params.onComplete, isSetup: true, showBackButton: true })
  }

  fingerprintAuth = () => {
    this.props.dispatch(setAuthMethod(AuthMethod.FINGERPRINT))

    logEvent(AnalyticEvents.SELECT_BIO_ID)

    openLockScreen({ onComplete: this.params.onComplete, isSetup: true, showBackButton: true })
  }

  render() {
    const { identificationType } = this.state
    return (
      <View style={styles.container} testID="SelectAuthMethodScreen">
        <BackButton style={globalStyles.backButton} onPress={navigation.goBack} />

        <Image source={liquidityLogo} style={styles.logo} />

        <Text style={styles.cta}>{I18n.t('choose-your-authentication-method')}</Text>

        <Text style={styles.tagline}>{I18n.t('to-protect-your-funds')}</Text>

        <Button
          text={I18n.t('pincode')}
          onPress={this.pinAuth}
          style={[styles.button, styles.topButton]}
          testID="SelectAuthMethodScreenPinCodeButton"
        />

        <Button
          text={identificationType === 'FaceID' ? I18n.t('face-id') : I18n.t('fingerprint')}
          icon={
            identificationType === 'FaceID' ? (
              <Image style={styles.faceId} source={faceIdIcon} />
            ) : (
              <Image style={styles.fingerprint} source={fingerprintIcon} />
            )
          }
          onPress={this.fingerprintAuth}
          style={[styles.button, styles.lastButton]}
          disabled={!identificationType}
        />
      </View>
    )
  }
}

const mapStateToProps = (state: AppState): Props => ({ pubKey: getPublicKey(state) })

export default connect(mapStateToProps)(SelectAuthMethodScreen)

const styles: any = {
  container: { flex: 1, justifyContent: 'space-between', alignItems: 'center' },
  logo: { marginTop: deviceHeight * 0.21, width: 71, height: 84, resizeMode: 'contain' },
  cta: {
    marginTop: deviceHeight * 0.05,
    width: 300,
    fontFamily: Grotesk,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 0.2,
    textAlign: 'center',
    color: WHITE,
  },
  tagline: {
    marginBottom: deviceHeight * 0.1,
    width: 300,
    fontFamily: Grotesk,
    fontSize: 16,
    lineHeight: 30,
    letterSpacing: 0.2,
    textAlign: 'center',
    color: DARK_GRAY,
  },
  button: { width: 300 },
  topButton: { marginBottom: 16 },
  lastButton: { marginBottom: deviceHeight * 0.15 },
  faceId: { width: 50, height: 50 },
  fingerprint: { top: 3, left: 10, width: 55, height: 60 },
}
