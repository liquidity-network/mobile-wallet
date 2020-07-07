import React, { PureComponent } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { HubInfo } from 'state/hubs'
import {
  deviceWidth, globalStyles, GREEN, Grotesk, PRIMARY_COLOR, RED, WHITE,
} from 'globalStyles' // prettier-ignore
import { shortenAddress } from 'helpers/conversion'

interface Props {
  hub: HubInfo
  current: boolean
  switchHub: (id: string) => void
}

export default class HubSettingsItem extends PureComponent<Props> {
  switchHub = () => this.props.switchHub(this.props.hub.id)

  render() {
    const { hub, current } = this.props
    return (
      <TouchableOpacity
        onPress={this.switchHub}
        style={[
          styles.container,
          current && styles.containerCurrent,
          !hub.active && styles.containerDisabled,
        ]}
        activeOpacity={0.8}
        disabled={!hub.active}
      >
        <Text style={[styles.title, current && styles.current]}>{hub.name}</Text>

        <Text style={[styles.text, current && styles.current]} numberOfLines={1}>
          Provider: {hub.providers.default}
        </Text>
        <Text style={[styles.text, current && styles.current]} numberOfLines={1}>
          API: {hub.api}
        </Text>
        <Text style={[styles.text, current && styles.current]} numberOfLines={1}>
          Contract: {shortenAddress(hub.contract, 8)}
        </Text>

        <View style={globalStyles.inline}>
          <Text style={[styles.text, current && styles.current, styles.network]}>
            Network: {hub.network}
          </Text>

          {hub.active ? (
            <Text style={[styles.text, styles.green]}>ACTIVE</Text>
          ) : (
            <Text style={[styles.text, styles.red]}>INACTIVE</Text>
          )}
        </View>
      </TouchableOpacity>
    )
  }
}

const styles: any = {
  container: {
    marginTop: 20,
    width: deviceWidth * 0.88,
    marginLeft: deviceWidth * 0.06,
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: deviceWidth * 0.04,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: PRIMARY_COLOR,
    alignItems: 'center',
  },
  containerCurrent: { backgroundColor: PRIMARY_COLOR },
  containerDisabled: { opacity: 0.6 },
  title: { marginBottom: 5, fontFamily: Grotesk, fontSize: 18, color: PRIMARY_COLOR },
  current: { color: WHITE },
  text: { fontFamily: Grotesk, fontSize: 13, color: PRIMARY_COLOR },
  network: { marginRight: deviceWidth * 0.05 },
  green: { color: GREEN },
  red: { color: RED },
}
