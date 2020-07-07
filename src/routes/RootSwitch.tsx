/*
  Switcher between Main and Auth stacks
 */
import React from 'react'
import createAnimatedSwitchNavigator from 'react-navigation-animated-switch'
import { Transition } from 'react-native-reanimated'

import RootResolver from './RootResolver'
import MainStack from './MainStack'
import AuthStack from './AuthStack'
import TermsAcceptanceScreen from 'screens/TermsAcceptanceScreen'
import OnBoardingScreen from 'screens/OnBoardingScreen'
import ForceUpdateScreen from '../screens/ForceUpdateScreen'

export default createAnimatedSwitchNavigator(
  {
    RootResolver,
    MainStack,
    AuthStack,
    TermsAcceptanceScreen,
    OnBoardingScreen,
    ForceUpdateScreen,
  },
  {
    transition: (
      <Transition.Together>
        <Transition.Together>
          <Transition.Out type="fade" durationMs={100} interpolation="easeOut" />
        </Transition.Together>
        <Transition.Together>
          <Transition.In type="slide-right" durationMs={400} interpolation="easeOut" />
          <Transition.In type="fade" durationMs={200} delayMs={200} interpolation="easeOut" />
        </Transition.Together>
      </Transition.Together>
    ),
    initialRouteName: 'RootResolver',
  },
)
