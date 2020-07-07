import {
  expectToBeNotVisible, expectToBeVisible, getTextFromElement, tapElement, tapPinButtons,
} from '../utils' // prettier-ignore
import { SEED_PHRASE } from '../constants'

describe('=====> Home screen', () => {
  it('should display backup passphrase banner until backup is complete', async () => {
    await expectToBeVisible('BackupPassphraseBanner')

    // getTextFromElement is not working on Android
    if (device.getPlatform() === 'ios') {
      await tapElement('BackupPassphraseBannerButton')

      await tapPinButtons('9', 6)

      await tapElement('BackupPassphraseScreenConfirmButton')

      const parseWordNumber = (text: string) => parseInt(text.match(/\d+/)[0])

      for (let i = 0; i < 3; i++) {
        const cta = await getTextFromElement('BackupPassphraseVerifyScreenCTA')
        // console.log('#', parseWordNumber(cta))
        const word = SEED_PHRASE.split(' ')[parseWordNumber(cta) - 1]
        await element(by.id('BackupPassphraseVerifyScreenInput'))
          .atIndex(0)
          .tap()
        await element(by.id('BackupPassphraseVerifyScreenInput'))
          .atIndex(0)
          .typeText(word)

        await element(by.id('BackupPassphraseVerifyScreenButton'))
          .atIndex(0)
          .tap()
      }

      await expectToBeVisible('HomeScreen')

      await expectToBeNotVisible('BackupPassphraseBanner')
    }
  })

  it('should have accordion behaviour of tokens', async () => {
    await expectToBeVisible('HomeScreenTokenfLQD')
    await expectToBeVisible('HomeScreenTokenfETH')

    await tapElement('HomeScreenChainSwitch')

    await expectToBeVisible('HomeScreenTokenLQD')
    await expectToBeVisible('HomeScreenTokenETH')

    await tapElement('HomeScreenTokenLQD')

    await expectToBeVisible('HomeScreenTokenButtonsLQD')

    await tapElement('HomeScreenTokenETH')

    await expectToBeNotVisible('HomeScreenTokenButtonsLQD')
    await expectToBeVisible('HomeScreenTokenButtonsETH')

    await tapElement('HomeScreenChainSwitch')

    await expectToBeNotVisible('HomeScreenTokenButtonsLQD')
    await expectToBeVisible('HomeScreenTokenfLQD')
  })
})
