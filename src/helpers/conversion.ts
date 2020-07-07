import BigNumber from 'bignumber.js'

import { Token } from 'state/tokens'
import { COMMIT_CHAIN_NAME_PREFIX, CurrencyType } from 'helpers/static'

const TEN_MINUS_EIGHTEEN = new BigNumber(10).pow(-18)
const TEN_PLUS_EIGHTEEN = new BigNumber(10).pow(18)

// FORMATTING FUNCTIONS
export const shortenAddress = (address, size) =>
  address.slice(0, size + 2) + '...' + address.slice(42 - size)

export const shortenId = id => id.slice(0, 8) + '...' + id.slice(60)

export function formatTokenBalance(token: Token): string {
  const { tickerName, balance, decimals } = token
  if (tickerName === 'ETH' || tickerName === COMMIT_CHAIN_NAME_PREFIX + 'ETH') {
    if (balance.isGreaterThanOrEqualTo(100000000000000)) {
      return roundStripZeros(balance.times(TEN_MINUS_EIGHTEEN), 5)
    } else if (balance.isGreaterThanOrEqualTo(1000000000)) {
      return roundStripZeros(balance.times(new BigNumber(10).pow(-9))) + ' gWei'
    } else if (balance.isGreaterThanOrEqualTo(1000000)) {
      return roundStripZeros(balance.times(new BigNumber(10).pow(-6))) + ' mWei'
    } else if (balance.isGreaterThanOrEqualTo(1000)) {
      return roundStripZeros(balance.times(new BigNumber(10).pow(-3))) + ' kWei'
    } else if (balance.isGreaterThanOrEqualTo(1)) {
      return balance.toString() + ' Wei'
    } else {
      return '0'
    }
  } else {
    return roundStripZeros(balance.times(new BigNumber(10).pow(-decimals)), 5)
  }
}

// CONVERSION FUNCTIONS
export const weiToEth = (value: BigNumber, tokenDecimals: number, decimals = 10): string =>
  roundStripZeros(
    value.times(tokenDecimals === 18 ? TEN_MINUS_EIGHTEEN : new BigNumber(10).pow(-tokenDecimals)),
    decimals,
  )

export const ethToWei = (value: string, tokenDecimals: number): BigNumber =>
  new BigNumber(value).times(
    tokenDecimals === 18 ? TEN_PLUS_EIGHTEEN : new BigNumber(10).pow(tokenDecimals),
  )

export const calculateFiatBalance = (token: Token): number =>
  token.balance
    .times(new BigNumber(10).pow(-token.decimals))
    .times(token.fiatPrice)
    .toNumber()

export const amountToFiat = (amount: BigNumber, fiatPrice: number, tokenDecimals: number): string =>
  amount
    .times(new BigNumber(10).pow(-tokenDecimals))
    .times(fiatPrice)
    .toFixed(2)

export function convertCurrency(
  amount: string,
  from: CurrencyType,
  to: CurrencyType,
  token: Token,
): BigNumber {
  if (from === CurrencyType.ERC20) {
    if (to === CurrencyType.WEI) return ethToWei(amount, token.decimals)
    if (to === CurrencyType.ERC20) return new BigNumber(amount)
    if (to === CurrencyType.FIAT) return new BigNumber(parseFloat(amount) * token.fiatPrice)
  } else if (from === CurrencyType.WEI) {
    if (to === CurrencyType.WEI) return new BigNumber(amount)
    if (to === CurrencyType.ERC20) {
      return new BigNumber(amount).times(new BigNumber(10).pow(-token.decimals))
    } else if (to === CurrencyType.FIAT) {
      return new BigNumber(amount)
        .times(new BigNumber(token.fiatPrice))
        .times(new BigNumber(10).pow(-token.decimals))
    }
  } else if (from === CurrencyType.FIAT) {
    if (to === CurrencyType.WEI) {
      return new BigNumber(parseFloat(amount) / token.fiatPrice)
        .times(new BigNumber(10).pow(token.decimals))
        .integerValue()
    }
    if (to === CurrencyType.ERC20) {
      return new BigNumber(parseFloat(amount) / token.fiatPrice).integerValue()
    }
    if (to === CurrencyType.FIAT) return new BigNumber(amount)
  }
}

// HELPERS
export const roundStripZeros = (value: BigNumber, decimals = 3): string =>
  value
    .toFixed(decimals)
    .replace(/0+$/, '')
    .replace(/\.$/, '')
