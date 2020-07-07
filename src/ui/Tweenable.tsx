import React, { PureComponent } from 'react'
import { Animated } from 'react-native'

const translateProperties = [
  'perspective',
  'rotate',
  'rotateX',
  'rotateY',
  'rotateZ',
  'scale',
  'scaleX',
  'scaleY',
  'skewX',
  'skewY',
  'translateX',
  'translateY',
]

interface Tween {
  name?: string
  type?
  config?
  property: string
  from?: number | string
  to: number | string
  value?
  interpolated?: boolean
  autoStart?: boolean
  onCompleteReset?: boolean
  active?: boolean
}

interface Props {
  tweens: Tween[]
  style?
  pointerEvents?: 'none' | 'box-none'
}

interface State {
  animatedStyles: Array<{}>
}

export default class Tweenable extends PureComponent<Props, State> {
  state: State = { animatedStyles: [] }

  tweens: Tween[] = []

  constructor(props) {
    super(props)

    // Animations are processed only before component mount, otherwise
    // adjusting animations props will lead to ruining current animations state
    this.tweens = props.tweens.map(t => ({
      name: t.name || 'default',
      type: t.type || Animated.spring,
      config: t.config || {},
      property: t.property,
      from: t.from,
      to: t.to,
      autoStart: t.autoStart === undefined ? true : t.autoStart,
      onCompleteReset: t.onCompleteReset,
      value: new Animated.Value(typeof t.from === 'string' ? 0 : t.from),
      interpolated: typeof t.from === 'string',
      active: false,
    }))
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount() {
    this.tweens.forEach(({ name, autoStart }) => autoStart && this.animate({ name }))
  }

  calculateAnimatedStyles() {
    const animatedStyles: Array<{}> = []

    this.tweens.forEach((tween: Tween) => {
      if (tween.active) {
        const styleValue = tween.interpolated
          ? tween.value.interpolate({
              inputRange: [0, 1],
              outputRange: [tween.from, tween.to],
            })
          : tween.value

        animatedStyles.push(
          translateProperties.includes(tween.property)
            ? { transform: [{ [tween.property]: styleValue }] }
            : { [tween.property]: styleValue },
        )
      }
    })

    this.setState({ animatedStyles })
  }

  animate({ name = 'default', reversed = false, onComplete = null } = {}) {
    const animation = this.tweens.find(t => t.name === name)

    if (animation) {
      const { type, from, to, value, config, interpolated } = animation

      animation.active = true
      this.calculateAnimatedStyles()

      value.setValue(reversed ? (interpolated ? 1 : to) : interpolated ? 0 : from)

      type(value, {
        toValue: reversed ? (interpolated ? 0 : from) : interpolated ? 1 : to,
        useNativeDriver: true,
        ...config,
      }).start(({ finished }) => {
        if (finished) {
          animation.active = false

          if (animation.onCompleteReset) this.calculateAnimatedStyles()

          onComplete && onComplete()
        }
      })
    } else {
      throw Error('Animation is not found')
    }
  }

  render() {
    return (
      <Animated.View
        style={[this.props.style, ...this.state.animatedStyles]}
        pointerEvents={this.props.pointerEvents}
      >
        {this.props.children}
      </Animated.View>
    )
  }
}
