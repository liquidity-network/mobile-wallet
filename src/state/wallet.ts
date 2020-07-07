import Bip39 from 'bip39'

import { getPublicKey, setupKeys, KeyType } from './auth'
import { disposeCurrentHub, getCurrentNetwork, initHub } from './hubs'
import { activateToken, getTokens } from './tokens'
import { getTokensMetadata } from './tokensMetadata'
import { GetState } from '.'
import { getIdByAddressNetwork, InteractionManager } from 'helpers/general'
import { executeHeartBeat, signToSPrivacy } from './etc'
import { openWelcomeScreen } from 'routes/navigationActions'
import { keychain } from 'services/keychain'
import { deleteContact } from './contacts'
import { removePushNotificationsToken } from './notifications'

// THUNKS
export const createWallet = (skipKeysSetup?: boolean) => async (dispatch, getState: GetState) => {
  try {
    console.log('skip Keys Setup', skipKeysSetup)
    if (!skipKeysSetup) {
      // const mnemonic: string = __DEV__
      //   ? 'oblige useless pair size viable hunt catalog spice strike audit route broccoli'
      //   : Bip39.generateMnemonic()
      const mnemonic: string = Bip39.generateMnemonic()
      await dispatch(setupKeys(mnemonic, KeyType.PASSPHRASE))
      console.log('keySetup success')
    }

    await dispatch(initHub())

    dispatch(signToSPrivacy())

    console.log('initHub success')

    const tokensMetadata = getTokensMetadata(getState())
    const tokens = getTokens(getState())

    await Promise.all(
      tokens.map(async token => {
        if (!token.activated) {
          const tokenMetadata: any =
            tokensMetadata[getIdByAddressNetwork(token.address, getCurrentNetwork(getState()))]
          if (tokenMetadata && tokenMetadata.preactivated) {
            await dispatch(activateToken(token.address, token.commitChain))
          }
        }
      }),
    )
  } catch (error) {
    return Promise.reject(error)
  }
}

export const wipeWallet = () => (dispatch, getState: GetState) => {
  InteractionManager.runAfterInteractions(async () => {
    try {
      await dispatch(removePushNotificationsToken())

      dispatch(disposeCurrentHub())

      dispatch(deleteContact(getPublicKey(getState())))

      dispatch({ type: 'WIPE_WALLET' })

      await keychain.wipe()

      dispatch(executeHeartBeat())
      openWelcomeScreen()
    } catch {}
  })
}
