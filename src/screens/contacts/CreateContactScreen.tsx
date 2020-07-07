import React, { PureComponent } from 'react'
import { Text, View } from 'react-native'
import { connect } from 'react-redux'
import I18n from 'i18n-js'
import EvilIcons from 'react-native-vector-icons/EvilIcons'

import Header from '../shared/Header'
import { Grotesk, deviceWidth, LIGHTER_GRAY, globalStyles } from 'globalStyles' // prettier-ignore
import TextInput from 'ui/TextInput'
import Button from 'ui/Button'
import navigation from 'services/navigation'
import { isCorrectETHAddress } from 'helpers/validations'
import { addContact, Contact, getContacts } from 'state/contacts'
import { AppState } from 'state'
import { QRResult } from '../QRScannerScreen'
import { logEvent, AnalyticEvents } from 'services/analytics'

interface State {
  name: string
  address: string
  isNameValid: boolean
  isAddressValid: boolean
}

interface Props {
  contacts: Contact[]
}

class CreateContactScreen extends PureComponent<Props & { dispatch }, State> {
  state: State = {
    name: '',
    isNameValid: false,
    address: '',
    isAddressValid: false,
  }

  confirmPressed = () => {
    if (this.state.isNameValid && this.state.isAddressValid) {
      this.props.dispatch(addContact({ name: this.state.name, address: this.state.address }))

      logEvent(AnalyticEvents.ADD_CONTACT)

      navigation.goBack()
    } else {
      console.log('Invalid address')
    }
  }

  updateName = name => this.setState({ name, isNameValid: name.length > 1 })

  updateAddress = address =>
    this.setState({
      address,
      isAddressValid:
        isCorrectETHAddress(address) && !this.props.contacts.find(c => c.address === address),
    })

  onQRScanned = (result: QRResult) => this.updateAddress(result.publicKey)

  render() {
    return (
      <>
        <Header title={I18n.t('create-new-contact')} />

        <Text style={styles.text}>{I18n.t('name')}</Text>
        <TextInput style={styles.input} onChangeText={this.updateName} placeholder="Bobby" />

        <Text style={styles.text}>{I18n.t('address')}</Text>
        <TextInput
          style={styles.input}
          onChangeText={this.updateAddress}
          value={this.state.address}
          placeholder="0x000000000000000000"
          moveToStartOnPaste
          qr
          onQRScanned={this.onQRScanned}
        />

        <View style={styles.infoContainer}>
          <EvilIcons name="exclamation" style={styles.exclamationIcon} />

          <Text style={styles.infoText}>{I18n.t('create-contact-warning')}</Text>
        </View>

        <Button
          onPress={this.confirmPressed}
          text={I18n.t('confirm')}
          disabled={!(this.state.isAddressValid && this.state.isNameValid)}
          style={styles.button}
        />
      </>
    )
  }
}

const mapStateToProps = (state: AppState): Props => ({ contacts: getContacts(state) })

export default connect(mapStateToProps)(CreateContactScreen)

const styles: any = {
  text: { marginTop: 14, marginLeft: 16, marginRight: 16, ...globalStyles.P },
  input: {
    marginTop: 6,
    marginLeft: 16,
    marginRight: 16,
    alignSelf: 'center',
    width: deviceWidth - 16 * 2,
  },
  infoContainer: {
    marginTop: 40,
    marginBottom: 20,
    marginHorizontal: 16,
    width: deviceWidth - 32,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: LIGHTER_GRAY,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exclamationIcon: { marginLeft: 4, marginRight: 4, fontSize: 22, color: LIGHTER_GRAY },
  infoText: { paddingRight: 38, fontFamily: Grotesk, fontSize: 13, color: LIGHTER_GRAY },
  button: {
    marginLeft: 16,
    marginRight: 16,
    width: deviceWidth - 16 * 2,
  },
}
