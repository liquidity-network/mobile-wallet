import { expectToBeNotVisible, expectToBeVisible, tapElement } from '../utils'

describe('=====> Settings screen', () => {
  it('should be able to add/remove tokens', async () => {
    await tapElement('BottomTabBarSettingsButton')

    await tapElement('SettingsScreenCoinsButton')

    await expectToBeVisible('TokenSelectionScreen')

    await tapElement('TokenSelectionScreenSwitchLQD')
    await tapElement('TokenSelectionScreenSwitchfETH')

    await tapElement('BackButton')

    await tapElement('BottomTabBarHomeButton')

    await tapElement('HomeScreenChainSwitch')

    await expectToBeNotVisible('HomeScreenTokenLQD')

    await tapElement('HomeScreenChainSwitch')

    await expectToBeNotVisible('HomeScreenTokenfETH')

    await tapElement('BottomTabBarSettingsButton')

    await tapElement('SettingsScreenCoinsButton')

    await tapElement('TokenSelectionScreenSwitchLQD')
    await tapElement('TokenSelectionScreenSwitchfETH')

    await tapElement('BackButton')

    await tapElement('BottomTabBarHomeButton')

    await expectToBeVisible('HomeScreenTokenfETH')

    await tapElement('HomeScreenChainSwitch')

    await expectToBeVisible('HomeScreenTokenLQD')
  })

  it('should be able to switch between hubs', async () => {
    await tapElement('BottomTabBarSettingsButton')

    await tapElement('SettingsScreenSelectHubButton')

    await element(by.text('Limbo (fast testnet)')).tap()

    await expectToBeVisible('HomeScreen')

    await tapElement('BottomTabBarSettingsButton')

    await tapElement('SettingsScreenSelectHubButton')

    await element(by.text('Rinkeby (testnet)')).tap()

    await expectToBeVisible('HomeScreen')
  })
})
