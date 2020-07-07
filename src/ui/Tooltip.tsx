import React, { PureComponent } from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import EvilIcons from 'react-native-vector-icons/EvilIcons'

import { ACTIVE_COLOR, BG_COLOR, Grotesk, mediumHitSlop, WHITE } from 'globalStyles'

interface Props {
  text: string
}

interface State {
  isToggled: boolean
}

export default class Tooltip extends PureComponent<Props, State> {
  state: State = { isToggled: false }

  toggle = () => this.setState({ isToggled: !this.state.isToggled })

  render() {
    return (
      <TouchableOpacity hitSlop={mediumHitSlop} activeOpacity={0.8} onPressIn={this.toggle}>
        <EvilIcons name="question" color={ACTIVE_COLOR} size={16} />

        {this.state.isToggled && (
          <View style={styles.container}>
            <Text style={styles.text}>{this.props.text}</Text>
          </View>
        )}
      </TouchableOpacity>
    )
  }
}

const styles: any = {
  container: {
    position: 'absolute',
    bottom: 20,
    width: 180,
    backgroundColor: BG_COLOR,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'center',
  },
  text: { fontFamily: Grotesk, fontSize: 11, color: WHITE },
}
