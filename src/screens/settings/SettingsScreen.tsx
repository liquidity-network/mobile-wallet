import React, { PureComponent } from 'react'
import { Alert, Image, ScrollView, View } from 'react-native'
import { connect } from 'react-redux'
import I18n from 'i18n-js'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

import { globalStyles, GREY, IcoMoon, WHITE } from 'globalStyles' // prettier-ignore
import { AppState } from 'state'
import { AuthMethod, getAuthMethod, getPrivateKeyType, KeyType } from 'state/auth'
import Header from '../shared/Header'
import {
  openAboutSettingsScreen, openBackupPassphraseScreen, openHubMonitoringScreen,
  openHubSettingsScreen, openLanguageSettingsScreen, openSLAScreen, openTokenSelectionScreen,
} from 'routes/navigationActions' // prettier-ignore
import { wipeWallet } from 'state/wallet'
import Item from './SettingsMenuItem'
import { liquidityLogoTitle } from '../../../assets/images'
import Title from './SettingsMenuTitle'
import { AnalyticEvents, logEvent } from 'services/analytics'

interface Props {
  authMethod: AuthMethod
  privateKeyType: KeyType
}

class SettingsScreen extends PureComponent<Props & { dispatch }> {
  wipeWallet = () => {
    Alert.alert(
      'Wipe Wallet',
      'You are about to wipe all wallet information. This operation is not reversable!',
      [
        { text: 'Cancel', onPress: () => null, style: 'cancel' },
        {
          text: 'Wipe',
          onPress: () => {
            this.props.dispatch(wipeWallet())
            logEvent(AnalyticEvents.WIPE_WALLET)
          },
          style: 'destructive',
        },
      ],
    )
  }

  render() {
    const items = [
      <Title key={0} text="Hub" />,
      <Item
        key={1}
        title="Select active hub"
        icon={<IcoMoon size={16} color={GREY} name="select-hub" />}
        onPress={openHubSettingsScreen}
        testID="SettingsScreenSelectHubButton"
      />,
      <Item
        key={2}
        title="SLA status"
        icon={<IcoMoon size={16} color={GREY} name="sla" />}
        onPress={openSLAScreen}
      />,
      <Item
        key={3}
        title={I18n.t('hub-monitoring')}
        icon={<FontAwesome size={18} color={GREY} name="eye" />}
        onPress={openHubMonitoringScreen}
      />,
      <Title key={4} text="Wallet" />,
      <Item
        key={5}
        title="Select active coins"
        icon={<IcoMoon size={14} color={GREY} name="select-coins" />}
        onPress={openTokenSelectionScreen}
        testID="SettingsScreenCoinsButton"
      />,
      this.props.privateKeyType === KeyType.PASSPHRASE ? (
        <Item
          key={6}
          title={I18n.t('passphrase')}
          icon={<IcoMoon size={16} color={GREY} name="passphrase" />}
          onPress={openBackupPassphraseScreen}
        />
      ) : null,
      <Item
        key={7}
        title="Wipe wallet"
        icon={<IcoMoon size={16} color={GREY} name="wipe-wallet" />}
        onPress={this.wipeWallet}
      />,
      <Title key={8} text="General" />,
      <Item
        key={9}
        title={I18n.t('language')}
        icon={<IcoMoon size={11} color={GREY} name="language" />}
        onPress={openLanguageSettingsScreen}
      />,
      <Item
        key={10}
        title={I18n.t('about')}
        icon={<IcoMoon size={16} color={GREY} name="info-circle" />}
        onPress={openAboutSettingsScreen}
      />,
    ]

    return (
      <View style={globalStyles.flexOne}>
        <Header title={I18n.t('settings')} noBackButton />

        <ScrollView contentContainerStyle={styles.body}>
          {items}

          <Image source={liquidityLogoTitle} style={styles.logo} />
        </ScrollView>
      </View>
    )
  }
}

const mapStateToProps = (state: AppState): Props => ({
  authMethod: getAuthMethod(state),
  privateKeyType: getPrivateKeyType(state),
})

export default connect(mapStateToProps)(SettingsScreen)

const styles: any = {
  body: { paddingBottom: 80, backgroundColor: WHITE },
  logo: { alignSelf: 'center', marginTop: 12, width: 86, height: 47, resizeMode: 'contain' },
}
