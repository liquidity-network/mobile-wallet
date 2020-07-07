import React, { PureComponent } from 'react'
import { TouchableOpacity } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

import { smallHitSlop, WHITE } from 'globalStyles'

interface Props {
  value: boolean
  onChange: (value: boolean) => void
  color?: string
  testID?: string
}

export default class CheckBox extends PureComponent<Props> {
  onChange = () => this.props.onChange(!this.props.value)

  render() {
    return (
      <TouchableOpacity
        onPress={this.onChange}
        hitSlop={smallHitSlop}
        activeOpacity={0.7}
        testID={this.props.testID}
      >
        <MaterialCommunityIcons
          name={this.props.value ? 'checkbox-marked-outline' : 'checkbox-blank-outline'}
          size={26}
          color={this.props.color || WHITE}
        />
      </TouchableOpacity>
    )
  }
}
