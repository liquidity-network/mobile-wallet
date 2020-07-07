import React, { PureComponent } from 'react'
import { View, Text } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { connect } from 'react-redux'

import {
  openContactsScreen, openBackupPassphraseScreen,
} from 'routes/navigationActions' // prettier-ignore
import {
  ACTIVE_COLOR, deviceWidth, Grotesk, IcoMoon, mediumHitSlop, statusBarHeight, WHITE,
} from 'globalStyles' // prettier-ignore
import Button from 'ui/Button'
import Tweenable from 'ui/Tweenable'
import { AppState } from 'state'
import { didBackupPassphrase } from 'state/auth'

interface Props {
  showBanner: boolean
}

class HomeScreenTopSection extends PureComponent<Props> {
  render() {
    return (
      <>
        {this.props.showBanner && (
          <Tweenable tweens={[{ property: 'translateY', from: -statusBarHeight - 60, to: -10 }]}>
            <View style={styles.banner} testID="BackupPassphraseBanner">
              <View>
                <Text style={styles.title}>Backup passphrase</Text>
                <Text style={styles.info} numberOfLines={1}>
                  Your funds are not safe until You do it!
                </Text>
              </View>

              <Button
                onPress={openBackupPassphraseScreen}
                style={styles.actionButton}
                text="Save"
                outline
                transparent
                testID="BackupPassphraseBannerButton"
              />
            </View>
          </Tweenable>
        )}

        <View style={this.props.showBanner ? styles.iconsContainer : styles.iconsContainerNoBanner}>
          <TouchableOpacity
            onPress={openContactsScreen}
            activeOpacity={0.7}
            hitSlop={mediumHitSlop}
            testID="HomeScreenContactsButton"
          >
            <IcoMoon name="address-book" style={styles.bookIcon} />
          </TouchableOpacity>
        </View>
      </>
    )
  }
}

const mapStateToProps = (state: AppState): Props => ({
  showBanner: !didBackupPassphrase(state),
})

export default connect(mapStateToProps)(HomeScreenTopSection)

const styles: any = {
  banner: {
    paddingTop: statusBarHeight + 10,
    paddingRight: 12,
    paddingLeft: 15,
    width: deviceWidth,
    height: statusBarHeight + 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ACTIVE_COLOR,
  },
  title: { marginBottom: 3, fontFamily: Grotesk, fontSize: 16, color: WHITE },
  info: { fontFamily: Grotesk, fontSize: 12, color: WHITE },
  actionButton: { width: 70, height: 36 },
  iconsContainer: { alignSelf: 'flex-start' },
  iconsContainerNoBanner: { alignSelf: 'flex-start', paddingTop: statusBarHeight + 10 },
  bookIcon: { paddingLeft: 12, fontSize: 38, color: '#fff', width: 50 },
}
