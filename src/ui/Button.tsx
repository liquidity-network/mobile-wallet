import React, { PureComponent, ReactElement } from 'react'
import {
  View, Text, ViewProps, RegisteredStyle, TextStyle, TouchableOpacityProps,
} from 'react-native' // prettier-ignore
import { TouchableOpacity } from 'react-native-gesture-handler'

import { WHITE, isAndroid, Grotesk, PRIMARY_COLOR, MUTED_COLOR } from 'globalStyles'

interface Props {
  text: string
  style?: ViewProps
  textStyle?: RegisteredStyle<TextStyle>
  icon?: ReactElement<any>
  disabled?: boolean
  transparent?: boolean
  outline?: boolean
}

export default class Button extends PureComponent<Props & ViewProps & TouchableOpacityProps> {
  wrapWithContainer(props, children) {
    return isAndroid ? (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={props.onPress}
        disabled={props.disabled}
        // background={TouchableNativeFeedback.Ripple('#7D5CFF')}
      >
        <View {...props} pointerEvents="box-only">
          {children}
        </View>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity onPress={props.onPress} disabled={props.disabled} activeOpacity={0.7}>
        <View {...props} pointerEvents="box-only">
          {children}
        </View>
      </TouchableOpacity>
    )
  }

  render() {
    const { style, textStyle, outline, transparent, disabled, ...restProps } = this.props
    const props = {
      ...restProps,
      disabled,
      style: [
        styles.container,
        transparent && styles.transparent,
        disabled && styles.containerDisabled,
        outline && styles.outline,
        style,
      ],
    }
    return this.wrapWithContainer(
      props,
      <>
        {this.props.icon}
        <Text style={[styles.text, textStyle]}>{this.props.text}</Text>
      </>,
    )
  }
}

const styles = {
  container: {
    alignSelf: 'stretch',
    height: 46,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: PRIMARY_COLOR,
  },
  transparent: { backgroundColor: undefined },
  containerDisabled: { backgroundColor: MUTED_COLOR },
  outline: { borderWidth: 1, borderColor: WHITE },
  text: {
    top: isAndroid ? -1 : 0,
    color: WHITE,
    fontSize: 16,
    fontFamily: Grotesk,
  },
}
