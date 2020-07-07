# Changelog
All notable changes to this project will be documented in this file.

## [Unreleased]
- Revive Android e2e tests(couple of tests doesn't work on Android, but still)

## [1.27.2]
- UI update
  Invalid date on commit chain transaction
  GWei price update on slider
## [1.27.1]
- Modify deposit logic for ETH

## [1.27.0]
- New Nocust version integration

## [1.26.2]
- Fix app crash with no internet connection

## [1.26.1]
- Prettify backup phrase screen
- Scan QR code from Album feature
- Make Bottom Menubar above of keyboard
- Show Eth, fEth coins

## [1.26.0]
- Add qr code scan ability from photo album

## [1.25.4] - 2020-03-07
- Fix UI issues

## [1.25.3] - 2019-12-04
- Upgrade `NetInfo` dependency
- Upgrade `react-native-camera` dependency

## [1.25.2] - 2019-12-04
- Fix unit tests
- Display warning of transfers unavailability for mainnet hubs

## [1.25.1] - 2019-11-21
- Fixed crash due to `react-native-gesture-handler`
- Get back `Sentry`
- Use `@react-native-community/async-storage` dependency instead of deprecated one in RN core

## [1.25.0] - 2019-11-18
- Migration to RN `0.61.4`

## [1.24.4] - 2019-11-18
- Bump dev dependencies

## [1.24.3] - 2019-10-13
- Completely remove `Sentry` to check that it is not the cause of crashes

## [1.24.2] - 2019-10-13
- Fix regression on `getRawTokens` introduced in `1.24.1`

## [1.24.1] - 2019-10-07
- Fix duplicating tokens issue

## [1.24.0] - 2019-10-01
- Introduces `GasPricePopup` instead of `EditFeeScreen`, get rid of `gasLimit` property from redux state
- Bump `nocust-client@3.0.0-rc47`

## [1.23.0] - 2019-09-26
- Added `PrivacyScreen` and `TermsScreen` to Settings -> About
- Bump `nocust-client@3.0.0-rc44`
- Fixes popup background not being filled to full screen on rare Android devices

## [1.22.3] - 2019-09-23
- Fixed e2e test for `HomeScreen` and `SettingsScreen`
- Bump `nocust-client@3.0.0-rc41`, add `nocustManager.shutdown()`

## [1.22.2] - 2019-09-20
- `releaseDebug` => `beta` for Sentry to upload sourcemaps

## [1.22.1] - 2019-09-20
- Upgrade `Sentry` to 1.0

## [1.22.0] - 2019-09-19
- Add `ForceUpdateScreen`
- Fix ETH address validation bug
- Move faucet url info to realtime db
- Add XCHF icon

## [1.21.1] - 2019-09-17
- Fix duplicating tokens on `HomeScreen` in rare error condition
- Show just 6 decimals on transactions list screen

## [1.21.0] - 2019-09-17
- Fix reversed sorting order of transactions inside a day
- Change ingoing/outgoing transaction icons direction
- Copy button is visible for transfers only on `TransactionPopup`
- `nocust-client` bump to `3.0.0-rc37`

## [1.20.0] - 2019-09-04
- Fix `EditFeeScreen` crash
- Input ETH addresses are not case-sensitive anymore
- Initial analytics reimplementation

## [1.19.0] - 2019-09-02
- First iteration of `HomeScreen` redesign

## [1.18.0] - 2019-09-02
- Redesign of `TransactionsScreen` and `TransactionPopup`
- Get rid of `LayoutAnimation` on `HomeScreenToken` to avoid random animation/layout issues

## [1.17.3] - 2019-08-22
- Redesign of `SettingsScreen`
- Redesign of `AboutSettingsScreen`
- Fix notification icon on Android

## [1.17.2] - 2019-08-19
- Overall code improvements
- Merge `PinLockScreen` and `FingerLockScreen` into `LockScreen`

## [1.17.1] - 2019-08-13
- Internal test app on Android now has access to Limbo hub
- Hotfix to `ToTextInput` autocomplete not working on Android
- Fix not closing popup on background tap on Android, improvement to picker appear animation
- Fix absence of validation when switching type on `RestoreWalletScreen`

## [1.17.0] - 2019-08-13
- Make `liquidtoken_` QR codes more flexible
- Rework of contacts / more tight integration to `SendScreen`
- First iteration of transfer notifications implementation

## [1.16.7] - 2019-08-06
- Fix comma not appears on `TextInput`'s of some rare Samsung devices

## [1.16.6] - 2019-08-01
- Fix critical security issue when PIN code window can be easily dismissed on iOS
- Added e2e test for dismissing PIN code window with swipe, decreased e2e tests running time
- Optimization of batched transactions state update, covered by unit tests
- Fix usability issue with picking tokens on `ConversionScreen`

## [1.16.5] - 2019-07-26
- Upload .APK to hosting on production build

## [1.16.4] - 2019-07-26
- Error logging system calls fix
- `ConversionScreen` fixes
- Fetch all tokens in `updateHistory`

## [1.16.3] - 2019-07-25
- Fix navigation issue on incoming transaction notifications
- Dismiss snack when `ThrottleResolvePopup` being shown to correctly switch between hubs
- Fix incoming commit-chain transactions came from websocket did not store `round` and correct `timestamp`

## [1.16.2] - 2019-07-24
- Added `stack` to remote error logging information

## [1.16.1] - 2019-07-23
- `signWithPrivateKey` fix

## [1.16.0] - 2019-07-23
- Bump dev & production dependencies
- Fix e2e tests
- `ConversionScreen` improvements
- Added calls to new errors logging system

## [1.15.1] - 2019-07-16
- If wallet has been restored from passphrase, do not require backup passphrase
- Fix Android build icons ttf copying
- `ConversionScreen` improvements

## [1.15.0] - 2019-07-12
- Complete revamp of `ConversionScreen`
- Fix fetching token rates issue + added slack error notifications

## [1.14.0] - 2019-07-09
- Sign ToS and Privacy Policy on server
- Add `send` deep link with params corresponding `Invoice` interface
- Upgrade `liquidity-invoice-generation` to `3.0.0`
- Minor UX improvement for SLA buying screen

## [1.13.3] - 2019-07-02
- Support `,` as decimal separator
- Fix non 18 decimals digits tokens withdrawal
- Proper error handling of SLA buy operation
- Bump dev & production dependencies

## [1.13.2] - 2019-07-02
- Fix critical restore wallet issue

## [1.13.1] - 2019-07-01
- Fixed issues with invoice scanning
- Added correct on-chain invoices scanning
- Fix 3rd word of passphrase not being checked on backup procedure

## [1.13.0] - 2019-06-26
- Add cool message to share address feature
- Withdrawal time estimation text adjust
- Fix critical bug of incorrect validation on `fETH` withdrawal
- Cleanup of e2e tests 

## [1.12.5] - 2019-06-24
- Migrated to new invoice format

## [1.12.6] - 2019-06-19
- Urgent fix of faucet timeout

## [1.12.4] - 2019-06-19
- Fixed invoice, generated in app has been missing token address
- Invoice reader now converts to WEI for small amounts only for `fETH` token
- `roundStripZeros` now outputs `0.000001` notation contrary to previous `1e-6` notation
- On `SendScreen` when switching from `ETH`/`fETH` to another token, `WEI` currency switched to `ERC20`
- Lock of pin input screen for a minute after 3 failed attempts
- A bunch of code cleanups

## [1.12.3] - 2019-06-14
- Swap auth method selection and wallet creation
- Switch to error message text field from snack in `BackupPassphraseVerifyScreen`
- Get rid of `react-navigation-fluid-transition` and added new more prompt screen transitions
- Phone status bar styling is now consistent across app

## [1.12.2] - 2019-06-13
- `BottomTabBar` central button animation + gesture handler improvement
- Tap feedback of pin code buttons animation and gesture handler improvement
- Improved visual touch feedback of `BottomTabBar` items

## [1.12.1] - 2019-06-12
- When switching between hubs, null unread transactions count
- Add appearance animation to `SettingsScreen` menu items
- Migrated PIN code from redux store to keychain for better security

## [1.12.0] - 2019-06-11
- Conversion code minor cleanup
- Move from `AsyncStorage` to memory for `NOCUSTManager` caching
- Add `publicKey` to Sentry crash report
- Now wallet handles correctly tokens with decimals different from 18

## [1.11.0] - 2019-06-10
- Fix status of fetched in history commit-chain transactions - `approved` instead of `confirmed`
- Fix QR code scanning

## [1.10.1] - 2019-06-03
- Fix issues with keychain and fingerprint modules

## [1.10.0] - 2019-05-31
- Migration to RN `0.59.8`, rebuilding mobile projects infra from scratch

## [1.9.1] - 2019-05-27
- Fix bug of `ConversionScreen` bug after switching hubs
- Fix critical Sentry issue

## [1.9.0] - 2019-05-27
- Buying SLA screen implemented
- Add extra info to crash report
- Make tokens background slightly transparent on `HomeScreen`
- Now faucet can be of any activated token
- Adjust `SendScreen` carousel token background colors to `HomeScreen`
- Moved site & telegram links to `About` section inside settings screen
- Revert to previous API for tokens animation on `HomeScreen`

## [1.8.0] - 2019-05-21
- Added `approved` status to commit-chain transactions
- Reorder tokens on `HomeScreen`
- Adjust ETH / WEI auto-picker amount on invoice scanning
- Hub connection issues banner on `HomeScreen`
- Do not show `WEI` currency when sending tokens different from `(f)ETH`
- Add waiting snack for withdrawals/deposits
- Improve faucet logic & add rinkeby faucet
- Get rid of `rn-nodeify`

## [1.7.12] - 2019-05-19
- Open `HomeScreen` when switching hubs
- Added switching between hubs e2e tests
- Fix potential bug with keychain operations
- Bump dependencies and minor code improvements

## [1.7.11] - 2019-05-09
- Show banner to backup passphrase until it's done
- Fix nasty bug when app is not storing credentials to keystore in some cases
- Added e2e tests for backup passphrase banner
- Added some e2e tests for home screen
- Made fCOINS slightly lighter on HomeScreen

## [1.7.10] - 2019-05-07
- Added OnBoardingScreen smooth appear/disappear transitions via `react-native-reanimated`
- Fix bug when `fetchWithdrawalFee` was called when `nocustManager` was not initialized yet
- When switching between currencies on `SendScreen` and `CreatePaymentRequestScreen`, amount is being converted
- Auto select appropriate units WEI/ETH for invoices
- Fix rare animation bugs of tokens on `HomeScreen` by migrating to `react-native-reanimated` API
- Show meaningful error message when recipient address is not registered on commit-chain transfer
- When address is being pasted, cursor automatically being set to start for convenience
- Move from `TSLint` => to `ESLint`, consume brand new `eslint-config-liquidity`
- Fix wallet create/restore error handling
- Restore wallet button disabling on start of operation added
- Fix "Send funds" view button width in contact details
- Extend "Edit Gas" and "Copy" buttons hit area

## [1.7.9] - 2019-04-24
- Fix issue when USD was converted to WEI with decimals which resulted in failed transactions
- Migrate from `jest` to `mocha` for e2e tests
- Add running e2e tests before publishing to production on Android
- Redesigned error handling of all on-chain and commit-chain transactions, now we have failed popup if something went wrong
- Add waiting popups for challenge operations
- Show `Confirming` label instead of `0` on BLOCKS TO CONFIRM
- Fix `Close` button width regression on `CreatePaymentScreen`
- Fix `CopyButton` not working on address of `TransactionsScreen`

## [1.7.8] - 2019-04-22
- Critical bugfix of regression due to `nocust-client` upgrade

## [1.7.7] - 2019-04-19
- Update withdrawal and deposit according to new specs
- Add conversion limit label to `ConversionScreen`

## [1.7.6] - 2019-04-19
- Upgrade dev & main dependencies
- Fix `Explore` button not working on `TransactionsScreen` on iOS
- Add extra hint about spaces in passphrase
- Make TextInput full-height for easier press to focus
- Upgrade `nocust-client` to `2.0.3`
- Upload `.apk` file to hosting after production release

## [1.7.5] - 2019-04-17
- Fix blinking root resolver screen
- Fix crash on pressing disabled button on iOS
- Fix crash due to undefined `tokensMetadata.list` in `isCriticalDataPresent`
- Fix crash when token is not found on transactions screen, instead show `ERROR`
- Fix default test account, previous was compromised
- Fix withdrawal fee calculation

## [1.7.4] - 2019-04-12
- 1.7.2 Button disabled regression fixed
- Make application more offline-friendly
- OnBoardingScreen disappeared start button regression fix
- Fix OnBoardingScreen issue

## [1.7.3] - 2019-04-10
- 1.7.2 Button onPress regression fixed

## [1.7.2] - 2019-04-10
- Fixed bottom bar home screen highlighting
- More fancy button on Android
- Added restarting on language switch on iOS

## [1.7.1] - 2019-04-09
- Fixes seed phrase navigation bug
- Fixed invoice scanning bug
- Upgrade to `nocust-client@2.0`

## [1.7.0] - 2019-04-09
- Fix currency picker across different places
- Added Firebase cloud functions that fetch tokens rate

## [1.6.5] - 2019-04-04
- Move hubs and tokens information to firestore
- Fix pull-to-refresh indicator z-index

## [1.6.4] - 2019-04-01
- Fixed Face ID bug on iOS

## [1.6.3] - 2019-03-28
- Receive money popup now being opened without delays
- Fix create payment request navigation bug
- Fixed hit area of Skip button inside onboarding screen and close button on receive money popup
- Improvements to Touch/FaceID handling
- Increased maximum waiting for registration time on wallet creation

## [1.6.2] - 2019-03-27
- Use Rinkeby hub by default on staging and first in the list on production
- Now hub is initialized at wallet generation time
- Fixed e2e & unit tests

## [1.6.1] - 2019-03-26
- Fix Hubs listing bug on production

## [1.6.0] - 2019-03-25
- Upgrade `react-navgation` to `3`
- Fix bug inside `formatEthWithUnit`
- Faucets are for main net exclusively
- Extra hub init on wallet creation to register tokens in advance
- Upgrade to `nocust-client@1.1.1`
- Withdrawal requests are now confirmed only when confirmation transaction confirmed
- Added displaying `BLOCKS TO CONFIRM` to transaction info

## [1.5.1] - 2019-03-19
- Fetch transaction of just current and previous round
- Hide Limbo hub on production
- Add `isStaging` flag which if app's version is not production

## [1.5.0] - 2019-03-18
- Added upgrading of redux-persist storage mechanism
- Added DAI icon
- Fetch daily faucet for Rinkeby network only
- Update the balance of token when we received incoming commit-chain transaction
- Daily faucets are updated according to latest server-side
- Scanning QRs of faucet coins now works
- Fill invoice also from `+` => `Scan QR`

## [1.4.4] - 2019-03-15
- Fixed background => active state registering on Android bug

## [1.4.3] - 2019-03-15
- Reduce cooldown timer of inactive application to 15 seconds

## [1.4.2] - 2019-03-14
- Implemented Bugfender for cloud logging

## [1.4.1] - 2019-03-14
- Fixed withdrawal confirmation bug for ERC20 tokens
- Now invoice scanner fills WEI instead of ETH
- Always show non-rounded amount on transactions list screen
- Now app subscribes to all tokens' notifications instead of just ETH
- Pulling down now works with empty transactions list screen
- Delivery challenge list transactions are now current or previous round only

## [1.4.0] - 2019-03-13
- Fixes to TermsScreen
- Removed ETH from select tokens screen
- Added fTOKENS explanation
- Fix transaction time when history fetched
- Added Wipe Wallet feature

## [1.3.4] - 2019-03-08
- Fix to dates format of fetchHistory

## [1.3.3] - 2019-03-06
- Bump nocust-client version and add date to fetched transactions 

## [1.3.2] - 2019-03-05
- Fixed notifications bug

## [1.3.1] - 2019-03-05
- Add fetching transactions list on start up and on switching from background to foreground mode

## [1.3.0] - 2019-03-04
- New hubs and client library
- Rework of TermsScreen

## [1.2.0] - 2019-02-26
- Added fetching tokens and hubs info from external source instead of hard-coded values
- Added new hub switch page instead of old network switch

## [1.1.1] - 2019-02-21
- Do not show fee inside transaction for state update challenge
- Notifications of incoming transactions

## [1.1.0] - 2019-02-20
- New dedicated `DeliveryChallengeScreen` to initiate delivery challenge

## [1.0.2] - 2019-02-15
- Added `AboutSettingsScreen` with application version info
- Fixed wrong validation of keystore string

## [1.0.1] - 2019-02-14
- Added changelog
- Added `scripts/releaser.ts` which checks app versions for consistency and bumps app version for release
