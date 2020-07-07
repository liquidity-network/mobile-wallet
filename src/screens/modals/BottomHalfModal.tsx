import React from 'react'
import { StyleSheet } from 'react-native'
// @ts-ignore
import Modal from 'react-native-modal'
import ModalBaseScene from './ModalBaseScene'
import DefaultModalContent from './DefaultModalContent'

class BottomHalfModal extends ModalBaseScene {
  renderModal(): React.ReactElement<any> {
    return (
      <Modal
        testID="modal"
        isVisible={this.props.isVisible}
        onSwipeComplete={this.props.close}
        onBackdropPress={this.props.close}
        swipeDirection={['up', 'left', 'right', 'down']}
        style={styles.view}
      >
        <DefaultModalContent>{this.props.children}</DefaultModalContent>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  view: {
    justifyContent: 'flex-end',
    margin: 0,
  },
})

export default BottomHalfModal
