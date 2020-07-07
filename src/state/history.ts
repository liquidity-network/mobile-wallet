import { Vibration } from 'react-native'
import produce from 'immer'
import BigNumber from 'bignumber.js'
import { createSelector } from 'reselect'
import dateFns from 'date-fns'
import { nocust } from 'nocust-client'
import { Transaction } from 'nocust-client/dist/wallet/transaction'
import { AppState, GetState } from '.'
import { getPublicKey } from './auth'
import { confirmWithdrawal } from './tokens/onChain'
import navigation from 'services/navigation'
import { getUnseenTransactionsCount, setUnseenTransactions } from './bottomBar'
import { getCurrentHubId } from './hubs'
import { getCommitChainTokens } from './tokens'
import { AnalyticEvents, logEvent } from 'services/analytics'
import { web3 } from '../services/nocustManager'
export enum TransactionType {
  ON_CHAIN = 1,
  COMMIT_CHAIN = 2,
  DEPOSIT = 3,
  WITHDRAWAL_REQUEST = 4,
  WITHDRAWAL_CONFIRMATION = 5,
  STATE_UPDATE_CHALLENGE = 6,
  DELIVERY_CHALLENGE = 7,
  RECOVER_FUNDS = 8,
}

export interface CustomTransaction {
  id: string
  type: TransactionType
  amount: BigNumber
  sender: string
  recipient: string
  tokenAddress: string
  time: number
  rejected: boolean
  confirmed: boolean
  approved?: boolean
  round?: number // [commit-chain]
  inBlock?: boolean // [on-chain] Is in block-chain already?
  gasPrice?: BigNumber // [on-chain]
  gasLimit?: number // [on-chain]
  gasUsed?: number // [on-chain]
  fee?: BigNumber // [on-chain]
  blockNumber?: number // [on-chain] Number of block in block-chain
  confirmationBlocks?: number // [on-chain] Number of blocks required to confirm after transaction settled to block-chain
  blocksToConfirmation?: number // [on-chain] Number of blocks remained to confirmation
  withdrawalConfirmationId?: string // [WITHDRAWAL_REQUEST] Id of WITHDRAWAL_CONFIRMATION transaction
  withdrawalRequestId?: string // [WITHDRAWAL_CONFIRMATION] Id of WITHDRAWAL_REQUEST transaction
}

interface TransactionRedux extends Omit<CustomTransaction, 'amount' | 'gasPrice' | 'fee'> {
  amount: string
  gasPrice: string
  fee: string
}

// SHAPE
export interface HistoryState {
  [hubId: string]: {
    [id: string]: TransactionRedux
  }
}

const initialState: HistoryState = {}

// TRANSFORMERS
export const transformTransactionFromRedux = (t: TransactionRedux): CustomTransaction => ({
  ...t,
  amount: new BigNumber(t.amount),
  gasPrice: new BigNumber(t.gasPrice),
  fee: new BigNumber(t.fee),
})

// SELECTORS
const getRawHistory = (state: AppState): TransactionRedux[] =>
  Object.values(state.history[getCurrentHubId(state)] || {})
const getFullHistory = createSelector(getRawHistory, rawHistory =>
  rawHistory.map(t => transformTransactionFromRedux(t)),
)
export const getHistory = createSelector(
  getFullHistory,
  // h => mockTransactions,
  h => h.filter(t => t.type !== TransactionType.WITHDRAWAL_CONFIRMATION),
)
export const getSortedHistory = createSelector(
  getHistory,
  (history): Array<{ title: string; data: CustomTransaction[] }> => {
    const processed: { [id: string]: CustomTransaction[] } = {}

    for (let i = 0; i < history.length; i++) {
      const time = dateFns.format(history[i].time, 'YYYYMMDD')
      if (!processed[time]) {
        processed[time] = [history[i]]
      } else {
        processed[time].push(history[i])
      }
    }

    return Object.entries(processed)
      .map(([title, data]) => ({ title, data: data.sort((t1, t2) => t2.time - t1.time) }))
      .sort((v1, v2) => (v1.title < v2.title ? 1 : -1))
  },
)
const getTransactionById = (state: AppState, id: string): CustomTransaction | null => {
  const transactions = state.history[getCurrentHubId(state)]
  const transaction = transactions ? transactions[id] : null
  return transaction ? transformTransactionFromRedux(transaction) : null
}

// ACTION TYPES
const UPDATE_TRANSACTION = 'UPDATE_TRANSACTION'
const UPDATE_TRANSACTIONS = 'UPDATE_TRANSACTIONS'

