import { BigNumber } from 'bignumber.js'
import { roundStripZeros } from '../../src/helpers/conversion'

describe('roundStripZeros', () => {
  it('should output 0.000000001 to 0.000000001 with decimals = 18', () =>
    expect(roundStripZeros(new BigNumber(0.000000001), 18)).toEqual('0.000000001'))
  it('should output 0.0 to 0 with decimals = 18', () =>
    expect(roundStripZeros(new BigNumber(0), 18)).toEqual('0'))
  it('should output 0 to 0 with decimals = 18', () =>
    expect(roundStripZeros(new BigNumber(0), 18)).toEqual('0'))
})
