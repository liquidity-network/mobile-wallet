import React, { PureComponent } from 'react'
import { View, Image, Text } from 'react-native'

import { ACTIVE_COLOR, globalStyles, WHITE } from 'globalStyles'

interface Props {
  url?: string
  name?: string
  small?: boolean
}

export default class Avatar extends PureComponent<Props> {
  render() {
    const containerStyles = this.props.small ? styles.containerSmall : styles.container
    return this.props.url != null ? (
      <Image source={{ uri: this.props.url }} style={containerStyles} />
    ) : (
      <View style={containerStyles}>
        {this.props.name != null && (
          <Text style={this.props.small ? styles.initialsSmall : styles.initials}>
            {getNameInitials(this.props.name)}
          </Text>
        )}
      </View>
    )
  }
}

const styles: any = {
  container: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: ACTIVE_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { ...globalStyles.P_BIG, color: WHITE },
}
styles.containerSmall = { ...styles.container, width: 32, height: 32, borderRadius: 16 }
styles.initialsSmall = { ...styles.initials, fontSize: 14 }

function getNameInitials(name) {
  const words = name.split(' ')
  return `${words[0] ? words[0][0].toUpperCase() : ''}${words[1] ? words[1][0].toUpperCase() : ''}`
}
