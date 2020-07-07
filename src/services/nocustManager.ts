import { nocust } from 'nocust-client'
import { StorageEngine } from 'nocust-client/dist/services/storage'
import Web3 from 'web3'

class NocustManagerStorageService implements StorageEngine {
  storage = {}

  async get(key: string): Promise<string> {
    return this.storage[key] || ''
  }

  async set(key: string, value: string): Promise<boolean> {
    this.storage[key] = value
    return true
  }

  async delete(key: string): Promise<boolean> {
    delete this.storage[key]
    return true
  }
}

let web3: Web3

export const createNocustManager = async (
  providerUrl: string,
  contractAddress: string,
  operatorUrl: string,
  privateKey: string,
) => {
  try {
    await nocust.init({
      contractAddress: contractAddress,
      rpcUrl: providerUrl,
      operatorUrl: operatorUrl,
      storageEngine: new NocustManagerStorageService(),
      privateKey,
    })
    await nocust.addPrivateKey(privateKey)
    web3 = new Web3(new Web3.providers.HttpProvider(providerUrl))
    web3.eth.accounts.wallet.clear()
    web3.eth.accounts.wallet.add(privateKey)
  } catch (e) {
    console.log('creatNocust', e)
  }
}

export { web3 }
