import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import TouchID from 'react-native-touch-id'
import I18n from 'i18n-js'

import navigation from 'services/navigation'
import {
  BG_COLOR, deviceHeight, globalStyles, Grotesk, WHITE, PRIMARY_COLOR,
} from 'globalStyles' // prettier-ignore
import { faceIdIcon, fingerprintIcon, liquidityLogo } from '../../../assets/images'
import BackButton from 'ui/BackButton'
import { AuthMethod, setAuthMethod } from 'state/auth'
import { AnalyticEvents, logEvent } from 'services/analytics'
import { openLockScreen } from 'routes/navigationActions'
import { LockScreenParams } from './index'
interface Props {
  showBackButton: boolean
  startAuth: () => void
}

interface State {
  identificationType: 'FaceID' | 'TouchID'
}

class FingerLockView extends Component<Props & { dispatch }, State> {
  state: State = { identificationType: 'TouchID' }
  params = navigation.getCurrentScreenParams<LockScreenParams>()

  async componentDidMount() {
    try {
      let identificationType = await TouchID.isSupported({ unifiedErrors: true })
      // @ts-ignore
      if (identificationType === true) identificationType = 'TouchID'
      this.setState({ identificationType }, this.props.startAuth)
    } catch (error) {
      console.log('finger lock error', error)
    }
  }

  pinAuth = () => {
    this.props.dispatch(setAuthMethod(AuthMethod.PIN))

    logEvent(AnalyticEvents.SELECT_PIN)

    openLockScreen({ onComplete: this.params.onComplete, isSetup: true, showBackButton: true })
  }

  render() {
    return (
      <View style={styles.container}>
        {this.props.showBackButton && (
          <BackButton style={globalStyles.backButton} onPress={navigation.goBack} />
        )}

        <Image source={liquidityLogo} style={styles.logo} />

        <Text style={styles.cta}>
          {I18n.t('unlock-with')}{' '}
          {this.state.identificationType === 'FaceID'
            ? I18n.t('with-face-id')
            : I18n.t('with-fingerprint')}
        </Text>

        <TouchableOpacity onPress={this.props.startAuth} style={styles.button} activeOpacity={0.7}>
          {this.state.identificationType === 'FaceID' ? (
            <Image style={styles.faceIcon} source={faceIdIcon} />
          ) : (
            <Image style={styles.fingerprintIcon} source={fingerprintIcon} />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={this.pinAuth} style={styles.pinLockButton} activeOpacity={0.7}>
          <Text style={styles.pinLockText}>Unlock with PIN code</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

export default connect()(FingerLockView)

const styles: any = {
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: BG_COLOR },
  logo: {
    marginBottom: deviceHeight * 0.1,
    width: 71,
    height: 84,
    resizeMode: 'contain',
  },
  cta: {
    marginBottom: deviceHeight * 0.1,
    width: 300,
    fontFamily: Grotesk,
    fontSize: 21,
    lineHeight: 30,
    letterSpacing: 0.55,
    textAlign: 'center',
    color: WHITE,
  },
  button: {
    marginBottom: deviceHeight * 0.1,
    width: 80,
    height: 80,
    borderWidth: 1,
    borderRadius: 40,
    borderColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinLockButton: {
    borderRadius: 5,
    backgroundColor: PRIMARY_COLOR,
    padding: 10,
  },
  pinLockText: {
    color: WHITE,
    fontFamily: Grotesk,
    fontSize: 21,
    lineHeight: 30,
    textAlign: 'center',
  },
  fingerprintIcon: { top: 4, left: 6, width: 82.5, height: 90 },
  faceIcon: { width: 70, height: 70 },
}
