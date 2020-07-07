import { rootReducer } from 'state'

export let mockedState

export const createMockedState = () => {
  const { setCurrentHub, updateHubsInfo } = require('state/hubs')

  mockedState = rootReducer(undefined, { type: 'NOOP' })

  mockedState = rootReducer(
    mockedState,
    updateHubsInfo({
      '0x66b26B6CeA8557D6d209B33A30D69C11B0993a3a-4': {
        active: true,
        id: '0x66b26B6CeA8557D6d209B33A30D69C11B0993a3a-4',
        api: 'https://rinkeby.liquidity.network/',
        providers: { default: 'https://rinkeby.infura.io/v3/e8068e2bf73f475fbb58556ea626bcc5' },
        contract: '0x66b26B6CeA8557D6d209B33A30D69C11B0993a3a',
        network: 4,
        name: 'RinkebyHub #1',
        registeredTokens: [
          '0x66b26B6CeA8557D6d209B33A30D69C11B0993a3a',
          '0xA9F86DD014C001Acd72d5b25831f94FaCfb48717',
        ],
      },
    }),
  )

  mockedState = rootReducer(
    mockedState,
    setCurrentHub('0x66b26B6CeA8557D6d209B33A30D69C11B0993a3a-4'),
  )
}

export const mockedGetState = () => mockedState
export const mockedDispatch = action =>
  typeof action === 'function'
    ? action(mockedDispatch, mockedGetState)
    : (mockedState = rootReducer(mockedState, action))
