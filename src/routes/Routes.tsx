import React, { Component } from 'react'
import { BackHandler, NativeEventSubscription } from 'react-native'

import navigation from 'services/navigation'
import ModalStack from './ModalStack'

export default class Routes extends Component {
  backButtonHandler: NativeEventSubscription

  componentDidMount() {
    this.backButtonHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      navigation.backButtonHandler,
    )
  }

  componentWillUnmount() {
    this.backButtonHandler.remove()
  }

  setNavigatorRef = ref => navigation.setNavigator(ref)

  render() {
    return <ModalStack ref={this.setNavigatorRef} />
  }
}
