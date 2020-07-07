/* eslint-disable */

describe('Transfer from LiqETH to ETH', () => {

    // test case for opening conversion screen
    it('should open conversion screen', async () => {
        await expect(element(by.id('CurrencyScreenConversionButton'))).toBeVisible()
        await element(by.id('CurrencyScreenConversionButton')).tap()

        await expect(element(by.id('ConversionScreen'))).toBeVisible()
    })

    // test case for transferring some amount from liquid ethereum to ethereum
    it('should transfer some amount from eth to liqEth', async () => {
        await expect(element(by.id('ConversionScreenDirectionButton'))).toBeVisible
        await element(by.id('ConversionScreenDirectionButton')).tap()

        await expect(element(by.id('ConversionScreenAmountInput'))).toBeVisible
        await element(by.id('ConversionScreenAmountInput')).tap()
        await element(by.id('ConversionScreenAmountInput')).replaceText('0.001')

        await expect(element(by.id('ConversionScreenConfirmButton'))).toBeVisible()
        await element(by.id('ConversionScreenConfirmButton')).tap()
    })
})