import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { Image, Text, View } from 'react-native'

import { deviceHeight, deviceWidth, Grotesk, WHITE, BLACK } from 'globalStyles'
import { sadFaceImage } from '../../assets/images'
import Header from './shared/Header'
import Button from 'ui/Button'
import { fetchCriticalData, isCriticalDataPresent } from 'state/etc'
import { openRootResolver } from 'routes/navigationActions'
import { AppState } from '../state'

interface Props {
  isCriticalDataPresent: boolean
}

interface State {
  isConnecting: boolean
}

class NoConnectionScreen extends PureComponent<Props & { dispatch }, State> {
  state: State = { isConnecting: false }

  connect = async () => {
    try {
      this.setState({ isConnecting: true })
      await this.props.dispatch(fetchCriticalData())

      this.setState({ isConnecting: false }, () => {
        if (this.props.isCriticalDataPresent) openRootResolver()
      })
    } catch (error) {
      this.setState({ isConnecting: false })
    }
  }

  render() {
    return (
      <View style={{ display: 'flex', flex: 1, backgroundColor: BLACK }}>
        <Header title="No Connection" transparent noBackButton />

        <Image style={styles.image} source={sadFaceImage} />

        <Text style={styles.message}>
          Connecting server issues, please check internet connection.
        </Text>

        <Button
          style={styles.button}
          text="CONNECT"
          onPress={this.connect}
          disabled={this.state.isConnecting}
        />
      </View>
    )
  }
}

const mapStateToProps = (state: AppState): Props => ({
  isCriticalDataPresent: isCriticalDataPresent(state),
})

export default connect(mapStateToProps)(NoConnectionScreen)

const IMAGE_WIDTH = deviceWidth * 0.275
const IMAGE_HEIGHT = (IMAGE_WIDTH / 890) * 500
const styles: any = {
  image: {
    marginTop: deviceHeight * 0.15,
    alignSelf: 'center',
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
  },
  message: {
    marginTop: deviceHeight * 0.075,
    paddingHorizontal: deviceWidth * 0.15,
    textAlign: 'center',
    fontFamily: Grotesk,
    fontSize: 16,
    color: WHITE,
  },
  button: { marginTop: deviceHeight * 0.06, width: 300, alignSelf: 'center' },
}
