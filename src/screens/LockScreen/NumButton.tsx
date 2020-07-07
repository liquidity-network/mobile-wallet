import React, { PureComponent } from 'react'
import { View, Text, Animated, Easing } from 'react-native'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'

import { deviceHeight, Grotesk, WHITE } from 'globalStyles'

interface Props {
  digit: string
  addDigit: (digit: string) => void
  testID?: string
}

export default class PinLockViewNumButton extends PureComponent<Props> {
  scale = new Animated.Value(0)

  opacity = this.scale.interpolate({
    inputRange: [0, 0.001, 1, 1.2],
    outputRange: [0, 0.1, 0.4, 0],
  })

  addDigit = () => {
    Animated.timing(this.scale, {
      duration: 350,
      toValue: 1.2,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start(() => this.scale.setValue(0))

    this.props.addDigit(this.props.digit)
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableWithoutFeedback onPressIn={this.addDigit} testID={this.props.testID}>
          <View style={styles.button} pointerEvents="box-only">
            <Text style={styles.text}>{this.props.digit}</Text>
          </View>
        </TouchableWithoutFeedback>

        <Animated.View
          style={[styles.fx, { transform: [{ scale: this.scale }], opacity: this.opacity }]}
          pointerEvents="none"
        />
      </View>
    )
  }
}

const styles: any = {
  container: {
    marginVertical: deviceHeight * 0.0075,
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  fx: {
    position: 'absolute',
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: WHITE,
  },
  button: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#182437',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontFamily: Grotesk, fontSize: 28, color: WHITE },
}
