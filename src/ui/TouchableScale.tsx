import React, { PureComponent } from 'react'
import { Animated, ViewProps } from 'react-native'
import { TapGestureHandler, State } from 'react-native-gesture-handler'

import { mediumHitSlop } from 'globalStyles'

interface Props {
  onPress: () => void
}

export default class TouchableScale extends PureComponent<ViewProps & Props> {
  progress = new Animated.Value(0)

  scaleValue = this.progress.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [1, 1.25, 1],
  })

  onGesture = event => {
    if (event.nativeEvent.state === State.BEGAN) {
      Animated.timing(this.progress, {
        duration: 275,
        toValue: 1,
        useNativeDriver: true,
      }).start(() => this.progress.setValue(0))
    } else if (event.nativeEvent.state === State.ACTIVE) {
      this.props.onPress()
    }
  }

  render() {
    return (
      <TapGestureHandler onHandlerStateChange={this.onGesture} hitSlop={mediumHitSlop}>
        <Animated.View style={[this.props.style, { transform: [{ scale: this.scaleValue }] }]}>
          {this.props.children}
        </Animated.View>
      </TapGestureHandler>
    )
  }
}
