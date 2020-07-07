import chalk from 'chalk'
import Web3 from 'web3'
import { ERC20_ABI } from '../src/helpers/erc20Abi'
import BigNumber from 'bignumber.js'

// @ts-ignore
global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest

// export class NocustManagerStorageService implements StorageManagerInterface {
//   store = new Map()
//
//   async get(key: string): Promise<string> {
//     return this.store.get(key)
//   }
//
//   async set(key: string, value: string) {
//     this.store.set(key, value)
//     return true
//   }
//
//   async del(key: string) {
//     this.store.delete(key)
//     return true
//   }
// }

export async function createTestAccounts(): Promise<
  | {
      account1: { publicKey: string; privateKey: string }
      account2: { publicKey: string; privateKey: string }
    }
  | undefined
> {
  // console.log(chalk.green('=== CREATING ACCOUNTS FOR E2E TESTS ==='))
  try {
    const web3 = new Web3(new Web3.providers.HttpProvider('https://limbo.liquidity.network/ethrpc'))
    // const nocustManager = new NocustManager({
    //   rpcApi: web3,
    //   contractAddress: '0x9561C133DD8580860B6b7E504bC5Aa500f0f06a7',
    //   hubApiUrl: 'https://limbo.liquidity.network/',
    //   storageManager: new NocustManagerStorageService(),
    // })
    if (web3.isConnected()) {
      const LQD_ADDRESS = '0xe982E462b094850F12AF94d21D470e21bE9D0E9C'

      // const web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/'))
      // const nocustManager = new NocustManager({
      //   rpcApi: web3,
      //   contractAddress: '0x7e9c7846a22d4D6a8Fde0B586Ab1860B00316611',
      //   hubApiUrl: 'https://rinkeby.liquidity.network/',
      //   storageManager: new NocustManagerStorageService(),
      // })

      // @ts-ignore
      const wallets = web3.eth.accounts.wallet.create(2)
      const ACCOUNT1_PUBLIC = wallets[0].address
      const ACCOUNT1_PRIVATE = wallets[0].privateKey
      const ACCOUNT2_PUBLIC = wallets[1].address
      const ACCOUNT2_PRIVATE = wallets[1].privateKey

      const ROOT_ACCOUNT_PUBLIC = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
      const ROOT_ACCOUNT_PRIVATE =
        '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d'
      web3.eth.accounts.wallet.add(ROOT_ACCOUNT_PRIVATE)

      try {
        const seedParams = { from: ROOT_ACCOUNT_PUBLIC, gas: 6000000, gasPrice: '100000000' }

        await web3.eth.sendTransaction({
          ...seedParams,
          value: web3.utils.toWei('1'),
          to: ACCOUNT1_PUBLIC,
        })
        await web3.eth.sendTransaction({
          ...seedParams,
          value: web3.utils.toWei('1'),
          to: ACCOUNT2_PUBLIC,
        })

        // const balance1 = await web3.eth.getBalance(ACCOUNT1_PUBLIC)
        // console.log('balance1', balance1)
        // const balance2 = await web3.eth.getBalance(ACCOUNT2_PUBLIC)
        // console.log('balance2', balance2)

        const contract = new web3.eth.Contract(ERC20_ABI, LQD_ADDRESS, seedParams)
        await contract.methods
          .transfer(ACCOUNT1_PUBLIC, new BigNumber(web3.utils.toWei('1')).toFixed(0))
          .send()
        await contract.methods
          .transfer(ACCOUNT2_PUBLIC, new BigNumber(web3.utils.toWei('1')).toFixed(0))
          .send()

        // const balance1 = await contract.methods.balanceOf(ACCOUNT1_PUBLIC).call()
        // console.log('balance1', balance1)

        return {
          account1: { privateKey: ACCOUNT1_PRIVATE, publicKey: ACCOUNT1_PUBLIC },
          account2: { privateKey: ACCOUNT2_PRIVATE, publicKey: ACCOUNT2_PUBLIC },
        }
      } catch (error) {
        console.log(chalk.red(error))
      }
    }
  } catch (e) {}
}
