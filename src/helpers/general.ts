import { InteractionManager as RNInteractionManager } from 'react-native'
import { BigNumber } from 'bignumber.js'
import memoize from 'lodash/memoize'

import { web3 } from 'services/nocustManager'
import { TRANSFER_GAS_LIMIT } from '../state/tokens/onChain'

// Make RN InteractionManager more reliable calling parameter function after 500ms
// if it's not being called by InteractionManager. In edge cases InteractionManager
// can never call the parameter function.
export const InteractionManager = {
  ...RNInteractionManager,
  runAfterInteractions: f => {
    let called = false

    const timeout = setTimeout(() => {
      called = true
      f()
    }, 500)

    RNInteractionManager.runAfterInteractions(() => {
      if (called) return
      clearTimeout(timeout)
      f()
    })
  },
}

export function shuffleArray(array: number[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}

export const normaliseComma = (val: string) => val.replace(',', '.')

export const failOnTimeout = (timeout: number) =>
  // eslint-disable-next-line promise/param-names
  new Promise((_resolve, reject) => setTimeout(reject, timeout))

export const getIdByAddressNetwork = (address: string, network: number) => address + '-' + network

export const signWithPrivateKey = (message: string, privateKey: string) =>
  web3 && web3.eth.accounts.sign(message, privateKey).signature

const getTransferMaxFeeRaw = (gasPrice: string) => new BigNumber(gasPrice).times(TRANSFER_GAS_LIMIT)
export const getTransferMaxFee = memoize(getTransferMaxFeeRaw)

export const remove0x = (address: string): string =>
  address.indexOf('0x') === 0 ? address.substring(2) : address
