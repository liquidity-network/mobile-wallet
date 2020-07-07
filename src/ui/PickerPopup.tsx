import React, { createRef, PureComponent } from 'react'
import { View, TouchableOpacity, Text, Picker } from 'react-native'
import I18n from 'i18n-js'

import Popup from './Popup'
import {
  deviceWidth, WHITE, LIGHTEST_GRAY, LIGHT_GRAY, isAndroid, Grotesk, BLACK, PRIMARY_COLOR, mediumHitSlop
} from 'globalStyles' // prettier-ignore
import navigation from 'services/navigation'

export interface PickerPopupParams {
  data: Array<{ id; value: string }>
  initialId?
  onSubmit: (id) => void
}

interface State {
  currentId: string | number
}

export default class PickerPopup extends PureComponent<{}, State> {
  params = navigation.getCurrentScreenParams<PickerPopupParams>()

  state: State = { currentId: this.params.initialId || this.params.data[0].id }

  popupRef = createRef<Popup>()

  setValue = id => this.setState({ currentId: id }, isAndroid ? this.submitValue : undefined)

  submitValue = () => {
    this.popupRef.current.close()
    this.params.onSubmit(this.state.currentId)
  }

  cancel = () => this.popupRef.current.close()

  render() {
    const { currentId } = this.state
    return isAndroid ? (
      <Popup containerStyle={stylesAndroid.container} ref={this.popupRef}>
        {this.params.data.map(({ id, value }) => (
          <TouchableOpacity
            key={value}
            style={stylesAndroid.itemContainer}
            onPress={() => this.setValue(id)}
            activeOpacity={0.5}
          >
            <Text style={[stylesAndroid.item, currentId === id && stylesAndroid.active]}>
              {value}
            </Text>
          </TouchableOpacity>
        ))}
      </Popup>
    ) : (
      <Popup containerStyle={stylesIos.container} ref={this.popupRef}>
        <Picker selectedValue={currentId} onValueChange={this.setValue}>
          {this.params.data.map(({ id, value }) => (
            <Picker.Item label={value} value={id} key={id} />
          ))}
        </Picker>

        <View style={stylesIos.topBar}>
          <TouchableOpacity onPress={this.cancel} activeOpacity={0.7} hitSlop={mediumHitSlop}>
            <Text style={stylesIos.button}>{I18n.t('cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={this.submitValue} activeOpacity={0.7} hitSlop={mediumHitSlop}>
            <Text style={stylesIos.button}>{I18n.t('submit')}</Text>
          </TouchableOpacity>
        </View>
      </Popup>
    )
  }
}

const itemHeight = 48

const stylesAndroid: any = {
  container: { width: deviceWidth, paddingVertical: 15, backgroundColor: WHITE },
  itemContainer: { justifyContent: 'center', alignItems: 'center', height: itemHeight },
  item: { fontSize: 18, color: BLACK, fontFamily: Grotesk },
  active: { fontSize: 26, color: PRIMARY_COLOR, fontFamily: Grotesk },
}

const stylesIos: any = {
  container: {
    position: 'absolute',
    bottom: 0,
    width: deviceWidth,
    paddingTop: 24,
    backgroundColor: WHITE,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    width: deviceWidth,
    height: 36,
    borderBottomWidth: 1,
    borderColor: LIGHTEST_GRAY,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: WHITE,
  },
  button: { fontSize: 14, color: LIGHT_GRAY },
}
