import {
  replaceTextInElement, goToWelcomeFromScratch, expectToBeVisibleWithDelay,
  tapElement, typeBackspaceToElement, typeTextToElement, tapPinButtons, tapReturnKey,
} from '../utils' // prettier-ignore
import { KEYSTORE, KEYSTORE_PASSWORD, PRIVATE_KEY, SEED_PHRASE } from '../constants'

describe('=====> Restore wallet', () => {
  it('should be able to restore wallet from passphrase', async () => {
    await tapElement('WelcomeScreenRestoreWalletButton')

    await tapElement('SelectAuthMethodScreenPinCodeButton')

    await tapPinButtons('5', 12)

    await tapElement('RestoreWalletScreenKeyInput')
    await replaceTextInElement('RestoreWalletScreenKeyInput', SEED_PHRASE)
    await typeTextToElement('RestoreWalletScreenKeyInput', ' ')
    await typeBackspaceToElement('RestoreWalletScreenKeyInput')

    await tapElement('RestoreWalletScreenRestoreButton')

    await expectToBeVisibleWithDelay('HomeScreen')
  })

  it('should be able to restore wallet from private key', async () => {
    await device.launchApp({ delete: true })

    await goToWelcomeFromScratch()

    await tapElement('WelcomeScreenRestoreWalletButton')

    await tapElement('SelectAuthMethodScreenPinCodeButton')

    await tapPinButtons('2', 12)

    await tapElement('RestoreWalletScreenPrivateKey')

    await tapElement('RestoreWalletScreenKeyInput')
    await replaceTextInElement('RestoreWalletScreenKeyInput', PRIVATE_KEY)
    await typeTextToElement('RestoreWalletScreenKeyInput', ' ')
    await typeBackspaceToElement('RestoreWalletScreenKeyInput')

    await tapElement('RestoreWalletScreenRestoreButton')

    await expectToBeVisibleWithDelay('HomeScreen')
  })

  it('should be able to restore wallet from keystore', async () => {
    await device.launchApp({ delete: true })

    await goToWelcomeFromScratch()

    await tapElement('WelcomeScreenRestoreWalletButton')

    await tapElement('SelectAuthMethodScreenPinCodeButton')

    await tapPinButtons('7', 12)

    await tapElement('RestoreWalletScreenKeystore')

    await tapElement('RestoreWalletScreenKeyInput')
    await replaceTextInElement('RestoreWalletScreenKeyInput', KEYSTORE)
    await typeTextToElement('RestoreWalletScreenKeyInput', ' ')

    await tapElement('RestoreWalletScreenPasswordInput')
    await typeTextToElement('RestoreWalletScreenPasswordInput', KEYSTORE_PASSWORD)
    await tapReturnKey('RestoreWalletScreenPasswordInput')

    await tapElement('RestoreWalletScreenRestoreButton')

    await expectToBeVisibleWithDelay('HomeScreen')
  })
})
