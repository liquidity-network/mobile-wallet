import React, { PureComponent } from 'react'
import { WebView } from 'react-native-webview'

import Header from '../shared/Header'
import { PRIVACY_URL } from 'helpers/static'

export default class TermsScreen extends PureComponent {
  render() {
    return (
      <>
        <Header title="Data Privacy Notice" />

        <WebView style={styles.content} source={{ uri: PRIVACY_URL }} />
      </>
    )
  }
}

const styles: any = {
  content: { marginTop: 10, marginHorizontal: 6, flex: 1 },
}
