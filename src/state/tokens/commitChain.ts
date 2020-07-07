import { Alert } from 'react-native'
import I18n from 'i18n-js'
import BigNumber from 'bignumber.js'
import { nocust } from 'nocust-client'

import { GetState } from '..'
import { getTokenByCursor, updateToken } from '.'
import { getPublicKey } from '../auth'
import { updateTransaction, TransactionType } from '../history'
import { recoverFunds } from './onChain'
import { ErrorEvents, logError } from 'services/analytics'
import { showSnack, SnackType } from 'ui/Snack'
import { getHubConnectionError, setHubConnectionError } from '../hubs'

export const fetchBalanceCommitChain = (tokenAddress: string) => async (
  dispatch,
  getState: GetState,
) => {
  try {
    const state = getState()
    const publicKey = getPublicKey(state)
    console.log('before get balane', publicKey, tokenAddress)

    const balance = await nocust.getBalance(publicKey, tokenAddress)
    console.log(balance)
    const token = getTokenByCursor(state, { address: tokenAddress, commitChain: true })
    const oldBalance = token ? token.balance : ''
    if (!balance.isEqualTo(oldBalance)) {
      dispatch(updateToken(tokenAddress, true, { balance }))
    }
    if (getHubConnectionError(state) != null) {
      dispatch(setHubConnectionError(null))
    }
  } catch (error) {
    dispatch(setHubConnectionError(error.message || 'ERROR'))

    logError(ErrorEvents.FETCH_BALANCE_ERROR, { onChain: false, tokenAddress, nativeError: error })

    // TODO This need to be reworked, very fragile!
    if (
      error.message &&
      error.message.find &&
      error.message.find('This provider is not longer operational.')
    ) {
      Alert.alert(I18n.t('initiate-recovery'), I18n.t('initiate-recovery-description'), [
        { text: I18n.t('cancel') },
        {
          text: I18n.t('confirm'),
          onPress: async () => {
            try {
              await dispatch(recoverFunds(tokenAddress))
            } catch {
              showSnack({ type: SnackType.FAIL, title: I18n.t('transaction-failed') })
            }
          },
        },
      ])
    }
  }
}

export const transferCommitChain = (
  to: string,
  amount: BigNumber,
  token: string,
  nonce?: BigNumber,
) => async (dispatch, getState: GetState) => {
  const publicKey = getPublicKey(getState())

  try {
    const transaction = await nocust.transfer({
      from: publicKey,
      to,
      amount,
      token,
      nonce,
    })

    const txData = await nocust.getTransfer(transaction.id)
    dispatch(
      updateTransaction({
        id: transaction.id.toString(),
        type: TransactionType.COMMIT_CHAIN,
        amount,
        sender: publicKey,
        recipient: to,
        tokenAddress: token,
        // @ts-ignore
        time: txData.time * 1000,
        round: txData.eon,
        rejected: false,
        approved: true,
        confirmed: false,
      }),
    )
  } catch (error) {
    logError(ErrorEvents.TRANSFER_OFFCHAIN_ERROR, {
      nativeError: error,
      from: publicKey,
      to,
      amount: amount.valueOf(),
    })

    return Promise.reject(error)
  }
}
