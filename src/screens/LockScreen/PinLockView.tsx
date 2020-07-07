import React, { Component } from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native'
import I18n from 'i18n-js'
import Entypo from 'react-native-vector-icons/Entypo'

import { pinDeleteIcon } from '../../../assets/images'
import {
  BG_COLOR, deviceHeight, deviceWidth, globalStyles, Grotesk, mediumHitSlop, RED, SMALL_DEVICE, WHITE,
} from 'globalStyles' // prettier-ignore
import BackButton from 'ui/BackButton'
import navigation from 'services/navigation'
import Tweenable from 'ui/Tweenable'
import NumButton from './NumButton'

export interface PinLockScreenParams {
  onComplete: Function
  isSetup?: boolean
  showBackButton?: boolean
}

interface Props {
  lockedUntil: number
  setup: boolean
  showBackButton: boolean
  addDigit: (digit: string) => void
  deleteDigit: () => void
  currentPin: string
  incorrectPin: boolean
  confirmingPin: boolean
}

export default class PinLockView extends Component<Props> {
  renderDot(i) {
    return (
      <View style={styles.dotContainer} key={i}>
        <Entypo name="controller-record" style={styles.dot} />
        {this.props.incorrectPin && <Entypo name="controller-record" style={styles.dotIncorrect} />}

        {i < this.props.currentPin.length && (
          <Tweenable
            tweens={[
              { name: 'opacity', property: 'opacity', from: 0, to: 1 },
              { name: 'scale', property: 'scale', from: 0, to: 1 },
            ]}
            style={styles.dotContainer}
          >
            <Entypo name="controller-record" style={styles.dotFilled} />
          </Tweenable>
        )}
      </View>
    )
  }

  render() {
    const { confirmingPin, incorrectPin } = this.props
    return (
      <View style={styles.container} testID="PinLockScreen">
        <View style={styles.topBlock} pointerEvents="none">
          <Text style={styles.title} testID="PinLockScreenTopText">
            {!this.props.setup
              ? I18n.t('enter-pass-code')
              : confirmingPin || incorrectPin
              ? I18n.t('verify-pass-code')
              : I18n.t('create-pass-code')}
          </Text>

          <Text style={styles.error} testID="PinLockScreenErrorText">
            {this.props.lockedUntil > Date.now()
              ? "You've entered incorrect PIN for 5 times,\nwait a bit to try again..."
              : incorrectPin
              ? I18n.t('pin-doesnt-match')
              : ''}
          </Text>

          <View style={styles.dots}>{[0, 1, 2, 3, 4, 5].map((_v, i) => this.renderDot(i))}</View>
        </View>

        {this.props.showBackButton && (
          <BackButton style={globalStyles.backButton} onPress={navigation.goBack} />
        )}

        <View style={styles.numButtonsContainer}>
          <View style={styles.buttons}>
            {Array(9)
              .fill(null)
              .map((_v, i) => (
                <NumButton
                  key={i}
                  digit={(i + 1).toString()}
                  addDigit={this.props.addDigit}
                  testID={'PinButton' + (i + 1)}
                />
              ))}
          </View>

          <View style={styles.bottomButtons}>
            <NumButton digit="0" addDigit={this.props.addDigit} />

            <TouchableOpacity
              onPress={this.props.deleteDigit}
              style={styles.deleteButton}
              hitSlop={mediumHitSlop}
              activeOpacity={0.7}
            >
              <Image source={pinDeleteIcon} style={styles.deleteIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }
}

const styles: any = {
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: BG_COLOR },
  topBlock: {
    width: deviceWidth,
    height: 117,
    marginBottom: SMALL_DEVICE ? 0 : deviceHeight * 0.04,
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
    fontFamily: Grotesk,
    fontSize: 21,
    letterSpacing: 0.2,
    color: WHITE,
  },
  error: {
    textAlign: 'center',
    fontFamily: Grotesk,
    fontSize: 16,
    letterSpacing: 0.2,
    color: RED,
  },
  dots: {
    position: 'absolute',
    bottom: 0,
    width: 196,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dotContainer: { width: 16, height: 16 },
  dot: { position: 'absolute', fontSize: 15, color: '#725f86' },
  dotFilled: {
    position: 'absolute',
    left: -1,
    top: -1,
    fontSize: 17,
    color: WHITE,
  },
  dotIncorrect: {
    position: 'absolute',
    left: -1,
    top: -1,
    fontSize: 17,
    color: RED,
  },
  numButtonsContainer: { paddingTop: 30, paddingLeft: 10, paddingRight: 10, paddingBottom: 10 },
  buttons: {
    width: 286,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    overflow: 'visible',
  },
  bottomButtons: { width: 286, height: 82, alignItems: 'center', overflow: 'visible' },
  deleteButton: { position: 'absolute', bottom: 25, left: 222 },
  deleteIcon: { width: 26, height: 22 },
}
