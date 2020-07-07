import React, { PureComponent } from 'react'
import { View } from 'react-native'
import Feather from 'react-native-vector-icons/Feather'

import { BG_COLOR, RED, statusBarHeight } from 'globalStyles'

export default class NoInternetIndicator extends PureComponent {
  render() {
    return (
      <View style={styles.container}>
        <Feather name="wifi-off" size={22} color={RED} />
      </View>
    )
  }
}

const styles: any = {
  container: {
    position: 'absolute',
    top: statusBarHeight + 8,
    right: 10,
    width: 40,
    height: 40,
    backgroundColor: BG_COLOR,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
}
