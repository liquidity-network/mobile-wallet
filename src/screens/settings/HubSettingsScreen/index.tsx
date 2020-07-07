import React, { PureComponent } from 'react'
import { ScrollView, View } from 'react-native'
import { connect } from 'react-redux'
import I18n from 'i18n-js'

import { BG_COLOR, WHITE } from 'globalStyles'
import Header from 'screens/shared/Header'
import { AppState } from 'state'
import { hideCurrentSnack, showSnack, SnackType } from 'ui/Snack'
import { getCurrentHubId, getHubsList, HubInfo, switchHub } from 'state/hubs'
import HubSettingsItem from './HubSettingsItem'
import { isStaging } from 'helpers/static'
import { openHomeScreen, openWelcomeScreen } from 'routes/navigationActions'
import { AnalyticEvents, logEvent } from 'services/analytics'

interface Props {
  currentHub: string
  hubs: HubInfo[]
}

class HubSettingsScreen extends PureComponent<Props & { dispatch }> {
  switchHub = async (id: string) => {
    if (this.props.currentHub !== id) {
      try {
        showSnack({ type: SnackType.WAITING, message: 'Switching hub...', duration: 60000 })

        await this.props.dispatch(switchHub(id))

        logEvent(AnalyticEvents.SWITCH_HUB)

        openHomeScreen()
      } catch (e) {
        openWelcomeScreen()
      } finally {
        hideCurrentSnack()
      }
    }
  }

  render() {
    let { hubs } = this.props
    if (!isStaging) {
      hubs = hubs.filter(h => h.name.indexOf('TestHub') === -1)
    }
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.body}>
          <Header title={I18n.t('switch-hub')} />

          {hubs.map(hub => (
            <HubSettingsItem
              key={hub.id}
              hub={hub}
              current={hub.id === this.props.currentHub}
              switchHub={this.switchHub}
            />
          ))}
        </ScrollView>
      </View>
    )
  }
}

const mapStateToProps = (state: AppState): Props => ({
  currentHub: getCurrentHubId(state),
  hubs: Object.values(getHubsList(state)),
})

export default connect(mapStateToProps)(HubSettingsScreen)

const styles: any = {
  container: { backgroundColor: BG_COLOR },
  body: { paddingBottom: 100, backgroundColor: WHITE },
}
