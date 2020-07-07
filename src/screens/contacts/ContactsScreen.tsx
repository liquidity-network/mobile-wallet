import React, { PureComponent } from 'react'
import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import { connect } from 'react-redux'
import Entypo from 'react-native-vector-icons/Entypo'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import I18n from 'i18n-js'

import {
  globalStyles, GREY, isIos, deviceWidth, mediumHitSlop, LIGHTER_GRAY, deviceHeight, WHITE
} from 'globalStyles' // prettier-ignore
import Header from '../shared/Header'
import ContactsListItem from './ContactsListItem'
import TextInput from 'ui/TextInput'
import navigation from 'services/navigation'
import { Contact, getContacts } from 'state/contacts'
import { AppState } from 'state'
import { openCreateContactScreen } from 'routes/navigationActions'

interface State {
  searchMode: boolean
  searchText: string
}

interface Props {
  contacts: Contact[]
  isEmpty: boolean
}

class ContactsScreen extends PureComponent<Props, State> {
  state: State = {
    searchMode: false,
    searchText: '',
  }

  enableSearchMode = () => this.setState({ searchMode: true, searchText: '' })

  disableSearchMode = () => this.setState({ searchMode: false })

  goBack = () => (this.state.searchMode ? this.disableSearchMode() : navigation.goBack())

  onSearchTextChange = searchText => this.setState({ searchText })

  keyExtractor = (item: Contact): string => item.address

  renderItem = ({ item }) => <ContactsListItem name={item.name} address={item.address} />

  render() {
    const { searchMode, searchText } = this.state
    let { contacts } = this.props

    if (searchMode && searchText !== '') {
      contacts = contacts.filter(
        c =>
          c.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1 ||
          c.address.toLowerCase().indexOf(searchText.toLowerCase()) > -1,
      )
    }

    return (
      <View style={globalStyles.flexOne}>
        <Header
          title={searchMode ? I18n.t('search-contact') : I18n.t('address-book')}
          right={
            searchMode ? (
              <TouchableOpacity
                onPress={this.disableSearchMode}
                hitSlop={mediumHitSlop}
                activeOpacity={0.7}
              >
                <Text style={styles.closeText}>{I18n.t('close')}</Text>
              </TouchableOpacity>
            ) : (
              <View style={globalStyles.inlineCentered}>
                {!this.props.isEmpty && (
                  <TouchableOpacity
                    onPress={this.enableSearchMode}
                    hitSlop={searchHitSlop}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="search" style={styles.search} />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  hitSlop={plusHitSlop}
                  activeOpacity={0.7}
                  onPress={openCreateContactScreen}
                >
                  <Entypo name="plus" style={styles.plus} />
                </TouchableOpacity>
              </View>
            )
          }
        />

        <View style={globalStyles.flexOne}>
          {searchMode && (
            <>
              <Text style={styles.searchTitle}>{I18n.t('address-or-name')}</Text>

              <TextInput
                style={styles.input}
                placeholder="Bob"
                value={this.state.searchText}
                autoCorrect={false}
                autoCapitalize="none"
                onChangeText={this.onSearchTextChange}
              />
            </>
          )}

          {this.props.isEmpty ? (
            <TouchableOpacity
              style={styles.emptyListButton}
              activeOpacity={0.7}
              onPress={openCreateContactScreen}
            >
              <MaterialIcons name="playlist-add" style={styles.emptyListIcon} />

              <Text style={styles.emptyListText}>{I18n.t('no-contacts')}</Text>
            </TouchableOpacity>
          ) : (
            <FlatList
              contentContainerStyle={styles.listContainer}
              data={contacts}
              renderItem={this.renderItem}
              keyExtractor={this.keyExtractor}
            />
          )}
        </View>
      </View>
    )
  }
}

const mapStateToProps = (state: AppState): Props => ({
  contacts: getContacts(state),
  isEmpty: getContacts(state).length === 0,
})

export default connect(mapStateToProps)(ContactsScreen)

const styles: any = {
  closeText: { ...globalStyles.P_SMALL, color: WHITE },
  plus: { marginRight: 4, top: isIos ? 1 : 0, fontSize: 28, color: WHITE },
  search: { marginRight: 15, top: 1, fontSize: 24, color: WHITE },
  title: { ...globalStyles.P_SMALL, color: GREY },
  searchTitle: { marginTop: 5, marginLeft: 16, ...globalStyles.P },
  input: { marginTop: 6, marginLeft: 16, width: deviceWidth - 32 },
  emptyListButton: { marginTop: deviceHeight * 0.27, alignItems: 'center' },
  emptyListIcon: { fontSize: 80, color: LIGHTER_GRAY },
  emptyListText: { ...globalStyles.P, color: LIGHTER_GRAY },
  listContainer: { paddingBottom: 50 },
}

const searchHitSlop = { left: 10, right: 10, top: 10, bottom: 10 }
const plusHitSlop = { left: 5, right: 10, top: 10, bottom: 10 }
