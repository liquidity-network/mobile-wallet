import {
  expectToBeVisible,
  swipeElement,
  tapElement,
  goToWelcomeFromScratch,
  expectToBeVisibleWithDelay,
} from '../utils'

describe('=====> On-boarding', () => {
  it('should have "Terms" screen if user launched app for the first time', async () => {
    await expectToBeVisible('TermsAcceptanceScreen')
  })

  it(
    'should not pass further until terms are accepted,' +
      ' and when accepted, go to "OnBoarding" screen',
    async () => {
      await device.reloadReactNative()

      await expectToBeVisible('TermsAcceptanceScreen')

      await tapElement('TermsAcceptanceScreenTermsCheckbox')
      await tapElement('TermsAcceptanceScreenPrivacyCheckbox')

      await tapElement('TermsAcceptanceScreenAcceptButton')

      await expectToBeVisible('OnBoardingScreen')
    },
  )

  it('should have "Welcome" screen after "OnBoarding" screen completed', async () => {
    if (device.getPlatform() === 'android') {
      // On Android swipes do not work
      await tapElement('OnBoardingScreenSkipButton')
    } else {
      await swipeElement('CarouselSlide0', 'left')
      await swipeElement('CarouselSlide1', 'left')
      await swipeElement('CarouselSlide2', 'left')

      await tapElement('OnBoardingScreenGetStartedButton')
    }

    await expectToBeVisibleWithDelay('WelcomeScreen')
  })

  it('should have "Skip" button on "OnBoarding" screen that works', async () => {
    await device.launchApp({ delete: true })

    await goToWelcomeFromScratch()

    await expectToBeVisibleWithDelay('WelcomeScreen')
  })

  it('should not go to "Terms" or "OnBoarding" screen once "Welcome" screen has shown', async () => {
    await device.reloadReactNative()

    await expectToBeVisibleWithDelay('WelcomeScreen')
  })
})
