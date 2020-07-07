import React, { Component, createRef } from 'react'
import ImagePicker from 'react-native-image-picker'
import { QRreader } from 'react-native-qr-scanner'
import { web3 } from 'services/nocustManager'
import { decodeInvoice } from 'liquidity-invoice-generation'

import {
  TextInput as RNTextInput, View, TextInputProps, TouchableOpacity, StyleProp, ViewStyle, TextStyle, Text
} from 'react-native' // prettier-ignore
import Ionicons from 'react-native-vector-icons/Ionicons'

import {
  Grotesk, LIGHTER_GRAY, ACTIVE_COLOR, WHITE, mediumHitSlop, BLACK, LIGHT_GRAY, PRIMARY_COLOR
} from 'globalStyles' // prettier-ignore
import { QRResult } from 'screens/QRScannerScreen'
import { openQRScanScreen } from 'routes/navigationActions'
import BottomHalfModal from 'screens/modals/BottomHalfModal'
import { ErrorEvents, logError } from 'services/analytics'

interface Props {
  style?: StyleProp<ViewStyle>
  inputStyle?: StyleProp<TextStyle>
  right?
  disabled?: boolean
  qr?: boolean
  moveToStartOnPaste?: boolean
  onFocus?: () => void
  onBlur?: () => void
  onQRScanned?: (result: QRResult) => void
}

interface State {
  isFocused: boolean
  isModalVisible: boolean
  reader: {
    message: string
    data: any
  }
}

export default class TextInput extends Component<Props & TextInputProps, State> {
  state: State = {
    isFocused: false,
    isModalVisible: false,
    reader: {
      message: '',
      data: '',
    },
  }

  inputRef = createRef<RNTextInput>()

  focus = () => !this.inputRef.current.isFocused() && this.inputRef.current.focus()

  blur = () => this.inputRef.current.isFocused() && this.inputRef.current.blur()

  onFocus = () =>
    this.setState({ isFocused: true }, () => {
      this.props.onFocus && this.props.onFocus()
    })

  onBlur = () =>
    this.setState({ isFocused: false }, () => {
      this.props.onBlur && this.props.onBlur()
    })

  scanQR = () => {
    this.modalClose()
    openQRScanScreen({ onComplete: this.props.onQRScanned })
  }

  qrScanModal = () => this.setState({ isModalVisible: true })

  scanQRFromAlbum = () => {
    ImagePicker.launchImageLibrary({}, response => {
      console.log('Response = ', response)

      if (response.didCancel) {
        console.log('User cancelled image picker')
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error)
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton)
      } else {
        if (response.uri) {
          var path = response.path
          if (!path) {
            path = response.uri
          }
          this.props.onQRScanned({ type: 'address', publicKey: null })
          QRreader(path)
            .then(data => {
              let scannedString = data
              if (scannedString.slice(0, 9) === 'ethereum:') {
                scannedString = scannedString.slice(9)
              }

              if (scannedString.length === 42 && scannedString.slice(0, 2) === '0x') {
                try {
                  const address = web3.utils.toChecksumAddress(scannedString)
                  this.props.onQRScanned({ type: 'address', publicKey: address })
                } catch {
                  logError(ErrorEvents.QR_SCAN_ERROR, {
                    type: 'Invalid address',
                    address: scannedString,
                  })
                }
              } else if (scannedString.indexOf('liquidtoken_') > -1) {
                this.props.onQRScanned({
                  type: 'faucet',
                  nonce: parseInt(scannedString.substr(scannedString.indexOf('liquidtoken_') + 12)),
                })
              } else if (scannedString.substr(0, 3) === 'LQI') {
                try {
                  const invoice = decodeInvoice(scannedString)
                  const { network, tokenAddress, publicKey } = invoice

                  if (!network || !publicKey || !tokenAddress) {
                    logError(ErrorEvents.QR_SCAN_ERROR, { type: 'Invalid invoice', invoice })
                    return
                  }

                  const result: QRResult = { type: 'invoice', network, tokenAddress, publicKey }

                  if (invoice.amount) result.amount = invoice.amount
                  if (invoice.contractAddress) result.contractAddress = invoice.contractAddress
                  if (invoice.nonce) result.nonce = invoice.nonce

                  this.props.onQRScanned(result)
                } catch (error) {
                  console.log('Invoice parsing error', error)
                  logError(ErrorEvents.QR_SCAN_ERROR, {
                    type: 'Invalid invoice',
                    invoice: scannedString,
                  })
                }
              }
              this.modalClose()
            })
            .catch(e => {
              this.modalClose()
              console.log(e)
            })
        }
      }
    })
  }

  moveToStartOnPaste = ({ nativeEvent }) => {
    if (nativeEvent.text.length - this.props.value.length > 20) {
      this.inputRef.current.setNativeProps({ selection: { start: 0, end: 0 } })
    }
  }

  modalClose = () => this.setState({ isModalVisible: false })

  render() {
    const { style, inputStyle, qr, right, disabled, ...restProps } = this.props
    // @ts-ignore
    if (this.props.moveToStartOnPaste) restProps.onChange = this.moveToStartOnPaste

    return (
      <View style={[styles.container, style, this.state.isFocused && styles.containerFocused]}>
        <RNTextInput
          style={[styles.input, disabled && styles.inputDisabled, inputStyle]}
          placeholderTextColor={LIGHTER_GRAY}
          underlineColorAndroid="transparent"
          editable={!disabled}
          {...restProps}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          ref={this.inputRef}
        />

        {qr && (
          <TouchableOpacity onPress={this.qrScanModal} hitSlop={mediumHitSlop} activeOpacity={0.7}>
            <Ionicons name="md-qr-scanner" style={styles.qrIcon} />
          </TouchableOpacity>
        )}

        {right}

        <BottomHalfModal isVisible={this.state.isModalVisible} close={this.modalClose}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={this.scanQR} style={styles.buttonStyle}>
              <Text style={styles.textStyle}>Scan QR code using Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonStyle} onPress={this.scanQRFromAlbum}>
              <Text style={styles.textStyle}>Scan QR code using Photo Album</Text>
            </TouchableOpacity>
          </View>
        </BottomHalfModal>
      </View>
    )
  }
}

const styles = {
  container: {
    width: '100%',
    height: 52,
    borderWidth: 1,
    borderColor: LIGHTER_GRAY,
    borderRadius: 5,
    backgroundColor: WHITE,
    flexDirection: 'row',
    alignItems: 'center',
  },
  containerFocused: { borderColor: ACTIVE_COLOR },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontFamily: Grotesk,
    fontSize: 18,
    color: BLACK,
  },
  inputDisabled: { color: LIGHT_GRAY },
  qrIcon: { paddingRight: 16, fontSize: 22, color: LIGHTER_GRAY },
  modalContent: {
    backgroundColor: 'transparent',
    padding: 22,
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContentTitle: {
    fontSize: 20,
    marginBottom: 12,
  },
  buttonStyle: {
    padding: 10,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 5,
    margin: 10,
  },
  textStyle: {
    fontSize: 20,
    color: WHITE,
    textAlign: 'center',
  },
}
