import React, { FC } from 'react'
import { Text } from 'react-native'

import { ACTIVE_COLOR, deviceWidth, Grotesk } from 'globalStyles'

const SettingsMenuTitle: FC<{ text: string }> = ({ text }) => <Text style={textStyle}>{text}</Text>

export default SettingsMenuTitle

const textStyle = {
  marginLeft: deviceWidth * 0.045,
  marginTop: 20,
  marginBottom: 6,
  fontFamily: Grotesk,
  fontSize: 14,
  color: ACTIVE_COLOR,
}
