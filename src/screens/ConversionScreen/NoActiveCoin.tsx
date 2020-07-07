import React from 'react'
import { Text, View } from 'react-native'
import { BG_COLOR } from 'globalStyles'
import I18n from 'i18n-js'

const NoActiveCoin = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.textStyle}>{I18n.t('no-active-coin')}</Text>
    </View>
  )
}

const styles: any = {
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
    display: 'flex',
    justifyContent: 'center',
    alignItem: 'center',
  },
  textStyle: {
    color: 'white',
    textAlign: 'center',
    fontSize: 30,
  },
}

export default NoActiveCoin
