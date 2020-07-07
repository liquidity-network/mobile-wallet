import React, { PureComponent } from 'react'
import { Linking } from 'react-native'
import I18n from 'i18n-js'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import EvilIcons from 'react-native-vector-icons/EvilIcons'

import Header from '../shared/Header'
import { GREY, isAndroid } from 'globalStyles'
import { isStaging, LIQUIDITY_WEBSITE_URL, TELEGRAM_URL } from 'helpers/static'
import Item from './SettingsMenuItem'
import Title from './SettingsMenuTitle'
import { logEvent, AnalyticEvents } from 'services/analytics'
import { openPrivacyScreen, openTermsScreen } from '../../routes/navigationActions'

export default class AboutSettingsScreen extends PureComponent {
  openWebsite = () => {
    Linking.openURL(LIQUIDITY_WEBSITE_URL)

    logEvent(AnalyticEvents.OPEN_WEBSITE)
  }

  openTelegram = () => {
    Linking.openURL(TELEGRAM_URL)

    logEvent(AnalyticEvents.OPEN_TELEGRAM)
  }

  render() {
    return (
      <>
        <Header title={I18n.t('about')} />

        <Title text="Community" />

        <Item
          title="Official website"
          icon={<FontAwesome size={16} color={GREY} name="globe" />}
          onPress={this.openWebsite}
        />

        <Item
          title="Telegram channel"
          icon={<EvilIcons size={22} color={GREY} name="sc-telegram" style={styles.telegramIcon} />}
          onPress={this.openTelegram}
        />

        <Title text="Terms" />

        <Item
          title="Terms of Service"
          icon={
            <MaterialCommunityIcons
              size={16}
              color={GREY}
              name="ruler-square"
              style={styles.termsIcon}
            />
          }
          onPress={openTermsScreen}
        />

        <Item
          title="Data Privacy Notice"
          icon={<MaterialCommunityIcons size={18} color={GREY} name="incognito" />}
          onPress={openPrivacyScreen}
        />

        <Title text="Information" />

        <Item
          title={I18n.t('application-version')}
          text={require('../../../package.json').version + (isStaging ? ' [STAGING]' : '')}
        />
      </>
    )
  }
}

const styles: any = {
  telegramIcon: { left: -2.5 },
  // TODO react-native-vector-icons Android workaround, get rid when will be fixed
  termsIcon: { left: isAndroid ? -16 : undefined },
}
