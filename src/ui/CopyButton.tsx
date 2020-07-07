import React, { PureComponent } from 'react'
import { Text } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import I18n from 'i18n-js'

import { ACTIVE_COLOR, globalStyles, Grotesk, IcoMoon, mediumHitSlop } from 'globalStyles'

interface Props {
  onPress: () => void
}

export default class CopyButton extends PureComponent<Props> {
  render() {
    return (
      <TouchableOpacity
        onPress={this.props.onPress}
        style={globalStyles.inlineCentered}
        hitSlop={mediumHitSlop}
        activeOpacity={0.7}
      >
        <IcoMoon style={styles.icon} name="copy" />
        <Text style={styles.text}>{I18n.t('copy')}</Text>
      </TouchableOpacity>
    )
  }
}

const styles = {
  icon: { fontSize: 14, color: ACTIVE_COLOR, marginRight: 5 },
  text: { fontFamily: Grotesk, fontSize: 12, color: ACTIVE_COLOR },
}
