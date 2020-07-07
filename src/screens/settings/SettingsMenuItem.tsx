import React, { FC, ReactElement, cloneElement } from 'react'
import { TouchableOpacity, Text } from 'react-native'
import Feather from 'react-native-vector-icons/Feather'

import { DARKER_GRAY, deviceWidth, GREY, Grotesk, LIGHT_GRAY } from 'globalStyles'

interface MenuItemProps {
  icon?: ReactElement
  title: string
  text?: string
  onPress?: () => void
  testID?: string
}

const SettingsMenuItem: FC<MenuItemProps> = ({ onPress, icon, title, text, testID }) => (
  <TouchableOpacity
    key={title}
    onPress={onPress}
    style={styles.container}
    activeOpacity={0.7}
    testID={testID}
    disabled={onPress == null}
  >
    {icon
      ? cloneElement(icon, {
          style: icon.props.style ? [icon.props.style, styles.icon] : styles.icon,
        })
      : null}

    <Text style={styles.title}>{title}</Text>

    {text ? (
      <Text style={styles.text}>{text}</Text>
    ) : (
      <Feather name="chevron-right" size={16} color={GREY} />
    )}
  </TouchableOpacity>
)

export default SettingsMenuItem

const styles: any = {
  container: {
    flexDirection: 'row',
    paddingLeft: deviceWidth * 0.045,
    paddingRight: 12,
    height: 40,
    alignItems: 'center',
  },
  icon: { width: 34 },
  title: { flex: 1, fontFamily: Grotesk, fontSize: 15, color: DARKER_GRAY },
  text: { fontFamily: Grotesk, fontSize: 15, color: LIGHT_GRAY },
}
