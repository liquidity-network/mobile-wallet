import React, { PureComponent } from 'react'
import { TouchableOpacity, ViewStyle, TouchableOpacityProps } from 'react-native'
import Feather from 'react-native-vector-icons/Feather'

import { mediumHitSlop, WHITE } from 'globalStyles'

interface Props {
  onPress: () => void
  iconStyle?: ViewStyle
}

export default class BackButton extends PureComponent<Props & TouchableOpacityProps> {
  render() {
    const { iconStyle, ...props } = this.props
    return (
      <TouchableOpacity activeOpacity={0.7} hitSlop={mediumHitSlop} {...props}>
        <Feather name="chevron-left" style={[iconStyles, iconStyle]} />
      </TouchableOpacity>
    )
  }
}

const iconStyles = { fontSize: 27, color: WHITE, backgroundColor: 'transparent' }
