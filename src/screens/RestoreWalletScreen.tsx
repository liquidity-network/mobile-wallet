// SPECIFICATION
// Purpose: This screen allows the user to restore previously created wallet using any of the
// three types of private key. Those types are passphrase, raw private key and keystore file.
// - The screen has three radio buttons for each type of the key.
// - It also displays a small hint for each key type.
// - TextInput is present for entering the key, and password field appears only if keystore
// radio button is selected.
// - Restore wallet button is enabled only if the entered key (and password in case of keytore)
// is valid.
// - Pressing the Restore wallet button restores the wallet and navigates the app to the
// SelectAuthMethodScreen.
import React, { PureComponent } from 'react'
import { View, Text, TouchableOpacity, Keyboard } from 'react-native'
import { connect } from 'react-redux'
import { validateMnemonic } from 'bip39'
import I18n from 'i18n-js'
import EthereumWallet from 'ethereumjs-wallet'

import Button from 'ui/Button'
import TextInput from 'ui/TextInput'
import { setupKeys, setPrivateKeyType, setPassphraseBackedUp, KeyType } from 'state/auth'
import {
  DARK_GRAY, deviceHeight, isAndroid,  isIos, globalStyles,
  Grotesk, statusBarHeight, WHITE, ACTIVE_COLOR,
} from 'globalStyles' // prettier-ignore
import navigation from 'services/navigation'
import RadioIcon from 'ui/RadioIcon'
import Header from './shared/Header'
import { showSnack, SnackType } from 'ui/Snack'

export interface RestoreWalletScreenParams {
  onComplete: () => void
}

interface State {
  key: string
  isValid: boolean
  keystorePassword: string
  keyType: KeyType
  hintText: string
}

class RestoreWalletScreen extends PureComponent<{ dispatch }, State> {
  params = navigation.getCurrentScreenParams<RestoreWalletScreenParams>()

  state: State = {
    key: '',
    isValid: false,
    keystorePassword: '',
    keyType: KeyType.PASSPHRASE,
    hintText: I18n.t('enter-your-recovery-phrase'),
  }

  updateKey = (key: string): void => {
    if (this.state.keyType === KeyType.PASSPHRASE) {
      key = key
        .split(' ')
        .filter(word => word !== '')
        .join(' ')
        .toLowerCase()
      this.setState({ isValid: this.isValidPassphrase(key), key })
    } else if (this.state.keyType === KeyType.PRIVATE_KEY) {
      if (key.length === 66 && key[0] === '0' && key[1] === 'x') {
        key = key.slice(2)
      }
      this.setState({ isValid: this.isValidPrivateKey(key), key })
    } else {
      this.setState({
        isValid: this.isValidKeystore(key) && this.state.keystorePassword.length > 6,
        key,
      })
    }
  }

  updateKeystorePassword = (keystorePassword: string) =>
    this.setState({
      keystorePassword,
      isValid: this.isValidKeystore(this.state.key) && keystorePassword.length > 6,
    })

  isValidPassphrase = (passphrase: string): boolean => validateMnemonic(passphrase)

  isValidPrivateKey = (privateKey: string): boolean => {
    try {
      EthereumWallet.fromPrivateKey(Buffer.from(privateKey, 'hex'))
      return true
    } catch {
      return false
    }
  }

  isValidKeystore = (value: string): boolean => {
    try {
      JSON.parse(value)
      value = value.toLowerCase()
      return (
        value.includes('version') &&
        value.includes('id') &&
        value.includes('address') &&
        value.includes('crypto') &&
        value.includes('mac')
      )
    } catch {
      return false
    }
  }

  confirm = async () => {
    if (!this.state.isValid) return

    try {
      Keyboard.dismiss()

      this.setState({ isValid: false })

      this.props.dispatch(setPrivateKeyType(this.state.keyType))
      await this.props.dispatch(
        setupKeys(this.state.key, this.state.keyType, this.state.keystorePassword),
      )

      if (this.state.keyType === KeyType.PASSPHRASE) {
        this.props.dispatch(setPassphraseBackedUp())
      }

      this.params.onComplete()
    } catch {
      showSnack({ type: SnackType.FAIL, title: 'Wallet creation failed' })

      this.setState({ isValid: true })
    }
  }

