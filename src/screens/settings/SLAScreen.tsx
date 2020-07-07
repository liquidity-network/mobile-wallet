import React, { PureComponent } from 'react'
import { View, Text } from 'react-native'
import { connect } from 'react-redux'
import dateFns from 'date-fns'
import I18n from 'i18n-js'
import { NOCUSTError, nocust } from 'nocust-client'

import Header from '../shared/Header'
import navigation from 'services/navigation'
import { BG_COLOR, deviceWidth, globalStyles, GREEN, Grotesk, WHITE } from 'globalStyles'
import Button from 'ui/Button'
import { AppState } from 'state'
import { getPublicKey } from 'state/auth'
import { showSnack, SnackType } from 'ui/Snack'
import { AnalyticEvents, logEvent } from 'services/analytics'

interface Props {
  publicKey: string
}

interface State {
  slaStatus: number
  buttonDisabled: boolean
}

class SLAScreen extends PureComponent<Props, State> {
  state = { slaStatus: -1, buttonDisabled: false }

  componentDidMount() {
    this.checkSLA()
  }

  checkSLA = async () => {
    try {
      const slaStatus = await nocust.getSLAStatus(this.props.publicKey)
      this.setState({ slaStatus, buttonDisabled: slaStatus > 0 })
    } catch (e) {
      console.log(e)
    }
  }

  buySLA = async () => {
    showSnack({
      type: SnackType.WAITING,
      title: 'Processing transaction',
      message: I18n.t('be-patient'),
      duration: 60000,
    })

    this.setState({ buttonDisabled: true })

    try {
      await nocust.buySLA(this.props.publicKey)

      logEvent(AnalyticEvents.BUY_SLA)

      await this.checkSLA()
    } catch (e) {
      const message =
        e.code === NOCUSTError.INSUFFICIENT_COMMIT_CHAIN_BALANCE ? 'Not enough fLQD' : undefined
      this.setState({ buttonDisabled: false })
      return showSnack({ type: SnackType.FAIL, title: 'Buying failed', message })
    }

    navigation.goBack()
    showSnack({ type: SnackType.SUCCESS, title: 'SLA activated' })
  }

  renderStatus() {
    if (this.state.slaStatus === -1) {
      return null
    } else if (this.state.slaStatus > 0) {
      return <Text style={[styles.status, styles.statusActive]}>ACTIVE</Text>
    } else {
      return <Text style={styles.status}>INACTIVE</Text>
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Header title="SLA" transparent />

        <View style={styles.body}>
          <View style={styles.infoContainer}>
            <Text style={styles.info}>
              You can do 100 transactions per day for free on the commit-chain. To get unlimited
              transactions for one month you need to buy a SLA at a price of 1{`\u00A0`}fLQD.
            </Text>
          </View>

          <View style={styles.statusContainer}>
            <Text style={[styles.status, styles.statusTitle]}>STATUS:</Text>

            {this.renderStatus()}
          </View>

          {this.state.slaStatus > 0 && (
            <Text style={styles.expires}>
              Expires: {dateFns.format(this.state.slaStatus, 'MM/DD/YY HH:mm')}
            </Text>
          )}

          <Button
            text="Buy SLA for 1 month"
            onPress={this.buySLA}
            disabled={this.state.buttonDisabled}
            style={styles.button}
          />
        </View>
      </View>
    )
  }
}

const mapStateToProps = (state: AppState): Props => ({
  publicKey: getPublicKey(state),
})

export default connect(mapStateToProps)(SLAScreen)

const styles: any = {
  container: { flex: 1, backgroundColor: BG_COLOR },
  body: { paddingHorizontal: deviceWidth * 0.06 },
  infoContainer: {
    marginBottom: 35,
    alignSelf: 'stretch',
    paddingTop: 15,
    paddingBottom: 15,
    paddingHorizontal: 18,
    backgroundColor: '#ffffff10',
  },
  info: { ...globalStyles.P, lineHeight: 21, color: WHITE },
  status: { fontFamily: Grotesk, fontSize: 23, color: WHITE },
  statusTitle: { marginRight: 10 },
  statusActive: { color: GREEN },
  statusContainer: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center' },
  expires: { alignSelf: 'center', marginTop: 10, ...globalStyles.P_SMALL, color: WHITE },
  button: { marginTop: 35 },
}
