import React, { PureComponent } from 'react'
import { View, RefreshControl, SectionList, StyleSheet, Text } from 'react-native'
import { connect } from 'react-redux'
import { NavigationEvents } from 'react-navigation'
import I18n from 'i18n-js'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import dateFns from 'date-fns'

import Header from '../shared/Header'
import {
  deviceHeight, deviceWidth, globalStyles, GREY, Grotesk, LIGHTER_GRAY,
  LIGHTEST_GRAY, SECONDARY_COLOR, WHITE,
} from 'globalStyles' // prettier-ignore
import { AppState } from 'state'
import { getSortedHistory, Transaction, updateHistory } from 'state/history'
import TransactionsListItem from './TransactionsListItem'
import { setUnseenTransactions } from 'state/bottomBar'

interface Props {
  transactions: Array<{ title: string; data: Transaction[] }>
}

interface State {
  isRefreshing: boolean
}

class TransactionsScreen extends PureComponent<Props & { dispatch }, State> {
  state: State = { isRefreshing: false }

  onFocus = () => {
    this.props.dispatch(setUnseenTransactions(0))
    this.props.dispatch(updateHistory())
  }

  onRefresh = async () => {
    this.setState({ isRefreshing: true })
    try {
      await this.props.dispatch(updateHistory())
    } catch {
      //
    } finally {
      this.setState({ isRefreshing: false })
    }
  }

  keyExtractor = item => item.id

  renderHeader = ({ section: { title } }) => (
    <Text style={styles.header}>
      {dateFns.format(
        title.substr(0, 4) + '/' + title.substr(4, 2) + '/' + title.substr(6, 2),
        'D MMM YYYY',
      )}
    </Text>
  )

  renderItem = ({ item }) => <TransactionsListItem tx={item} key={item.id} />

  renderFooter = () => <View style={styles.footer} />

  render() {
    return (
      <View style={styles.container}>
        <NavigationEvents onDidFocus={this.onFocus} />

        <Header title={I18n.t('transactions')} noBackButton />

        <SectionList
          contentContainerStyle={styles.body}
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={this.onRefresh}
              colors={[WHITE]}
              progressBackgroundColor={SECONDARY_COLOR}
              tintColor={SECONDARY_COLOR}
            />
          }
          keyExtractor={this.keyExtractor}
          // @ts-ignore
          renderSectionHeader={this.renderHeader}
          stickySectionHeadersEnabled
          renderItem={this.renderItem}
          renderSectionFooter={this.renderFooter}
          sections={this.props.transactions}
          ListEmptyComponent={
            <View style={styles.emptyListContainer}>
              <MaterialIcons name="playlist-add" style={styles.emptyListIcon} />

              <Text style={styles.emptyListText}>{I18n.t('no-transactions-so-far')}</Text>
            </View>
          }
        />
      </View>
    )
  }
}

const mapStateToProps = (state: AppState): Props => ({
  transactions: getSortedHistory(state),
})

export default connect(mapStateToProps)(TransactionsScreen)

const styles: any = {
  container: { flex: 1, backgroundColor: WHITE },
  body: { paddingBottom: 100 },
  header: {
    paddingTop: 16,
    paddingLeft: 10,
    paddingBottom: 2,
    fontFamily: Grotesk,
    fontSize: 15,
    color: GREY,
    backgroundColor: WHITE,
  },
  footer: {
    marginLeft: 10,
    width: deviceWidth - 20,
    height: StyleSheet.hairlineWidth,
    backgroundColor: LIGHTEST_GRAY,
  },
  emptyListContainer: { marginTop: deviceHeight * 0.27, alignItems: 'center' },
  emptyListIcon: { fontSize: 80, color: LIGHTER_GRAY },
  emptyListText: { textAlign: 'center', ...globalStyles.P, color: LIGHTER_GRAY },
}
