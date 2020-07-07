import navigation from 'services/navigation'
import { PickerPopupParams } from 'ui/PickerPopup'
import { QRScannerScreenParams } from 'screens/QRScannerScreen'
import { ContactDetailsScreenParams } from 'screens/contacts/ContactDetailsScreen'
import { ConversionScreenParams } from 'screens/ConversionScreen'
import { ReceiveMoneyPopupParams } from 'screens/popups/ReceiveMoneyPopup'
import { ThrottleResolvePopupParams } from 'screens/popups/ThrottleResolvePopup'
import { SendScreenParams } from 'screens/SendScreen'
import { RestoreWalletScreenParams } from 'screens/RestoreWalletScreen'
import { SelectAuthMethodScreenParams } from 'screens/SelectAuthMethodScreen'
import { CreatePaymentRequestScreenParams } from 'screens/CreatePaymentRequestScreen'
import { LockScreenParams } from 'screens/LockScreen'
import { TransactionPopupParams } from '../screens/popups/TransactionPopup'

export const openHomeScreen = () => navigation.navigate('HomeScreen')
export const openSettingsScreen = () => navigation.navigate('SettingsScreen')
export const openAboutSettingsScreen = () => navigation.navigate('AboutSettingsScreen')
export const openLanguageSettingsScreen = () => navigation.navigate('LanguageSettingsScreen')
export const openSLAScreen = () => navigation.navigate('SLAScreen')
export const openHubMonitoringScreen = () => navigation.navigate('HubMonitoringScreen')
export const openHubSettingsScreen = () => navigation.navigate('HubSettingsScreen')
export const openNoConnectionScreen = () => navigation.navigate('NoConnectionScreen')
export const openRootResolver = () => navigation.navigate('RootResolver', { rnd: Math.random() })
export const openContactsScreen = () => navigation.navigate('ContactsScreen')
export const openCreateContactScreen = () => navigation.navigate('CreateContactScreen')
export const openDeliveryChallengeScreen = () => navigation.navigate('DeliveryChallengeScreen')
export const openTransactionsScreen = () => navigation.navigate('TransactionsScreen')
export const openOnBoardingScreen = () => navigation.navigate('OnBoardingScreen')
export const openWelcomeScreen = () => navigation.navigate('WelcomeScreen')
export const openTokenSelectionScreen = () => navigation.navigate('TokenSelectionScreen')
export const openTermsAcceptanceScreen = () => navigation.navigate('TermsAcceptanceScreen')
export const openForceUpdateScreen = () => navigation.navigate('ForceUpdateScreen')
export const openTermsScreen = () => navigation.navigate('TermsScreen')
export const openPrivacyScreen = () => navigation.navigate('PrivacyScreen')

export const openPickerPopup = (params: PickerPopupParams) =>
  navigation.navigate('PickerPopup', params)

export const openQRScanScreen = (params: QRScannerScreenParams) =>
  navigation.navigate('QRScannerScreen', params)

export const openContactDetailsScreen = (params: ContactDetailsScreenParams) =>
  navigation.navigate('ContactDetailsScreen', params)

export const openConversionScreen = (params: ConversionScreenParams = { tokenFrom: null }) =>
  navigation.navigate('ConversionScreen', params)

export const openLockScreen = (params: LockScreenParams, isMainStack?: boolean) =>
  navigation.navigate(isMainStack ? 'LockMainScreen' : 'LockScreen', params)

export const openBackupPassphraseScreen = () => {
  const onComplete = () => navigation.replace('BackupPassphraseScreen')

  openLockScreen({ onComplete, showBackButton: true }, true)
}

export const openGasPricePopup = () => navigation.navigate('GasPricePopup')

export const openReceiveMoneyPopup = (params: ReceiveMoneyPopupParams = { token: null }) =>
  navigation.navigate('ReceiveMoneyPopup', params)

export const openThrottleResolvePopup = (params: ThrottleResolvePopupParams) =>
  navigation.navigate('ThrottleResolvePopup', params)

export const openTransactionPopup = (params: TransactionPopupParams) =>
  navigation.navigate('TransactionPopup', params)

export const openSendScreen = (params: SendScreenParams = {}) =>
  navigation.navigate('SendScreen', params)

export const openRestoreWalletScreen = (params: RestoreWalletScreenParams) =>
  navigation.navigate('RestoreWalletScreen', params)

export const openSelectAuthMethodScreen = (params: SelectAuthMethodScreenParams) =>
  navigation.navigate('SelectAuthMethodScreen', params)

export const openCreatePaymentRequestScreen = (params: CreatePaymentRequestScreenParams) =>
  navigation.navigate('CreatePaymentRequestScreen', params)
