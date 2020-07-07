import React, { createRef, PureComponent } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Slider from '@react-native-community/slider'
import { connect } from 'react-redux'
import I18n from 'i18n-js'

import Popup from 'ui/Popup'
import {
  deviceWidth, GREEN, Grotesk, GroteskBold, isIos, LIGHT_GRAY, LIGHTEST_GRAY, mediumHitSlop, WHITE,
} from 'globalStyles' // prettier-ignore
import { AppState } from 'state'
import { getGasPrice, setGasPrice } from '../../state/config'

interface Props {
  gasPrice: string
}

interface State {
  value: number
  qrString: string
}

class GasPricePopup extends PureComponent<Props & { dispatch }, State> {
  state: State = { qrString: null, value: 1 }

  popupRef = createRef<Popup>()

  componentDidMount() {
    this.setState({ value: parseInt(this.props.gasPrice) / 1000000000 })
  }

  onValueChange = (value: number) => this.setState({ value })

  submitValue = () => {
    this.popupRef.current.close()

    this.props.dispatch(setGasPrice((this.state.value * 1000000000).toFixed(0)))
  }

  cancel = () => this.popupRef.current.close()

  render() {
    return (
      <Popup containerStyle={styles.container} ref={this.popupRef}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={this.cancel} activeOpacity={0.7} hitSlop={mediumHitSlop}>
            <Text style={styles.button}>{I18n.t('cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={this.submitValue} activeOpacity={0.7} hitSlop={mediumHitSlop}>
            <Text style={styles.button}>Confirm</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.valueContainer}>
          <Text style={styles.value}>{this.state.value.toFixed(1)}</Text>
          <Text style={styles.points}>GWei</Text>
        </View>

        <Slider
          style={styles.slider}
          value={this.state.value}
          onValueChange={this.onValueChange}
          minimumTrackTintColor={GREEN}
          minimumValue={1}
          maximumValue={50}
        />
      </Popup>
    )
  }
}

const mapStateToProps = (state: AppState): Props => ({ gasPrice: getGasPrice(state) })

export default connect(mapStateToProps)(GasPricePopup)

const styles: any = {
  container: {
    position: 'absolute',
    bottom: 0,
    width: deviceWidth,
    paddingBottom: 50,
    backgroundColor: WHITE,
  },
  topBar: {
    width: deviceWidth,
    height: 36,
    marginBottom: 45,
    borderBottomWidth: 1,
    borderColor: LIGHTEST_GRAY,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: WHITE,
  },
  button: { fontSize: 14, color: LIGHT_GRAY },
  valueContainer: {
    left: -7,
    marginBottom: 30,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  value: {
    width: 130,
    textAlign: 'right',
    fontFamily: Grotesk,
    color: GREEN,
    fontSize: 48,
    lineHeight: 48,
  },
  points: {
    top: isIos ? 5 : 4.5,
    marginLeft: 6,
    fontFamily: GroteskBold,
    color: GREEN,
    fontSize: 22,
    lineHeight: 48,
  },
  slider: { flex: 1, marginHorizontal: deviceWidth * 0.1 },
}
