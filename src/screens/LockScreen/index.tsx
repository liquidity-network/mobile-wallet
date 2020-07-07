import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import TouchID from 'react-native-touch-id'
import I18n from 'i18n-js'

import { keychain } from '../../services/keychain'
import { AuthMethod, getAuthMethod, getLockedUntil, setLockedUntil } from '../../state/auth'
import navigation from '../../services/navigation'
import PinLockView from './PinLockView'
import { AppState } from '../../state'
import FingerLockView from './FingerLockView'
import { logEvent, AnalyticEvents } from 'services/analytics'

const ATTEMPTS_LIMIT = 3
const ATTEMPT_LOCK_OUT_TIME = 60 * 1000
const PIN_LENGTH = 6

export interface LockScreenParams {
  onComplete: Function
  isSetup?: boolean
  showBackButton?: boolean
}

interface Props {
  authMethod: AuthMethod
  lockedUntil: number
}

interface State {
  currentPin: string
  currentAttempt: number
  incorrectPin: boolean
  firstPinEntered: string
  confirmingPin: boolean
}

class LockScreen extends PureComponent<Props & { dispatch }, State> {
  params = navigation.getCurrentScreenParams<LockScreenParams>()

  state: State = {
    currentPin: '',
    currentAttempt: 0,
    incorrectPin: false,
    firstPinEntered: '',
    confirmingPin: false,
  }

  addDigit = (digit: string) => {
    if (this.state.currentPin.length === 6 || this.props.lockedUntil > Date.now()) return

    if (this.state.currentAttempt === ATTEMPTS_LIMIT) this.setState({ currentAttempt: 0 })

    this.setState({ incorrectPin: false, currentPin: this.state.currentPin + digit }, async () => {
      if (this.state.currentPin.length < PIN_LENGTH) return

      if (this.params.isSetup) {
        if (!this.state.confirmingPin) {
          setTimeout(this.proceedToPinConfirmation, 200)
        } else if (this.state.firstPinEntered === this.state.currentPin) {
          this.completePinSetup()
        } else {
          this.failPinSetup()
        }
      } else {
        this.checkPinCorrectness()
      }
    })
  }

  deleteDigit = () =>
    this.setState({ incorrectPin: false, currentPin: this.state.currentPin.slice(0, -1) })

  proceedToPinConfirmation = () =>
    this.setState({ confirmingPin: true, firstPinEntered: this.state.currentPin, currentPin: '' })

  failPinSetup = () =>
    this.setState({ confirmingPin: false, currentPin: '', firstPinEntered: '', incorrectPin: true })

  async completePinSetup() {
    await keychain.savePin(this.state.currentPin)
    this.params.onComplete()
  }

  async checkPinCorrectness() {
    const pin = await keychain.getPin()

    if (this.state.currentPin === pin) {
      setTimeout(this.params.onComplete, 200)
    } else {
      this.setState(
        { currentPin: '', incorrectPin: true, currentAttempt: this.state.currentAttempt + 1 },
        () => {
          if (this.state.currentAttempt === ATTEMPTS_LIMIT) {
            this.props.dispatch(setLockedUntil(Date.now() + ATTEMPT_LOCK_OUT_TIME))

            logEvent(AnalyticEvents.PIN_ATTEMPTS_LIMIT_EXCEEDED)
          }
        },
      )
    }
  }

  startAuth = async () => {
    try {
      await TouchID.authenticate(I18n.t('unlock-wallet'), {
        unifiedErrors: true,
        passcodeFallback: true,
      })
      this.params.onComplete()
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    return this.props.authMethod === AuthMethod.PIN ? (
      <PinLockView
        lockedUntil={this.props.lockedUntil}
        setup={this.params.isSetup}
        showBackButton={this.params.showBackButton}
        addDigit={this.addDigit}
        deleteDigit={this.deleteDigit}
        confirmingPin={this.state.confirmingPin}
        currentPin={this.state.currentPin}
        incorrectPin={this.state.incorrectPin}
      />
    ) : (
      <FingerLockView showBackButton={this.params.showBackButton} startAuth={this.startAuth} />
    )
  }
}

const mapStateToProps = (state: AppState): Props => ({
  authMethod: getAuthMethod(state),
  lockedUntil: getLockedUntil(state),
})

export default connect(mapStateToProps)(LockScreen)
