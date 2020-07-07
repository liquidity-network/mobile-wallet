declare module 'ethereumjs-wallet' {
  class Wallet {
    static fromPrivateKey(key: Buffer): Wallet

    static fromV3(json: string, password: string, nonStrict?: boolean): Wallet

    getPrivateKey(): Buffer

    getAddressString(): string
  }

  namespace Wallet {}

  export = Wallet
}

declare module 'react-native-extra-dimensions-android' {
  class AndroidDimension {
    static getSoftMenuBarHeight():
      | number
      | import('react-native').Animated.Value
      | import('react-native').Animated.ValueXY
      | { x: number; y: number } {
      throw new Error('Method not implemented.')
    }
  }
  export = AndroidDimension
}

declare module 'ethereumjs-wallet/hdkey' {
  class Wallet {
    static fromPrivateKey(key: Buffer): Wallet

    static fromV3(json: string, password: string): Wallet

    getPrivateKey(): Buffer

    getAddressString(): string
  }

  class EthereumHDKey {
    privateExtendedKey(): string

    publicExtendedKey(): string

    derivePath(path: string): EthereumHDKey

    deriveChild(index: number): EthereumHDKey

    getWallet(): Wallet
  }

  export function fromMasterSeed(seed: Buffer): EthereumHDKey
  export function fromExtendedKey(base58key: string): EthereumHDKey
}
