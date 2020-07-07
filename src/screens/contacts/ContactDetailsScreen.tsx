import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import {
  View, Text, Clipboard, ScrollView, StyleSheet, TouchableOpacity, Alert,
} from 'react-native' // prettier-ignore
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import I18n from 'i18n-js'

import Header from '../shared/Header'
import {
  BLACK, KIMBERLY_SEMITRANSPARENT, deviceWidth, globalStyles, LIGHTEST_GRAY, Grotesk, MUTED_COLOR,
} from 'globalStyles' // prettier-ignore
import CopyButton from 'ui/CopyButton'
import navigation from 'services/navigation'
import { showSnack, SnackType } from 'ui/Snack'
import Button from 'ui/Button'
import { deleteContact } from 'state/contacts'
import { openSendScreen } from 'routes/navigationActions'
import { logEvent, AnalyticEvents } from 'services/analytics'

export interface ContactDetailsScreenParams {
  name: string
  address: string
}

class ContactDetailsScreen extends PureComponent<{ dispatch }> {
  params = navigation.getCurrentScreenParams<ContactDetailsScreenParams>()

  copyAddress = () => {
    Clipboard.setString(this.params.address)

    showSnack({
      type: SnackType.INFO,
      message: I18n.t('address') + ' ' + I18n.t('has-been-copied'),
      duration: 1500,
    })
  }

  openSendScreen = () => openSendScreen({ to: this.params.address })

  promptDeleting = () =>
    Alert.alert('Delete', 'Are You sure You want to delete this contact?', [
      { text: 'Delete', onPress: this.delete },
      { text: 'Cancel', onPress: () => null },
    ])

  delete = () => {
    this.props.dispatch(deleteContact(this.params.address))

    logEvent(AnalyticEvents.DELETE_CONTACT)

    navigation.goBack()
  }

  render() {
    return (
      <View style={globalStyles.flexOne}>
        <Header title={I18n.t('contact-details')} />
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.block}>
            <View style={globalStyles.inlineToSides}>
              <Text style={styles.title}>{I18n.t('name')}</Text>
            </View>
            <Text style={styles.text}>{this.params.name}</Text>
          </View>

          <View style={styles.block}>
            <View style={globalStyles.inlineToSides}>
              <Text style={styles.title}>{I18n.t('address')}</Text>

              <CopyButton onPress={this.copyAddress} />
            </View>

            <Text style={styles.text}>{this.params.address}</Text>
          </View>

          <View style={styles.buttonsContainer}>
            <Button
              style={styles.sendButton}
              text={I18n.t('send-funds')}
              onPress={this.openSendScreen}
            />

            <TouchableOpacity activeOpacity={0.7} onPress={this.promptDeleting}>
              <EvilIcons name="trash" style={styles.deleteIcon} size={36} color={MUTED_COLOR} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    )
  }
}

export default connect()(ContactDetailsScreen)

const styles: any = {
  body: { paddingHorizontal: deviceWidth * 0.06 },
  block: {
    marginTop: 15,
    width: '100%',
    paddingBottom: 20,
    borderColor: LIGHTEST_GRAY,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontFamily: Grotesk,
    fontSize: 12,
    letterSpacing: 0.2,
    color: KIMBERLY_SEMITRANSPARENT,
  },
  text: {
    marginTop: 10,
    fontFamily: Grotesk,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.25,
    color: BLACK,
  },
  viewButton: { marginVertical: 25 },
  buttonsContainer: { marginTop: 20, flexDirection: 'row', alignItems: 'center' },
  sendButton: { width: '100%' },
  deleteIcon: { marginLeft: 10, left: 6 },
}
