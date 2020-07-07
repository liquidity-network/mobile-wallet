import { createInvoice, Invoice } from 'liquidity-invoice-generation'
import qs from 'querystringify'

import navigation from './navigation'
import { openLockScreen, openSendScreen } from 'routes/navigationActions'

export const handleDeepLinkUrl = (url: string) => {
  console.log('url', url)
  if (!url.startsWith('lqdnet://')) return

  const [screen, paramsString] = url.substr(9).split('?')
  const params = qs.parse(paramsString || '')
  console.log('processing deep-link url, screen', screen, 'params', params)

  if (screen === 'send') {
    // Required parameters
    if (!params.network || !params.publicKey) return

    let invoice: Invoice
    try {
      invoice = createInvoice({
        network: parseInt(params.network),
        publicKey: params.publicKey,
        generateId: !!params.generateId,
        contractAddress: params.contractAddress,
        tokenAddress: params.tokenAddress,
        amount: params.amount,
      })
    } catch (e) {
      console.log(e)
      return
    }

    popIfLockScreen()

    const onComplete = () => {
      popIfLockScreen()

      if (navigation.getCurrentScreen() === 'SendScreen') {
        navigation.pop(1, true)
      }

      openSendScreen({
        invoice: {
          type: 'invoice',
          publicKey: invoice.publicKey,
          network: invoice.network,
          tokenAddress: invoice.tokenAddress,
          contractAddress: invoice.contractAddress,
          amount: invoice.amount,
          nonce: invoice.nonce,
        },
      })
    }

    openLockScreen({ onComplete }, true)
  }
}

const popIfLockScreen = () => {
  if (navigation.getCurrentScreen() === 'LockMainScreen') {
    navigation.pop(1, true)
  }
}
