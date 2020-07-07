// Is app run in dev mode or published as testing app
export const isStaging = __DEV__ || process.env.REACT_NATIVE_ENV === 'staging'

// Addresses
export const MAINNET_EXPLORER = 'https://etherscan.io/tx/'
export const TESTNET_EXPLORER = 'https://rinkeby.etherscan.io/tx/'

export const LIQUIDITY_WEBSITE_URL = 'https://liquidity.network/'

export const TELEGRAM_URL = 'https://t.me/liquiditynetwork'

export const TOS_URL = 'https://liquidity-network.github.io/terms/tos'
export const PRIVACY_URL = 'https://liquidity-network.github.io/terms/privacy'

// Currencies
export const COMMIT_CHAIN_NAME_PREFIX = 'f'

export enum CurrencyType {
  ERC20 = 'ERC20',
  WEI = 'WEI',
  FIAT = 'FIAT',
}
