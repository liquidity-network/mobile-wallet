import I18n from 'i18n-js'

import en from '../en'

export function initTranslations() {
  I18n.fallbacks = true
  I18n.translations = { en }
}
