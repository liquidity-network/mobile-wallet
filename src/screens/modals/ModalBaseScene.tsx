import React, { Component } from 'react'
import { View } from 'react-native'

type State<P> = P & {
  visible: boolean
}

abstract class ModalBaseScene<P extends object = {}> extends Component<any, State<P>> {
  abstract renderModal(): React.ReactElement<any>

  render() {
    const { isVisible } = this.props
    if (isVisible) {
      return this.renderModal()
    } else {
      return <View />
    }
  }
}

export default ModalBaseScene
