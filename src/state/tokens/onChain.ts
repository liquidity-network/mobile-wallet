import BigNumber from 'bignumber.js'
import { nocust } from 'nocust-client'

import { blockchain } from 'nocust-client/dist/services/blockchain'
import { store } from 'nocust-client/dist/store'
import { BN_2_256_MINUS_1 } from 'nocust-client/dist/constants'

import { GetState } from '..'
import { getGasPrice } from '../config'
import { Transaction, TransactionType, updateTransaction } from '../history'
import { web3 } from 'services/nocustManager'
import { getPublicKey } from '../auth'
import { ERC20_ABI } from 'helpers/erc20Abi'
import { getTokenByCursor, updateToken } from '.'
import { ErrorEvents, logError } from 'services/analytics'
import { getCurrentHubAddress } from '../hubs'

export const TRANSFER_GAS_LIMIT = 100000
export const DEPOSIT_GAS_LIMIT = 200000
export const WITHDRAWAL_GAS_LIMIT = 500000
const CHALLENGE_GAS_LIMIT = 400000
const TX_CONFIRMATION_BLOCKS = 20
export const APPROVE_AMOUNT = BN_2_256_MINUS_1.toFixed(0)

export const fetchBalanceOnChain = (tokenAddress: string) => async (
  dispatch,
  getState: GetState,
) => {
  try {
    const balance: BigNumber = await nocust.getParentChainBalance(
      getPublicKey(getState()),
      tokenAddress,
    )

    const token = getTokenByCursor(getState(), { address: tokenAddress, commitChain: false })
    const oldBalance = token ? token.balance : ''

    if (!balance.isEqualTo(oldBalance)) {
      dispatch(updateToken(tokenAddress, false, { balance }))
    }
  } catch (error) {
    logError(ErrorEvents.FETCH_BALANCE_ERROR, { onChain: true, tokenAddress, nativeError: error })
  }
}

export function transferOnChain(to: string, amount: BigNumber, tokenAddress: string) {
  return async (dispatch, getState: GetState) => {
    const publicKey = getPublicKey(getState())
    const gasPrice = getGasPrice(getState())

    try {
      let txReceipt
      if (tokenAddress === getCurrentHubAddress(getState())) {
        // Ether transfer
        txReceipt = await web3.eth.sendTransaction({
          value: amount.toString(),
          from: publicKey,
          to,
          gas: TRANSFER_GAS_LIMIT,
          gasPrice,
        })
      } else {
        // ERC-20 transfer
        const transactionParams = {
          from: publicKey,
          gas: TRANSFER_GAS_LIMIT,
          gasPrice: parseFloat(gasPrice).toString(),
        }
        const contract = new web3.eth.Contract(ERC20_ABI, tokenAddress, transactionParams)
        txReceipt = await contract.methods.transfer(to, new BigNumber(amount).toFixed(0)).send()
      }

      const tx: Transaction = createOnChainTx({
        id: txReceipt.transactionHash,
        sender: publicKey,
        recipient: to,
        amount,
        tokenAddress,
        type: TransactionType.ON_CHAIN,
        gasLimit: TRANSFER_GAS_LIMIT,
        gasPrice,
      })
      dispatch(updateTransaction(tx))
    } catch (error) {
      logError(ErrorEvents.TRANSFER_ONCHAIN_ERROR, {
        nativeError: error,
        from: publicKey,
        to,
        gasLimit: TRANSFER_GAS_LIMIT,
        gasPrice,
        amount: amount.toString(),
      })

      return Promise.reject(error)
    }
  }
}

export function deposit(amount: BigNumber, tokenAddress: string, tickerName: string) {
  return async (dispatch, getState: GetState) => {
    const publicKey = getPublicKey(getState())
    const gasPrice = getGasPrice(getState())
    try {
      let id = ''

      if (tickerName === 'ETH') {
        id = await nocust.deposit({
          address: publicKey,
          amount,
          gasPrice,
          token: tokenAddress,
        })
      } else {
        let currentNonce = await web3.eth.getTransactionCount(publicKey)
        const allowance = await blockchain.callERC20Method(tokenAddress, 'allowance', [
          publicKey,
          store.contractAddress,
        ])
        console.log(allowance, amount, new BigNumber(allowance).isLessThan(amount))
        if (new BigNumber(allowance).isLessThan(amount)) {
          await nocust.approveDeposits({
            address: publicKey,
            gasPrice,
            token: tokenAddress,
          })
          currentNonce += 1
        }
        id = await nocust.deposit({
          address: publicKey,
          amount,
          gasPrice,
          token: tokenAddress,
          nonce: currentNonce,
        })
      }
      console.log('id', id)
      const tx = createOnChainTx({
        id,
        sender: publicKey,
        amount,
        tokenAddress,
        type: TransactionType.DEPOSIT,
        gasLimit: DEPOSIT_GAS_LIMIT,
        gasPrice,
        confirmationBlocks: TX_CONFIRMATION_BLOCKS,
      })
      dispatch(updateTransaction(tx))
    } catch (error) {
      console.log(error)
      logError(ErrorEvents.DEPOSIT_ERROR, {
        nativeError: error,
        gasLimit: DEPOSIT_GAS_LIMIT,
        gasPrice,
        publicKey,
        amount: amount.toString(),
        tokenAddress,
      })

      return Promise.reject(error)
    }
  }
}

