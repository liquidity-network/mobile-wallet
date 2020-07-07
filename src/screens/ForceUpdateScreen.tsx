import React, { PureComponent } from 'react'
import { Image, Text, Linking } from 'react-native'

import Header from './shared/Header'
import { sadFaceImage } from '../../assets/images'
import Button from '../ui/Button'
import { deviceHeight, deviceWidth, Grotesk, isIos, WHITE } from '../globalStyles'

export default class ForceUpdateScreen extends PureComponent {
  goToStore = () =>
    Linking.openURL(
      isIos
        ? 'itms-apps://itunes.apple.com/us/app/apple-store/id1395924630?mt=8'
        : 'market://details?id=com.liquiditynetwork.wallet',
    )

  render() {
    return (
      <>
        <Header title="Update application" transparent noBackButton />

        <Image style={styles.image} source={sadFaceImage} />

        <Text style={styles.message}>
          To conform with latest operator's software, application need to be upgraded
        </Text>

        <Button
          style={styles.button}
          text={isIos ? 'Open in AppStore' : 'Open in Google Play'}
          onPress={this.goToStore}
        />
      </>
    )
  }
}

const IMAGE_WIDTH = deviceWidth * 0.275
const IMAGE_HEIGHT = (IMAGE_WIDTH / 890) * 500
const styles: any = {
  image: {
    marginTop: deviceHeight * 0.15,
    alignSelf: 'center',
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
  },
  message: {
    marginTop: deviceHeight * 0.075,
    paddingHorizontal: deviceWidth * 0.15,
    textAlign: 'center',
    fontFamily: Grotesk,
    fontSize: 16,
    color: WHITE,
  },
  button: { marginTop: deviceHeight * 0.06, width: 300, alignSelf: 'center' },
}
