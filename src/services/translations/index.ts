import { I18nManager, NativeModules } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import I18n from 'i18n-js'

import en from './en'
import ru from './ru'
import ch from './ch'
import es from './es'
import ar from './ar'
import { isIos } from 'globalStyles'

export async function initTranslations() {
  try {
    const locale = await AsyncStorage.getItem('liq/locale')

    if (!locale) {
      I18n.locale = isIos
        ? NativeModules.SettingsManager.settings.AppleLocale.substr(0, 2)
        : (I18nManager as any).localeIdentifier.substr(0, 2)
      AsyncStorage.setItem('liq/locale', I18n.locale)
    } else {
      I18n.locale = locale
    }
    // console.log('initTranslations', I18n.currentLocale())
  } catch {
    console.log('Error reading local from async storage')
  }

  I18n.fallbacks = true
  I18n.translations = { en, ru, ch, es, ar }
}
