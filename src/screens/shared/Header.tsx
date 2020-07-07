import React, { PureComponent, ReactElement } from 'react'
import { View, Text } from 'react-native'

import navigation from 'services/navigation'
import {
  BG_COLOR, deviceWidth, Grotesk, isIos, statusBarHeight, WHITE,
} from 'globalStyles' // prettier-ignore
import BackButton from 'ui/BackButton'

interface Props {
  title?: string
  goBackScreen?: string
  noBackButton?: boolean
  transparent?: boolean
  left?: ReactElement<any> | false
  right?: ReactElement<any>
  content?: ReactElement<any>
}

export default class Header extends PureComponent<Props> {
  goBack = () =>
    this.props.goBackScreen ? navigation.navigate(this.props.goBackScreen) : navigation.goBack()

  render() {
    const { title, left, right, noBackButton, transparent, content } = this.props
    return (
      <View
        style={[styles.container, !transparent && styles.containerNonTransparent]}
        pointerEvents="box-none"
      >
        <View style={styles.topBar}>
          {title != null && <Text style={styles.topBarTitle}>{title}</Text>}

          {left != null
            ? left
            : !noBackButton && <BackButton onPress={this.goBack} testID="BackButton" />}

          {right}
        </View>

        {content}

        {!transparent && <View style={styles.bottomDecoration} />}
      </View>
    )
  }
}

const styles: any = {
  container: { width: deviceWidth },
  containerNonTransparent: { backgroundColor: BG_COLOR },
  topBar: {
    marginTop: statusBarHeight,
    marginBottom: 18,
    paddingHorizontal: 12,
    width: deviceWidth,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarIcon: { fontSize: 20, color: WHITE, opacity: 0.75 },
  topBarTitle: {
    position: 'absolute',
    top: isIos ? 18 : 16,
    width: deviceWidth,
    textAlign: 'center',
    fontFamily: Grotesk,
    fontSize: 18,
    color: WHITE,
  },
  bottomDecoration: {
    position: 'absolute',
    bottom: 0,
    width: deviceWidth,
    height: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: WHITE,
  },
}
