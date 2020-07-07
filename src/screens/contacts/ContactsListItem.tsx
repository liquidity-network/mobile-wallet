import React, { PureComponent } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'

import Avatar from 'ui/Avatar'
import { BLACK, deviceWidth, GREY, Grotesk, LIGHTEST_GRAY } from 'globalStyles'
import { shortenAddress } from 'helpers/conversion'
import { openContactDetailsScreen } from 'routes/navigationActions'

interface Props {
  name: string
  address: string
  thumbUrl?: string
  last?: boolean
  onPress?: (address: string) => void
}

export default class ContactsListItem extends PureComponent<Props> {
  onPress = () =>
    this.props.onPress
      ? this.props.onPress(this.props.address)
      : openContactDetailsScreen({
          name: this.props.name,
          address: this.props.address,
        })

  render() {
    return (
      <TouchableOpacity style={styles.container} activeOpacity={0.7} onPress={this.onPress}>
        <View style={styles.avatarContainer}>
          <Avatar url={this.props.thumbUrl} name={this.props.name} />
        </View>

        <View style={!this.props.last && styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {this.props.name}
          </Text>

          <Text style={styles.address}>{shortenAddress(this.props.address, 12)}</Text>
        </View>
      </TouchableOpacity>
    )
  }
}

const styles: any = {
  container: { marginLeft: 16, width: deviceWidth - 16, height: 67, flexDirection: 'row' },
  avatarContainer: { width: 64, paddingTop: 12 },
  infoContainer: {
    flex: 1,
    paddingRight: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: LIGHTEST_GRAY,
  },
  name: { marginTop: 14, fontFamily: Grotesk, fontSize: 16, color: BLACK },
  address: { marginTop: 3, fontFamily: Grotesk, fontSize: 14, color: GREY },
}
