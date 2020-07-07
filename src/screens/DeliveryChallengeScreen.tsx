import React, { PureComponent } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { connect } from 'react-redux'
import I18n from 'i18n-js'
import { nocust } from 'nocust-client'

import Header from './shared/Header'
import { deviceWidth, globalStyles, GREY } from 'globalStyles'
import { AppState } from 'state'
import { getHistory, Transaction, TransactionType } from 'state/history'
import TransactionsListItem from './TransactionsScreen/TransactionsListItem'

interface Props {
  transactions: Transaction[]
}

interface State {
  previousRound: number
}

class DeliveryChallengeScreen extends PureComponent<Props, State> {
  state: State = { previousRound: -10 }

  async componentDidMount() {
    const currentRound = await nocust.getEon()
    this.setState({ previousRound: currentRound - 1 })
  }

  render() {
    const transactions = [...this.props.transactions]
      .filter(t => t.type === TransactionType.COMMIT_CHAIN)
      .filter(t => (t.round ? t.round >= this.state.previousRound : true))
      .sort((t1, t2) => t2.time - t1.time)
    return (
      <View style={globalStyles.flexOne}>
        <Header title={I18n.t('initiate-delivery-challenge')} />

        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.hint}>{I18n.t('initiate-delivery-challenge-description')}</Text>

          {this.state.previousRound !== -10 &&
            transactions.map(t => <TransactionsListItem tx={t} challengeMode key={t.id} />)}
        </ScrollView>
      </View>
    )
  }
}

const mapStateToProps = (state: AppState): Props => ({
  transactions: getHistory(state),
})

export default connect(mapStateToProps)(DeliveryChallengeScreen)

const styles: any = {
  body: { paddingBottom: 150 },
  hint: {
    marginVertical: 20,
    paddingHorizontal: deviceWidth * 0.06,
    textAlign: 'center',
    ...globalStyles.P,
    color: GREY,
  },
}
