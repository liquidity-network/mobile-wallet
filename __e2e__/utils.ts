declare const expect: Detox.Expect<Detox.Expect<any>>

export const sleep = (seconds: number) =>
  new Promise(resolve => setTimeout(resolve, seconds * 1000))

export const tapElement = id => element(by.id(id)).tap()

export const swipeElement = (id, direction, percentage?) =>
  element(by.id(id)).swipe(direction, 'fast', percentage)

export const scrollElement = (id: string, direction: 'bottom') =>
  element(by.id(id)).scrollTo(direction)

export const expectToBeVisible = id => expect(element(by.id(id))).toBeVisible()

export const expectToBeVisibleWithDelay = id =>
  waitFor(element(by.id(id)))
    .toBeVisible()
    .withTimeout(2000)

export const expectToBeNotVisible = id => expect(element(by.id(id))).toBeNotVisible()

export const expectToHaveText = (id, text) => expect(element(by.id(id))).toHaveText(text)

export const typeTextToElement = (id, text) => element(by.id(id)).typeText(text)

export const tapReturnKey = id => element(by.id(id)).tapReturnKey()

export const typeBackspaceToElement = id => element(by.id(id)).tapBackspaceKey()

export const replaceTextInElement = (id, text) => element(by.id(id)).replaceText(text)

export const clearTextFromElement = id => element(by.id(id)).clearText()

export const getTextFromElement = async (id: string) => {
  try {
    await expect(element(by.id(id))).toHaveText('__read_element_error_')
  } catch (error) {
    const start = `AX.id='${id}';`
    const end = '; AX.frame'
    const errorMessage = error.message.toString()
    const [, restMessage] = errorMessage.split(start)
    const [label] = restMessage.split(end)
    const [, value] = label.split('=')

    return value.slice(1, value.length - 1) as string
  }
}

export const goToWelcomeFromScratch = async () => {
  await tapElement('TermsAcceptanceScreenTermsCheckbox')
  await tapElement('TermsAcceptanceScreenPrivacyCheckbox')

  await tapElement('TermsAcceptanceScreenAcceptButton')

  await tapElement('OnBoardingScreenSkipButton')

  await waitFor(element(by.id('WelcomeScreen')))
    .toBeVisible()
    .withTimeout(1000)
}

export const tapPinButtons = async (num: string, times: number) => {
  await device.disableSynchronization()

  for (let i = 0; i < times; i++) {
    await tapElement('PinButton' + num)

    await sleep(0.15)
  }

  await device.enableSynchronization()
}

export const goToHomeFromScratch = async () => {
  await goToWelcomeFromScratch()

  await tapElement('WelcomeScreenCreateWalletButton')

  await tapElement('SelectAuthMethodScreenPinCodeButton')

  await tapPinButtons('9', 12)
}
