/* eslint-disable */

describe('Open invoice from deep link', () => {

    // open app from deep link
    beforeAll(async () => {
         // change sourceApp to com.liquiditynetwork.wallet-ios when using original team on xcode
        await device.relaunchApp(
            {
                url: 'https://lqd.money/?data=e58b28b644b7416db1cfe18f0a07265a' + 
                    '|1@0xac8c3D5242b425DE1b86b17E407D8E949D994010@0x627306090' + 
                    'abaB3A6e1400e9345bC60c78a8BEf57|123|ETH|0x290decd9548b62a' + 
                    '8d60345a988386fc84ba6bc95484008f6362f93160ef3e563',
                sourceApp: 'com.liquiditynetwork.wallet-ios.app'
            }
        )
    })

    // enter pincode to unlock
    it('should enter pincode to unlock app', async () => {
        await expect(element(by.id('PinLockScreen'))).toBeVisible()
        await expect(element(by.id('PinButton_1')).atIndex(1)).toBeVisible()

        // select 111111 as a passcode
        for(let i = 0; i < 6; i++) {
            await element(by.id('PinButton_1')).atIndex(1).tap()
        }
    })

    // send specified amount to the specified address
    it('should transfer amount', async () => {
        await expect(element(by.id('SendScreen'))).toBeVisible()

        await expect(element(by.id('SendScreenConfirmButton'))).toBeVisible()
        await element(by.id('SendScreenConfirmButton')).tap()
    })

})