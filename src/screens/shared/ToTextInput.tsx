import React, { PureComponent, createRef } from 'react'
import { TextInputProps } from 'react-native'
import { connect } from 'react-redux'

import TextInput from 'ui/TextInput'
import { QRResult } from 'screens/QRScannerScreen'
import ContactsListItem from 'screens/contacts/ContactsListItem'
import AutoComplete from 'ui/AutoComplete'
import { Contact, getContacts } from 'state/contacts'
import { AppState } from 'state'

interface Props extends Omit<TextInputProps, 'onFocus' | 'onBlur'> {
  onQRScanned: (result: QRResult) => void
}

interface ReduxProps {
  contacts: Contact[]
}

interface State {
  isFocused: boolean
  list: Contact[]
}

class ToTextInput extends PureComponent<Props & ReduxProps, State> {
  input = createRef<TextInput>()

  state = { isFocused: false, list: [] }

  renderAutocompleteItem = ({ item }) => (
    <ContactsListItem
      key={item.address}
      onPress={this.selectItem}
      name={item.name}
      address={item.address}
    />
  )

  selectItem = (address: string) => {
    this.props.onChangeText(address)

    this.setState({ list: emptyArray })
  }

  onFocus = () => this.setState({ isFocused: true })

  onBlur = () => this.setState({ isFocused: false })

  onChangeText = (value: string) => {
    let list: Contact[]
    if (value.length > 2 && value.substr(0, 2) === '0x') {
      list = this.props.contacts.filter(c => c.address.indexOf(value) > -1).slice(0, 2)

      if (list.length > 0) this.setState({ list })
    } else if (value.length > 1) {
      list = this.props.contacts
        .filter(c => c.name.toLowerCase().indexOf(value.toLowerCase()) > -1)
        .slice(0, 2)
    }

    if (list && list.length > 0) {
      this.setState({ list })
    } else if (this.state.list !== emptyArray) {
      this.setState({ list: emptyArray })
    }

    this.props.onChangeText(value)
  }

  keyExtractor = item => item.address

  renderInput = () => (
    <TextInput
      placeholder="0x0000 / Padmé Amidala"
      moveToStartOnPaste
      autoCorrect={false}
      qr
      onFocus={this.onFocus}
      onBlur={this.onBlur}
      ref={this.input}
      {...this.props}
      onChangeText={this.onChangeText}
    />
  )

  render() {
    return (
      <AutoComplete
        data={this.state.isFocused ? this.state.list : emptyArray}
        renderItem={this.renderAutocompleteItem}
        keyExtractor={this.keyExtractor}
        renderTextInput={this.renderInput}
      />
    )
  }
}

const mapStateToProps = (state: AppState) => ({
  contacts: getContacts(state),
})

export default connect(mapStateToProps)(ToTextInput)

const emptyArray = []
