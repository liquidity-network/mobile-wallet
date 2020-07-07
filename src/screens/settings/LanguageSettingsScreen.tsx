import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ViewProps } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import I18n from 'i18n-js'
import RNRestart from 'react-native-restart'

import Header from '../shared/Header'
import { deviceWidth, Grotesk } from 'globalStyles'
import RadioIcon from 'ui/RadioIcon'
import { logEvent, AnalyticEvents } from '../../services/analytics'

interface State {
  currentLanguage: string
}

export default class LanguageSettingsScreen extends PureComponent<ViewProps, State> {
  state = { currentLanguage: I18n.currentLocale() }

  setLocale = async (locale: string) => {
    if (locale === this.state.currentLanguage) return

    logEvent(AnalyticEvents.SWITCH_LANGUAGE)

    this.setState({ currentLanguage: locale })
    I18n.locale = locale
    await AsyncStorage.setItem('liq/locale', I18n.currentLocale())

    RNRestart.Restart()
  }

  render() {
    return (
      <>
        <Header title={I18n.t('language')} />

        <View style={styles.body}>
          <TouchableOpacity
            onPress={() => this.setLocale('en')}
            style={[styles.item, styles.itemFirst]}
            activeOpacity={0.8}
          >
            <Text style={styles.title}>English</Text>

            <RadioIcon enabled={this.state.currentLanguage === 'en'} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => this.setLocale('ch')}
            style={[styles.item, styles.itemFirst]}
            activeOpacity={0.8}
          >
            <Text style={styles.title}>中文</Text>

            <RadioIcon enabled={this.state.currentLanguage === 'ch'} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => this.setLocale('ru')}
            style={styles.item}
            activeOpacity={0.8}
          >
            <Text style={styles.title}>Русский</Text>

            <RadioIcon enabled={this.state.currentLanguage === 'ru'} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => this.setLocale('es')}
            style={[styles.item, styles.itemFirst]}
            activeOpacity={0.8}
          >
            <Text style={styles.title}>Español</Text>

            <RadioIcon enabled={this.state.currentLanguage === 'es'} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => this.setLocale('ar')}
            style={[styles.item, styles.itemFirst]}
            activeOpacity={0.8}
          >
            <Text style={styles.title}>عربى</Text>

            <RadioIcon enabled={this.state.currentLanguage === 'ar'} />
          </TouchableOpacity>
        </View>
      </>
    )
  }
}

const styles: any = {
  body: { paddingHorizontal: deviceWidth * 0.06 },
  item: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#ebeef4',
  },
  itemFirst: { borderTopWidth: 0 },
  title: {
    fontFamily: Grotesk,
    fontSize: 16,
    letterSpacing: 0.25,
    color: '#0a0514',
  },
}
