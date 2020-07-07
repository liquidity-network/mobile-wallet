import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Text } from 'react-native'

import { AppState } from 'state'
import { Grotesk, RED, WHITE } from 'globalStyles'
import { getHubConnectionError } from 'state/hubs'
import Tweenable from 'ui/Tweenable'

interface Props {
  hubConnectionError: string | null
}

class HomeScreenHubConnectionFailed extends PureComponent<Props> {
  render() {
    return this.props.hubConnectionError ? (
      <Tweenable tweens={[{ from: 0, to: 1, property: 'opacity' }]} style={styles.container}>
        <Text style={styles.text}>Hub connection issues</Text>
      </Tweenable>
    ) : null
  }
}

const mapStateToProps = (state: AppState): Props => ({
  hubConnectionError: getHubConnectionError(state),
})

export default connect(mapStateToProps)(HomeScreenHubConnectionFailed)

const styles: any = {
  container: {
    position: 'absolute',
    top: -42,
    alignSelf: 'center',
    paddingVertical: 10,
    width: 248,
    backgroundColor: RED,
    alignItems: 'center',
    borderRadius: 3,
  },
  text: { fontFamily: Grotesk, fontSize: 14, color: WHITE },
}
