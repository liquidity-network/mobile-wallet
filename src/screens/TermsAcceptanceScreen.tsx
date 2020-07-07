import React, { PureComponent } from 'react'
import { View, Text, Linking } from 'react-native'
import { connect } from 'react-redux'
import I18n from 'i18n-js'

import { deviceWidth, globalStyles, WHITE } from 'globalStyles'
import Header from './shared/Header'
import Button from 'ui/Button'
import { acceptToS } from 'state/auth'
import { openOnBoardingScreen } from 'routes/navigationActions'
import CheckBox from 'ui/CheckBox'
import { TOS_URL, PRIVACY_URL } from 'helpers/static'
import { logEvent, AnalyticEvents } from 'services/analytics'

interface State {
  isTermsChecked: boolean
  isPrivacyChecked: boolean
}

class TermsAcceptanceScreen extends PureComponent<{ dispatch }, State> {
  state: State = { isTermsChecked: false, isPrivacyChecked: false }

  onTermsChange = (value: boolean) => this.setState({ isTermsChecked: value })

  onPrivacyChange = (value: boolean) => this.setState({ isPrivacyChecked: value })

  openTerms = () => Linking.openURL(TOS_URL)

  openPrivacy = () => Linking.openURL(PRIVACY_URL)

  accept = () => {
    this.props.dispatch(acceptToS())

    logEvent(AnalyticEvents.ACCEPT_TOS)

    openOnBoardingScreen()
  }

  render() {
    return (
      <View style={globalStyles.flexOne} testID="TermsAcceptanceScreen">
        <Header title={I18n.t('terms-conditions')} transparent noBackButton />

        <View style={styles.body}>
          <Text style={[styles.info, styles.text]}>
            Please accept both the Terms of Service and the Privacy Policy below to proceed.
          </Text>

          <View style={styles.checkBoxContainer}>
            <CheckBox
              value={this.state.isTermsChecked}
              onChange={this.onTermsChange}
              testID="TermsAcceptanceScreenTermsCheckbox"
            />

            <Text style={[styles.checkBoxText, styles.text]}>
              I accept terms of service{' '}
              <Text style={styles.underline} onPress={this.openTerms}>
                [READ]
              </Text>
            </Text>
          </View>

          <View style={styles.checkBoxContainer}>
            <CheckBox
              value={this.state.isPrivacyChecked}
              onChange={this.onPrivacyChange}
              testID="TermsAcceptanceScreenPrivacyCheckbox"
            />

            <Text style={[styles.checkBoxText, styles.text]}>
              I accept privacy policy{' '}
              <Text style={styles.underline} onPress={this.openPrivacy}>
                [READ]
              </Text>
            </Text>
          </View>

          <Button
            text={I18n.t('accept')}
            disabled={!(this.state.isTermsChecked && this.state.isPrivacyChecked)}
            onPress={this.accept}
            style={styles.button}
            testID="TermsAcceptanceScreenAcceptButton"
          />
        </View>
      </View>
    )
  }
}

export default connect()(TermsAcceptanceScreen)

const styles: any = {
  body: { paddingHorizontal: deviceWidth * 0.06 },
  termsContainer: { paddingHorizontal: deviceWidth * 0.06 },
  text: { ...globalStyles.P, color: WHITE },
  info: { marginBottom: 30, textAlign: 'center' },
  checkBoxContainer: { ...globalStyles.inlineCentered, marginVertical: 4 },
  checkBoxText: { marginLeft: 6 },
  underline: { textDecorationLine: 'underline' },
  button: { marginTop: 30 },
}
