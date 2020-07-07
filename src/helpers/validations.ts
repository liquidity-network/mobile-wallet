import { web3 } from 'services/nocustManager'
import { CurrencyType } from './static'

export const validateCurrency = (value: string, currency: CurrencyType): boolean => {
  if (currency === CurrencyType.ERC20 || currency === CurrencyType.FIAT) {
    return !Number.isNaN(parseFloat(value))
  } else if (currency === CurrencyType.WEI) {
    return Number.isInteger(Number(value))
  }
}
export const isCorrectETHAddress = (address: string) => web3.utils.isAddress(address.toLowerCase())
