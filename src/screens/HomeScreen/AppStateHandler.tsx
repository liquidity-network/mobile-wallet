import { PureComponent } from 'react'
import { AppState as ApplicationState, AppState } from 'react-native'

import { openLockScreen } from 'routes/navigationActions'
import navigation from 'services/navigation'

interface Props {
  onBackgroundToForeground: () => void
}

export default class AppStateHandler extends PureComponent<Props> {
  currentAppState = 'active'

  timeSwitchedToBackground = 0

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange)
  }

  handleAppStateChange = (nextAppState: string) => {
    // console.trace('appStateChange =====> ' + this.currentAppState + ' ' + nextAppState)
    if (
      this.currentAppState.match(/inactive|background/) &&
      nextAppState === 'active' &&
      Date.now() - this.timeSwitchedToBackground > 15000 && // 15 seconds
      this.timeSwitchedToBackground !== 0
    ) {
      this.props.onBackgroundToForeground()
      openLockScreen({ onComplete: navigation.goBack }, true)
    } else if (nextAppState.match(/inactive|background/)) {
      this.timeSwitchedToBackground = Date.now()
    }

    this.currentAppState = nextAppState
  }

  componentWillUnmount() {
    ApplicationState.removeEventListener('change', this.handleAppStateChange)
  }

  render() {
    return null
  }
}