// REDUCER
export default (state: HistoryState = initialState, action): HistoryState =>
  produce(state, draft => {
    switch (action.type) {
      case UPDATE_TRANSACTION:
        if (!draft[action.hubId]) draft[action.hubId] = {}
        draft[action.hubId][action.transaction.id] = action.transaction
        break
      case UPDATE_TRANSACTIONS:
        if (!draft[action.hubId]) draft[action.hubId] = {}
        action.transactions.forEach(tx => (draft[action.hubId][tx.id] = tx))
    }
  })

// THUNKS
export const updateTransaction = (transaction: CustomTransaction) => {
  return (dispatch, getState: GetState) => {
    const state = getState()
    if (
      transaction.type !== TransactionType.WITHDRAWAL_CONFIRMATION &&
      !getTransactionById(state, transaction.id) &&
      navigation.getCurrentScreen() !== 'TransactionsScreen'
    ) {
      Vibration.vibrate(500, false)

      dispatch(setUnseenTransactions(getUnseenTransactionsCount(state) + 1))
    }

    dispatch({ type: UPDATE_TRANSACTION, transaction, hubId: getCurrentHubId(state) })
  }
}

export const updateTransactions = (transactions: CustomTransaction[]) => {
  return (dispatch, getState: GetState) => {
    const state = getState()

    let isVibrate: boolean
    let unseenCount = 0

    transactions.forEach(transaction => {
      if (
        transaction.type !== TransactionType.WITHDRAWAL_CONFIRMATION &&
        !getTransactionById(state, transaction.id) &&
        navigation.getCurrentScreen() !== 'TransactionsScreen'
      ) {
        isVibrate = true
        unseenCount++
      }
    })

    if (isVibrate) {
      Vibration.vibrate(500, false)

      dispatch(setUnseenTransactions(getUnseenTransactionsCount(state) + unseenCount))
    }

    dispatch({ type: UPDATE_TRANSACTIONS, transactions, hubId: getCurrentHubId(state) })
  }
}

export const fetchHistory = () => async (dispatch, getState: GetState) => {
  const state = getState()
  const publicKey = getPublicKey(state)
  const tokens = getCommitChainTokens(state)
  const currentRound = await nocust.getEon()
  await Promise.all(
    tokens.map(async token => {
      try {
        const transactions: Transaction[] = await nocust.getTransfers({
          offset: 0,
          limit: 50,
          ordering: '-time',
          swap: true,
        })
        const walletInfo = await nocust.getWallet(publicKey, token.address)
        if (transactions.length > 0)
          await dispatch(
            updateTransactions(
              transactions
                .filter(
                  transaction =>
                    transaction.sender.address === token.address &&
                    transaction.eon === currentRound - 1,
                )
                .map(tx => ({
                  id: tx.id.toString(),
                  type: TransactionType.COMMIT_CHAIN,
                  amount: new BigNumber(tx.amount),
                  sender: walletInfo.address,
                  recipient: tx.recipient.address,
                  tokenAddress: walletInfo.token,
                  // @ts-ignore
                  time: tx.timestamp,
                  round: tx.eon,
                  rejected: tx.processed && !tx.complete,
                  approved: tx.processed && tx.complete,
                  confirmed: false,
                })),
            ),
          )
      } catch (e) {
        console.log('fetchHistory', e)
      }
    }),
  )
}

export function updateHistory() {
  return async (dispatch, getState: GetState) => {
    let history = getFullHistory(getState())
    const publicKey = getPublicKey(getState())

    const currentBlock = await web3.eth.getBlockNumber()
    const currentEon = await nocust.getEon()

    // Rejected and confirmed transactions do no need updating
    history = history.filter(t => !(t.rejected || t.confirmed))

    for (const tx of history) {
      const updatedTx =
        tx.type === TransactionType.COMMIT_CHAIN
          ? await updateCommitChainTxStatus(tx, currentEon)
          : await updateOnChainTxStatus(tx, currentBlock)

      // if withdrawal request is ready to confirm, do it
      if (updatedTx.type === TransactionType.WITHDRAWAL_REQUEST) {
        if (updatedTx.inBlock && !updatedTx.rejected && !updatedTx.withdrawalConfirmationId) {
          updatedTx.blocksToConfirmation = await nocust.getBlocksToWithdrawalConfirmation(
            publicKey,
            updatedTx.tokenAddress,
          )

          if (updatedTx.blocksToConfirmation === 0) {
            updatedTx.withdrawalConfirmationId = await dispatch(confirmWithdrawal(updatedTx))

            logEvent(AnalyticEvents.WITHDRAWAL_CONFIRMATION)
          }
        }
      } else if (updatedTx.type === TransactionType.WITHDRAWAL_CONFIRMATION) {
        // if withdrawal confirmation is confirmed, confirm corresponding request
        if (updatedTx.confirmed) {
          const withdrawalTx = getTransactionById(getState(), updatedTx.withdrawalRequestId)
          dispatch(updateTransaction({ ...withdrawalTx, confirmed: true }))
        }
      }

      if (updatedTx !== tx) {
        dispatch(updateTransaction(updatedTx))
      }
    }
  }
}

