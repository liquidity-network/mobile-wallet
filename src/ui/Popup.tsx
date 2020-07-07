import React, { createRef, PureComponent } from 'react'
import {
  View, Animated, StyleSheet, ViewStyle, RegisteredStyle, Easing,
} from 'react-native' // prettier-ignore
import { TapGestureHandler, State } from 'react-native-gesture-handler'

import navigation from 'services/navigation'
import Tweenable from './Tweenable'
import { BLACK, deviceHeight, globalStyles } from 'globalStyles'

interface Props {
  containerStyle: RegisteredStyle<ViewStyle>
  animationHeight?: number
}

export default class Popup extends PureComponent<Props> {
  bgRef = createRef<Tweenable>()

  popupRef = createRef<Tweenable>()

  active = false

  componentDidMount() {
    this.active = true
  }

  close = () => {
    if (this.active) {
      this.active = false
      this.bgRef.current.animate({ name: 'bgOut', onComplete: navigation.goBack })
      this.popupRef.current.animate({ name: 'out' })
    }
  }

  onBackgroundPress = event => event.nativeEvent.state === State.BEGAN && this.close()

  render() {
    return (
      <View style={StyleSheet.absoluteFillObject}>
        <TapGestureHandler onHandlerStateChange={this.onBackgroundPress}>
          <View style={globalStyles.flexOne}>
            <Tweenable
              style={styles.background}
              tweens={[
                { property: 'opacity', from: 0, to: 0.7 },
                {
                  name: 'bgOut',
                  type: Animated.timing,
                  property: 'opacity',
                  from: 0.7,
                  to: 0,
                  config: { duration: 275 },
                  autoStart: false,
                },
              ]}
              ref={this.bgRef}
            />
          </View>
        </TapGestureHandler>

        <Tweenable
          style={this.props.containerStyle}
          tweens={[
            {
              property: 'translateY',
              from: this.props.animationHeight || deviceHeight + 100,
              to: 0,
              type: Animated.timing,
              config: {
                duration: 300,
                easing: Easing.bezier(0.2833, 0.99, 0.31833, 0.99),
              },
            },
            {
              name: 'out',
              type: Animated.timing,
              property: 'translateY',
              from: 0,
              to: this.props.animationHeight || deviceHeight + 100,
              config: { duration: 275 },
              autoStart: false,
            },
          ]}
          ref={this.popupRef}
        >
          {this.props.children}
        </Tweenable>
      </View>
    )
  }
}

const styles: any = {
  background: { ...StyleSheet.absoluteFillObject, backgroundColor: BLACK },
}
