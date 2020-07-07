/* eslint-disable */

describe('Scan qrcode and do transaction', () => {

    // test case for checking the visibility of home screen
    it('home screen and send button should be visible', async () => {
        await expect(element(by.id('HomeScreen'))).toBeVisible()

        await expect(element(by.id('BottomTabBarCentralButton'))).toBeVisible()
        await element(by.id('BottomTabBarCentralButton')).tap()

        await expect(element(by.id('BottomTabBarCentralButton_ScanQRButton'))).toBeVisible()
        await element(by.id('BottomTabBarCentralButton_ScanQRButton')).tap()
    })

    // test case for scanning qrcode successfully
    it('should scan qrcode successfully', async () => {

        await waitFor(element(by.id('SendScreen'))).toBeVisible().withTimeout(3000)
        await expect(element(by.id('SendScreen'))).toBeVisible()
    })

    // test case for entering transfer ammount
    it('should enter transfer amount', async () => {

        await expect(element(by.id('SendScreenToTextInput'))).toBeVisible()
        await element(by.id('SendScreenToTextInput')).tap()

        await expect(element(by.id('SendScreenAmountTextInput'))).toBeVisible()
        await element(by.id('SendScreenAmountTextInput')).tap()
        await element(by.id('SendScreenAmountTextInput')).replaceText('00')
        
        await element(by.id('SendScreenAmountText')).tap()

        await expect(element(by.id('SendScreenConfirmButton'))).toBeVisible()
        await element(by.id('SendScreenConfirmButton')).tap()
    })
})