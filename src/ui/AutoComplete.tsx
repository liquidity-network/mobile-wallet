import React, { Component, ReactElement } from 'react'
import { View } from 'react-native'

import { ACTIVE_COLOR, WHITE } from 'globalStyles'

interface Props {
  data: Array<any>
  renderItem: ({ item }) => ReactElement
  keyExtractor
  renderTextInput: () => ReactElement
}

export default class AutoComplete extends Component<Props> {
  render() {
    return (
      <View style={styles.container}>
        {this.props.renderTextInput()}

        {this.props.data.length > 0 && (
          <View>
            <View style={styles.list}>
              {this.props.data.map(item => this.props.renderItem({ item }))}
            </View>
          </View>
        )}
      </View>
    )
  }
}

const styles: any = {
  container: { zIndex: 1 },
  list: {
    position: 'absolute',
    top: -1,
    left: 0,
    right: 0,
    borderColor: ACTIVE_COLOR,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: WHITE,
  },
}
