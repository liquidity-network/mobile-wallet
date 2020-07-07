import { tapElement, typeTextToElement, goToWelcomeFromScratch } from '../utils'
import { testAccounts } from '../constants'

enum SnackType {
  INFO = 1,
  SUCCESS = 2,
  FAIL = 3,
  WAITING = 4,
}

describe('Deposit', () => {
  beforeAll(async () => {
    await goToWelcomeFromScratch()

    await tapElement('WelcomeScreenRestoreWalletButton')

    await tapElement('RestoreWalletScreenPrivateKey')

    await tapElement('RestoreWalletScreenKeyInput')
    await typeTextToElement('RestoreWalletScreenKeyInput', testAccounts.ACCOUNT1_PRIVATE + '\n')

    await tapElement('RestoreWalletScreenRestoreButton')

    await tapElement('SelectAuthMethodScreenPinCodeButton')

    for (let i = 0; i < 12; i++) {
      await tapElement('PinButton1')
    }
  })

  it('should allow to deposit ETH and LQD', async () => {
    await waitFor(element(by.id('LQD')))
      .toBeVisible()
      .withTimeout(20000)

    await tapElement('ETH')

    await tapElement('CurrencyScreenConversionButton')

    await tapElement('ConversionScreenAmountInput')
    await typeTextToElement('ConversionScreenAmountInput', '0.001')

    if (device.getPlatform() === 'android') {
      // @ts-ignore
      await element(by.id('ConversionScreenAmountInput')).tapReturnKey()
    }

    await tapElement('ConversionScreenSubmitButton')

    await waitFor(element(by.id('Snack' + SnackType.SUCCESS)))
      .toBeVisible()
      .withTimeout(2000)

    await tapElement('LQD')

    await tapElement('CurrencyScreenConversionButton')

    await tapElement('ConversionScreenAmountInput')
    await typeTextToElement('ConversionScreenAmountInput', '0.002')

    // if (device.getPlatform() === 'android') {
    // @ts-ignore
    await element(by.id('ConversionScreenAmountInput')).tapReturnKey()
    // }

    await tapElement('ConversionScreenSubmitButton')

    await waitFor(element(by.id('Snack' + SnackType.SUCCESS)))
      .toBeVisible()
      .withTimeout(2000)
  })
})
