import React, { PureComponent } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import I18n from 'i18n-js'

import {
  deviceWidth, globalStyles, Grotesk, RED, WHITE, GroteskBold, BG_COLOR, BLACK, LIGHTEST_GRAY
} from 'globalStyles' // prettier-ignore
import Button from 'ui/Button'
import { keychain } from 'services/keychain'
import { shuffleArray } from 'helpers/general'
import navigation from 'services/navigation'
import Header from './shared/Header'
interface State {
  passphrase: string[]
  visibleStatus: boolean
}

class BackupPassphraseScreen extends PureComponent<{ dispatch }, State> {
  state: State = { passphrase: [], visibleStatus: false }

  async componentDidMount() {
    try {
      const phrase = await keychain.getPassphrase()
      this.setState({ passphrase: phrase.split(' ') })
    } catch (error) {
      console.trace('Reading passphrase error', error)
    }
  }

  verifyPassphrase = () => {
    const numbers = Array.from(Array(12).keys()).map(i => i + 1)
    shuffleArray(numbers)
    navigation.navigate('BackupPassphraseVerifyScreen', {
      passphrase: this.state.passphrase,
      wordNumbers: numbers.slice(0, 3),
      iteration: 0,
    })
  }

  onHideWords = () => {
    this.setState({ visibleStatus: false })
  }

  onShowWords = () => {
    this.setState({ visibleStatus: true })
  }

  render() {
    const dash = '-------'
    const { passphrase, visibleStatus } = this.state
    return (
      <View style={styles.container}>
        <Header title={I18n.t('backup-passphrase')} goBackScreen="SettingsScreen" transparent />

        <View style={styles.body}>
          <Text style={styles.text}>{I18n.t('write-down-the')}</Text>

          <Text style={[styles.text, styles.warning]}>{I18n.t('if-you-lose-your')}</Text>

          <View style={globalStyles.inline}>
            <View style={[styles.phraseContainer, styles.phraseContainerLeft]}>
              {passphrase.slice(0, 6).map((word, i) => (
                <View style={styles.phraseView} key={word}>
                  <Text style={styles.number}>{i + 1}. </Text>
                  <Text key={word + i.toString()} style={styles.phrase} selectable>
                    {visibleStatus ? word : dash}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.phraseContainer}>
              {passphrase.slice(6, 12).map((word, i) => (
                <View style={styles.phraseView} key={word}>
                  <Text style={styles.number}>{i + 7}. </Text>
                  <Text key={word} style={styles.phrase} selectable>
                    {visibleStatus ? word : dash}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <Button
            text={I18n.t('i-have-saved-it')}
            onPress={this.verifyPassphrase}
            testID="BackupPassphraseScreenConfirmButton"
          />
          <TouchableOpacity onPressOut={this.onHideWords} onPressIn={this.onShowWords}>
            <Text style={styles.revealButton}>Press and Hold to Reveal</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

export default connect()(BackupPassphraseScreen)

const styles: any = {
  container: { flex: 1, backgroundColor: BG_COLOR },
  title: {
    marginTop: 70,
    alignSelf: 'center',
    fontFamily: GroteskBold,
    fontSize: 30,
    color: '#fff',
    marginBottom: 50,
  },
  body: { paddingHorizontal: deviceWidth * 0.06 },
  text: {
    fontFamily: Grotesk,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: WHITE,
  },
  warning: { marginTop: 10, marginBottom: 30, color: RED },
  phraseContainer: {
    marginBottom: 30,
    flex: 1,
    paddingTop: 13,
    paddingBottom: 15,
    paddingLeft: 20,
    backgroundColor: '#ffffff10',
  },
  phraseContainerLeft: { borderRightWidth: 1, borderColor: BLACK },
  phrase: {
    fontFamily: Grotesk,
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
    letterSpacing: 0.28,
    backgroundColor: 'transparent',
    color: WHITE,
  },
  number: { lineHeight: 24, color: '#ffffff66' },
  revealButton: {
    lineHeight: 36,
    marginTop: 24,
    textAlign: 'center',
    padding: 20,
    color: LIGHTEST_GRAY,
    fontSize: 16,
    fontWeight: 'bold',
  },
  phraseView: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingRight: 20,
  },
}
