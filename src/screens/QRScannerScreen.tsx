import React, { PureComponent } from 'react'
import { Image, TouchableOpacity, View, Text } from 'react-native'
import { RNCamera } from 'react-native-camera'
import { QRreader } from 'react-native-qr-scanner'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { decodeInvoice } from 'liquidity-invoice-generation'
import BigNumber from 'bignumber.js'
import I18n from 'i18n-js'
import ImagePicker from 'react-native-image-picker'

import navigation from 'services/navigation'
import {
  bigHitSlop, deviceHeight, deviceWidth, globalStyles, statusBarHeight, WHITE, PRIMARY_COLOR
} from 'globalStyles' // prettier-ignore
import { qrScanGuides } from '../../assets/images'
import { web3 } from 'services/nocustManager'
import { ErrorEvents, logError } from 'services/analytics'
export interface QRScannerScreenParams {
  onComplete: (result: QRResult) => void
}

export interface QRResult {
  type: 'address' | 'invoice' | 'faucet'
  network?: number
  publicKey?: string
  tokenAddress?: string
  contractAddress?: string
  amount?: BigNumber
  nonce?: number
}

export default class QRScannerScreen extends PureComponent {
  params = navigation.getCurrentScreenParams<QRScannerScreenParams>()

  isAlreadyScanning = false

  codeScanned = data => {
    if (this.isAlreadyScanning) return

    this.isAlreadyScanning = true
    setTimeout(() => (this.isAlreadyScanning = false), 750)

    let scannedString: string = data.data

    console.log('scanned string', scannedString)

    if (scannedString.slice(0, 9) === 'ethereum:') {
      scannedString = scannedString.slice(9)
    }

    if (scannedString.length === 42 && scannedString.slice(0, 2) === '0x') {
      try {
        const address = web3.utils.toChecksumAddress(scannedString)
        this.closeSuccess({ type: 'address', publicKey: address })
      } catch {
        logError(ErrorEvents.QR_SCAN_ERROR, { type: 'Invalid address', address: scannedString })
      }
    } else if (scannedString.indexOf('liquidtoken_') > -1) {
      this.params.onComplete({
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

        this.closeSuccess(result)
      } catch (error) {
        console.log('Invoice parsing error', error)
        logError(ErrorEvents.QR_SCAN_ERROR, { type: 'Invalid invoice', invoice: scannedString })
      }
    }
  }

  closeSuccess = (result: QRResult) => {
    console.log('result', result)
    navigation.goBack()
    this.params.onComplete(result)
  }

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
          this.params.onComplete({ type: 'address', publicKey: null })
          QRreader(path)
            .then(data => {
              let scannedString = data
              if (scannedString.slice(0, 9) === 'ethereum:') {
                scannedString = scannedString.slice(9)
              }

              if (scannedString.length === 42 && scannedString.slice(0, 2) === '0x') {
                try {
                  const address = web3.utils.toChecksumAddress(scannedString)
                  this.closeSuccess({ type: 'address', publicKey: address })
                } catch {
                  logError(ErrorEvents.QR_SCAN_ERROR, {
                    type: 'Invalid address',
                    address: scannedString,
                  })
                }
              } else if (scannedString.indexOf('liquidtoken_') > -1) {
                this.closeSuccess({
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

                  this.closeSuccess(result)
                } catch (error) {
                  console.log('Invoice parsing error', error)
                  logError(ErrorEvents.QR_SCAN_ERROR, {
                    type: 'Invalid invoice',
                    invoice: scannedString,
                  })
                }
              }
            })
            .catch(e => {
              console.log(e)
            })
        }
      }
    })
  }

  componentDidMount() {
    // if (__DEV__) {
    //   // const data = { data: '0x54a7C8d851fE7dacD527B5bf9c6ee8d15F1844C1' }
    //   const data = { data: 'LQI4|0x6410346d8Fbedbd928b8DbDaffe921d38660914f|0xA9F86DD014C001Acd72d5b25831f94FaCfb48717|1^18' }
    //   setTimeout(() => this.codeScanned(data), 250)
    // }
  }

  render() {
    return (
      <View style={globalStyles.flexOne} testID="QRScannerScreen">
        <RNCamera
          style={globalStyles.flexOne}
          androidCameraPermissionOptions={permissionDialogTexts}
          onBarCodeRead={this.codeScanned}
          barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
          captureAudio={false}
        />

        <Image source={qrScanGuides} style={styles.guides} />

        <View style={styles.closeButton}>
          <TouchableOpacity onPress={navigation.goBack} hitSlop={bigHitSlop} activeOpacity={0.5}>
            <Ionicons name="ios-close-circle-outline" style={styles.closeIcon} />
          </TouchableOpacity>
        </View>
        <View style={styles.scanImageButton}>
          <TouchableOpacity style={styles.buttonStyle} onPress={this.scanQRFromAlbum}>
            <Text style={styles.textStyle}>Scan QR code using Photo Album</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

const permissionDialogTexts = {
  title: I18n.t('permission-camera'),
  message: I18n.t('permission-camera-message'),
}

const styles: any = {
  closeButton: {
    position: 'absolute',
    left: 5,
    top: statusBarHeight,
    padding: 20,
  },
  closeIcon: { fontSize: 40, color: '#7366ff' },
  scanImageButton: {
    fontSize: 40,
    color: '#7366ff',
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
  },
  guides: {
    position: 'absolute',
    top: deviceHeight / 2 - deviceWidth * 0.3,
    alignSelf: 'center',
    width: deviceWidth * 0.6,
    height: deviceWidth * 0.6,
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
