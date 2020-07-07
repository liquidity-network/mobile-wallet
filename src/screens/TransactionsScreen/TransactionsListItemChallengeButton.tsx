import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import I18n from 'i18n-js'

import Button from 'ui/Button'
import { deliveryChallenge } from 'state/tokens/onChain'
import { hideCurrentSnack, showSnack, SnackType } from 'ui/Snack'
import { Transaction } from 'state/history'

interface Props {
  tx: Transaction
}

class TransactionsListItemChallengeButton extends PureComponent<Props & { dispatch }> {
  deliveryChallenge = async () => {
    try {
      showSnack({
        type: SnackType.WAITING,
        title: 'Processing transaction',
        message: I18n.t('be-patient'),
        duration: 60000,
      })

      await this.props.dispatch(
        deliveryChallenge(parseInt(this.props.tx.id, 10), this.props.tx.tokenAddress),
      )

      hideCurrentSnack()
    } catch {
      showSnack({ type: SnackType.FAIL, title: I18n.t('transaction-failed') })
    }
  }

  render() {
    return <Button text={I18n.t('start-delivery-challenge')} onPress={this.deliveryChallenge} />
  }
}

export default connect()(TransactionsListItemChallengeButton)