// HELPERS
const updateOnChainTxStatus = async (
  tx: CustomTransaction,
  currentBlock: number,
): Promise<CustomTransaction> => {
  console.log('transaction', tx)
  const receipt = await web3.eth.getTransactionReceipt(tx.id.toString())
  if (receipt) {
    tx = { ...tx, inBlock: true, blockNumber: receipt.blockNumber, gasUsed: receipt.gasUsed }
    if (receipt.status) {
      // tx is included in block-chain
      tx.fee = new BigNumber(tx.gasPrice).times(tx.gasUsed)

      tx.blocksToConfirmation = Math.max(0, tx.confirmationBlocks - (currentBlock - tx.blockNumber))
      if (tx.blocksToConfirmation === 0) {
        tx.confirmed = true
      }
    } else {
      // tx execution on the block-chain failed
      tx.rejected = true
    }
  }

  return tx
}

async function updateCommitChainTxStatus(
  tx: CustomTransaction,
  currentEon: number,
): Promise<CustomTransaction> {
  return currentEon - tx.round > 1 ? { ...tx, confirmed: true } : tx
}

// const mockTransactions: Transaction[] = [
//   {
//     type: TransactionType.RECOVER_FUNDS,
//     amount: new BigNumber('50000000000000000'),
//     sender: '0xA0B1DBDE81dAd2263ABa4Bab92f092BfA56DbB1F',
//     recipient: '0xA77790f0CC7295834d333b4BFDf9c5738a65D0B5',
//     tokenAddress: '0x66b26B6CeA8557D6d209B33A30D69C11B0993a3a',
//     time: 1540525357576,
//     rejected: false,
//     confirmed: true,
//     id: '360',
//   },
//   {
//     type: TransactionType.STATE_UPDATE_CHALLENGE,
//     amount: new BigNumber('50000000000000000'),
//     sender: '0xA0B1DBDE81dAd2263ABa4Bab92f092BfA56DbB1F',
//     recipient: '0xA77790f0CC7295834d333b4BFDf9c5738a65D0B5',
//     tokenAddress: '0x66b26B6CeA8557D6d209B33A30D69C11B0993a3a',
//     time: 1540525187576,
//     rejected: false,
//     confirmed: true,
//     id: '350',
//   },
//   {
//     type: TransactionType.DELIVERY_CHALLENGE,
//     amount: new BigNumber('50000000000000000'),
//     sender: '0xA0B1DBDE81dAd2263ABa4Bab92f092BfA56DbB1F',
//     recipient: '0xA77790f0CC7295834d333b4BFDf9c5738a65D0B5',
//     tokenAddress: '0x66b26B6CeA8557D6d209B33A30D69C11B0993a3a',
//     time: 1540525387576,
//     rejected: false,
//     confirmed: true,
//     id: '339',
//   },
//   {
//     type: TransactionType.COMMIT_CHAIN,
//     amount: new BigNumber('50000000000000000'),
//     sender: '0xA0B1DBDE81dAd2263ABa4Bab92f092BfA56DbB1F',
//     recipient: '0xA77790f0CC7295834d333b4BFDf9c5738a65D0B5',
//     tokenAddress: '0x66b26B6CeA8557D6d209B33A30D69C11B0993a3a',
//     time: 1549525387576,
//     rejected: false,
//     confirmed: true,
//     id: '395',
//   },
//   {
//     type: TransactionType.COMMIT_CHAIN,
//     amount: new BigNumber('640000000000000000'),
//     sender: '0x10C1DBDE81dAd2263ABa4Bab92f092BfA56DbB1F',
//     recipient: '0xA77790f0CC7295834d333b4BFDf9c5738a65D0B5',
//     tokenAddress: '0x66b26B6CeA8557D6d209B33A30D69C11B0993a3a',
//     time: 1539525387576,
//     rejected: false,
//     confirmed: true,
//     id: '335',
//   },
//   {
//     type: TransactionType.COMMIT_CHAIN,
//     amount: new BigNumber('832500000000000000'),
//     sender: '0xA77790f0CC7295834d333b4BFDf9c5738a65D0B5',
//     recipient: '0xA0B1DBDE81dAd2263ABa4Bab92f092BfA56DbB1F',
//     tokenAddress: '0x66b26B6CeA8557D6d209B33A30D69C11B0993a3a',
//     time: 1549526387576,
//     rejected: false,
//     confirmed: true,
//     id: '338',
//   },
//   {
//     type: TransactionType.ON_CHAIN,
//     amount: new BigNumber('1000000000000000'),
//     sender: '0xA77790f0CC7295834d333b4BFDf9c5738a65D0B5',
//     recipient: '0xd1531f07263d55a94D4c649844dD4f338051a22d',
//     tokenAddress: '0x66b26B6CeA8557D6d209B33A30D69C11B0993a3a',
//     time: 1549452632773,
//     rejected: false,
//     confirmed: true,
//     inBlock: true,
//     id: '0x40cbf9866df7333338fd77b372407b37e6dc212ff0f99604f97a3691908cc7fb',
//     gasPrice: new BigNumber('5000000000'),
//     gasLimit: 200000,
//     fee: new BigNumber('105000000000000'),
//     gasUsed: 21000,
//     blocksToConfirmation: 0,
//   },
//   {
//     type: TransactionType.DEPOSIT,
//     sender: '0xA77790f0CC7295834d333b4BFDf9c5738a65D0B5',
//     recipient: '',
//     tokenAddress: '0x66b26B6CeA8557D6d209B33A30D69C11B0993a3a',
//     time: 1549525368789,
//     rejected: false,
//     confirmed: true,
//     inBlock: true,
//     id: '0xa2e9d97df018ffd21c7ce946eebf80006bfd6fe7ac498c8bf74e3420f21a2b36',
//     gasLimit: 200000,
//     gasUsed: 99530,
//     blocksToConfirmation: 0,
//     amount: new BigNumber('1000000000000000'),
//     gasPrice: new BigNumber('5000000000'),
//     fee: new BigNumber('497650000000000'),
//   },
//   {
//     type: TransactionType.WITHDRAWAL_REQUEST,
//     sender: '0xA77790f0CC7295834d333b4BFDf9c5738a65D0B5',
//     recipient: '',
//     tokenAddress: '0x66b26B6CeA8557D6d209B33A30D69C11B0993a3a',
//     time: 1549525471739,
//     rejected: true,
//     confirmed: false,
//     inBlock: true,
//     id: '0x264eb96a77853152543363a384810d59b382f0149238927a7acc51a740b6d724',
//     gasLimit: 200000,
//     amount: new BigNumber('1000000000000000'),
//     gasPrice: new BigNumber('5000000000'),
//     gasUsed: 198045,
//   },
//   {
//     type: TransactionType.WITHDRAWAL_REQUEST,
//     amount: new BigNumber('1000000000000000'),
//     sender: '0xA77790f0CC7295834d333b4BFDf9c5738a65D0B5',
//     recipient: '',
//     tokenAddress: '0x66b26B6CeA8557D6d209B33A30D69C11B0993a3a',
//     time: 1549526175742,
//     rejected: false,
//     confirmed: true,
//     inBlock: true,
//     id: '0x9fb26949a6478d48ec73caee6de095c0619dd20b11800d3da7e260a9371044e2',
//     gasPrice: new BigNumber('10000000000'),
//     gasLimit: 2000000,
//     fee: new BigNumber('2595570000000000'),
//     gasUsed: 259557,
//     blocksToConfirmation: 0,
//   },
//   {
//     type: TransactionType.ON_CHAIN,
//     amount: new BigNumber('100000000000000000'),
//     sender: '0xA77790f0CC7295834d333b4BFDf9c5738a65D0B5',
//     recipient: '0xd1631f07263d55a94D4c649844dD4f338051a22d',
//     tokenAddress: '0xA9F86DD014C001Acd72d5b25831f94FaCfb48717',
//     time: 1549542830432,
//     rejected: false,
//     confirmed: true,
//     inBlock: true,
//     id: '0x8c7d0177c9ae261e03855b43b3cd916d71dc5ed33418faaba81c405298daaf6a',
//     gasPrice: new BigNumber('9000000000'),
//     gasLimit: 900000,
//     fee: new BigNumber('331803000000000'),
//     gasUsed: 36867,
//     blocksToConfirmation: 0,
//   },
//   {
//     type: TransactionType.DEPOSIT,
//     amount: new BigNumber('1000000000000000000'),
//     sender: '0xA77790f0CC7295834d333b4BFDf9c5738a65D0B5',
//     recipient: '',
//     tokenAddress: '0xA9F86DD014C001Acd72d5b25831f94FaCfb48717',
//     time: 1549542894264,
//     rejected: false,
//     confirmed: false,
//     inBlock: true,
//     id: '0x31d90f9538442aa2c8821104559625858d7e3539cac92304bc543d9b6f7351b2',
//     gasPrice: new BigNumber('9000000000'),
//     gasLimit: 900000,
//     fee: new BigNumber('1135548000000000'),
//     gasUsed: 126172,
//     blocksToConfirmation: 49,
//   },
// ]
