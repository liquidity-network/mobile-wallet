import React, { PureComponent } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons'

import { ACTIVE_COLOR, GREY } from 'globalStyles'

interface Props {
  enabled?: boolean
  color?: string
}

export default class RadioIcon extends PureComponent<Props> {
  render() {
    return (
      <Ionicons
        name={this.props.enabled ? 'md-radio-button-on' : 'ios-radio-button-off'}
        size={22}
        color={this.props.enabled ? this.props.color || ACTIVE_COLOR : GREY}
      />
    )
  }
}
