import React, { PureComponent } from 'react'
import { View, Text } from 'react-native'
import { connect } from 'react-redux'
import I18n from 'i18n-js'

import { deviceWidth, Grotesk, WHITE, BG_COLOR, globalStyles, RED } from 'globalStyles'
import Button from 'ui/Button'
import navigation from 'services/navigation'
import TextInput from 'ui/TextInput'
import { setPassphraseBackedUp } from 'state/auth'
import { openHomeScreen } from 'routes/navigationActions'
import Header from './shared/Header'
import { AnalyticEvents, logEvent } from 'services/analytics'

interface Params {
  passphrase: string
  wordNumbers: number[]
  iteration: number
}

interface State {
  word: string
  errorMessage: string
}

class BackupPassphraseVerifyScreen extends PureComponent<{ dispatch }, State> {
  params = navigation.getCurrentScreenParams<Params>()

  state: State = { word: '', errorMessage: '' }

  onChangeText = word => this.setState({ word, errorMessage: '' })

  verify = () => {
    const { passphrase, wordNumbers, iteration } = this.params
    if (this.state.word.trim() === passphrase[wordNumbers[iteration] - 1]) {
      if (iteration === 2) {
        this.props.dispatch(setPassphraseBackedUp())

        logEvent(AnalyticEvents.BACKUP_PASSPHRASE)

        openHomeScreen()
      } else {
        navigation.push('BackupPassphraseVerifyScreen', {
          ...this.params,
          iteration: this.params.iteration + 1,
        })
      }
    } else {
      this.setState({ errorMessage: I18n.t('word-incorrect') })
    }
  }

  formatWords = (number: number) => {
    if (number === 1) {
      return I18n.t('enter-word-of-passphrase', { number: number + 'st' })
    } else if (number === 2) {
      return I18n.t('enter-word-of-passphrase', { number: number + 'nd' })
    } else if (number === 3) {
      return I18n.t('enter-word-of-passphrase', { number: number + 'rd' })
    } else {
      return I18n.t('enter-word-of-passphrase', { number: number + 'th' })
    }
  }

  render() {
    const { iteration, wordNumbers } = this.params
    return (
      <View style={styles.container}>
        <Header
          title={I18n.t('verify-your-passphrase')}
          goBackScreen="SettingsScreen"
          transparent
        />

        <View style={styles.body}>
          <Text style={styles.text} testID="BackupPassphraseVerifyScreenCTA">
            {this.formatWords(wordNumbers[iteration])}
          </Text>

          <TextInput
            style={styles.input}
            autoCapitalize="none"
            onChangeText={this.onChangeText}
            testID="BackupPassphraseVerifyScreenInput"
          />

          <Button
            text={
              iteration === 2 ? I18n.t('complete-verification') : I18n.t('verify-your-passphrase')
            }
            onPress={this.verify}
            testID="BackupPassphraseVerifyScreenButton"
          />

          {this.state.errorMessage !== '' && (
            <Text style={styles.errorMessage}>{this.state.errorMessage}</Text>
          )}
        </View>
      </View>
    )
  }
}

export default connect()(BackupPassphraseVerifyScreen)

const styles: any = {
  container: { flex: 1, backgroundColor: BG_COLOR },
  body: { paddingHorizontal: deviceWidth * 0.06 },
  text: {
    alignSelf: 'center',
    fontFamily: Grotesk,
    fontSize: 16,
    letterSpacing: 0.2,
    color: WHITE,
  },
  input: { marginTop: 18, marginBottom: 45 },
  errorMessage: {
    marginTop: 25,
    paddingHorizontal: deviceWidth * 0.06,
    textAlign: 'center',
    ...globalStyles.P_SMALL,
    color: RED,
  },
}
