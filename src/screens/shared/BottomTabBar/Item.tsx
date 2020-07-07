import React, { PureComponent } from 'react'
import { View, Text, TouchableWithoutFeedback, Animated } from 'react-native'

import {
  GREY, Grotesk, GroteskBold, IcoMoon, isIos, isIphoneX, ORANGE, smallHitSlop, WHITE,
} from 'globalStyles' // prettier-ignore
import { BOTTOM_TOOLBAR_HEIGHT } from './constants'

interface Props {
  title: string
  icon: string
  active: boolean
  onPress: () => void
  unseenTransactions?: number
  testID?: string
}

export default class BottomTabBarItem extends PureComponent<Props> {
  scale = new Animated.Value(0.3)

  opacity = this.scale.interpolate({
    inputRange: [0.3, 0.3001, 1.1, 1.3],
    outputRange: [0, 0.1, 0.35, 0],
  })

  onPressIn = () =>
    Animated.timing(this.scale, {
      duration: 350,
      toValue: 1.3,
      useNativeDriver: true,
    }).start(() => this.scale.setValue(0.3))

  render() {
    const { icon, active, onPress, testID } = this.props
    return (
      <TouchableWithoutFeedback
        hitSlop={smallHitSlop}
        disabled={active}
        onPress={onPress}
        onPressIn={this.onPressIn}
      >
        <View style={styles.button} testID={testID} pointerEvents="box-only">
          <IcoMoon name={icon} size={38} style={styles.icon} color={active ? ORANGE : GREY} />

          <Text style={[styles.title, active && styles.active]}>{this.props.title}</Text>

          {this.props.unseenTransactions != null && this.props.unseenTransactions > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{this.props.unseenTransactions}</Text>
            </View>
          )}

          <Animated.View
            style={[styles.fx, { transform: [{ scale: this.scale }], opacity: this.opacity }]}
          />
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

const styles: any = {
  button: {
    height: BOTTOM_TOOLBAR_HEIGHT,
    paddingBottom: isIphoneX ? 12 : 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'visible',
  },
  icon: { top: 6 },
  title: { paddingBottom: 6, fontFamily: Grotesk, fontSize: 10, color: GREY },
  active: { color: ORANGE },
  badge: {
    position: 'absolute',
    top: 3,
    right: 11,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { left: isIos ? 0.5 : undefined, fontFamily: GroteskBold, fontSize: 12, color: WHITE },
  fx: {
    position: 'absolute',
    top: -10,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: WHITE,
    opacity: 0,
  },
}