export function requestWithdrawal(amount: BigNumber, tokenAddress: string) {
  return async (dispatch, getState: GetState) => {
    const publicKey = getPublicKey(getState())
    const gasPrice = getGasPrice(getState())

    try {
      const id = await nocust.withdraw({
        address: publicKey,
        amount,
        gasPrice,
        token: tokenAddress,
      })

      const tx = createOnChainTx({
        id,
        sender: publicKey,
        amount,
        tokenAddress,
        type: TransactionType.WITHDRAWAL_REQUEST,
        gasLimit: WITHDRAWAL_GAS_LIMIT,
        gasPrice,
        confirmationBlocks: Number.MAX_VALUE,
      })
      dispatch(updateTransaction(tx))
    } catch (error) {
      logError(ErrorEvents.WITHDRAWAL_REQUEST_ERROR, {
        nativeError: error,
        publicKey,
        gasLimit: WITHDRAWAL_GAS_LIMIT,
        gasPrice,
        amount: amount.toString(),
        tokenAddress,
      })

      return Promise.reject(error)
    }
  }
}

export function confirmWithdrawal(withdrawalRequestTx: Transaction) {
  return async (dispatch, getState: GetState) => {
    const publicKey = getPublicKey(getState())
    const gasPrice = getGasPrice(getState())

    const tx = createOnChainTx({
      id: '',
      sender: publicKey,
      tokenAddress: withdrawalRequestTx.tokenAddress,
      type: TransactionType.WITHDRAWAL_CONFIRMATION,
      gasLimit: WITHDRAWAL_GAS_LIMIT,
      gasPrice,
    })

    try {
      tx.id = await nocust.confirmWithdrawal({
        address: publicKey,
        gasPrice,
        token: tx.tokenAddress,
      })
      tx.withdrawalRequestId = withdrawalRequestTx.id

      dispatch(updateTransaction(tx))

      return tx.id
    } catch (error) {
      logError(ErrorEvents.WITHDRAWAL_CONFIRMATION_ERROR, {
        nativeError: error,
        publicKey,
        gasLimit: tx.gasLimit,
        gasPrice,
        tokenAddress: tx.tokenAddress,
      })
    }
  }
}

export function stateUpdateChallenge(tokenAddress: string) {
  return async (dispatch, getState: GetState) => {
    const publicKey = getPublicKey(getState())
    const gasPrice = getGasPrice(getState())

    try {
      const id = await nocust.issueStateUpdateChallenge({
        address: publicKey,
        gasPrice,
        token: tokenAddress,
      })

      const tx = createOnChainTx({
        id,
        sender: publicKey,
        tokenAddress,
        type: TransactionType.STATE_UPDATE_CHALLENGE,
        gasLimit: CHALLENGE_GAS_LIMIT,
        gasPrice,
        confirmationBlocks: TX_CONFIRMATION_BLOCKS,
      })
      dispatch(updateTransaction(tx))
    } catch (error) {
      logError(ErrorEvents.STATE_UPDATE_CHALLENGE_ERROR, { nativeError: error })

      return Promise.reject(error)
    }
  }
}

export function deliveryChallenge(txIdToChallenge: number, tokenAddress: string) {
  return async (dispatch, getState: GetState) => {
    const publicKey = getPublicKey(getState())
    const gasPrice = getGasPrice(getState())

    try {
      const id = 123
      // await nocust.issueDeliveryChallenge(
      //   {
      //     publicKey,
      //     txIdToChallenge,
      //     new BigNumber(gasPrice),
      //     CHALLENGE_GAS_LIMIT,
      //     tokenAddress,
      //   }
      // )

      const tx = createOnChainTx({
        id,
        sender: publicKey,
        tokenAddress,
        type: TransactionType.DELIVERY_CHALLENGE,
        gasLimit: CHALLENGE_GAS_LIMIT,
        gasPrice,
        confirmationBlocks: TX_CONFIRMATION_BLOCKS,
      })
      dispatch(updateTransaction(tx))
    } catch (error) {
      logError(ErrorEvents.DELIVERY_CHALLENGE_ERROR, { nativeError: error })

      return Promise.reject(error)
    }
  }
}

export function recoverFunds(tokenAddress: string) {
  return async (dispatch, getState: GetState) => {
    try {
      const id = await nocust.recoverFunds({
        address: getPublicKey(getState()),
        gasPrice: getGasPrice(getState()),
        token: tokenAddress,
      })

      const tx = createOnChainTx({
        id,
        sender: getPublicKey(getState()),
        tokenAddress,
        type: TransactionType.RECOVER_FUNDS,
        gasLimit: TRANSFER_GAS_LIMIT,
        gasPrice: getGasPrice(getState()),
        confirmationBlocks: TX_CONFIRMATION_BLOCKS,
      })
      dispatch(updateTransaction(tx))
    } catch (error) {
      logError(ErrorEvents.RECOVERY_FUNDS_ERROR, { nativeError: error })

      return Promise.reject(error)
    }
  }
}

// HELPERS
function createOnChainTx({
  id,
  sender,
  recipient = '',
  amount = new BigNumber(0),
  tokenAddress,
  type,
  gasLimit,
  gasPrice,
  confirmationBlocks = 0,
}: {
  id: string
  sender: string
  recipient?: string
  amount?: BigNumber
  tokenAddress: string
  type: TransactionType
  gasLimit: number
  gasPrice: string
  confirmationBlocks?: number
}): Transaction {
  return {
    id,
    type,
    amount,
    sender,
    recipient,
    tokenAddress,
    time: Date.now(),
    rejected: false,
    confirmed: false,
    inBlock: false,
    gasPrice: new BigNumber(gasPrice),
    gasLimit,
    confirmationBlocks,
  }
}
