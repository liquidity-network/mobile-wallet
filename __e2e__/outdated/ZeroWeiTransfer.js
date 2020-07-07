/* eslint-disable */

describe('Transfer of 0 wei to other wallet', () => {

    // test case for checking the visibility of home screen
    it('home screen and send button should be visible', async () => {
        await expect(element(by.id('HomeScreen'))).toBeVisible()

        await expect(element(by.id('BottomTabBarCentralButton'))).toBeVisible()
        await element(by.id('BottomTabBarCentralButton')).tap()
        
        await expect(element(by.id('BottomTabBarCentralButton_SendButton'))).toBeVisible()
        await element(by.id('BottomTabBarCentralButton_SendButton')).tap()
    })

    // test case for entering transfer ammount
    it('should enter transfer amount', async () => {
        await expect(element(by.id('SendScreen'))).toBeVisible()

        await expect(element(by.id('SendScreenToTextInput'))).toBeVisible()
        await element(by.id('SendScreenToTextInput')).tap()
        await element(by.id('SendScreenToTextInput')).replaceText('0xd1531f07263d55a94D4c649844dD4f338051a22d')

        await expect(element(by.id('SendScreenAmountTextInput'))).toBeVisible()
        await element(by.id('SendScreenAmountTextInput')).tap()
        await element(by.id('SendScreenAmountTextInput')).replaceText('00')
        
        await element(by.id('SendScreenAmountText')).tap()
    })

    // test case for confirming the transaction
    it('should confirm transaction', async () => {
        await expect(element(by.id('SendScreenConfirmButton'))).toBeVisible()
        await element(by.id('SendScreenConfirmButton')).tap()
    })
})