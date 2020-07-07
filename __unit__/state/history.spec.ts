import {
  TransactionType, updateTransaction, Transaction, updateTransactions, getHistory,
  transformTransactionFromRedux,
} from 'state/history' // prettier-ignore
import { getUnseenTransactionsCount } from 'state/bottomBar'
import { createMockedState, mockedDispatch, mockedGetState, mockedState } from './mockedRedux'

const mockVibrate = jest.fn()
jest.mock('react-native/Libraries/Vibration/Vibration', () => ({ vibrate: mockVibrate }))

describe('hubs duck', () => {
  const tx1: any = {
    id: 'tx1',
    type: TransactionType.COMMIT_CHAIN,
    sender: 'sender',
    amount: '1',
    fee: '1',
    gasPrice: '1',
  }
  const tx1updated = { ...tx1, sender: 'senderUpdated' }
  const tx2: any = {
    id: 'tx2',
    type: TransactionType.WITHDRAWAL_REQUEST,
    sender: 'sender',
    amount: '1',
    fee: '1',
    gasPrice: '1',
  }

  createMockedState()

  describe('updateTransaction', () => {
    it('should correctly store data', () => {
      updateTransaction(tx1)(mockedDispatch, mockedGetState)
      expect(getHistory(mockedState)).toEqual([transformTransactionFromRedux(tx1)])

      updateTransaction(tx2)(mockedDispatch, mockedGetState)
      expect(getHistory(mockedState)).toEqual([
        transformTransactionFromRedux(tx1),
        transformTransactionFromRedux(tx2),
      ])
    })

    it('should vibrate and show notification on bottom bar on new transactions', () => {
      expect(mockVibrate).toBeCalledTimes(2)

      expect(getUnseenTransactionsCount(mockedState)).toEqual(2)
    })

    it('should correctly overwrite data', () => {
      updateTransaction(tx1updated as Transaction)(mockedDispatch, mockedGetState)
      expect(getHistory(mockedState)).toEqual([
        transformTransactionFromRedux(tx1updated),
        transformTransactionFromRedux(tx2),
      ])
    })

    it('should not vibrate and show notification on update of existing transactions', () => {
      expect(mockVibrate).toBeCalledTimes(2)

      expect(getUnseenTransactionsCount(mockedState)).toEqual(2)
    })
  })

  describe('updateTransactions', () => {
    it('should correctly store data', () => {
      createMockedState()

      updateTransactions([tx1, tx2])(mockedDispatch, mockedGetState)
      expect(getHistory(mockedState)).toEqual([
        transformTransactionFromRedux(tx1),
        transformTransactionFromRedux(tx2),
      ])
    })

    it('should vibrate and show notification on bottom bar on new transactions', () => {
      expect(mockVibrate).toBeCalledTimes(3)

      expect(getUnseenTransactionsCount(mockedState)).toEqual(2)
    })

    it('should correctly overwrite data', () => {
      updateTransactions([tx1updated])(mockedDispatch, mockedGetState)
      expect(getHistory(mockedState)).toEqual([
        transformTransactionFromRedux(tx1updated),
        transformTransactionFromRedux(tx2),
      ])
    })

    it('should not vibrate and show notification on update of existing transactions', () => {
      expect(mockVibrate).toBeCalledTimes(3)

      expect(getUnseenTransactionsCount(mockedState)).toEqual(2)
    })
  })
})
