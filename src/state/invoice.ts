import { createInvoice as generateInvoice, encodeInvoice } from 'liquidity-invoice-generation'

import { GetState } from '.'
import { getPublicKey } from './auth'
import { getCurrentHub } from './hubs'

export const createInvoice = (amount: number, tokenAddress?: string) => (
  _dispatch,
  getState: GetState,
) => {
  const hub = getCurrentHub(getState())
  const invoice = generateInvoice({
    network: hub.network,
    contractAddress: hub.contract,
    publicKey: getPublicKey(getState()),
    amount,
    tokenAddress,
  })

  return encodeInvoice(invoice)
}
