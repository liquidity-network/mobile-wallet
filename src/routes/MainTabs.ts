import { createBottomTabNavigator } from 'react-navigation'

import BottomTabBar from 'screens/shared/BottomTabBar'
import SettingsScreen from 'screens/settings/SettingsScreen'
import HomeScreen from 'screens/HomeScreen'
import ConversionScreen from 'screens/ConversionScreen'
import TransactionsScreen from 'screens/TransactionsScreen'

export default createBottomTabNavigator(
  {
    HomeScreen,
    SettingsScreen,
    ConversionScreen,
    TransactionsScreen,
  },
  {
    tabBarComponent: BottomTabBar,
  },
)