  selectPassphrase = () =>
    this.setState(
      { keyType: KeyType.PASSPHRASE, hintText: I18n.t('enter-your-recovery-phrase') },
      () => this.updateKey(this.state.key),
    )

  selectPrivateKey = () =>
    this.setState({ keyType: KeyType.PRIVATE_KEY, hintText: I18n.t('enter-private-key') }, () =>
      this.updateKey(this.state.key),
    )

  selectKeyStore = () =>
    this.setState({ keyType: KeyType.KEYSTORE, hintText: I18n.t('enter-keystore-content') }, () =>
      this.updateKey(this.state.key),
    )

  render() {
    const { keyType, isValid } = this.state
    return (
      <View style={globalStyles.flexOne} testID="RestoreWalletScreen">
        <Header title={I18n.t('restore-wallet')} transparent goBackScreen="WelcomeScreen" />

        <View style={styles.body}>
          <TouchableOpacity
            onPress={this.selectPassphrase}
            style={styles.item}
            activeOpacity={0.8}
            testID="RestoreWalletScreenPassphrase"
          >
            <Text style={styles.itemTitle}>{I18n.t('passphrase')}</Text>

            <RadioIcon enabled={keyType === KeyType.PASSPHRASE} color={WHITE} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={this.selectPrivateKey}
            style={styles.item}
            activeOpacity={0.8}
            testID="RestoreWalletScreenPrivateKey"
          >
            <Text style={styles.itemTitle}>{I18n.t('private-key')}</Text>

            <RadioIcon enabled={keyType === KeyType.PRIVATE_KEY} color={WHITE} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={this.selectKeyStore}
            style={styles.item}
            activeOpacity={0.8}
            testID="RestoreWalletScreenKeystore"
          >
            <Text style={styles.itemTitle}>{I18n.t('keystore')}</Text>

            <RadioIcon enabled={keyType === KeyType.KEYSTORE} color={WHITE} />
          </TouchableOpacity>

          <TextInput
            placeholder={I18n.t('enter-key') + '...'}
            style={styles.inputContainer}
            inputStyle={styles.input}
            multiline
            onChangeText={this.updateKey}
            blurOnSubmit
            autoCapitalize="none"
            autoCorrect={false}
            testID="RestoreWalletScreenKeyInput"
          />

          {keyType === KeyType.KEYSTORE && (
            <TextInput
              placeholder={I18n.t('enter-password') + '...'}
              style={styles.inputPasswordContainer}
              onChangeText={this.updateKeystorePassword}
              blurOnSubmit
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              testID="RestoreWalletScreenPasswordInput"
            />
          )}

          <Button
            style={styles.button}
            text={I18n.t('restore-wallet')}
            onPress={this.confirm}
            disabled={!isValid}
            testID="RestoreWalletScreenRestoreButton"
          />
        </View>

        <Text style={styles.hint}>{this.state.hintText}</Text>
      </View>
    )
  }
}

export default connect()(RestoreWalletScreen)

const styles: any = {
  body: { marginTop: deviceHeight * 0.01, alignSelf: 'center' },
  titleContainer: { marginTop: statusBarHeight + deviceHeight * 0.09 },
  title: {
    fontFamily: Grotesk,
    fontSize: 21,
    letterSpacing: 0.2,
    color: WHITE,
  },
  inputContainer: {
    marginTop: 20,
    width: 300,
    height: isIos ? 108 : 112,
    paddingTop: isIos ? 11 : 13,
    paddingBottom: isIos ? 15 : 13,
  },
  inputPasswordContainer: { marginTop: 12, width: 300, borderColor: ACTIVE_COLOR },
  input: { lineHeight: isAndroid ? 22 : 27 },
  button: { marginTop: 14, width: 300 },
  item: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontFamily: Grotesk,
    fontSize: 16,
    letterSpacing: 0.25,
    color: WHITE,
  },
  hint: {
    marginTop: deviceHeight * 0.05,
    width: 240,
    alignSelf: 'center',
    textAlign: 'center',
    fontFamily: Grotesk,
    fontSize: 16,
    letterSpacing: 0.2,
    color: DARK_GRAY,
  },
}
