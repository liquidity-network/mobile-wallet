import { createStackNavigator } from 'react-navigation'
import { StackViewStyleInterpolator } from 'react-navigation-stack'

import { WHITE } from 'globalStyles'
import MainTabs from './MainTabs'
import ConversionScreen from 'screens/ConversionScreen'
import SettingsScreen from 'screens/settings/SettingsScreen'
import HubSettingsScreen from 'screens/settings/HubSettingsScreen'
import LanguageSettingsScreen from 'screens/settings/LanguageSettingsScreen'
import AboutSettingsScreen from 'screens/settings/AboutSettingsScreen'
import BackupPassphraseScreen from 'screens/BackupPassphraseScreen'
import HubMonitoringScreen from 'screens/settings/HubMonitoringScreen'
import BackupPassphraseVerifyScreen from 'screens/BackupPassphraseVerifyScreen'
import ContactsScreen from 'screens/contacts/ContactsScreen'
import CreateContactScreen from 'screens/contacts/CreateContactScreen'
import ContactDetailsScreen from 'screens/contacts/ContactDetailsScreen'
import TokenSelectionScreen from 'screens/TokenSelectionScreen'
import SendScreen from 'screens/SendScreen'
import CreatePaymentRequestScreen from 'screens/CreatePaymentRequestScreen'
import DeliveryChallengeScreen from 'screens/DeliveryChallengeScreen'
import SLAScreen from 'screens/settings/SLAScreen'
import LockScreen from 'screens/LockScreen'
import TermsScreen from '../screens/settings/TermsScreen'
import PrivacyScreen from '../screens/settings/PrivacyScreen'

export default createStackNavigator(
  {
    MainTabs,
    ContactsScreen,
    CreateContactScreen,
    ConversionScreen,
    ContactDetailsScreen,
    SendScreen,
    SettingsScreen,
    HubSettingsScreen,
    LanguageSettingsScreen,
    AboutSettingsScreen,
    TermsScreen,
    PrivacyScreen,
    SLAScreen,
    TokenSelectionScreen,
    BackupPassphraseScreen,
    BackupPassphraseVerifyScreen,
    HubMonitoringScreen,
    DeliveryChallengeScreen,
    CreatePaymentRequestScreen,
    LockMainScreen: { screen: LockScreen },
  },
  {
    initialRouteName: 'MainTabs',
    headerMode: 'none',
    cardStyle: { backgroundColor: WHITE },
    defaultNavigationOptions: { gesturesEnabled: false },
    transitionConfig: () => ({ screenInterpolator: StackViewStyleInterpolator.forHorizontal }),
  },
)
