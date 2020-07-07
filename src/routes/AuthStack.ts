import { Animated } from 'react-native'
import { createStackNavigator } from 'react-navigation'

import WelcomeScreen from 'screens/WelcomeScreen'
import SelectAuthMethodScreen from 'screens/SelectAuthMethodScreen'
import RestoreWalletScreen from 'screens/RestoreWalletScreen'
import LockScreen from 'screens/LockScreen'

export default createStackNavigator(
  {
    WelcomeScreen,
    RestoreWalletScreen,
    SelectAuthMethodScreen,
    LockScreen,
  },
  {
    initialRouteName: 'WelcomeScreen',
    headerMode: 'none',
    transparentCard: true,
    transitionConfig: () => ({
      transitionSpec: {
        timing: Animated.spring,
        stiffness: 1000,
        damping: 500,
        mass: 3,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
        useNativeDriver: true,
      },
      screenInterpolator: ({ layout, position, scene }) => {
        const { index } = scene
        const { initWidth } = layout

        const translateX = position.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [initWidth * 0.75, 0, -initWidth * 0.75],
        })
        const opacity = position.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [0, 1, 0],
        })

        return { opacity, transform: [{ translateX }] }
      },
      containerStyle: { backgroundColor: 'transparent' },
    }),
  },
)
