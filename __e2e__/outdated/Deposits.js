describe('Transfer from ETH to LiqETH', () => {

    // test case for opening currency screen
    it('should open currency screen', async () => {
        await expect(element(by.id('HomeScreen'))).toBeVisible()

        await expect(element(by.id('ETH_OFF'))).toBeVisible()
        await element(by.id('ETH_OFF')).tap()

        await expect(element(by.id('CurrencyScreen'))).toBeVisible()
    })

    // test case for opening conversion screen
    it('should open conversion screen', async () => {
        await expect(element(by.id('CurrencyScreenConversionButton'))).toBeVisible()
        await element(by.id('CurrencyScreenConversionButton')).tap()

        await expect(element(by.id('ConversionScreen'))).toBeVisible()
    })

    // test case for transferring some amount from ethereum to liquid ethereum
    it('should transfer some amount from eth to liqEth', async () => {
        await expect(element(by.id('ConversionScreenAmountInput'))).toBeVisible
        await element(by.id('ConversionScreenAmountInput')).tap()
        await element(by.id('ConversionScreenAmountInput')).replaceText('0.001')

        await expect(element(by.id('ConversionScreenConfirmButton'))).toBeVisible()
        await element(by.id('ConversionScreenConfirmButton')).tap()
    })

})
