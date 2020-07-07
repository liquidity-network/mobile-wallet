import React, { PureComponent } from 'react'
import {
  Animated, ActivityIndicator, Image, Text, TouchableWithoutFeedback, View, StyleSheet, ViewProps
} from 'react-native' // prettier-ignore

import {
  BLACK, deviceHeight, deviceWidth, GREEN, Grotesk, RED, WHITE,
} from 'globalStyles' // prettier-ignore
import { failPopupIcon, successPopupIcon } from '../../assets/images'

export enum SnackType {
  INFO = 1,
  SUCCESS = 2,
  FAIL = 3,
  WAITING = 4,
}

interface State {
  type: number | null
  duration?: number | null
  title?: string | null
  message?: string | null
  bottomContent?: any
  alertShown?: boolean
}

const HIDE_DURATION = 350

const blankState: State = {
  type: null,
  duration: null,
  title: null,
  message: null,
  bottomContent: null,
  alertShown: false,
}

export class Snack extends PureComponent<ViewProps, State> {
  state: State = { ...blankState }

  animatedValue = new Animated.Value(0)

  animatedTransform = [
    {
      translateY: this.animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [deviceHeight, 0],
      }),
    },
  ]

  timeoutHide

  showSnack() {
    const { type, duration, alertShown } = this.state
    if (alertShown) return

    this.setState({ alertShown: true }, () =>
      Animated.spring(this.animatedValue, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 5,
      }).start(
        () =>
          (this.timeoutHide = setTimeout(
            this.hideSnack,
            duration || (type === SnackType.FAIL ? 4000 : 2500),
          )),
      ),
    )
  }

  hideSnack = () => {
    // Hide the alert after a delay set in the state only if the alert is still visible
    if (!this.state.alertShown) return

    clearTimeout(this.timeoutHide)

    Animated.timing(this.animatedValue, {
      toValue: 0,
      duration: HIDE_DURATION,
      useNativeDriver: true,
    }).start(() => this.setState({ alertShown: false }))
  }

  wrapWithBackdropIfNeeded(content) {
    return this.state.type === SnackType.WAITING ? (
      <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: `${BLACK}66` }}>
        {content}
      </View>
    ) : (
      content
    )
  }

  render() {
    const { title, message, type, bottomContent, alertShown } = this.state
    if (alertShown) {
      return this.wrapWithBackdropIfNeeded(
        <Animated.View
          style={[
            styles.container,
            (type === SnackType.INFO || type === SnackType.WAITING) && styles.containerInfo,
            type === SnackType.SUCCESS && styles.containerSuccess,
            type === SnackType.FAIL && styles.containerFail,
            { transform: this.animatedTransform },
          ]}
          testID={'Snack' + type}
        >
          <TouchableWithoutFeedback
            onPress={type === SnackType.WAITING ? undefined : this.hideSnack}
          >
            <View style={styles.body}>
              {type === SnackType.SUCCESS && (
                <Image source={successPopupIcon} style={styles.icon} />
              )}
              {type === SnackType.FAIL && <Image source={failPopupIcon} style={styles.icon} />}

              {title != null && <Text style={styles.title}>{title}</Text>}

              {message != null && <Text style={styles.message}>{message}</Text>}

              {bottomContent != null && bottomContent}

              {type === SnackType.WAITING && <ActivityIndicator style={styles.spinner} />}
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>,
      )
    }

    return null
  }
}

const styles: any = {
  container: {
    position: 'absolute',
    bottom: deviceWidth * 0.06,
    left: deviceWidth * 0.06,
    right: deviceWidth * 0.06,
    borderRadius: 4,
    shadowColor: BLACK,
    shadowRadius: 12,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  containerInfo: { backgroundColor: BLACK },
  containerSuccess: { backgroundColor: GREEN },
  containerFail: { backgroundColor: RED },
  body: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: '12%',
    alignItems: 'center',
  },
  icon: { marginTop: 4, width: 36, height: 36 },
  title: {
    textAlign: 'center',
    fontFamily: Grotesk,
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0.28,
    color: WHITE,
  },
  message: {
    textAlign: 'center',
    fontFamily: Grotesk,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    color: WHITE,
  },
  spinner: { marginVertical: 10 },
}

// ===== MANAGEMENT LOGIC =====
let currentSnack: Snack

let showSnackTimer

export const registerSnack = snack => (currentSnack = snack)

export function showSnack(parameters: State) {
  if (currentSnack == null) return

  // Hide the current alert if any
  hideCurrentSnack()

  showSnackTimer = setTimeout(showNewSnack, currentSnack.state.alertShown ? HIDE_DURATION : 0)

  function showNewSnack() {
    showSnackTimer = null

    currentSnack.setState({ ...blankState, ...parameters })

    requestAnimationFrame(() => currentSnack.showSnack())
  }
}

export function hideCurrentSnack() {
  if (currentSnack !== null) {
    if (showSnackTimer) {
      clearTimeout(showSnackTimer)
      showSnackTimer = null
    }

    currentSnack.hideSnack()
  }
}
