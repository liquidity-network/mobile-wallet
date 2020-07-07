import { createStackNavigator, createAppContainer } from 'react-navigation'

import RootSwitch from './RootSwitch'
import PickerPopup from 'ui/PickerPopup'
import QRScannerScreen from 'screens/QRScannerScreen'
import ReceiveMoneyPopup from 'screens/popups/ReceiveMoneyPopup'
import NoConnectionScreen from 'screens/NoConnectionScreen'
import ThrottleResolvePopup from 'screens/popups/ThrottleResolvePopup'
import TransactionPopup from 'screens/popups/TransactionPopup'
import GasPricePopup from '../screens/popups/GasPricePopup'

export default createAppContainer(
  createStackNavigator(
    {
      RootSwitch,
      ReceiveMoneyPopup,
      QRScannerScreen,
      NoConnectionScreen,
      PickerPopup,
      ThrottleResolvePopup,
      TransactionPopup,
      GasPricePopup,
    },
    {
      mode: 'modal',
      headerMode: 'none',
      transparentCard: true,
      transitionConfig: () => ({
        transitionSpec: { duration: 0 },
        screenInterpolator: () => undefined,
        containerStyle: { backgroundColor: 'transparent' },
      }),
    },
  ),
)
