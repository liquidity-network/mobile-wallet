import axios from 'axios'
import Web3 from 'web3'
import BigNumber from 'bignumber.js'

// @ts-ignore
const web3 = new Web3()

export const getSHAofFile = async (url: string): Promise<string> => {
  const { data } = await axios(url)

  const shaIndex = data.indexOf('<p>SHA256: ')

  if (shaIndex === -1) return Promise.reject(new Error('SHA hash was not found on ' + url))

  return data.substr(shaIndex + 11, 64)
}

export const sendErrorToSlack = (message: string) =>
  axios.post(
    'https://hooks.slack.com/services/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',
    { text: message },
    { headers: { 'Content-Type': 'application/json' } },
  )

export const checkSign = (message: string, signature: string, publicKey: string): boolean =>
  web3.eth.accounts.recover(message, signature) === publicKey

export const roundStripZeros = (value: BigNumber, decimals = 3): string =>
  value
    .toFixed(decimals)
    .replace(/0+$/, '')
    .replace(/\.$/, '')

export const weiToEth = (value: BigNumber, tokenDecimals: number, decimals = 10): string =>
  roundStripZeros(value.times(new BigNumber(10).pow(-tokenDecimals)), decimals)
