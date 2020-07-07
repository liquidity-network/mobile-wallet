import I18n from 'i18n-js'

import {
  tapElement, goToWelcomeFromScratch, expectToHaveText,
  expectToBeVisibleWithDelay, swipeElement, tapPinButtons
} from '../utils' // prettier-ignore

describe('=====> Create wallet', () => {
  it('should be able to pick PIN code auth on wallet creation', async () => {
    await device.launchApp({ delete: true, permissions: { notifications: 'YES' } })

    await goToWelcomeFromScratch()

    await tapElement('WelcomeScreenCreateWalletButton')

    await tapElement('SelectAuthMethodScreenPinCodeButton')
  })

  it('should throw error if PIN codes do not match on creation', async () => {
    await tapPinButtons('1', 11)

    await tapElement('PinButton2')

    if (device.getPlatform() === 'ios') {
      await expectToHaveText('PinLockScreenErrorText', I18n.t('pin-doesnt-match'))
    } else {
      // TODO Figure out why text matching doesn't work on Android
      // await expectToBeVisible('SelectAuthMethodScreen')
    }
  })

  it('should go to Home screen when PIN code created', async () => {
    await tapPinButtons('9', 12)

    await expectToBeVisibleWithDelay('HomeScreen')
  })

  it('should display PIN unlock screen on app restart which can`t be dismissed by swipe gesture', async () => {
    await device.reloadReactNative()

    await swipeElement('PinLockScreen', 'right', 0.05)

    await tapPinButtons('9', 6)

    await expectToBeVisibleWithDelay('HomeScreen')
  })
})
