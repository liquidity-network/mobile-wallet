import { NavigationActions, StackActions } from 'react-navigation'
import { BackHandler } from 'react-native'
import firebase from 'react-native-firebase'

interface IDelayedAction {
  fn: any
  parameters: any
}

let navigator
const delayedActions: IDelayedAction[] = [] // List of delayed navigation actions

function setNavigator(navigatorRef) {
  navigator = navigatorRef

  if (delayedActions.length > 0) {
    // Execute all delayed navigation actions
    delayedActions.forEach(action => action.fn(...action.parameters))
    delayedActions.length = 0
  }
}

function getCurrentRoute(navigationState) {
  if (!navigationState) return

  const route = navigationState.routes[navigationState.index]

  if (route.routes) return getCurrentRoute(route)

  return route
}

const getCurrentScreen = (): string =>
  navigator ? getCurrentRoute(navigator.state.nav).routeName : ''

const getCurrentScreenParams = <T>(): T => getCurrentRoute(navigator.state.nav).params

function navigate(routeName: string, params?) {
  if (!navigator) {
    delayedActions.push({ fn: navigate, parameters: [routeName, params] })
  } else {
    navigator.dispatch(NavigationActions.navigate({ routeName, params }))

    if (!__DEV__) {
      firebase.analytics().setCurrentScreen(routeName, routeName)
    }
  }
}

function replace(routeName: string, params?) {
  const actionParams: any = { routeName, params }
  navigator.dispatch(StackActions.replace(actionParams))
}

const goBack = () => navigator.dispatch(NavigationActions.back())

const push = (routeName: string, params) =>
  navigator.dispatch(StackActions.push({ routeName, params }))

const pop = (screens: number, immediate: boolean = false) =>
  navigator.dispatch(StackActions.pop({ n: screens, immediate }))

function backButtonHandler() {
  const { routeName, params } = getCurrentRoute(navigator.state.nav)

  if (routeName === 'WelcomeScreen' || routeName === 'HomeScreen') {
    BackHandler.exitApp()
    return true
  }

  if (routeName === 'LockScreen' || routeName === 'LockMainScreen') {
    if (!params.isSetup) {
      BackHandler.exitApp()
      return true
    }
  }

  return false
}

export default {
  navigate,
  replace,
  goBack,
  push,
  pop,
  getCurrentScreen,
  getCurrentScreenParams,
  setNavigator,
  backButtonHandler,
}
