import React, { PureComponent } from 'react'
import { Image, StyleSheet, ImageProps } from 'react-native'

import { deviceHeight, deviceWidth } from 'globalStyles'

export default class Background extends PureComponent<ImageProps> {
  render() {
    return <Image {...this.props} style={imageStyle} />
  }
}

const imageStyle: any = {
  ...StyleSheet.absoluteFillObject,
  width: deviceWidth,
  height: deviceHeight,
  resizeMode: 'cover',
}
